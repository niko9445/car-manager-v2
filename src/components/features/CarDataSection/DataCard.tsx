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
    return t(`carDataFields.${fieldName}`) || fieldName;
  };

  // Функция для форматирования значения специальных категорий
  const formatSpecialValue = (field: any): string => {
    if (!field) return '';
    
    const fieldName = field.name;
    const value = field.value;
    
    // Для специальных категорий парсим сохраненную строку
    if (fieldName === 'dimensions') {
      // Парсим строку типа "Длина:4500 Ширина:1800 Высота:1500 Клиренс:180 Размер колес:205/55 R16 Сверловка:5x114.3 Размеры дисков:7Jx16 ET45"
      const parts = value.split(' ');
      
      const formattedParts = parts
        .map((part: string) => {
          // Игнорируем пустые части
          if (!part.trim() || part === ':') return null;
          
          const [key, val] = part.split(':');
          
          // Проверяем, что есть и ключ и значение, и значение не пустое
          if (key && val && val.trim() !== '') {
            // Добавляем единицы измерения для размеров
            if (key === t('dimensions.length') || key === t('dimensions.width') || 
                key === t('dimensions.height') || key === t('dimensions.clearance')) {
              return `${key}: ${val} ${t('units.mm')}`;
            }
            return `${key}: ${val}`;
          }
          return null;
        })
        .filter((part: string | null) => part !== null); // Указываем тип явно
      
      return formattedParts.length > 0 ? formattedParts.join(', ') : '';
    }
    
    if (fieldName === 'consumption') {
      // Парсим строку типа "Смешанный:7.5 По городу:9.0 По трассе:6.5"
      const parts = value.split(' ');
      
      const formattedParts = parts
        .map((part: string) => {
          if (!part.trim() || part === ':') return null;
          
          const [key, val] = part.split(':');
          if (key && val && val.trim() !== '') {
            return `${key}: ${val} ${t('units.per100km')}`;
          }
          return null;
        })
        .filter((part: string | null) => part !== null); // Указываем тип явно
      
      return formattedParts.length > 0 ? formattedParts.join(', ') : '';
    }
    
    // Для insurance и inspection оставляем как есть
    if (fieldName === 'insurance' || fieldName === 'inspection') {
      return value;
    }
    
    // Для обычных полей
    let unit = field.unit;
    
    // Обновляем валюту если нужно
    if (fieldName === 'cost' || fieldName === 'tax') {
      if (unit.includes('руб') || unit.includes('₽') || unit.includes(t('currencies.RUB'))) {
        unit = unit.replace(/руб|₽/g, getCurrencySymbol());
      }
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
        {formatSpecialValue(mainField)}
      </span>
    </div>
  );
};

export default DataCard;