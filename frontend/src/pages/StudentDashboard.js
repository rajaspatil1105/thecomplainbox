import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../hooks/useNotification';
import { dashboardAPI } from '../services/api';
import ComplaintCard from '../components/ComplaintCard';
import AppShell from '../components/AppShell';
import Button from '../components/Button';
import { Plus } from 'lucide-react';

/**
 * Student Dashboard
 * Lists student's own complaints
 */

export default function StudentDashboard() {
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
      const response = await dashboardAPI.getStudentDashboard();
      setComplaints(response?.data?.complaints || []);
    } catch (error) {
      addNotification('Failed to load complaints', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = useMemo(() => {
    if (filter === 'all') return complaints;
    return complaints.filter((item) => {
      const studentVisibleStatus = item.status === 'assigned' ? 'in_progress' : item.status;
      return studentVisibleStatus === filter;
    });
  }, [complaints, filter]);

  const summary = useMemo(() => {
    const total = complaints.length;
    const active = complaints.filter((c) => !['resolved', 'closed'].includes(c.status)).length;
    const resolved = complaints.filter((c) => ['resolved', 'closed'].includes(c.status)).length;
    return { total, active, resolved };
  }, [complaints]);

  return (
    <AppShell pageTitle="My Complaints">
      <div className="flex items-center justify-between mb-8 gap-3">
        <div>
          <h2 className="text-3xl font-black text-[#121212] uppercase tracking-wider">Student Dashboard</h2>
          <p className="text-sm text-[#121212]/60 font-medium">Track and manage your complaints</p>
        </div>
        <Link to="/complaints/new">
          <Button variant="secondary" className="gap-2">
            <Plus size={16} />
            New Complaint
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border-2 border-[#121212] p-4 shadow-[4px_4px_0px_0px_#121212]">
          <p className="text-xs font-bold uppercase tracking-widest text-[#121212]/60">Total</p>
          <p className="text-3xl font-black text-[#121212]">{summary.total}</p>
        </div>
        <div className="bg-white border-2 border-[#121212] p-4 shadow-[4px_4px_0px_0px_#121212]">
          <p className="text-xs font-bold uppercase tracking-widest text-[#121212]/60">Active</p>
          <p className="text-3xl font-black text-[#1040C0]">{summary.active}</p>
        </div>
        <div className="bg-white border-2 border-[#121212] p-4 shadow-[4px_4px_0px_0px_#121212]">
          <p className="text-xs font-bold uppercase tracking-widest text-[#121212]/60">Resolved</p>
          <p className="text-3xl font-black text-[#107050]">{summary.resolved}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'submitted', 'under_review', 'in_progress', 'resolved', 'closed', 'escalated'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-2 border-2 border-[#121212] text-xs font-bold uppercase tracking-widest ${
              filter === status ? 'bg-[#121212] text-white' : 'bg-white text-[#121212]'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 font-medium text-[#121212]/60">Loading complaints...</div>
      ) : filteredComplaints.length === 0 ? (
        <div className="bg-white border-4 border-[#121212] p-10 text-center shadow-[8px_8px_0px_0px_#121212]">
          <p className="font-bold uppercase tracking-widest text-[#121212]/70 mb-4">No complaints in this filter</p>
          <Link to="/complaints/new" className="font-black text-[#1040C0] underline">
            Submit your first complaint
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredComplaints.map((complaint) => (
            <ComplaintCard key={complaint.complaint_id} complaint={complaint} />
          ))}
        </div>
      )}

      <Link
        to="/complaints/new"
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#D02020] border-2 border-[#121212] shadow-[4px_4px_0px_0px_#121212] flex items-center justify-center text-white"
        aria-label="Submit new complaint"
      >
        <Plus size={24} />
      </Link>
    </AppShell>
  );
}
