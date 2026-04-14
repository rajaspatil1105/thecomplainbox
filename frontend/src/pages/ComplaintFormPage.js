import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';
import { complaintAPI } from '../services/api';
import { AiOutlineClose } from 'react-icons/ai';

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
  const fileInputRef = useRef(null);

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

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    // Validate file count
    if (files.length + selectedFiles.length > MAX_FILES) {
      addNotification(`Maximum ${MAX_FILES} files allowed`, 'error');
      return;
    }

    // Validate file size
    for (const file of selectedFiles) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        addNotification(`File ${file.name} exceeds ${MAX_FILE_SIZE_MB}MB limit`, 'error');
        return;
      }
    }

    setFiles([...files, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

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
        // TODO: Show modal with token
        alert(`Your tracking token:\n\n${response.data.anonymous_token}\n\nSave this to track your complaint!`);
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
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Submit New Complaint</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief title of your complaint"
            maxLength="200"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">{title.length}/200</p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Description *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description (minimum 30 characters)"
            minLength={MIN_DESCRIPTION_LENGTH}
            rows="6"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className={`text-sm mt-1 ${description.length < MIN_DESCRIPTION_LENGTH ? 'text-red-600' : 'text-gray-500'}`}>
            {description.length}/{MIN_DESCRIPTION_LENGTH} characters {description.length < MIN_DESCRIPTION_LENGTH && ' •  Too short'}
          </p>
        </div>

        {/* Category */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Category (Optional)</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a category...</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Evidence Files (Optional)</label>
          <p className="text-sm text-gray-600 mb-2">Max {MAX_FILES} files, {MAX_FILE_SIZE_MB}MB each (JPG, PNG, MP4, PDF)</p>
          
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500"
          >
            <p className="text-gray-600">Drag and drop files here or click to select</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              onChange={handleFileSelect}
              accept=".jpg,.jpeg,.png,.mp4,.pdf"
            />
          </div>

          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <AiOutlineClose />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Anonymous Submission */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-gray-700">Submit anonymously</span>
          </label>
          <p className="text-sm text-gray-600 mt-1">
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
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
