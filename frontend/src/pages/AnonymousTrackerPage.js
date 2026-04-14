import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { complaintAPI } from '../services/api';

/**
 * Anonymous Tracker Page
 * Public token-based complaint tracking
 */
export default function AnonymousTrackerPage() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleTrack = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!token.trim()) {
      setError('Tracking token is required.');
      return;
    }

    try {
      setLoading(true);
      const response = await complaintAPI.trackAnonymous(token.trim());
      setResult(response.data);
    } catch (err) {
      const message = err?.response?.data?.error || 'Token not found or expired.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F0F0] font-['Outfit'] px-4 py-14">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-[#121212] uppercase tracking-tighter">Track Complaint</h1>
          <p className="text-sm font-bold text-[#121212]/60 mt-2 uppercase tracking-widest">
            Anonymous token lookup
          </p>
        </div>

        <form
          onSubmit={handleTrack}
          className="bg-white border-4 border-[#121212] shadow-[8px_8px_0px_0px_#121212] p-8"
        >
          <label className="block text-[#121212] font-bold text-xs uppercase tracking-widest mb-2">
            Tracking Token
          </label>
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full px-4 py-3 border-2 border-[#121212] rounded-none font-mono text-sm focus:outline-none focus:border-[#1040C0]"
            placeholder="Paste your anonymous token"
          />

          {error && (
            <div className="mt-4 p-3 bg-[#D02020] text-white border-2 border-[#121212] text-xs font-bold uppercase tracking-widest">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-4 px-6 bg-[#1040C0] text-white border-2 border-[#121212] rounded-none font-black text-sm uppercase tracking-widest shadow-[4px_4px_0px_0px_#121212] hover:shadow-[6px_6px_0px_0px_#121212] active:translate-y-1 active:shadow-[2px_2px_0px_0px_#121212] transition-all duration-100 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Track Status'}
          </button>

          <p className="mt-4 text-xs text-[#121212]/70 font-medium">
            No login or personal data required. Your complaint remains anonymous.
          </p>
        </form>

        {result && (
          <div className="mt-8 bg-white border-4 border-[#121212] shadow-[8px_8px_0px_0px_#121212] p-8">
            <h2 className="text-xl font-black text-[#121212] uppercase tracking-wider mb-5">Current Status</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#121212]/60">Status</p>
                <p className="font-bold text-[#121212] mt-1">{String(result.status || '').replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#121212]/60">Priority</p>
                <p className="font-bold text-[#121212] mt-1">{result.priority || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#121212]/60">Submitted</p>
                <p className="font-medium text-[#121212] mt-1">
                  {result.submitted_at ? new Date(result.submitted_at).toLocaleString() : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#121212]/60">Last Updated</p>
                <p className="font-medium text-[#121212] mt-1">
                  {result.last_updated ? new Date(result.last_updated).toLocaleString() : '-'}
                </p>
              </div>
            </div>

            {result.note && (
              <div className="mt-5 p-4 border-2 border-[#121212] bg-[#F0F0F0]">
                <p className="text-xs font-bold uppercase tracking-widest text-[#121212]/60">Latest Note</p>
                <p className="mt-2 text-sm text-[#121212]">{result.note}</p>
              </div>
            )}
          </div>
        )}

        <p className="text-center mt-8 text-sm">
          <Link to="/login" className="font-bold text-[#1040C0] underline">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
