import React, { useEffect, useRef } from 'react';
import { ConfirmModalProps } from '../../../types';
import { useTranslation } from '../../../contexts/LanguageContext';

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, // Убираем значения по умолчанию здесь
  message,
  confirmText,
  cancelText,
  type = "delete" 
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation();

  // Используем переводы по умолчанию, если не переданы пропсы
  const defaultTitle = t('confirmations.deleteTitle');
  const defaultMessage = t('confirmations.deleteMessage');
  const defaultConfirmText = t('common.delete');
  const defaultCancelText = t('common.cancel');

  // Фактические значения для отображения
  const displayTitle = title || defaultTitle;
  const displayMessage = message || defaultMessage;
  const displayConfirmText = confirmText || defaultConfirmText;
  const displayCancelText = cancelText || defaultCancelText;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      
      // Фокусируемся на кнопке подтверждения при открытии
      setTimeout(() => {
        confirmButtonRef.current?.focus();
      }, 100);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    // Блокировка скролла при открытии модалки
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleConfirm = (): void => {
    onConfirm();
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleConfirm();
    }
  };

  const getIcon = (): React.ReactNode => {
    switch (type) {
      case 'delete':
        return (
          <svg 
            className="modal__icon modal__icon--delete" 
            viewBox="0 0 24 24" 
            fill="none"
            aria-hidden="true"
            width="64"
            height="64"
          >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="2"/>
            <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case 'warning':
        return (
          <svg 
            className="modal__icon modal__icon--warning" 
            viewBox="0 0 24 24" 
            fill="none"
            aria-hidden="true"
            width="64"
            height="64"
          >
            <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case 'info':
        return (
          <svg 
            className="modal__icon modal__icon--info" 
            viewBox="0 0 24 24" 
            fill="none"
            aria-hidden="true"
            width="64"
            height="64"
          >
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      default:
        const exhaustiveCheck: never = type;
        return exhaustiveCheck;
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-description"
    >
      <div 
        ref={modalRef}
        className="modal__container modal--sm"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="modal__content modal__content--centered">
          <div className="modal__header modal__header--centered">
            {getIcon()}
            <h3 
              id="confirm-modal-title"
              className="modal__title"
            >
              {displayTitle} {/* <-- Используем вычисленное значение */}
            </h3>
          </div>
          
          <p 
            id="confirm-modal-description"
            className="modal__message"
          >
            {displayMessage} {/* <-- Используем вычисленное значение */}
          </p>
          
          <div className="modal__actions modal__actions--center">
            <button 
              className="btn btn--secondary"
              onClick={onClose}
              type="button"
            >
              {displayCancelText} {/* <-- Используем вычисленное значение */}
            </button>
            <button 
              ref={confirmButtonRef}
              className={`btn btn--${type === 'delete' ? 'danger' : type === 'warning' ? 'warning' : 'primary'}`}
              onClick={handleConfirm}
              type="button"
              autoFocus
            >
              {displayConfirmText} {/* <-- Используем вычисленное значение */}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;