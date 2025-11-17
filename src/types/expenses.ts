import { FuelData, PartsData, InsuranceData, InspectionData } from './core';

// Типы для системы расходов
export interface Expense {
  id: string;
  carId: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  odometer?: number;
  receiptPhoto?: string;
  createdAt: string;
  fuelData?: FuelData;
  partsData?: PartsData;
  insuranceData?: InsuranceData;
  inspectionData?: InspectionData;
}

export type ExpenseCategory = 
  | 'fuel'
  | 'maintenance'
  | 'repairs'
  | 'parts'
  | 'insurance'
  | 'taxes'
  | 'parking'
  | 'washing'
  | 'fines'
  | 'inspection'
  | 'other';

export interface ExpenseStats {
  total: number;
  byCategory: { [category: string]: number };
  monthlyAverage: number;
  lastMonthTotal: number;
  trend: 'up' | 'down' | 'stable';
}

export interface ExpenseFilters {
  carId?: string;
  category?: ExpenseCategory;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface ExpenseFormData {
  date: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  odometer?: number;
  fuelData?: FuelData;
  partsData?: PartsData;
  insuranceData?: InsuranceData;
  inspectionData?: InspectionData;
}

export interface ExpenseReport {
  period: {
    from: string;
    to: string;
  };
  totalExpenses: number;
  expensesByCategory: Array<{
    category: ExpenseCategory;
    amount: number;
    percentage: number;
  }>;
  averagePerMonth: number;
  comparisonWithPrevious: number;
}

export interface ExpenseListProps {
  expenses: Expense[];
  stats?: ExpenseStats | null;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expense: Expense) => void;
  onRefresh: () => void;
  onFilterChange?: (filters: any) => void;
  hasOriginalExpenses?: boolean;
}

export interface ExpenseFiltersProps {
  onFilterChange: (filters: ExpenseFilters) => void;
}