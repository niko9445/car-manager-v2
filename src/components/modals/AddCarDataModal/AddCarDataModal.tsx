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

  const addField = () => setFields([...fields, { name: '', value: '', unit: '' }]);

  const removeField = (index: number) => {
    if (fields.length > 1) setFields(fields.filter((_, i) => i !== index));
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
        
        {/* Поля данных */}
        <div className="modal__form-grid">
          
          {fields.map((field, index) => (
            <React.Fragment key={index}>
              {/* Название параметра как select */}
              <div className="modal__form-group">
                <label className="modal__label">
                  {index === 0 ? 'Название параметра' : `Параметр ${index + 1}`}
                </label>
                <select
                  className="modal__input"
                  value={field.name}
                  onChange={(e) => handleParameterChange(index, e.target.value)}
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
                  Значение {field.unit && `(${field.unit})`}
                </label>
                <input
                  className="modal__input"
                  type="text"
                  placeholder={`Введите значение ${field.unit ? `в ${field.unit}` : ''}`}
                  value={field.value}
                  onChange={(e) => updateField(index, 'value', e.target.value)}
                  required
                />
              </div>

              {/* Кнопка удаления */}
              {fields.length > 1 && (
                <div className="modal__form-group">
                  <label className="modal__label" style={{ opacity: 0 }}>Действия</label>
                  <button
                    type="button"
                    className="btn btn--danger"
                    onClick={() => removeField(index)}
                    style={{ height: '42px' }}
                  >
                    Удалить
                  </button>
                </div>
              )}
            </React.Fragment>
          ))}
          
        </div>

        {/* Кнопка добавления поля */}
        <div className="modal__actions modal__actions--centered" style={{ marginTop: 'var(--space-4)' }}>
          <button 
            type="button" 
            className="btn btn--secondary"
            onClick={addField}
          >
            + Добавить поле
          </button>
        </div>

        {/* Кнопки действий */}
          <div className="modal__actions-container">
            <div className="modal__actions modal__actions--centered">
              <button type="button" className="btn btn--cancel" onClick={onClose}>
                Отмена
              </button>
              <button 
                type="submit" 
                className="btn btn--action"
                disabled={!fields.every(f => f.name.trim() && f.value.trim())}
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