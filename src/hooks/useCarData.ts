// hooks/useCarData.ts
import { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { maintenanceService } from '../services/database/maintenance';
import { expenseService } from '../services/database/expenses';

export const useCarData = () => {
  const { state, dispatch } = useApp();
  const { cars, selectedCar } = state;

  // Загружаем связанные данные при выборе автомобиля
  useEffect(() => {
    const loadCarRelatedData = async () => {
      if (!selectedCar) return;

      try {
        console.log('🔄 Загрузка данных для автомобиля:', selectedCar.brand);
        
        // Загружаем ТО
        const maintenanceData = await maintenanceService.getMaintenanceByCar(selectedCar.id);
        
        // Загружаем расходы
        const expensesData = await expenseService.getExpensesByCar(selectedCar.id);

        // Обновляем автомобиль с загруженными данными
        const updatedCars = cars.map(car => {
          if (car.id === selectedCar.id) {
            return {
              ...car,
              maintenance: maintenanceData,
              // expenses: expensesData // раскомментируй когда добавишь expenses в тип Car
            };
          }
          return car;
        });

        dispatch({ type: 'SET_CARS', payload: updatedCars });
        
      } catch (error) {
        console.error('❌ Ошибка загрузки данных автомобиля:', error);
      }
    };

    loadCarRelatedData();
  }, [selectedCar?.id]); // Загружаем при смене автомобиля

  return null;
};