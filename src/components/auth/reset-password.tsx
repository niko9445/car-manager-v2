// pages/auth/reset-password.tsx (или в твоей структуре роутинга)
import React from 'react';
import { ResetPasswordForm } from '../../components/auth/ResetPasswordForm';

const ResetPasswordPage = () => {
  const handleSuccess = () => {
    // 🔴 ПЕРЕНАПРАВЛЯЕМ НА СТРАНИЦУ ВХОДА
    window.location.href = '/auth/login?message=password_changed';
  };

  const handleCancel = () => {
    window.location.href = '/auth/login';
  };

  return (
    <div className="auth-container">
      <ResetPasswordForm 
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default ResetPasswordPage;