import React from 'react';
import { CarDataSectionProps } from '../../../types';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { useTranslation } from '../../../contexts/LanguageContext';

const CarDataSection: React.FC<CarDataSectionProps> = ({ 
  car, 
  cars, 
  onAddCarData, 
  onDeleteCarData,
  onEditCarData,
  onEditCar
}) => {
  const currentCar = cars.find(c => c.id === car.id) || car;
  const { getCurrencySymbol } = useCurrency();
  const { t } = useTranslation();

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

  // Функция для проверки специальных категорий
  const isSpecialCategory = (fieldName: string): boolean => {
    const specialCategories = ['dimensions', 'consumption', 'Размеры', 'Расход'];
    return specialCategories.includes(fieldName) || 
           fieldName === t('carDataFields.dimensions') || 
           fieldName === t('carDataFields.consumption');
  };

  // Функция для парсинга текстового формата
  const parseTextFormat = (text: string): any => {
    console.log('📝 Parsing text:', text);
    
    const result: any = {};
    
    // Парсим размеры
    const lengthMatch = text.match(/Длина\s*\(мм\):?\s*(\d+)/i);
    const widthMatch = text.match(/Ширина\s*\(мм\):?\s*(\d+)/i);
    const heightMatch = text.match(/Высота\s*\(мм\):?\s*(\d+)/i);
    const clearanceMatch = text.match(/Клиренс\s*\(мм\):?\s*(\d+)/i);
    const wheelSizeMatch = text.match(/Размер колес:?\s*([^:]+?)(?=Сверловка|$)/i);
    
    if (lengthMatch) result.length = lengthMatch[1];
    if (widthMatch) result.width = widthMatch[1];
    if (heightMatch) result.height = heightMatch[1];
    if (clearanceMatch) result.clearance = clearanceMatch[1];
    if (wheelSizeMatch) result.wheelSize = wheelSizeMatch[1].trim();
    
    // Парсим расход
    const mixedMatch = text.match(/Смешанный\s*\(л\/100км\):?\s*([\d.,]+)/i);
    const cityMatch = text.match(/По городу\s*\(л\/100км\):?\s*([\d.,]+)/i);
    const highwayMatch = text.match(/По трассе\s*\(л\/100км\):?\s*([\d.,]+)/i);
    
    if (mixedMatch) result.mixed = mixedMatch[1];
    if (cityMatch) result.city = cityMatch[1];
    if (highwayMatch) result.highway = highwayMatch[1];
    
    console.log('✅ Parsed result:', result);
    return result;
  };

  // Функция для рендеринга специальных категорий из текста
  const renderTextSpecialCategory = (field: any): React.ReactNode => {
    const data = parseTextFormat(field.value);
    
    if (field.name === 'dimensions' || field.name === t('carDataFields.dimensions')) {
      const items = [];
      
      if (data.length) items.push({ label: 'Длина', value: data.length });
      if (data.width) items.push({ label: 'Ширина', value: data.width });
      if (data.height) items.push({ label: 'Высота', value: data.height });
      if (data.clearance) items.push({ label: 'Клиренс', value: data.clearance });
      if (data.wheelSize) items.push({ label: 'Размер колес', value: data.wheelSize });
      
      console.log('📏 Dimensions items from text:', items);
      
      if (items.length > 0) {
        return (
          <div className="special-category-container">
            {items.map((item, index) => (
              <div key={index} className="special-category-item">
                <span className="special-category-label">{item.label}</span>
                <span className="special-category-value">{item.value}</span>
              </div>
            ))}
          </div>
        );
      }
    }
    
    if (field.name === 'consumption' || field.name === t('carDataFields.consumption')) {
      const items = [];
      
      if (data.mixed) items.push({ label: 'Смешанный', value: data.mixed });
      if (data.city) items.push({ label: 'По городу', value: data.city });
      if (data.highway) items.push({ label: 'По трассе', value: data.highway });
      
      console.log('⛽ Consumption items from text:', items);
      
      if (items.length > 0) {
        return (
          <div className="special-category-container">
            {items.map((item, index) => (
              <div key={index} className="special-category-item">
                <span className="special-category-label">{item.label}</span>
                <span className="special-category-value">{item.value}</span>
              </div>
            ))}
          </div>
        );
      }
    }
    
    // Если не удалось распарсить, показываем исходный текст
    return (
      <span className="main-data-value">
        {field.value}
      </span>
    );
  };

  // Функция для рендеринга специальных категорий
  const renderSpecialCategory = (field: any): React.ReactNode => {
    console.log('🔍 RENDERING SPECIAL CATEGORY:', field);
    
    if (!field.value) {
      console.log('❌ Field value is empty');
      return (
        <span className="main-data-value">
          {formatAdditionalValue(field)}
        </span>
      );
    }

    try {
      let data;
      if (typeof field.value === 'string') {
        try {
          data = JSON.parse(field.value);
          console.log('✅ JSON parsed successfully:', data);
        } catch (jsonError) {
          console.log('❌ JSON parse failed, parsing as text');
          return renderTextSpecialCategory(field);
        }
      } else {
        data = field.value;
      }
      
      // Рендерим категорию "Размеры" из JSON
      if (field.name === 'dimensions' || field.name === t('carDataFields.dimensions')) {
        const items = [];
        
        if (data.length) items.push({ label: t('dimensions.length'), value: `${data.length} мм` });
        if (data.width) items.push({ label: t('dimensions.width'), value: `${data.width} мм` });
        if (data.height) items.push({ label: t('dimensions.height'), value: `${data.height} мм` });
        if (data.clearance) items.push({ label: t('dimensions.clearance'), value: `${data.clearance} мм` });
        if (data.wheelSize) items.push({ label: t('dimensions.wheelSize'), value: data.wheelSize });
        
        console.log('📏 Dimensions items from JSON:', items);
        
        if (items.length > 0) {
          return (
            <div className="special-category-container">
              {items.map((item, index) => (
                <div key={index} className="special-category-item">
                  <span className="special-category-label">{item.label}</span>
                  <span className="special-category-value">{item.value}</span>
                </div>
              ))}
            </div>
          );
        }
      }
      
      // Рендерим категорию "Расход" из JSON
      if (field.name === 'consumption' || field.name === t('carDataFields.consumption')) {
        const items = [];
        
        if (data.mixed) items.push({ label: t('consumption.mixed'), value: `${data.mixed} л/100км` });
        if (data.city) items.push({ label: t('consumption.city'), value: `${data.city} л/100км` });
        if (data.highway) items.push({ label: t('consumption.highway'), value: `${data.highway} л/100км` });
        
        console.log('⛽ Consumption items from JSON:', items);
        
        if (items.length > 0) {
          return (
            <div className="special-category-container">
              {items.map((item, index) => (
                <div key={index} className="special-category-item">
                  <span className="special-category-label">{item.label}</span>
                  <span className="special-category-value">{item.value}</span>
                </div>
              ))}
            </div>
          );
        }
      }
      
      // Если не нашли специальных полей, показываем обычное значение
      return (
        <span className="main-data-value">
          {formatAdditionalValue(field)}
        </span>
      );
    } catch (error) {
      console.error('💥 Error rendering special category:', error);
      return (
        <span className="main-data-value">
          {formatAdditionalValue(field)}
        </span>
      );
    }
  };

  // Функция форматирования дополнительных данных
  const formatAdditionalValue = (field: any): string => {
    if (!field || !field.value) return '';
    
    let value = field.value;
    let unit = field.unit || '';
    
    if (field.name === 'cost' || field.name === 'insurance' || field.name === 'tax') {
      if (!unit || unit.includes('руб') || unit.includes('₽')) {
        unit = getCurrencySymbol();
      }
    }
    
    if (field.name === 'insurance' || field.name === 'inspection' || field.name === 'purchaseDate') {
      return value;
    }
    
    return `${value}${unit ? ` ${unit}` : ''}`;
  };

  // Функция для перевода типа двигателя
  const getTranslatedEngineType = (engineType: string): string => {
    switch (engineType) {
      case 'petrol':
        return t('engineTypes.petrol');
      case 'diesel':
        return t('engineTypes.diesel');
      case 'electric':
        return t('engineTypes.electric');
      case 'hybrid':
        return t('engineTypes.hybrid');
      default:
        return t('engineTypes.other');
    }
  };

  // Функция для перевода типа коробки передач
  const getTranslatedTransmission = (transmission: string): string => {
    switch (transmission) {
      case 'manual':
        return t('transmissionTypes.manual');
      case 'automatic':
        return t('transmissionTypes.automatic');
      case 'cvt':
        return t('transmissionTypes.cvt');
      default:
        return t('transmissionTypes.other');
    }
  };

  // Объединяем основные данные и дополнительные данные в один массив для отображения
  const allDataItems = [
    { id: 'brand', name: t('cars.brand'), value: currentCar.brand, isStatic: true },
    { id: 'model', name: t('cars.model'), value: currentCar.model, isStatic: true },
    { id: 'year', name: t('cars.year'), value: currentCar.year.toString(), isStatic: true },
    ...(currentCar.engineType ? [
      { 
        id: 'engineType', 
        name: t('cars.engineType'),
        value: getTranslatedEngineType(currentCar.engineType),
        isStatic: true 
      }
    ] : []),
    ...(currentCar.transmission ? [
      { 
        id: 'transmission', 
        name: t('cars.transmission'),
        value: getTranslatedTransmission(currentCar.transmission),
        isStatic: true 
      }
    ] : []),
    ...(currentCar.vin ? [
      { id: 'vin', name: t('cars.vin'), value: currentCar.vin, isStatic: true }
    ] : [])
  ];

  console.log('🚗 All data items:', allDataItems);
  console.log('📊 Car data:', currentCar.carData);

  return (
    <div className="car-data-section">
      <div className="section-header">
        <div className="section-title">
          <h2 className="section-title__text">
            {t('cars.carInfo')}
          </h2>
          <div className="section-title__actions">
            <button 
              className="btn btn--primary btn--compact"
              onClick={() => onEditCar(currentCar)}
              type="button"
              title={t('cars.editCar')} 
            >
              <svg className="btn__icon" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
            <button 
              className="btn btn--primary btn--compact"
              onClick={onAddCarData}
              type="button"
              title={t('carData.add')} 
            >
              <svg className="btn__icon" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="section-content">
        <div className="car-data-section__all-data">
          {(allDataItems.length > 0 || (currentCar.carData && currentCar.carData.length > 0)) && (
            /* УБИРАЕМ КОНТЕЙНЕР .main-data-card И ПРОКРУТКУ */
            <div className="main-data-grid">
              {/* Основные данные */}
              {allDataItems.map((item) => (
                <div key={item.id} className="main-data-item">
                  <span className="main-data-label">{item.name}</span>
                  <span className="main-data-value">{item.value}</span>
                </div>
              ))}
              
              {/* Дополнительные данные */}
              {currentCar.carData && currentCar.carData.map((dataEntry, index) => {
                console.log('📄 Data entry:', dataEntry);
                return dataEntry.fields.map((field, fieldIndex) => {
                  const isSpecial = isSpecialCategory(field.name);
                  console.log('🔧 Field:', field, 'isSpecial:', isSpecial);
                  
                  return (
                    <div 
                      key={`${dataEntry.id}-${fieldIndex}`} 
                      className={`main-data-item ${isSpecial ? 'main-data-item--full-width' : ''}`}
                    >
                      <span className="main-data-label">
                        {field.name in translationKeys ? t(`carDataFields.${field.name}`) : field.name}
                      </span>
                      {renderSpecialCategory(field)}
                    </div>
                  );
                });
              })}
            </div>
          )}

          {allDataItems.length === 0 && (!currentCar.carData || currentCar.carData.length === 0) && (
            <div className="section__empty">
              <div className="section__empty-icon">🚗</div>
              <h3 className="section__empty-text">{t('carData.noData')}</h3>
              <p className="section__empty-subtext">
                {t('carData.addFirstData')}
              </p>
              <div className="section__empty-actions">
                <button 
                  className="btn btn--primary"
                  onClick={() => onEditCar(currentCar)}
                >
                  {t('carData.add')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarDataSection;