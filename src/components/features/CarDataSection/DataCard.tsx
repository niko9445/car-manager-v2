import React from 'react';
import { CarDataEntry } from '../../../types';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { useTranslation } from '../../../contexts/LanguageContext';

interface DataCardProps {
  data: CarDataEntry;
  position?: number;
  isStatic?: boolean;
  isDraggable?: boolean;
  isDragging?: boolean;
}

const DataCard: React.FC<DataCardProps> = ({ 
  data, 
  position = 0,
  isStatic = false,
  isDraggable = false,
  isDragging = false
}) => {
  const { getCurrencySymbol } = useCurrency();
  const { t } = useTranslation();
  
  const mainField = data.fields[0];

  // Функция для получения переведенного названия поля
  const getTranslatedFieldName = (fieldName: string): string => {
    // Если поле является ключом перевода из carDataFields
    if (fieldName in translationKeys) {
      return t(`carDataFields.${fieldName}`);
    }
    // Если это пользовательское поле (не из predefined list)
    return fieldName;
  };

  // Список ключей переводов для carDataFields
  const translationKeys = {
    insurance: true,
    inspection: true,
    dimensions: true,
    engineCode: true,
    fuelType: true,
    consumption: true,
    power: true,
    engineVolume: true,
    cost: true,
    purchaseDate: true,
    color: true,
    bodyType: true,
    drive: true,
    acceleration: true,
    maxSpeed: true,
    torque: true,
    weight: true,
    trunkVolume: true,
    country: true,
    warranty: true,
    tax: true
  };

  const formatValue = (field: any) => {
    if (!field) return '';
    
    let value = field.value;
    let unit = field.unit;
    
    // Обновляем логику для работы с ключами переводов
    const fieldKey = Object.keys(translationKeys).find(key => 
      field.name === key || field.name === t(`carDataFields.${key}`)
    );
    
    if (fieldKey === 'cost' || fieldKey === 'insurance' || fieldKey === 'tax') {
      if (unit.includes('руб') || unit.includes('₽') || unit.includes(t('currencies.RUB'))) {
        unit = unit.replace(/руб|₽/g, getCurrencySymbol());
      }
    }
    
    if (fieldKey === 'insurance' || fieldKey === 'inspection') {
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
      <span className="card__grid-label">
        {getTranslatedFieldName(mainField?.name) || t('cars.carDetails')}
      </span>
      <span className="card__grid-value">
        {formatValue(mainField)}
      </span>
    </div>
  );
};

export default DataCard;