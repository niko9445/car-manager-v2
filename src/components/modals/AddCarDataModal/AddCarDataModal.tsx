import React, { useState, useMemo } from 'react';
import Modal from '../../ui/Modal/Modal';
import { CarDataField } from '../../../types';
import { useCurrency } from '../../../contexts/CurrencyContext';

interface AddCarDataModalProps {
  onClose: () => void;
  onSave: (carData: { fields: CarDataField[] }) => void;
}

const AddCarDataModal: React.FC<AddCarDataModalProps> = ({ onClose, onSave }) => {
  const [fields, setFields] = useState<CarDataField[]>([{ name: '', value: '', unit: '' }]);
  const { getCurrencySymbol } = useCurrency();

  const predefinedFields = useMemo(() => [
    { name: 'Пробег', unit: 'км' },
    { name: 'Расход топлива', unit: 'л/100км' },
    { name: 'Мощность', unit: 'л.с.' },
    { name: 'Объем двигателя', unit: 'л' },
    { name: 'Стоимость', unit: getCurrencySymbol() },
    { name: 'Дата покупки', unit: '' },
    { name: 'Цвет', unit: '' },
    { name: 'Тип кузова', unit: '' },
    { name: 'Привод', unit: '' },
    { name: 'Разгон до 100', unit: 'сек' },
    { name: 'Макс. скорость', unit: 'км/ч' },
    { name: 'Крутящий момент', unit: 'Н⋅м' },
    { name: 'Вес', unit: 'кг' },
    { name: 'Объем багажника', unit: 'л' },
    { name: 'Расход в городе', unit: 'л/100км' },
    { name: 'Расход по трассе', unit: 'л/100км' },
    { name: 'Страна производства', unit: '' },
    { name: 'Гарантия', unit: 'мес' },
    { name: 'Страхование', unit: `${getCurrencySymbol()}/год` },
    { name: 'Налог', unit: `${getCurrencySymbol()}/год` }
  ], [getCurrencySymbol]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fields.every(f => f.name.trim() && f.value.trim())) {
      onSave({ fields });
    }
  };

  const updateField = (index: number, key: keyof CarDataField, value: string) => {
    const updated = fields.map((f, i) => i === index ? { ...f, [key]: value } : f);
    setFields(updated);
  };

  // Функция для обработки выбора параметра
  const handleParameterChange = (index: number, selectedName: string) => {
    const selectedField = predefinedFields.find(f => f.name === selectedName);
    
    if (selectedField) {
      // Автозаполняем название и единицу измерения
      const updated = [...fields];
      updated[index] = { 
        ...updated[index], 
        name: selectedField.name,
        unit: selectedField.unit
      };
      setFields(updated);
    } else {
      // Если выбрано "Выберите параметр" - сбрасываем
      updateField(index, 'name', selectedName);
      updateField(index, 'unit', '');
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Добавить данные об авто" size="md">
      <form className="modal__form" onSubmit={handleSubmit}>
        
        {/* Поля данных - ТЕПЕРЬ ТОЛЬКО ОДНО ПОЛЕ */}
        <div className="modal__form-grid">
          
          {/* ТОЛЬКО ПЕРВОЕ ПОЛЕ (index === 0) */}
          <div className="modal__form-group">
            <label className="modal__label">Название параметра</label>
            <select
              className="modal__input"
              value={fields[0].name}
              onChange={(e) => handleParameterChange(0, e.target.value)}
              required
            >
              <option value="">Выберите параметр</option>
              {predefinedFields.map(item => (
                <option key={item.name} value={item.name}>
                  {item.name} {item.unit && `(${item.unit})`}
                </option>
              ))}
            </select>
          </div>

          {/* Значение */}
          <div className="modal__form-group">
            <label className="modal__label">
              Значение {fields[0].unit && `(${fields[0].unit})`}
            </label>
            <input
              className="modal__input"
              type="text"
              placeholder={`Введите значение ${fields[0].unit ? `в ${fields[0].unit}` : ''}`}
              value={fields[0].value}
              onChange={(e) => updateField(0, 'value', e.target.value)}
              required
            />
          </div>
          
        </div>

        {/* Кнопки действий */}
        <div className="modal__actions-container">
          <div className="modal__actions modal__actions--centered">
            <button type="button" className="btn btn--secondary" onClick={onClose}>
              Отмена
            </button>
            <button 
              type="submit" 
              className="btn btn--action"
              disabled={!fields[0].name.trim() || !fields[0].value.trim()}
            >
              Добавить
            </button>
          </div>
          
          <div className="modal__footer-signature">
            © 2025 <span className="modal__footer-app-name">RuNiko</span>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AddCarDataModal;