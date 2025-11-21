// Базовые типы данных
export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  engineType: string;
  transmission: string;
  vin: string;
  maintenance: Maintenance[];
  carData: CarDataEntry[];
  articles: Article[];
}

// Добавляем к существующим типам
export interface CarCardProps {
  car: Car;
  isSelected: boolean;
  onSelect: () => void;
  position?: number;
  isMobile?: boolean;
  onDelete?: (car: Car) => void;
}

export interface SidebarProps {
  cars: Car[];
  selectedCar: Car | null;
  setSelectedCar: (car: Car) => void;
  isMobile?: boolean;
  onClose?: () => void;
  onAddCar: () => void;
  onEditCar?: (car: Car) => void;
  onDeleteCar: (car: Car) => void;
  className?: string;
}

export interface Maintenance {
  id: string;
  carId: string;
  date: string;
  mileage: number;
  cost: number | null;
  createdAt: string;
  
  // Новые поля для системы категорий
  categoryId?: string;
  subcategoryId?: string;
  customFields?: Record<string, any>;
}

export interface CarDataEntry {
  id: string;
  fields: CarDataField[];
  createdAt: string;
  // Добавим новые поля для специальных типов данных
  dataType?: 'insurance' | 'inspection' | 'custom';
  insuranceData?: InsuranceData;
  inspectionData?: InspectionData;
}

export interface CarDataField {
  name: string;
  value: string;
  unit: string;
}

// Типы для форм
export interface CarFormData {
  brand: string;
  model: string;
  year: number;
  engineType: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'other';
  transmission: 'manual' | 'automatic' | 'cvt' | 'other';
  vin: string;
}

export interface EditCarModalProps {
  car: Car;
  carDataEntries: CarDataEntry[];
  onClose: () => void;
  onSave: (carId: string, carData: CarFormData) => void;
  onEditCarData: (carId: string, dataId: string, updatedData: { fields: CarDataField[] }) => void;
  onDeleteCarData: (carId: string, dataId: string) => void;
}

export interface EditMaintenanceModalProps {
  maintenance: Maintenance;
  onClose: () => void;
  onSave: (maintenanceId: string, maintenanceData: Partial<Maintenance>) => void;
}

// Типы для состояния UI
export type AppModalType = 
  | 'addCar' 
  | 'editCar' 
  | 'confirmDelete' 
  | 'addMaintenance' 
  | 'addCarData'
  | 'editCarData'
  | 'addExpense'       // ← ДОБАВЛЯЕМ
  | 'editExpense'      // ← ДОБАВЛЯЕМ
  | 'expenseReport';   // ← ДОБАВЛЯЕМ

export type SectionType = 'maintenance' | 'carData' | 'expenses'; // ← ОБНОВЛЯЕМ

export type ConfirmType = 'delete' | 'warning' | 'info';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmType;
}

// Упрощенный AppState без строгой типизации modalData
export interface AppState {
  cars: Car[];
  selectedCar: Car | null;
  activeSection: SectionType;
  isMobile: boolean;
  sidebarOpen: boolean;
  modals: Record<AppModalType, boolean>;
  modalData: Record<string, any>; // ← УПРОЩАЕМ ДЛЯ ГИБКОСТИ
  favorites: FavoriteMaintenance[];
}

export interface FavoriteMaintenance {
  id: string;
  categoryId: string;
  subcategoryId: string;
  customFields: Record<string, any>;
  name: string;
  usedCount: number;
  lastUsed: string;
}

export type ModalData = 
  | { car: Car }
  | { data: CarDataEntry }
  | { expense: Expense } // ← ДОБАВЛЯЕМ
  | { 
      type: ConfirmType;
      title: string;
      message: string;
      onConfirm: () => void;
    }
  | null;

