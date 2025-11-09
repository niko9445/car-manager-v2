import React, { useState, useEffect } from 'react';
import Modal from '../../ui/Modal/Modal';
import { EditMaintenanceModalProps, AdditionalItem } from '../../../types';
import { useCurrency } from '../../../contexts/CurrencyContext'; // ← ДОБАВИТЬ

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
    date: '',
    additionalItems: [] as AdditionalItem[]
  });

  const [newItem, setNewItem] = useState<AdditionalItem>({ 
    name: '', 
    value: '', 
    unit: '' 
  });

  const { getCurrencySymbol } = useCurrency(); // ← ДОБАВИТЬ

  useEffect(() => {
    if (maintenance) {
      setFormData({
        mileage: maintenance.mileage.toString(),
        cost: maintenance.cost?.toString() || '',
        oilChangeStep: maintenance.oilChangeStep.toString(),
        filterChangeStep: maintenance.filterChangeStep.toString(),
        date: maintenance.date,
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
        date: formData.date,
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

  const startEditingItem = (index: number): void => {
    setEditingIndex(index);
    setEditingItem({ ...formData.additionalItems[index] });
  };

  const saveEditingItem = (): void => {
    if (editingIndex !== null) {
      const updatedItems = [...formData.additionalItems];
      updatedItems[editingIndex] = { ...editingItem };
      
      setFormData({
        ...formData,
        additionalItems: updatedItems
      });
      
      cancelEditing();
    }
  };

  const cancelEditing = (): void => {
    setEditingIndex(null);
    setEditingItem({ name: '', value: '', unit: '' });
  };

  const updateEditingItem = (field: keyof AdditionalItem, value: string): void => {
    setEditingItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNewItem = (field: keyof AdditionalItem, value: string): void => {
    setNewItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<AdditionalItem>({ 
    name: '', 
    value: '', 
    unit: '' 
  });

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
                <label className="modal__label modal__label--required">Дата ТО</label>
                <input
                  type="date"
                  className="modal__input"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  required
                />
              </div>
              
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
              
              {/* ИСПРАВЛЕНО: Затраты с текущей валютой */}
              <div className="modal__form-group">
                <label className="modal__label">Затраты ({getCurrencySymbol()})</label>
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
                    {editingIndex === index ? (
                      /* Режим редактирования */
                      <div className="modal__item-edit">
                        <div className="modal__edit-grid">
                          <input
                            type="text"
                            className="modal__input modal__input--sm"
                            value={editingItem.name}
                            onChange={(e) => updateEditingItem('name', e.target.value)}
                            placeholder="Название работы"
                          />
                          <input
                            type="text"
                            className="modal__input modal__input--sm"
                            value={editingItem.value}
                            onChange={(e) => updateEditingItem('value', e.target.value)}
                            placeholder="Значение"
                          />
                          <input
                            type="text"
                            className="modal__input modal__input--sm"
                            value={editingItem.unit}
                            onChange={(e) => updateEditingItem('unit', e.target.value)}
                            placeholder="Единица измерения"
                          />
                          <div className="modal__edit-actions">
                            <button 
                              type="button"
                              className="btn btn--primary btn--sm"
                              onClick={saveEditingItem}
                              disabled={!editingItem.name.trim() || !editingItem.value.trim()}
                            >
                              Сохранить
                            </button>
                            <button 
                              type="button"
                              className="btn btn--secondary btn--sm"
                              onClick={cancelEditing}
                            >
                              Отмена
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Режим просмотра */
                      <div className="modal__item-content">
                        <div className="modal__item-info">
                          <span className="modal__item-name">{item.name}</span>
                          <span className="modal__item-value">
                            {item.value} {item.unit || ''}
                          </span>
                        </div>
                        <div className="modal__item-actions">
                          <button 
                            type="button"
                            className="btn btn--secondary btn--sm"
                            onClick={() => startEditingItem(index)}
                          >
                            Редактировать
                          </button>
                          <button 
                            type="button"
                            className="btn btn--danger btn--sm"
                            onClick={() => removeAdditionalItem(index)}
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    )}
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

export default EditMaintenanceModal;