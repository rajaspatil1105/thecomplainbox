import React, { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import DataTable from '../components/DataTable';
import { adminAPI } from '../services/api';
import { useNotification } from '../hooks/useNotification';

/**
 * Routing Queue Page
 * Admin manual routing for low-confidence complaints
 */
export default function RoutingQueuePage() {
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState([]);
  const [committees, setCommittees] = useState([]);
  const [selectedCommittee, setSelectedCommittee] = useState({});

  const load = async () => {
    try {
      setLoading(true);
      const [queueRes, commRes] = await Promise.all([
        adminAPI.getRoutingQueue(),
        adminAPI.getCommittees(),
      ]);
      setQueue(queueRes?.data?.queue || []);
      setCommittees(commRes?.data?.committees || []);
    } catch (err) {
      addNotification(err?.response?.data?.error || 'Failed to load routing queue', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const assign = async (complaintId) => {
    const committeeId = selectedCommittee[complaintId];
    if (!committeeId) {
      addNotification('Select a committee first', 'error');
      return;
    }

    try {
      await adminAPI.routeComplaint(complaintId, committeeId);
      addNotification('Complaint routed successfully', 'success');
      setQueue((prev) => prev.filter((item) => item.complaint_id !== complaintId));
    } catch (err) {
      addNotification(err?.response?.data?.error || 'Routing failed', 'error');
    }
  };

  const columns = [
    { key: 'complaint_id', label: 'ID' },
    { key: 'title', label: 'Title' },
    {
      key: 'ai_confidence',
      label: 'AI Confidence',
      render: (value) => `${((value || 0) * 100).toFixed(0)}%`,
    },
    {
      key: 'assign',
      label: 'Assign',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <select
            value={selectedCommittee[row.complaint_id] || ''}
            onChange={(e) =>
              setSelectedCommittee((prev) => ({ ...prev, [row.complaint_id]: e.target.value }))
            }
            className="px-2 py-1 border-2 border-[#121212] rounded-none text-xs"
          >
            <option value="">Select</option>
            {committees.map((committee) => (
              <option key={committee.committee_id} value={committee.committee_id}>
                {committee.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              assign(row.complaint_id);
            }}
            className="px-2 py-1 bg-[#1040C0] text-white border-2 border-[#121212] text-xs font-black uppercase"
          >
            Route
          </button>
        </div>
      ),
    },
  ];

  return (
    <AppShell pageTitle="Routing Queue">
      <h2 className="text-3xl font-black uppercase tracking-wider text-[#121212] mb-6">Manual Routing Queue</h2>
      {loading ? (
        <div className="text-center py-10 text-[#121212]/60">Loading queue...</div>
      ) : (
        <DataTable columns={columns} data={queue} />
      )}
    </AppShell>
  );
}
