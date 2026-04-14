const ComplaintService = require('../services/complaintService');
const MessageService = require('../services/messageService');
const { validationResult } = require('express-validator');
const Complaint = require('../models/Complaint');
const EvidenceFile = require('../models/EvidenceFile');

/**
 * Complaint Controller
 * Handles complaint submission, retrieval, status updates, and escalation
 */

class ComplaintController {
  /**
   * POST /api/complaints
   * Submit new complaint
   */
  static async submitComplaint(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { user_id } = req.user;
      const { title, description, isAnonymous, category } = req.body;

      // Check submission rate limit
      if (req.submissionCount > 5) {
        return res.status(429).json({
          error: 'Daily complaint submission limit exceeded (5 per 24 hours)'
        });
      }

      const complaintData = {
        title,
        description,
        isAnonymous: isAnonymous || false,
        category
      };

      const result = await ComplaintService.submitComplaint(
        user_id,
        complaintData,
        req.uploadedFiles || []
      );

      res.status(201).json(result);
    } catch (error) {
      console.error('Complaint submission error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * GET /api/complaints/:id
   * Get complaint details by ID
   */
  static async getComplaintById(req, res) {
    try {
      const { id } = req.params;
      const { user_id, role } = req.user;

      const complaint = await ComplaintService.getComplaintById(id, user_id, role);

      // Get associated files
      const files = await EvidenceFile.findAll({
        where: { complaint_id: id }
      });

      res.status(200).json({
        complaint,
        files
      });
    } catch (error) {
      console.error('Get complaint error:', error);
      res.status(error.message === 'Access denied' ? 403 : 404).json({
        error: error.message
      });
    }
  }

  /**
   * GET /api/complaints/track/:token
   * Track anonymous complaint by token (public endpoint)
   */
  static async trackAnonymousComplaint(req, res) {
    try {
      const { token } = req.params;

      const complaintStatus = await ComplaintService.trackAnonymousComplaint(token);

      res.status(200).json(complaintStatus);
    } catch (error) {
      console.error('Track complaint error:', error);
      res.status(404).json({ error: error.message });
    }
  }

  /**
   * PATCH /api/complaints/:id/status
   * Update complaint status
   */
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { newStatus, note } = req.body;
      const { user_id } = req.user;

      if (!newStatus || !note) {
        return res.status(400).json({
          error: 'newStatus and note are required'
        });
      }

      const complaint = await ComplaintService.updateComplaintStatus(
        id,
        newStatus,
        note,
        user_id
      );

      res.status(200).json({
        message: 'Status updated successfully',
        complaint
      });
    } catch (error) {
      console.error('Status update error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * POST /api/complaints/:id/escalate
   * Escalate complaint
   */
  static async escalateComplaint(req, res) {
    try {
      const { id } = req.params;
      const { user_id } = req.user;

      const complaint = await ComplaintService.escalateComplaint(id, user_id);

      res.status(200).json({
        message: 'Complaint escalated successfully',
        complaint
      });
    } catch (error) {
      console.error('Escalation error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * GET /api/complaints/:id/messages
   * Get complaint messages thread
   */
  static async getMessages(req, res) {
    try {
      const { id } = req.params;

      const thread = await MessageService.getMessages(id);

      res.status(200).json({
        complaint_id: id,
        messages: thread.messages || []
      });
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * POST /api/complaints/:id/messages
   * Add message to complaint thread
   */
  static async addMessage(req, res) {
    try {
      const { id } = req.params;
      const { message } = req.body;
      const { user_id, role } = req.user;

      if (!message || message.trim().length === 0) {
        return res.status(400).json({
          error: 'Message content is required'
        });
      }

      // Verify complaint exists
      const complaint = await Complaint.findByPk(id);
      if (!complaint) {
        return res.status(404).json({
          error: 'Complaint not found'
        });
      }

      // Block for anonymous complaints
      if (complaint.is_anonymous) {
        return res.status(403).json({
          error: 'Cannot add messages to anonymous complaints'
        });
      }

      // Add message to MongoDB thread
      const thread = await MessageService.addMessage(
        id,
        user_id,
        role,
        message.trim()
      );

      res.status(201).json({
        message: 'Message added successfully',
        thread
      });
    } catch (error) {
      console.error('Add message error:', error);
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = ComplaintController;
