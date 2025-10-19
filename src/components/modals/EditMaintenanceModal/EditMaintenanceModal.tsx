import React, { useState, useEffect } from 'react';
import Modal from '../../ui/Modal/Modal';
import { EditMaintenanceModalProps, AdditionalItem } from '../../../types';
import './EditMaintenanceModal.css';

const EditMaintenanceModal: React.FC<EditMaintenanceModalProps> = ({ 
  maintenance, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    mileage: '',
    cost: '',
    oilChangeStep: '',
    filterChangeStep: '',
    additionalItems: [] as AdditionalItem[]
  });

  const [newItem, setNewItem] = useState<AdditionalItem>({ 
    name: '', 
    value: '', 
    unit: '' 
  });

  useEffect(() => {
    if (maintenance) {
      setFormData({
        mileage: maintenance.mileage.toString(),
        cost: maintenance.cost?.toString() || '',
        oilChangeStep: maintenance.oilChangeStep.toString(),
        filterChangeStep: maintenance.filterChangeStep.toString(),
        additionalItems: maintenance.additionalItems || []
      });
    }
  }, [maintenance]);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (formData.mileage) {
      const updatedData = {
        mileage: parseInt(formData.mileage),
        cost: formData.cost ? parseInt(formData.cost) : null,
        oilChangeStep: parseInt(formData.oilChangeStep),
        filterChangeStep: parseInt(formData.filterChangeStep),
        additionalItems: formData.additionalItems
      };
      onSave(maintenance.id, updatedData);
    }
  };

  const handleInputChange = (field: string, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addAdditionalItem = (): void => {
    if (newItem.name.trim() && newItem.value.trim()) {
      setFormData({
        ...formData,
        additionalItems: [...formData.additionalItems, { ...newItem }]
      });
      setNewItem({ name: '', value: '', unit: '' });
    }
  };

  const removeAdditionalItem = (index: number): void => {
    const updatedItems = formData.additionalItems.filter((_, i) => i !== index);
    setFormData({ ...formData, additionalItems: updatedItems });
  };

  const updateNewItem = (field: keyof AdditionalItem, value: string): void => {
    setNewItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Редактировать ТО" size="lg">
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
                onChange={(e) => handleInputChange('mileage', e.target.value)}
                min="0"
                required
              />
            </div>
            
            <div className="form__group">
              <label className="form__label">Затраты (BYN)</label>
              <input
                type="number"
                className="form__input"
                value={formData.cost}
                onChange={(e) => handleInputChange('cost', e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            <div className="form__group">
              <label className="form__label">Интервал замены масла (км)</label>
              <input
                type="number"
                className="form__input"
                value={formData.oilChangeStep}
                onChange={(e) => handleInputChange('oilChangeStep', e.target.value)}
                min="0"
                required
              />
            </div>
            
            <div className="form__group">
              <label className="form__label">Интервал замены фильтров (км)</label>
              <input
                type="number"
                className="form__input"
                value={formData.filterChangeStep}
                onChange={(e) => handleInputChange('filterChangeStep', e.target.value)}
                min="0"
                required
              />
            </div>
          </div>
        </div>

        {/* Дополнительные работы */}
        <div className="form__section">
          <div className="form__section-header">
            <h3 className="form__subtitle">Дополнительные работы</h3>
            <p className="form__description">
              Управление дополнительными работами или замененными деталями
            </p>
          </div>

          <div className="form__add-grid">
            <input
              type="text"
              className="form__input"
              value={newItem.name}
              onChange={(e) => updateNewItem('name', e.target.value)}
              placeholder="Название работы"
            />
            <input
              type="text"
              className="form__input"
              value={newItem.value}
              onChange={(e) => updateNewItem('value', e.target.value)}
              placeholder="Значение"
            />
            <input
              type="text"
              className="form__input"
              value={newItem.unit}
              onChange={(e) => updateNewItem('unit', e.target.value)}
              placeholder="Единица измерения"
            />
            <button 
              type="button" 
              className="form__add-action"
              onClick={addAdditionalItem}
              disabled={!newItem.name.trim() || !newItem.value.trim()}
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
          <button type="submit" className="btn btn--primary">
            Сохранить изменения
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditMaintenanceModal;