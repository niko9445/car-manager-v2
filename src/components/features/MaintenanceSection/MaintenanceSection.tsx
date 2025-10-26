import React, { useState } from 'react';
import { MaintenanceSectionProps } from '../../../types';
import MaintenanceCard from './MaintenanceCard';

const MaintenanceSection: React.FC<MaintenanceSectionProps> = ({ 
  car, 
  cars, 
  onAddMaintenance, 
  onDeleteMaintenance, 
  onEditMaintenance 
}) => {
  const currentCar = cars.find(c => c.id === car.id) || car;
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const handleToggleActive = (cardId: string) => {
    setActiveCardId(activeCardId === cardId ? null : cardId);
  };

  return (
    <div className="maintenance-section">
      <div className="section-header">
        <div className="section-title">
          <h2 className="section-title__text">
            Техническое обслуживание
          </h2>
          <div className="section-title__actions">
            <button 
              className="btn btn--primary btn--compact"
              onClick={onAddMaintenance}
              title="Добавить ТО"
              type="button"
            >
              <svg className="btn__icon" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ПРОКРУЧИВАЕМЫЙ КОНТЕНТ */}
      <div className="section-content">
        {currentCar.maintenance && currentCar.maintenance.length > 0 ? (
          <div className="section__list">
            {currentCar.maintenance.map((maintenance, index) => (
              <MaintenanceCard
                key={maintenance.id}
                maintenance={maintenance}
                car={currentCar}
                onDelete={() => onDeleteMaintenance(maintenance)}
                onEdit={() => onEditMaintenance(maintenance)}
                position={index}
                isActive={activeCardId === maintenance.id}
                onToggleActive={() => handleToggleActive(maintenance.id)}
              />
            ))}
          </div>
        ) : (
          <div className="section__empty">
            <div className="section__empty-icon">🔧</div>
            <h3 className="section__empty-text">Нет записей о техническом обслуживании</h3>
            <p className="section__empty-subtext">
              Добавьте первую запись ТО для отслеживания обслуживания автомобиля
            </p>
            <div className="section__empty-actions">
              <button 
                className="btn btn--primary"
                onClick={onAddMaintenance}
              >
                Добавить ТО
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenanceSection;