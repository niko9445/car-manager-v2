import React, { useState } from 'react';
import Modal from '../../ui/Modal/Modal';
import { CarDataEntry, CarDataField } from '../../../types';
import './EditCarDataModal.css';

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
      <form className="form form--gap-lg" onSubmit={handleSubmit}>
        <div className="form__section">
          <h3 className="form__subtitle">Редактирование данных</h3>
          <div className="form__fields">
            {fields.map((field, index) => (
              <div key={index} className="form__field-row">
                <input
                  type="text"
                  placeholder="Название параметра"
                  value={field.name}
                  onChange={(e) => updateField(index, { name: e.target.value })}
                  className="form__input"
                />
                <input
                  type="text"
                  placeholder="Значение"
                  value={field.value}
                  onChange={(e) => updateField(index, { value: e.target.value })}
                  className="form__input"
                />
                <input
                  type="text"
                  placeholder="Ед. измерения"
                  value={field.unit}
                  onChange={(e) => updateField(index, { unit: e.target.value })}
                  className="form__input"
                />
                <button
                  type="button"
                  onClick={() => removeField(index)}
                  className="form__remove-button"
                  disabled={fields.length === 1}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addField}
            className="form__add-button"
          >
            + Добавить поле
          </button>
        </div>

        <div className="form__actions">
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Отмена
          </button>
          <button type="submit" className="btn btn--primary">
            Сохранить изменения
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditCarDataModal;