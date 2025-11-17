import { Car, CarDataEntry, Maintenance, CarDataField } from './core';
import { CarFormData, CarDataFormData } from './app';
import { MaintenanceFormData } from './maintenance';
import { ConfirmType } from './ui';

// Базовые пропсы модальных окон
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

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

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Конкретные модальные окна
export interface AddCarModalProps {
  onClose: () => void;
  onSave: (carData: CarFormData) => void;
}

export interface EditCarModalProps {
  car: Car;
  carDataEntries: CarDataEntry[];
  onClose: () => void;
  onSave: (carId: string, carData: CarFormData) => void;
  onEditCarData: (carId: string, dataId: string, updatedData: { fields: CarDataField[] }) => void;
  onDeleteCarData: (carId: string, dataId: string) => void;
}

export interface AddMaintenanceModalProps {
  onClose: () => void;
  onSave: (maintenanceData: MaintenanceFormData) => void;
}

export interface EditMaintenanceModalProps {
  maintenance: Maintenance;
  onClose: () => void;
  onSave: (maintenanceId: string, maintenanceData: Partial<Maintenance>) => void;
}

export interface AddCarDataModalProps {
  onClose: () => void;
  onSave: (carData: CarDataFormData) => void;
}