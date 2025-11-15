import React, { useState, useMemo } from 'react';
import Modal from '../../ui/Modal/Modal';
import { CarDataField } from '../../../types';
import { useCurrency } from '../../../contexts/CurrencyContext';

interface AddCarDataModalProps {
  onClose: () => void;
  onSave: (carData: { fields: CarDataField[] }) => void;
}

const AddCarDataModal: React.FC<AddCarDataModalProps> = ({ onClose, onSave }) => {
  const [fields, setFields] = useState<CarDataField[]>([{ name: '', value: '', unit: '' }]);
  const { getCurrencySymbol } = useCurrency();

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

  const predefinedFields = useMemo(() => [
    { name: 'Страховка', unit: '' },
    { name: 'Техосмотр', unit: '' },
    { name: 'Размеры', unit: '' },
    { name: 'Код двигателя', unit: '' },
    { name: 'Марка топлива', unit: '' },
    { name: 'Расход', unit: '' },
    { name: 'Мощность', unit: 'л.с.' },
    { name: 'Объем двигателя', unit: 'л' },
    { name: 'Стоимость', unit: getCurrencySymbol() },
    { name: 'Дата покупки', unit: '' },
    { name: 'Цвет', unit: '' },
    { name: 'Тип кузова', unit: '' },
    { name: 'Привод', unit: '' },
    { name: 'Разгон до 100', unit: 'сек' },
    { name: 'Макс. скорость', unit: 'км/ч' },
    { name: 'Крутящий момент', unit: 'Н⋅м' },
    { name: 'Вес', unit: 'кг' },
    { name: 'Объем багажника', unit: 'л' },
    { name: 'Страна производства', unit: '' },
    { name: 'Гарантия', unit: 'мес' },
    { name: 'Налог', unit: `${getCurrencySymbol()}/год` }
  ], [getCurrencySymbol]);

  const selectedCategory = fields[0].name;
  const isSpecialCategory = selectedCategory === 'Страховка' || selectedCategory === 'Техосмотр' || selectedCategory === 'Размеры' || selectedCategory === 'Расход';
  const showValueField = !isSpecialCategory && selectedCategory !== 'Дата покупки';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedCategory === 'Страховка') {
      const formattedStartDate = new Date(insuranceData.startDate).toLocaleDateString('ru-RU');
      const formattedEndDate = new Date(insuranceData.endDate).toLocaleDateString('ru-RU');
      const insuranceValue = `${insuranceData.series}${insuranceData.number} с ${formattedStartDate} до ${formattedEndDate}`;
      
      const insuranceField = { 
        name: 'Страховка', 
        value: insuranceValue, 
        unit: ''
      };
      onSave({ fields: [insuranceField] });
    } 
    else if (selectedCategory === 'Техосмотр') {
      const formattedDate = new Date(inspectionData.validUntil).toLocaleDateString('ru-RU');
      const inspectionValue = `${inspectionData.series}${inspectionData.number} до ${formattedDate}`;
      
      const inspectionField = { 
        name: 'Техосмотр', 
        value: inspectionValue, 
        unit: ''
      };
      onSave({ fields: [inspectionField] });
    }
    else if (selectedCategory === 'Размеры') {
      const dimensionsValue = `Д:${dimensionsData.length} Ш:${dimensionsData.width} В:${dimensionsData.height} Клиренс:${dimensionsData.clearance} Колёса:${dimensionsData.wheelSize} Сверловка:${dimensionsData.boltPattern} Диски:${dimensionsData.wheelDimensions}`;
      const dimensionsField = { 
        name: 'Размеры', 
        value: dimensionsValue, 
        unit: ''
      };
      onSave({ fields: [dimensionsField] });
    }
    else if (selectedCategory === 'Расход') {
      const consumptionValue = `Смешанный:${consumptionData.mixed} Город:${consumptionData.city} Трасса:${consumptionData.highway}`;
      const consumptionField = { 
        name: 'Расход', 
        value: consumptionValue, 
        unit: ''
      };
      onSave({ fields: [consumptionField] });
    }
    else if (selectedCategory === 'Дата покупки') {
      const dateField = { 
        name: 'Дата покупки', 
        value: fields[0].value, 
        unit: ''
      };
      onSave({ fields: [dateField] });
    }
    else {
      if (fields.every(f => f.name.trim() && f.value.trim())) {
        onSave({ fields });
      }
    }
  };

  const updateField = (index: number, key: keyof CarDataField, value: string) => {
    const updated = fields.map((f, i) => i === index ? { ...f, [key]: value } : f);
    setFields(updated);
  };

  const handleParameterChange = (index: number, selectedName: string) => {
    const selectedField = predefinedFields.find(f => f.name === selectedName);
    
    if (selectedField) {
      const updated = [...fields];
      updated[index] = { 
        ...updated[index], 
        name: selectedField.name,
        unit: selectedField.unit
      };
      setFields(updated);
    } else {
      updateField(index, 'name', selectedName);
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
    if (selectedCategory === 'Страховка') {
      return insuranceData.series && insuranceData.number && insuranceData.startDate && insuranceData.endDate;
    }
    if (selectedCategory === 'Техосмотр') {
      return inspectionData.series && inspectionData.number && inspectionData.validUntil;
    }
    if (selectedCategory === 'Размеры') {
      return dimensionsData.length || dimensionsData.width || dimensionsData.height || dimensionsData.clearance || dimensionsData.wheelSize || dimensionsData.boltPattern || dimensionsData.wheelDimensions;
    }
    if (selectedCategory === 'Расход') {
      return consumptionData.mixed || consumptionData.city || consumptionData.highway;
    }
    if (selectedCategory === 'Стоимость') {
      return fields[0].name.trim();
    }
    if (selectedCategory === 'Дата покупки') {
      return fields[0].value.trim();
    }
    return fields[0].name.trim() && fields[0].value.trim();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Добавить данные об авто" size="lg">
      <form className="modal__form" onSubmit={handleSubmit}>
        
        {/* Выбор категории */}
        <div className="modal__form-grid">
          <div className="modal__form-group">
            <label className="modal__label">Название параметра</label>
            <select
              className="modal__input"
              value={fields[0].name}
              onChange={(e) => handleParameterChange(0, e.target.value)}
              required
            >
              <option value="">Выберите параметр</option>
              {predefinedFields.map(item => (
                <option key={item.name} value={item.name}>
                  {item.name} {item.unit && `(${item.unit})`}
                </option>
              ))}
            </select>
          </div>

          {/* Поле значения для обычных категорий */}
          {showValueField && (
            <div className="modal__form-group">
              <label className="modal__label">
                Значение {fields[0].unit && `(${fields[0].unit})`}
              </label>
              <input
                className="modal__input"
                type="text"
                placeholder={`Введите значение ${fields[0].unit ? `в ${fields[0].unit}` : ''}`}
                value={fields[0].value}
                onChange={(e) => updateField(0, 'value', e.target.value)}
                required={selectedCategory !== 'Стоимость'}
              />
            </div>
          )}

          {/* Поле даты для категории "Дата покупки" */}
          {selectedCategory === 'Дата покупки' && (
            <div className="modal__form-group">
              <label className="modal__label">Дата покупки</label>
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
        {selectedCategory === 'Страховка' && (
          <div className="modal__form-section">
            <div className="modal__form-grid">
              <div className="modal__form-group" style={{ gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                  <div style={{ flex: '0 0 80px' }}>
                    <label className="modal__label">Серия</label>
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
                    <label className="modal__label">Номер</label>
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
                    <label className="modal__label">С</label>
                    <input
                      type="date"
                      className="modal__input"
                      value={insuranceData.startDate}
                      onChange={(e) => handleInsuranceChange('startDate', e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="modal__label">До</label>
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
        {selectedCategory === 'Техосмотр' && (
          <div className="modal__form-section">
            <div className="modal__form-grid">
              <div className="modal__form-group" style={{ gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                  <div style={{ flex: '0 0 80px' }}>
                    <label className="modal__label">Серия</label>
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
                    <label className="modal__label">Номер</label>
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
                <label className="modal__label">Действителен до</label>
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
        {selectedCategory === 'Размеры' && (
          <div className="modal__form-section">
            <div className="modal__form-grid">
              <div className="modal__form-group">
                <label className="modal__label">Длина (мм)</label>
                <input
                  type="text"
                  className="modal__input"
                  placeholder="4500"
                  value={dimensionsData.length}
                  onChange={(e) => handleDimensionsChange('length', e.target.value)}
                />
              </div>
              <div className="modal__form-group">
                <label className="modal__label">Ширина (мм)</label>
                <input
                  type="text"
                  className="modal__input"
                  placeholder="1800"
                  value={dimensionsData.width}
                  onChange={(e) => handleDimensionsChange('width', e.target.value)}
                />
              </div>
              <div className="modal__form-group">
                <label className="modal__label">Высота (мм)</label>
                <input
                  type="text"
                  className="modal__input"
                  placeholder="1500"
                  value={dimensionsData.height}
                  onChange={(e) => handleDimensionsChange('height', e.target.value)}
                />
              </div>
              <div className="modal__form-group">
                <label className="modal__label">Клиренс (мм)</label>
                <input
                  type="text"
                  className="modal__input"
                  placeholder="180"
                  value={dimensionsData.clearance}
                  onChange={(e) => handleDimensionsChange('clearance', e.target.value)}
                />
              </div>
              <div className="modal__form-group">
                <label className="modal__label">Размер колес</label>
                <input
                  type="text"
                  className="modal__input"
                  placeholder="205/55 R16"
                  value={dimensionsData.wheelSize}
                  onChange={(e) => handleDimensionsChange('wheelSize', e.target.value)}
                />
              </div>
              <div className="modal__form-group">
                <label className="modal__label">Сверловка (PCD)</label>
                <input
                  type="text"
                  className="modal__input"
                  placeholder="5x114.3"
                  value={dimensionsData.boltPattern}
                  onChange={(e) => handleDimensionsChange('boltPattern', e.target.value)}
                />
              </div>
              <div className="modal__form-group">
                <label className="modal__label">Размеры дисков</label>
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
        {selectedCategory === 'Расход' && (
          <div className="modal__form-section">
            <div className="modal__form-grid">
              <div className="modal__form-group">
                <label className="modal__label">Смешанный (л/100км)</label>
                <input
                  type="text"
                  className="modal__input"
                  placeholder="7.5"
                  value={consumptionData.mixed}
                  onChange={(e) => handleConsumptionChange('mixed', e.target.value)}
                />
              </div>
              <div className="modal__form-group">
                <label className="modal__label">По городу (л/100км)</label>
                <input
                  type="text"
                  className="modal__input"
                  placeholder="9.0"
                  value={consumptionData.city}
                  onChange={(e) => handleConsumptionChange('city', e.target.value)}
                />
              </div>
              <div className="modal__form-group">
                <label className="modal__label">По трассе (л/100км)</label>
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
            <button type="button" className="btn btn--cancel" onClick={onClose}>
              Отмена
            </button>
            <button 
              type="submit" 
              className="btn btn--action"
              disabled={!isFormValid()}
            >
              Добавить
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

export default AddCarDataModal;