import React, { useState } from 'react';
import MaintenanceSection from '../../features/MaintenanceSection/MaintenanceSection';
import CarDataSection from '../../features/CarDataSection/CarDataSection';
import ExpenseTracker from '../../expenses/ExpenseTracker/ExpenseTracker';
import EditMaintenanceModal from '../../modals/EditMaintenanceModal/EditMaintenanceModal';
import { MainContentProps, Maintenance} from '../../../types';
import './MainContent.css';

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
      <div className="maincontent__empty">
        <div className="maincontent__empty-icon">🚗</div>
        <h3 className="maincontent__empty-title">Выберите автомобиль</h3>
        <p className="maincontent__empty-text">
          У вас пока нет выбранного автомобиля. Выберите авто из списка или добавьте новый.
        </p>
        {isMobile ? (
          <button 
            className="maincontent__empty-button"
            onClick={onOpenSidebar}
            type="button"
          >
            <span className="maincontent__empty-button-icon">📋</span>
            Открыть список авто
          </button>
        ) : (
          <p className="maincontent__empty-text" style={{color: '#60a5fa', fontSize: '14px'}}>
            Выберите автомобиль из списка слева ↓
          </p>
        )}
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
    <div className="maincontent__container">
      <div className="maincontent__header">
        <div className="maincontent__header-top">
          {isMobile && (
            <button 
              className="maincontent__menu-toggle"
              onClick={onOpenSidebar}
              type="button"
              aria-label="Открыть меню"
            >
              ☰
            </button>
          )}
          <h1 className="maincontent__title">
            {selectedCar.brand} {selectedCar.model} ({selectedCar.year})
          </h1>
        </div>
        
        <div className="maincontent__tabs">
          <button
            className={`maincontent__tab ${activeSection === 'maintenance' ? 'maincontent__tab--active' : ''}`}
            onClick={() => setActiveSection('maintenance')}
            type="button"
          >
            <svg className="maincontent__tab-icon" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Техническое обслуживание
          </button>
          
          <button
            className={`maincontent__tab ${activeSection === 'carData' ? 'maincontent__tab--active' : ''}`}
            onClick={() => setActiveSection('carData')}
            type="button"
          >
            <svg className="maincontent__tab-icon" viewBox="0 0 24 24" fill="none">
              <path d="M12 11a5 5 0 0 1 5 5v6H7v-6a5 5 0 0 1 5-5z" stroke="currentColor" strokeWidth="2"/>
              <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Данные об авто
          </button>

          {/* НОВАЯ ВКЛАДКА РАСХОДОВ */}
          <button
            className={`maincontent__tab ${activeSection === 'expenses' ? 'maincontent__tab--active' : ''}`}
            onClick={() => setActiveSection('expenses')}
            type="button"
          >
            <svg className="maincontent__tab-icon" viewBox="0 0 24 24" fill="none">
              <path d="M12 1v22M5 6h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="2"/>
              <path d="M17 10h.01M7 10h.01" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Учет расходов
          </button>
        </div>
      </div>

      <div className="maincontent__content">
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