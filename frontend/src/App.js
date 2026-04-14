import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AnonymousTrackerPage from './pages/AnonymousTrackerPage';
import StudentDashboard from './pages/StudentDashboard';
import ComplaintFormPage from './pages/ComplaintFormPage';
import ComplaintDetailPage from './pages/ComplaintDetailPage';
import FeedbackFormPage from './pages/FeedbackFormPage';
import AuthorityInboxPage from './pages/AuthorityInboxPage';
import AuthorityDetailPage from './pages/AuthorityDetailPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import RoutingQueuePage from './pages/RoutingQueuePage';
import UsersPage from './pages/UsersPage';
import CommitteesPage from './pages/CommitteesPage';
import AuditLogsPage from './pages/AuditLogsPage';
import PrincipalDashboardPage from './pages/PrincipalDashboardPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AccessDeniedPage from './pages/AccessDeniedPage';
import NotFoundPage from './pages/NotFoundPage';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Toaster position="top-right" />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/track" element={<AnonymousTrackerPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/access-denied" element={<AccessDeniedPage />} />

            {/* Student Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/complaints/new"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <ComplaintFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/complaints/:id"
              element={
                <ProtectedRoute allowedRoles={['student', 'committee_member', 'committee_head', 'admin']}>
                  <ComplaintDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/feedback/:id"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <FeedbackFormPage />
                </ProtectedRoute>
              }
            />

            {/* Authority Routes */}
            <Route
              path="/authority/inbox"
              element={
                <ProtectedRoute allowedRoles={['committee_member', 'committee_head', 'admin']}>
                  <AuthorityInboxPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/authority/complaints/:id"
              element={
                <ProtectedRoute allowedRoles={['committee_member', 'committee_head', 'admin']}>
                  <AuthorityDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/routing-queue"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <RoutingQueuePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/committees"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CommitteesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/audit-logs"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AuditLogsPage />
                </ProtectedRoute>
              }
            />

            {/* Principal Routes */}
            <Route
              path="/principal/dashboard"
              element={
                <ProtectedRoute allowedRoles={['principal', 'admin']}>
                  <PrincipalDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Public landing page */}
            <Route path="/" element={<LandingPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
