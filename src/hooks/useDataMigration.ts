// hooks/useDataMigration.ts
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MigrationService } from '../services/migration/migrationService';
import { useLocalStorage } from './useLocalStorage';
import { Car } from '../types';

export const useDataMigration = () => {
  const { user } = useAuth();
  const [localCars, setLocalCars] = useLocalStorage<Car[]>('cars', []);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<{
    completed: boolean;
    migratedCount: number;
    error?: string;
  }>({ completed: false, migratedCount: 0 });

  // Проверяем нужно ли мигрировать данные
  const shouldMigrate = localCars.length > 0 && user && !migrationStatus.completed;

  useEffect(() => {
    const migrateData = async () => {
      if (!shouldMigrate || isMigrating) return;

      setIsMigrating(true);
      setMigrationStatus({ completed: false, migratedCount: 0 });

      try {
        const result = await MigrationService.migrateLocalDataToSupabase(
          user.id,
          localCars
        );

        if (result.success) {
          setMigrationStatus({ 
            completed: true, 
            migratedCount: result.migratedCars // ИСПРАВЛЕНИЕ: migratedCars вместо migratedCount
          });
          
          // Очищаем локальные данные после успешной миграции
          if (result.migratedCars > 0) { // ИСПРАВЛЕНИЕ: migratedCars вместо migratedCount
            setTimeout(() => {
              MigrationService.clearLocalData();
              setLocalCars([]);
            }, 2000);
          }
        } else {
          setMigrationStatus({ 
            completed: false, 
            migratedCount: 0, 
            error: result.error 
          });
        }
      } catch (error: any) { // ИСПРАВЛЕНИЕ: добавляем тип any для error
        setMigrationStatus({ 
          completed: false, 
          migratedCount: 0, 
          error: error.message 
        });
      } finally {
        setIsMigrating(false);
      }
    };

    migrateData();
  }, [shouldMigrate, user, localCars, setLocalCars, isMigrating]);

  return {
    isMigrating,
    migrationStatus,
    shouldMigrate
  };
};