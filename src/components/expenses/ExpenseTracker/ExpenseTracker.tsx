import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Expense, ExpenseFilters as ExpenseFiltersType, ExpenseStats } from '../../../types';
import { ExpenseService } from '../../../services/expenseService';
import ExpenseList from '../ExpenseList/ExpenseList';
import ExpenseFilters from '../ExpenseFilters/ExpenseFilters';
import { useTranslation } from '../../../contexts/LanguageContext'; // <-- ДОБАВИТЬ

const ExpenseTracker: React.FC = () => {
  const { state, dispatch } = useApp();
  const { selectedCar, modals } = state;
  const { t } = useTranslation(); // <-- ДОБАВИТЬ
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFilters, setCurrentFilters] = useState<ExpenseFiltersType>({});

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

  const loadExpenses = useCallback(async (filters?: ExpenseFiltersType) => {
    if (!selectedCar) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const expensesData = await ExpenseService.getExpenses({ 
        carId: selectedCar.id,
        ...filters 
      });
      
      setExpenses(expensesData);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCar]);

  
  useEffect(() => {
    if (!modals.addExpense && !modals.editExpense) {
      loadExpenses(currentFilters);
    }
  }, [modals.addExpense, modals.editExpense, loadExpenses, currentFilters]);

  const handleFilterChange = useCallback((filters: ExpenseFiltersType) => {
    setCurrentFilters(filters);
  }, []);

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
      await ExpenseService.deleteExpense(expense.id);
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
          <h3 className="section__empty-text">{t('expenses.selectCarFirst')}</h3> {/* <-- ПЕРЕВОД */}
          <p className="section__empty-subtext">
            {t('expenses.selectCarDescription')} {/* <-- ПЕРЕВОД */}
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
            {t('expenses.title')} {/* <-- ПЕРЕВОД */}
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
            <p>{t('expenses.loading')}</p> {/* <-- ПЕРЕВОД */}
          </div>
        ) : (
          /* ВСЕГДА показываем ExpenseList, даже если расходов нет */
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