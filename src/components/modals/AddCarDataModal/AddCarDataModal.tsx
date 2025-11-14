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
    startDate: '', // ДОБАВЛЕНО поле "С"
    endDate: ''    // поле "ДО"
  });

  const [inspectionData, setInspectionData] = useState({
    series: '',
    number: '',
    validUntil: ''
  });

  const predefinedFields = useMemo(() => [
    { name: 'Пробег', unit: 'км' },
    { name: 'Страховка', unit: '' },
    { name: 'Техосмотр', unit: '' },
    { name: 'Расход топлива', unit: 'л/100км' },
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
    { name: 'Расход в городе', unit: 'л/100км' },
    { name: 'Расход по трассе', unit: 'л/100км' },
    { name: 'Страна производства', unit: '' },
    { name: 'Гарантия', unit: 'мес' },
    { name: 'Налог', unit: `${getCurrencySymbol()}/год` }
  ], [getCurrencySymbol]);

  const selectedCategory = fields[0].name;
  const isSpecialCategory = selectedCategory === 'Страховка' || selectedCategory === 'Техосмотр';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedCategory === 'Страховка') {
      // Форматируем данные для страховки: серияномер с ДД.ММ.ГГГГ до ДД.ММ.ГГГГ
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
      // Форматируем данные для техосмотра: серияномер до ДД.ММ.ГГГГ
      const formattedDate = new Date(inspectionData.validUntil).toLocaleDateString('ru-RU');
      const inspectionValue = `${inspectionData.series}${inspectionData.number} до ${formattedDate}`;
      
      const inspectionField = { 
        name: 'Техосмотр', 
        value: inspectionValue, 
        unit: ''
      };
      onSave({ fields: [inspectionField] });
    }
    else {
      // Для обычных полей
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

  const isFormValid = () => {
    if (selectedCategory === 'Страховка') {
      return insuranceData.series && insuranceData.number && insuranceData.startDate && insuranceData.endDate && fields[0].value.trim();
    }
    if (selectedCategory === 'Техосмотр') {
      return inspectionData.series && inspectionData.number && inspectionData.validUntil && fields[0].value.trim();
    }
    return fields[0].name.trim() && fields[0].value.trim();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Добавить данные об авто" size="md">
      <form className="modal__form" onSubmit={handleSubmit}>
        
        {/* Выбор категории и стоимость */}
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

          {/* Поле значения для ВСЕХ категорий */}
          <div className="modal__form-group">
            <label className="modal__label">
              {isSpecialCategory ? 'Стоимость' : 'Значение'} 
              {fields[0].unit && ` (${fields[0].unit})`}
            </label>
            <input
              className="modal__input"
              type="text"
              placeholder={isSpecialCategory ? 'Введите стоимость' : `Введите значение ${fields[0].unit ? `в ${fields[0].unit}` : ''}`}
              value={fields[0].value}
              onChange={(e) => updateField(0, 'value', e.target.value)}
              required
            />
          </div>
        </div>

        {/* Дополнительные поля для Страховки */}
        {selectedCategory === 'Страховка' && (
          <div className="modal__form-section">
            <div className="modal__form-grid">
              {/* Серия и номер на одной строке */}
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
                    <label className="modal__label">Номер полиса</label>
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
              
              {/* Две даты на одной строке */}
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
              {/* Серия и номер на одной строке */}
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
                    <label className="modal__label">Номер карты</label>
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