import { Expense, ExpenseFilters, ExpenseStats} from '../types';

const STORAGE_KEY = 'car_expenses';

export class ExpenseService {
  static async getExpenses(filters?: ExpenseFilters): Promise<Expense[]> {
    try {
      const expensesJson = localStorage.getItem(STORAGE_KEY);
      let expenses: Expense[] = expensesJson ? JSON.parse(expensesJson) : [];
      
      // Применяем фильтры
      if (filters) {
        if (filters.carId) {
          expenses = expenses.filter(exp => exp.carId === filters.carId);
        }
        if (filters.category) {
          expenses = expenses.filter(exp => exp.category === filters.category);
        }
        if (filters.dateFrom) {
          expenses = expenses.filter(exp => exp.date >= filters.dateFrom!);
        }
        if (filters.dateTo) {
          expenses = expenses.filter(exp => exp.date <= filters.dateTo!);
        }
        if (filters.minAmount !== undefined) {
          expenses = expenses.filter(exp => exp.amount >= filters.minAmount!);
        }
        if (filters.maxAmount !== undefined) {
          expenses = expenses.filter(exp => exp.amount <= filters.maxAmount!);
        }
      }
      
      return expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error getting expenses:', error);
      return [];
    }
  }

  static async addExpense(expenseData: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
    try {
      const expensesJson = localStorage.getItem(STORAGE_KEY);
      const expenses: Expense[] = expensesJson ? JSON.parse(expensesJson) : [];
      
      // Очищаем fuelData если категория не fuel
      const cleanedExpenseData = {
        ...expenseData,
        fuelData: expenseData.category === 'fuel' ? expenseData.fuelData : undefined
      };
      
      const newExpense: Expense = {
        ...cleanedExpenseData,
        id: this.generateId(),
        createdAt: new Date().toISOString()
      };
      
      expenses.unshift(newExpense);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
      
      console.log('Expense added successfully:', newExpense);
      return newExpense;
    } catch (error) {
      console.error('Error adding expense:', error);
      throw new Error('Failed to add expense');
    }
  }

  static async updateExpense(expenseId: string, updates: Partial<Expense>): Promise<Expense> {
    try {
      const expensesJson = localStorage.getItem(STORAGE_KEY);
      const expenses: Expense[] = expensesJson ? JSON.parse(expensesJson) : [];
      
      const index = expenses.findIndex(exp => exp.id === expenseId);
      
      if (index === -1) {
        throw new Error('Expense not found');
      }
      
      // Очищаем fuelData если категория меняется на не-fuel
      const cleanedUpdates = { ...updates };
      if (updates.category && updates.category !== 'fuel') {
        cleanedUpdates.fuelData = undefined;
      } else if (updates.category === 'fuel' && !updates.fuelData) {
        // Сохраняем существующие fuelData если они есть
        cleanedUpdates.fuelData = expenses[index].fuelData;
      }
      
      expenses[index] = { ...expenses[index], ...cleanedUpdates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
      
      console.log('Expense updated successfully:', expenses[index]);
      return expenses[index];
    } catch (error) {
      console.error('Error updating expense:', error);
      throw new Error('Failed to update expense');
    }
  }

  static async deleteExpense(expenseId: string): Promise<void> {
    try {
      const expensesJson = localStorage.getItem(STORAGE_KEY);
      const expenses: Expense[] = expensesJson ? JSON.parse(expensesJson) : [];
      
      const filteredExpenses = expenses.filter(exp => exp.id !== expenseId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredExpenses));
      
      console.log('Expense deleted successfully:', expenseId);
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw new Error('Failed to delete expense');
    }
  }

