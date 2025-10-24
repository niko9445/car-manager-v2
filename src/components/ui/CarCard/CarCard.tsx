import React from 'react';
import { CarCardProps } from '../../../types';

const CarCard: React.FC<CarCardProps> = ({
  car,
  isSelected,
  onSelect,
  position,
  isMobile = false
}) => {
  return (
    <div 
      className={`card card--compact card--interactive ${isSelected ? 'card--selected' : ''}`}
      onClick={onSelect}
      style={{ 
        animationDelay: position ? `${position * 0.05}s` : '0s' 
      }}
    >
      <div className="card__header">
        <div className="card__main-info">
          <h3 className="card__title">
            {car.brand} {car.model}
          </h3>
          <p className="card__description">
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