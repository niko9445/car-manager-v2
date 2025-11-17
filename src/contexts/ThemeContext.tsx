import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme, ThemeContextType } from '../types';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Пытаемся получить тему из localStorage, иначе 'auto'
    const savedTheme = localStorage.getItem('theme') as Theme;
    return savedTheme || 'auto';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const updateResolvedTheme = () => {
      let newResolvedTheme: 'light' | 'dark';
      
      if (theme === 'auto') {
        // Определяем системную тему
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        newResolvedTheme = isDark ? 'dark' : 'light';
      } else {
        newResolvedTheme = theme;
      }

      setResolvedTheme(newResolvedTheme);
      
      // Применяем тему к документу
      document.documentElement.setAttribute('data-theme', newResolvedTheme);
      document.documentElement.style.colorScheme = newResolvedTheme;
      
      // Сохраняем в localStorage
      localStorage.setItem('theme', theme);
    };

    updateResolvedTheme();

    // Слушаем изменения системной темы (только для auto режима)
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = () => {
      if (theme === 'auto') {
        updateResolvedTheme();
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    // Убираем класс initial-load после загрузки
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('initial-load');
      setIsInitialized(true);
    }, 100);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
      clearTimeout(timer);
    };
  }, [theme]);

  // Добавляем класс initial-load при первой загрузке
  useEffect(() => {
    document.documentElement.classList.add('initial-load');
  }, []);

  const value: ThemeContextType = {
    theme,
    setTheme: (newTheme: Theme) => {
      setTheme(newTheme);
    },
    resolvedTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};