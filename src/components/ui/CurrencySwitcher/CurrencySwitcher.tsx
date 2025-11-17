import React from 'react';
import { useCurrency, Currency } from '../../../contexts/CurrencyContext';
import '../../../styles/components-v2/switcher-components.css';

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
    <div className="switcher-component currency-switcher">
      <div className="switcher-options">
        {currencies.map((curr) => (
          <button
            key={curr.value}
            type="button"
            className={`switcher-option ${
              currency === curr.value ? 'switcher-option--active' : ''
            }`}
            onClick={() => handleCurrencySelect(curr.value)}
            title={curr.title}
          >
            {curr.symbol}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CurrencySwitcher;