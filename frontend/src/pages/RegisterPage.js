import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useNotification } from '../hooks/useNotification';
import PasswordStrengthBar from '../components/PasswordStrengthBar';

/**
 * Register Page
 * Public registration page for new student accounts
 */
export default function RegisterPage() {
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const [formData, setFormData] = useState({
    institutional_id: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!formData.institutional_id.trim()) return 'Institutional ID is required.';
    if (!formData.name.trim()) return 'Full name is required.';
    if (!formData.email.trim()) return 'Email is required.';
    if (formData.password.length < 8) return 'Password must be at least 8 characters.';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      await authAPI.register({
        institutional_id: formData.institutional_id,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'student',
      });

      addNotification('Registration successful. Please sign in.', 'success');
      navigate('/login');
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Registration failed. Please try again.';
      setError(message);
      addNotification(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F0F0] py-12 px-4 sm:px-6 lg:px-8 font-['Outfit']">
      <div className="max-w-xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-[#121212] uppercase tracking-tighter">Create Account</h1>
          <p className="text-sm font-bold text-[#121212]/60 mt-2 uppercase tracking-widest">
            The Complain Box
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white px-8 py-10 border-4 border-[#121212] rounded-none shadow-[8px_8px_0px_0px_#121212]"
        >
          {error && (
            <div className="mb-6 p-4 bg-[#D02020] border-2 border-[#121212] rounded-none text-white text-xs font-bold uppercase tracking-widest">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[#121212] font-bold text-xs uppercase tracking-widest mb-2">
                Institutional ID
              </label>
              <input
                name="institutional_id"
                value={formData.institutional_id}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-[#121212] rounded-none focus:outline-none focus:border-[#1040C0]"
                placeholder="STU1234"
                required
              />
            </div>

            <div>
              <label className="block text-[#121212] font-bold text-xs uppercase tracking-widest mb-2">
                Full Name
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-[#121212] rounded-none focus:outline-none focus:border-[#1040C0]"
                placeholder="Your full name"
                required
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="block text-[#121212] font-bold text-xs uppercase tracking-widest mb-2">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-[#121212] rounded-none focus:outline-none focus:border-[#1040C0]"
              placeholder="student@institution.edu"
              required
            />
          </div>

          <div className="mt-5">
            <label className="block text-[#121212] font-bold text-xs uppercase tracking-widest mb-2">
              Password
            </label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-[#121212] rounded-none focus:outline-none focus:border-[#1040C0]"
              placeholder="At least 8 characters"
              required
            />
            <PasswordStrengthBar password={formData.password} className="mt-3" />
          </div>

          <div className="mt-5">
            <label className="block text-[#121212] font-bold text-xs uppercase tracking-widest mb-2">
              Confirm Password
            </label>
            <input
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-[#121212] rounded-none focus:outline-none focus:border-[#1040C0]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-8 py-4 px-6 bg-[#D02020] text-white border-2 border-[#121212] rounded-none font-black text-sm uppercase tracking-widest shadow-[4px_4px_0px_0px_#121212] hover:shadow-[6px_6px_0px_0px_#121212] active:translate-y-1 active:shadow-[2px_2px_0px_0px_#121212] transition-all duration-100 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>

          <p className="mt-6 text-center text-xs text-[#121212] font-medium">
            Already have an account?{' '}
            <Link to="/login" className="font-black text-[#1040C0] underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
