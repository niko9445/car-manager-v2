import React, { useState, useEffect } from 'react';
import { ExpenseCategory } from '../../../types';
import './ExpenseFilters.css';

// Локальный интерфейс для фильтров
interface ExpenseFiltersType {
  carId?: string;
  category?: ExpenseCategory;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

interface ExpenseFiltersProps {
  onFilterChange: (filters: ExpenseFiltersType) => void;
}

const ExpenseFilters: React.FC<ExpenseFiltersProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<ExpenseFiltersType>({});
  const [isExpanded, setIsExpanded] = useState(false);

  // Используем useEffect для вызова onFilterChange только при реальном изменении фильтров
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleCategoryChange = (category: ExpenseCategory | 'all') => {
    setFilters(prev => ({
      ...prev,
      category: category === 'all' ? undefined : category
    }));
  };

  const handleDateChange = (field: 'dateFrom' | 'dateTo', value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value || undefined
    }));
  };

  const handleAmountChange = (field: 'minAmount' | 'maxAmount', value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value ? Number(value) : undefined
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setIsExpanded(false);
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  const categoryOptions: { value: ExpenseCategory | 'all'; label: string; icon: string }[] = [
    { value: 'all', label: 'Все категории', icon: '📊' },
    { value: 'fuel', label: 'Заправка', icon: '⛽' },
    { value: 'maintenance', label: 'ТО', icon: '🔧' },
    { value: 'repairs', label: 'Ремонт', icon: '🛠️' },
    { value: 'parts', label: 'Запчасти', icon: '⚙️' },
    { value: 'insurance', label: 'Страховка', icon: '🛡️' },
    { value: 'taxes', label: 'Налоги', icon: '📄' },
    { value: 'parking', label: 'Парковка', icon: '🅿️' },
    { value: 'washing', label: 'Мойка', icon: '🧼' },
    { value: 'fines', label: 'Штрафы', icon: '🚨' },
    { value: 'other', label: 'Прочее', icon: '💰' }
  ];

  const quickDateRanges = [
    { label: 'Сегодня', days: 0 },
    { label: 'Неделя', days: 7 },
    { label: 'Месяц', days: 30 },
    { label: '3 месяца', days: 90 },
    { label: 'Год', days: 365 }
  ];

  const setQuickDateRange = (days: number) => {
    const to = new Date().toISOString().split('T')[0];
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    setFilters(prev => ({
      ...prev,
      dateFrom: days > 0 ? from : undefined,
      dateTo: to
    }));
  };

  return (
    <div className="expense-filters">
      <div className="expense-filters__header">
        <div className="expense-filters__main">
          <div className="expense-filters__category-selector">
            {categoryOptions.map(option => (
              <button
                key={option.value}
                className={`expense-filters__category-btn ${
                  filters.category === option.value ? 'expense-filters__category-btn--active' : ''
                } ${option.value === 'all' && !filters.category ? 'expense-filters__category-btn--active' : ''}`}
                onClick={() => handleCategoryChange(option.value)}
              >
                <span className="expense-filters__category-icon">{option.icon}</span>
                <span className="expense-filters__category-label">{option.label}</span>
              </button>
            ))}
          </div>

          <div className="expense-filters__quick-actions">
            <button
              className={`btn btn--ghost ${isExpanded ? 'btn--primary' : ''}`}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? '▲' : '▼'} Доп. фильтры
            </button>

            {hasActiveFilters && (
              <button
                className="btn btn--outline"
                onClick={clearFilters}
              >
                ✕ Сбросить
              </button>
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="expense-filters__expanded">
          <div className="expense-filters__section">
            <h4 className="expense-filters__section-title">Быстрый выбор периода</h4>
            <div className="expense-filters__quick-dates">
              {quickDateRanges.map(range => (
                <button
                  key={range.days}
                  className="btn btn--outline btn--sm"
                  onClick={() => setQuickDateRange(range.days)}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          <div className="expense-filters__grid">
            <div className="expense-filters__group">
              <label className="expense-filters__label">С</label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleDateChange('dateFrom', e.target.value)}
                className="form__input"
              />
            </div>

            <div className="expense-filters__group">
              <label className="expense-filters__label">По</label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleDateChange('dateTo', e.target.value)}
                className="form__input"
              />
            </div>

            <div className="expense-filters__group">
              <label className="expense-filters__label">Мин. сумма</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={filters.minAmount || ''}
                onChange={(e) => handleAmountChange('minAmount', e.target.value)}
                className="form__input"
                placeholder="0"
              />
            </div>

            <div className="expense-filters__group">
              <label className="expense-filters__label">Макс. сумма</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={filters.maxAmount || ''}
                onChange={(e) => handleAmountChange('maxAmount', e.target.value)}
                className="form__input"
                placeholder="∞"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="expense-filters__active">
              <span className="expense-filters__active-label">Активные фильтры:</span>
              {filters.category && (
                <span className="expense-filters__active-tag">
                  Категория: {categoryOptions.find(c => c.value === filters.category)?.label}
                </span>
              )}
              {filters.dateFrom && (
                <span className="expense-filters__active-tag">
                  С: {new Date(filters.dateFrom).toLocaleDateString('ru-RU')}
                </span>
              )}
              {filters.dateTo && (
                <span className="expense-filters__active-tag">
                  По: {new Date(filters.dateTo).toLocaleDateString('ru-RU')}
                </span>
              )}
              {filters.minAmount && (
                <span className="expense-filters__active-tag">
                  Мин: {filters.minAmount}₽
                </span>
              )}
              {filters.maxAmount && (
                <span className="expense-filters__active-tag">
                  Макс: {filters.maxAmount}₽
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpenseFilters;