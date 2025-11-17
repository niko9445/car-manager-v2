import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import './ThemeSwitcher.css';

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-switcher">
      <div className="theme-switcher__options">
        <button
          className={`theme-switcher__option ${theme === 'light' ? 'theme-switcher__option--active' : ''}`}
          onClick={() => setTheme('light')}
          type="button"
        >
          Светлая
        </button>
        
        <button
          className={`theme-switcher__option ${theme === 'dark' ? 'theme-switcher__option--active' : ''}`}
          onClick={() => setTheme('dark')}
          type="button"
        >
          Тёмная
        </button>
        
        <button
          className={`theme-switcher__option ${theme === 'auto' ? 'theme-switcher__option--active' : ''}`}
          onClick={() => setTheme('auto')}
          type="button"
        >
          Авто
        </button>
      </div>
    </div>
  );
};