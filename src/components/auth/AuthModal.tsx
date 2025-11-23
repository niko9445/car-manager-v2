// components/auth/AuthModal.tsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginForm } from './LoginForm'; // <-- ИЗМЕНИТЬ
import { RegisterForm } from './RegisterForm'; // <-- ИЗМЕНИТЬ
import './AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const { isLoading } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <div className="auth-modal-header">
          <h2>{mode === 'login' ? 'Вход' : 'Регистрация'}</h2>
          <button className="auth-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="auth-modal-content">
          {mode === 'login' ? (
            <LoginForm onSuccess={onClose} />
          ) : (
            <RegisterForm onSuccess={onClose} />
          )}

          <div className="auth-modal-switch">
            {mode === 'login' ? (
              <p>
                Нет аккаунта?{' '}
                <button 
                  className="auth-switch-btn" 
                  onClick={() => setMode('register')}
                  disabled={isLoading}
                >
                  Зарегистрироваться
                </button>
              </p>
            ) : (
              <p>
                Уже есть аккаунт?{' '}
                <button 
                  className="auth-switch-btn" 
                  onClick={() => setMode('login')}
                  disabled={isLoading}
                >
                  Войти
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};