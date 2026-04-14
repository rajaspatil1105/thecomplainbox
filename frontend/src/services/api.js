import apiClient from './apiClient';

/**
 * Auth API Service
 * Handles authentication endpoints
 */

export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  logout: () => apiClient.post('/auth/logout'),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (email, otp, newPassword) =>
    apiClient.post('/auth/reset-password', { email, otp, newPassword })
};

/**
 * Complaint API Service
 * Handles complaint endpoints
 */

export const complaintAPI = {
  submit: (data, files) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('isAnonymous', data.isAnonymous || false);
    if (data.category) formData.append('category', data.category);

    if (files && files.length > 0) {
      files.forEach(file => formData.append('files', file));
    }

    return apiClient.post('/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getById: (id) => apiClient.get(`/complaints/${id}`),
  trackAnonymous: (token) => apiClient.get(`/complaints/track/${token}`),
  updateStatus: (id, newStatus, note) =>
    apiClient.patch(`/complaints/${id}/status`, { newStatus, note }),
  escalate: (id) => apiClient.post(`/complaints/${id}/escalate`),
  getMessages: (id) => apiClient.get(`/complaints/${id}/messages`),
  addMessage: (id, message) => apiClient.post(`/complaints/${id}/messages`, { message })
};

/**
 * Dashboard API Service
 */

export const dashboardAPI = {
  getStudentDashboard: () => apiClient.get('/dashboard/student'),
  getAuthorityDashboard: (params = {}) => apiClient.get('/dashboard/authority', { params }),
  getAdminDashboard: () => apiClient.get('/dashboard/admin'),
  getPrincipalDashboard: () => apiClient.get('/dashboard/principal')
};

/**
 * Feedback API Service
 */

export const feedbackAPI = {
  submit: (complaintId, rating, comment) =>
    apiClient.post(`/feedback/${complaintId}`, { rating, comment })
};

/**
 * Admin API Service
 */

export const adminAPI = {
  getAuditLogs: (params) => apiClient.get('/admin/audit-logs', { params }),
  exportAuditLogs: (params) => apiClient.get('/admin/audit-logs/export', { params, responseType: 'blob' }),
  getRoutingQueue: () => apiClient.get('/admin/routing-queue'),
  routeComplaint: (id, committeeId) =>
    apiClient.patch(`/admin/complaints/${id}/route`, { committee_id: committeeId }),
  getUsers: () => apiClient.get('/admin/users'),
  createUser: (data) => apiClient.post('/admin/users', data),
  updateUser: (id, data) => apiClient.patch(`/admin/users/${id}`, data),
  getCommittees: () => apiClient.get('/admin/committees'),
  createCommittee: (data) => apiClient.post('/admin/committees', data),
  updateCommittee: (id, data) => apiClient.patch(`/admin/committees/${id}`, data)
};
