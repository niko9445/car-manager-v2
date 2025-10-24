import React, { useEffect } from 'react';
import { NotificationProps } from '../../../types';

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
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        );
      case 'export':
        return (
          <div className="notification__icon notification__icon--export">
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        );
      case 'import':
        return (
          <div className="notification__icon notification__icon--import">
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="notification__icon notification__icon--error">
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="notification__icon notification__icon--warning">
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
              <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        );
      case 'info':
        return (
          <div className="notification__icon notification__icon--info">
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        );
      default:
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
          <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
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