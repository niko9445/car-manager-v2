import React, { useState, useMemo } from 'react';
import Modal from '../../ui/Modal/Modal';
import { CarDataEntry, CarDataField } from '../../../types';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { useTranslation } from '../../../contexts/LanguageContext';

interface EditCarDataModalProps {
  data: CarDataEntry;
  onClose: () => void;
  onSave: (dataId: string, updatedData: { fields: CarDataField[] }) => void;
}

const EditCarDataModal: React.FC<EditCarDataModalProps> = ({ data, onClose, onSave }) => {
  const [field, setField] = useState<CarDataField>(data.fields[0]);
  const { getCurrencySymbol } = useCurrency();
  const { t } = useTranslation();

  // Функция для получения отображаемого имени из ключа
  const getDisplayName = (fieldKey: string): string => {
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

  const predefinedFields = useMemo(() => [
    { key: 'insurance', name: t('carDataFields.insurance'), unit: '' },
    { key: 'inspection', name: t('carDataFields.inspection'), unit: '' },
    { key: 'dimensions', name: t('carDataFields.dimensions'), unit: '' },
    { key: 'engineCode', name: t('carDataFields.engineCode'), unit: '' },
    { key: 'fuelType', name: t('carDataFields.fuelType'), unit: '' },
    { key: 'consumption', name: t('carDataFields.consumption'), unit: '' },
    { key: 'power', name: t('carDataFields.power'), unit: t('units.hp') },
    { key: 'engineVolume', name: t('carDataFields.engineVolume'), unit: t('units.liters') },
    { key: 'cost', name: t('carDataFields.cost'), unit: getCurrencySymbol() },
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
    { key: 'tax', name: t('carDataFields.tax'), unit: `${getCurrencySymbol()}/${t('units.year')}` }
  ], [getCurrencySymbol, t]);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    
    // Находим ключ для текущего поля
    const selectedField = predefinedFields.find(f => f.name === field.name);
    const fieldKey = selectedField?.key || field.name;
    
    const updatedField = {
      ...field,
      name: fieldKey // Сохраняем ключ
    };
    
    onSave(data.id, { fields: [updatedField] });
  };

  const handleParameterChange = (selectedName: string) => {
    const selectedField = predefinedFields.find(f => f.name === selectedName);
    
    if (selectedField) {
      setField(prev => ({ 
        ...prev, 
        name: selectedField.name, // Отображаем переведенное имя
        unit: selectedField.unit
      }));
    } else {
      setField(prev => ({ ...prev, name: selectedName, unit: '' }));
    }
  };

  const updateField = (key: keyof CarDataField, value: string) => {
    setField(prev => ({ ...prev, [key]: value }));
  };

  // Определяем является ли поле датой (по ключу, а не по тексту)
  const selectedFieldKey = predefinedFields.find(f => f.name === field.name)?.key || '';
  const isDateField = selectedFieldKey === 'purchaseDate';

  return (
    <Modal isOpen={true} onClose={onClose} title={t('carData.edit')} size="md">
      <form className="modal__form" onSubmit={handleSubmit}>
        
        <div className="modal__form-grid">
          <div className="modal__form-group">
            <label className="modal__label">{t('carData.parameterName')}</label>
            <select
              className="modal__input"
              value={field.name}
              onChange={(e) => handleParameterChange(e.target.value)}
              required
            >
              <option value="">{t('carData.selectParameter')}</option>
              {predefinedFields.map(item => (
                <option key={item.key} value={item.name}>
                  {item.name} {item.unit && `(${item.unit})`}
                </option>
              ))}
            </select>
          </div>

          <div className="modal__form-group">
            <label className="modal__label">
              {isDateField ? t('common.date') : t('carData.value')} {field.unit && `(${field.unit})`}
            </label>
            {isDateField ? (
              <input
                type="date"
                className="modal__input"
                value={field.value}
                onChange={(e) => updateField('value', e.target.value)}
                required
              />
            ) : (
              <input
                type="text"
                className="modal__input"
                placeholder={t('carData.enterValue')}
                value={field.value}
                onChange={(e) => updateField('value', e.target.value)}
                required={selectedFieldKey !== 'cost'}
              />
            )}
          </div>
        </div>

        <div className="modal__actions-container">
          <div className="modal__actions modal__actions--centered">
            <button type="button" className="btn btn--cancel" onClick={onClose}>
              {t('common.cancel')}
            </button>
            <button 
              type="submit" 
              className="btn btn--action"
              disabled={!field.name.trim() || (selectedFieldKey !== 'cost' && !field.value.trim())}
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

export default EditCarDataModal;