import { useCallback } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { Car, Maintenance, CarDataEntry, AppModalType } from '../types';

export const useModalHandlers = (
  cars: Car[], 
  setCars: (cars: Car[]) => void, 
  selectedCar: Car | null, 
  openModal: (type: AppModalType, data?: any) => void, 
  closeModal: () => void
) => {
  const { t } = useTranslation();

  // Удаление автомобиля
  const handleDeleteCar = useCallback((car: Car) => {
    openModal('confirmDelete', { 
      type: 'delete', 
      title: t('confirmations.deleteCar'),
      message: t('confirmations.deleteCarMessage', {
        brand: car.brand,
        model: car.model
      }),
      onConfirm: () => {
        const updatedCars = cars.filter(c => c.id !== car.id);
        setCars(updatedCars);
        closeModal();
      }
    });
  }, [cars, setCars, openModal, closeModal, t]);

  // Удаление ТО
  const handleDeleteMaintenance = useCallback((maintenance: Maintenance) => {
    if (!selectedCar) return;
    
    openModal('confirmDelete', { 
      type: 'delete', 
      title: t('confirmations.deleteMaintenance'),
      message: t('confirmations.deleteMaintenanceMessage', {
        date: new Date(maintenance.createdAt).toLocaleDateString('ru-RU')
      }),
      onConfirm: () => {
        const updatedCars = cars.map(car => {
          if (car.id === selectedCar.id) {
            return {
              ...car,
              maintenance: (car.maintenance || []).filter(m => m.id !== maintenance.id)
            };
          }
          return car;
        });
        setCars(updatedCars);
        closeModal();
      }
    });
  }, [cars, setCars, selectedCar, openModal, closeModal, t]);

  // Удаление данных автомобиля
  const handleDeleteCarData = useCallback((data: CarDataEntry) => {
    if (!selectedCar) return;
    
    openModal('confirmDelete', { 
      type: 'delete', 
      title: t('confirmations.deleteTitle'),
      message: t('confirmations.deleteMessage'),
      onConfirm: () => {
        const updatedCars = cars.map(car => {
          if (car.id === selectedCar.id) {
            return {
              ...car,
              carData: (car.carData || []).filter(d => d.id !== data.id)
            };
          }
          return car;
        });
        setCars(updatedCars);
        closeModal();
      }
    });
  }, [cars, setCars, selectedCar, openModal, closeModal, t]);

  return {
    handleDeleteCar,
    handleDeleteMaintenance,
    handleDeleteCarData
  };
};