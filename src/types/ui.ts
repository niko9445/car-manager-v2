import { Car, FavoriteMaintenance, CarDataEntry } from './core';
import { Expense } from './expenses';

// Типы для состояния UI и контекстов
export type AppModalType = 
  | 'addCar' 
  | 'editCar' 
  | 'confirmDelete' 
  | 'addMaintenance' 
  | 'addCarData'
  | 'editCarData'
  | 'addExpense'
  | 'editExpense'
  | 'expenseReport';

export type SectionType = 'maintenance' | 'carData' | 'expenses';

export const CONFIRM_TYPES = {
  DELETE: 'delete',
  WARNING: 'warning', 
  INFO: 'info'
} as const;

export type ConfirmType = typeof CONFIRM_TYPES[keyof typeof CONFIRM_TYPES];

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'export' | 'import';

export type Theme = 'light' | 'dark' | 'auto';

export type Language = 'ru' | 'en' | 'by';

// Состояние приложения
export interface AppState {
  cars: Car[];
  selectedCar: Car | null;
  activeSection: SectionType;
  isMobile: boolean;
  sidebarOpen: boolean;
  modals: Record<AppModalType, boolean>;
  modalData: Record<string, any>;
  favorites: FavoriteMaintenance[];
}

export type ModalData = 
  | { car: Car }
  | { data: CarDataEntry }
  | { expense: Expense }
  | { 
      type: ConfirmType;
      title: string;
      message: string;
      onConfirm: () => void;
    }
  | null;

// Контексты
export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

export interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

export interface TranslationFunction {
  (path: string, params?: Record<string, any>): string;
}

export interface UseTranslationReturn {
  t: TranslationFunction;
  language: Language;
}