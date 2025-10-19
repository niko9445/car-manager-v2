import React from 'react';
import { CarCardProps } from '../../../types';
import './CarCard.css';

const CarCard: React.FC<CarCardProps> = ({ 
  car, 
  isSelected, 
  onSelect, 
  position = 0 
}) => {
  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <div 
      className={`carcard__container ${isSelected ? 'carcard__container--selected' : ''}`}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      style={{ animationDelay: `${position * 0.1}s` }}
      role="button"
      tabIndex={0}
      aria-label={`Выбрать автомобиль ${car.brand} ${car.model} ${car.year} года`}
    >
      <div className="carcard__content">
        <div className="carcard__main-info">
          <h3 className="carcard__title">
            {car.brand} {car.model}
          </h3>
          <p className="carcard__year">
            {car.year} год
          </p>
        </div>
        
        {/* Индикатор выбора вместо кнопок действий */}
        {isSelected && (
          <div className="carcard__selection-indicator">
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarCard;