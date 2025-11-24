import React, { useEffect, useCallback, useState } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Sidebar from './components/layout/Sidebar/Sidebar';
import MainContent from './components/layout/MainContent/MainContent';
import AddCarModal from './components/modals/AddCarModal/AddCarModal';
import EditCarModal from './components/modals/EditCarModal/EditCarModal';
import AddMaintenanceModal from './components/modals/AddMaintenanceModal/AddMaintenanceModal';
import AddCarDataModal from './components/modals/AddCarDataModal/AddCarDataModal';
import AddExpenseModal from './components/modals/AddExpenseModal/AddExpenseModal';
import ConfirmModal from './components/ui/ConfirmModal/ConfirmModal';
import EditCarDataModal from './components/modals/EditCarDataModal/EditCarDataModal';
import { LanguageProvider, useTranslation } from './contexts/LanguageContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { MigrationNotification } from './components/auth/MigrationNotification';
import { SyncStatus } from './components/ui/SyncStatus/SyncStatus';
import { maintenanceService } from './services/database/maintenance'; // <-- ДОБАВИТЬ
import { useCarData } from './hooks/useCarData';
import { expenseService } from './services/database/expenses';
import { useDataMigration } from './hooks/useDataMigration';
import { useSupabaseData } from './hooks/useSupabaseData';
import { carDataService } from './services/database/carData'
import { carService } from './services/database/cars'; // <-- ДОБАВИТЬ
import { 
  Car, 
  AppModalType, 
  Maintenance, 
  CarDataEntry, 
  CarFormData,
  ConfirmType,
  ModalData,
  CarDataField,
  MaintenanceFormData, 
  SectionType 
} from './types';
import './styles/globals.css';

