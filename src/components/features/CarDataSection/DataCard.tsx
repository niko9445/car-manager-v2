import React from 'react';
import { CarDataEntry } from '../../../types';

interface DataCardProps {
  data: CarDataEntry;
  position?: number;
}

const DataCard: React.FC<DataCardProps> = ({ 
  data, 
  position = 0
}) => {
  // Берем первое поле для отображения (название и значение)
  const mainField = data.fields[0];

  return (
    <div 
      className="card__grid-item"
      style={{ animationDelay: `${position * 0.1}s` }}
    >
      <span className="card__grid-label">
        {mainField?.name || 'Данные автомобиля'}
      </span>
      <span className="card__grid-value">
        {mainField?.value} {mainField?.unit && ` ${mainField?.unit}`}
      </span>
    </div>
  );
};

export default DataCard;