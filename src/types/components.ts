import { Car, Maintenance, CarDataEntry } from './core';
import { SectionType } from './ui';

// Пропсы основных компонентов
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

export interface MainContentProps {
  selectedCar: Car | null;
  cars: Car[];
  setCars: (cars: Car[]) => void;
  activeSection: SectionType;
  setActiveSection: (section: SectionType) => void;
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
}

// Уведомления и менеджер данных
import { NotificationType } from './ui';

export interface NotificationProps {
  isOpen: boolean;
  onClose: () => void;
  type?: NotificationType;
  title: string;
  message: string;
  duration?: number;
}

export interface NotificationState {
  isOpen: boolean;
  type: NotificationType;
  title: string;
  message: string;
}

export interface DataManagerProps {
  hideTitle?: boolean;
}

// Свитчеры
export interface ThemeSwitcherProps {
  className?: string;
}