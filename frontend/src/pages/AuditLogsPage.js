import React, { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import DataTable from '../components/DataTable';
import { adminAPI } from '../services/api';
import { useNotification } from '../hooks/useNotification';

/**
 * Audit Logs Page
 * Admin audit trail viewer
 */
export default function AuditLogsPage() {
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAuditLogs();
      setLogs(response?.data?.logs || []);
    } catch (err) {
      addNotification(err?.response?.data?.error || 'Failed to load audit logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const exportCSV = async () => {
    try {
      const response = await adminAPI.exportAuditLogs();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'audit-logs.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      addNotification('Export failed', 'error');
    }
  };

  const columns = [
    {
      key: 'logged_at',
      label: 'Timestamp',
      render: (value) => (value ? new Date(value).toLocaleString() : '-'),
    },
    {
      key: 'User',
      label: 'Actor',
      render: (_, row) => row?.User?.name || 'System',
    },
    { key: 'action_type', label: 'Action' },
    { key: 'entity_type', label: 'Entity' },
    { key: 'entity_id', label: 'Entity ID' },
    { key: 'ip_address', label: 'IP' },
  ];

  return (
    <AppShell pageTitle="Audit Logs">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-black uppercase tracking-wider text-[#121212]">Audit Logs</h2>
        <button
          type="button"
          onClick={exportCSV}
          className="px-4 py-2 bg-[#F0C020] border-2 border-[#121212] text-[#121212] font-black text-xs uppercase tracking-widest"
        >
          Export CSV
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-[#121212]/60">Loading audit logs...</div>
      ) : (
        <DataTable columns={columns} data={logs} />
      )}
    </AppShell>
  );
}
