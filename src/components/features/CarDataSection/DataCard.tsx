import React from 'react';
import { CarDataEntry } from '../../../types';
import { useCurrency } from '../../../contexts/CurrencyContext';

interface DataCardProps {
  data: CarDataEntry;
  position?: number;
  isStatic?: boolean; // Для статических карточек (основные данные)
  isDraggable?: boolean; // Можно ли перетаскивать
  isDragging?: boolean; // В процессе перетаскивания
}

const DataCard: React.FC<DataCardProps> = ({ 
  data, 
  position = 0,
  isStatic = false,
  isDraggable = false,
  isDragging = false
}) => {
  const { getCurrencySymbol } = useCurrency();
  
  const mainField = data.fields[0];

  const formatValue = (field: any) => {
    if (!field) return '';
    
    let value = field.value;
    let unit = field.unit;
    
    if (field.name.includes('Стоимость') || field.name.includes('Страхование') || field.name.includes('Налог')) {
      if (unit.includes('руб') || unit.includes('₽')) {
        unit = unit.replace(/руб|₽/g, getCurrencySymbol());
      }
    }
    
    if (field.name === 'Страховка' || field.name === 'Техосмотр') {
      return value;
    }
    
    return `${value}${unit ? ` ${unit}` : ''}`;
  };

  return (
    <div 
      className={`
        card__grid-item
        ${isStatic ? 'card-static' : ''}
        ${isDraggable ? 'card-draggable' : ''}
        ${isDragging ? 'card-dragging' : ''}
      `}
      style={{ 
        animationDelay: `${position * 0.1}s`,
        cursor: isDraggable ? 'grab' : 'default'
      }}
    >
      {/* Добавляем иконку перетаскивания для мобильных */}
      {isDraggable && (
        <div className="card-drag-handle">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="8" cy="6" r="1.5"/>
            <circle cx="16" cy="6" r="1.5"/>
            <circle cx="8" cy="12" r="1.5"/>
            <circle cx="16" cy="12" r="1.5"/>
            <circle cx="8" cy="18" r="1.5"/>
            <circle cx="16" cy="18" r="1.5"/>
          </svg>
        </div>
      )}
      
      <span className="card__grid-label">
        {mainField?.name || 'Данные автомобиля'}
      </span>
      <span className="card__grid-value">
        {formatValue(mainField)}
      </span>
    </div>
  );
};

export default DataCard;