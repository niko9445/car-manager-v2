import React, { useState } from 'react';
import Modal from '../../ui/Modal/Modal';
import { AdditionalItem, MaintenanceFormData } from '../../../types';

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
      <form className="modal__form" onSubmit={handleSubmit}>
        
        {/* Основные параметры */}
        <div className="card card--compact">
          <div className="card__header">
            <h3 className="card__title card__title--sm">Основные параметры</h3>
          </div>
          <div className="card__content">
            <div className="modal__form-grid">
              <div className="modal__form-group">
                <label className="modal__label modal__label--required">Пробег (км)</label>
                <input
                  type="number"
                  className="modal__input"
                  value={formData.mileage}
                  onChange={(e) => setFormData({...formData, mileage: e.target.value})}
                  required
                  min="0"
                  placeholder="Текущий пробег автомобиля"
                />
              </div>

              <div className="modal__form-group">
                <label className="modal__label">Затраты (BYN)</label>
                <input
                  type="number"
                  className="modal__input"
                  value={formData.cost}
                  onChange={(e) => setFormData({...formData, cost: e.target.value})}
                  min="0"
                  placeholder="Необязательно"
                />
              </div>

              <div className="modal__form-group">
                <label className="modal__label">Интервал замены масла (км)</label>
                <input
                  type="number"
                  className="modal__input"
                  value={formData.oilChangeStep}
                  onChange={(e) => setFormData({...formData, oilChangeStep: e.target.value})}
                  required
                  min="1000"
                />
              </div>

              <div className="modal__form-group">
                <label className="modal__label">Интервал замены фильтров (км)</label>
                <input
                  type="number"
                  className="modal__input"
                  value={formData.filterChangeStep}
                  onChange={(e) => setFormData({...formData, filterChangeStep: e.target.value})}
                  required
                  min="1000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Дополнительные работы */}
        <div className="card card--compact">
          <div className="card__header">
            <div className="card__main-info">
              <h3 className="card__title card__title--sm">Дополнительные работы</h3>
              <p className="card__description">
                Добавьте дополнительные выполненные работы или замененные детали
              </p>
            </div>
          </div>
          <div className="card__content">
            
            {/* Форма добавления нового элемента */}
            <div className="modal__add-grid">
              <input
                type="text"
                className="modal__input"
                placeholder="Название работы"
                value={newAdditionalItem.name}
                onChange={(e) => setNewAdditionalItem({...newAdditionalItem, name: e.target.value})}
              />
              <input
                type="text"
                className="modal__input"
                placeholder="Значение"
                value={newAdditionalItem.value}
                onChange={(e) => setNewAdditionalItem({...newAdditionalItem, value: e.target.value})}
              />
              <input
                type="text"
                className="modal__input"
                placeholder="Ед. измерения"
                value={newAdditionalItem.unit}
                onChange={(e) => setNewAdditionalItem({...newAdditionalItem, unit: e.target.value})}
              />
              <button 
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={addAdditionalItem}
                disabled={!newAdditionalItem.name || !newAdditionalItem.value}
              >
                Добавить
              </button>
            </div>

            {/* Список добавленных элементов */}
            {formData.additionalItems.length > 0 && (
              <div className="modal__items-list">
                {formData.additionalItems.map((item, index) => (
                  <div key={index} className="modal__item">
                    <span className="modal__item-text">
                      {item.name}: {item.value} {item.unit || ''}
                    </span>
                    <button 
                      type="button"
                      className="btn btn--danger btn--sm modal__item-remove"
                      onClick={() => removeAdditionalItem(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="modal__actions modal__actions--between">
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