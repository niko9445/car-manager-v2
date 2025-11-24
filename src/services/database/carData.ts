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
    console.log('🟡 [CarDataService] createCarData START', { 
      carId, 
      data,
      tableName: this.tableName 
    });

    try {
      const carData = await this.create({
        ...data,
        carId
      });

      console.log('🟢 [CarDataService] createCarData SUCCESS', { 
        createdId: carData.id,
        carData 
      });

      return this.mapToCarData(carData);
    } catch (error) {
      console.error('🔴 [CarDataService] createCarData ERROR', error);
      throw error;
    }
  }

  async getCarDataByCar(carId: string): Promise<CarDataEntry[]> {
    console.log('🟡 [CarDataService] getCarDataByCar', { carId });

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('car_id', carId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('🔴 [CarDataService] getCarDataByCar ERROR', error);
      throw error;
    }

    console.log('🟢 [CarDataService] getCarDataByCar SUCCESS', { 
      count: data.length,
      data 
    });

    return data.map(item => this.mapToCarData(item));
  }

  async updateCarData(carDataId: string, updates: {
    fields?: CarDataField[];
    insuranceData?: InsuranceData;
    inspectionData?: InspectionData;
  }): Promise<CarDataEntry> {
    console.log('🟡 [CarDataService] updateCarData', { carDataId, updates });

    const updated = await this.update(carDataId, updates);
    
    console.log('🟢 [CarDataService] updateCarData SUCCESS', { updated });
    
    return this.mapToCarData(updated);
  }

  async deleteCarData(carDataId: string): Promise<void> {
    console.log('🟡 [CarDataService] deleteCarData', { carDataId });

    await this.delete(carDataId);
    
    console.log('🟢 [CarDataService] deleteCarData SUCCESS');
  }

  // ... остальные методы без изменений

  private mapToCarData(dbCarData: any): CarDataEntry {
    const result = {
      id: dbCarData.id,
      fields: dbCarData.fields || [],
      createdAt: dbCarData.createdAt,
      dataType: dbCarData.dataType || 'custom',
      insuranceData: dbCarData.insuranceData,
      inspectionData: dbCarData.inspectionData
    };
    
    console.log('🟣 [CarDataService] mapToCarData', { 
      dbCarData, 
      mappedResult: result 
    });
    
    return result;
  }
}

export const carDataService = new CarDataService();