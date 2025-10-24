import React from 'react';
import { CarDataSectionProps } from '../../../types';

const CarDataSection: React.FC<CarDataSectionProps> = ({ 
  car, 
  cars, 
  onAddCarData, 
  onEditCar
}) => {
  const currentCar = cars.find(c => c.id === car.id) || car;

  // Объединяем основные данные и дополнительные данные в один массив для отображения
  const allDataItems = [
    // Основные данные как статические поля
    { id: 'brand', name: 'Марка', value: currentCar.brand, isStatic: true },
    { id: 'model', name: 'Модель', value: currentCar.model, isStatic: true },
    { id: 'year', name: 'Год выпуска', value: currentCar.year.toString(), isStatic: true },
    ...(currentCar.engineType ? [
      { 
        id: 'engineType', 
        name: 'Двигатель', 
        value: 
          currentCar.engineType === 'petrol' ? 'Бензин' :
          currentCar.engineType === 'diesel' ? 'Дизель' :
          currentCar.engineType === 'electric' ? 'Электро' :
          currentCar.engineType === 'hybrid' ? 'Гибрид' : 'Другой',
        isStatic: true 
      }
    ] : []),
    ...(currentCar.transmission ? [
      { 
        id: 'transmission', 
        name: 'Коробка передач', 
        value: 
          currentCar.transmission === 'manual' ? 'МКПП' :
          currentCar.transmission === 'automatic' ? 'АКПП' :
          currentCar.transmission === 'cvt' ? 'Вариатор' : 'Другая',
        isStatic: true 
      }
    ] : []),
    ...(currentCar.vin ? [
      { id: 'vin', name: 'VIN-код', value: currentCar.vin, isStatic: true }
    ] : [])
  ];

  return (
    <div className="car-data-section">
      {/* ФИКСИРОВАННЫЙ ЗАГОЛОВОК РАЗДЕЛА */}
      <div className="section-header">
        <div className="section-title">
          <h2 className="section-title__text">
            Информация об авто
          </h2>
          <div className="section-title__actions">
            <button 
              className="btn btn--secondary btn--super-compact"
              onClick={() => onEditCar(currentCar)}
              type="button"
              title="Редактировать автомобиль"
            >
              <svg className="btn__icon" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
            <button 
              className="btn btn--primary btn--super-compact"
              onClick={onAddCarData}
              type="button"
              title="Добавить данные"
            >
              <svg className="btn__icon" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ПРОКРУЧИВАЕМЫЙ КОНТЕНТ */}
      <div className="section-content">
        <div className="card__grid">
          {/* Основные данные автомобиля */}
          {allDataItems.map((item) => (
            <div key={item.id} className="card__grid-item">
              <span className="card__grid-label">{item.name}</span>
              <span className="card__grid-value">{item.value}</span>
            </div>
          ))}
          
          {/* Дополнительные данные из carData */}
          {currentCar.carData && currentCar.carData.map((dataEntry) => 
            dataEntry.fields.map((field, index) => (
              <div key={`${dataEntry.id}-${index}`} className="card__grid-item">
                <span className="card__grid-label">{field.name}</span>
                <span className="card__grid-value">
                  {field.value} {field.unit && ` ${field.unit}`}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Сообщение если нет данных вообще */}
        {allDataItems.length === 0 && (!currentCar.carData || currentCar.carData.length === 0) && (
          <div className="section__empty">
            <div className="section__empty-icon">🚗</div>
            <h3 className="section__empty-text">Нет данных об автомобиле</h3>
            <p className="section__empty-subtext">
              Добавьте основную информацию и характеристики автомобиля
            </p>
            <div className="section__empty-actions">
              <button 
                className="btn btn--primary"
                onClick={() => onEditCar(currentCar)}
              >
                Добавить данные
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarDataSection;