// hooks/useSupabaseData.ts
import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { carService } from '../services/database/cars';
import { articleService } from '../services/database/articles';
import { carDataService } from '../services/database/carData';

export const useSupabaseData = () => {
  const { user } = useAuth();
  const { dispatch, state } = useApp();
  const loadingRef = useRef(false);
  const isEditingRef = useRef(false);

  useEffect(() => {
    console.log('🟡 [useSupabaseData] EFFECT TRIGGERED', { 
      user: user?.email,
      loadingRef: loadingRef.current,
      isEditing: isEditingRef.current 
    });

    if (isEditingRef.current) {
      console.log('⏸️ [useSupabaseData] Пропускаем загрузку — идет редактирование');
      return;
    }

    const loadUserData = async () => {
      if (loadingRef.current) {
        console.log('⏳ [useSupabaseData] Загрузка уже выполняется, пропускаем...');
        return;
      }

      if (!user) {
        console.log('🟡 [useSupabaseData] Нет пользователя, очищаем cars');
        dispatch({ type: 'SET_CARS', payload: [] });
        return;
      }

      try {
        loadingRef.current = true;
        console.log('🔄 [useSupabaseData] Загрузка данных пользователя из Supabase...');
        
        const userCars = await carService.getUserCars(user.id);
        console.log('🟡 [useSupabaseData] Загружены автомобили:', userCars.length);
        
        const carsWithRelatedData = await Promise.all(
          userCars.map(async (car) => {
            try {
              console.log('🟡 [useSupabaseData] Загрузка данных для авто:', car.id);
              
              const [articles, carData] = await Promise.all([
                articleService.getArticlesByCar(car.id),
                carDataService.getCarDataByCar(car.id)
              ]);
              
              console.log('🟢 [useSupabaseData] Данные загружены для авто:', {
                carId: car.id,
                articles: articles.length,
                carData: carData.length
              });

              // 🔴 ИСПРАВЛЕНИЕ: Берем текущее состояние автомобиля для сохранения maintenance и expenses
              const currentCars = state.cars; // 🔴 БЕЗ ЗАВИСИМОСТЕЙ - берем текущее значение
              const existingCar = currentCars.find(c => c.id === car.id);
              
              return {
                ...car,
                articles,
                carData,
                // 🔴 СОХРАНЯЕМ СУЩЕСТВУЮЩИЕ ДАННЫЕ ИЗ ТЕКУЩЕГО СОСТОЯНИЯ
                maintenance: existingCar?.maintenance || [],
                expenses: existingCar?.expenses || []
              };
            } catch (error) {
              console.error(`🔴 [useSupabaseData] Ошибка загрузки данных для автомобиля ${car.id}:`, error);
              
              const currentCars = state.cars;
              const existingCar = currentCars.find(c => c.id === car.id);
              
              return {
                ...car,
                articles: [],
                carData: [],
                maintenance: existingCar?.maintenance || [],
                expenses: existingCar?.expenses || []
              };
            }
          })
        );
        
        console.log('🟢 [useSupabaseData] Все данные загружены, диспатч SET_CARS', {
          carsCount: carsWithRelatedData.length
        });
        
        dispatch({ type: 'SET_CARS', payload: carsWithRelatedData });
        
      } catch (error) {
        console.error('🔴 [useSupabaseData] Ошибка загрузки данных из Supabase:', error);
      } finally {
        loadingRef.current = false;
        console.log('🟣 [useSupabaseData] Загрузка завершена');
      }
    };

    loadUserData();
  }, [user, dispatch]); // 🔴 УБИРАЕМ state.cars из зависимостей!
  
  return { isEditingRef };
};