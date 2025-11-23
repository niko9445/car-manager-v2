// services/database/expenses.ts
import { BaseService } from './baseService';
import { Expense, ExpenseFormData, ExpenseCategory } from '../../types';

export class ExpenseService extends BaseService {
  constructor() {
    super('expenses');
  }

  async createExpense(expenseData: ExpenseFormData, carId: string): Promise<Expense> {
    const expense = await this.create({
      ...expenseData,
      carId,
      date: expenseData.date,
      category: expenseData.category,
      amount: expenseData.amount,
      description: expenseData.description,
      odometer: expenseData.odometer,
      fuelData: expenseData.fuelData || null,
      partsData: expenseData.partsData || null,
      insuranceData: expenseData.insuranceData || null,
      inspectionData: expenseData.inspectionData || null
    });

    return this.mapToExpense(expense);
  }

  async getExpensesByCar(carId: string): Promise<Expense[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('car_id', carId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data.map(item => this.mapToExpense(item));
  }

  async getExpensesByUser(userId: string): Promise<Expense[]> {
    // Нужно получить через cars чтобы соблюсти RLS
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        cars!inner (user_id)
      `)
      .eq('cars.user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data.map(item => this.mapToExpense(item));
  }

  async updateExpense(expenseId: string, updates: Partial<ExpenseFormData>): Promise<Expense> {
    const updated = await this.update(expenseId, updates);
    return this.mapToExpense(updated);
  }

  async deleteExpense(expenseId: string): Promise<void> {
    await this.delete(expenseId);
  }

  private mapToExpense(dbExpense: any): Expense {
    return {
      id: dbExpense.id,
      carId: dbExpense.carId,
      date: dbExpense.date,
      category: dbExpense.category as ExpenseCategory,
      amount: dbExpense.amount,
      description: dbExpense.description,
      odometer: dbExpense.odometer,
      createdAt: dbExpense.createdAt,
      fuelData: dbExpense.fuelData,
      partsData: dbExpense.partsData,
      insuranceData: dbExpense.insuranceData,
      inspectionData: dbExpense.inspectionData
    };
  }
}

export const expenseService = new ExpenseService();