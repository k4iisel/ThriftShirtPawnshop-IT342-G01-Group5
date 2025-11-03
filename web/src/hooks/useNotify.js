import { useCallback } from 'react';
import { useNotification } from '../contexts/NotificationContext';

const useNotify = () => {
  const { addNotification } = useNotification();

  const notify = useCallback((message, options = {}) => {
    const { type = 'info', duration = 5000 } = options;
    return addNotification({ message, type, duration });
  }, [addNotification]);

  // Helper methods for different notification types
  const notifySuccess = useCallback((message, duration = 5000) => {
    return notify(message, { type: 'success', duration });
  }, [notify]);

  const notifyError = useCallback((message, duration = 5000) => {
    return notify(message, { type: 'error', duration });
  }, [notify]);

  const notifyWarning = useCallback((message, duration = 5000) => {
    return notify(message, { type: 'warning', duration });
  }, [notify]);

  const notifyInfo = useCallback((message, duration = 5000) => {
    return notify(message, { type: 'info', duration });
  }, [notify]);

  return {
    notify,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo
  };
};

export default useNotify;
