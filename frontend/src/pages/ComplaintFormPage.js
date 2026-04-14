import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../hooks/useNotification';
import { complaintAPI } from '../services/api';
import AppShell from '../components/AppShell';
import FileUpload from '../components/FileUpload';
import Modal from '../components/Modal';

/**
 * New Complaint Form Page
 * Student submits new complaint with optional file uploads
 */

export default function ComplaintFormPage() {
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [trackingToken, setTrackingToken] = useState('');

  const categories = [
    'security',
    'ragging',
    'academic',
    'hostel',
    'fees',
    'infrastructure',
    'harassment',
    'other'
  ];

  const MIN_DESCRIPTION_LENGTH = 30;
  const MAX_FILES = 3;
  const MAX_FILE_SIZE_MB = 10;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (description.length < MIN_DESCRIPTION_LENGTH) {
      setError(`Description must be at least ${MIN_DESCRIPTION_LENGTH} characters`);
      return;
    }

    setLoading(true);

    try {
      const response = await complaintAPI.submit(
        {
          title,
          description,
          category: category || undefined,
          isAnonymous
        },
        files
      );

      addNotification('Complaint submitted successfully!', 'success');

      // If anonymous, show token
      if (isAnonymous && response.data.anonymous_token) {
        setTrackingToken(response.data.anonymous_token);
        setTokenModalOpen(true);
        return;
      }

      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to submit complaint';
      setError(message);
      addNotification(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell pageTitle="Submit Complaint">
      <div className="max-w-4xl">
        <h1 className="text-3xl font-black text-[#121212] uppercase tracking-wider mb-8">Submit New Complaint</h1>

        {error && (
          <div className="mb-6 p-4 bg-[#D02020] border-2 border-[#121212] rounded-none text-white text-xs font-bold uppercase tracking-widest">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border-4 border-[#121212] shadow-[8px_8px_0px_0px_#121212] p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-[#121212] font-bold text-xs uppercase tracking-widest mb-2">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief title of your complaint"
            maxLength="200"
            className="w-full px-4 py-3 border-2 border-[#121212] rounded-none focus:outline-none focus:border-[#1040C0]"
          />
          <p className="text-xs text-[#121212]/60 mt-1">{title.length}/200</p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-[#121212] font-bold text-xs uppercase tracking-widest mb-2">Description *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description (minimum 30 characters)"
            minLength={MIN_DESCRIPTION_LENGTH}
            rows="6"
            className="w-full px-4 py-3 border-2 border-[#121212] rounded-none focus:outline-none focus:border-[#1040C0]"
          />
          <p className={`text-xs mt-1 ${description.length < MIN_DESCRIPTION_LENGTH ? 'text-[#D02020] font-bold' : 'text-[#121212]/60'}`}>
            {description.length}/{MIN_DESCRIPTION_LENGTH} characters {description.length < MIN_DESCRIPTION_LENGTH && ' •  Too short'}
          </p>
        </div>

        {/* Category */}
        <div>
          <label className="block text-[#121212] font-bold text-xs uppercase tracking-widest mb-2">Category (Optional)</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 border-2 border-[#121212] rounded-none focus:outline-none focus:border-[#1040C0]"
          >
            <option value="">Select a category...</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-[#121212] font-bold text-xs uppercase tracking-widest mb-2">Evidence Files (Optional)</label>
          <FileUpload
            onFilesSelect={setFiles}
            maxFiles={MAX_FILES}
            maxSizeMB={MAX_FILE_SIZE_MB}
          />
        </div>

        {/* Anonymous Submission */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-[#121212] font-medium">Submit anonymously</span>
          </label>
          <p className="text-xs text-[#121212]/70 mt-1">
            {isAnonymous
              ? 'Your identity will be hidden. You can track using a token.'
              : 'Your name will be visible to the authority.'}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || description.length < MIN_DESCRIPTION_LENGTH}
            className="flex-1 py-3 px-6 bg-[#1040C0] text-white border-2 border-[#121212] rounded-none font-black text-sm uppercase tracking-widest shadow-[4px_4px_0px_0px_#121212] hover:shadow-[6px_6px_0px_0px_#121212] active:translate-y-1 active:shadow-[2px_2px_0px_0px_#121212] transition-all duration-100 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
          <Link
            to="/dashboard"
            className="flex-1 py-3 px-6 bg-white text-[#121212] border-2 border-[#121212] rounded-none font-black text-sm uppercase tracking-widest text-center"
          >
            Cancel
          </Link>
        </div>
      </form>

      <Modal
        isOpen={tokenModalOpen}
        onClose={() => {}}
        title="Save Your Tracking Token"
        closeButton={false}
        footer={(
          <button
            className="py-3 px-5 bg-[#1040C0] text-white border-2 border-[#121212] font-black text-xs uppercase tracking-widest"
            onClick={() => {
              setTokenModalOpen(false);
              navigate('/dashboard');
            }}
          >
            I Saved It
          </button>
        )}
      >
        <p className="text-sm text-[#121212] font-medium mb-3">
          This token is shown only once. Save it to track anonymous complaints.
        </p>
        <div className="p-3 border-2 border-[#121212] bg-[#F0F0F0] font-mono text-sm break-all">
          {trackingToken}
        </div>
      </Modal>
      </div>
    </AppShell>
  );
}
