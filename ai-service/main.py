import logging
import sys
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import json

from config import (
    AI_SERVICE_PORT,
    LOG_LEVEL,
    TFIDF_THRESHOLD
)
from gemini_client import GeminiClient
from tfidf_engine import TFIDFEngine
from ocr_processor import OCRProcessor

# Configure logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL.upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="SSCRMS AI Microservice",
    version="2.0.0",
    description="Gemini-powered complaint analysis and categorization"
)

# Initialize AI components
gemini_client = GeminiClient()
tfidf_engine = TFIDFEngine()

# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class AnalyzeComplaintRequest(BaseModel):
    complaint_text: str
    file_paths: Optional[List[str]] = []
    file_types: Optional[List[str]] = []

class AnalyzeComplaintResponse(BaseModel):
    category: str
    severity: str
    urgency_score: float
    suggested_committee: str
    is_potential_duplicate: bool
    confidence: float
    summary: str
    error: Optional[str] = None

class OCRRequest(BaseModel):
    file_path: str
    file_type: str

class TFIDFCheckRequest(BaseModel):
    complaint_text: str
    recent_complaints: List[dict]
    threshold: Optional[float] = TFIDF_THRESHOLD

# ============================================================================
# ENDPOINTS
# ============================================================================

@app.get('/ai/health')
async def health_check():
    """
    Health check endpoint for Node.js API to confirm AI service availability
    """
    return {
        'status': 'operational',
        'service': 'SSCRMS AI Microservice',
        'version': '2.0.0'
    }

@app.post('/ai/analyze')
async def analyze_complaint(request: AnalyzeComplaintRequest):
    """
    Analyze complaint text and return AI classification
    
    CRITICAL EXECUTION ORDER:
    1. TF-IDF duplicate check (run first, never call Gemini without this)
    2. If NOT duplicate: Call Gemini API
    3. If duplicate: Skip Gemini, return as duplicate
    4. Store results in MongoDB regardless of duplicate status
    
    Note: The duplicate check runs on the BACKEND before calling this endpoint
    """
    try:
        complaint_text = request.complaint_text
        file_paths = request.file_paths or []
        file_types = request.file_types or []

        # Enrich complaint text with OCR extracted content
        if file_paths and file_types:
            enriched_text = OCRProcessor.append_ocr_to_complaint_text(
                complaint_text,
                file_paths,
                file_types
            )
        else:
            enriched_text = complaint_text

        # Call Gemini API for analysis
        analysis = gemini_client.analyze_complaint(enriched_text)

        if analysis is None:
            # Fallback on Gemini failure
            logger.warning('Gemini analysis returned None, using fallback')
            analysis = {
                'category': 'other',
                'severity': 'medium',
                'urgency_score': 0.5,
                'suggested_committee': 'General Queue',
                'is_potential_duplicate': False,
                'confidence': 0.0,  # Low confidence triggers manual review
                'summary': 'Manual review required',
                'error': 'AI service temporarily degraded'
            }

        return analysis

    except Exception as e:
        logger.error(f'Analysis endpoint error: {e}')
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/ai/ocr')
async def extract_ocr(request: OCRRequest):
    """
    Extract text from image or PDF file
    """
    try:
        file_path = request.file_path
        file_type = request.file_type

        extracted_text = OCRProcessor.extract_from_file(file_path, file_type)

        return {
            'extracted_text': extracted_text,
            'file_path': file_path,
            'file_type': file_type
        }

    except Exception as e:
        logger.error(f'OCR endpoint error: {e}')
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/ai/tfidf-check')
async def tfidf_check(request: TFIDFCheckRequest):
    """
    Check for duplicate complaints using TF-IDF similarity
    MUST be called BEFORE Gemini API call
    
    Returns: { is_duplicate, similarity_score, threshold_used }
    """
    try:
        complaint_text = request.complaint_text
        recent_complaints = request.recent_complaints
        threshold = request.threshold or TFIDF_THRESHOLD

        # Fit TF-IDF with recent complaints
        if recent_complaints:
            tfidf_engine.fit(recent_complaints)

        # Check for duplicate
        is_duplicate, similarity_score = tfidf_engine.check_duplicate(
            complaint_text,
            threshold
        )

        response = TFIDFEngine.format_similarity_response(
            is_duplicate,
            similarity_score
        )

        return response

    except Exception as e:
        logger.error(f'TF-IDF check error: {e}')
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.exception_handler(Exception)
async def global_exception_handler(exc: Exception):
    logger.error(f'Unhandled exception: {exc}')
    return JSONResponse(
        status_code=500,
        content={'error': 'Internal server error'}
    )

# ============================================================================
# STARTUP
# ============================================================================

@app.on_event('startup')
async def startup_event():
    logger.info('=================================================')
    logger.info('SSCRMS AI Microservice Starting Up')
    logger.info('=================================================')
    logger.info(f'Service: Gemini 1.5 Flash Model')
    logger.info(f'TF-IDF Threshold: {TFIDF_THRESHOLD}')
    logger.info(f'Log Level: {LOG_LEVEL}')
    logger.info('✓ AI Microservice Ready')

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(
        'main:app',
        host='0.0.0.0',
        port=AI_SERVICE_PORT,
        reload=False,
        log_level=LOG_LEVEL
    )
