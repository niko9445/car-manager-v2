import React, { useState } from 'react';
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
  stats?: ExpenseStats | null; // Сделал опциональным
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
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const handleToggleActive = (cardId: string) => {
    setActiveCardId(activeCardId === cardId ? null : cardId);
  };

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
      {/* Статистика показывается только если передана */}
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
            className={`card card--expense ${activeCardId === expense.id ? 'card--active' : ''}`}
            onClick={() => handleToggleActive(expense.id)}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="card__header">
              <div className="expense-list__main-info">
                <div className="expense-list__category-badge">
                  <span className="expense-list__category-icon">
                    {getCategoryIcon(expense.category)}
                  </span>
                  <span className="expense-list__category-name">
                    {getCategoryName(expense.category)}
                  </span>
                </div>
                <div className="expense-list__description-wrapper">
                  <h3 className="expense-list__description">
                    {expense.description}
                  </h3>
                  <div className="expense-list__meta">
                    <span className="expense-list__date">
                      {formatDate(expense.date)}
                    </span>
                    {expense.odometer && (
                      <span className="expense-list__odometer">
                        • 🛣️ {expense.odometer.toLocaleString('ru-RU')} км
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="expense-list__amount-section">
                <div className="expense-list__amount">
                  {formatAmount(expense.amount)}
                </div>
              </div>
            </div>

            {/* Дополнительная информация (показывается при активации) */}
            {activeCardId === expense.id && (
              <div className="card__content card__content--expanded">
                <div className="expense-list__details">
                  {expense.odometer && (
                    <div className="expense-list__detail">
                      <span className="expense-list__detail-label">Пробег:</span>
                      <span className="expense-list__detail-value">
                        {expense.odometer.toLocaleString('ru-RU')} км
                      </span>
                    </div>
                  )}
                  <div className="expense-list__detail">
                    <span className="expense-list__detail-label">Дата добавления:</span>
                    <span className="expense-list__detail-value">
                      {formatDate(expense.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="card__actions">
                  <button
                    className="card__action card__action--edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditExpense(expense);
                    }}
                    aria-label="Редактировать расход"
                    title="Редактировать"
                  >
                    <svg className="card__action-icon" viewBox="0 0 24 24" fill="none">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                  <button
                    className="card__action card__action--delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteExpense(expense);
                    }}
                    aria-label="Удалить расход"
                    title="Удалить"
                  >
                    <svg className="card__action-icon" viewBox="0 0 24 24" fill="none">
                      <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M10 11v6m4-6v6" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}
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