import React, { useEffect, useMemo, useState } from 'react';
import AppShell from '../components/AppShell';
import { dashboardAPI } from '../services/api';
import { useNotification } from '../hooks/useNotification';
import DataTable from '../components/DataTable';
import { PriorityBadge, SeverityBadge } from '../components/Badge';

/**
 * Principal Dashboard Page
 * Read-only strategic overview for principal
 */
export default function PrincipalDashboardPage() {
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await dashboardAPI.getPrincipalDashboard();
        setData(response?.data || null);
      } catch (err) {
        addNotification(err?.response?.data?.error || 'Failed to load principal dashboard', 'error');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const escalatedRows = data?.escalated_complaints || data?.escalatedComplaints || [];
  const committeeStats = data?.committee_stats || data?.committeeStats || [];

  const summary = useMemo(() => {
    const total = data?.summary?.total_complaints || data?.summary?.totalComplaints || 0;
    const open = data?.summary?.open_complaints || data?.summary?.openComplaints || 0;
    const escalated = escalatedRows.length;
    const avgSat = Number(data?.satisfaction?.avg_rating || data?.satisfaction?.avgRating || 0).toFixed(2);
    return { total, open, escalated, avgSat };
  }, [data, escalatedRows]);

  const escalatedColumns = [
    { key: 'priority', label: 'Priority', render: (v) => <PriorityBadge priority={v} /> },
    { key: 'title', label: 'Title' },
    { key: 'severity', label: 'Severity', render: (v) => <SeverityBadge severity={v} /> },
    {
      key: 'submitted_at',
      label: 'Submitted',
      render: (v) => (v ? new Date(v).toLocaleString() : '-'),
    },
  ];

  const committeeColumns = [
    { key: 'committee_id', label: 'Committee' },
    { key: 'open_count', label: 'Open Count' },
    {
      key: 'avg_resolution_hours',
      label: 'Avg Resolution (hrs)',
      render: (v) => Number(v || 0).toFixed(2),
    },
  ];

  return (
    <AppShell pageTitle="Principal Dashboard">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[72px] font-black text-[#121212]/5 uppercase select-none">
          Read Only
        </div>

        <h2 className="text-3xl font-black uppercase tracking-wider text-[#121212] mb-6">Institution Overview</h2>

        {loading ? (
          <div className="text-center py-10 text-[#121212]/60">Loading principal insights...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#F0C020] border-4 border-[#121212] p-4 shadow-[8px_8px_0px_0px_#121212]">
                <p className="text-xs font-bold uppercase tracking-widest text-[#121212]/60">Total Complaints</p>
                <p className="text-4xl font-black text-[#121212]">{summary.total}</p>
              </div>
              <div className="bg-white border-4 border-[#121212] p-4 shadow-[8px_8px_0px_0px_#121212]">
                <p className="text-xs font-bold uppercase tracking-widest text-[#121212]/60">Open</p>
                <p className="text-4xl font-black text-[#1040C0]">{summary.open}</p>
              </div>
              <div className="bg-white border-4 border-[#121212] p-4 shadow-[8px_8px_0px_0px_#121212]">
                <p className="text-xs font-bold uppercase tracking-widest text-[#121212]/60">Escalated</p>
                <p className="text-4xl font-black text-[#D02020]">{summary.escalated}</p>
              </div>
              <div className="bg-white border-4 border-[#121212] p-4 shadow-[8px_8px_0px_0px_#121212]">
                <p className="text-xs font-bold uppercase tracking-widest text-[#121212]/60">Avg Satisfaction</p>
                <p className="text-4xl font-black text-[#107050]">{summary.avgSat}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-[#121212] mb-3">Escalated Complaints</h3>
                <DataTable columns={escalatedColumns} data={escalatedRows} sortable={false} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-[#121212] mb-3">Committee Performance</h3>
                <DataTable columns={committeeColumns} data={committeeStats} sortable={false} />
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
