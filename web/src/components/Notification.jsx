import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import '../styles/Notification.css';

const Notification = ({ message, type = 'info', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className={`notification ${type}`}>
      <div className="notification-content">
        <div className="notification-message">{message}</div>
      </div>
      <button className="notification-close" onClick={handleClose} aria-label="Close notification">
        <X size={18} />
      </button>
    </div>
  );
};

export default Notification;
