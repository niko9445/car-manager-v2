import React, { useState, useMemo, useRef } from 'react';
import Modal from '../../ui/Modal/Modal';
import { CarDataField } from '../../../types';
import './AddCarDataModal.css';

interface AddCarDataModalProps {
  onClose: () => void;
  onSave: (carData: { fields: CarDataField[] }) => void;
}

const AddCarDataModal: React.FC<AddCarDataModalProps> = ({ onClose, onSave }) => {
  const [fields, setFields] = useState<CarDataField[]>([{ name: '', value: '', unit: '' }]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const predefinedFields = useMemo(() => [
    { name: 'Пробег', unit: 'км' },
    { name: 'Расход топлива', unit: 'л/100км' },
    { name: 'Мощность', unit: 'л.с.' },
    { name: 'Объем двигателя', unit: 'л' },
    { name: 'Стоимость', unit: 'руб.' },
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
    { name: 'Страхование', unit: 'руб/год' },
    { name: 'Налог', unit: 'руб/год' }
  ], []);

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

  const filteredSuggestions = useMemo(() => {
    if (activeSuggestionIndex === null) return [];
    const current = fields[activeSuggestionIndex]?.name.toLowerCase() || '';
    return predefinedFields.filter(
      f => f.name.toLowerCase().includes(current) &&
           !fields.some((field, idx) => idx !== activeSuggestionIndex && field.name === f.name)
    );
  }, [activeSuggestionIndex, fields, predefinedFields]);

  const handleSuggestionSelect = (index: number, suggestion: typeof predefinedFields[0]) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], name: suggestion.name, unit: suggestion.unit };
    setFields(updated);
    setActiveSuggestionIndex(null);
  };

  const handleInputFocus = (index: number) => setActiveSuggestionIndex(index);

  const handleInputBlur = () => {
    timeoutRef.current = window.setTimeout(() => setActiveSuggestionIndex(null), 200);
  };

  const handleSuggestionMouseDown = (e: React.MouseEvent) => e.preventDefault();
  const handleManualInputClick = () => setActiveSuggestionIndex(null);

  return (
    <Modal isOpen={true} onClose={onClose} title="Добавить данные об авто" size="md">
      <form className="form form--gap-lg" onSubmit={handleSubmit}>
        <div className="form__fields">
          {fields.map((field, index) => (
            <div key={index} className="form__field-row">
              <div className="addcardatamodal__field-with-suggestions">
                <input
                  className="form__input"
                  type="text"
                  placeholder="Название параметра"
                  value={field.name}
                  onChange={(e) => updateField(index, 'name', e.target.value)}
                  onFocus={() => handleInputFocus(index)}
                  onBlur={handleInputBlur}
                  required
                />

                <div className={`addcardatamodal__suggestions ${activeSuggestionIndex === index ? 'show' : ''}`}>
                  <div className="addcardatamodal__suggestions-header">
                    Выберите параметр или введите свой
                  </div>

                  <div
                    className="addcardatamodal__suggestion-item addcardatamodal__suggestion-item--manual"
                    onMouseDown={handleSuggestionMouseDown}
                    onClick={() => handleManualInputClick()}
                  >
                    ✏️ Ввести свой параметр
                  </div>

                  {filteredSuggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className="addcardatamodal__suggestion-item"
                      onMouseDown={handleSuggestionMouseDown}
                      onClick={() => handleSuggestionSelect(index, suggestion)}
                    >
                      <strong>{suggestion.name}</strong>
                      {suggestion.unit && <span className="addcardatamodal__suggestion-unit"> ({suggestion.unit})</span>}
                    </div>
                  ))}

                  {filteredSuggestions.length === 0 && (
                    <div className="addcardatamodal__suggestion-item addcardatamodal__suggestion-item--empty">
                      Нет подходящих параметров
                    </div>
                  )}
                </div>
              </div>

              <input
                className="form__input"
                type="text"
                placeholder="Значение"
                value={field.value}
                onChange={(e) => updateField(index, 'value', e.target.value)}
                required
              />

              <input
                className="form__input"
                type="text"
                placeholder="Ед. измерения"
                value={field.unit}
                onChange={(e) => updateField(index, 'unit', e.target.value)}
              />

              {fields.length > 1 && (
                <button
                  type="button"
                  className="form__remove-button"
                  onClick={() => removeField(index)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        <button type="button" className="form__add-button" onClick={addField}>
          + Добавить поле
        </button>

        <div className="form__actions">
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Отмена
          </button>
          <button type="submit" className="btn btn--primary">
            Сохранить данные
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddCarDataModal;
