import React, { useState, useMemo } from 'react';
import { Expense, ExpenseListProps } from '../../../types';
import ConfirmModal from '../../ui/ConfirmModal/ConfirmModal';

const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  stats,
  onEditExpense,
  onDeleteExpense,
  onRefresh
}) => {
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Расчет статистики расхода топлива
  const fuelStats = useMemo(() => {
    const fuelExpenses = expenses.filter(expense => 
      expense.category === 'fuel' && expense.fuelData
    );

    if (fuelExpenses.length === 0) {
      return {
        overallConsumption: 0,
        totalFuelExpenses: 0
      };
    }

    // Общий средний расход с использованием данных о запасе хода
    const totalLiters = fuelExpenses.reduce((sum, expense) => 
      sum + (expense.fuelData?.liters || 0), 0
    );

    const odometerValues = fuelExpenses
      .map(expense => expense.odometer)
      .filter((odometer): odometer is number => odometer !== undefined)
      .sort((a, b) => a - b);

    const totalDistance = odometerValues.length >= 2 
      ? odometerValues[odometerValues.length - 1] - odometerValues[0]
      : 0;

    const overallConsumption = totalDistance > 0 && totalLiters > 0
      ? (totalLiters / totalDistance) * 100
      : 0;

    return {
      overallConsumption,
      totalFuelExpenses: fuelExpenses.length
    };
  }, [expenses]);

  const handleDeleteClick = (expense: Expense, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpenseToDelete(expense);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (expenseToDelete) {
      onDeleteExpense(expenseToDelete);
      setExpenseToDelete(null);
    }
    setIsConfirmModalOpen(false);
  };

  const handleCancelDelete = () => {
    setExpenseToDelete(null);
    setIsConfirmModalOpen(false);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' ₽';
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString('ru-RU');
  };

  const formatConsumption = (consumption: number): string => {
    return consumption > 0 ? consumption.toFixed(1) + ' л/100км' : '0 л/100км';
  };

  // Расчет текущего месяца
  const currentMonthTotal = useMemo(() => {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return expenses
      .filter(expense => new Date(expense.date) >= currentMonthStart)
      .reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  const hasFuelExpenses = fuelStats.totalFuelExpenses > 0;

  return (
    <div className="expense-list-container">
      {/* Статистика */}
      {stats && (
        <div className="expense-stats">
          <div className="expense-stats__grid">
            {/* 👇 КАРТОЧКА СРЕДНЕГО РАСХОДА - ВСЯ ШИРИНА */}
            <div className="expense-stat-card expense-stat-card--fuel">
              <div className="expense-stat-card__title">Средний расход топлива</div>
              <div className="expense-stat-card__consumption-single">
                <span className="expense-stat-card__consumption-value">
                  {formatConsumption(fuelStats.overallConsumption)}
                </span>
              </div>
              {hasFuelExpenses && (
                <div className="expense-stat-card__fuel-meta">
                  На основе {fuelStats.totalFuelExpenses} заправок
                </div>
              )}
            </div>

            {/* 👇 КАРТОЧКА ВСЕГО РАСХОДОВ - ВСЯ ШИРИНА */}
            <div className="expense-stat-card expense-stat-card--full-width">
              <div className="expense-stat-card__value">{formatAmount(stats.total)}</div>
              <div className="expense-stat-card__label">Всего расходов</div>
            </div>

            {/* 👇 ДВЕ КАРТОЧКИ В ОДНОЙ СТРОКЕ - ОБЕРТКА ДЛЯ МОБИЛЬНЫХ */}
            <div className="expense-stats__row">
              <div className="expense-stat-card">
                <div className="expense-stat-card__value">{formatAmount(currentMonthTotal)}</div>
                <div className="expense-stat-card__label">В текущем месяце</div>
              </div>
              <div className="expense-stat-card">
                <div className="expense-stat-card__value">{formatAmount(stats.lastMonthTotal)}</div>
                <div className="expense-stat-card__label">За последний месяц</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Остальной код остается без изменений */}
      <div className="expense-list">
        {expenses.map((expense, index) => (
          <div 
            key={expense.id}
            className="expense-card"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="expense-card__header">
              <h3 className="expense-card__title">{expense.description}</h3>
              <span className="expense-card__amount">{formatAmount(expense.amount)}</span>
            </div>
            
            <div className="expense-card__meta">
              <span className={`expense-card__category expense-card__category--${expense.category}`}>
                {getCategoryName(expense.category)}
              </span>
              <span className="expense-card__date">{formatDate(expense.date)}</span>
              {expense.odometer && (
                <span className="expense-card__odometer">{formatNumber(expense.odometer)} км</span>
              )}
            </div>

            <div className="expense-card__details">
              <div className="expense-card__detail">
                <span className="expense-card__detail-label">Категория</span>
                <span className="expense-card__detail-value">{getCategoryName(expense.category)}</span>
              </div>
              <div className="expense-card__detail">
                <span className="expense-card__detail-label">Дата</span>
                <span className="expense-card__detail-value">{formatDate(expense.date)}</span>
              </div>
              {expense.odometer && (
                <div className="expense-card__detail">
                  <span className="expense-card__detail-label">Пробег</span>
                  <span className="expense-card__detail-value">{formatNumber(expense.odometer)} км</span>
                </div>
              )}
              
              {expense.category === 'fuel' && expense.fuelData && (
                <>
                  {expense.fuelData.liters && (
                    <div className="expense-card__detail">
                      <span className="expense-card__detail-label">Заправлено</span>
                      <span className="expense-card__detail-value">
                        {expense.fuelData.liters} л
                      </span>
                    </div>
                  )}
                  {expense.fuelData.remainingRange && (
                    <div className="expense-card__detail">
                      <span className="expense-card__detail-label">Запас хода</span>
                      <span className="expense-card__detail-value">{expense.fuelData.remainingRange} км</span>
                    </div>
                  )}
                  {expense.fuelData.averageConsumption && (
                    <div className="expense-card__detail">
                      <span className="expense-card__detail-label">Расход</span>
                      <span className="expense-card__detail-value">{expense.fuelData.averageConsumption.toFixed(1)} л/100км</span>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="expense-card__actions">
              <button 
                className="btn btn--secondary btn--sm"
                onClick={() => onEditExpense(expense)}
              >
                Редактировать
              </button>
              <button 
                className="btn btn--danger btn--sm"
                onClick={(e) => handleDeleteClick(expense, e)}
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Удалить расход"
        message={expenseToDelete ? `Вы уверены, что хотите удалить расход "${expenseToDelete.description}" на сумму ${formatAmount(expenseToDelete.amount)}?` : "Вы уверены, что хотите удалить этот расход?"}
        confirmText="Удалить"
        cancelText="Отмена"
        type="delete"
      />
    </div>
  );
};

const getCategoryName = (category: string): string => {
  const names: { [key: string]: string } = {
    fuel: 'Заправка',
    maintenance: 'Техобслуживание',
    repairs: 'Ремонт',
    parts: 'Запчасти',
    insurance: 'Страховка',
    taxes: 'Налоги',
    parking: 'Парковка',
    washing: 'Мойка',
    fines: 'Штрафы',
    other: 'Прочее'
  };
  return names[category] || category;
};

export default ExpenseList;