import React, { useState, useEffect } from 'react';
import Modal from '../../ui/Modal/Modal';
import { CarFormData, CarDataEntry, CarDataField } from '../../../types';
import { engineTypes, transmissionTypes } from '../../../data/carBrands';
import { useTranslation } from '../../../contexts/LanguageContext'; // <-- ДОБАВИТЬ

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
  const [editingDataField, setEditingDataField] = useState<CarDataField>({ name: '', value: '', unit: '' });
  const { t } = useTranslation(); // <-- ДОБАВИТЬ

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
    // Берем только первое поле (теперь всегда одно поле)
    setEditingDataField(dataEntry.fields[0] || { name: '', value: '', unit: '' });
  };

  const cancelEditingData = () => {
    setEditingDataId(null);
    setEditingDataField({ name: '', value: '', unit: '' });
  };

  const handleSaveEditedData = (dataId: string) => {
    if (editingDataField.name.trim() && editingDataField.value.trim()) {
      // Передаем массив с одним полем
      onEditCarData(car.id, dataId, { fields: [editingDataField] });
      setEditingDataId(null);
    }
  };

  const updateEditingField = (updates: Partial<CarDataField>) => {
    setEditingDataField(prev => ({ ...prev, ...updates }));
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={t('cars.editCar')} size="lg"> {/* <-- ПЕРЕВОД */}
      <form className="modal__form" onSubmit={handleSubmit}>
        
        {/* Основные данные автомобиля */}
        <div className="card card--compact">
          <div className="card__header">
            <h3 className="card__title card__title--sm">{t('carData.mainData')}</h3> {/* <-- ПЕРЕВОД */}
          </div>
          <div className="card__content">
            <div className="modal__form-grid">
              <div className="modal__form-group">
                <label className="modal__label modal__label--required">{t('cars.brand')}</label> {/* <-- ПЕРЕВОД */}
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  required
                  className="modal__input"
                />
              </div>

              <div className="modal__form-group">
                <label className="modal__label modal__label--required">{t('cars.model')}</label> {/* <-- ПЕРЕВОД */}
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  required
                  className="modal__input"
                />
              </div>

              <div className="modal__form-group">
                <label className="modal__label modal__label--required">{t('cars.year')}</label> {/* <-- ПЕРЕВОД */}
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
                <label className="modal__label">{t('cars.engineType')}</label> {/* <-- ПЕРЕВОД */}
                <select
                  value={formData.engineType}
                  onChange={(e) => setFormData({...formData, engineType: e.target.value as any})}
                  className="modal__input"
                >
                  {engineTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {t(`engineTypes.${type.value}`)} {/* <-- ПЕРЕВОД */}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal__form-group">
                <label className="modal__label">{t('cars.transmission')}</label> {/* <-- ПЕРЕВОД */}
                <select
                  value={formData.transmission}
                  onChange={(e) => setFormData({...formData, transmission: e.target.value as any})}
                  className="modal__input"
                >
                  {transmissionTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {t(`transmissionTypes.${type.value}`)} {/* <-- ПЕРЕВОД */}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal__form-group">
                <label className="modal__label">{t('cars.vin')}</label> {/* <-- ПЕРЕВОД */}
                <input
                  type="text"
                  value={formData.vin}
                  onChange={(e) => setFormData({...formData, vin: e.target.value})}
                  placeholder={t('common.optional')} 
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
                <h3 className="card__title card__title--sm">{t('carData.additionalData')}</h3> {/* <-- ПЕРЕВОД */}
              </div>
            </div>
            <div className="card__content">

              {/* Список дополнительных данных */}
              <div className="modal__items-list">
                {carDataEntries.map((dataEntry) => (
                  <div key={dataEntry.id} className="modal__item">
                    {editingDataId === dataEntry.id ? (
                      /* Режим редактирования - ТЕПЕРЬ ОДНО ПОЛЕ */
                      <div className="modal__item-edit">
                        <div className="modal__edit-grid">
                          <input
                            type="text"
                            className="modal__input modal__input--sm"
                            value={editingDataField.name}
                            onChange={(e) => updateEditingField({ name: e.target.value })}
                            placeholder={t('carData.parameterName')} 
                          />
                          <input
                            type="text"
                            className="modal__input modal__input--sm"
                            value={editingDataField.value}
                            onChange={(e) => updateEditingField({ value: e.target.value })}
                            placeholder={t('carData.value')} 
                          />
                          <input
                            type="text"
                            className="modal__input modal__input--sm"
                            value={editingDataField.unit}
                            onChange={(e) => updateEditingField({ unit: e.target.value })}
                            placeholder={t('carData.unit')} 
                          />
                          <div className="modal__edit-actions">
                            <button 
                              type="button"
                              className="btn btn--primary btn--sm"
                              onClick={() => handleSaveEditedData(dataEntry.id)}
                              disabled={!editingDataField.name.trim() || !editingDataField.value.trim()}
                            >
                              {t('common.save')} {/* <-- ПЕРЕВОД */}
                            </button>
                            <button 
                              type="button"
                              className="btn btn--secondary btn--sm"
                              onClick={cancelEditingData}
                            >
                              {t('common.cancel')} {/* <-- ПЕРЕВОД */}
                            </button>
                          </div>
                        </div>
                        {/* УДАЛИЛИ КНОПКУ ДОБАВЛЕНИЯ ПОЛЯ */}
                      </div>
                    ) : (
                      /* Режим просмотра - ТЕПЕРЬ ОДНО ПОЛЕ */
                      <div className="modal__item-content">
                        <div className="modal__item-info">
                          {/* Отображаем только первое поле */}
                          {dataEntry.fields[0] && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span className="modal__item-name">{dataEntry.fields[0].name}</span>
                              <span className="modal__item-value">
                                {dataEntry.fields[0].value} {dataEntry.fields[0].unit || ''}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="modal__item-actions">
                          <button 
                            type="button"
                            className="btn btn--secondary btn--sm"
                            onClick={() => startEditingData(dataEntry)}
                          >
                            {t('common.edit')} {/* <-- ПЕРЕВОД */}
                          </button>
                          <button 
                            type="button"
                            className="btn btn--danger btn--sm"
                            onClick={() => onDeleteCarData(car.id, dataEntry.id)}
                          >
                            {t('common.delete')} {/* <-- ПЕРЕВОД */}
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
        <div className="modal__actions-container">
          <div className="modal__actions modal__actions--centered">
            <button 
              type="button" 
              onClick={onClose}
              className="btn btn--cancel"
            >
              {t('common.cancel')} {/* <-- ПЕРЕВОД */}
            </button>
            <button 
              type="submit" 
              className="btn btn--action"
              disabled={!formData.brand || !formData.model}
            >
              {t('common.save')} {/* <-- ПЕРЕВОД */}
            </button>
          </div>
          
          <div className="modal__footer-signature">
            {t('app.copyright')} {/* <-- ПЕРЕВОД */}
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default EditCarModal;