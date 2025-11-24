// components/auth/LoginForm.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './AuthForms.css';

interface LoginFormProps {
  onSuccess: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  
  const { signIn, resetPassword } = useAuth();

  // 🔴 ПЕРЕНЕСИ useEffect В НАЧАЛО КОМПОНЕНТА (перед условными рендерами)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    
    if (message === 'password_changed') {
      alert('Пароль успешно изменен! Теперь войдите с новым паролем.');
      // Очисти URL параметры
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    console.log('🔄 Attempting login with:', { email, password });

    try {
      const { error } = await signIn(email, password);
      console.log('📋 Login response:', { error });
      
      if (error) {
        setError(error.message);
      } else {
        onSuccess();
      }
    } catch (err: any) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Ошибка входа');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordMessage('');
    setForgotPasswordLoading(true);

    if (!forgotPasswordEmail) {
      setForgotPasswordMessage('Введите email');
      setForgotPasswordLoading(false);
      return;
    }

    try {
      const { error } = await resetPassword(forgotPasswordEmail);
      
      if (error) {
        setForgotPasswordMessage(error.message);
      } else {
        setForgotPasswordMessage('Письмо для восстановления пароля отправлено! Проверьте ваш email.');
        setForgotPasswordEmail('');
        setTimeout(() => {
          setShowForgotPassword(false);
          setForgotPasswordMessage('');
        }, 3000);
      }
    } catch (err: any) {
      console.error('❌ Forgot password error:', err);
      setForgotPasswordMessage(err.message || 'Ошибка при отправке письма');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setForgotPasswordEmail('');
    setForgotPasswordMessage('');
  };

  // Если показываем форму восстановления пароля
  if (showForgotPassword) {
    return (
      <div className="auth-form">
        <div className="auth-form__header">
          <h3>Восстановление пароля</h3>
          <p className="auth-form__subtitle">
            Введите ваш email и мы вышлем ссылку для восстановления пароля
          </p>
        </div>

        {forgotPasswordMessage && (
          <div className={`auth-form__message ${
            forgotPasswordMessage.includes('отправлено') 
              ? 'auth-form__message--success' 
              : 'auth-form__message--error'
          }`}>
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
              {forgotPasswordMessage.includes('отправлено') ? (
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
              ) : (
                <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
              )}
            </svg>
            {forgotPasswordMessage}
          </div>
        )}

        <form onSubmit={handleForgotPassword}>
          <div className="form-field">
            <div className="form-field__icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
                <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <input
              type="email"
              className="form-input"
              placeholder="Ваш email"
              value={forgotPasswordEmail}
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
              required
              disabled={forgotPasswordLoading}
            />
          </div>

          <div className="auth-form__actions">
            <button 
              type="submit" 
              className="auth-form__submit"
              disabled={forgotPasswordLoading}
            >
              {forgotPasswordLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  Отправка...
                </>
              ) : (
                'Отправить ссылку'
              )}
            </button>

            <button 
              type="button"
              className="auth-form__back-btn"
              onClick={handleBackToLogin}
              disabled={forgotPasswordLoading}
            >
              ← Назад ко входу
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Основная форма входа
  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {error && (
        <div className="auth-form__error">
          <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
            <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
          </svg>
          {error}
        </div>
      )}
      
      <div className="form-field">
        <div className="form-field__icon">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
            <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
        <input
          type="email"
          className="form-input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="form-field">
        <div className="form-field__icon">
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
            <circle cx="12" cy="16" r="1" fill="currentColor"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
        <input
          type="password"
          className="form-input"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      {/* Забыли пароль */}
      <div className="auth-form__forgot">
        <button 
          type="button"
          className="auth-form__forgot-btn"
          onClick={() => setShowForgotPassword(true)}
          disabled={isLoading}
        >
          Забыли пароль?
        </button>
      </div>

      <button 
        type="submit" 
        className="auth-form__submit"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <div className="loading-spinner"></div>
            Вход...
          </>
        ) : (
          'Войти'
        )}
      </button>
    </form>
  );
};