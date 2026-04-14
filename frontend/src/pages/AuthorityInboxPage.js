import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import DataTable from '../components/DataTable';
import { StatusBadge, PriorityBadge, SeverityBadge, CategoryBadge } from '../components/Badge';
import SLACountdown from '../components/SLACountdown';
import { dashboardAPI } from '../services/api';
import { useNotification } from '../hooks/useNotification';

/**
 * Authority Inbox Page
 * Committee member/head complaint queue
 */
export default function AuthorityInboxPage() {
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [severity, setSeverity] = useState('');
  const [slaStatus, setSlaStatus] = useState('');

  const loadInbox = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getAuthorityDashboard({
        severity: severity || undefined,
        sla_status: slaStatus || undefined,
      });
      setRows(response?.data?.complaints || []);
    } catch (err) {
      addNotification(err?.response?.data?.error || 'Failed to load authority inbox', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInbox();
  }, [severity, slaStatus]);

  const columns = [
    {
      key: 'priority',
      label: 'Priority',
      render: (value) => <PriorityBadge priority={value} />,
    },
    {
      key: 'title',
      label: 'Title',
    },
    {
      key: 'category',
      label: 'Category',
      render: (value) => <CategoryBadge category={value} />,
    },
    {
      key: 'severity',
      label: 'Severity',
      render: (value) => <SeverityBadge severity={value} />,
    },
    {
      key: 'sla_deadline',
      label: 'SLA',
      render: (_, row) => (
        <SLACountdown slaDeadline={row.sla_deadline} submittedAt={row.submitted_at} className="text-xs" />
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />,
    },
  ];

  return (
    <AppShell pageTitle="Authority Inbox">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-3xl font-black text-[#121212] uppercase tracking-wider">Complaint Inbox</h2>
          <p className="text-sm text-[#121212]/60 font-medium">Active complaints assigned to your committee</p>
        </div>
        <Link
          to="/dashboard"
          className="px-4 py-2 border-2 border-[#121212] bg-white text-[#121212] font-black text-xs uppercase tracking-widest"
        >
          Student View
        </Link>
      </div>

      <div className="bg-white border-2 border-[#121212] p-4 mb-4 flex flex-wrap gap-3">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1">Severity</label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="px-3 py-2 border-2 border-[#121212] rounded-none"
          >
            <option value="">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1">SLA</label>
          <select
            value={slaStatus}
            onChange={(e) => setSlaStatus(e.target.value)}
            className="px-3 py-2 border-2 border-[#121212] rounded-none"
          >
            <option value="">All</option>
            <option value="overdue">Overdue</option>
            <option value="breached">Breached</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 font-medium text-[#121212]/60">Loading inbox...</div>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          onRowClick={(row) => navigate(`/authority/complaints/${row.complaint_id}`)}
        />
      )}
    </AppShell>
  );
}
