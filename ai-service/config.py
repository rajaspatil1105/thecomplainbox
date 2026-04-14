import os
from dotenv import load_dotenv

load_dotenv()

# Gemini API Configuration
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
GEMINI_MODEL = 'gemini-1.5-flash'

# Redis Configuration
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379')

# TF-IDF Configuration
TFIDF_THRESHOLD = float(os.getenv('TFIDF_THRESHOLD', '0.78'))
TFIDF_CACHE_SIZE = int(os.getenv('TFIDF_CACHE_SIZE', '200'))
TFIDF_CACHE_TTL = int(os.getenv('TFIDF_CACHE_TTL', '21600'))  # 6 hours

# Server Configuration
AI_SERVICE_PORT = int(os.getenv('AI_SERVICE_PORT', '8000'))
LOG_LEVEL = os.getenv('LOG_LEVEL', 'info')

# Complaint Analysis Prompt Template
GEMINI_PROMPT_TEMPLATE = """Analyze this student complaint and return ONLY valid JSON, no extra text.

Complaint: "{complaint_text}"

Return exactly this structure (ensure valid JSON):
{{
  "category": one of [security, ragging, academic, hostel, fees, infrastructure, harassment, other],
  "severity": one of [low, medium, high, critical],
  "urgency_score": float 0.0 to 1.0,
  "suggested_committee": string (exact committee name),
  "is_potential_duplicate": boolean,
  "confidence": float 0.0 to 1.0,
  "summary": string (max 20 words)
}}"""
