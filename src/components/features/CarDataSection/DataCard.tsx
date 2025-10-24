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
  return (
    <div 
      className="card" 
      style={{ animationDelay: `${position * 0.1}s` }}
    >
      <div className="card__grid">
        {data.fields.map((field, index) => (
          <div key={index} className="card__grid-item">
            <span className="card__grid-label">{field.name}</span>
            <span className="card__grid-value">
              {field.value} {field.unit && ` ${field.unit}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataCard;