import React, { useState, useMemo } from 'react';
import Modal from '../../ui/Modal/Modal';
import { CarDataField } from '../../../types';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { useTranslation } from '../../../contexts/LanguageContext';
import { carDataService } from '../../../services/database/carData'; // <-- ДОБАВИТЬ
import { useAuth } from '../../../contexts/AuthContext'; // <-- ДОБАВИТЬ
import { useApp } from '../../../contexts/AppContext'; // <-- ДОБАВИТЬ для получения selectedCar

interface AddCarDataModalProps {
  onClose: () => void;
  onSave: (carData: { fields: CarDataField[] }) => void; // Изменяем сигнатуру
}

const AddCarDataModal: React.FC<AddCarDataModalProps> = ({ onClose, onSave }) => {
  const [fields, setFields] = useState<CarDataField[]>([{ name: '', value: '', unit: '' }]);
  const [loading, setLoading] = useState(false); // <-- ДОБАВИТЬ состояние загрузки
  const { getCurrencySymbol } = useCurrency();
  const { t } = useTranslation();
  const { user } = useAuth(); // <-- ДОБАВИТЬ
  const { state } = useApp(); // <-- ДОБАВИТЬ
  const { selectedCar } = state;

  const getDataTypeFromFields = (fields: CarDataField[]): 'insurance' | 'inspection' | 'custom' => {
    const fieldName = fields[0]?.name;
    if (fieldName === 'insurance') return 'insurance';
    if (fieldName === 'inspection') return 'inspection';
    if (fieldName === 'dimensions') return 'custom';
    if (fieldName === 'consumption') return 'custom';
    // Добавить другие категории по необходимости
    return 'custom';
  };

  // Дополнительные поля для специальных категорий
  const [insuranceData, setInsuranceData] = useState({
    series: '',
    number: '',
    startDate: '',
    endDate: ''
  });

  const [inspectionData, setInspectionData] = useState({
    series: '',
    number: '',
    validUntil: ''
  });

  const [dimensionsData, setDimensionsData] = useState({
    length: '',
    width: '',
    height: '',
    clearance: '',
    wheelSize: '',
    boltPattern: '',
    wheelDimensions: ''
  });

  const [consumptionData, setConsumptionData] = useState({
    mixed: '',
    city: '',
    highway: ''
  });

  // Ключи для predefined fields (сохраняем ключи, а не переведенные тексты)
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

  // Получаем выбранную категорию по ключу из fields[0].name
  const selectedCategory = predefinedFields.find(f => f.key === fields[0].name);
  const selectedCategoryKey = selectedCategory?.key || '';
  const selectedCategoryName = selectedCategory?.name || '';
  
  const isSpecialCategory = selectedCategoryKey === 'insurance' || selectedCategoryKey === 'inspection' || selectedCategoryKey === 'dimensions' || selectedCategoryKey === 'consumption';
  const showValueField = !isSpecialCategory && selectedCategoryKey !== 'purchaseDate' && selectedCategoryKey !== 'cost';

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!user || !selectedCar) {
        console.error('🔴 [AddCarDataModal] Пользователь не авторизован или автомобиль не выбран');
        return;
      }

      console.log('🟡 [AddCarDataModal] handleSubmit START', { 
        user: user.email, 
        selectedCarId: selectedCar.id,
        fields 
      });

      setLoading(true);

      try {
        let carDataToSave: { fields: CarDataField[] } = { fields: [] };


      if (selectedCategoryKey === 'insurance') {
        const formattedStartDate = new Date(insuranceData.startDate).toLocaleDateString('ru-RU');
        const formattedEndDate = new Date(insuranceData.endDate).toLocaleDateString('ru-RU');
        const insuranceValue = `${insuranceData.series}${insuranceData.number} с ${formattedStartDate} до ${formattedEndDate}`;
        
        carDataToSave.fields = [{ 
          name: 'insurance',
          value: insuranceValue, 
          unit: ''
        }];
      } 
      else if (selectedCategoryKey === 'inspection') {
        const formattedDate = new Date(inspectionData.validUntil).toLocaleDateString('ru-RU');
        const inspectionValue = `${inspectionData.series}${inspectionData.number} до ${formattedDate}`;
        
        carDataToSave.fields = [{ 
          name: 'inspection',
          value: inspectionValue, 
          unit: ''
        }];
      }
      else if (selectedCategoryKey === 'dimensions') {
        const dimensionParts = [];
        
        if (dimensionsData.length) dimensionParts.push(`${t('dimensions.length')}:${dimensionsData.length}`);
        if (dimensionsData.width) dimensionParts.push(`${t('dimensions.width')}:${dimensionsData.width}`);
        if (dimensionsData.height) dimensionParts.push(`${t('dimensions.height')}:${dimensionsData.height}`);
        if (dimensionsData.clearance) dimensionParts.push(`${t('dimensions.clearance')}:${dimensionsData.clearance}`);
        if (dimensionsData.wheelSize) dimensionParts.push(`${t('dimensions.wheelSize')}:${dimensionsData.wheelSize}`);
        if (dimensionsData.boltPattern) dimensionParts.push(`${t('dimensions.boltPattern')}:${dimensionsData.boltPattern}`);
        if (dimensionsData.wheelDimensions) dimensionParts.push(`${t('dimensions.wheelDimensions')}:${dimensionsData.wheelDimensions}`);
        
        const dimensionsValue = dimensionParts.join(' ');
        
        carDataToSave.fields = [{ 
          name: 'dimensions',
          value: dimensionsValue, 
          unit: ''
        }];
      }
      else if (selectedCategoryKey === 'consumption') {
        const consumptionValue = `${t('consumption.mixed')}:${consumptionData.mixed} ${t('consumption.city')}:${consumptionData.city} ${t('consumption.highway')}:${consumptionData.highway}`;
        
        carDataToSave.fields = [{ 
          name: 'consumption',
          value: consumptionValue, 
          unit: ''
        }];
      }
      else if (selectedCategoryKey === 'purchaseDate') {
        carDataToSave.fields = [{ 
          name: 'purchaseDate',
          value: fields[0].value, 
          unit: ''
        }];
      }
      else {
        const selectedField = predefinedFields.find(f => f.key === fields[0].name);
        if (selectedField && fields.every(f => f.name.trim() && f.value.trim())) {
          carDataToSave.fields = [{ 
            name: selectedField.key,
            value: fields[0].value, 
            unit: fields[0].unit
          }];
        }
      }

      // Проверяем что есть данные для сохранения
      if (carDataToSave.fields.length === 0) {
        console.error('🔴 [AddCarDataModal] Нет данных для сохранения');
        return;
      }

      console.log('🟡 [AddCarDataModal] Данные для сохранения:', carDataToSave);
      
      // 🔄 ВЫЗЫВАЕМ onSave ДЛЯ ОПТИМИСТИЧНОГО ОБНОВЛЕНИЯ
      console.log('🟡 [AddCarDataModal] Вызов onSave...');
      onSave(carDataToSave);
      
      console.log('🟡 [AddCarDataModal] Закрытие модалки...');
      onClose();
    
    } catch (error) {
      console.error('🔴 [AddCarDataModal] Ошибка:', error);
    } finally {
      setLoading(false);
      console.log('🟡 [AddCarDataModal] handleSubmit FINISH');
    }
  };

  const updateField = (index: number, key: keyof CarDataField, value: string) => {
    const updated = fields.map((f, i) => i === index ? { ...f, [key]: value } : f);
    setFields(updated);
  };

  const handleParameterChange = (index: number, selectedKey: string) => {
    const selectedField = predefinedFields.find(f => f.key === selectedKey);
    
    if (selectedField) {
      const updated = [...fields];
      updated[index] = { 
        ...updated[index], 
        name: selectedField.key, // Сохраняем КЛЮЧ, а не переведенное имя
        unit: selectedField.unit,
        value: '' // Сбрасываем значение при смене категории
      };
      setFields(updated);

      // Сбрасываем данные специальных категорий
      setInsuranceData({ series: '', number: '', startDate: '', endDate: '' });
      setInspectionData({ series: '', number: '', validUntil: '' });
      setDimensionsData({ length: '', width: '', height: '', clearance: '', wheelSize: '', boltPattern: '', wheelDimensions: '' });
      setConsumptionData({ mixed: '', city: '', highway: '' });
    } else {
      updateField(index, 'name', selectedKey);
      updateField(index, 'unit', '');
    }
  };

  const handleInsuranceChange = (field: string, value: string) => {
    setInsuranceData(prev => ({ ...prev, [field]: value }));
  };

  const handleInspectionChange = (field: string, value: string) => {
    setInspectionData(prev => ({ ...prev, [field]: value }));
  };

  const handleDimensionsChange = (field: string, value: string) => {
    setDimensionsData(prev => ({ ...prev, [field]: value }));
  };

  const handleConsumptionChange = (field: string, value: string) => {
    setConsumptionData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    if (selectedCategoryKey === 'insurance') {
      return insuranceData.series && insuranceData.number && insuranceData.startDate && insuranceData.endDate;
    }
    if (selectedCategoryKey === 'inspection') {
      return inspectionData.series && inspectionData.number && inspectionData.validUntil;
    }
    if (selectedCategoryKey === 'dimensions') {
      return dimensionsData.length || dimensionsData.width || dimensionsData.height || dimensionsData.clearance || dimensionsData.wheelSize || dimensionsData.boltPattern || dimensionsData.wheelDimensions;
    }
    if (selectedCategoryKey === 'consumption') {
      return consumptionData.mixed || consumptionData.city || consumptionData.highway;
    }
    if (selectedCategoryKey === 'cost') {
      return fields[0].name.trim();
    }
    if (selectedCategoryKey === 'purchaseDate') {
      return fields[0].value.trim();
    }
    return fields[0].name.trim() && fields[0].value.trim();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={t('carData.addCarData')} size="lg">
      <form className="modal__form" onSubmit={handleSubmit}>
        
        {/* Выбор категории */}
        <div className="modal__form-grid">
          <div className="modal__form-group">
            <label className="modal__label">{t('carData.parameterName')}</label>
            <select
              className="modal__input"
              value={fields[0].name} // Здесь хранится ключ
              onChange={(e) => handleParameterChange(0, e.target.value)}
              required
            >
              <option value="">{t('carData.selectParameter')}</option>
              {predefinedFields.map(item => (
                <option key={item.key} value={item.key}> {/* Используем ключ как value */}
                  {item.name} {item.unit && `(${item.unit})`}
                </option>
              ))}
            </select>
          </div>

          {/* Поле значения для обычных категорий */}
          {showValueField && (
            <div className="modal__form-group">
              <label className="modal__label">
                {t('carData.value')} {fields[0].unit && `(${fields[0].unit})`}
              </label>
              <input
                className="modal__input"
                type="text"
                placeholder={t('carData.enterValue')}
                value={fields[0].value}
                onChange={(e) => updateField(0, 'value', e.target.value)}
                required={selectedCategoryKey !== 'cost' && selectedCategoryKey !== 'tax'}
              />
            </div>
          )}

          {/* Поле даты для категории "Дата покупки" */}
          {selectedCategoryKey === 'purchaseDate' && (
            <div className="modal__form-group">
              <label className="modal__label">{t('carDataFields.purchaseDate')}</label>
              <input
                type="date"
                className="modal__input"
                value={fields[0].value}
                onChange={(e) => updateField(0, 'value', e.target.value)}
                required
              />
            </div>
          )}
        </div>

        {/* Дополнительные поля для Страховки */}
        {selectedCategoryKey === 'insurance' && (
          <div className="modal__form-section">
            <div className="modal__form-grid">
              <div className="modal__form-group" style={{ gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                  <div style={{ flex: '0 0 80px' }}>
                    <label className="modal__label">{t('expenseForm.series')}</label>
                    <input
                      type="text"
                      className="modal__input"
                      placeholder="XXX"
                      value={insuranceData.series}
                      onChange={(e) => handleInsuranceChange('series', e.target.value)}
                      maxLength={3}
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="modal__label">{t('expenseForm.number')}</label>
                    <input
                      type="text"
                      className="modal__input"
                      placeholder="123456789"
                      value={insuranceData.number}
                      onChange={(e) => handleInsuranceChange('number', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="modal__form-group" style={{ gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <label className="modal__label">{t('expenseForm.from')}</label>
                    <input
                      type="date"
                      className="modal__input"
                      value={insuranceData.startDate}
                      onChange={(e) => handleInsuranceChange('startDate', e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="modal__label">{t('expenseForm.to')}</label>
                    <input
                      type="date"
                      className="modal__input"
                      value={insuranceData.endDate}
                      onChange={(e) => handleInsuranceChange('endDate', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Дополнительные поля для Техосмотра */}
        {selectedCategoryKey === 'inspection' && (
          <div className="modal__form-section">
            <div className="modal__form-grid">
              <div className="modal__form-group" style={{ gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                  <div style={{ flex: '0 0 80px' }}>
                    <label className="modal__label">{t('expenseForm.series')}</label>
                    <input
                      type="text"
                      className="modal__input"
                      placeholder="XXX"
                      value={inspectionData.series}
                      onChange={(e) => handleInspectionChange('series', e.target.value)}
                      maxLength={3}
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="modal__label">{t('expenseForm.number')}</label>
                    <input
                      type="text"
                      className="modal__input"
                      placeholder="123456789"
                      value={inspectionData.number}
                      onChange={(e) => handleInspectionChange('number', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="modal__form-group">
                <label className="modal__label">{t('expenseForm.validUntil')}</label>
                <input
                  type="date"
                  className="modal__input"
                  value={inspectionData.validUntil}
                  onChange={(e) => handleInspectionChange('validUntil', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Дополнительные поля для Размеров */}
        {selectedCategoryKey === 'dimensions' && (
          <div className="modal__form-section">
            <div className="modal__form-grid">
              <div className="modal__form-group">
                <label className="modal__label">{t('dimensions.length')}</label>
                <input
                  type="text"
                  className="modal__input"
                  placeholder="4500"
                  value={dimensionsData.length}
                  onChange={(e) => handleDimensionsChange('length', e.target.value)}
                />
              </div>
              <div className="modal__form-group">
                <label className="modal__label">{t('dimensions.width')}</label>
                <input
                  type="text"
                  className="modal__input"
                  placeholder="1800"
                  value={dimensionsData.width}
                  onChange={(e) => handleDimensionsChange('width', e.target.value)}
                />
              </div>
              <div className="modal__form-group">
                <label className="modal__label">{t('dimensions.height')}</label>
                <input
                  type="text"
                  className="modal__input"
                  placeholder="1500"
                  value={dimensionsData.height}
                  onChange={(e) => handleDimensionsChange('height', e.target.value)}
                />
              </div>
              <div className="modal__form-group">
                <label className="modal__label">{t('dimensions.clearance')}</label>
                <input
                  type="text"
                  className="modal__input"
                  placeholder="180"
                  value={dimensionsData.clearance}
                  onChange={(e) => handleDimensionsChange('clearance', e.target.value)}
                />
              </div>
              <div className="modal__form-group">
                <label className="modal__label">{t('dimensions.wheelSize')}</label>
                <input
                  type="text"
                  className="modal__input"
                  placeholder="205/55 R16"
                  value={dimensionsData.wheelSize}
                  onChange={(e) => handleDimensionsChange('wheelSize', e.target.value)}
                />
              </div>
              <div className="modal__form-group">
                <label className="modal__label">{t('dimensions.boltPattern')}</label>
                <input
                  type="text"
                  className="modal__input"
                  placeholder="5x114.3"
                  value={dimensionsData.boltPattern}
                  onChange={(e) => handleDimensionsChange('boltPattern', e.target.value)}
                />
              </div>
              <div className="modal__form-group">
                <label className="modal__label">{t('dimensions.wheelDimensions')}</label>
                <input
                  type="text"
                  className="modal__input"
                  placeholder="7Jx16 ET45"
                  value={dimensionsData.wheelDimensions}
                  onChange={(e) => handleDimensionsChange('wheelDimensions', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Дополнительные поля для Расхода */}
        {selectedCategoryKey === 'consumption' && (
          <div className="modal__form-section">
            <div className="modal__form-grid">
              <div className="modal__form-group">
                <label className="modal__label">{t('consumption.mixed')}</label>
                <input
                  type="text"
                  className="modal__input"
                  placeholder="7.5"
                  value={consumptionData.mixed}
                  onChange={(e) => handleConsumptionChange('mixed', e.target.value)}
                />
              </div>
              <div className="modal__form-group">
                <label className="modal__label">{t('consumption.city')}</label>
                <input
                  type="text"
                  className="modal__input"
                  placeholder="9.0"
                  value={consumptionData.city}
                  onChange={(e) => handleConsumptionChange('city', e.target.value)}
                />
              </div>
              <div className="modal__form-group">
                <label className="modal__label">{t('consumption.highway')}</label>
                <input
                  type="text"
                  className="modal__input"
                  placeholder="6.5"
                  value={consumptionData.highway}
                  onChange={(e) => handleConsumptionChange('highway', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Кнопки действий */}
        <div className="modal__actions-container">
          <div className="modal__actions modal__actions--centered">
            <button type="button" className="btn btn--cancel" onClick={onClose} disabled={loading}>
              {t('common.cancel')}
            </button>
            <button 
              type="submit" 
               className={`btn btn--action ${loading ? 'btn--action-loading' : ''}`}
              disabled={!isFormValid() || loading}
            >
              {loading ? t('common.saving') : t('common.add')}
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

export default AddCarDataModal;