import React, { useState } from 'react';
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

  return (
    <div className="expense-list-container">
      {/* Статистика */}
      {stats && (
        <div className="expense-stats">
          <div className="expense-stats__grid">
            <div className="expense-stat-card">
              <div className="expense-stat-card__value">{formatAmount(stats.total)}</div>
              <div className="expense-stat-card__label">Всего расходов</div>
            </div>
            <div className="expense-stat-card">
              <div className="expense-stat-card__value">{formatAmount(stats.monthlyAverage)}</div>
              <div className="expense-stat-card__label">В среднем в месяц</div>
            </div>
            <div className="expense-stat-card">
              <div className="expense-stat-card__value">{formatAmount(stats.lastMonthTotal)}</div>
              <div className="expense-stat-card__label">За последний месяц</div>
            </div>
            <div className="expense-stat-card">
              <div className="expense-stat-card__value">
                {stats.trend === 'up' ? '📈' : stats.trend === 'down' ? '📉' : '➡️'}
              </div>
              <div className="expense-stat-card__label">Тренд</div>
            </div>
          </div>
        </div>
      )}

      {/* Список расходов */}
      <div className="expense-list">
        {expenses.map((expense, index) => (
          <div 
            key={expense.id}
            className="expense-card"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {/* Заголовок карточки */}
            <div className="expense-card__header">
              <h3 className="expense-card__title">{expense.description}</h3>
              <span className="expense-card__amount">{formatAmount(expense.amount)}</span>
            </div>
            
            {/* Мета-информация */}
            <div className="expense-card__meta">
              <span className={`expense-card__category expense-card__category--${expense.category}`}>
                {getCategoryName(expense.category)}
              </span>
              <span className="expense-card__date">{formatDate(expense.date)}</span>
              {expense.odometer && (
                <span className="expense-card__odometer">{formatNumber(expense.odometer)} км</span>
              )}
            </div>

            {/* Детали расхода */}
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
            </div>
            
            {/* Кнопки действий */}
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

      {/* Модальное окно подтверждения удаления */}
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

// Вспомогательная функция для отображения названий категорий
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