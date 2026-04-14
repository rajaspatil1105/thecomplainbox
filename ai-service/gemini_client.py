import google.generativeai as genai
import json
import logging
from typing import Optional, Dict, Any
from config import GEMINI_API_KEY, GEMINI_MODEL, GEMINI_PROMPT_TEMPLATE

logger = logging.getLogger(__name__)

# Configure Gemini API
genai.configure(api_key=GEMINI_API_KEY)

class GeminiClient:
    """Wrapper for Google Gemini API"""

    def __init__(self):
        self.model = GEMINI_MODEL
        self.prompt_template = GEMINI_PROMPT_TEMPLATE

    def analyze_complaint(self, complaint_text: str) -> Optional[Dict[str, Any]]:
        """
        Analyze complaint using Gemini 1.5 Flash
        Returns structured JSON response or None on failure
        """
        try:
            # Format prompt
            prompt = self.prompt_template.format(complaint_text=complaint_text)

            # Call Gemini API
            response = genai.GenerativeModel(self.model).generate_content(prompt)

            if not response or not response.text:
                logger.warning('Empty response from Gemini')
                return None

            # Parse JSON response
            response_text = response.text.strip()
            
            # Try to extract JSON if wrapped in code blocks
            if '```json' in response_text:
                response_text = response_text.split('```json')[1].split('```')[0]
            elif '```' in response_text:
                response_text = response_text.split('```')[1].split('```')[0]

            analysis = json.loads(response_text)

            # Validate required fields
            required_fields = [
                'category', 'severity', 'urgency_score',
                'suggested_committee', 'is_potential_duplicate',
                'confidence', 'summary'
            ]

            if not all(field in analysis for field in required_fields):
                logger.warning('Gemini response missing required fields')
                return None

            # Validate field types and values
            if not isinstance(analysis['urgency_score'], (int, float)):
                analysis['urgency_score'] = float(analysis['urgency_score'] or 0.5)

            if not isinstance(analysis['confidence'], (int, float)):
                analysis['confidence'] = float(analysis['confidence'] or 0.5)

            # Clamp scores to 0.0-1.0
            analysis['urgency_score'] = max(0.0, min(1.0, analysis['urgency_score']))
            analysis['confidence'] = max(0.0, min(1.0, analysis['confidence']))

            logger.info(f"Gemini analysis successful: {analysis['category']} ({analysis['confidence']:.2f} confidence)")
            return analysis

        except json.JSONDecodeError as e:
            logger.error(f'Failed to parse Gemini JSON response: {e}')
            return None
        except Exception as e:
            logger.error(f'Gemini API error: {e}')
            return None

    def extract_ocr_text(self, image_path: str) -> str:
        """
        Extract text from image or PDF using Gemini vision capabilities
        """
        try:
            # Use Gemini's vision API if needed
            # This can handle multiple file types
            logger.info(f"Would extract OCR from: {image_path}")
            return ""  # Placeholder for OCR integration
        except Exception as e:
            logger.error(f'OCR extraction error: {e}')
            return ""
