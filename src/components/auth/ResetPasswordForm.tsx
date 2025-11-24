// components/auth/ResetPasswordForm.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface ResetPasswordFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ 
  onSuccess, 
  onCancel
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isRecoveryFlow, setIsRecoveryFlow] = useState(false);
  const { updatePassword, session, signOut } = useAuth();

  useEffect(() => {
    // 🔴 ПРОВЕРЯЕМ, ЧТО ЭТО ПОТОК ВОССТАНОВЛЕНИЯ ПАРОЛЯ
    const checkRecoveryFlow = () => {
      // Проверяем URL на наличие параметров восстановления
      const hasRecoveryParams = window.location.hash.includes('type=recovery');
      
      console.log('🔐 Recovery flow check:', {
        hasRecoveryParams,
        hash: window.location.hash,
        sessionExists: !!session
      });

      if (hasRecoveryParams && session) {
        console.log('🎯 This is a password recovery flow');
        setIsRecoveryFlow(true);
        
        // 🔴 ОЧИЩАЕМ URL ПАРАМЕТРЫ чтобы избежать повторного срабатывания
        window.history.replaceState({}, '', window.location.pathname);
      }
    };

    checkRecoveryFlow();
  }, [session]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }

    setLoading(true);

    try {
      const { error } = await updatePassword(password);
      
      if (error) throw error;

      setMessage('Пароль успешно изменен!');
      
      // 🔴 ЕСЛИ ЭТО ВОССТАНОВЛЕНИЕ - ВЫХОДИМ И ПЕРЕНАПРАВЛЯЕМ
      if (isRecoveryFlow) {
        setTimeout(async () => {
          await signOut(); // 🔴 ВЫХОДИМ ИЗ СИСТЕМЫ
          if (onSuccess) onSuccess();
        }, 2000);
      } else if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (error: any) {
      console.error('Ошибка сброса пароля:', error);
      setError(error.message || 'Ошибка при сбросе пароля');
    } finally {
      setLoading(false);
    }
  };

  // 🔴 ЕСЛИ ЭТО ВОССТАНОВЛЕНИЕ - ПОКАЗЫВАЕМ ФОРМУ ДАЖЕ ЕСЛИ ЕСТЬ СЕССИЯ
  if (!session && !isRecoveryFlow) {
    return (
      <div className="auth-form">
        <div className="auth-form__error">
          <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
            <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Ссылка недействительна или устарела.
        </div>
        {onCancel && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button 
              onClick={onCancel}
              className="auth-form__submit"
            >
              Вернуться к входу
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="auth-form">
      <div className="auth-form__header">
        <h2>
          {isRecoveryFlow ? 'Восстановление пароля' : 'Смена пароля'}
        </h2>
        <p className="auth-form__subtitle">
          {isRecoveryFlow 
            ? 'Введите новый пароль для вашего аккаунта. После смены пароля вы будете перенаправлены на страницу входа.'
            : 'Введите новый пароль для вашего аккаунта'
          }
        </p>
      </div>

      {error && (
        <div className="auth-form__error">
          <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
            <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
          </svg>
          {error}
        </div>
      )}

      {message && (
        <div className="auth-form__message auth-form__message--success">
          <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
          </svg>
          {message}
        </div>
      )}

      <form onSubmit={handleResetPassword}>
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
            placeholder="Новый пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={loading}
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
            placeholder="Подтвердите пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="auth-form__actions">
          <button 
            type="submit" 
            className="auth-form__submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                Обновление...
              </>
            ) : (
              isRecoveryFlow ? 'Сменить пароль и войти' : 'Установить пароль'
            )}
          </button>

          {onCancel && (
            <button 
              type="button"
              className="auth-form__back-btn"
              onClick={onCancel}
              disabled={loading}
            >
              {isRecoveryFlow ? 'Вернуться к входу' : 'Отмена'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};