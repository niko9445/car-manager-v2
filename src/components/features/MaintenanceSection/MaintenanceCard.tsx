import React from 'react';
import { Maintenance, Car } from '../../../types';

interface MaintenanceCardProps {
  maintenance: Maintenance;
  car: Car;
  onDelete: () => void;
  onEdit: () => void;
  position: number;
  isActive: boolean;
  onToggleActive: () => void;
}

const MaintenanceCard: React.FC<MaintenanceCardProps> = ({ 
  maintenance, 
  car, 
  onDelete, 
  onEdit, 
  position,
  isActive,
  onToggleActive
}) => {
  const handleCardClick = () => {
    onToggleActive();
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString('ru-RU');
  };

  return (
    <div 
      className={`card card--interactive ${isActive ? 'card--selected' : ''}`}
      onClick={handleCardClick}
      style={{ animationDelay: `${position * 0.1}s` }}
    >
      <div className="card__header">
        <div className="card__main-info">
          <h4 className="card__title">
            ТО от {formatDate(maintenance.createdAt)}
          </h4>
          <p className="card__description">
            Пробег: {formatNumber(maintenance.mileage)} км
          </p>
        </div>
        
        {/* Кнопки действий в углу */}
        <div className="card__corner-actions">
          <button 
            className="card__corner-action"
            onClick={(e) => handleActionClick(e, onEdit)}
            title="Редактировать"
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
          <button 
            className="card__corner-action card__corner-action--danger"
            onClick={(e) => handleActionClick(e, onDelete)}
            title="Удалить"
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="card__content">
        <div className="card__info">
          <div className="card__row">
            <span className="card__label">Затраты:</span>
            <span className="card__value card__value--highlight">
              {maintenance.cost ? `${formatNumber(maintenance.cost)} ₽` : 'Не указано'}
            </span>
          </div>
        </div>
        
        <div className="card__section">
          <div className="card__section-item">
            <span className="card__section-label">Следующая замена масла:</span>
            <span className="card__section-value">
              {formatNumber(maintenance.mileage + maintenance.oilChangeStep)} км
            </span>
          </div>
          
          <div className="card__section-item">
            <span className="card__section-label">Следующая замена фильтров:</span>
            <span className="card__section-value">
              {formatNumber(maintenance.mileage + maintenance.filterChangeStep)} км
            </span>
          </div>
        </div>

        {maintenance.additionalItems && maintenance.additionalItems.length > 0 && (
          <div className="card__additional">
            <span className="card__additional-label">Дополнительные работы:</span>
            {maintenance.additionalItems.map((item, index) => (
              <div key={index} className="card__additional-item">
                • {item.name}: {item.value} {item.unit || ''}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenanceCard;