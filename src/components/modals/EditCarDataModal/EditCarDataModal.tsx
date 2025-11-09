import React, { useState } from 'react';
import Modal from '../../ui/Modal/Modal';
import { CarDataEntry, CarDataField } from '../../../types';

interface EditCarDataModalProps {
  data: CarDataEntry;
  onClose: () => void;
  onSave: (dataId: string, updatedData: { fields: CarDataField[] }) => void;
}

const EditCarDataModal: React.FC<EditCarDataModalProps> = ({ data, onClose, onSave }) => {
  const [fields, setFields] = useState<CarDataField[]>(data.fields);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    onSave(data.id, { fields });
  };

  const updateField = (index: number, field: Partial<CarDataField>) => {
    const updatedFields = fields.map((f, i) => 
      i === index ? { ...f, ...field } : f
    );
    setFields(updatedFields);
  };

  const addField = () => {
    setFields([...fields, { name: '', value: '', unit: '' }]);
  };

  const removeField = (index: number) => {
    const updatedFields = fields.filter((_, i) => i !== index);
    setFields(updatedFields);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Редактировать данные" size="lg">
      <form className="modal__form" onSubmit={handleSubmit}>
        
        {/* Редактирование данных */}
        <div className="card card--compact">
          <div className="card__header">
            <h3 className="card__title card__title--sm">Редактирование данных</h3>
          </div>
          <div className="card__content">
            
            {/* Поля для редактирования */}
            <div className="modal__edit-fields">
              {fields.map((field, index) => (
                <div key={index} className="modal__field-row">
                  <input
                    type="text"
                    placeholder="Название параметра"
                    value={field.name}
                    onChange={(e) => updateField(index, { name: e.target.value })}
                    className="modal__input"
                  />
                  <input
                    type="text"
                    placeholder="Значение"
                    value={field.value}
                    onChange={(e) => updateField(index, { value: e.target.value })}
                    className="modal__input"
                  />
                  <input
                    type="text"
                    placeholder="Ед. измерения"
                    value={field.unit}
                    onChange={(e) => updateField(index, { unit: e.target.value })}
                    className="modal__input"
                  />
                  <button
                    type="button"
                    onClick={() => removeField(index)}
                    className="btn btn--danger btn--sm modal__remove-button"
                    disabled={fields.length === 1}
                  >
                    Отмена
                  </button>
                </div>
              ))}
            </div>

            {/* Кнопка добавления поля */}
            <div className="modal__actions">
              <button
                type="button"
                onClick={addField}
                className="btn btn--secondary btn--sm"
              >
                + Добавить поле
              </button>
            </div>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="modal__actions-container">
          <div className="modal__actions modal__actions--centered">
            <button type="button" className="btn btn--secondary" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="btn btn--action">
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