import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';
import { complaintAPI } from '../services/api';
import { AiOutlinePlus, AiOutlineRobot } from 'react-icons/ai';

/**
 * Student Dashboard
 * Lists student's own complaints
 */

export default function StudentDashboard() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      // TODO: Implement complaint listing endpoint
      addNotification('Complaints loaded', 'info');
    } catch (error) {
      addNotification('Failed to load complaints', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      submitted: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-purple-100 text-purple-800',
      in_progress: 'bg-blue-100 text-blue-800',
      waiting_student: 'bg-red-100 text-red-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
      escalated: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Complaints</h1>
        <a href="/complaints/new" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <AiOutlinePlus /> New Complaint
        </a>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading complaints...</p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">No complaints yet</p>
          <a href="/complaints/new" className="text-blue-600 hover:underline font-medium">
            Submit your first complaint
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((complaint) => (
            <div key={complaint.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{complaint.title}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(complaint.status)}`}>
                  {complaint.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-3">{complaint.description.substring(0, 100)}...</p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Submitted: {new Date(complaint.submitted_at).toLocaleDateString()}</span>
                <a href={`/complaints/${complaint.id}`} className="text-blue-600 hover:underline">
                  View Details →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