  // Новый метод для получения статистики расхода топлива
  static async getFuelConsumptionStats(carId: string): Promise<{
    fullTankConsumption: number | null;
    overallConsumption: number | null;
    averageFromDashboard: number | null;
    totalFuelExpenses: number;
    fullTankExpenses: number;
  }> {
    try {
      const fuelExpenses = await this.getExpenses({ 
        carId, 
        category: 'fuel' 
      });

      if (fuelExpenses.length === 0) {
        return {
          fullTankConsumption: null,
          overallConsumption: null,
          averageFromDashboard: null,
          totalFuelExpenses: 0,
          fullTankExpenses: 0
        };
      }
/*
      // Расчет по полным бакам
      const fullTankExpenses = fuelExpenses.filter(expense => 
        expense.fuelData?.isFullTank && expense.odometer && expense.fuelData?.liters
      );

      let fullTankConsumption = null;
      if (fullTankExpenses.length >= 2) {
        const sortedExpenses = [...fullTankExpenses].sort((a, b) => 
          (a.odometer || 0) - (b.odometer || 0)
        );

        let totalLiters = 0;
        let totalDistance = 0;

        for (let i = 1; i < sortedExpenses.length; i++) {
          const prev = sortedExpenses[i - 1];
          const current = sortedExpenses[i];
          
          if (prev.odometer && current.odometer && prev.fuelData?.liters) {
            const distance = current.odometer - prev.odometer;
            totalDistance += distance;
            totalLiters += prev.fuelData.liters;
          }
        }

        if (totalDistance > 0 && totalLiters > 0) {
          fullTankConsumption = (totalLiters / totalDistance) * 100;
        }
      }
*/
      // Общий средний расход
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
        : null;

      // Средний расход по данным с приборки
      const validConsumptions = fuelExpenses
        .map(expense => expense.fuelData?.averageConsumption)
        .filter((consumption): consumption is number => 
          consumption !== undefined && consumption > 0
        );

      const averageFromDashboard = validConsumptions.length > 0
        ? validConsumptions.reduce((sum, consumption) => sum + consumption, 0) / validConsumptions.length
        : null;

      return {
        fullTankConsumption: null,
        overallConsumption,
        averageFromDashboard,
        totalFuelExpenses: fuelExpenses.length,
        fullTankExpenses: 0
      };
    } catch (error) {
      console.error('Error getting fuel consumption stats:', error);
      return {
        fullTankConsumption: null,
        overallConsumption: null,
        averageFromDashboard: null,
        totalFuelExpenses: 0,
        fullTankExpenses: 0
      };
    }
  }

  static async getExpenseStats(carId: string): Promise<ExpenseStats> {
    try {
      const expenses = await this.getExpenses({ carId });
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      
      const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      
      const byCategory: { [category: string]: number } = {};
      expenses.forEach(exp => {
        byCategory[exp.category] = (byCategory[exp.category] || 0) + exp.amount;
      });
      
      const monthlyAverage = total / Math.max(1, expenses.length / 30 * 365 / 12);
      
      const lastMonthExpenses = expenses.filter(exp => 
        new Date(exp.date) >= lastMonth
      );
      const lastMonthTotal = lastMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      
      const trend = this.calculateTrend(expenses);
      
      return {
        total,
        byCategory,
        monthlyAverage,
        lastMonthTotal,
        trend
      };
    } catch (error) {
      console.error('Error getting expense stats:', error);
      return {
        total: 0,
        byCategory: {},
        monthlyAverage: 0,
        lastMonthTotal: 0,
        trend: 'stable'
      };
    }
  }

  private static generateId(): string {
    return `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static calculateTrend(expenses: Expense[]): 'up' | 'down' | 'stable' {
    if (expenses.length < 2) return 'stable';
    
    const lastThreeMonths = new Date();
    lastThreeMonths.setMonth(lastThreeMonths.getMonth() - 3);
    
    const recentExpenses = expenses.filter(exp => new Date(exp.date) >= lastThreeMonths);
    const olderExpenses = expenses.filter(exp => new Date(exp.date) < lastThreeMonths);
    
    if (recentExpenses.length === 0 || olderExpenses.length === 0) return 'stable';
    
    const recentAvg = recentExpenses.reduce((sum, exp) => sum + exp.amount, 0) / recentExpenses.length;
    const olderAvg = olderExpenses.reduce((sum, exp) => sum + exp.amount, 0) / olderExpenses.length;
    
    if (recentAvg > olderAvg * 1.1) return 'up';
    if (recentAvg < olderAvg * 0.9) return 'down';
    return 'stable';
  }
}