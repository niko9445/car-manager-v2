// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>; // 🔴 ДОБАВЛЕНО
  updatePassword: (password: string) => Promise<{ error: any }>; // 🔴 ДОБАВЛЕНО
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 AuthContext: начальная загрузка...');

    // Получаем текущую сессию при загрузке
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Ошибка получения сессии:', error);
        }
        
        console.log('📋 Initial session:', session ? 'есть' : 'нет');
        setSession(session);
        setUser(session?.user ?? null);
        
        // НЕ устанавливаем isLoading здесь - ждем onAuthStateChange
      } catch (error) {
        console.error('❌ Ошибка инициализации auth:', error);
      }
    };

    getSession();

    // Слушаем изменения аутентификации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event, session ? 'user exists' : 'no user');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // ВАЖНО: устанавливаем isLoading = false только здесь
        // после того как получили окончательное состояние
        if (isLoading) {
          console.log('✅ Auth initialization complete');
          setIsLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // 🔴 ДОБАВЛЕНО: Функция восстановления пароля
  const resetPassword = async (email: string) => {
    console.log('🔄 Sending password reset email to:', email);
    
    const redirectUrl = `${window.location.origin}/auth/reset-password`;
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      console.error('❌ Password reset error:', error);
    } else {
      console.log('✅ Password reset email sent successfully');
    }

    return { error };
  };

  // 🔴 ДОБАВЛЕНО: Функция обновления пароля
  const updatePassword = async (password: string) => {
    console.log('🔄 Updating password...');
    
    const { data, error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      console.error('❌ Password update error:', error);
    } else {
      console.log('✅ Password updated successfully');
    }

    return { error };
  };

  const value = {
    user,
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
    resetPassword, // 🔴 ДОБАВЛЕНО
    updatePassword, // 🔴 ДОБАВЛЕНО
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};