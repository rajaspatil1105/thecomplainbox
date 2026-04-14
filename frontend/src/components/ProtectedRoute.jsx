import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * ProtectedRoute Component
 * Guards routes based on authentication and role
 */
const ProtectedRoute = ({ 
  children, 
  allowedRoles = [],
  redirectTo = '/login'
}) => {
  const { user, token, isLoading } = useAuth();

  const storedToken = localStorage.getItem('thecomplainbox_token');
  let storedUser = null;

  const rawStoredUser = localStorage.getItem('user');
  if (rawStoredUser) {
    try {
      storedUser = JSON.parse(rawStoredUser);
    } catch (error) {
      storedUser = null;
    }
  }

  const effectiveToken = token || storedToken;
  const effectiveUser = user || storedUser;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F0F0F0]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#121212] border-t-[#1040C0] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-['Outfit'] font-bold text-[#121212]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!effectiveToken || !effectiveUser) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(effectiveUser.role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
};

export default ProtectedRoute;
