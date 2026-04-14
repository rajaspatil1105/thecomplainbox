import React, { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import DataTable from '../components/DataTable';
import { adminAPI } from '../services/api';
import { useNotification } from '../hooks/useNotification';

/**
 * Users Page
 * Admin user listing and management
 */
export default function UsersPage() {
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers();
      setUsers(response?.data?.users || []);
    } catch (err) {
      addNotification(err?.response?.data?.error || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleActive = async (row) => {
    try {
      await adminAPI.updateUser(row.user_id, { is_active: !row.is_active });
      setUsers((prev) => prev.map((u) => (u.user_id === row.user_id ? { ...u, is_active: !u.is_active } : u)));
      addNotification('User updated', 'success');
    } catch (err) {
      addNotification(err?.response?.data?.error || 'Failed to update user', 'error');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'institutional_id', label: 'Institutional ID' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    {
      key: 'is_active',
      label: 'Status',
      render: (value, row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleActive(row);
          }}
          className={`px-2 py-1 border-2 border-[#121212] text-xs font-black uppercase ${value ? 'bg-[#107050] text-white' : 'bg-[#D02020] text-white'}`}
        >
          {value ? 'Active' : 'Inactive'}
        </button>
      ),
    },
  ];

  return (
    <AppShell pageTitle="Users">
      <h2 className="text-3xl font-black uppercase tracking-wider text-[#121212] mb-6">User Management</h2>
      {loading ? (
        <div className="text-center py-10 text-[#121212]/60">Loading users...</div>
      ) : (
        <DataTable columns={columns} data={users} />
      )}
    </AppShell>
  );
}
