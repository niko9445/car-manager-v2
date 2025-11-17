import React, { useState, useEffect } from 'react';
import Modal from '../../ui/Modal/Modal';
import { CarFormData, CarDataEntry, CarDataField } from '../../../types';
import { engineTypes, transmissionTypes } from '../../../data/carBrands';
import { useTranslation } from '../../../contexts/LanguageContext';

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
  const { t } = useTranslation();

  // Функция для получения переведенного названия поля по ключу
  const getTranslatedFieldName = (fieldKey: string): string => {
    const translationMap: Record<string, string> = {
      'insurance': t('carDataFields.insurance'),
      'inspection': t('carDataFields.inspection'),
      'dimensions': t('carDataFields.dimensions'),
      'engineCode': t('carDataFields.engineCode'),
      'fuelType': t('carDataFields.fuelType'),
      'consumption': t('carDataFields.consumption'),
      'power': t('carDataFields.power'),
      'engineVolume': t('carDataFields.engineVolume'),
      'cost': t('carDataFields.cost'),
      'purchaseDate': t('carDataFields.purchaseDate'),
      'color': t('carDataFields.color'),
      'bodyType': t('carDataFields.bodyType'),
      'drive': t('carDataFields.drive'),
      'acceleration': t('carDataFields.acceleration'),
      'maxSpeed': t('carDataFields.maxSpeed'),
      'torque': t('carDataFields.torque'),
      'weight': t('carDataFields.weight'),
      'trunkVolume': t('carDataFields.trunkVolume'),
      'country': t('carDataFields.country'),
      'warranty': t('carDataFields.warranty'),
      'tax': t('carDataFields.tax')
    };
    return translationMap[fieldKey] || fieldKey;
  };

  // Список предопределенных полей для выбора при редактировании
  const predefinedFields = [
    { key: 'insurance', name: t('carDataFields.insurance'), unit: '' },
    { key: 'inspection', name: t('carDataFields.inspection'), unit: '' },
    { key: 'dimensions', name: t('carDataFields.dimensions'), unit: '' },
    { key: 'engineCode', name: t('carDataFields.engineCode'), unit: '' },
    { key: 'fuelType', name: t('carDataFields.fuelType'), unit: '' },
    { key: 'consumption', name: t('carDataFields.consumption'), unit: '' },
    { key: 'power', name: t('carDataFields.power'), unit: t('units.hp') },
    { key: 'engineVolume', name: t('carDataFields.engineVolume'), unit: t('units.liters') },
    { key: 'cost', name: t('carDataFields.cost'), unit: '₽' },
    { key: 'purchaseDate', name: t('carDataFields.purchaseDate'), unit: '' },
    { key: 'color', name: t('carDataFields.color'), unit: '' },
    { key: 'bodyType', name: t('carDataFields.bodyType'), unit: '' },
    { key: 'drive', name: t('carDataFields.drive'), unit: '' },
    { key: 'acceleration', name: t('carDataFields.acceleration'), unit: t('units.seconds') },
    { key: 'maxSpeed', name: t('carDataFields.maxSpeed'), unit: t('units.kmh') },
    { key: 'torque', name: t('carDataFields.torque'), unit: t('units.nm') },
    { key: 'weight', name: t('carDataFields.weight'), unit: t('units.kg') },
    { key: 'trunkVolume', name: t('carDataFields.trunkVolume'), unit: t('units.liters') },
    { key: 'country', name: t('carDataFields.country'), unit: '' },
    { key: 'warranty', name: t('carDataFields.warranty'), unit: t('units.months') },
    { key: 'tax', name: t('carDataFields.tax'), unit: `${'₽'}/${t('units.year')}` }
  ];

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
    const field = dataEntry.fields[0] || { name: '', value: '', unit: '' };
    
    // Находим переведенное название для текущего поля
    const predefinedField = predefinedFields.find(f => f.key === field.name);
    const displayName = predefinedField ? predefinedField.name : field.name;
    
    setEditingDataField({ 
      ...field, 
      name: displayName // Сохраняем переведенное имя для редактирования
    });
  };

  const cancelEditingData = () => {
    setEditingDataId(null);
    setEditingDataField({ name: '', value: '', unit: '' });
  };

  const handleSaveEditedData = (dataId: string) => {
    if (editingDataField.name.trim() && editingDataField.value.trim()) {
      // Находим ключ по переведенному имени
      const predefinedField = predefinedFields.find(f => f.name === editingDataField.name);
      const fieldKey = predefinedField ? predefinedField.key : editingDataField.name;
      
      const updatedField = {
        ...editingDataField,
        name: fieldKey, // Сохраняем ключ
        unit: predefinedField ? predefinedField.unit : editingDataField.unit
      };
      
      onEditCarData(car.id, dataId, { fields: [updatedField] });
      setEditingDataId(null);
    }
  };

  const updateEditingField = (updates: Partial<CarDataField>) => {
    setEditingDataField(prev => ({ ...prev, ...updates }));
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={t('cars.editCar')} size="lg">
      <form className="modal__form" onSubmit={handleSubmit}>
        
        {/* Основные данные автомобиля */}
        <div className="card card--compact">
          <div className="card__header">
            <h3 className="card__title card__title--sm">{t('carData.mainData')}</h3>
          </div>
          <div className="card__content">
            <div className="modal__form-grid">
              <div className="modal__form-group">
                <label className="modal__label modal__label--required">{t('cars.brand')}</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  required
                  className="modal__input"
                />
              </div>

              <div className="modal__form-group">
                <label className="modal__label modal__label--required">{t('cars.model')}</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  required
                  className="modal__input"
                />
              </div>

              <div className="modal__form-group">
                <label className="modal__label modal__label--required">{t('cars.year')}</label>
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
                <label className="modal__label">{t('cars.engineType')}</label>
                <select
                  value={formData.engineType}
                  onChange={(e) => setFormData({...formData, engineType: e.target.value as any})}
                  className="modal__input"
                >
                  {engineTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {t(`engineTypes.${type.value}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal__form-group">
                <label className="modal__label">{t('cars.transmission')}</label>
                <select
                  value={formData.transmission}
                  onChange={(e) => setFormData({...formData, transmission: e.target.value as any})}
                  className="modal__input"
                >
                  {transmissionTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {t(`transmissionTypes.${type.value}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal__form-group">
                <label className="modal__label">{t('cars.vin')}</label>
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
                <h3 className="card__title card__title--sm">{t('carData.additionalData')}</h3>
              </div>
            </div>
            <div className="card__content">

              {/* Список дополнительных данных */}
              <div className="modal__items-list">
                {carDataEntries.map((dataEntry) => (
                  <div key={dataEntry.id} className="modal__item">
                    {editingDataId === dataEntry.id ? (
                      /* Режим редактирования */
                      <div className="modal__item-edit">
                        <div className="modal__edit-grid">
                          <select
                            className="modal__input modal__input--sm"
                            value={editingDataField.name}
                            onChange={(e) => updateEditingField({ name: e.target.value })}
                          >
                            <option value="">{t('carData.selectParameter')}</option>
                            {predefinedFields.map(item => (
                              <option key={item.key} value={item.name}>
                                {item.name} {item.unit && `(${item.unit})`}
                              </option>
                            ))}
                          </select>
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
                              {t('common.save')}
                            </button>
                            <button 
                              type="button"
                              className="btn btn--secondary btn--sm"
                              onClick={cancelEditingData}
                            >
                              {t('common.cancel')}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Режим просмотра - ИСПОЛЬЗУЕМ ПЕРЕВОД */
                      <div className="modal__item-content">
                        <div className="modal__item-info">
                          {dataEntry.fields[0] && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {/* ИСПОЛЬЗУЕМ ПЕРЕВОДЕННОЕ НАЗВАНИЕ */}
                              <span className="modal__item-name">
                                {getTranslatedFieldName(dataEntry.fields[0].name)}
                              </span>
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
                            {t('common.edit')}
                          </button>
                          <button 
                            type="button"
                            className="btn btn--danger btn--sm"
                            onClick={() => onDeleteCarData(car.id, dataEntry.id)}
                          >
                            {t('common.delete')}
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
              {t('common.cancel')}
            </button>
            <button 
              type="submit" 
              className="btn btn--action"
              disabled={!formData.brand || !formData.model}
            >
              {t('common.save')}
            </button>
          </div>
          
          <div className="modal__footer-signature">
            {t('app.copyright')}
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default EditCarModal;