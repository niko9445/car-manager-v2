import React from 'react';
import { Expense } from '../../../types';
import './ExpenseCharts.css';

interface ExpenseStats {
  total: number;
  byCategory: { [category: string]: number };
  monthlyAverage: number;
  lastMonthTotal: number;
  trend: 'up' | 'down' | 'stable';
}

interface ExpenseChartsProps {
  expenses: Expense[];
  stats: ExpenseStats | null;
}

const ExpenseCharts: React.FC<ExpenseChartsProps> = ({ expenses, stats }) => {
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  const getCategoryName = (category: string): string => {
    const names: { [key: string]: string } = {
      fuel: 'Заправка',
      maintenance: 'ТО',
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

  const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      fuel: '#3b82f6',      // blue
      maintenance: '#10b981', // green
      repairs: '#ef4444',    // red
      parts: '#8b5cf6',      // purple
      insurance: '#f59e0b',  // orange
      taxes: '#6b7280',      // gray
      parking: '#84cc16',    // lime
      washing: '#06b6d4',    // cyan
      fines: '#dc2626',      // dark red
      other: '#9ca3af'       // light gray
    };
    return colors[category] || '#9ca3af';
  };

  // Группируем расходы по категориям для круговой диаграммы
  const categoryData = stats ? Object.entries(stats.byCategory)
    .map(([category, amount]) => ({
      category,
      name: getCategoryName(category),
      amount,
      percentage: (amount / stats.total) * 100,
      color: getCategoryColor(category)
    }))
    .sort((a, b) => b.amount - a.amount) : [];

  // Группируем по месяцам для линейного графика
  const monthlyData = expenses.reduce((acc, expense) => {
    const date = new Date(expense.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    const monthName = date.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' });
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: monthName,
        total: 0,
        count: 0
      };
    }
    
    acc[monthKey].total += expense.amount;
    acc[monthKey].count += 1;
    
    return acc;
  }, {} as { [key: string]: { month: string; total: number; count: number } });

  const monthlyDataArray = Object.values(monthlyData).sort((a, b) => {
    return new Date(a.month).getTime() - new Date(b.month).getTime();
  });

  // Находим максимальное значение для масштабирования графиков
  const maxMonthlyAmount = monthlyDataArray.length > 0 
    ? Math.max(...monthlyDataArray.map(item => item.total))
    : 0;

  return (
    <div className="expense-charts">
      <div className="expense-charts__grid">
        {/* Круговая диаграмма по категориям */}
        <div className="expense-charts__card">
          <h3 className="expense-charts__title">Распределение по категориям</h3>
          <div className="expense-charts__pie-container">
            <div className="expense-charts__pie-chart">
              {categoryData.map((item, index) => {
                const rotation = categoryData
                  .slice(0, index)
                  .reduce((sum, i) => sum + i.percentage, 0);
                
                return (
                  <div
                    key={item.category}
                    className="expense-charts__pie-segment"
                    style={{
                      backgroundColor: item.color,
                      transform: `rotate(${rotation * 3.6}deg)`,
                      opacity: 0.8
                    }}
                    title={`${item.name}: ${formatAmount(item.amount)} (${item.percentage.toFixed(1)}%)`}
                  />
                );
              })}
            </div>
            <div className="expense-charts__pie-legend">
              {categoryData.map(item => (
                <div key={item.category} className="expense-charts__legend-item">
                  <div 
                    className="expense-charts__legend-color"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="expense-charts__legend-label">{item.name}</span>
                  <span className="expense-charts__legend-value">
                    {formatAmount(item.amount)} ({item.percentage.toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Линейный график по месяцам */}
        <div className="expense-charts__card">
          <h3 className="expense-charts__title">Динамика расходов по месяцам</h3>
          <div className="expense-charts__bar-container">
            {monthlyDataArray.map((month, index) => (
              <div key={month.month} className="expense-charts__bar-item">
                <div className="expense-charts__bar-label">{month.month}</div>
                <div className="expense-charts__bar-track">
                  <div 
                    className="expense-charts__bar-fill"
                    style={{ 
                      height: `${maxMonthlyAmount ? (month.total / maxMonthlyAmount) * 100 : 0}%`,
                      backgroundColor: getCategoryColor('fuel')
                    }}
                    title={`${month.month}: ${formatAmount(month.total)} (${month.count} записей)`}
                  />
                </div>
                <div className="expense-charts__bar-value">
                  {formatAmount(month.total)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Статистика */}
        {stats && (
          <div className="expense-charts__card">
            <h3 className="expense-charts__title">Общая статистика</h3>
            <div className="expense-charts__stats">
              <div className="expense-charts__stat-item">
                <span className="expense-charts__stat-label">Всего записей:</span>
                <span className="expense-charts__stat-value">{expenses.length}</span>
              </div>
              <div className="expense-charts__stat-item">
                <span className="expense-charts__stat-label">Общая сумма:</span>
                <span className="expense-charts__stat-value">{formatAmount(stats.total)}</span>
              </div>
              <div className="expense-charts__stat-item">
                <span className="expense-charts__stat-label">В среднем в месяц:</span>
                <span className="expense-charts__stat-value">{formatAmount(stats.monthlyAverage)}</span>
              </div>
              <div className="expense-charts__stat-item">
                <span className="expense-charts__stat-label">За последний месяц:</span>
                <span className="expense-charts__stat-value">{formatAmount(stats.lastMonthTotal)}</span>
              </div>
              <div className="expense-charts__stat-item">
                <span className="expense-charts__stat-label">Тренд:</span>
                <span className="expense-charts__stat-value">
                  {stats.trend === 'up' ? '📈 Растет' : stats.trend === 'down' ? '📉 Снижается' : '➡️ Стабильный'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseCharts;