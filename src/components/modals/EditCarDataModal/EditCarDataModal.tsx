import React, { useState, useMemo } from 'react';
import Modal from '../../ui/Modal/Modal';
import { CarDataEntry, CarDataField } from '../../../types';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { useTranslation } from '../../../contexts/LanguageContext';
import { carDataService } from '../../../services/database/carData'; // <-- ДОБАВИТЬ
import { useAuth } from '../../../contexts/AuthContext'; // <-- ДОБАВИТЬ

interface EditCarDataModalProps {
  data: CarDataEntry;
  onClose: () => void;
  onSave: (dataId: string, updatedData: { fields: CarDataField[] }) => void;
}

const EditCarDataModal: React.FC<EditCarDataModalProps> = ({ data, onClose, onSave }) => {
  const [field, setField] = useState<CarDataField>(data.fields[0]);
  const [loading, setLoading] = useState(false); // <-- ДОБАВИТЬ состояние загрузки
  const { getCurrencySymbol } = useCurrency();
  const { t } = useTranslation();
  const { user } = useAuth(); // <-- ДОБАВИТЬ для проверки авторизации

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

  const currentFieldKey = useMemo(() => {
    if (predefinedFields.some(f => f.key === field.name)) {
      return field.name;
    }
    const found = predefinedFields.find(f => f.name === field.name);
    return found?.key || field.name;
  }, [field.name, predefinedFields]);

  const currentDisplayName = useMemo(() => {
    const found = predefinedFields.find(f => f.key === currentFieldKey);
    return found?.name || field.name;
  }, [currentFieldKey, predefinedFields, field.name]);

  // ОБНОВЛЕННЫЙ handleSubmit с использованием carDataService
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!user) {
      console.error('❌ Пользователь не авторизован');
      return;
    }

    setLoading(true);

    try {
      const updatedField = {
        ...field,
        name: currentFieldKey
      };

      console.log('🔄 Сохранение CarData:', data.id);
      
      // Сохраняем в Supabase
      await carDataService.updateCarData(data.id, {
        fields: [updatedField]
      });

      console.log('✅ CarData обновлены');
      
      // Уведомляем родительский компонент
      onSave(data.id, { fields: [updatedField] });
      
    } catch (error) {
      console.error('❌ Ошибка сохранения CarData:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleParameterChange = (selectedKey: string) => {
    const selectedField = predefinedFields.find(f => f.key === selectedKey);
    
    if (selectedField) {
      setField(prev => ({ 
        ...prev, 
        name: selectedField.key,
        unit: selectedField.unit,
        value: ''
      }));
    } else {
      setField(prev => ({ ...prev, name: selectedKey, unit: '' }));
    }
  };

  const updateField = (key: keyof CarDataField, value: string) => {
    setField(prev => ({ ...prev, [key]: value }));
  };

  const isDateField = currentFieldKey === 'purchaseDate';

  return (
    <Modal isOpen={true} onClose={onClose} title={t('carData.edit')} size="md">
      <form className="modal__form" onSubmit={handleSubmit}>
        
        <div className="modal__form-grid">
          <div className="modal__form-group">
            <label className="modal__label">{t('carData.parameterName')}</label>
            <select
              className="modal__input"
              value={currentFieldKey}
              onChange={(e) => handleParameterChange(e.target.value)}
              required
              disabled={loading} // <-- ДОБАВИТЬ disabled при загрузке
            >
              <option value="">{t('carData.selectParameter')}</option>
              {predefinedFields.map(item => (
                <option key={item.key} value={item.key}>
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
                disabled={loading} // <-- ДОБАВИТЬ disabled при загрузке
              />
            ) : (
              <input
                type="text"
                className="modal__input"
                placeholder={t('carData.enterValue')}
                value={field.value}
                onChange={(e) => updateField('value', e.target.value)}
                required={currentFieldKey !== 'cost'}
                disabled={loading} // <-- ДОБАВИТЬ disabled при загрузке
              />
            )}
          </div>
        </div>

        <div className="modal__actions-container">
          <div className="modal__actions modal__actions--centered">
            <button 
              type="button" 
              className="btn btn--cancel" 
              onClick={onClose}
              disabled={loading} // <-- ДОБАВИТЬ disabled при загрузке
            >
              {t('common.cancel')}
            </button>
            <button 
              type="submit" 
              className={`btn btn--action ${loading ? 'btn--action-loading' : ''}`}
              disabled={!currentFieldKey.trim() || (currentFieldKey !== 'cost' && !field.value.trim()) || loading}
            >
              {loading ? t('common.saving') : t('common.save')} {/* <-- ИЗМЕНИТЬ текст при загрузке */}
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