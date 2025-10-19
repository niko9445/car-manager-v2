import React from 'react';
import { CarDataEntry } from '../../../types';
import './DataCard.css';

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
      className="datacard" 
      style={{ animationDelay: `${position * 0.1}s` }}
    >
      <div className="datacard__grid">
        {data.fields.map((field, index) => (
          <div key={index} className="datacard__item">
            <span className="datacard__label">{field.name}</span>
            <span className="datacard__value">
              {field.value} {field.unit && ` ${field.unit}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataCard;