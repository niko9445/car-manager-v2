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
  const loadingRef = useRef(false); // Защита от множественных вызовов

  useEffect(() => {
    const loadUserData = async () => {
      if (loadingRef.current) {
        console.log('⏳ Загрузка уже выполняется, пропускаем...');
        return;
      }

      if (!user) {
        dispatch({ type: 'SET_CARS', payload: [] });
        return;
      }

      try {
        loadingRef.current = true;
        console.log('🔄 Загрузка данных пользователя из Supabase...');
        
        const userCars = await carService.getUserCars(user.id);
        
        // Загружаем связанные данные для каждого автомобиля
        const carsWithRelatedData = await Promise.all(
          userCars.map(async (car) => {
            try {
              const [articles, carData] = await Promise.all([
                articleService.getArticlesByCar(car.id),
                carDataService.getCarDataByCar(car.id)
              ]);
              
              return {
                ...car,
                articles,
                carData
              };
            } catch (error) {
              console.error(`❌ Ошибка загрузки данных для автомобиля ${car.id}:`, error);
              return {
                ...car,
                articles: [],
                carData: []
              };
            }
          })
        );
        
        dispatch({ type: 'SET_CARS', payload: carsWithRelatedData });
        console.log('✅ Данные загружены из Supabase:', carsWithRelatedData.length, 'автомобилей');
        
      } catch (error) {
        console.error('❌ Ошибка загрузки данных из Supabase:', error);
      } finally {
        loadingRef.current = false;
      }
    };

    loadUserData();
  }, [user, dispatch]); // Убрать state.cars из зависимостей
};