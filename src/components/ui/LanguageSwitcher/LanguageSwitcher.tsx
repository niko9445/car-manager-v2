import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useTranslation } from '../../../contexts/LanguageContext';
import './LanguageSwitcher.css';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <div className="language-switcher">
      <div 
        className="language-switcher__options"
        style={{
          display: 'flex',
          gap: '8px',
          width: '100%'
        }}
      >
        <button
          className={`language-switcher__option ${language === 'ru' ? 'language-switcher__option--active' : ''}`}
          onClick={() => setLanguage('ru')}
          type="button"
          style={{
            flex: 1,
            minWidth: '0'
          }}
        >
          {t('languages.ru')}
        </button>
        
        <button
          className={`language-switcher__option ${language === 'en' ? 'language-switcher__option--active' : ''}`}
          onClick={() => setLanguage('en')}
          type="button"
          style={{
            flex: 1,
            minWidth: '0'
          }}
        >
          {t('languages.en')}
        </button>

        <button
          className={`language-switcher__option ${language === 'by' ? 'language-switcher__option--active' : ''}`}
          onClick={() => setLanguage('by')}
          type="button"
          style={{
            flex: 1,
            minWidth: '0'
          }}
        >
          {t('languages.by')}
        </button>
      </div>
    </div>
  );
};