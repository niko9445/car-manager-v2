// hooks/useCarData.ts
import { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { maintenanceService } from '../services/database/maintenance';
import { expenseService } from '../services/database/expenses';

export const useCarData = () => {
  const { state, dispatch } = useApp();
  const { cars, selectedCar } = state;

  useEffect(() => {
    if (!selectedCar) {
      console.log('🟡 [useCarData] Нет выбранного автомобиля');
      return;
    }

    console.log('🟡 [useCarData] EFFECT - selectedCar changed', { 
      selectedCarId: selectedCar?.id
    });

    const loadCarRelatedData = async () => {
      try {
        console.log('🔄 [useCarData] Загрузка данных для автомобиля:', selectedCar.brand);
        
        const currentCar = cars.find(car => car.id === selectedCar.id);
        if (!currentCar) {
          console.error('🔴 [useCarData] Автомобиль не найден в состоянии');
          return;
        }

        const existingCarData = currentCar.carData || [];
        const existingArticles = currentCar.articles || [];
        
        console.log('🟡 [useCarData] Сохраняем существующие данные:', {
          carData: existingCarData.length,
          articles: existingArticles.length
        });
        
        const maintenanceData = await maintenanceService.getMaintenanceByCar(selectedCar.id);
        console.log('🟡 [useCarData] Загружены maintenance:', maintenanceData.length);
        
        const expensesData = await expenseService.getExpensesByCar(selectedCar.id);
        console.log('🟡 [useCarData] Загружены expenses:', expensesData.length);

        // 🔴 ИСПРАВЛЕНО: Убираем проверку или делаем ее "умной"
        // Временное решение - всегда обновляем данные при смене автомобиля
        // if (maintenanceData.length === currentMaintenanceCount && 
        //     expensesData.length === currentExpensesCount) {
        //   console.log('⏹️ [useCarData] Данные не изменились, пропускаем обновление');
        //   return;
        // }

        const updatedCars = cars.map(car => {
          if (car.id === selectedCar.id) {
            const updatedCar = {
              ...car,
              maintenance: maintenanceData,
              expenses: expensesData,
              carData: existingCarData,
              articles: existingArticles
            };
            console.log('🟡 [useCarData] Обновленный автомобиль:', {
              id: updatedCar.id,
              maintenance: updatedCar.maintenance?.length,
              carData: updatedCar.carData?.length,
              articles: updatedCar.articles?.length
            });
            return updatedCar;
          }
          return car;
        });

        console.log('🟢 [useCarData] Диспатч SET_CARS с обновленными данными');
        dispatch({ type: 'SET_CARS', payload: updatedCars });
        
      } catch (error) {
        console.error('🔴 [useCarData] Ошибка загрузки данных автомобиля:', error);
      }
    };

    loadCarRelatedData();
  }, [selectedCar?.id, dispatch]); // 🔴 УБЕДИСЬ, что cars НЕ в зависимостях!

  return null;
};