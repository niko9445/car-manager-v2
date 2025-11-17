import React, { createContext, useContext, useEffect, useState } from 'react';
// Импорты ДОЛЖНЫ быть в начале файла
import ruTranslations from '../locales/ru.json';
import enTranslations from '../locales/en.json';
import byTranslations from '../locales/by.json';

// Обновляем тип для поддержки белорусского языка
export type Language = 'ru' | 'en' | 'by';

export interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const translations = {
  ru: ruTranslations,
  en: enTranslations,
  by: byTranslations
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language') as Language;
    return saved || 'ru'; // Язык по умолчанию
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider'); // <- исправлена опечатка "by" на "be"
  }
  return context;
};

export const useTranslation = () => {
  const { language } = useLanguage();
  
  const t = (path: string, params?: Record<string, any>): string => {
    try {
      const keys = path.split('.');
      let value: any = translations[language];
      
      for (const key of keys) {
        value = value?.[key];
        if (value === undefined) break;
      }
      
      // Fallback на русский если перевод отсутствует
      if (value === undefined && language !== 'ru') {
        let fallbackValue: any = translations.ru;
        for (const key of keys) {
          fallbackValue = fallbackValue?.[key];
          if (fallbackValue === undefined) break;
        }
        value = fallbackValue;
      }
      
      // Fallback на английский если перевод отсутствует и в русском
      if (value === undefined && language !== 'en') {
        let fallbackValue: any = translations.en;
        for (const key of keys) {
          fallbackValue = fallbackValue?.[key];
          if (fallbackValue === undefined) break;
        }
        value = fallbackValue;
      }
      
      if (value === undefined) {
        console.warn(`Translation missing: ${path}`);
        return path;
      }
      
      if (params && typeof value === 'string') {
        return value.replace(/\{\{(\w+)\}\}/g, (match, key) => {
          return params[key]?.toString() ?? match;
        });
      }
      
      return value;
    } catch (error) {
      console.warn(`Translation error for path: ${path}`, error);
      return path;
    }
  };
  
  return { t, language };
};