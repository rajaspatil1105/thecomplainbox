import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { complaintAPI } from '../services/api';
import { useNotification } from '../hooks/useNotification';
import AppShell from '../components/AppShell';
import { StatusBadge, PriorityBadge, SeverityBadge, CategoryBadge } from '../components/Badge';
import SLACountdown from '../components/SLACountdown';

/**
 * Complaint Detail Page
 * Student view for complaint details and thread
 */
export default function ComplaintDetailPage() {
  const { id } = useParams();
  const { addNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [complaint, setComplaint] = useState(null);
  const [files, setFiles] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [detailRes, msgRes] = await Promise.all([
        complaintAPI.getById(id),
        complaintAPI.getMessages(id).catch(() => ({ data: { messages: [] } })),
      ]);

      setComplaint(detailRes?.data?.complaint || null);
      setFiles(detailRes?.data?.files || []);
      setMessages(msgRes?.data?.messages || []);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await complaintAPI.addMessage(id, newMessage.trim());
      setNewMessage('');
      addNotification('Message sent', 'success');
      const msgRes = await complaintAPI.getMessages(id);
      setMessages(msgRes?.data?.messages || []);
    } catch (err) {
      addNotification(err?.response?.data?.error || 'Failed to send message', 'error');
    }
  };

  return (
    <AppShell pageTitle="Complaint Detail">
      {loading ? (
        <div className="text-center py-12 font-medium text-[#121212]/60">Loading complaint...</div>
      ) : error ? (
        <div className="p-4 border-2 border-[#121212] bg-[#D02020] text-white font-bold text-sm uppercase tracking-widest">
          {error}
        </div>
      ) : !complaint ? (
        <div className="text-center py-12 font-medium text-[#121212]/60">Complaint not found.</div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <section className="xl:col-span-2 bg-white border-4 border-[#121212] shadow-[8px_8px_0px_0px_#121212] p-6">
            <h1 className="text-2xl font-black text-[#121212] mb-4">{complaint.title}</h1>

            <div className="flex flex-wrap gap-2 mb-5">
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
              <SeverityBadge severity={complaint.severity} />
              <CategoryBadge category={complaint.category} />
            </div>

            <div className="border-2 border-[#121212] p-4 bg-[#F0F0F0] mb-5">
              <p className="text-sm text-[#121212] whitespace-pre-wrap">{complaint.description}</p>
            </div>

            {files.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#121212] mb-3">Evidence Files</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {files.map((file) => (
                    <a
                      key={file.file_id}
                      href={`http://localhost:4000/${file.file_path}`}
                      target="_blank"
                      rel="noreferrer"
                      className="border-2 border-[#121212] p-3 bg-white text-sm font-medium text-[#1040C0] underline"
                    >
                      {file.file_name}
                    </a>
                  ))}
                </div>
              </div>
            )}

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
                    placeholder="Write a message"
                    className="flex-1 px-4 py-3 border-2 border-[#121212] rounded-none"
                  />
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    className="px-4 py-3 bg-[#1040C0] text-white border-2 border-[#121212] font-black text-xs uppercase tracking-widest"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </section>

          <aside className="bg-white border-4 border-[#121212] shadow-[8px_8px_0px_0px_#121212] p-6 h-fit">
            <h2 className="text-sm font-black uppercase tracking-widest text-[#121212] mb-4">Summary</h2>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#121212]/60">Complaint ID</p>
                <p className="font-mono text-[#121212] break-all">{complaint.complaint_id}</p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#121212]/60">SLA Countdown</p>
                <SLACountdown slaDeadline={complaint.sla_deadline} submittedAt={complaint.submitted_at} className="text-lg" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#121212]/60">Submitted</p>
                <p className="font-medium text-[#121212]">{new Date(complaint.submitted_at).toLocaleString()}</p>
              </div>
            </div>

            {['resolved', 'closed'].includes(complaint.status) && !complaint.is_anonymous && (
              <Link
                to={`/feedback/${complaint.complaint_id}`}
                className="block mt-5 text-center px-4 py-3 bg-[#F0C020] border-2 border-[#121212] text-[#121212] font-black text-xs uppercase tracking-widest"
              >
                Give Feedback
              </Link>
            )}
          </aside>
        </div>
      )}
    </AppShell>
  );
}
