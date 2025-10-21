import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Expense, ExpenseFilters as ExpenseFiltersType } from '../../../types';
import { ExpenseService } from '../../../services/expenseService';
import ExpenseList from '../ExpenseList/ExpenseList';
import ExpenseFilters from '../ExpenseFilters/ExpenseFilters';
import ExpenseCharts from '../ExpenseCharts/ExpenseCharts';
import './ExpenseTracker.css';

// Локальный интерфейс для статистики
interface ExpenseStats {
  total: number;
  byCategory: { [category: string]: number };
  monthlyAverage: number;
  lastMonthTotal: number;
  trend: 'up' | 'down' | 'stable';
}

const ExpenseTracker: React.FC = () => {
  const { state, dispatch } = useApp();
  const { selectedCar } = state;
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<ExpenseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'list' | 'charts'>('list');
  const [currentFilters, setCurrentFilters] = useState<ExpenseFiltersType>({});

  // useCallback чтобы избежать бесконечных ререндеров
  const loadExpenses = useCallback(async (filters?: ExpenseFiltersType) => {
    if (!selectedCar) {
      setExpenses([]);
      setStats(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const expensesData = await ExpenseService.getExpenses({ 
        carId: selectedCar.id,
        ...filters 
      });
      const statsData = await ExpenseService.getExpenseStats(selectedCar.id);
      
      setExpenses(expensesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCar]);

  // Загружаем расходы при изменении selectedCar
  useEffect(() => {
    loadExpenses(currentFilters);
  }, [selectedCar, loadExpenses, currentFilters]);

  // Обработчик изменения фильтров
  const handleFilterChange = useCallback((filters: ExpenseFiltersType) => {
    setCurrentFilters(filters);
    // Не вызываем loadExpenses здесь - это сделает useEffect
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
      await loadExpenses(currentFilters); // Перезагружаем с текущими фильтрами
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleGenerateReport = () => {
    // Пока просто открываем модалку отчета
    dispatch({ 
      type: 'OPEN_MODAL', 
      payload: { modalType: 'expenseReport' } 
    });
  };

  // Если автомобиль не выбран, показываем сообщение
  if (!selectedCar) {
    return (
      <div className="section">
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
    <div className="section">
      <div className="section__header">
        <div>
          <h2 className="section__title">Учет расходов</h2>
          <p className="section__subtitle">
            {selectedCar.brand} {selectedCar.model} • {selectedCar.year}
          </p>
        </div>
        
        <div className="section__header-actions">
          <div className="expense-tracker__view-switcher">
            <button
              className={`btn btn--ghost ${activeView === 'list' ? 'btn--primary' : ''}`}
              onClick={() => setActiveView('list')}
            >
              📋 Список
            </button>
            <button
              className={`btn btn--ghost ${activeView === 'charts' ? 'btn--primary' : ''}`}
              onClick={() => setActiveView('charts')}
            >
              📊 Графики
            </button>
          </div>
          
          <button
            className="btn btn--primary"
            onClick={handleAddExpense}
          >
            + Добавить расход
          </button>
          
          <button
            className="btn btn--outline"
            onClick={handleGenerateReport}
            disabled={expenses.length === 0}
          >
            📄 Отчет
          </button>
        </div>
      </div>

      <ExpenseFilters onFilterChange={handleFilterChange} />

      {loading ? (
        <div className="expense-tracker__loading">
          <div className="expense-tracker__spinner"></div>
          <p>Загрузка расходов...</p>
        </div>
      ) : expenses.length === 0 ? (
        <div className="section__empty">
          <div className="section__empty-icon">💰</div>
          <h3 className="section__empty-text">Нет данных о расходах</h3>
          <p className="section__empty-subtext">
            Добавьте первый расход для отслеживания затрат на автомобиль
          </p>
          <button
            className="btn btn--primary"
            onClick={handleAddExpense}
          >
            + Добавить первый расход
          </button>
        </div>
      ) : (
        <>
          {activeView === 'list' ? (
            <ExpenseList
              expenses={expenses}
              stats={stats}
              onEditExpense={handleEditExpense}
              onDeleteExpense={handleDeleteExpense}
              onRefresh={() => loadExpenses(currentFilters)}
            />
          ) : (
            <ExpenseCharts
              expenses={expenses}
              stats={stats}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ExpenseTracker;