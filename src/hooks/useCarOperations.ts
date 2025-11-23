import { useCallback } from 'react';
import { Car, CarFormData, MaintenanceFormData, CarDataField, CarDataEntry, Article } from '../types';
import { articleService } from '../services/database/articles'; // <-- ДОБАВИТЬ
import { carDataService } from '../services/database/carData'; // <-- ДОБАВИТЬ если нужно

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
      carData: [],
      articles: []
    };
    setCars([...cars, newCar]);
  }, [cars, setCars]);

  // Редактирование автомобиля
  const editCar = useCallback((carId: string, carData: CarFormData) => {
    const updatedCars = cars.map(car => 
      car.id === carId ? { 
        ...car, 
        ...carData
      } : car
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

  const addArticle = useCallback((articleData: { category: string; subcategory: string; articleNumber: string }) => {
    const newArticle: Article = {
      id: `temp-${Date.now()}`,
      category: articleData.category,
      subcategory: articleData.subcategory,
      articleNumber: articleData.articleNumber,
      createdAt: new Date().toISOString()
    };

    // Возвращаем созданную статью, а не обновляем состояние
    return newArticle;
  }, []);

  // ОБНОВИТЬ: Редактирование артикула
  const editArticle = useCallback((carId: string, articleId: string, updatedData: { category: string; subcategory: string; articleNumber: string }) => {
    const updatedCars = cars.map(car => {
      if (car.id === carId) {
        const updatedArticles = car.articles?.map(article => 
          article.id === articleId 
            ? { ...article, ...updatedData }
            : article
        ) || [];
        return { 
          ...car, 
          articles: updatedArticles 
        };
      }
      return car;
    });
    setCars(updatedCars);
  }, [cars, setCars]);

  // ОБНОВИТЬ: Удаление артикула
  const deleteArticle = useCallback((carId: string, articleId: string) => {
    const updatedCars = cars.map(car => {
      if (car.id === carId) {
        return {
          ...car,
          articles: car.articles?.filter(article => article.id !== articleId) || []
        };
      }
      return car;
    });
    setCars(updatedCars);
  }, [cars, setCars]);

  // ДОБАВИТЬ: Функция для обновления статьи после сохранения в Supabase
  const updateArticleAfterSupabase = useCallback((carId: string, tempArticleId: string, realArticle: Article) => {
    const updatedCars = cars.map(car => {
      if (car.id === carId) {
        const updatedArticles = car.articles?.map(article => 
          article.id === tempArticleId ? realArticle : article
        ) || [realArticle];
        return { 
          ...car, 
          articles: updatedArticles 
        };
      }
      return car;
    });
    setCars(updatedCars);
  }, [cars, setCars]);

  const addArticleToLocalState = useCallback((carId: string, article: Article) => {
    const updatedCars = cars.map(car => {
      if (car.id === carId) {
        return {
          ...car,
          articles: [...(car.articles || []), article]
        };
      }
      return car;
    });
    setCars(updatedCars);
  }, [cars, setCars]);

  // ДОБАВИТЬ: Функция для замены временной статьи на реальную
  const replaceTempArticle = useCallback((carId: string, tempArticleId: string, realArticle: Article) => {
    const updatedCars = cars.map(car => {
      if (car.id === carId) {
        const updatedArticles = car.articles?.map(article => 
          article.id === tempArticleId ? realArticle : article
        ) || [realArticle];
        return { 
          ...car, 
          articles: updatedArticles 
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
    deleteCarData,
    addArticle, // Теперь возвращает статью, а не обновляет состояние
    editArticle,
    deleteArticle,
    addArticleToLocalState, // Новая функция
    replaceTempArticle // Новая функция
  };
};