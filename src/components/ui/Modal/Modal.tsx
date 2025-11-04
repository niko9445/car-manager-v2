import React, { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  className = '' 
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    
    // Блокировка скролла при открытии модалки
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Фокусируемся на модалке при открытии для доступности
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent): void => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal" 
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        className={`modal__container modal--${size} ${className}`} 
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <div className="modal__header">
          <h2 
            id="modal-title"
            className="modal__title"
          >
            {title}
          </h2>
          <button 
            className="modal__close"
            onClick={onClose}
            type="button"
            aria-label="Закрыть модальное окно"
          >
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>
        <div className="modal__content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;