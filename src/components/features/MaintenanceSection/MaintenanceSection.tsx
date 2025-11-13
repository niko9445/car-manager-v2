import React, { useState, useMemo } from 'react';
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
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  // 🔥 СОРТИРОВКА по дате (новые сверху)
  const sortedMaintenance = useMemo(() => {
    if (!currentCar.maintenance) return [];
    
    return [...currentCar.maintenance].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [currentCar.maintenance]);

  const handleToggleCard = (cardId: string) => {
    setExpandedCardId(expandedCardId === cardId ? null : cardId);
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

      <div className="section-content">
        {sortedMaintenance.length > 0 ? (
          <div className="section__list">
            {sortedMaintenance.map((maintenance, index) => (
              <MaintenanceCard
                key={maintenance.id}
                maintenance={maintenance}
                car={currentCar}
                onDelete={() => onDeleteMaintenance(maintenance)}
                onEdit={() => onEditMaintenance(maintenance)}
                position={index}
                isExpanded={expandedCardId === maintenance.id}
                onToggle={() => handleToggleCard(maintenance.id)}
              />
            ))}
          </div>
        ) : (
          <div className="maintenance-welcome">
            <div className="maintenance-welcome__background">
              <div className="maintenance-welcome__grid"></div>
            </div>
            <div className="maintenance-welcome__content">
              <div className="maintenance-welcome__icon">
                <div className="maintenance-welcome__tools">
                  <div className="maintenance-welcome__wrench"></div>
                  <div className="maintenance-welcome__screwdriver"></div>
                </div>
                <div className="maintenance-welcome__gear">⚙️</div>
              </div>
              <div className="maintenance-welcome__text">
                <h3 className="maintenance-welcome__title">Начните вести историю ТО</h3>
                <p className="maintenance-welcome__subtitle">
                  Добавьте первую запись для отслеживания технического обслуживания
                </p>
              </div>
              <button
                className="btn btn--primary maintenance-welcome__button"
                onClick={onAddMaintenance}
              >
                <span>Добавить ТО</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenanceSection;