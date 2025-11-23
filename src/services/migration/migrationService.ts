// services/migration/migrationService.ts
import { carService } from '../database/cars';
import { Car, Maintenance, CarDataEntry, Expense } from '../../types';

export class MigrationService {
  static async migrateLocalDataToSupabase(
    userId: string, 
    localCars: Car[]
  ): Promise<{ success: boolean; migratedCars: number; error?: string }> {
    try {
      if (!localCars || localCars.length === 0) {
        return { success: true, migratedCars: 0 };
      }

      let migratedCount = 0;

      // Мигрируем каждый автомобиль
      for (const localCar of localCars) {
        try {
          // Создаем автомобиль в Supabase
          const supabaseCar = await carService.createCar(
            {
              brand: localCar.brand,
              model: localCar.model,
              year: localCar.year,
              // ИСПРАВЛЕНИЕ: приводим к правильным типам
              engineType: localCar.engineType as 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'other',
              transmission: localCar.transmission as 'manual' | 'automatic' | 'cvt' | 'other',
              vin: localCar.vin || ''
            },
            userId
          );

          console.log(`✅ Мигрирован автомобиль: ${localCar.brand} ${localCar.model}`);
          migratedCount++;

        } catch (error) {
          console.error(`❌ Ошибка миграции автомобиля ${localCar.brand}:`, error);
        }
      }

      return { success: true, migratedCars: migratedCount };
      
    } catch (error: any) { // ИСПРАВЛЕНИЕ: добавляем тип any для error
      console.error('❌ Ошибка миграции данных:', error);
      return { success: false, migratedCars: 0, error: error.message };
    }
  }

  static async clearLocalData(): Promise<void> {
    try {
      localStorage.removeItem('cars');
      console.log('🧹 Локальные данные очищены');
    } catch (error) {
      console.error('❌ Ошибка очистки локальных данных:', error);
    }
  }
}