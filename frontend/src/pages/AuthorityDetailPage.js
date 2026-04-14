import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { complaintAPI } from '../services/api';
import { useNotification } from '../hooks/useNotification';
import { StatusBadge, PriorityBadge, SeverityBadge, CategoryBadge } from '../components/Badge';

/**
 * Authority Detail Page
 * Authority complaint detail with status update actions
 */
export default function AuthorityDetailPage() {
  const { id } = useParams();
  const { addNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [complaint, setComplaint] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const [detailRes, msgRes] = await Promise.all([
        complaintAPI.getById(id),
        complaintAPI.getMessages(id).catch(() => ({ data: { messages: [] } })),
      ]);

      const loadedComplaint = detailRes?.data?.complaint || null;
      setComplaint(loadedComplaint);
      setMessages(msgRes?.data?.messages || []);
      setNewStatus(loadedComplaint?.status || 'under_review');
    } catch (err) {
      addNotification(err?.response?.data?.error || 'Failed to load complaint', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const updateStatus = async () => {
    if (!newStatus || !note.trim()) {
      addNotification('Status and note are required', 'error');
      return;
    }

    try {
      await complaintAPI.updateStatus(id, newStatus, note.trim());
      addNotification('Status updated successfully', 'success');
      setNote('');
      load();
    } catch (err) {
      addNotification(err?.response?.data?.error || 'Status update failed', 'error');
    }
  };

  const escalate = async () => {
    try {
      await complaintAPI.escalate(id);
      addNotification('Complaint escalated', 'success');
      load();
    } catch (err) {
      addNotification(err?.response?.data?.error || 'Escalation failed', 'error');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await complaintAPI.addMessage(id, newMessage.trim());
      setNewMessage('');
      const msgRes = await complaintAPI.getMessages(id);
      setMessages(msgRes?.data?.messages || []);
    } catch (err) {
      addNotification(err?.response?.data?.error || 'Failed to send message', 'error');
    }
  };

  return (
    <AppShell pageTitle="Authority Detail">
      {loading ? (
        <div className="text-center py-12 text-[#121212]/60">Loading...</div>
      ) : !complaint ? (
        <div className="text-center py-12 text-[#121212]/60">Complaint not found.</div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <section className="xl:col-span-2 bg-white border-4 border-[#121212] p-6 shadow-[8px_8px_0px_0px_#121212]">
            <h1 className="text-2xl font-black text-[#121212] mb-4">{complaint.title}</h1>
            <div className="flex flex-wrap gap-2 mb-5">
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
              <SeverityBadge severity={complaint.severity} />
              <CategoryBadge category={complaint.category} />
            </div>

            <div className="border-2 border-[#121212] bg-[#F0F0F0] p-4 mb-5">
              <p className="text-sm text-[#121212] whitespace-pre-wrap">{complaint.description}</p>
            </div>

            {!complaint.is_anonymous && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#121212] mb-3">Message Thread</h3>
                <div className="border-2 border-[#121212] p-4 bg-[#F0F0F0] space-y-3 max-h-72 overflow-auto">
                  {messages.length === 0 ? (
                    <p className="text-sm text-[#121212]/60">No messages yet.</p>
                  ) : (
                    messages.map((msg, idx) => (
                      <div key={idx} className="bg-white border-2 border-[#121212] p-3">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#121212]/60">{msg.actor_role || 'User'}</p>
                        <p className="text-sm text-[#121212] mt-1">{msg.message}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Reply to student"
                    className="flex-1 px-4 py-3 border-2 border-[#121212] rounded-none"
                  />
                  <button
                    type="button"
                    onClick={sendMessage}
                    className="px-4 py-3 bg-[#1040C0] text-white border-2 border-[#121212] font-black text-xs uppercase tracking-widest"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </section>

          <aside className="bg-white border-4 border-[#121212] p-6 shadow-[8px_8px_0px_0px_#121212] h-fit space-y-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-[#121212]">Actions</h2>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#121212] mb-1">New Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border-2 border-[#121212] rounded-none"
              >
                {['under_review', 'assigned', 'in_progress', 'waiting_student', 'resolved', 'closed', 'escalated'].map((status) => (
                  <option key={status} value={status}>{status.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#121212] mb-1">Resolution Note</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows="4"
                className="w-full px-3 py-2 border-2 border-[#121212] rounded-none"
              />
            </div>

            <button
              type="button"
              onClick={updateStatus}
              className="w-full px-4 py-3 bg-[#1040C0] text-white border-2 border-[#121212] font-black text-xs uppercase tracking-widest"
            >
              Update Status
            </button>

            <button
              type="button"
              onClick={escalate}
              className="w-full px-4 py-3 bg-[#D02020] text-white border-2 border-[#121212] font-black text-xs uppercase tracking-widest"
            >
              Escalate Complaint
            </button>
          </aside>
        </div>
      )}
    </AppShell>
  );
}
