import React, { useState } from 'react';
import Modal from '../../ui/Modal/Modal';
import { AdditionalItem, MaintenanceFormData } from '../../../types';
import { useCurrency } from '../../../contexts/CurrencyContext';

interface AddMaintenanceModalProps {
  onClose: () => void;
  onSave: (maintenanceData: MaintenanceFormData) => void;
}

const AddMaintenanceModal: React.FC<AddMaintenanceModalProps> = ({ onClose, onSave }) => {
  const { getCurrencySymbol } = useCurrency();
  const [formData, setFormData] = useState({
    mileage: '',
    oilChangeStep: '10000',
    filterChangeStep: '10000',
    cost: '',
    date: new Date().toISOString().split('T')[0], // ← ДОБАВЛЕНО поле даты
    additionalItems: [] as AdditionalItem[]
  });

  const [newAdditionalItem, setNewAdditionalItem] = useState<AdditionalItem>({
    name: '',
    value: '',
    unit: ''
  });

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (formData.mileage && formData.date) { // ← ДОБАВЛЕНА проверка даты
      onSave({
        ...formData,
        mileage: parseInt(formData.mileage),
        oilChangeStep: parseInt(formData.oilChangeStep),
        filterChangeStep: parseInt(formData.filterChangeStep),
        cost: formData.cost ? parseInt(formData.cost) : null,
        date: formData.date, // ← ПЕРЕДАЕМ дату
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
              {/* ← ДОБАВЛЕНО поле даты */}
              <div className="modal__form-group">
                <label className="modal__label modal__label--required">Дата</label>
                <input
                  type="date"
                  className="modal__input"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>

              <div className="modal__form-group">
                <label className="modal__label">Затраты ({getCurrencySymbol()})</label>
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
                      Удалить
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              disabled={!formData.mileage || !formData.date}
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

export default AddMaintenanceModal;