import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';
import { authAPI } from '../services/api';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Login Page
 * Student, authority, and admin login
 */

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addNotification } = useNotification();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data;

      login(user, token);
      addNotification('Login successful', 'success');

      // Redirect based on role
      const roleRoutes = {
        student: '/dashboard',
        committee_member: '/authority/inbox',
        committee_head: '/authority/inbox',
        admin: '/admin/dashboard',
        principal: '/principal/dashboard'
      };

      navigate(roleRoutes[user.role] || '/dashboard', { replace: true });
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed';
      setError(message);
      addNotification(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F0F0] py-12 px-4 sm:px-6 lg:px-8 font-['Outfit']">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-[#121212] uppercase tracking-tighter">
            The Complain Box
          </h1>
          <p className="text-sm font-bold text-[#121212]/60 mt-3 uppercase tracking-widest">
            Smart Student Complaint Management System
          </p>
        </div>

        {/* Login Card */}
        <form
          onSubmit={handleLogin}
          className="bg-white px-8 py-12 border-4 border-[#121212] rounded-none shadow-[8px_8px_0px_0px_#121212] animate-fade-in-up"
        >
          <h2 className="text-2xl font-black text-[#121212] mb-8 uppercase tracking-wider">
            Sign In
          </h2>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 bg-[#D02020] border-2 border-[#121212] rounded-none text-white text-xs font-bold uppercase tracking-widest">
              {error}
            </div>
          )}

          {/* Email Field */}
          <div className="mb-6">
            <label className="block text-[#121212] font-bold text-xs uppercase tracking-widest mb-3">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-[#121212] rounded-none bg-white text-[#121212] font-medium focus:outline-none focus:bg-[#1040C0]/5 focus:border-[#1040C0] transition-colors placeholder-[#121212]/40 appearance-none"
              placeholder="your.email@institution.edu"
            />
          </div>

          {/* Password Field */}
          <div className="mb-8">
            <label className="block text-[#121212] font-bold text-xs uppercase tracking-widest mb-3">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-[#121212] rounded-none bg-white text-[#121212] font-medium focus:outline-none focus:bg-[#1040C0]/5 focus:border-[#1040C0] transition-colors placeholder-[#121212]/40 appearance-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-[#121212] hover:text-[#1040C0] transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-[#1040C0] text-white border-2 border-[#121212] rounded-none font-black text-sm uppercase tracking-widest shadow-[4px_4px_0px_0px_#121212] hover:shadow-[6px_6px_0px_0px_#121212] active:translate-y-1 active:shadow-[2px_2px_0px_0px_#121212] transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-xs text-[#121212] font-medium mb-2">
              Don't have an account?{' '}
              <Link to="/register" className="font-black text-[#1040C0] hover:text-[#1040C0]/80 underline">
                Register here
              </Link>
            </p>
          </div>

          {/* Forgot Password Link */}
          <div className="mt-2 text-center">
            <div className="flex items-center justify-center gap-4 text-xs">
              <Link
                to="/forgot-password"
                className="text-[#121212] font-bold hover:text-[#1040C0] hover:underline transition-colors"
              >
                Forgot password?
              </Link>
              <Link
                to="/track"
                className="text-[#1040C0] font-black underline"
              >
                Track anonymously
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
