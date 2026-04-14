import logging
from typing import Optional
import pytesseract
import fitz  # PyMuPDF
from pathlib import Path

logger = logging.getLogger(__name__)

class OCRProcessor:
    """
    OCR processing for images and PDFs
    Extracts text from complaint evidence files
    """

    @staticmethod
    def extract_from_image(image_path: str) -> str:
        """
        Extract text from image file using OCR
        Supports: jpg, png
        """
        try:
            if not Path(image_path).exists():
                logger.warning(f"Image file not found: {image_path}")
                return ""

            # Use pytesseract for image OCR
            text = pytesseract.image_to_string(image_path)
            
            if text:
                logger.info(f"OCR extracted {len(text)} characters from image")
            
            return text.strip()

        except Exception as e:
            logger.error(f'Image OCR error: {e}')
            return ""

    @staticmethod
    def extract_from_pdf(pdf_path: str) -> str:
        """
        Extract text from PDF using PyMuPDF
        """
        try:
            if not Path(pdf_path).exists():
                logger.warning(f"PDF file not found: {pdf_path}")
                return ""

            text_content = ""
            
            # Open PDF
            doc = fitz.open(pdf_path)
            
            # Extract text from all pages
            for page_num in range(len(doc)):
                page = doc[page_num]
                text = page.get_text()
                text_content += text + "\n"
            
            doc.close()

            if text_content:
                logger.info(f"OCR extracted {len(text_content)} characters from PDF")

            return text_content.strip()

        except Exception as e:
            logger.error(f'PDF OCR error: {e}')
            return ""

    @staticmethod
    def extract_from_file(file_path: str, file_type: str) -> str:
        """
        Extract text from file based on file type
        """
        if file_type.lower() in ['jpg', 'jpeg', 'png']:
            return OCRProcessor.extract_from_image(file_path)
        elif file_type.lower() == 'pdf':
            return OCRProcessor.extract_from_pdf(file_path)
        else:
            logger.warning(f"Unsupported file type for OCR: {file_type}")
            return ""

    @staticmethod
    def append_ocr_to_complaint_text(
        original_text: str,
        file_paths: List[str],
        file_types: List[str]
    ) -> str:
        """
        Append OCR-extracted text from files to complaint description
        This enriches the text for better AI analysis
        """
        try:
            enriched_text = original_text
            
            if not file_paths or len(file_paths) == 0:
                return enriched_text

            for file_path, file_type in zip(file_paths, file_types):
                extracted = OCRProcessor.extract_from_file(file_path, file_type)
                if extracted:
                    enriched_text += f"\n\n[Evidence file content]: {extracted}"

            return enriched_text

        except Exception as e:
            logger.error(f'Error appending OCR text: {e}')
            return original_text
