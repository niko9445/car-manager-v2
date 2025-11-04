import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Expense, ExpenseFilters as ExpenseFiltersType, ExpenseStats } from '../../../types';
import { ExpenseService } from '../../../services/expenseService';
import ExpenseList from '../ExpenseList/ExpenseList';
import ExpenseFilters from '../ExpenseFilters/ExpenseFilters';

const ExpenseTracker: React.FC = () => {
  const { state, dispatch } = useApp();
  const { selectedCar, modals } = state;
  
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
          <h3 className="section__empty-text">Выберите автомобиль</h3>
          <p className="section__empty-subtext">
            Чтобы начать учет расходов, выберите автомобиль из списка
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
            Учет расходов
          </h2>
          <div className="section-title__actions">
            <button 
              className="btn btn--primary btn--compact"
              onClick={handleAddExpense}
              title="Добавить расход"
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
        {/* ФИЛЬТРЫ - правильный компонент */}
        <ExpenseFilters onFilterChange={handleFilterChange} />

        {loading ? (
          <div className="expense-tracker__loading">
            <div className="expense-tracker__spinner"></div>
            <p>Загрузка расходов...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="expense-welcome">
            <div className="expense-welcome__background">
              <div className="expense-welcome__grid"></div>
            </div>
            <div className="expense-welcome__content">
              <div className="expense-welcome__icon">
                <div className="expense-welcome__chart">
                  <div className="expense-welcome__bar expense-welcome__bar--1"></div>
                  <div className="expense-welcome__bar expense-welcome__bar--2"></div>
                  <div className="expense-welcome__bar expense-welcome__bar--3"></div>
                  <div className="expense-welcome__bar expense-welcome__bar--4"></div>
                </div>
                <div className="expense-welcome__currency">₽</div>
              </div>
              <div className="expense-welcome__text">
                <h3 className="expense-welcome__title">Начните отслеживать расходы</h3>
                <p className="expense-welcome__subtitle">
                  Добавьте первую запись для анализа затрат на автомобиль
                </p>
              </div>
              <button
                className="btn btn--primary expense-welcome__button"
                onClick={handleAddExpense}
              >
                <span>Добавить расход</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        ) : (
          /* СПИСОК РАСХОДОВ - правильный компонент */
          <ExpenseList
            expenses={expenses}
            stats={calculateStats()}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handleDeleteExpense}
            onRefresh={() => loadExpenses(currentFilters)}
          />
        )}
      </div>
    </div>
  );
};

export default ExpenseTracker;