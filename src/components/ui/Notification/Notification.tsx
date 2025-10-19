import React, { useEffect } from 'react';
import { NotificationProps} from '../../../types';
import './Notification.css';

const Notification: React.FC<NotificationProps> = ({ 
  isOpen, 
  onClose, 
  type = 'success', 
  title, 
  message, 
  duration = 3000 
}) => {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  const getIcon = (): React.ReactNode => {
  switch (type) {
    case 'success':
      return (
        <div className="notification__icon notification__icon--success">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      );
    case 'export':
      return (
        <div className="notification__icon notification__icon--export">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      );
    case 'import':
      return (
        <div className="notification__icon notification__icon--import">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      );
    default:
      // TypeScript теперь понимает что все случаи обработаны
      return null;
  }
};

  if (!isOpen) return null;

  return (
    <div 
      className={`notification notification--${type}`}
      role="alert"
      aria-live="polite"
      aria-labelledby="notification-title"
      aria-describedby="notification-message"
    >
      <div className="notification__content">
        {getIcon()}
        <div className="notification__text">
          <h4 id="notification-title" className="notification__title">{title}</h4>
          <p id="notification-message" className="notification__message">{message}</p>
        </div>
        <button 
          className="notification__close"
          onClick={onClose}
          type="button"
          aria-label="Закрыть уведомление"
        >
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      <div className="notification__progress">
        <div 
          className="notification__progress-bar"
          style={{ animationDuration: `${duration}ms` }}
        ></div>
      </div>
    </div>
  );
};

export default Notification;