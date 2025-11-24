// services/database/maintenance.ts
import { BaseService } from './baseService';
import { Maintenance, MaintenanceFormData } from '../../types';
import { convertKeysToCamelCase, convertKeysToSnakeCase } from '../../utils/convertCase'; // 🔴 ИМПОРТИРУЕМ

export class MaintenanceService extends BaseService {
  constructor() {
    super('maintenance');
  }

  async createMaintenance(maintenanceData: MaintenanceFormData, carId: string): Promise<Maintenance> {
    console.log('🟡 [maintenanceService] createMaintenance START', { maintenanceData, carId });
    
    // 🔴 КОНВЕРТИРУЕМ В snake_case ПЕРЕД ЗАПИСЬЮ В БД
    const dbData = convertKeysToSnakeCase({
      ...maintenanceData,
      carId,
      date: maintenanceData.date,
      mileage: maintenanceData.mileage,
      cost: maintenanceData.cost,
      categoryId: maintenanceData.categoryId,
      subcategoryId: maintenanceData.subcategoryId,
      customFields: maintenanceData.customFields || {}
    });

    console.log('🟡 [maintenanceService] createMaintenance DB DATA:', dbData);
    
    const maintenance = await this.create(dbData);

    console.log('🟢 [maintenanceService] createMaintenance SUCCESS', { maintenance });
    
    return this.mapToMaintenance(maintenance);
  }

  async getMaintenanceByCar(carId: string): Promise<Maintenance[]> {
    console.log('🟡 [maintenanceService] getMaintenanceByCar START', { carId });
    
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('car_id', carId)
      .order('date', { ascending: false });

    if (error) {
      console.error('🔴 [maintenanceService] getMaintenanceByCar ERROR', error);
      throw error;
    }

    console.log('🟢 [maintenanceService] getMaintenanceByCar RAW DATA:', data);
    
    // 🔴 КОНВЕРТИРУЕМ В camelCase ПОСЛЕ ЧТЕНИЯ ИЗ БД
    const result = data.map(item => this.mapToMaintenance(item));
    console.log('🟢 [maintenanceService] getMaintenanceByCar MAPPED RESULT:', result);
    
    return result;
  }

  async updateMaintenance(maintenanceId: string, updates: Partial<MaintenanceFormData>): Promise<Maintenance> {
    // 🔴 КОНВЕРТИРУЕМ В snake_case ПЕРЕД ОБНОВЛЕНИЕМ
    const dbUpdates = convertKeysToSnakeCase(updates);
    const updated = await this.update(maintenanceId, dbUpdates);
    return this.mapToMaintenance(updated);
  }

  async deleteMaintenance(maintenanceId: string): Promise<void> {
    await this.delete(maintenanceId);
  }

  private mapToMaintenance(dbMaintenance: any): Maintenance {
    // 🔴 ИСПОЛЬЗУЕМ АВТОМАТИЧЕСКУЮ КОНВЕРСИЮ
    const camelCaseData = convertKeysToCamelCase(dbMaintenance);
    
    const result = {
      id: camelCaseData.id,
      carId: camelCaseData.carId,
      date: camelCaseData.date,
      mileage: camelCaseData.mileage,
      cost: camelCaseData.cost,
      createdAt: camelCaseData.createdAt,
      categoryId: camelCaseData.categoryId,
      subcategoryId: camelCaseData.subcategoryId,
      customFields: camelCaseData.customFields || {}
    };

    console.log('🟣 [maintenanceService] mapToMaintenance', { 
      dbMaintenance, 
      camelCaseData,
      mappedResult: result 
    });
    
    return result;
  }
}

export const maintenanceService = new MaintenanceService();