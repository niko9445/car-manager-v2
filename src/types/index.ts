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
}

// Добавляем к существующим типам
export interface CarCardProps {
  car: Car;
  isSelected: boolean;
  onSelect: () => void;
  position?: number;
  isMobile?: boolean;
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
}

export interface Maintenance {
  id: string;
  mileage: number;
  cost: number | null;
  oilChangeStep: number;
  filterChangeStep: number;
  additionalItems: AdditionalItem[];
  createdAt: string;
}

export interface AdditionalItem {
  name: string;
  value: string;
  unit: string;
}

export interface CarDataEntry {
  id: string;
  fields: CarDataField[];
  createdAt: string;
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

export interface MaintenanceFormData {
  date?: string;
  mileage: number;
  cost?: number | null;
  oilChangeStep: number;
  filterChangeStep: number;
  description?: string;
  additionalItems: AdditionalItem[];
}

export interface EditCarModalProps {
  car: Car;
  onClose: () => void;
  onSave: (carId: string, carData: CarFormData) => void;
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
  | 'editCarData';

export type SectionType = 'maintenance' | 'carData';

export type ConfirmType = 'delete' | 'warning' | 'info';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmType; // ← МЕНЯЕМ НА ConfirmType
}

export interface AppState {
  cars: Car[];
  selectedCar: Car | null;
  activeSection: SectionType;
  isMobile: boolean;
  sidebarOpen: boolean;
  modals: Record<AppModalType, boolean>;
  modalData: {
    carToEdit?: Car;
    carToDelete?: Car;
    maintenanceToDelete?: Maintenance;
    dataToDelete?: CarDataEntry;
  };
}

export type ModalData = 
  | { car: Car } // для editCar
  | { data: CarDataEntry } // ← ДОБАВЛЯЕМ для editCarData
  | { 
      type: ConfirmType;
      title: string;
      message: string;
      onConfirm: () => void;
    } // для confirmDelete
  | null;

export interface CarDataFormData {
  fields: Array<{
    name: string;
    value: string;
    unit: string;
  }>;
}

// Дополняем существующие типы если нужно
export interface AddCarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (carData: CarFormData) => void;
}

export interface AddMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (maintenanceData: MaintenanceFormData) => void;
}

export interface AddCarDataModalProps {
  isOpen: boolean;
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
  // Пока пусто, но можно добавить props при необходимости
}

// Добавляем к существующим типам
export interface MainContentProps {
  selectedCar: Car | null;
  cars: Car[];
  setCars: (cars: Car[]) => void;
  activeSection: 'maintenance' | 'carData';
  setActiveSection: (section: 'maintenance' | 'carData') => void;
  onAddMaintenance: () => void;
  onAddCarData: () => void;
  onDeleteMaintenance: (maintenance: Maintenance) => void;
  onDeleteCarData: (data: CarDataEntry) => void;
  onEditCarData: (data: CarDataEntry) => void;
  onEditCar: (car: Car) => void; // ← ДОБАВЬ ЭТУ СТРОЧКУ
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
  setCars: (cars: Car[]) => void;
  onAddCarData: () => void;
  onDeleteCarData: (data: CarDataEntry) => void;
  onEditCarData: (data: CarDataEntry) => void;
  onEditCar: (car: Car) => void;
}