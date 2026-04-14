import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useNotification } from '../hooks/useNotification';

/**
 * Forgot Password Page
 */
export default function ForgotPasswordPage() {
  const { addNotification } = useNotification();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await authAPI.forgotPassword(email);
      addNotification('If the email exists, reset instructions were sent.', 'success');
    } catch (err) {
      addNotification(err?.response?.data?.error || 'Request failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F0F0] px-4 font-['Outfit']">
      <form onSubmit={submit} className="max-w-md w-full bg-white border-4 border-[#121212] p-8 shadow-[8px_8px_0px_0px_#121212]">
        <h1 className="text-2xl font-black uppercase tracking-wider text-[#121212] mb-4">Forgot Password</h1>
        <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-[#121212]">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border-2 border-[#121212] rounded-none"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 px-4 py-3 bg-[#1040C0] text-white border-2 border-[#121212] font-black text-xs uppercase tracking-widest disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Reset OTP'}
        </button>
        <p className="text-center mt-4 text-xs">
          <Link to="/login" className="text-[#1040C0] font-black underline">Back to Sign In</Link>
        </p>
      </form>
    </div>
  );
}
