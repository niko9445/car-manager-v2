import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useTranslation } from '../../../contexts/LanguageContext';
import '../../../styles/components-v2/switcher-components.css';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <div className="switcher-component language-switcher">
      <div className="switcher-options">
        <button
          className={`switcher-option ${language === 'ru' ? 'switcher-option--active' : ''}`}
          onClick={() => setLanguage('ru')}
          type="button"
        >
          {t('languages.ru')}
        </button>
        
        <button
          className={`switcher-option ${language === 'en' ? 'switcher-option--active' : ''}`}
          onClick={() => setLanguage('en')}
          type="button"
        >
          {t('languages.en')}
        </button>

        <button
          className={`switcher-option ${language === 'by' ? 'switcher-option--active' : ''}`}
          onClick={() => setLanguage('by')}
          type="button"
        >
          {t('languages.by')}
        </button>
      </div>
    </div>
  );
};