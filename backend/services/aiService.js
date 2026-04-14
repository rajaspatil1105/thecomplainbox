require('dotenv').config();
const axios = require('axios');
const redisClient = require('../config/redis');

/**
 * AI Service Integration
 * Handles communication with FastAPI AI microservice for complaint analysis
 */

class AIService {
  /**
   * Get AI service base URL
   */
  static getBaseURL() {
    return process.env.AI_SERVICE_URL || 'http://localhost:8000';
  }

  /**
   * Health check
   */
  static async healthCheck() {
    try {
      const response = await axios.get(`${this.getBaseURL()}/ai/health`, {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      console.error('AI service health check failed:', error.message);
      return false;
    }
  }

  /**
   * Analyze complaint using Gemini
   * CRITICAL: Run TF-IDF duplicate check BEFORE calling this
   * CRITICAL: Never call this if is_duplicate detected
   */
  static async analyzeComplaint(complaintText, filesPaths = []) {
    try {
      const response = await axios.post(
        `${this.getBaseURL()}/ai/analyze`,
        {
          complaint_text: complaintText,
          file_paths: filesPaths
        },
        {
          timeout: 30000 // 30 seconds
        }
      );

      return response.data;
    } catch (error) {
      // CRITICAL: Fallback must be silent
      console.error('AI analysis error (will fallback):', error.message);
      
      // Return fallback response - General queue routing
      return {
        category: 'other',
        severity: 'medium',
        urgency_score: 0.5,
        suggested_committee: 'General Queue',
        is_potential_duplicate: false,
        confidence: 0.0, // Low confidence triggers manual review
        summary: 'Manual review required',
        error: 'AI service unavailable'
      };
    }
  }

  /**
   * OCR extraction from file
   */
  static async extractOCR(filePath) {
    try {
      const response = await axios.post(
        `${this.getBaseURL()}/ai/ocr`,
        { file_path: filePath },
        { timeout: 15000 }
      );

      return response.data.extracted_text || '';
    } catch (error) {
      console.error('OCR extraction error:', error.message);
      return '';
    }
  }

  /**
   * Check for duplicate complaints using TF-IDF
   * MUST run before every Gemini call
   */
  static async checkDuplicate(complaintText) {
    try {
      // Get cached TF-IDF vectors
      const cacheKey = 'tfidf_cache:recent';
      const cachedData = await redisClient.get(cacheKey);

      if (!cachedData) {
        // No cache yet, cannot check
        return { is_duplicate: false, similarity_score: 0 };
      }

      // Parse cached complaints
      const recentComplaints = JSON.parse(cachedData);

      // Call AI service for TF-IDF comparison
      const response = await axios.post(
        `${this.getBaseURL()}/ai/tfidf-check`,
        {
          complaint_text: complaintText,
          recent_complaints: recentComplaints,
          threshold: parseFloat(process.env.TFIDF_THRESHOLD || 0.78)
        },
        { timeout: 10000 }
      );

      return response.data;
    } catch (error) {
      console.error('TF-IDF check error:', error.message);
      return { is_duplicate: false, similarity_score: 0 };
    }
  }

  /**
   * Update TF-IDF cache with new complaint
   */
  static async updateTFIDFCache(complaintId, complaintText) {
    try {
      const cacheKey = 'tfidf_cache:recent';
      const maxSize = parseInt(process.env.TFIDF_CACHE_SIZE || 200);
      const ttl = parseInt(process.env.TFIDF_CACHE_TTL || 21600);

      let cachedData = [];
      const cached = await redisClient.get(cacheKey);
      
      if (cached) {
        cachedData = JSON.parse(cached);
      }

      // Add new complaint
      cachedData.push({
        complaint_id: complaintId,
        text: complaintText
      });

      // Keep only the most recent N complaints
      if (cachedData.length > maxSize) {
        cachedData = cachedData.slice(-maxSize);
      }

      // Update cache
      await redisClient.setEx(cacheKey, ttl, JSON.stringify(cachedData));
    } catch (error) {
      console.error('Error updating TF-IDF cache:', error.message);
    }
  }
}

module.exports = AIService;
