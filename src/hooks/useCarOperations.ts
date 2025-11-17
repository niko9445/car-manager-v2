import { useCallback } from 'react';
import { Car, CarFormData, MaintenanceFormData, CarDataField, CarDataEntry } from '../types';

export const useCarOperations = (cars: Car[], setCars: (cars: Car[]) => void) => {
  // Добавление автомобиля
  const addCar = useCallback((carData: CarFormData) => {
    const newCar: Car = {
      id: Date.now().toString(),
      brand: carData.brand,
      model: carData.model,
      year: carData.year,
      engineType: carData.engineType,
      transmission: carData.transmission,
      vin: carData.vin,
      maintenance: [],
      carData: []
    };
    setCars([...cars, newCar]);
  }, [cars, setCars]);

  // Редактирование автомобиля
  const editCar = useCallback((carId: string, carData: CarFormData) => {
    const updatedCars = cars.map(car => 
      car.id === carId ? { ...car, ...carData } : car
    );
    setCars(updatedCars);
  }, [cars, setCars]);

  // Добавление ТО
  const addMaintenance = useCallback((selectedCar: Car | null, maintenanceData: MaintenanceFormData) => {
    if (!selectedCar) return;
    
    const updatedCars = cars.map(car => {
      if (car.id === selectedCar.id) {
        const newMaintenance = {
          id: Date.now().toString(),
          carId: selectedCar.id,
          date: maintenanceData.date,
          mileage: maintenanceData.mileage,
          cost: maintenanceData.cost ?? null,
          createdAt: new Date().toISOString(),
          categoryId: maintenanceData.categoryId,
          subcategoryId: maintenanceData.subcategoryId,
          customFields: maintenanceData.customFields
        };
        return {
          ...car,
          maintenance: [...(car.maintenance || []), newMaintenance]
        };
      }
      return car;
    });
    setCars(updatedCars);
  }, [cars, setCars]);

  // Добавление данных автомобиля
  const addCarData = useCallback((selectedCar: Car | null, carData: { fields: CarDataField[] }) => {
    if (!selectedCar) return;
    
    const updatedCars = cars.map(car => {
      if (car.id === selectedCar.id) {
        const newCarData: CarDataEntry = {
          id: Date.now().toString(),
          fields: carData.fields,
          createdAt: new Date().toISOString()
        };
        return {
          ...car,
          carData: [...(car.carData || []), newCarData]
        };
      }
      return car;
    });
    setCars(updatedCars);
  }, [cars, setCars]);

  // Редактирование данных автомобиля
  const editCarData = useCallback((carId: string, dataId: string, updatedData: { fields: CarDataField[] }) => {
    const updatedCars = cars.map(car => {
      if (car.id === carId) {
        return {
          ...car,
          carData: car.carData.map(item => 
            item.id === dataId 
              ? { ...item, fields: updatedData.fields }
              : item
          )
        };
      }
      return car;
    });
    setCars(updatedCars);
  }, [cars, setCars]);

  // Удаление данных автомобиля
  const deleteCarData = useCallback((carId: string, dataId: string) => {
    const updatedCars = cars.map(car => {
      if (car.id === carId) {
        return {
          ...car,
          carData: car.carData.filter(item => item.id !== dataId)
        };
      }
      return car;
    });
    setCars(updatedCars);
  }, [cars, setCars]);

  return {
    addCar,
    editCar,
    addMaintenance,
    addCarData,
    editCarData,
    deleteCarData
  };
};