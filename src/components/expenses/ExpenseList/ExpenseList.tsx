import React, { useState, useMemo } from 'react';
import { Expense, ExpenseListProps } from '../../../types';
import ConfirmModal from '../../ui/ConfirmModal/ConfirmModal';
import { useCurrency } from '../../../contexts/CurrencyContext';

const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  stats,
  onEditExpense,
  onDeleteExpense,
  onRefresh
}) => {
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [expandedExpenseId, setExpandedExpenseId] = useState<string | null>(null);
  const { formatCurrency } = useCurrency();

  const handleToggleExpense = (expenseId: string) => {
    setExpandedExpenseId(expandedExpenseId === expenseId ? null : expenseId);
  };

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
      {/* Статистика - компактные карточки */}
      {stats && (
        <div className="expense-stats">
          <div className="expense-stats__grid">
            {/* Средний расход топлива */}
            <div className="expense-stat-card">
              <div className="expense-stat-card__content">
                <div className="expense-stat-card__title">Средний расход</div>
                <div className="expense-stat-card__value expense-stat-card__value--consumption">
                  {formatConsumption(fuelStats.overallConsumption)}
                </div>
              </div>
            </div>

            {/* Всего расходов */}
            <div className="expense-stat-card">
              <div className="expense-stat-card__content">
                <div className="expense-stat-card__title">Всего</div>
                <div className="expense-stat-card__value">{formatCurrency(stats.total)}</div>
              </div>
            </div>

            {/* В текущем месяце */}
            <div className="expense-stat-card">
              <div className="expense-stat-card__content">
                <div className="expense-stat-card__title">Этот месяц</div>
                <div className="expense-stat-card__value">{formatCurrency(currentMonthTotal)}</div>
              </div>
            </div>

            {/* За прошлый месяц */}
            <div className="expense-stat-card">
              <div className="expense-stat-card__content">
                <div className="expense-stat-card__title">Прошлый месяц</div>
                <div className="expense-stat-card__value">{formatCurrency(stats.lastMonthTotal)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Список расходов с аккордеон-логикой */}
      <div className="expense-list">
        {expenses.map((expense, index) => {
          const isExpanded = expandedExpenseId === expense.id;
          const hasFuelData = expense.category === 'fuel' && expense.fuelData;
          const hasPartsData = expense.category === 'parts' && expense.partsData;
          const hasInsuranceData = expense.category === 'insurance' && expense.insuranceData;
          const hasInspectionData = expense.category === 'inspection' && expense.inspectionData;

          return (
            <div 
              key={expense.id}
              className={`expense-card ${isExpanded ? 'expense-card--expanded' : ''}`}
              onClick={() => handleToggleExpense(expense.id)}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="expense-card__header">
                <div className="expense-card__main-info">
                  <h3 className="expense-card__title">{expense.description}</h3>
                  <div className="expense-card__preview">
                    <div className="expense-card__preview-row">
                      <span className={`expense-card__category expense-card__category--${expense.category}`}>
                        {getCategoryName(expense.category)}
                      </span>
                      <span className="expense-card__amount">
                        {formatCurrency(expense.amount)}
                      </span>
                    </div>
                    <div className="expense-card__preview-date">
                      {formatDate(expense.date)}
                    </div>
                  </div>
                </div>
                
                {/* Кнопки действий в правом верхнем углу */}
                <div className="expense-card__corner-actions">
                  <button 
                    className="expense-card__corner-action"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditExpense(expense);
                    }}
                    title="Редактировать"
                    type="button"
                  >
                    <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                  <button 
                    className="expense-card__corner-action expense-card__corner-action--danger"
                    onClick={(e) => handleDeleteClick(expense, e)}
                    title="Удалить"
                    type="button"
                  >
                    <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Полный вид - появляется ТОЛЬКО при раскрытии */}
              {isExpanded && (
                <div className="expense-card__expanded-content">
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
                    
                    {/* Данные заправки */}
                    {hasFuelData && (
                      <>
                        {expense.fuelData!.liters && (
                          <div className="expense-card__detail">
                            <span className="expense-card__detail-label">Заправлено</span>
                            <span className="expense-card__detail-value">
                              {expense.fuelData!.liters} л
                            </span>
                          </div>
                        )}
                        {expense.fuelData!.remainingRange && (
                          <div className="expense-card__detail">
                            <span className="expense-card__detail-label">Запас хода</span>
                            <span className="expense-card__detail-value">{expense.fuelData!.remainingRange} км</span>
                          </div>
                        )}
                        {expense.fuelData!.averageConsumption && (
                          <div className="expense-card__detail">
                            <span className="expense-card__detail-label">Расход</span>
                            <span className="expense-card__detail-value">{expense.fuelData!.averageConsumption.toFixed(1)} л/100км</span>
                          </div>
                        )}
                      </>
                    )}

                    {/* Данные запчастей */}
                    {hasPartsData && (
                      <>
                        {expense.partsData!.article && (
                          <div className="expense-card__detail">
                            <span className="expense-card__detail-label">Артикул</span>
                            <span className="expense-card__detail-value">{expense.partsData!.article}</span>
                          </div>
                        )}
                        {expense.partsData!.link && (
                          <div className="expense-card__detail">
                            <span className="expense-card__detail-label">Ссылка</span>
                            <a 
                              href={expense.partsData!.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="expense-card__link"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Перейти по ссылке
                            </a>
                          </div>
                        )}
                      </>
                    )}

                    {/* Данные страховки */}
                    {hasInsuranceData && (
                      <>
                        <div className="expense-card__detail">
                          <span className="expense-card__detail-label">Серия и номер</span>
                          <span className="expense-card__detail-value">
                            {expense.insuranceData!.series} {expense.insuranceData!.number}
                          </span>
                        </div>
                        <div className="expense-card__detail">
                          <span className="expense-card__detail-label">Срок действия</span>
                          <span className="expense-card__detail-value">
                            {formatDate(expense.insuranceData!.startDate)} - {formatDate(expense.insuranceData!.endDate)}
                          </span>
                        </div>
                      </>
                    )}

                    {/* Данные техосмотра */}
                    {hasInspectionData && (
                      <>
                        <div className="expense-card__detail">
                          <span className="expense-card__detail-label">Серия и номер</span>
                          <span className="expense-card__detail-value">
                            {expense.inspectionData!.series} {expense.inspectionData!.number}
                          </span>
                        </div>
                        <div className="expense-card__detail">
                          <span className="expense-card__detail-label">Действителен до</span>
                          <span className="expense-card__detail-value">
                            {formatDate(expense.inspectionData!.validUntil)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Удалить расход"
        message={expenseToDelete ? `Вы уверены, что хотите удалить расход "${expenseToDelete.description}" на сумму ${formatCurrency(expenseToDelete.amount)}?` : "Вы уверены, что хотите удалить этот расход?"}
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
    inspection: 'Техосмотр',
    other: 'Прочее'
  };
  return names[category] || category;
};

export default ExpenseList;