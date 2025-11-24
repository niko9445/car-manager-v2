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
  console.log('🔵 [EditCarModal] RENDER', { 
    carId: car?.id,
    carDataEntriesCount: carDataEntries?.length,
    carBrand: car?.brand
  });

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [localCarData, setLocalCarData] = useState<CarDataEntry[]>(carDataEntries);
  const { t } = useTranslation();

  // 🔴 ЛОГИРОВАНИЕ ПРОПСОВ И СОСТОЯНИЙ
  console.log('🔵 [EditCarModal] PROPS and STATE', {
    car: car ? { id: car.id, brand: car.brand, model: car.model } : 'NO CAR',
    carDataEntries: carDataEntries?.map(entry => ({
      id: entry.id,
      fields: entry.fields
    })),
    localCarData: localCarData?.map(entry => ({
      id: entry.id,
      fields: entry.fields
    })),
    formData,
    editingDataId,
    editingDataField,
    isProcessing
  });

  // 🔴 ЛОГИРОВАНИЕ ЭФФЕКТОВ
  useEffect(() => {
    console.log('🔵 [EditCarModal] EFFECT - carDataEntries changed', {
      prevLocalCarData: localCarData?.length,
      newCarDataEntries: carDataEntries?.length
    });
    setLocalCarData(carDataEntries);
  }, [carDataEntries]);

  useEffect(() => {
    console.log('🔵 [EditCarModal] EFFECT - car changed', {
      car: car ? { id: car.id, brand: car.brand } : 'NO CAR'
    });
    
    if (car) {
      console.log('🔵 [EditCarModal] Setting formData from car', {
        brand: car.brand,
        model: car.model,
        year: car.year
      });
      
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

  const getTranslatedFieldName = (fieldKey: string): string => {
    console.log('🔵 [EditCarModal] getTranslatedFieldName', { fieldKey });
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
    const result = translationMap[fieldKey] || fieldKey;
    console.log('🔵 [EditCarModal] getTranslatedFieldName result', { fieldKey, result });
    return result;
  };

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

  // 🔴 ЛОГИРОВАНИЕ ОБРАБОТЧИКОВ
  const handleSubmit = (e: React.FormEvent): void => {
    console.log('🔵 [EditCarModal] handleSubmit START', { formData });
    e.preventDefault();
    if (formData.brand && formData.model) {
      console.log('🔵 [EditCarModal] Calling onSave', { carId: car.id, formData });
      onSave(car.id, formData);
    } else {
      console.warn('🟡 [EditCarModal] handleSubmit - missing required fields');
    }
  };

  const startEditingData = (dataEntry: CarDataEntry) => {
    console.log('🔵 [EditCarModal] startEditingData', { 
      dataEntryId: dataEntry.id,
      dataEntryFields: dataEntry.fields 
    });
    
    setEditingDataId(dataEntry.id);
    const field = dataEntry.fields[0] || { name: '', value: '', unit: '' };
    
    const predefinedField = predefinedFields.find(f => f.key === field.name);
    const displayName = predefinedField ? predefinedField.name : field.name;
    
    console.log('🔵 [EditCarModal] startEditingData - setting field', {
      originalField: field,
      displayName,
      predefinedField
    });
    
    setEditingDataField({ 
      ...field, 
      name: displayName
    });
  };

  const cancelEditingData = () => {
    console.log('🔵 [EditCarModal] cancelEditingData', { editingDataId });
    setEditingDataId(null);
    setEditingDataField({ name: '', value: '', unit: '' });
  };

  const handleSaveEditedData = async (dataId: string) => {
    console.log('🔵 [EditCarModal] handleSaveEditedData START', {
      dataId,
      editingDataField,
      isProcessing
    });

    if (!editingDataField.name.trim() || !editingDataField.value.trim()) {
      console.warn('🟡 [EditCarModal] handleSaveEditedData - missing required fields');
      return;
    }

    if (isProcessing) {
      console.warn('🟡 [EditCarModal] handleSaveEditedData - already processing');
      return;
    }

    setIsProcessing(true);
    console.log('🔵 [EditCarModal] handleSaveEditedData - setting isProcessing true');

    try {
      // 🔴 ЛОГИРОВАНИЕ ОПТИМИСТИЧНОГО ОБНОВЛЕНИЯ
      const predefinedField = predefinedFields.find(f => f.name === editingDataField.name);
      const fieldKey = predefinedField ? predefinedField.key : editingDataField.name;
      
      const updatedField = {
        ...editingDataField,
        name: fieldKey,
        unit: predefinedField ? predefinedField.unit : editingDataField.unit
      };

      console.log('🔵 [EditCarModal] handleSaveEditedData - optimistic update', {
        predefinedField,
        fieldKey,
        updatedField
      });

      // ОПТИМИСТИЧНОЕ ОБНОВЛЕНИЕ
      setLocalCarData(prev => {
        const updated = prev.map(entry => 
          entry.id === dataId 
            ? { ...entry, fields: [updatedField] }
            : entry
        );
        console.log('🔵 [EditCarModal] handleSaveEditedData - localCarData updated', {
          prevLength: prev.length,
          updatedLength: updated.length
        });
        return updated;
      });

      // 🔴 ЛОГИРОВАНИЕ ВЫЗОВА РОДИТЕЛЬСКОЙ ФУНКЦИИ
      console.log('🔵 [EditCarModal] handleSaveEditedData - calling onEditCarData', {
        carId: car.id,
        dataId,
        updatedData: { fields: [updatedField] }
      });

      await onEditCarData(car.id, dataId, { fields: [updatedField] });

      console.log('🟢 [EditCarModal] handleSaveEditedData - onEditCarData completed');
      
      setEditingDataId(null);
      console.log('🔵 [EditCarModal] handleSaveEditedData - editingDataId cleared');

    } catch (error) {
      console.error('🔴 [EditCarModal] handleSaveEditedData - ERROR:', error);
      // ВОССТАНАВЛИВАЕМ ПРЕЖНИЕ ДАННЫЯ ПРИ ОШИБКЕ
      console.log('🔵 [EditCarModal] handleSaveEditedData - restoring carDataEntries');
      setLocalCarData(carDataEntries);
    } finally {
      setIsProcessing(false);
      console.log('🔵 [EditCarModal] handleSaveEditedData - setting isProcessing false');
    }
  };

  const handleDeleteData = async (dataId: string) => {
    console.log('🔵 [EditCarModal] handleDeleteData START', { dataId, isProcessing });

    if (!window.confirm(t('carData.confirmDelete'))) {
      console.log('🔵 [EditCarModal] handleDeleteData - user cancelled');
      return;
    }

    if (isProcessing) {
      console.warn('🟡 [EditCarModal] handleDeleteData - already processing');
      return;
    }

    setIsProcessing(true);
    console.log('🔵 [EditCarModal] handleDeleteData - setting isProcessing true');

    try {
      // 🔴 ЛОГИРОВАНИЕ ОПТИМИСТИЧНОГО УДАЛЕНИЯ
      console.log('🔵 [EditCarModal] handleDeleteData - optimistic delete');
      
      setLocalCarData(prev => {
        const updated = prev.filter(entry => entry.id !== dataId);
        console.log('🔵 [EditCarModal] handleDeleteData - localCarData updated', {
          prevLength: prev.length,
          updatedLength: updated.length
        });
        return updated;
      });

      // 🔴 ЛОГИРОВАНИЕ ВЫЗОВА РОДИТЕЛЬСКОЙ ФУНКЦИИ
      console.log('🔵 [EditCarModal] handleDeleteData - calling onDeleteCarData', {
        carId: car.id,
        dataId
      });

      await onDeleteCarData(car.id, dataId);

      console.log('🟢 [EditCarModal] handleDeleteData - onDeleteCarData completed');

    } catch (error) {
      console.error('🔴 [EditCarModal] handleDeleteData - ERROR:', error);
      // ВОССТАНАВЛИВАЕМ ПРЕЖНИЕ ДАННЫЯ ПРИ ОШИБКЕ
      console.log('🔵 [EditCarModal] handleDeleteData - restoring carDataEntries');
      setLocalCarData(carDataEntries);
    } finally {
      setIsProcessing(false);
      console.log('🔵 [EditCarModal] handleDeleteData - setting isProcessing false');
    }
  };

  const updateEditingField = (updates: Partial<CarDataField>) => {
    console.log('🔵 [EditCarModal] updateEditingField', { 
      previous: editingDataField,
      updates 
    });
    setEditingDataField(prev => ({ ...prev, ...updates }));
  };

  console.log('🔵 [EditCarModal] RENDER - final state before return', {
    localCarDataCount: localCarData?.length,
    editingDataId,
    isProcessing
  });

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
                  onChange={(e) => {
                    console.log('🔵 [EditCarModal] brand change', { value: e.target.value });
                    setFormData({...formData, brand: e.target.value});
                  }}
                  required
                  className="modal__input"
                />
              </div>

              <div className="modal__form-group">
                <label className="modal__label modal__label--required">{t('cars.model')}</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => {
                    console.log('🔵 [EditCarModal] model change', { value: e.target.value });
                    setFormData({...formData, model: e.target.value});
                  }}
                  required
                  className="modal__input"
                />
              </div>

              <div className="modal__form-group">
                <label className="modal__label modal__label--required">{t('cars.year')}</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => {
                    console.log('🔵 [EditCarModal] year change', { value: e.target.value });
                    setFormData({...formData, year: parseInt(e.target.value)});
                  }}
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
                  onChange={(e) => {
                    console.log('🔵 [EditCarModal] engineType change', { value: e.target.value });
                    setFormData({...formData, engineType: e.target.value as any});
                  }}
                  className="modal__input"
                >
                  {engineTypes.map(type => (
                    <option key={type} value={type}>
                      {t(`engineTypes.${type}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal__form-group">
                <label className="modal__label">{t('cars.transmission')}</label>
                <select
                  value={formData.transmission}
                  onChange={(e) => {
                    console.log('🔵 [EditCarModal] transmission change', { value: e.target.value });
                    setFormData({...formData, transmission: e.target.value as any});
                  }}
                  className="modal__input"
                >
                  {transmissionTypes.map(type => (
                    <option key={type} value={type}>
                      {t(`transmissionTypes.${type}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal__form-group">
                <label className="modal__label">{t('cars.vin')}</label>
                <input
                  type="text"
                  value={formData.vin}
                  onChange={(e) => {
                    console.log('🔵 [EditCarModal] vin change', { value: e.target.value });
                    setFormData({...formData, vin: e.target.value});
                  }}
                  placeholder={t('common.optional')} 
                  className="modal__input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Секция дополнительных данных */}
        {localCarData.length > 0 && (
          <div className="card card--compact">
            <div className="card__header">
              <div className="card__main-info">
                <h3 className="card__title card__title--sm">{t('carData.additionalData')}</h3>
              </div>
            </div>
            <div className="card__content">

              {/* Список дополнительных данных */}
              <div className="modal__items-list">
                {localCarData.map((dataEntry) => (
                  <div key={dataEntry.id} className="modal__item">
                    {editingDataId === dataEntry.id ? (
                      /* Режим редактирования */
                      <div className="modal__item-edit">
                        <div className="modal__edit-grid">
                          <select
                            className="modal__input modal__input--sm"
                            value={editingDataField.name}
                            onChange={(e) => {
                              console.log('🔵 [EditCarModal] field name change', { value: e.target.value });
                              updateEditingField({ name: e.target.value });
                            }}
                            disabled={isProcessing}
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
                            onChange={(e) => {
                              console.log('🔵 [EditCarModal] field value change', { value: e.target.value });
                              updateEditingField({ value: e.target.value });
                            }}
                            placeholder={t('carData.value')}
                            disabled={isProcessing}
                          />
                          <input
                            type="text"
                            className="modal__input modal__input--sm"
                            value={editingDataField.unit}
                            onChange={(e) => {
                              console.log('🔵 [EditCarModal] field unit change', { value: e.target.value });
                              updateEditingField({ unit: e.target.value });
                            }}
                            placeholder={t('carData.unit')}
                            disabled={isProcessing}
                          />
                          <div className="modal__edit-actions">
                            <button 
                              type="button"
                              className="btn btn--primary btn--sm"
                              onClick={() => {
                                console.log('🔵 [EditCarModal] save button clicked');
                                handleSaveEditedData(dataEntry.id);
                              }}
                              disabled={!editingDataField.name.trim() || !editingDataField.value.trim() || isProcessing}
                            >
                              {isProcessing ? t('common.saving') : t('common.save')}
                            </button>
                            <button 
                              type="button"
                              className="btn btn--secondary btn--sm"
                              onClick={() => {
                                console.log('🔵 [EditCarModal] cancel button clicked');
                                cancelEditingData();
                              }}
                              disabled={isProcessing}
                            >
                              {t('common.cancel')}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Режим просмотра */
                      <div className="modal__item-content">
                        <div className="modal__item-info">
                          {dataEntry.fields[0] && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                            onClick={() => {
                              console.log('🔵 [EditCarModal] edit button clicked');
                              startEditingData(dataEntry);
                            }}
                            disabled={isProcessing}
                          >
                            {t('common.edit')}
                          </button>
                          <button 
                            type="button"
                            className="btn btn--danger btn--sm"
                            onClick={() => {
                              console.log('🔵 [EditCarModal] delete button clicked');
                              handleDeleteData(dataEntry.id);
                            }}
                            disabled={isProcessing}
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
              onClick={() => {
                console.log('🔵 [EditCarModal] cancel button clicked');
                onClose();
              }}
              className="btn btn--cancel"
              disabled={isProcessing}
            >
              {t('common.cancel')}
            </button>
            <button 
              type="submit" 
              className="btn btn--action"
              disabled={!formData.brand || !formData.model || isProcessing}
              onClick={() => console.log('🔵 [EditCarModal] save main data button clicked')}
            >
              {isProcessing ? t('common.saving') : t('common.save')}
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