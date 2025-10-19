import React, { useState } from 'react';
import Modal from '../../ui/Modal/Modal';
import { AdditionalItem, MaintenanceFormData } from '../../../types';
import './AddMaintenanceModal.css';

interface AddMaintenanceModalProps {
  onClose: () => void;
  onSave: (maintenanceData: MaintenanceFormData) => void;
}

const AddMaintenanceModal: React.FC<AddMaintenanceModalProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    mileage: '',
    oilChangeStep: '10000',
    filterChangeStep: '15000',
    cost: '',
    additionalItems: [] as AdditionalItem[]
  });

  const [newAdditionalItem, setNewAdditionalItem] = useState<AdditionalItem>({
    name: '',
    value: '',
    unit: ''
  });

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (formData.mileage) {
      onSave({
        ...formData,
        mileage: parseInt(formData.mileage),
        oilChangeStep: parseInt(formData.oilChangeStep),
        filterChangeStep: parseInt(formData.filterChangeStep),
        cost: formData.cost ? parseInt(formData.cost) : null,
        additionalItems: formData.additionalItems
      });
    }
  };

  const addAdditionalItem = (): void => {
    if (newAdditionalItem.name && newAdditionalItem.value) {
      setFormData({
        ...formData,
        additionalItems: [...formData.additionalItems, { ...newAdditionalItem }]
      });
      setNewAdditionalItem({ name: '', value: '', unit: '' });
    }
  };

  const removeAdditionalItem = (index: number): void => {
    const updatedItems = formData.additionalItems.filter((_, i) => i !== index);
    setFormData({ ...formData, additionalItems: updatedItems });
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Добавить ТО" size="lg">
      <form className="form form--gap-lg" onSubmit={handleSubmit}>
        <div className="form__section">
          <h3 className="form__subtitle">Основные параметры</h3>
          <div className="form__fields form__fields--grid">
            <div className="form__group">
              <label className="form__label form__label--required">Пробег (км)</label>
              <input
                type="number"
                className="form__input"
                value={formData.mileage}
                onChange={(e) => setFormData({...formData, mileage: e.target.value})}
                required
                min="0"
                placeholder="Текущий пробег автомобиля"
              />
            </div>

            <div className="form__group">
              <label className="form__label">Затраты (BYN)</label>
              <input
                type="number"
                className="form__input"
                value={formData.cost}
                onChange={(e) => setFormData({...formData, cost: e.target.value})}
                min="0"
                placeholder="Необязательно"
              />
            </div>

            <div className="form__group">
              <label className="form__label">Интервал замены масла (км)</label>
              <input
                type="number"
                className="form__input"
                value={formData.oilChangeStep}
                onChange={(e) => setFormData({...formData, oilChangeStep: e.target.value})}
                required
                min="1000"
              />
            </div>

            <div className="form__group">
              <label className="form__label">Интервал замены фильтров (км)</label>
              <input
                type="number"
                className="form__input"
                value={formData.filterChangeStep}
                onChange={(e) => setFormData({...formData, filterChangeStep: e.target.value})}
                required
                min="1000"
              />
            </div>
          </div>
        </div>

        {/* Дополнительные работы */}
        <div className="form__section">
          <div className="form__section-header">
            <h3 className="form__subtitle">Дополнительные работы</h3>
            <p className="form__description">
              Добавьте дополнительные выполненные работы или замененные детали
            </p>
          </div>

          <div className="form__add-grid">
            <input
              type="text"
              className="form__input"
              placeholder="Название работы"
              value={newAdditionalItem.name}
              onChange={(e) => setNewAdditionalItem({...newAdditionalItem, name: e.target.value})}
            />
            <input
              type="text"
              className="form__input"
              placeholder="Значение"
              value={newAdditionalItem.value}
              onChange={(e) => setNewAdditionalItem({...newAdditionalItem, value: e.target.value})}
            />
            <input
              type="text"
              className="form__input"
              placeholder="Ед. измерения"
              value={newAdditionalItem.unit}
              onChange={(e) => setNewAdditionalItem({...newAdditionalItem, unit: e.target.value})}
            />
            <button 
              type="button"
              className="form__add-action"
              onClick={addAdditionalItem}
              disabled={!newAdditionalItem.name || !newAdditionalItem.value}
            >
              Добавить
            </button>
          </div>

          {formData.additionalItems.length > 0 && (
            <div className="form__items-list">
              {formData.additionalItems.map((item, index) => (
                <div key={index} className="form__item">
                  <span className="form__item-text">
                    {item.name}: {item.value} {item.unit || ''}
                  </span>
                  <button 
                    type="button"
                    className="form__item-remove"
                    onClick={() => removeAdditionalItem(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form__actions">
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Отмена
          </button>
          <button 
            type="submit" 
            className="btn btn--primary"
            disabled={!formData.mileage}
          >
            Добавить ТО
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddMaintenanceModal;