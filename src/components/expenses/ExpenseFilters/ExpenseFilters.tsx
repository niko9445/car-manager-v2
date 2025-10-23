import React, { useState, useEffect } from 'react';
import { ExpenseCategory } from '../../../types';
import './ExpenseFilters.css';

interface ExpenseFiltersType {
  carId?: string;
  category?: ExpenseCategory;
  dateFrom?: string;
  dateTo?: string;
}

interface ExpenseFiltersProps {
  onFilterChange: (filters: ExpenseFiltersType) => void;
}

const ExpenseFilters: React.FC<ExpenseFiltersProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<ExpenseFiltersType>({});
  const [isExpanded, setIsExpanded] = useState(false);

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

  const clearFilters = () => {
    setFilters({});
    setIsExpanded(false);
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  const categoryOptions: { value: ExpenseCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'Все' },
    { value: 'fuel', label: 'Заправка' },
    { value: 'maintenance', label: 'ТО' },
    { value: 'repairs', label: 'Ремонт' },
    { value: 'parts', label: 'Запчасти' },
    { value: 'insurance', label: 'Страховка' },
    { value: 'taxes', label: 'Налоги' },
    { value: 'parking', label: 'Парковка' },
    { value: 'washing', label: 'Мойка' },
    { value: 'fines', label: 'Штрафы' },
    { value: 'other', label: 'Прочее' }
  ];

  return (
    <div className="expense-filters">
      <div className="expense-filters__categories">
        <div className="expense-filters__category-list">
          {categoryOptions.map(option => (
            <button
              key={option.value}
              className={`expense-filters__category-btn ${
                filters.category === option.value ? 'expense-filters__category-btn--active' : ''
              } ${option.value === 'all' && !filters.category ? 'expense-filters__category-btn--active' : ''}`}
              onClick={() => handleCategoryChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        
        {hasActiveFilters && (
          <button
            className="expense-filters__clear-btn"
            onClick={clearFilters}
          >
            Сбросить
          </button>
        )}
      </div>

      <div className="expense-filters__expand-section">
        <button
          className="expense-filters__expand-btn"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="expense-filters__expand-icon">
            {isExpanded ? '▲' : '▼'}
          </span>
          Дополнительные фильтры
        </button>

        {isExpanded && (
          <div className="expense-filters__expanded-content">
            <div className="expense-filters__date-fields">
              <div className="expense-filters__date-field">
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleDateChange('dateFrom', e.target.value)}
                  className="expense-filters__date-input"
                  placeholder="С"
                />
              </div>
              
              <div className="expense-filters__date-field">
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleDateChange('dateTo', e.target.value)}
                  className="expense-filters__date-input"
                  placeholder="По"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseFilters;