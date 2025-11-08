import React from 'react';
import { CarCardProps } from '../../../types';

const CarCard: React.FC<CarCardProps> = ({
  car,
  isSelected,
  onSelect,
  position,
  isMobile = false,
  onDelete
}) => {
  return (
    <div 
      className={`car-card ${isSelected ? 'car-card--selected' : ''} ${isMobile ? 'car-card--mobile' : ''}`}
      onClick={onSelect}
      style={{ 
        animationDelay: position ? `${position * 0.05}s` : '0s' 
      }}
    >
      <div className="car-card__header">
        {/* Кнопка удаления - в левом верхнем углу */}
        {isSelected && onDelete && (
          <button 
            className="car-card__delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(car);
            }}
            type="button"
            title="Удалить автомобиль"
          >
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
              <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        )}
        
        <div className="car-card__info">
          <h3 className="car-card__title">
            {car.brand} {car.model}
          </h3>
          <p className="car-card__description">
            {car.year} • {car.engineType === 'petrol' ? 'Бензин' : 
                         car.engineType === 'diesel' ? 'Дизель' : 
                         car.engineType === 'electric' ? 'Электро' : 
                         car.engineType === 'hybrid' ? 'Гибрид' : 'Другой'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CarCard;