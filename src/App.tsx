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

  useSupabaseData();
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
    try {
      const updatedCar = await carService.updateCar(carId, carData);
      const updatedCars = cars.map(car => 
        car.id === carId ? updatedCar : car
      );
      dispatch({ type: 'SET_CARS', payload: updatedCars });
      
      if (selectedCar?.id === carId) {
        dispatch({ type: 'SET_SELECTED_CAR', payload: updatedCar });
      }
      closeModal();
    } catch (error) {
      console.error('❌ Ошибка обновления автомобиля:', error);
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
    
    try {
      const newMaintenance = await maintenanceService.createMaintenance(
        maintenanceData, 
        selectedCar.id
      );
      
      // Обновляем автомобиль в состоянии
      const updatedCars = cars.map(car => {
        if (car.id === selectedCar.id) {
          return {
            ...car,
            maintenance: [...(car.maintenance || []), newMaintenance]
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
    
    try {
      // Сохраняем в базу данных
      const newCarData = await carDataService.createCarData(selectedCar.id, {
        fields: carData.fields,
        dataType: 'custom'
      });
      
      console.log('✅ CarData добавлены в БД');
      
      // НЕ обновляем локальное состояние - useSupabaseData сделает это автоматически
      closeModal();
      
    } catch (error) {
      console.error('❌ Ошибка добавления данных автомобиля:', error);
    }
  };

  const handleEditCarDataInEdit = async (carId: string, dataId: string, updatedData: { fields: CarDataField[] }) => {
    try {
      console.log('🔄 Обновление CarData:', dataId);
      
      // 1. Обновляем в базе данных
      await carDataService.updateCarData(dataId, {
        fields: updatedData.fields
      });
      
      // 2. Обновляем локальное состояние
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
      
      dispatch({ type: 'SET_CARS', payload: updatedCars });
      console.log('✅ CarData обновлены в БД и состоянии');
      
    } catch (error) {
      console.error('❌ Ошибка обновления CarData:', error);
    }
  };

  const handleDeleteCarDataInEdit = async (carId: string, dataId: string) => {
    try {
      console.log('🔄 Удаление CarData:', dataId);
      
      // 1. Удаляем из базы данных
      await carDataService.deleteCarData(dataId);
      
      // 2. Обновляем локальное состояние
      const updatedCars = cars.map(car => {
        if (car.id === carId) {
          return {
            ...car,
            carData: car.carData.filter(item => item.id !== dataId)
          };
        }
        return car;
      });
      
      dispatch({ type: 'SET_CARS', payload: updatedCars });
      console.log('✅ CarData удалены из БД и состояния');
      
    } catch (error) {
      console.error('❌ Ошибка удаления CarData:', error);
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
          onSave={handleAddCarData}
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
          onSave={handleEditCarData} // Используем совместимую функцию
          onDelete={handleDeleteCarData} // Используем совместимую функцию
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