export interface CarDataFormData {
  fields: Array<{
    name: string;
    value: string;
    unit: string;
  }>;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Дополняем существующие типы если нужно
export interface AddCarModalProps {
  onClose: () => void;
  onSave: (carData: CarFormData) => void;
}

export interface AddMaintenanceModalProps {
  onClose: () => void;
  onSave: (maintenanceData: MaintenanceFormData) => void;
}

export interface AddCarDataModalProps {
  onClose: () => void;
  onSave: (carData: CarDataFormData) => void;
}

// Добавляем к существующим типам
export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'export' | 'import';

export interface NotificationState {
  isOpen: boolean;
  type: NotificationType;
  title: string;
  message: string;
}

export interface NotificationProps {
  isOpen: boolean;
  onClose: () => void;
  type?: NotificationType;
  title: string;
  message: string;
  duration?: number;
}

export interface BackupData {
  cars: Car[];
  exportedAt: string;
  version: string;
}

export interface DataManagerProps {
  hideTitle?: boolean;
}

// Добавляем к существующим типам
export interface MainContentProps {
  selectedCar: Car | null;
  cars: Car[];
  setCars: (cars: Car[]) => void;
  activeSection: SectionType; // ← ОБНОВЛЯЕМ
  setActiveSection: (section: SectionType) => void; // ← ОБНОВЛЯЕМ
  onAddMaintenance: () => void;
  onAddCarData: () => void;
  onDeleteMaintenance: (maintenance: Maintenance) => void;
  onDeleteCarData: (data: CarDataEntry) => void;
  onEditCarData: (data: CarDataEntry) => void;
  onEditCar: (car: Car) => void;
  isMobile?: boolean;
  onOpenSidebar: () => void;
}

export interface MaintenanceSectionProps {
  car: Car;
  cars: Car[];
  setCars: (cars: Car[]) => void;
  onAddMaintenance: () => void;
  onDeleteMaintenance: (maintenance: Maintenance) => void;
  onEditMaintenance: (maintenance: Maintenance) => void;
}

export interface CarDataSectionProps {
  car: Car;
  cars: Car[];
  setCars?: (cars: Car[]) => void;
  onAddCarData: () => void;
  onDeleteCarData: (data: CarDataEntry) => void;
  onEditCarData: (data: CarDataEntry) => void;
  onEditCar: (car: Car) => void;
  onAddArticle?: () => void;
  onEditArticle?: (article: Article) => void; // ← ДОБАВЬТЕ ЭТО
  onDeleteArticle?: (article: Article) => void; // ← ДОБАВЬТЕ ЭТО
}

// ===== ТИПЫ ДЛЯ РАСХОДОВ И ОТЧЕТОВ =====
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
  partsData?: PartsData; // ← ДОБАВИТЬ
  insuranceData?: InsuranceData; // ← ДОБАВИТЬ
  inspectionData?: InspectionData; // ← ДОБАВИТЬ
}

export type ExpenseCategory = 
  | 'fuel'        // Заправка
  | 'maintenance' // ТО
  | 'repairs'     // Ремонт
  | 'parts'       // Запчасти
  | 'insurance'   // Страховка
  | 'taxes'       // Налоги
  | 'parking'     // Парковка
  | 'washing'     // Мойка
  | 'fines'       // Штрафы
  | 'inspection'  // Техосмотр ← ДОБАВИТЬ
  | 'other';      // Прочее

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
  insuranceData?: InsuranceData; // ← ОПЦИОНАЛЬНО
  inspectionData?: InspectionData; // ← ОПЦИОНАЛЬНО
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

// Добавь это в конец файла types/index.ts

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

// Добавь в конец файла types/index.ts
export interface FuelData {
  liters?: number;
  remainingRange?: number;
  averageConsumption?: number;
}

// Обнови интерфейс Expense
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
  fuelData?: FuelData; // ← НОВОЕ ПОЛЕ
}

// Обнови ExpenseFormData
export interface ExpenseFormData {
  date: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  odometer?: number;
  fuelData?: FuelData; // ← НОВОЕ ПОЛЕ
}

export interface PartsData {
  article?: string;
  link?: string;
}

export interface InsuranceData {
  series: string;
  number: string;
  startDate: string;
  endDate: string;
  cost?: number;
}

export interface InspectionData {
  series: string;
  number: string;
  validUntil: string;
  cost?: number;
}

/////////////////////////////////////

// ===== ТИПЫ ДЛЯ СИСТЕМЫ КАТЕГОРИЙ ТЕХОБСЛУЖИВАНИЯ =====

export interface MaintenanceCategory {
  id: string;
  name: string;
  icon: string;
  subcategories: MaintenanceSubcategory[];
}

export interface MaintenanceSubcategory {
  id: string;
  name: string;
  fields: FormField[];
  defaultValues?: Record<string, any>;
}

export interface FormField {
  type: 'text' | 'number' | 'select' | 'checkbox' | 'date';
  name: string;
  label: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface MaintenanceFormData {
  categoryId: string;
  subcategoryId: string;
  date: string;
  mileage: number;
  cost: number | null;
  customFields: Record<string, any>;
  description?: string;
}

// ===== ТИПЫ ДЛЯ СИСТЕМЫ ТЕМ =====

export type Theme = 'light' | 'dark' | 'auto';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

export interface ThemeSwitcherProps {
  className?: string;
}

// ===== ТИПЫ ДЛЯ СИСТЕМЫ ЯЗЫКА =====

export type Language = 'ru' | 'en';

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

export interface Article {
  id: string;
  category: string;
  articleNumber: string;
  link?: string;
  createdAt: string;
  subcategory: string;
}