import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';

/**
 * Custom hook for notifications
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};
