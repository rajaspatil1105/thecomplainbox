import json
import logging
from typing import List, Dict, Any, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np
from config import TFIDF_THRESHOLD

logger = logging.getLogger(__name__)

class TFIDFEngine:
    """
    TF-IDF based duplicate detection for complaints
    MUST run BEFORE Gemini API call
    """

    def __init__(self):
        self.vectorizer = None
        self.complaint_vectors = None
        self.complaints_list = []

    def fit(self, complaints: List[Dict[str, str]]):
        """
        Fit TF-IDF vectorizer with complaint texts
        """
        try:
            if not complaints or len(complaints) == 0:
                logger.warning("No complaints to fit TF-IDF")
                return

            self.complaints_list = complaints
            texts = [c.get('text', '') for c in complaints]

            # Create vectorizer with basic parameters
            self.vectorizer = TfidfVectorizer(
                max_features=5000,
                ngram_range=(1, 2),
                min_df=1
            )

            self.complaint_vectors = self.vectorizer.fit_transform(texts)
            logger.info(f"TF-IDF fitted with {len(complaints)} complaints")

        except Exception as e:
            logger.error(f'TF-IDF fitting error: {e}')

    def check_duplicate(
        self,
        complaint_text: str,
        threshold: float = TFIDF_THRESHOLD
    ) -> Tuple[bool, float]:
        """
        Check if complaint is similar to existing complaints (potential duplicate)
        Returns: (is_duplicate: bool, max_similarity_score: float)
        """
        try:
            if self.vectorizer is None or self.complaint_vectors is None:
                logger.debug("TF-IDF not fitted yet, cannot check duplicates")
                return False, 0.0

            # Vectorize the new complaint
            new_vector = self.vectorizer.transform([complaint_text])

            # Compute cosine similarity with all existing complaints
            similarities = (self.complaint_vectors * new_vector.T).toarray().flatten()

            # Get max similarity score
            max_similarity = np.max(similarities) if len(similarities) > 0 else 0.0

            logger.debug(f"TF-IDF similarity: {max_similarity:.3f} (threshold: {threshold})")

            # Check if duplicate
            is_duplicate = max_similarity >= threshold

            if is_duplicate:
                logger.info(f"Potential duplicate detected: {max_similarity:.3f}")

            return is_duplicate, float(max_similarity)

        except Exception as e:
            logger.error(f'TF-IDF check error: {e}')
            return False, 0.0

    @staticmethod
    def format_similarity_response(
        is_potential_duplicate: bool,
        similarity_score: float,
        most_similar_complaint_id: str = None
    ) -> Dict[str, Any]:
        """
        Format TF-IDF check response
        """
        return {
            "is_duplicate": is_potential_duplicate,
            "similarity_score": similarity_score,
            "most_similar_complaint_id": most_similar_complaint_id,
            "threshold_used": TFIDF_THRESHOLD
        }
