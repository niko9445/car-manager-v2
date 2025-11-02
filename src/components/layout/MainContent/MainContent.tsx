import React, { useState } from 'react';
import MaintenanceSection from '../../features/MaintenanceSection/MaintenanceSection';
import CarDataSection from '../../features/CarDataSection/CarDataSection';
import ExpenseTracker from '../../expenses/ExpenseTracker/ExpenseTracker';
import EditMaintenanceModal from '../../modals/EditMaintenanceModal/EditMaintenanceModal';
import { MainContentProps, Maintenance} from '../../../types';

const MainContent: React.FC<MainContentProps> = ({ 
  selectedCar, 
  cars, 
  setCars, 
  activeSection, 
  setActiveSection,
  onAddMaintenance,
  onAddCarData,
  onDeleteMaintenance,
  onDeleteCarData,
  onEditCarData,
  onEditCar,
  isMobile = false,
  onOpenSidebar
}) => {
  const [editingMaintenance, setEditingMaintenance] = useState<Maintenance | null>(null);
  const [isEditMaintenanceModalOpen, setIsEditMaintenanceModalOpen] = useState(false);

  const handleEditMaintenance = (maintenance: Maintenance): void => {
    setIsEditMaintenanceModalOpen(false);
    setEditingMaintenance(null);
    
    setTimeout(() => {
      setEditingMaintenance(maintenance);
      setIsEditMaintenanceModalOpen(true);
    }, 10);
  };

  const handleSaveMaintenance = (maintenanceId: string, updatedData: Partial<Maintenance>): void => {
    if (!selectedCar) return;

    const updatedCars = cars.map(car => {
      if (car.id === selectedCar.id) {
        const updatedMaintenance = car.maintenance?.map(m => 
          m.id === maintenanceId ? { ...m, ...updatedData } : m
        );
        return { ...car, maintenance: updatedMaintenance };
      }
      return car;
    });
    setCars(updatedCars);
    setIsEditMaintenanceModalOpen(false);
    setEditingMaintenance(null);
  };

  if (!selectedCar) {
    return (
      <div className="main-content__welcome-screen">
        <div className="welcome-container">
          {/* Основной контент */}
          <div className="welcome-content">
            <div className="welcome-icon">
              <svg viewBox="0 0 64 64" fill="none" width="48" height="48">
                <path 
                  d="M48 16H16C12.6863 16 10 18.6863 10 22V42C10 45.3137 12.6863 48 16 48H48C51.3137 48 54 45.3137 54 42V22C54 18.6863 51.3137 16 48 16Z" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                />
                <path 
                  d="M10 32H54" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                />
                <circle 
                  cx="18" 
                  cy="42" 
                  r="2" 
                  fill="currentColor"
                />
                <circle 
                  cx="46" 
                  cy="42" 
                  r="2" 
                  fill="currentColor"
                />
              </svg>
            </div>
            
            <h1 className="welcome-title">
              Car Manager
            </h1>
            
            <p className="welcome-subtitle">
              Управляйте вашими автомобилями
            </p>

            {/* Призыв к действию */}
            <div className="welcome-action">
              {isMobile ? (
                <button 
                  className="btn btn--primary welcome-btn"
                  onClick={onOpenSidebar}
                  type="button"
                >
                  <svg className="btn__icon" viewBox="0 0 24 24" fill="none" width="16" height="16">
                    <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Выбрать автомобиль
                </button>
              ) : (
                <div className="welcome-hint">
                  <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                    <path d="M14 5l7 7m0 0l-7 7m7-7H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span>Выберите автомобиль из списка слева</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'maintenance':
        return (
          <MaintenanceSection 
            car={selectedCar}
            cars={cars}
            setCars={setCars}
            onAddMaintenance={onAddMaintenance}
            onDeleteMaintenance={onDeleteMaintenance}
            onEditMaintenance={handleEditMaintenance}
          />
        );
      
      case 'carData':
        return (
          <CarDataSection 
            car={selectedCar}
            cars={cars}
            setCars={setCars}
            onAddCarData={onAddCarData}
            onDeleteCarData={onDeleteCarData}
            onEditCarData={onEditCarData}
            onEditCar={onEditCar}
          />
        );
      
      case 'expenses':
        return <ExpenseTracker />;
      
      default:
        return null;
    }
  };

  return (
    <div className="main-content">
      <div className="main-content__header">
        <div className="main-content__header-top">
          {isMobile && (
            <button 
              className="menu-toggle-compact"
              onClick={onOpenSidebar}
              type="button"
              aria-label="Открыть меню"
            >
              <span className="menu-toggle-compact__line"></span>
              <span className="menu-toggle-compact__line"></span>
              <span className="menu-toggle-compact__line"></span>
            </button>
          )}
          <h1 className="main-content__title">
            {selectedCar.brand} {selectedCar.model}
            {selectedCar.year && (
              <span className="car-year-badge">{selectedCar.year}</span>
            )}
          </h1>
        </div>
        
        <div className="main-content__tabs">
          <button
            className={`btn btn--secondary btn--sm ${activeSection === 'maintenance' ? 'btn--primary' : ''}`}
            onClick={() => setActiveSection('maintenance')}
            type="button"
          >
            <svg className="btn__icon" viewBox="0 0 24 24" fill="none" width="14" height="14">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2"/>
            </svg>
            ТО
          </button>
          
          <button
            className={`btn btn--secondary btn--sm ${activeSection === 'carData' ? 'btn--primary' : ''}`}
            onClick={() => setActiveSection('carData')}
            type="button"
          >
            <svg className="btn__icon" viewBox="0 0 24 24" fill="none" width="14" height="14">
              <path d="M12 11a5 5 0 0 1 5 5v6H7v-6a5 5 0 0 1 5-5z" stroke="currentColor" strokeWidth="2"/>
              <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Данные
          </button>

          <button
            className={`btn btn--secondary btn--sm ${activeSection === 'expenses' ? 'btn--primary' : ''}`}
            onClick={() => setActiveSection('expenses')}
            type="button"
          >
            <svg className="btn__icon" viewBox="0 0 24 24" fill="none" width="14" height="14">
              <path d="M12 1v22M5 6h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="2"/>
              <path d="M17 10h.01M7 10h.01" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Расходы
          </button>
        </div>
      </div>

      <div className="main-content__content">
        {renderSection()}
      </div>

      {isEditMaintenanceModalOpen && editingMaintenance && (
        <EditMaintenanceModal
          maintenance={editingMaintenance}
          onClose={() => {
            setIsEditMaintenanceModalOpen(false);
            setEditingMaintenance(null);
          }}
          onSave={handleSaveMaintenance}
        />
      )}
    </div>
  );
};

export default MainContent;