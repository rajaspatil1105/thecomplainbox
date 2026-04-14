import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { feedbackAPI } from '../services/api';
import { useNotification } from '../hooks/useNotification';
import AppShell from '../components/AppShell';

/**
 * Feedback Form Page
 * Student feedback submission after resolution
 */
export default function FeedbackFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submitFeedback = async (e) => {
    e.preventDefault();
    if (!rating) return;

    try {
      setLoading(true);
      await feedbackAPI.submit(id, rating, comment);
      setSubmitted(true);
      addNotification('Feedback submitted. Thank you!', 'success');
    } catch (err) {
      addNotification(err?.response?.data?.error || 'Feedback submission failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell pageTitle="Feedback">
      <div className="max-w-xl mx-auto bg-white border-4 border-[#121212] shadow-[8px_8px_0px_0px_#121212] p-8">
        {submitted ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#107050] border-2 border-[#121212] mx-auto mb-4" />
            <h2 className="text-2xl font-black text-[#121212] uppercase tracking-wider mb-2">Thank You</h2>
            <p className="text-sm text-[#121212]/70 mb-6">Your feedback helps us improve resolution quality.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-[#1040C0] text-white border-2 border-[#121212] font-black text-xs uppercase tracking-widest"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={submitFeedback}>
            <h1 className="text-2xl font-black text-[#121212] uppercase tracking-wider mb-2">Rate Your Experience</h1>
            <p className="text-sm text-[#121212]/60 mb-6">Complaint ID: <span className="font-mono">{id}</span></p>

            <p className="text-xs font-bold uppercase tracking-widest text-[#121212] mb-2">Rating</p>
            <div className="flex gap-2 mb-5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`w-10 h-10 border-2 border-[#121212] font-black ${rating >= star ? 'bg-[#F0C020]' : 'bg-white'}`}
                >
                  ★
                </button>
              ))}
            </div>

            <label className="block text-xs font-bold uppercase tracking-widest text-[#121212] mb-2">
              Comment (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="4"
              className="w-full px-4 py-3 border-2 border-[#121212] rounded-none"
              placeholder="Share your feedback..."
            />

            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                disabled={loading || !rating}
                className="flex-1 py-3 px-6 bg-[#D02020] text-white border-2 border-[#121212] rounded-none font-black text-xs uppercase tracking-widest disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-3 px-6 bg-white text-[#121212] border-2 border-[#121212] rounded-none font-black text-xs uppercase tracking-widest"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </AppShell>
  );
}
