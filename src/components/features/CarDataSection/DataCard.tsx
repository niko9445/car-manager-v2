import React from 'react';
import { CarDataEntry } from '../../../types';
import { useCurrency } from '../../../contexts/CurrencyContext';

interface DataCardProps {
  data: CarDataEntry;
  position?: number;
}

const DataCard: React.FC<DataCardProps> = ({ 
  data, 
  position = 0
}) => {
  const { getCurrencySymbol } = useCurrency();
  
  // Берем первое поле для отображения (название и значение)
  const mainField = data.fields[0];

  // Функция для форматирования значения с учетом валюты
  const formatValue = (field: any) => {
    if (!field) return '';
    
    let value = field.value;
    let unit = field.unit;
    
    // Если поле связано с деньгами и единица измерения содержит валюту
    if (field.name.includes('Стоимость') || field.name.includes('Страхование') || field.name.includes('Налог')) {
      // Заменяем старые обозначения валют на текущую
      if (unit.includes('руб') || unit.includes('₽')) {
        unit = unit.replace(/руб|₽/g, getCurrencySymbol());
      }
    }
    
    // ДЛЯ СТРАХОВКИ И ТЕХОСМОТРА - УБИРАЕМ ВАЛЮТУ ИЗ ОТОБРАЖЕНИЯ
    if (field.name === 'Страховка' || field.name === 'Техосмотр') {
      return value; // Просто возвращаем значение без валюты
    }
    
    return `${value}${unit ? ` ${unit}` : ''}`;
  };

  return (
    <div 
      className="card__grid-item"
      style={{ animationDelay: `${position * 0.1}s` }}
    >
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