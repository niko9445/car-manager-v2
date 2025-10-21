import React from 'react';
import { Expense } from '../../../types';
import './ExpenseList.css';

interface ExpenseStats {
  total: number;
  byCategory: { [category: string]: number };
  monthlyAverage: number;
  lastMonthTotal: number;
  trend: 'up' | 'down' | 'stable';
}

interface ExpenseListProps {
  expenses: Expense[];
  stats: ExpenseStats | null;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expense: Expense) => void;
  onRefresh: () => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  stats,
  onEditExpense,
  onDeleteExpense,
  onRefresh
}) => {
  const getCategoryIcon = (category: string): string => {
    const icons: { [key: string]: string } = {
      fuel: '⛽',
      maintenance: '🔧',
      repairs: '🛠️',
      parts: '⚙️',
      insurance: '🛡️',
      taxes: '📄',
      parking: '🅿️',
      washing: '🧼',
      fines: '🚨',
      other: '💰'
    };
    return icons[category] || '💰';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  return (
    <div className="expense-list">
      {stats && (
        <div className="expense-list__stats">
          <div className="expense-list__stat">
            <div className="expense-list__stat-value">
              {formatAmount(stats.total)}
            </div>
            <div className="expense-list__stat-label">Всего расходов</div>
          </div>
          <div className="expense-list__stat">
            <div className="expense-list__stat-value">
              {formatAmount(stats.monthlyAverage)}
            </div>
            <div className="expense-list__stat-label">В среднем в месяц</div>
          </div>
          <div className="expense-list__stat">
            <div className="expense-list__stat-value">
              {formatAmount(stats.lastMonthTotal)}
            </div>
            <div className="expense-list__stat-label">За последний месяц</div>
          </div>
          <div className="expense-list__stat">
            <div className="expense-list__stat-value">
              {stats.trend === 'up' ? '📈' : stats.trend === 'down' ? '📉' : '➡️'}
            </div>
            <div className="expense-list__stat-label">Тренд</div>
          </div>
        </div>
      )}

      <div className="section__list">
        {expenses.map((expense, index) => (
          <div 
            key={expense.id}
            className="card"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="card__header">
              <div className="expense-list__main-info">
                <div className="expense-list__category">
                  <span className="expense-list__category-icon">
                    {getCategoryIcon(expense.category)}
                  </span>
                  <span className="expense-list__category-name">
                    {getCategoryName(expense.category)}
                  </span>
                </div>
                <h3 className="expense-list__description">
                  {expense.description}
                </h3>
                <div className="expense-list__date">
                  {formatDate(expense.date)}
                </div>
              </div>
              
              <div className="expense-list__amount-section">
                <div className="expense-list__amount">
                  {formatAmount(expense.amount)}
                </div>
                {expense.odometer && (
                  <div className="expense-list__odometer">
                    🛣️ {expense.odometer.toLocaleString('ru-RU')} км
                  </div>
                )}
              </div>
            </div>

            <div className="card__content">
              {expense.odometer && (
                <div className="card__row">
                  <span className="card__label">Пробег:</span>
                  <span className="card__value">
                    {expense.odometer.toLocaleString('ru-RU')} км
                  </span>
                </div>
              )}
            </div>

            <div className="card__meta">
              <div className="card__date">
                Добавлено: {formatDate(expense.createdAt)}
              </div>
              <div className="card__actions">
                <button
                  className="card__action card__action--edit"
                  onClick={() => onEditExpense(expense)}
                  aria-label="Редактировать расход"
                >
                  ✏️
                </button>
                <button
                  className="card__action card__action--delete"
                  onClick={() => onDeleteExpense(expense)}
                  aria-label="Удалить расход"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
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