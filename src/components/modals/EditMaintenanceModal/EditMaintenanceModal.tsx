import React, { useState, useEffect } from 'react';
import Modal from '../../ui/Modal/Modal';
import { EditMaintenanceModalProps, AdditionalItem } from '../../../types';

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
                  onChange={(e) => handleInputChange('mileage', e.target.value)}
                  min="0"
                  required
                />
              </div>
              
              <div className="modal__form-group">
                <label className="modal__label">Затраты (BYN)</label>
                <input
                  type="number"
                  className="modal__input"
                  value={formData.cost}
                  onChange={(e) => handleInputChange('cost', e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="modal__form-group">
                <label className="modal__label">Интервал замены масла (км)</label>
                <input
                  type="number"
                  className="modal__input"
                  value={formData.oilChangeStep}
                  onChange={(e) => handleInputChange('oilChangeStep', e.target.value)}
                  min="0"
                  required
                />
              </div>
              
              <div className="modal__form-group">
                <label className="modal__label">Интервал замены фильтров (км)</label>
                <input
                  type="number"
                  className="modal__input"
                  value={formData.filterChangeStep}
                  onChange={(e) => handleInputChange('filterChangeStep', e.target.value)}
                  min="0"
                  required
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
                Управление дополнительными работами или замененными деталями
              </p>
            </div>
          </div>
          <div className="card__content">
            
            {/* Форма добавления нового элемента */}
            <div className="modal__add-grid">
              <input
                type="text"
                className="modal__input"
                value={newItem.name}
                onChange={(e) => updateNewItem('name', e.target.value)}
                placeholder="Название работы"
              />
              <input
                type="text"
                className="modal__input"
                value={newItem.value}
                onChange={(e) => updateNewItem('value', e.target.value)}
                placeholder="Значение"
              />
              <input
                type="text"
                className="modal__input"
                value={newItem.unit}
                onChange={(e) => updateNewItem('unit', e.target.value)}
                placeholder="Единица измерения"
              />
              <button 
                type="button" 
                className="btn btn--secondary btn--sm modal__add-button"
                onClick={addAdditionalItem}
                disabled={!newItem.name.trim() || !newItem.value.trim()}
              >
                Добавить
              </button>
            </div>
            
            {/* Список добавленных элементов */}
            {formData.additionalItems.length > 0 && (
              <div className="modal__items-list">
                {formData.additionalItems.map((item, index) => (
                  <div key={index} className="modal__item">
                    <div className="modal__item-content">
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
          <button type="submit" className="btn btn--primary">
            Сохранить изменения
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditMaintenanceModal;