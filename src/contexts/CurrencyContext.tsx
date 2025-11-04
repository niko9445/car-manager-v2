// contexts/CurrencyContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Currency = 'RUB' | 'BYN' | 'USD' | 'EUR';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatCurrency: (amount: number) => string;
  getCurrencySymbol: () => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>('RUB');

  useEffect(() => {
    // Загружаем валюту из localStorage
    const savedCurrency = localStorage.getItem('app-currency') as Currency;
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
  }, []);

  const handleSetCurrency = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    localStorage.setItem('app-currency', newCurrency);
  };

  const getCurrencySymbol = (): string => {
    const symbols = {
      RUB: '₽',
      BYN: 'BYN',
      USD: '$',
      EUR: '€'
    };
    return symbols[currency];
  };

  const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString('ru-RU')} ${getCurrencySymbol()}`;
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency: handleSetCurrency,
      formatCurrency,
      getCurrencySymbol
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};