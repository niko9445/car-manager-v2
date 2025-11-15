import React, { useState, useMemo } from 'react';
import Modal from '../../ui/Modal/Modal';
import { CarDataEntry, CarDataField } from '../../../types';
import { useCurrency } from '../../../contexts/CurrencyContext';

interface EditCarDataModalProps {
  data: CarDataEntry;
  onClose: () => void;
  onSave: (dataId: string, updatedData: { fields: CarDataField[] }) => void;
}

const EditCarDataModal: React.FC<EditCarDataModalProps> = ({ data, onClose, onSave }) => {
  const [field, setField] = useState<CarDataField>(data.fields[0]);
  const { getCurrencySymbol } = useCurrency();

  const predefinedFields = useMemo(() => [
    { name: 'Страховка', unit: '' },
    { name: 'Техосмотр', unit: '' },
    { name: 'Размеры', unit: '' },
    { name: 'Код двигателя', unit: '' },
    { name: 'Марка топлива', unit: '' },
    { name: 'Расход', unit: '' },
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
    { name: 'Страна производства', unit: '' },
    { name: 'Гарантия', unit: 'мес' },
    { name: 'Налог', unit: `${getCurrencySymbol()}/год` }
  ], [getCurrencySymbol]);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    onSave(data.id, { fields: [field] });
  };

  const handleParameterChange = (selectedName: string) => {
    const selectedField = predefinedFields.find(f => f.name === selectedName);
    
    if (selectedField) {
      setField(prev => ({ 
        ...prev, 
        name: selectedField.name,
        unit: selectedField.unit
      }));
    } else {
      setField(prev => ({ ...prev, name: selectedName, unit: '' }));
    }
  };

  const updateField = (key: keyof CarDataField, value: string) => {
    setField(prev => ({ ...prev, [key]: value }));
  };

  const isDateField = field.name === 'Дата покупки';

  return (
    <Modal isOpen={true} onClose={onClose} title="Редактировать данные" size="md">
      <form className="modal__form" onSubmit={handleSubmit}>
        
        <div className="modal__form-grid">
          <div className="modal__form-group">
            <label className="modal__label">Название параметра</label>
            <select
              className="modal__input"
              value={field.name}
              onChange={(e) => handleParameterChange(e.target.value)}
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

          <div className="modal__form-group">
            <label className="modal__label">
              {isDateField ? 'Дата' : 'Значение'} {field.unit && `(${field.unit})`}
            </label>
            {isDateField ? (
              <input
                type="date"
                className="modal__input"
                value={field.value}
                onChange={(e) => updateField('value', e.target.value)}
                required
              />
            ) : (
              <input
                type="text"
                className="modal__input"
                placeholder={`Введите ${isDateField ? 'дату' : 'значение'} ${field.unit ? `в ${field.unit}` : ''}`}
                value={field.value}
                onChange={(e) => updateField('value', e.target.value)}
                required={field.name !== 'Стоимость'}
              />
            )}
          </div>
        </div>

        <div className="modal__actions-container">
          <div className="modal__actions modal__actions--centered">
            <button type="button" className="btn btn--cancel" onClick={onClose}>
              Отмена
            </button>
            <button 
              type="submit" 
              className="btn btn--action"
              disabled={!field.name.trim() || (field.name !== 'Стоимость' && !field.value.trim())}
            >
              Сохранить
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

export default EditCarDataModal;