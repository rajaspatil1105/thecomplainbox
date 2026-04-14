import React, { createContext, useState, useCallback, useEffect, useRef } from 'react';
import api from '../services/api';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const pollIntervalRef = useRef(null);

  // Poll notifications every 30 seconds
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // TODO: Replace with actual API endpoint when available
        // const response = await api.get('/notifications');
        // setNotifications(response.data.notifications || []);
        // setUnreadCount(response.data.unread_count || 0);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    // Initial fetch
    fetchNotifications();

    // Set up polling interval
    pollIntervalRef.current = setInterval(fetchNotifications, 30000); // 30 seconds

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const addNotification = useCallback((notification, type = 'info') => {
    const normalized =
      typeof notification === 'string'
        ? {
            title: type.toUpperCase(),
            message: notification,
            type,
          }
        : notification;

    const id = Date.now();
    const newNotification = {
      id,
      timestamp: new Date(),
      read: false,
      ...normalized,
    };
    setNotifications((prev) => [newNotification, ...prev]);
    setUnreadCount((prev) => prev + 1);
    return id;
  }, []);

  const markAsRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    setUnreadCount(0);
  }, []);

  const removeNotification = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.filter((notif) => notif.id !== notificationId)
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
