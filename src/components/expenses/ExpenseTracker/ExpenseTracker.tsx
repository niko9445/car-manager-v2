// components/expenses/ExpenseTracker/ExpenseTracker.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Expense, ExpenseFilters as ExpenseFiltersType, ExpenseStats } from '../../../types';
import { expenseService } from '../../../services/database/expenses';
import ExpenseList from '../ExpenseList/ExpenseList';
import ExpenseFilters from '../ExpenseFilters/ExpenseFilters';
import { useTranslation } from '../../../contexts/LanguageContext';

// Вспомогательная функция для сравнения объектов фильтров
const areFiltersEqual = (a: ExpenseFiltersType, b: ExpenseFiltersType): boolean => {
  return (
    a.carId === b.carId &&
    a.category === b.category &&
    a.dateFrom === b.dateFrom &&
    a.dateTo === b.dateTo &&
    a.minAmount === b.minAmount &&
    a.maxAmount === b.maxAmount
  );
};

const ExpenseTracker: React.FC = () => {
  const { state, dispatch } = useApp();
  const { selectedCar, modals } = state;
  const { t } = useTranslation();
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<ExpenseFiltersType>({});
  const [filtersChanged, setFiltersChanged] = useState(false); // <-- Флаг изменения фильтров

  // Функция для расчета статистики
  const calculateStats = useCallback((): ExpenseStats | null => {
    if (expenses.length === 0) return null;

    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const byCategory = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as { [category: string]: number });

    const monthlyAverage = total / 12;
    
    const now = new Date();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const lastMonthTotal = expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= lastMonthStart && expenseDate <= lastMonthEnd;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);

    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    const currentMonthTotal = expenses
      .filter(expense => new Date(expense.date) >= currentMonthStart)
      .reduce((sum, expense) => sum + expense.amount, 0);
      
    const prevMonthTotal = expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= prevMonthStart && expenseDate < currentMonthStart;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (currentMonthTotal > prevMonthTotal * 1.1) trend = 'up';
    else if (currentMonthTotal < prevMonthTotal * 0.9) trend = 'down';

    return {
      total,
      byCategory,
      monthlyAverage,
      lastMonthTotal,
      trend
    };
  }, [expenses]);

  // loadExpenses без useCallback
  const loadExpenses = async (filters?: ExpenseFiltersType) => {
    if (!selectedCar) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Загрузка расходов с фильтрами:', filters);
      
      // ЗАГРУЖАЕМ ВСЕ данные для выбранного автомобиля
      const allExpensesData = await expenseService.getExpensesByCar(selectedCar.id);
      
      // ПРИМЕНЯЕМ ФИЛЬТРЫ ЛОКАЛЬНО к уже загруженным данным
      let filteredExpenses = allExpensesData;
      
      if (filters?.category) {
        filteredExpenses = filteredExpenses.filter(expense => 
          expense.category === filters.category
        );
        console.log('🔍 Применен фильтр категории:', filters.category);
      }
      
      if (filters?.dateFrom) {
        filteredExpenses = filteredExpenses.filter(expense => 
          expense.date >= filters.dateFrom!
        );
        console.log('📅 Применен фильтр даты от:', filters.dateFrom);
      }
      
      if (filters?.dateTo) {
        filteredExpenses = filteredExpenses.filter(expense => 
          expense.date <= filters.dateTo!
        );
        console.log('📅 Применен фильтр даты до:', filters.dateTo);
      }
      
      if (filters?.minAmount) {
        filteredExpenses = filteredExpenses.filter(expense => 
          expense.amount >= filters.minAmount!
        );
        console.log('💰 Применен фильтр мин. суммы:', filters.minAmount);
      }
      
      if (filters?.maxAmount) {
        filteredExpenses = filteredExpenses.filter(expense => 
          expense.amount <= filters.maxAmount!
        );
        console.log('💰 Применен фильтр макс. суммы:', filters.maxAmount);
      }
      
      setExpenses(filteredExpenses);
      console.log('✅ Расходы после фильтрации:', filteredExpenses.length);
      
    } catch (error) {
      console.error('❌ Ошибка загрузки расходов:', error);
    } finally {
      setLoading(false);
    }
  };

  // ОСНОВНОЙ useEffect - загрузка при монтировании и смене автомобиля
  useEffect(() => {
    console.log('🏁 Первоначальная загрузка расходов');
    loadExpenses(currentFilters);
  }, [selectedCar?.id]); // ТОЛЬКО при смене автомобиля

  // useEffect для фильтров - с проверкой на реальное изменение
  useEffect(() => {
    if (filtersChanged) {
      console.log('🔍 Фильтры изменились - перезагрузка');
      loadExpenses(currentFilters);
      setFiltersChanged(false);
    }
  }, [filtersChanged]); // ТОЛЬКО filtersChanged

  // useEffect для модалок
  useEffect(() => {
    if (selectedCar && (!modals.addExpense && !modals.editExpense)) {
      console.log('📝 Модалка закрылась - перезагрузка');
      loadExpenses(currentFilters);
    }
  }, [modals.addExpense, modals.editExpense, selectedCar?.id]);

  // ОБНОВЛЕННЫЙ handleFilterChange с проверкой изменений
  const handleFilterChange = useCallback((newFilters: ExpenseFiltersType) => {
    // Проверяем действительно ли фильтры изменились
    if (!areFiltersEqual(currentFilters, newFilters)) {
      console.log('🎛️ Фильтры действительно изменились');
      setCurrentFilters(newFilters);
      setFiltersChanged(true); // Устанавливаем флаг только при реальном изменении
    } else {
      console.log('⚡ Фильтры не изменились (пропускаем перезагрузку)');
    }
  }, [currentFilters]);

  const handleAddExpense = () => {
    dispatch({ 
      type: 'OPEN_MODAL', 
      payload: { 
        modalType: 'addExpense'
      } 
    });
  };

  const handleEditExpense = (expense: Expense) => {
    dispatch({ 
      type: 'OPEN_MODAL', 
      payload: { 
        modalType: 'editExpense',
        data: { expense }
      } 
    });
  };

  const handleDeleteExpense = async (expense: Expense) => {
    try {
      await expenseService.deleteExpense(expense.id);
      console.log('🗑️ Расход удален - перезагрузка');
      await loadExpenses(currentFilters);
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  if (!selectedCar) {
    return (
      <div className="expense-tracker">
        <div className="section__empty">
          <div className="section__empty-icon">🚗</div>
          <h3 className="section__empty-text">{t('expenses.selectCarFirst')}</h3>
          <p className="section__empty-subtext">
            {t('expenses.selectCarDescription')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="expense-tracker">
      <div className="section-header">
        <div className="section-title">
          <h2 className="section-title__text">
            {t('expenses.title')}
          </h2>
          <div className="section-title__actions">
            <button 
              className="btn btn--primary btn--compact"
              onClick={handleAddExpense}
              title={t('expenses.add')} 
              type="button"
            >
              <svg className="btn__icon" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="section-content">
        {loading ? (
          <div className="expense-tracker__loading">
            <div className="expense-tracker__spinner"></div>
            <p>{t('expenses.loading')}</p>
          </div>
        ) : (
          <ExpenseList
            expenses={expenses}
            stats={calculateStats()}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handleDeleteExpense}
            onRefresh={() => loadExpenses(currentFilters)}
            onFilterChange={handleFilterChange}
          />
        )}
      </div>
    </div>
  );
};

export default ExpenseTracker;