const AppContent = () => {
  const { state, dispatch } = useApp();
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  const { selectedCar, activeSection, isMobile, sidebarOpen, modals, modalData, cars } = state;
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isMigrating } = useDataMigration();

  console.log('🟡 [App] RENDER', {
    carsCount: cars.length,
    selectedCarId: selectedCar?.id,
    modalsOpen: Object.keys(modals).filter(key => modals[key as AppModalType]),
    user: user?.email
  });

  const { isEditingRef } = useSupabaseData();
  useCarData();

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      dispatch({ type: 'SET_IS_MOBILE', payload: mobile });
      dispatch({ type: 'SET_SIDEBAR_OPEN', payload: !mobile });
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [dispatch]);

  // Проверка авторизации при загрузке
  useEffect(() => {
    console.log('🔐 Auth state:', { 
      user: user?.email, 
      authLoading, 
      isMigrating 
    });

    // Ждем пока закончится загрузка авторизации И миграция
    if (!authLoading && !isMigrating) {
      if (!user) {
        console.log('🔄 No user found - opening auth modal');
        setShowAuthModal(true);
      } else {
        console.log('✅ User authenticated - closing auth modal');
        setShowAuthModal(false);
      }
    } else {
      console.log('⏳ Waiting for auth/migration to complete...');
    }
  }, [user, authLoading, isMigrating]);

  // Обработчики для Sidebar и MainContent
  const handleSetSelectedCar = useCallback((car: Car) => {
    console.log('🔵 [handleSetSelectedCar]', { 
      carId: car.id, 
      carDataCount: car.carData?.length 
    });
    dispatch({ type: 'SET_SELECTED_CAR', payload: car });
  }, [dispatch]);

  const handleSetActiveSection = useCallback((section: SectionType) => {
    dispatch({ type: 'SET_ACTIVE_SECTION', payload: section });
  }, [dispatch]);

  const handleSetSidebarOpen = useCallback((open: boolean) => {
    dispatch({ type: 'SET_SIDEBAR_OPEN', payload: open });
  }, [dispatch]);

  

  // Обработчик клика вне sidebar для мобильных
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const overlay = document.querySelector('.overlay');
      
      if (isMobile && sidebarOpen && overlay && event.target === overlay) {
        handleSetSidebarOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobile, sidebarOpen, handleSetSidebarOpen]);

  // Функции для модальных окон
  const openModal = (modalType: AppModalType, data?: ModalData) => {
    dispatch({ type: 'OPEN_MODAL', payload: { modalType, data } });
  };

  const closeModal = () => {
    Object.keys(modals).forEach(modalType => {
      if (modals[modalType as AppModalType]) {
        dispatch({ type: 'CLOSE_MODAL', payload: { modalType: modalType as AppModalType } });
      }
    });
  };

  

  // Функции для автомобилей (ОБНОВЛЕННЫЕ)
  const handleAddCar = async (carData: CarFormData) => {
    if (!user) return;

    try {
      const newCar = await carService.createCar(carData, user.id);
      dispatch({ type: 'SET_CARS', payload: [...cars, newCar] });
      closeModal();
    } catch (error) {
      console.error('❌ Ошибка создания автомобиля:', error);
    }
  };

  const handleEditCar = async (carId: string, carData: CarFormData) => {
    console.log('🟡 [handleEditCar] START', { carId, carData });
    
    try {
      // Находим текущий автомобиль
      const currentCar = cars.find(car => car.id === carId);
      if (!currentCar) {
        console.error('🔴 [handleEditCar] Автомобиль не найден');
        return;
      }

      // 🔴 СОХРАНЯЕМ СУЩЕСТВУЮЩИЕ ДАННЫЕ
      const existingCarData = currentCar.carData || [];
      const existingArticles = currentCar.articles || [];
      const existingMaintenance = currentCar.maintenance || [];
      const existingExpenses = currentCar.expenses || [];
      
      console.log('🟡 [handleEditCar] Сохраняем существующие данные:', {
        carData: existingCarData.length,
        articles: existingArticles.length,
        maintenance: existingMaintenance.length,
        expenses: existingExpenses.length
      });

      // Обновляем автомобиль в базе
      const updatedCar = await carService.updateCar(carId, carData);

      // 🔴 СОЗДАЕМ ОБНОВЛЕННЫЙ АВТОМОБИЛЬ СО ВСЕМИ ДАННЫМИ
      const updatedCars = cars.map(car => {
        if (car.id === carId) {
          return {
            ...car,
            ...carData, // основные данные
            // 🔴 ЯВНО СОХРАНЯЕМ ВСЕ СУЩЕСТВУЮЩИЕ ДАННЫЕ
            carData: existingCarData,
            articles: existingArticles,
            maintenance: existingMaintenance,
            expenses: existingExpenses,
            // Сохраняем ID и другие системные поля
            id: car.id
          };
        }
        return car;
      });

      dispatch({ type: 'SET_CARS', payload: updatedCars });
      
      if (selectedCar?.id === carId) {
        dispatch({ type: 'SET_SELECTED_CAR', payload: {
          ...selectedCar,
          ...carData,
          carData: existingCarData,
          articles: existingArticles,
          maintenance: existingMaintenance,
          expenses: existingExpenses
        } });
      }
      
      console.log('🟢 [handleEditCar] Автомобиль обновлен с сохранением данных');
      closeModal();
      
    } catch (error) {
      console.error('🔴 [handleEditCar] Ошибка:', error);
    }
  };



  const handleAddExpense = async (expenseData: any) => {
    if (!selectedCar || !user) return;
    
    try {
      const newExpense = await expenseService.createExpense(
        expenseData, 
        selectedCar.id
      );
      
      // Здесь можно обновить состояние если нужно отображать расходы
      // Пока просто закрываем модалку
      closeModal();
      
      // Можно показать уведомление об успехе
      console.log('✅ Расход добавлен:', newExpense);
    } catch (error) {
      console.error('❌ Ошибка добавления расхода:', error);
    }
  };

  const handleEditExpense = async (expenseId: string, expenseData: any) => {
    try {
      const updatedExpense = await expenseService.updateExpense(expenseId, expenseData);
      console.log('✅ Расход обновлен:', updatedExpense);
      closeModal();
    } catch (error) {
      console.error('❌ Ошибка обновления расхода:', error);
    }
  };

  const handleDeleteExpense = async (expense: any) => {
    openModal('confirmDelete', { 
      type: 'delete' as ConfirmType, 
      title: t('confirmations.deleteExpense'),
      message: t('confirmations.deleteExpenseMessage', {
        amount: expense.amount,
        category: expense.category
      }),
      onConfirm: async () => {
        try {
          await expenseService.deleteExpense(expense.id);
          console.log('✅ Расход удален');
          closeModal();
        } catch (error) {
          console.error('❌ Ошибка удаления расхода:', error);
        }
      }
    });
  };


  const handleDeleteCar = (car: Car) => {
    openModal('confirmDelete', { 
      type: 'delete' as ConfirmType, 
      title: t('confirmations.deleteCar'),
      message: t('confirmations.deleteCarMessage', {
        brand: car.brand,
        model: car.model
      }),
      onConfirm: async () => {
        try {
          await carService.deleteCar(car.id);
          const updatedCars = cars.filter(c => c.id !== car.id);
          dispatch({ type: 'SET_CARS', payload: updatedCars });
          if (selectedCar?.id === car.id) {
            dispatch({ type: 'SET_SELECTED_CAR', payload: null });
          }
          closeModal();
        } catch (error) {
          console.error('❌ Ошибка удаления автомобиля:', error);
        }
      }
    });
  };

  // ВРЕМЕННО оставляем локальные функции для maintenance и carData
  // (позже заменим на Supabase версии)
  const handleAddMaintenance = async (maintenanceData: MaintenanceFormData) => {
    if (!selectedCar || !user) return;
    
    console.log('🔧 [handleAddMaintenance] START', { 
      selectedCarId: selectedCar.id,
      maintenanceData 
    });
    
    try {
      const newMaintenance = await maintenanceService.createMaintenance(
        maintenanceData, 
        selectedCar.id
      );
      
      console.log('🔧 [handleAddMaintenance] Создано в Supabase:', newMaintenance.id);

      const updatedCars = cars.map(car => {
        if (car.id === selectedCar.id) {
          const updatedMaintenance = [...(car.maintenance || []), newMaintenance];
          console.log('🔧 [handleAddMaintenance] Обновленный maintenance:', updatedMaintenance.length);
          return {
            ...car,
            maintenance: updatedMaintenance
          };
        }
        return car;
      });
      
      dispatch({ type: 'SET_CARS', payload: updatedCars });
      closeModal();
    } catch (error) {
      console.error('❌ Ошибка создания ТО:', error);
    }
  };

  const handleAddCarData = async (carData: { fields: CarDataField[] }) => {
    if (!selectedCar || !user) return;

    const tempId = `temp-${Date.now()}`;
    console.log('🟡 [handleAddCarData] START', { 
      selectedCarId: selectedCar.id, 
      tempId,
      carData 
    });

    // Выносим объявление переменной за пределы try-catch
    let updatedCars: Car[] = [];

    try {
      // 🔄 ОПТИМИСТИЧНОЕ ОБНОВЛЕНИЕ
      const tempCarData: CarDataEntry = {
        id: tempId,
        fields: carData.fields,
        dataType: getDataTypeFromFields(carData.fields),
        createdAt: new Date().toISOString()
      };

      console.log('🟡 [handleAddCarData] Оптимистичное обновление', { tempCarData });

      // Сразу обновляем состояние
      updatedCars = cars.map(car => {
        if (car.id === selectedCar.id) {
          const newCarData = [...(car.carData || []), tempCarData];
          console.log('🟡 [handleAddCarData] Новые carData для автомобиля:', newCarData);
          return {
            ...car,
            carData: newCarData
          };
        }
        return car;
      });
      
      dispatch({ type: 'SET_CARS', payload: updatedCars });
      console.log('🟡 [handleAddCarData] Состояние обновлено (оптимистично)');

      // Сохраняем в базу данных
      console.log('🟡 [handleAddCarData] Сохранение в Supabase...');
      const newCarData = await carDataService.createCarData(selectedCar.id, {
        fields: carData.fields,
        dataType: getDataTypeFromFields(carData.fields)
      });

      console.log('🟢 [handleAddCarData] Данные сохранены в Supabase:', newCarData);

      // 🔄 ИСПРАВЛЕНИЕ: Используем обновленное состояние (updatedCars), а не старое (cars)
      const finalCars = updatedCars.map(car => {
        if (car.id === selectedCar.id) {
          const finalCarData = car.carData.map(item => 
            item.id === tempId ? newCarData : item
          );
          console.log('🟡 [handleAddCarData] Финальные carData:', finalCarData);
          return {
            ...car,
            carData: finalCarData
          };
        }
        return car;
      });
      
      dispatch({ type: 'SET_CARS', payload: finalCars });
      console.log('🟢 [handleAddCarData] Состояние обновлено (финально)');

      closeModal();
      
    } catch (error) {
      console.error('🔴 [handleAddCarData] Ошибка:', error);
      
      // 🔄 ОТКАТ ПРИ ОШИБКЕ - используем обновленное состояние
      const rolledBackCars = updatedCars.map((car: Car) => {
        if (car.id === selectedCar.id) {
          const rolledBackCarData = car.carData.filter((item: CarDataEntry) => !item.id.startsWith('temp-'));
          console.log('🟡 [handleAddCarData] Откат carData:', rolledBackCarData);
          return {
            ...car,
            carData: rolledBackCarData
          };
        }
        return car;
      });
      
      dispatch({ type: 'SET_CARS', payload: rolledBackCars });
      console.log('🟡 [handleAddCarData] Состояние откатано');
    }
  };

  // Вспомогательная функция для определения типа данных
  const getDataTypeFromFields = (fields: CarDataField[]): 'insurance' | 'inspection' | 'custom' => {
    const fieldName = fields[0]?.name;
    if (fieldName === 'insurance') return 'insurance';
    if (fieldName === 'inspection') return 'inspection';
    return 'custom';
  };

  const handleEditCarDataInEdit = async (carId: string, dataId: string, updatedData: { fields: CarDataField[] }) => {
    console.log('🟡 [handleEditCarDataInEdit] START', { carId, dataId, updatedData });

    // 🔴 БЛОКИРУЕМ загрузку в useSupabaseData
    isEditingRef.current = true;

    const originalCarData = cars.find(car => car.id === carId)?.carData || [];
    const originalData = originalCarData.find(item => item.id === dataId);

    if (!originalData) {
      console.error('🔴 Не найдены оригинальные данные');
      isEditingRef.current = false; // 🔴 РАЗБЛОКИРУЕМ
      return;
    }

    try {
      // 🔄 ОПТИМИСТИЧНОЕ ОБНОВЛЕНИЕ
      console.log('🟡 [handleEditCarDataInEdit] Оптимистичное обновление');
      
      const updatedCarsOptimistic = cars.map(car => {
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
      
      dispatch({ type: 'SET_CARS', payload: updatedCarsOptimistic });
      console.log('🟡 [handleEditCarDataInEdit] Состояние обновлено (оптимистично)');

      // 1. Обновляем в базе данных
      console.log('🟡 [handleEditCarDataInEdit] Сохранение в Supabase...');
      const updatedCarData = await carDataService.updateCarData(dataId, {
        fields: updatedData.fields
      });
      
      console.log('🟢 [handleEditCarDataInEdit] Данные обновлены в Supabase:', updatedCarData);

      // 🔄 ОБНОВЛЯЕМ СОСТОЯНИЕ С РЕАЛЬНЫМИ ДАННЫМИ
      const finalCars = updatedCarsOptimistic.map(car => {
        if (car.id === carId) {
          return {
            ...car,
            carData: car.carData.map(item => 
              item.id === dataId 
                ? updatedCarData
                : item
            )
          };
        }
        return car;
      });
      
      dispatch({ type: 'SET_CARS', payload: finalCars });
      console.log('🟢 [handleEditCarDataInEdit] Состояние обновлено с реальными данными');
      
    } catch (error) {
      console.error('🔴 [handleEditCarDataInEdit] Ошибка:', error);
      
      // 🔄 ОТКАТ ПРИ ОШИБКЕ
      console.log('🟡 [handleEditCarDataInEdit] Откат изменений');
      const rolledBackCars = cars.map(car => {
        if (car.id === carId) {
          return {
            ...car,
            carData: car.carData.map(item => 
              item.id === dataId 
                ? originalData
                : item
            )
          };
        }
        return car;
      });
      
      dispatch({ type: 'SET_CARS', payload: rolledBackCars });
      console.log('🟡 [handleEditCarDataInEdit] Состояние откатано');
    } finally {
      // 🔴 РАЗБЛОКИРУЕМ загрузку
      isEditingRef.current = false;
      console.log('🟢 [handleEditCarDataInEdit] Блокировка снята');
    }
  };

  const handleDeleteCarDataInEdit = async (carId: string, dataId: string) => {
    console.log('🟡 [handleDeleteCarDataInEdit] START', { 
      carId, 
      dataId 
    });

    // Сохраняем оригинальные данные для отката
    const originalCarData = cars.find(car => car.id === carId)?.carData || [];
    const dataToDelete = originalCarData.find(item => item.id === dataId);

    if (!dataToDelete) {
      console.error('🔴 [handleDeleteCarDataInEdit] Не найдены данные для удаления');
      return;
    }

    try {
      // 🔄 ОПТИМИСТИЧНОЕ ОБНОВЛЕНИЕ
      console.log('🟡 [handleDeleteCarDataInEdit] Оптимистичное удаление');
      
      const updatedCarsOptimistic = cars.map(car => {
        if (car.id === carId) {
          return {
            ...car,
            carData: car.carData.filter(item => item.id !== dataId)
          };
        }
        return car;
      });
      
      dispatch({ type: 'SET_CARS', payload: updatedCarsOptimistic });
      console.log('🟡 [handleDeleteCarDataInEdit] Состояние обновлено (оптимистично)');

      // 1. Удаляем из базы данных
      console.log('🟡 [handleDeleteCarDataInEdit] Удаление из Supabase...');
      await carDataService.deleteCarData(dataId);
      
      console.log('🟢 [handleDeleteCarDataInEdit] Данные удалены из Supabase');
      
    } catch (error) {
      console.error('🔴 [handleDeleteCarDataInEdit] Ошибка:', error);
      
      // 🔄 ОТКАТ ПРИ ОШИБКЕ
      console.log('🟡 [handleDeleteCarDataInEdit] Откат удаления');
      const rolledBackCars = cars.map(car => {
        if (car.id === carId) {
          return {
            ...car,
            carData: originalCarData // Восстанавливаем оригинальный массив
          };
        }
        return car;
      });
      
      dispatch({ type: 'SET_CARS', payload: rolledBackCars });
      console.log('🟡 [handleDeleteCarDataInEdit] Состояние откатано');
    }
  };

  const handleDeleteMaintenance = async (maintenance: Maintenance) => {
    if (!selectedCar) return;
    
    openModal('confirmDelete', { 
      type: 'delete' as ConfirmType, 
      title: t('confirmations.deleteMaintenance'),
      message: t('confirmations.deleteMaintenanceMessage', {
        date: new Date(maintenance.createdAt).toLocaleDateString('ru-RU')
      }),
      onConfirm: async () => {
        try {
          await maintenanceService.deleteMaintenance(maintenance.id);
          
          const updatedCars = cars.map(car => {
            if (car.id === selectedCar.id) {
              return {
                ...car,
                maintenance: (car.maintenance || []).filter(m => m.id !== maintenance.id)
              };
            }
            return car;
          });
          
          dispatch({ type: 'SET_CARS', payload: updatedCars });
          closeModal();
        } catch (error) {
          console.error('❌ Ошибка удаления ТО:', error);
        }
      }
    });
  };

   const handleEditCarData = useCallback((dataId: string, updatedData: { fields: CarDataField[] }) => {
      if (!selectedCar) return;
      handleEditCarDataInEdit(selectedCar.id, dataId, updatedData);
    }, [selectedCar, handleEditCarDataInEdit]);

    const handleDeleteCarData = useCallback((dataId: string) => {
      if (!selectedCar) return;
      handleDeleteCarDataInEdit(selectedCar.id, dataId);
    }, [selectedCar, handleDeleteCarDataInEdit]);

  

  // Получение дополнительных данных для автомобиля
  const getCarDataEntries = (carId: string): CarDataEntry[] => {
    const car = cars.find(c => c.id === carId);
    console.log('🔵 [getCarDataEntries]', { 
      carId, 
      carFound: !!car,
      carDataCount: car?.carData?.length 
    });
    return car?.carData || [];
  };

  // Type guards для modalData
  const isCarModalData = (data: any): data is { car: Car } => {
    return data && 'car' in data;
  };

  const isConfirmModalData = (data: any): data is { 
    type: ConfirmType; 
    title: string; 
    message: string; 
    onConfirm: () => void 
  } => {
    return data && 'type' in data && 'title' in data && 'message' in data && 'onConfirm' in data;
  };

  const isCarDataModalData = (data: any): data is { data: CarDataEntry } => {
    return data && 'data' in data;
  };

  return (
    <>
      <MigrationNotification />
      <AuthModal 
        isOpen={showAuthModal && !isMigrating}
        onClose={() => {
          if (user) {
            setShowAuthModal(false);
          }
        }} 
      />

      <SyncStatus />

      <div className="app">
        {isMobile && sidebarOpen && (
          <div
            className="overlay"
            onClick={() => handleSetSidebarOpen(false)}
          />
        )}

        <Sidebar
          cars={cars}
          selectedCar={selectedCar}
          setSelectedCar={handleSetSelectedCar}
          isMobile={isMobile}
          onClose={() => handleSetSidebarOpen(false)}
          onAddCar={() => openModal('addCar')}
          onDeleteCar={handleDeleteCar}
          className={sidebarOpen ? 'sidebar--open' : ''}
        />

        <MainContent 
          selectedCar={selectedCar}
          cars={cars}
          setCars={(newCars) => dispatch({ type: 'SET_CARS', payload: newCars })}
          activeSection={activeSection}
          setActiveSection={handleSetActiveSection}
          onAddMaintenance={() => openModal('addMaintenance')}
          onAddCarData={() => openModal('addCarData')}
          onDeleteMaintenance={handleDeleteMaintenance}
          onDeleteCarData={(data) => {
            if (!selectedCar) return;
            openModal('confirmDelete', { 
              type: 'delete' as ConfirmType, 
              title: t('confirmations.deleteTitle'),
              message: t('confirmations.deleteMessage'),
              onConfirm: async () => {
                await handleDeleteCarDataInEdit(selectedCar.id, data.id);
              }
            });
          }} // Обновленная функция
          onEditCarData={(data) => openModal('editCarData', { data })}
          onEditCar={(car) => openModal('editCar', { car })}
          isMobile={isMobile}
          onOpenSidebar={() => handleSetSidebarOpen(true)}
        />
      </div>

      {/* Модальные окна */}
      {modals.addCar && (
        <AddCarModal
          onClose={closeModal}
          onSave={handleAddCar as any}
        />
      )}

      {modals.editCar && isCarModalData(modalData) && (
        <EditCarModal
          car={modalData.car}
          carDataEntries={getCarDataEntries(modalData.car.id)}
          onClose={closeModal}
          onSave={handleEditCar}
          onEditCarData={handleEditCarDataInEdit}
          onDeleteCarData={handleDeleteCarDataInEdit}
        />
      )}

      {modals.addMaintenance && selectedCar && (
        <AddMaintenanceModal
          onClose={closeModal}
          onSave={handleAddMaintenance}
        />
      )}

      {modals.addCarData && selectedCar && (
        <AddCarDataModal
          onClose={closeModal}
          onSave={handleAddCarData} // Теперь передаем функцию с оптимистичным обновлением
        />
      )}

      <AddExpenseModal />

      {modals.confirmDelete && isConfirmModalData(modalData) && (
        <ConfirmModal
          isOpen={true}
          onClose={closeModal}
          onConfirm={modalData.onConfirm}
          type={modalData.type}
          title={modalData.title}
          message={modalData.message}
        />
      )}

      {modals.editCarData && isCarDataModalData(modalData) && (
        <EditCarDataModal
          data={modalData.data}
          onClose={closeModal}
          onSave={(dataId, updatedData) => {
            if (!selectedCar) return;
            handleEditCarDataInEdit(selectedCar.id, dataId, updatedData);
          }}
          onDelete={(dataId) => {
            if (!selectedCar) return;
            handleDeleteCarDataInEdit(selectedCar.id, dataId);
          }}
        />
      )}
    </>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppProvider>
            <CurrencyProvider>
              <AppContent />
            </CurrencyProvider>
          </AppProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;