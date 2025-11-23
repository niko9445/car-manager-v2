// components/auth/AuthModal.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import './AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const { isLoading } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

  return (
    <div className={`auth-modal ${isOpen ? 'auth-modal--open' : 'auth-modal--closing'}`}>
      {/* Фон */}
      <div className="auth-modal__bg"></div>
      
      {/* Контент */}
      <div className="auth-modal__content">
        
        {/* Заголовок */}
        <div className="auth-header">
          <h1 className="auth-header__title">CarManager</h1>
        </div>

        {/* Переключение между логином и регистрацией */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'auth-tab--active' : ''}`}
            onClick={() => setMode('login')}
            disabled={isLoading}
          >
            Вход
          </button>
          <button
            className={`auth-tab ${mode === 'register' ? 'auth-tab--active' : ''}`}
            onClick={() => setMode('register')}
            disabled={isLoading}
          >
            Регистрация
          </button>
        </div>

        {/* Формы */}
        <div className="auth-forms">
          {mode === 'login' ? (
            <LoginForm onSuccess={onClose} />
          ) : (
            <RegisterForm onSuccess={onClose} />
          )}
        </div>
      </div>
    </div>
  );
};