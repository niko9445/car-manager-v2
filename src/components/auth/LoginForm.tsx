// components/auth/LoginForm.tsx
import React, { useState } from 'react';
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
  
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
      } else {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка входа');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // TODO: Реализовать восстановление пароля
    alert('Функция восстановления пароля в разработке');
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {error && (
        <div className="auth-form__error">
          <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
            <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
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
          onClick={handleForgotPassword}
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