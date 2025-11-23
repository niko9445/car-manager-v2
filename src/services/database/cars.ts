// services/database/cars.ts
import { BaseService } from './baseService';
import { Car, CarFormData } from '../../types';

export class CarService extends BaseService {
  constructor() {
    super('cars');
  }

  async createCar(carData: CarFormData, userId: string): Promise<Car> {
    const car = await this.create({
      ...carData,
      userId
    });

    return this.mapToCar(car);
  }

  async getUserCars(userId: string): Promise<Car[]> {
    const cars = await this.findByUser(userId);
    return cars.map(car => this.mapToCar(car));
  }

  async updateCar(carId: string, carData: Partial<CarFormData>): Promise<Car> {
    const updated = await this.update(carId, carData);
    return this.mapToCar(updated);
  }

  // ДОБАВИТЬ: метод для получения автомобиля по ID
  async getCarById(carId: string): Promise<Car | null> {
    try {
      const car = await this.findById(carId);
      return this.mapToCar(car);
    } catch (error) {
      console.error('❌ Ошибка загрузки автомобиля:', error);
      return null;
    }
  }

  // ДОБАВИТЬ: метод для удаления автомобиля
  async deleteCar(carId: string): Promise<void> {
    await this.delete(carId);
  }

  // ДОБАВИТЬ: вспомогательный метод для преобразования данных
  private mapToCar(dbCar: any): Car {
    return {
      id: dbCar.id,
      brand: dbCar.brand,
      model: dbCar.model,
      year: dbCar.year,
      engineType: dbCar.engineType,
      transmission: dbCar.transmission,
      vin: dbCar.vin || '',
      maintenance: [], // Пока пусто, потом добавим загрузку maintenance
      carData: [],    // Пока пусто, потом добавим загрузку carData
      articles: []    // Пока пусто, потом добавим загрузку articles
    };
  }
}

export const carService = new CarService();