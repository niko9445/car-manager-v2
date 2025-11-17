import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useTranslation } from '../../../contexts/LanguageContext';
import '../../../styles/components-v2/switcher-components.css';

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <div className="switcher-component theme-switcher">
      <div className="switcher-options">
        <button
          className={`switcher-option ${theme === 'light' ? 'switcher-option--active' : ''}`}
          onClick={() => setTheme('light')}
          type="button"
        >
          {t('themes.light')}
        </button>
        
        <button
          className={`switcher-option ${theme === 'dark' ? 'switcher-option--active' : ''}`}
          onClick={() => setTheme('dark')}
          type="button"
        >
          {t('themes.dark')}
        </button>
        
        <button
          className={`switcher-option ${theme === 'auto' ? 'switcher-option--active' : ''}`}
          onClick={() => setTheme('auto')}
          type="button"
        >
          {t('themes.auto')}
        </button>
      </div>
    </div>
  );
};