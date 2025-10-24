import React, { useState, useEffect } from 'react';
import { ExpenseCategory } from '../../../types';

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
      {/* Основные фильтры - категории в сетку */}
      <div className="expense-filters__main">
        <div className="expense-filters__categories">
          {categoryOptions.map(option => (
            <button
              key={option.value}
              className={`expense-filters__category-btn ${
                filters.category === option.value || (option.value === 'all' && !filters.category) 
                  ? 'expense-filters__category-btn--active' 
                  : ''
              }`}
              onClick={() => handleCategoryChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Дополнительные фильтры */}
      <div className="expense-filters__advanced">
        <button
          className="btn btn--secondary btn--sm expense-filters__expand-btn"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="expense-filters__expand-icon">
            {isExpanded ? '▲' : '▼'}
          </span>
          Дополнительные фильтры
        </button>

        {isExpanded && (
          <div className="expense-filters__expanded-content">
            <div className="expense-filters__date-grid">
              <div className="expense-filters__date-group">
                <label className="expense-filters__date-label">Дата с</label>
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleDateChange('dateFrom', e.target.value)}
                  className="expense-filters__date-input"
                  placeholder="Дата с"
                  title="Фильтр по дате начала периода"
                />
              </div>
              
              <div className="expense-filters__date-group">
                <label className="expense-filters__date-label">Дата по</label>
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleDateChange('dateTo', e.target.value)}
                  className="expense-filters__date-input"
                  placeholder="Дата по"
                  title="Фильтр по дате окончания периода"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Кнопка сброса - ТЕПЕРЬ ВНИЗУ */}
      {hasActiveFilters && (
        <div className="expense-filters__reset">
          <button
            className="btn btn--secondary btn--sm expense-filters__reset-btn"
            onClick={clearFilters}
          >
            Сбросить фильтры
          </button>
        </div>
      )}
    </div>
  );
};

export default ExpenseFilters;