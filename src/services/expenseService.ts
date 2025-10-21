import { Expense, ExpenseFilters, ExpenseStats } from '../types';

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
      const expenses = await this.getExpenses();
      const newExpense: Expense = {
        ...expenseData,
        id: this.generateId(),
        createdAt: new Date().toISOString()
      };
      
      expenses.unshift(newExpense);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
      
      return newExpense;
    } catch (error) {
      console.error('Error adding expense:', error);
      throw new Error('Failed to add expense');
    }
  }

  static async updateExpense(expenseId: string, updates: Partial<Expense>): Promise<Expense> {
    try {
      const expenses = await this.getExpenses();
      const index = expenses.findIndex(exp => exp.id === expenseId);
      
      if (index === -1) {
        throw new Error('Expense not found');
      }
      
      expenses[index] = { ...expenses[index], ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
      
      return expenses[index];
    } catch (error) {
      console.error('Error updating expense:', error);
      throw new Error('Failed to update expense');
    }
  }

  static async deleteExpense(expenseId: string): Promise<void> {
    try {
      const expenses = await this.getExpenses();
      const filteredExpenses = expenses.filter(exp => exp.id !== expenseId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredExpenses));
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw new Error('Failed to delete expense');
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