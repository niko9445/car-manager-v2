import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useTranslation } from '../../../contexts/LanguageContext'; // <-- ДОБАВИТЬ
import './ThemeSwitcher.css';

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation(); // <-- ДОБАВИТЬ

  return (
    <div className="theme-switcher">
      <div className="theme-switcher__options">
        <button
          className={`theme-switcher__option ${theme === 'light' ? 'theme-switcher__option--active' : ''}`}
          onClick={() => setTheme('light')}
          type="button"
        >
          {t('themes.light')} {/* <-- ПЕРЕВОД */}
        </button>
        
        <button
          className={`theme-switcher__option ${theme === 'dark' ? 'theme-switcher__option--active' : ''}`}
          onClick={() => setTheme('dark')}
          type="button"
        >
          {t('themes.dark')} {/* <-- ПЕРЕВОД */}
        </button>
        
        <button
          className={`theme-switcher__option ${theme === 'auto' ? 'theme-switcher__option--active' : ''}`}
          onClick={() => setTheme('auto')}
          type="button"
        >
          {t('themes.auto')} {/* <-- ПЕРЕВОД */}
        </button>
      </div>
    </div>
  );
};