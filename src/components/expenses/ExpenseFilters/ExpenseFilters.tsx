// components/expenses/ExpenseFilters/ExpenseFilters.tsx
import React, { useState } from 'react'; // <-- УБРАТЬ useEffect
import { ExpenseCategory } from '../../../types';
import { useTranslation } from '../../../contexts/LanguageContext';

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
  const { t } = useTranslation();

  // УБРАТЬ этот useEffect:
  // useEffect(() => {
  //   onFilterChange(filters);
  // }, [filters, onFilterChange]);

  const handleCategoryChange = (category: ExpenseCategory | 'all') => {
    const newFilters = {
      ...filters,
      category: category === 'all' ? undefined : category
    };
    setFilters(newFilters);
    onFilterChange(newFilters); // <-- ЯВНЫЙ вызов
  };

  const handleDateChange = (field: 'dateFrom' | 'dateTo', value: string) => {
    const newFilters = {
      ...filters,
      [field]: value || undefined
    };
    setFilters(newFilters);
    onFilterChange(newFilters); // <-- ЯВНЫЙ вызов
  };

  const clearFilters = () => {
    setFilters({});
    setIsExpanded(false);
    onFilterChange({}); // <-- ЯВНЫЙ вызов при сбросе
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  const categoryOptions: { value: ExpenseCategory | 'all'; label: string }[] = [
    { value: 'all', label: t('common.all') },
    { value: 'fuel', label: t('expenseCategories.fuel') },
    { value: 'maintenance', label: t('expenseCategories.maintenance') },
    { value: 'repairs', label: t('expenseCategories.repairs') },
    { value: 'parts', label: t('expenseCategories.parts') },
    { value: 'insurance', label: t('expenseCategories.insurance') },
    { value: 'taxes', label: t('expenseCategories.taxes') },
    { value: 'parking', label: t('expenseCategories.parking') },
    { value: 'washing', label: t('expenseCategories.washing') },
    { value: 'fines', label: t('expenseCategories.fines') },
    { value: 'inspection', label: t('expenseCategories.inspection') },
    { value: 'other', label: t('expenseCategories.other') }
  ];

  return (
    <div className="expense-filters">
      <div className="expense-filters__advanced">
        <button
          className="btn btn--secondary btn--sm btn--borderless expense-filters__expand-btn"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="expense-filters__expand-icon">
            {isExpanded ? '▲' : '▼'}
          </span>
          {t('expenses.additionalFilters')}
        </button>

        {isExpanded && (
          <div className="expense-filters__expanded-content">
            <div className="expense-filters__date-container">
              <div className="expense-filters__date-row">
                <label className="expense-filters__date-label">
                  {t('expenses.dateFrom')}
                </label>
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleDateChange('dateFrom', e.target.value)}
                  className="expense-filters__date-input"
                  placeholder={t('expenses.dateFrom')}
                  title={t('expenses.dateFrom')}
                />
              </div>
              
              <div className="expense-filters__date-row">
                <label className="expense-filters__date-label">
                  {t('expenses.dateTo')}
                </label>
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleDateChange('dateTo', e.target.value)}
                  className="expense-filters__date-input"
                  placeholder={t('expenses.dateTo')}
                  title={t('expenses.dateTo')}
                />
              </div>
            </div>

            <div className="expense-filters__categories-section">
              <label className="expense-filters__categories-label">
                {t('expenses.categories')}
              </label>
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

            {hasActiveFilters && (
              <div className="expense-filters__reset">
                <button
                  className="btn btn--secondary btn--sm expense-filters__reset-btn"
                  onClick={clearFilters}
                >
                  {t('expenses.resetFilters')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseFilters;