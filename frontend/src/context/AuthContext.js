import React, { createContext, useState, useCallback, useEffect } from 'react';

/**
 * Authentication Context
 * Manages user authentication state and JWT token
 */

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('thecomplainbox_token');
    const storedUser = localStorage.getItem('user');

    if (storedToken) {
      setToken(storedToken);

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          localStorage.removeItem('user');
        }
      } else {
        try {
          const payload = JSON.parse(atob(storedToken.split('.')[1]));
          setUser({
            user_id: payload.user_id,
            institutional_id: payload.institutional_id,
            role: payload.role,
            committee_id: payload.committee_id || null,
          });
        } catch (e) {
          localStorage.removeItem('thecomplainbox_token');
          setToken(null);
        }
      }
    }

    setIsLoading(false);
  }, []);

  const login = useCallback((userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('thecomplainbox_token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setError(null);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('thecomplainbox_token');
    localStorage.removeItem('user');
    setError(null);
  }, []);

  const isAuthenticated = useCallback(() => {
    return !!token && !!user;
  }, [token, user]);

  const hasRole = useCallback((role) => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      error,
      setError,
      login,
      logout,
      isAuthenticated,
      hasRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
