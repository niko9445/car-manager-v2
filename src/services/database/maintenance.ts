// services/database/maintenance.ts
import { BaseService } from './baseService';
import { Maintenance, MaintenanceFormData } from '../../types';

export class MaintenanceService extends BaseService {
  constructor() {
    super('maintenance');
  }

  async createMaintenance(maintenanceData: MaintenanceFormData, carId: string): Promise<Maintenance> {
    const maintenance = await this.create({
      ...maintenanceData,
      carId,
      date: maintenanceData.date,
      mileage: maintenanceData.mileage,
      cost: maintenanceData.cost,
      categoryId: maintenanceData.categoryId,
      subcategoryId: maintenanceData.subcategoryId,
      customFields: maintenanceData.customFields || {}
    });

    return this.mapToMaintenance(maintenance);
  }

  async getMaintenanceByCar(carId: string): Promise<Maintenance[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('car_id', carId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data.map(item => this.mapToMaintenance(item));
  }

  async updateMaintenance(maintenanceId: string, updates: Partial<MaintenanceFormData>): Promise<Maintenance> {
    const updated = await this.update(maintenanceId, updates);
    return this.mapToMaintenance(updated);
  }

  async deleteMaintenance(maintenanceId: string): Promise<void> {
    await this.delete(maintenanceId);
  }

  private mapToMaintenance(dbMaintenance: any): Maintenance {
    return {
      id: dbMaintenance.id,
      carId: dbMaintenance.carId,
      date: dbMaintenance.date,
      mileage: dbMaintenance.mileage,
      cost: dbMaintenance.cost,
      createdAt: dbMaintenance.createdAt,
      categoryId: dbMaintenance.categoryId,
      subcategoryId: dbMaintenance.subcategoryId,
      customFields: dbMaintenance.customFields || {}
    };
  }
}

export const maintenanceService = new MaintenanceService();