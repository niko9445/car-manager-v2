import React, { useState, useEffect } from 'react';
import { AppProvider } from './contexts/AppContext';
import Sidebar from './components/layout/Sidebar/Sidebar';
import MainContent from './components/layout/MainContent/MainContent';
import AddCarModal from './components/modals/AddCarModal/AddCarModal';
import EditCarModal from './components/modals/EditCarModal/EditCarModal';
import AddMaintenanceModal from './components/modals/AddMaintenanceModal/AddMaintenanceModal';
import AddCarDataModal from './components/modals/AddCarDataModal/AddCarDataModal';
import ConfirmModal from './components/ui/ConfirmModal/ConfirmModal';
import EditCarDataModal from './components/modals/EditCarDataModal/EditCarDataModal';
import { useLocalStorage } from './hooks/useLocalStorage';
import { 
  Car, 
  AppModalType, 
  Maintenance, 
  CarDataEntry, 
  CarFormData, 
  MaintenanceFormData,
  ConfirmType,
  ModalData,
  CarDataFormData,
  CarDataField 
} from './types';
import './styles/globals.css';

const AppContent = () => {
  const [cars, setCars] = useLocalStorage<Car[]>('cars', []);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [activeSection, setActiveSection] = useState<'maintenance' | 'carData'>('maintenance');
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Состояния для модальных окон
  const [activeModal, setActiveModal] = useState<AppModalType | null>(null);
  const [modalData, setModalData] = useState<ModalData>(null);

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Функции для модальных окон
  const openModal = (modalType: AppModalType, data?: ModalData) => {
    setActiveModal(modalType);
    setModalData(data || null);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalData(null);
  };

  // Функции для автомобилей
  const handleAddCar = (carData: CarFormData) => {
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
    closeModal();
  };

  const handleEditCar = (carId: string, carData: CarFormData) => {
    const updatedCars = cars.map(car => 
      car.id === carId ? { ...car, ...carData } : car
    );
    setCars(updatedCars);
    closeModal();
  };

  const handleDeleteCar = (car: Car) => {
    openModal('confirmDelete', { 
      type: 'delete' as ConfirmType, 
      title: 'Удалить автомобиль',
      message: `Вы уверены, что хотите удалить автомобиль "${car.brand} ${car.model}"?`,
      onConfirm: () => {
        const updatedCars = cars.filter(c => c.id !== car.id);
        setCars(updatedCars);
        if (selectedCar?.id === car.id) {
          setSelectedCar(null);
        }
        closeModal();
      }
    });
  };

  // Функции для ТО
  const handleAddMaintenance = (maintenanceData: MaintenanceFormData) => {
    if (!selectedCar) return;
    
    const updatedCars = cars.map(car => {
      if (car.id === selectedCar.id) {
        const newMaintenance: Maintenance = {
          id: Date.now().toString(),
          mileage: maintenanceData.mileage,
          cost: maintenanceData.cost ?? null,
          oilChangeStep: maintenanceData.oilChangeStep,
          filterChangeStep: maintenanceData.filterChangeStep,
          additionalItems: maintenanceData.additionalItems,
          createdAt: new Date().toISOString()
        };
        return {
          ...car,
          maintenance: [...(car.maintenance || []), newMaintenance]
        };
      }
      return car;
    });
    setCars(updatedCars);
    closeModal();
  };

  // Функции для данных авто
  const handleAddCarData = (carData: CarDataFormData) => {
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
    closeModal();
  };

  const handleEditCarDataInEdit = (carId: string, dataId: string, updatedData: { fields: CarDataField[] }) => {
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
  };

  // Функция для удаления дополнительных данных в EditCarModal
  const handleDeleteCarDataInEdit = (carId: string, dataId: string) => {
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
  };

  // Функции для удаления
  const handleDeleteMaintenance = (maintenance: Maintenance) => {
    if (!selectedCar) return;
    
    openModal('confirmDelete', { 
      type: 'delete' as ConfirmType, 
      title: 'Удалить запись ТО',
      message: `Вы уверены, что хотите удалить запись ТО от ${new Date(maintenance.createdAt).toLocaleDateString('ru-RU')}?`,
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
  };

  const handleDeleteCarData = (data: CarDataEntry) => {
    if (!selectedCar) return;
    
    openModal('confirmDelete', { 
      type: 'delete' as ConfirmType, 
      title: 'Удалить данные',
      message: `Вы уверены, что хотите удалить эти данные?`,
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
  };

  // Получение дополнительных данных для автомобиля
  const getCarDataEntries = (carId: string): CarDataEntry[] => {
    const car = cars.find(c => c.id === carId);
    return car?.carData || [];
  };

  return (
    <>
      <div className="app">

        {/* Оверлей для мобильных */}
          {isMobile && sidebarOpen && (
            <div
              className="sidebar-overlay"
              onClick={() => setSidebarOpen(false)}
            />
          )}


        {/* Сайдбар */}
          <div
            className={`sidebar-wrapper ${
              sidebarOpen ? 'sidebar-wrapper--open' : 'sidebar-wrapper--closed'
            }`}
          >
            <Sidebar
              cars={cars}
              selectedCar={selectedCar}
              setSelectedCar={setSelectedCar}
              isMobile={isMobile}
              onClose={() => setSidebarOpen(false)}
              onAddCar={() => openModal('addCar')}
              onDeleteCar={handleDeleteCar}
            />
          </div>



        <div className="app__main">
          <MainContent 
            selectedCar={selectedCar}
            cars={cars}
            setCars={setCars}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            onAddMaintenance={() => openModal('addMaintenance')}
            onAddCarData={() => openModal('addCarData')}
            onDeleteMaintenance={handleDeleteMaintenance}
            onDeleteCarData={handleDeleteCarData}
            onEditCarData={(data) => openModal('editCarData', { data })}
            onEditCar={(car) => openModal('editCar', { car })}
            isMobile={isMobile}
            onOpenSidebar={() => setSidebarOpen(true)}
          />
        </div>
      </div>

      {/* Модальные окна */}
      {activeModal === 'addCar' && (
        <AddCarModal
          onClose={closeModal}
          onSave={handleAddCar}
        />
      )}

      {activeModal === 'editCar' && modalData && 'car' in modalData && (
        <EditCarModal
          car={modalData.car}
          carDataEntries={getCarDataEntries(modalData.car.id)}
          onClose={closeModal}
          onSave={handleEditCar}
          onEditCarData={handleEditCarDataInEdit}
          onDeleteCarData={handleDeleteCarDataInEdit}
        />
      )}

      {activeModal === 'addMaintenance' && selectedCar && (
        <AddMaintenanceModal
          onClose={closeModal}
          onSave={handleAddMaintenance}
        />
      )}

      {activeModal === 'addCarData' && selectedCar && (
        <AddCarDataModal
          onClose={closeModal}
          onSave={handleAddCarData}
        />
      )}

      {activeModal === 'confirmDelete' && modalData && 'onConfirm' in modalData && (
        <ConfirmModal
          isOpen={true}
          onClose={closeModal}
          onConfirm={modalData.onConfirm}
          type={modalData.type}
          title={modalData.title}
          message={modalData.message}
        />
      )}

      {activeModal === 'editCarData' && modalData && 'data' in modalData && (
        <EditCarDataModal
          data={modalData.data}
          onClose={closeModal}
          onSave={(dataId, updatedData) => {
            if (!selectedCar) return;
            const updatedCars = cars.map(car => {
              if (car.id === selectedCar.id) {
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
            closeModal();
          }}
        />
      )}
    </>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;