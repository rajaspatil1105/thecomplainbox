import React, { useEffect, useMemo, useState } from 'react';
import AppShell from '../components/AppShell';
import { dashboardAPI } from '../services/api';
import { useNotification } from '../hooks/useNotification';

/**
 * Admin Dashboard Page
 * KPI and summary analytics
 */
export default function AdminDashboardPage() {
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await dashboardAPI.getAdminDashboard();
        setData(response?.data || null);
      } catch (err) {
        addNotification(err?.response?.data?.error || 'Failed to load admin dashboard', 'error');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const kpis = useMemo(() => {
    const summary = data?.summary || {};
    return [
      { label: 'Total Complaints', value: summary.total_complaints || 0, color: '#121212' },
      { label: 'Open Complaints', value: summary.open_complaints || 0, color: '#1040C0' },
      { label: 'Closed Complaints', value: summary.closed_complaints || 0, color: '#107050' },
      { label: 'Avg Rating', value: Number(data?.satisfaction?.avg_rating || 0).toFixed(2), color: '#F0C020' },
    ];
  }, [data]);

  return (
    <AppShell pageTitle="Admin Dashboard">
      <h2 className="text-3xl font-black uppercase tracking-wider text-[#121212] mb-6">System Overview</h2>

      {loading ? (
        <div className="text-center py-10 text-[#121212]/60">Loading admin analytics...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="bg-white border-4 border-[#121212] p-5 shadow-[8px_8px_0px_0px_#121212]">
                <p className="text-xs font-bold uppercase tracking-widest text-[#121212]/60">{kpi.label}</p>
                <p className="text-4xl font-black mt-2" style={{ color: kpi.color }}>{kpi.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div className="bg-white border-4 border-[#121212] p-5 shadow-[8px_8px_0px_0px_#121212]">
              <h3 className="text-sm font-black uppercase tracking-widest mb-4 text-[#121212]">Complaint Trends</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-bold">30 Days:</span> {data?.complaint_trends?.last_30_days || 0}</p>
                <p><span className="font-bold">60 Days:</span> {data?.complaint_trends?.last_60_days || 0}</p>
                <p><span className="font-bold">90 Days:</span> {data?.complaint_trends?.last_90_days || 0}</p>
              </div>
            </div>

            <div className="bg-white border-4 border-[#121212] p-5 shadow-[8px_8px_0px_0px_#121212]">
              <h3 className="text-sm font-black uppercase tracking-widest mb-4 text-[#121212]">Resolution Metrics</h3>
              <p className="text-sm">
                <span className="font-bold">Avg Resolution (hours):</span>{' '}
                {Number(data?.resolution_time?.overall_hours || 0).toFixed(2)}
              </p>
              <p className="text-sm mt-2">
                <span className="font-bold">Open Percentage:</span>{' '}
                {Number(data?.summary?.open_percentage || 0).toFixed(2)}%
              </p>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
