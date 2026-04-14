import React, { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import DataTable from '../components/DataTable';
import { adminAPI } from '../services/api';
import { useNotification } from '../hooks/useNotification';

/**
 * Committees Page
 * Admin committee listing and management
 */
export default function CommitteesPage() {
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [committees, setCommittees] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getCommittees();
      setCommittees(response?.data?.committees || []);
    } catch (err) {
      addNotification(err?.response?.data?.error || 'Failed to load committees', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'category_tag', label: 'Category Tag' },
    {
      key: 'headUser',
      label: 'Head',
      render: (_, row) => row?.headUser?.name || 'Not assigned',
    },
    { key: 'email_alias', label: 'Email Alias' },
  ];

  return (
    <AppShell pageTitle="Committees">
      <h2 className="text-3xl font-black uppercase tracking-wider text-[#121212] mb-6">Committees</h2>
      {loading ? (
        <div className="text-center py-10 text-[#121212]/60">Loading committees...</div>
      ) : (
        <DataTable columns={columns} data={committees} />
      )}
    </AppShell>
  );
}
