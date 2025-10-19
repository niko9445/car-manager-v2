import { Car, BackupData } from '../types';

const STORAGE_KEY = 'cars';

export const exportData = (): string => {
  try {
    const data: Record<string, string> = {};
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        data[key] = localStorage.getItem(key) || '';
      }
    }
    
    const backup: BackupData = {
      cars: JSON.parse(data[STORAGE_KEY] || '[]'),
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };
    
    return JSON.stringify(backup, null, 2);
  } catch (error) {
    console.error('Export error:', error);
    throw new Error('Failed to export data');
  }
};

export const importData = (jsonData: string): void => {
  try {
    const backup: BackupData = JSON.parse(jsonData);
    
    // Валидация данных
    if (!backup.cars || !Array.isArray(backup.cars)) {
      throw new Error('Invalid backup file format');
    }

    // Проверяем структуру каждого автомобиля
    const isValid = backup.cars.every((car: Car) => 
      car.id && car.brand && car.model && car.year
    );

    if (!isValid) {
      throw new Error('Invalid car data structure in backup file');
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(backup.cars));
  } catch (error) {
    console.error('Import error:', error);
    throw new Error('Failed to import data: ' + (error as Error).message);
  }
};