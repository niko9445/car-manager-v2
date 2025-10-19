import React, { useState, useEffect } from 'react';
import Modal from '../../ui/Modal/Modal';
import { CarFormData, CarDataEntry, CarDataField } from '../../../types';
import { engineTypes, transmissionTypes } from '../../../data/carBrands';
import './EditCarModal.css';

interface EditCarModalProps {
  car: any;
  carDataEntries: CarDataEntry[];
  onClose: () => void;
  onSave: (carId: string, carData: CarFormData) => void;
  onEditCarData: (carId: string, dataId: string, updatedData: { fields: CarDataField[] }) => void;
  onDeleteCarData: (carId: string, dataId: string) => void;
}

const EditCarModal: React.FC<EditCarModalProps> = ({ 
  car, 
  carDataEntries = [], 
  onClose, 
  onSave,
  onEditCarData,
  onDeleteCarData
}) => {
  const [formData, setFormData] = useState<CarFormData>({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    engineType: 'petrol',
    transmission: 'manual',
    vin: ''
  });

  const [editingDataId, setEditingDataId] = useState<string | null>(null);
  const [editingDataFields, setEditingDataFields] = useState<CarDataField[]>([]);

  useEffect(() => {
    if (car) {
      setFormData({
        brand: car.brand || '',
        model: car.model || '',
        year: car.year || new Date().getFullYear(),
        engineType: car.engineType || 'petrol',
        transmission: car.transmission || 'manual',
        vin: car.vin || ''
      });
    }
  }, [car]);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (formData.brand && formData.model) {
      onSave(car.id, formData);
    }
  };

  const startEditingData = (dataEntry: CarDataEntry) => {
    setEditingDataId(dataEntry.id);
    setEditingDataFields([...dataEntry.fields]);
  };

  const cancelEditingData = () => {
    setEditingDataId(null);
    setEditingDataFields([]);
  };

  const handleSaveEditedData = (dataId: string) => {
    const validFields = editingDataFields.filter(field => field.name.trim() && field.value.trim());
    if (validFields.length > 0) {
      onEditCarData(car.id, dataId, { fields: validFields });
      setEditingDataId(null);
    }
  };

  const updateEditingField = (index: number, field: Partial<CarDataField>) => {
    const updatedFields = editingDataFields.map((f, i) => 
      i === index ? { ...f, ...field } : f
    );
    setEditingDataFields(updatedFields);
  };

  const addEditingField = () => {
    setEditingDataFields([...editingDataFields, { name: '', value: '', unit: '' }]);
  };

  const removeEditingField = (index: number) => {
    const updatedFields = editingDataFields.filter((_, i) => i !== index);
    setEditingDataFields(updatedFields);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Редактировать автомобиль" size="lg">
      <form className="form form--gap-lg" onSubmit={handleSubmit}>
        
        {/* Основные данные автомобиля */}
        <div className="form__section">
          <h3 className="form__subtitle">Основные данные</h3>
          <div className="form__fields form__fields--grid">
            <div className="form__group">
              <label className="form__label form__label--required">Марка</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                required
                className="form__input"
              />
            </div>

            <div className="form__group">
              <label className="form__label form__label--required">Модель</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({...formData, model: e.target.value})}
                required
                className="form__input"
              />
            </div>

            <div className="form__group">
              <label className="form__label form__label--required">Год выпуска</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                required
                min="1950"
                max={new Date().getFullYear()}
                className="form__input"
              />
            </div>

            <div className="form__group">
              <label className="form__label">Двигатель</label>
              <select
                value={formData.engineType}
                onChange={(e) => setFormData({...formData, engineType: e.target.value as any})}
                className="form__select"
              >
                {engineTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form__group">
              <label className="form__label">Коробка передач</label>
              <select
                value={formData.transmission}
                onChange={(e) => setFormData({...formData, transmission: e.target.value as any})}
                className="form__select"
              >
                {transmissionTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form__group">
              <label className="form__label">VIN-код</label>
              <input
                type="text"
                value={formData.vin}
                onChange={(e) => setFormData({...formData, vin: e.target.value})}
                placeholder="Необязательно"
                className="form__input"
              />
            </div>
          </div>
        </div>

        {/* Секция дополнительных данных */}
        {carDataEntries.length > 0 && (
          <div className="form__section">
            <div className="form__section-header">
              <h3 className="form__subtitle">Дополнительные данные</h3>
              <p className="form__description">
                Управление дополнительными характеристиками автомобиля
              </p>
            </div>

            <div className="editcarmodal__data-list">
              {carDataEntries.map((dataEntry) => (
                <div key={dataEntry.id} className="editcarmodal__data-item">
                  {editingDataId === dataEntry.id ? (
                    // Режим редактирования
                    <div className="editcarmodal__edit-mode">
                      <div className="editcarmodal__edit-fields">
                        {editingDataFields.map((field, index) => (
                          <div key={index} className="form__field-row">
                            <input
                              type="text"
                              placeholder="Название параметра"
                              value={field.name}
                              onChange={(e) => updateEditingField(index, { name: e.target.value })}
                              className="form__input form__input--sm"
                            />
                            <input
                              type="text"
                              placeholder="Значение"
                              value={field.value}
                              onChange={(e) => updateEditingField(index, { value: e.target.value })}
                              className="form__input form__input--sm"
                            />
                            <input
                              type="text"
                              placeholder="Ед. измерения"
                              value={field.unit}
                              onChange={(e) => updateEditingField(index, { unit: e.target.value })}
                              className="form__input form__input--sm"
                            />
                            <button
                              type="button"
                              onClick={() => removeEditingField(index)}
                              className="form__remove-button"
                              disabled={editingDataFields.length === 1}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="form__actions form__actions--between">
                        <button
                          type="button"
                          onClick={addEditingField}
                          className="btn btn--outline btn--sm"
                        >
                          + Добавить поле
                        </button>
                        <div className="form__field-actions">
                          <button
                            type="button"
                            onClick={cancelEditingData}
                            className="btn btn--secondary btn--sm"
                          >
                            Отмена
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEditedData(dataEntry.id)}
                            className="btn btn--primary btn--sm"
                            disabled={!editingDataFields.some(field => field.name.trim() && field.value.trim())}
                          >
                            Сохранить
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Режим просмотра
                    <div className="editcarmodal__view-mode">
                      <div className="editcarmodal__data-content">
                        <div className="editcarmodal__data-fields">
                          {dataEntry.fields.map((field, index) => (
                            <div key={index} className="editcarmodal__data-field">
                              <span className="editcarmodal__field-name">{field.name}</span>
                              <span className="editcarmodal__field-value">
                                {field.value} {field.unit && <span className="editcarmodal__field-unit">{field.unit}</span>}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="editcarmodal__data-meta">
                          <span className="editcarmodal__data-date">
                            {formatDate(dataEntry.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="editcarmodal__data-actions">
                        <button
                          type="button"
                          onClick={() => startEditingData(dataEntry)}
                          className="btn btn--primary btn--sm"
                        >
                          Редактировать
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteCarData(car.id, dataEntry.id)}
                          className="btn btn--danger btn--sm"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* КНОПКИ ДЕЙСТВИЙ - В КОНЦЕ ФОРМЫ ДЛЯ ВСЕХ ВЕРСИЙ */}
        <div className="form__actions">
          <button 
            type="button" 
            onClick={onClose}
            className="btn btn--secondary"
          >
            Отмена
          </button>
          <button 
            type="submit" 
            className="btn btn--primary"
            disabled={!formData.brand || !formData.model}
          >
            Сохранить изменения
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditCarModal;