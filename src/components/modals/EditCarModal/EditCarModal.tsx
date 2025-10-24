import React, { useState, useEffect } from 'react';
import Modal from '../../ui/Modal/Modal';
import { CarFormData, CarDataEntry, CarDataField } from '../../../types';
import { engineTypes, transmissionTypes } from '../../../data/carBrands';

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
      <form className="modal__form" onSubmit={handleSubmit}>
        
        {/* Основные данные автомобиля */}
        <div className="card card--compact">
          <div className="card__header">
            <h3 className="card__title card__title--sm">Основные данные</h3>
          </div>
          <div className="card__content">
            <div className="modal__form-grid">
              <div className="modal__form-group">
                <label className="modal__label modal__label--required">Марка</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  required
                  className="modal__input"
                />
              </div>

              <div className="modal__form-group">
                <label className="modal__label modal__label--required">Модель</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  required
                  className="modal__input"
                />
              </div>

              <div className="modal__form-group">
                <label className="modal__label modal__label--required">Год выпуска</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                  required
                  min="1950"
                  max={new Date().getFullYear()}
                  className="modal__input"
                />
              </div>

              <div className="modal__form-group">
                <label className="modal__label">Двигатель</label>
                <select
                  value={formData.engineType}
                  onChange={(e) => setFormData({...formData, engineType: e.target.value as any})}
                  className="modal__input"
                >
                  {engineTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal__form-group">
                <label className="modal__label">Коробка передач</label>
                <select
                  value={formData.transmission}
                  onChange={(e) => setFormData({...formData, transmission: e.target.value as any})}
                  className="modal__input"
                >
                  {transmissionTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal__form-group">
                <label className="modal__label">VIN-код</label>
                <input
                  type="text"
                  value={formData.vin}
                  onChange={(e) => setFormData({...formData, vin: e.target.value})}
                  placeholder="Необязательно"
                  className="modal__input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Секция дополнительных данных */}
        {carDataEntries.length > 0 && (
          <div className="card card--compact">
            <div className="card__header">
              <div className="card__main-info">
                <h3 className="card__title card__title--sm">Дополнительные данные</h3>
                <p className="card__description">
                  Управление дополнительными характеристиками автомобиля
                </p>
              </div>
            </div>
            <div className="card__content">
              <div className="modal__data-list">
                {carDataEntries.map((dataEntry) => (
                  <div key={dataEntry.id} className="card card--compact modal__data-item">
                    {editingDataId === dataEntry.id ? (
                      // Режим редактирования
                      <div className="modal__edit-mode">
                        <div className="modal__edit-fields">
                          {editingDataFields.map((field, index) => (
                            <div key={index} className="modal__field-row">
                              <input
                                type="text"
                                placeholder="Название параметра"
                                value={field.name}
                                onChange={(e) => updateEditingField(index, { name: e.target.value })}
                                className="modal__input modal__input--sm"
                              />
                              <input
                                type="text"
                                placeholder="Значение"
                                value={field.value}
                                onChange={(e) => updateEditingField(index, { value: e.target.value })}
                                className="modal__input modal__input--sm"
                              />
                              <input
                                type="text"
                                placeholder="Ед. измерения"
                                value={field.unit}
                                onChange={(e) => updateEditingField(index, { unit: e.target.value })}
                                className="modal__input modal__input--sm"
                              />
                              <button
                                type="button"
                                onClick={() => removeEditingField(index)}
                                className="btn btn--danger btn--sm modal__remove-button"
                                disabled={editingDataFields.length === 1}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="modal__actions modal__actions--between">
                          <button
                            type="button"
                            onClick={addEditingField}
                            className="btn btn--secondary btn--sm"
                          >
                            + Добавить поле
                          </button>
                          <div className="modal__field-actions">
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
                      <div className="modal__view-mode">
                        <div className="card__content">
                          <div className="modal__data-fields">
                            {dataEntry.fields.map((field, index) => (
                              <div key={index} className="modal__data-field">
                                <span className="modal__field-name">{field.name}</span>
                                <span className="modal__field-value">
                                  {field.value} {field.unit && <span className="modal__field-unit">{field.unit}</span>}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="modal__data-meta">
                            <span className="modal__data-date">
                              {formatDate(dataEntry.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className="card__actions">
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
          </div>
        )}

        {/* Кнопки действий */}
        <div className="modal__actions modal__actions--between">
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