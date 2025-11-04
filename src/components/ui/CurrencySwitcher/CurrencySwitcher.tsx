import React from 'react';
import { useCurrency, Currency } from '../../../contexts/CurrencyContext';

const CurrencySwitcher: React.FC = () => {
  const { currency, setCurrency } = useCurrency();

  const currencies: { value: Currency; symbol: string; title: string }[] = [
    { value: 'RUB', symbol: '₽', title: 'Рубли' },
    { value: 'BYN', symbol: 'BYN', title: 'Белорусские рубли' },
    { value: 'USD', symbol: '$', title: 'Доллары' },
    { value: 'EUR', symbol: '€', title: 'Евро' }
  ];

  const handleCurrencySelect = (newCurrency: Currency) => {
    setCurrency(newCurrency);
  };

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(4, 1fr)', 
      gap: '8px',
      width: '100%'
    }}>
      {currencies.map((curr) => (
        <button
          key={curr.value}
          type="button"
          style={{ 
            padding: '12px 8px', 
            border: `1px solid ${currency === curr.value ? 'var(--color-border-accent)' : 'var(--color-border-secondary)'}`,
            borderRadius: 'var(--radius-md)',
            background: currency === curr.value ? 'var(--color-accent-primary)' : 'var(--color-bg-card)',
            color: currency === curr.value ? 'white' : 'var(--color-text-secondary)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            fontSize: '16px',
            fontWeight: '600',
            minHeight: '44px'
          }}
          onClick={() => handleCurrencySelect(curr.value)}
          title={curr.title}
        >
          {curr.symbol}
        </button>
      ))}
    </div>
  );
};

export default CurrencySwitcher;