// Базовые типы которые используются везде
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

export interface Maintenance {
  id: string;
  carId: string;
  date: string;
  mileage: number;
  cost: number | null;
  createdAt: string;
  categoryId?: string;
  subcategoryId?: string;
  customFields?: Record<string, any>;
}

export interface CarDataEntry {
  id: string;
  fields: CarDataField[];
  createdAt: string;
  dataType?: 'insurance' | 'inspection' | 'custom';
  insuranceData?: InsuranceData;
  inspectionData?: InspectionData;
}

export interface CarDataField {
  name: string;
  value: string;
  unit: string;
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

export interface BackupData {
  cars: Car[];
  exportedAt: string;
  version: string;
}

// Дополнительные данные
export interface FuelData {
  liters?: number;
  remainingRange?: number;
  averageConsumption?: number;
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