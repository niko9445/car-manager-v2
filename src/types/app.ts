import { Car, FavoriteMaintenance } from './core';

// Типы для форм
export interface CarFormData {
  brand: string;
  model: string;
  year: number;
  engineType: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'other';
  transmission: 'manual' | 'automatic' | 'cvt' | 'other';
  vin: string;
}

export interface CarDataFormData {
  fields: Array<{
    name: string;
    value: string;
    unit: string;
  }>;
}