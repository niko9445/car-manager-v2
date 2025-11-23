// services/database/carData.ts
import { BaseService } from './baseService';
import { CarDataEntry, CarDataField, InsuranceData, InspectionData } from '../../types';

export class CarDataService extends BaseService {
  constructor() {
    super('car_data');
  }

  async createCarData(carId: string, data: {
    fields: CarDataField[];
    dataType?: 'insurance' | 'inspection' | 'custom';
    insuranceData?: InsuranceData;
    inspectionData?: InspectionData;
  }): Promise<CarDataEntry> {
    const carData = await this.create({
      ...data,
      carId
    });

    return this.mapToCarData(carData);
  }

  async getCarDataByCar(carId: string): Promise<CarDataEntry[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('car_id', carId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(item => this.mapToCarData(item));
  }

  async updateCarData(carDataId: string, updates: {
    fields?: CarDataField[];
    insuranceData?: InsuranceData;
    inspectionData?: InspectionData;
  }): Promise<CarDataEntry> {
    const updated = await this.update(carDataId, updates);
    return this.mapToCarData(updated);
  }

  async deleteCarData(carDataId: string): Promise<void> {
    await this.delete(carDataId);
  }

  // Специальные методы для работы со страховками
  async getInsuranceDataByCar(carId: string): Promise<CarDataEntry[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('car_id', carId)
      .eq('data_type', 'insurance')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(item => this.mapToCarData(item));
  }

  // Специальные методы для работы с техосмотром
  async getInspectionDataByCar(carId: string): Promise<CarDataEntry[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('car_id', carId)
      .eq('data_type', 'inspection')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(item => this.mapToCarData(item));
  }

  private mapToCarData(dbCarData: any): CarDataEntry {
    return {
      id: dbCarData.id,
      fields: dbCarData.fields || [],
      createdAt: dbCarData.createdAt,
      dataType: dbCarData.dataType || 'custom',
      insuranceData: dbCarData.insuranceData,
      inspectionData: dbCarData.inspectionData
    };
  }
}

export const carDataService = new CarDataService();