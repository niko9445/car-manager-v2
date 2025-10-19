import React from 'react';
import { Maintenance, Car } from '../../../types';
import './MaintenanceCard.css';

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
      className={`maintenancecard ${isActive ? 'maintenancecard--active' : ''}`}
      onClick={handleCardClick}
      style={{ animationDelay: `${position * 0.1}s` }}
    >
      {/* Кнопки действий - абсолютное позиционирование */}
      <div className="card__actions">
        <button 
          className="card__action card__action--edit"
          onClick={(e) => handleActionClick(e, onEdit)}
          title="Редактировать"
          type="button"
        >
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </button>
        <button 
          className="card__action card__action--delete"
          onClick={(e) => handleActionClick(e, onDelete)}
          title="Удалить"
          type="button"
        >
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19Z" fill="currentColor"/>
            <path d="M19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="currentColor"/>
          </svg>
        </button>
      </div>

      <div className="card__header">
        <h4 className="card__title">
          ТО от {formatDate(maintenance.createdAt)}
        </h4>
      </div>

      <div className="card__content">
        <div className="card__info">
          <div className="card__row">
            <span className="card__label">Пробег:</span>
            <span className="card__value">
              {formatNumber(maintenance.mileage)} км
            </span>
          </div>

          <div className="card__row">
            <span className="card__label">Затраты:</span>
            <span className="card__value card__value--cost">
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