import React, { useState } from 'react';
import Modal from '../../ui/Modal/Modal';
import { CarDataEntry, CarDataField } from '../../../types';

interface EditCarDataModalProps {
  data: CarDataEntry;
  onClose: () => void;
  onSave: (dataId: string, updatedData: { fields: CarDataField[] }) => void;
}

const EditCarDataModal: React.FC<EditCarDataModalProps> = ({ data, onClose, onSave }) => {
  // Берем только первое поле (теперь всегда одно поле)
  const [field, setField] = useState<CarDataField>(data.fields[0]);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    // Передаем массив с одним полем
    onSave(data.id, { fields: [field] });
  };

  const updateField = (updates: Partial<CarDataField>) => {
    setField(prev => ({ ...prev, ...updates }));
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Редактировать данные" size="md">
      <form className="modal__form" onSubmit={handleSubmit}>
        
        {/* Редактирование данных */}
        <div className="card card--compact">
          <div className="card__header">
            <h3 className="card__title card__title--sm">Редактирование данных</h3>
          </div>
          <div className="card__content">
            
            {/* Одно поле для редактирования */}
            <div className="modal__form-grid">
              <div className="modal__form-group">
                <label className="modal__label">Название параметра</label>
                <input
                  type="text"
                  placeholder="Название параметра"
                  value={field.name}
                  onChange={(e) => updateField({ name: e.target.value })}
                  className="modal__input"
                  required
                />
              </div>

              <div className="modal__form-group">
                <label className="modal__label">Значение</label>
                <input
                  type="text"
                  placeholder="Значение"
                  value={field.value}
                  onChange={(e) => updateField({ value: e.target.value })}
                  className="modal__input"
                  required
                />
              </div>

              <div className="modal__form-group">
                <label className="modal__label">Единица измерения</label>
                <input
                  type="text"
                  placeholder="Ед. измерения"
                  value={field.unit}
                  onChange={(e) => updateField({ unit: e.target.value })}
                  className="modal__input"
                />
              </div>
            </div>
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
              disabled={!field.name.trim() || !field.value.trim()}
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