// components/auth/RegisterForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './AuthForms.css';

interface RegisterFormProps {
  onSuccess: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(email, password);
      
      if (error) {
        setError(error.message);
      } else {
        setError('Проверьте вашу почту для подтверждения регистрации');
        setTimeout(() => {
          onSuccess();
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {error && (
        <div className={`auth-form__error ${error.includes('Проверьте') ? 'auth-form__error--success' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
            {error.includes('Проверьте') ? (
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
            ) : (
              <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
            )}
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
          placeholder="Ваш email"
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
          minLength={6}
        />
      </div>

      <div className="form-field">
        <div className="form-field__icon">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
        <input
          type="password"
          className="form-input"
          placeholder="Подтвердите пароль"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={isLoading}
          minLength={6}
        />
      </div>

      <button 
        type="submit" 
        className="auth-form__submit"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <div className="loading-spinner"></div>
            Регистрация...
          </>
        ) : (
          'Зарегистрироваться'
        )}
      </button>
    </form>
  );
};