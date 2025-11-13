import React, { useState, useEffect } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Expense, ExpenseCategory, FuelData, PartsData, InsuranceData, InspectionData } from '../../../types';
import { ExpenseService } from '../../../services/expenseService';
import { useCurrency } from '../../../contexts/CurrencyContext';

interface ExpenseFormData {
  date: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  odometer?: number;
  fuelData?: FuelData;
  partsData?: PartsData;
  insuranceData?: InsuranceData;
  inspectionData?: InspectionData;
}

interface ExpenseFormErrors {
  date?: string;
  category?: string;
  amount?: string;
  description?: string;
  odometer?: string;
  liters?: string;
  remainingRange?: string;
  averageConsumption?: string;
  article?: string;
  link?: string;
  series?: string;
  number?: string;
  startDate?: string;
  endDate?: string;
  validUntil?: string;
}

interface ExpenseFormProps {
  expense?: Expense;
  onSave: () => void;
  onCancel: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ 
  expense, 
  onSave, 
  onCancel 
}) => {
  const { state } = useApp();
  const { selectedCar } = state;
  const { getCurrencySymbol } = useCurrency();
  
  const [formData, setFormData] = useState<ExpenseFormData>({
    date: new Date().toISOString().split('T')[0],
    category: 'fuel',
    amount: 0,
    description: '',
    odometer: undefined,
    fuelData: undefined,
    partsData: undefined,
    insuranceData: undefined,
    inspectionData: undefined
  });
  
  const [errors, setErrors] = useState<ExpenseFormErrors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expense) {
      setFormData({
        date: expense.date,
        category: expense.category,
        amount: expense.amount,
        description: expense.description,
        odometer: expense.odometer,
        fuelData: expense.fuelData,
        partsData: expense.partsData,
        insuranceData: expense.insuranceData,
        inspectionData: expense.inspectionData
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: 'fuel',
        amount: 0,
        description: '',
        odometer: undefined,
        fuelData: undefined,
        partsData: undefined,
        insuranceData: undefined,
        inspectionData: undefined
      });
    }
  }, [expense]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('fuelData.')) {
      const fuelField = name.replace('fuelData.', '') as keyof FuelData;
      
      setFormData(prev => ({
        ...prev,
        fuelData: {
          ...prev.fuelData,
          [fuelField]: type === 'checkbox' 
            ? (e.target as HTMLInputElement).checked
            : value === '' ? undefined : Number(value)
        }
      }));
    } else if (name.startsWith('partsData.')) {
      const partsField = name.replace('partsData.', '') as keyof PartsData;
      setFormData(prev => ({
        ...prev,
        partsData: {
          ...prev.partsData,
          [partsField]: value
        }
      }));
    // ЗАМЕНИТЕ эти проблемные функции в handleInputChange:

    } else if (name.startsWith('insuranceData.')) {
      const insuranceField = name.replace('insuranceData.', '') as keyof InsuranceData;
      setFormData(prev => ({
        ...prev,
        insuranceData: {
          series: prev.insuranceData?.series || '',
          number: prev.insuranceData?.number || '',
          startDate: prev.insuranceData?.startDate || '',
          endDate: prev.insuranceData?.endDate || '',
          [insuranceField]: value
        }
      }));
    } else if (name.startsWith('inspectionData.')) {
      const inspectionField = name.replace('inspectionData.', '') as keyof InspectionData;
      setFormData(prev => ({
        ...prev,
        inspectionData: {
          series: prev.inspectionData?.series || '',
          number: prev.inspectionData?.number || '',
          validUntil: prev.inspectionData?.validUntil || '',
          [inspectionField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'amount' || name === 'odometer' 
          ? value === '' ? undefined : Number(value)
          : value
      }));
    }
    
    if (errors[name as keyof ExpenseFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSeriesChange = (e: React.ChangeEvent<HTMLInputElement>, category: 'insurance' | 'inspection') => {
    const value = e.target.value.toUpperCase().replace(/[^A-ZА-Я]/g, '').slice(0, 2);
    if (category === 'insurance') {
      setFormData(prev => ({
        ...prev,
        insuranceData: {
          series: value,
          number: prev.insuranceData?.number || '',
          startDate: prev.insuranceData?.startDate || '',
          endDate: prev.insuranceData?.endDate || ''
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        inspectionData: {
          series: value,
          number: prev.inspectionData?.number || '',
          validUntil: prev.inspectionData?.validUntil || ''
        }
      }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, category: 'insurance' | 'inspection') => {
    const value = e.target.value.replace(/\D/g, '');
    if (category === 'insurance') {
      setFormData(prev => ({
        ...prev,
        insuranceData: {
          series: prev.insuranceData?.series || '',
          number: value,
          startDate: prev.insuranceData?.startDate || '',
          endDate: prev.insuranceData?.endDate || ''
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        inspectionData: {
          series: prev.inspectionData?.series || '',
          number: value,
          validUntil: prev.inspectionData?.validUntil || ''
        }
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ExpenseFormErrors = {};

    if (!formData.date) {
      newErrors.date = 'Укажите дату расхода';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Укажите корректную сумму';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Введите описание расхода';
    }

    if (formData.odometer !== undefined && formData.odometer < 0) {
      newErrors.odometer = 'Пробег не может быть отрицательным';
    }

    // Валидация полей заправки
    if (formData.category === 'fuel') {
      if (formData.fuelData?.liters !== undefined && formData.fuelData.liters <= 0) {
        newErrors.liters = 'Укажите корректное количество литров';
      }

      if (formData.fuelData?.remainingRange !== undefined && formData.fuelData.remainingRange < 0) {
        newErrors.remainingRange = 'Запас хода не может быть отрицательным';
      }

      if (formData.fuelData?.averageConsumption !== undefined && formData.fuelData.averageConsumption <= 0) {
        newErrors.averageConsumption = 'Укажите корректный расход';
      }
    }

    // Валидация полей страховки
    if (formData.category === 'insurance') {
      if (formData.insuranceData?.series && formData.insuranceData.series.length !== 2) {
        newErrors.series = 'Серия должна содержать 2 буквы';
      }
      if (formData.insuranceData?.number && formData.insuranceData.number.length === 0) {
        newErrors.number = 'Введите номер';
      }
      if (!formData.insuranceData?.startDate) {
        newErrors.startDate = 'Укажите начало страхования';
      }
      if (!formData.insuranceData?.endDate) {
        newErrors.endDate = 'Укажите конец страхования';
      }
    }

    // Валидация полей техосмотра
    if (formData.category === 'inspection') {
      if (formData.inspectionData?.series && formData.inspectionData.series.length !== 2) {
        newErrors.series = 'Серия должна содержать 2 буквы';
      }
      if (formData.inspectionData?.number && formData.inspectionData.number.length === 0) {
        newErrors.number = 'Введите номер';
      }
      if (!formData.inspectionData?.validUntil) {
        newErrors.validUntil = 'Укажите дату окончания';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !selectedCar) {
      return;
    }

    setLoading(true);

    try {
      console.log('Saving expense...', formData);
      
      if (expense) {
        const result = await ExpenseService.updateExpense(expense.id, {
          ...formData,
          carId: selectedCar.id
        });
        console.log('Expense updated:', result);
      } else {
        const result = await ExpenseService.addExpense({
          ...formData,
          carId: selectedCar.id
        });
        console.log('Expense added:', result);
      }
      
      setTimeout(() => {
        console.log('Calling onSave...');
        onSave();
      }, 100);
      
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Ошибка при сохранении расхода');
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions: { value: ExpenseCategory; label: string; icon: string }[] = [
    { value: 'fuel', label: '⛽ Заправка', icon: '⛽' },
    { value: 'maintenance', label: '🔧 Техобслуживание', icon: '🔧' },
    { value: 'repairs', label: '🛠️ Ремонт', icon: '🛠️' },
    { value: 'parts', label: '⚙️ Запчасти', icon: '⚙️' },
    { value: 'insurance', label: '🛡️ Страховка', icon: '🛡️' },
    { value: 'taxes', label: '📄 Налоги', icon: '📄' },
    { value: 'parking', label: '🅿️ Парковка', icon: '🅿️' },
    { value: 'washing', label: '🧼 Мойка', icon: '🧼' },
    { value: 'fines', label: '🚨 Штрафы', icon: '🚨' },
    { value: 'inspection', label: '📋 Техосмотр', icon: '📋' },
    { value: 'other', label: '💰 Прочее', icon: '💰' }
  ];

  const isFuelCategory = formData.category === 'fuel';
  const isPartsCategory = formData.category === 'parts';
  const isInsuranceCategory = formData.category === 'insurance';
  const isInspectionCategory = formData.category === 'inspection';

  return (
    <form className="modal__form" onSubmit={handleSubmit}>
      <div className="modal__form-grid">
        <div className="modal__form-group">
          <label htmlFor="date" className="modal__label modal__label--required">
            Дата
          </label>
          <input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleInputChange}
            className={`modal__input ${errors.date ? 'modal__input--error' : ''}`}
            required
          />
          {errors.date && <span className="modal__error">{errors.date}</span>}
        </div>

        <div className="modal__form-group">
          <label htmlFor="category" className="modal__label modal__label--required">
            Категория
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="modal__input"
          >
            {categoryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="modal__form-group">
          <label htmlFor="amount" className="modal__label modal__label--required">
            Сумма ({getCurrencySymbol()})
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount || ''}
            onChange={handleInputChange}
            className={`modal__input ${errors.amount ? 'modal__input--error' : ''}`}
            placeholder="0.00"
            required
          />
          {errors.amount && <span className="modal__error">{errors.amount}</span>}
        </div>

        <div className="modal__form-group">
          <label htmlFor="odometer" className="modal__label">
            Пробег (км)
          </label>
          <input
            id="odometer"
            name="odometer"
            type="number"
            min="0"
            value={formData.odometer || ''}
            onChange={handleInputChange}
            className={`modal__input ${errors.odometer ? 'modal__input--error' : ''}`}
            placeholder="Необязательно"
          />
          {errors.odometer && <span className="modal__error">{errors.odometer}</span>}
        </div>

        {/* Поля для заправки */}
        {isFuelCategory && (
          <>
            <div className="modal__form-group">
              <label htmlFor="fuelData.liters" className="modal__label">
                Заправлено (л)
              </label>
              <input
                id="fuelData.liters"
                name="fuelData.liters"
                type="number"
                step="0.1"
                min="0"
                value={formData.fuelData?.liters || ''}
                onChange={handleInputChange}
                className={`modal__input ${errors.liters ? 'modal__input--error' : ''}`}
                placeholder="0.0"
              />
              {errors.liters && <span className="modal__error">{errors.liters}</span>}
            </div>

            <div className="modal__form-group">
              <label htmlFor="fuelData.remainingRange" className="modal__label">
                Запас хода (км)
              </label>
              <input
                id="fuelData.remainingRange"
                name="fuelData.remainingRange"
                type="number"
                min="0"
                value={formData.fuelData?.remainingRange || ''}
                onChange={handleInputChange}
                className={`modal__input ${errors.remainingRange ? 'modal__input--error' : ''}`}
                placeholder="0"
              />
              {errors.remainingRange && <span className="modal__error">{errors.remainingRange}</span>}
            </div>

            <div className="modal__form-group">
              <label htmlFor="fuelData.averageConsumption" className="modal__label">
                Ср. расход (л/100км)
              </label>
              <input
                id="fuelData.averageConsumption"
                name="fuelData.averageConsumption"
                type="number"
                step="0.1"
                min="0"
                value={formData.fuelData?.averageConsumption || ''}
                onChange={handleInputChange}
                className={`modal__input ${errors.averageConsumption ? 'modal__input--error' : ''}`}
                placeholder="0.0"
              />
              {errors.averageConsumption && <span className="modal__error">{errors.averageConsumption}</span>}
            </div>
          </>
        )}

        {/* Поля для запчастей */}
        {isPartsCategory && (
          <>
            <div className="modal__form-group">
              <label htmlFor="partsData.article" className="modal__label">
                Артикул
              </label>
              <input
                id="partsData.article"
                name="partsData.article"
                type="text"
                value={formData.partsData?.article || ''}
                onChange={handleInputChange}
                className="modal__input"
                placeholder="Номер артикула"
              />
            </div>

            <div className="modal__form-group">
              <label htmlFor="partsData.link" className="modal__label">
                Ссылка
              </label>
              <input
                id="partsData.link"
                name="partsData.link"
                type="url"
                value={formData.partsData?.link || ''}
                onChange={handleInputChange}
                className="modal__input"
                placeholder="https://example.com"
              />
            </div>
          </>
        )}

        {/* Поля для страховки */}
        {isInsuranceCategory && (
          <>
            <div className="modal__form-group modal__form-group--full">
              <label className="modal__label">Серия и номер</label>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '8px' }}>
                <input
                  type="text"
                  value={formData.insuranceData?.series || ''}
                  onChange={(e) => handleSeriesChange(e, 'insurance')}
                  className={`modal__input ${errors.series ? 'modal__input--error' : ''}`}
                  placeholder="АА"
                  maxLength={2}
                  style={{ textTransform: 'uppercase', textAlign: 'center' }}
                />
                <input
                  type="text"
                  value={formData.insuranceData?.number || ''}
                  onChange={(e) => handleNumberChange(e, 'insurance')}
                  className={`modal__input ${errors.number ? 'modal__input--error' : ''}`}
                  placeholder="Номер"
                />
              </div>
              {(errors.series || errors.number) && (
                <span className="modal__error">{errors.series || errors.number}</span>
              )}
            </div>

            <div className="modal__form-group modal__form-group--full">
              <label className="modal__label">Срок страхования</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <input
                  type="date"
                  value={formData.insuranceData?.startDate || ''}
                  onChange={handleInputChange}
                  name="insuranceData.startDate"
                  className={`modal__input ${errors.startDate ? 'modal__input--error' : ''}`}
                />
                <input
                  type="date"
                  value={formData.insuranceData?.endDate || ''}
                  onChange={handleInputChange}
                  name="insuranceData.endDate"
                  className={`modal__input ${errors.endDate ? 'modal__input--error' : ''}`}
                />
              </div>
              {(errors.startDate || errors.endDate) && (
                <span className="modal__error">{errors.startDate || errors.endDate}</span>
              )}
            </div>
          </>
        )}

        {/* Поля для техосмотра */}
        {isInspectionCategory && (
          <>
            <div className="modal__form-group modal__form-group--full">
              <label className="modal__label">Серия и номер</label>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '8px' }}>
                <input
                  type="text"
                  value={formData.inspectionData?.series || ''}
                  onChange={(e) => handleSeriesChange(e, 'inspection')}
                  className={`modal__input ${errors.series ? 'modal__input--error' : ''}`}
                  placeholder="АА"
                  maxLength={2}
                  style={{ textTransform: 'uppercase', textAlign: 'center' }}
                />
                <input
                  type="text"
                  value={formData.inspectionData?.number || ''}
                  onChange={(e) => handleNumberChange(e, 'inspection')}
                  className={`modal__input ${errors.number ? 'modal__input--error' : ''}`}
                  placeholder="Номер"
                />
              </div>
              {(errors.series || errors.number) && (
                <span className="modal__error">{errors.series || errors.number}</span>
              )}
            </div>

            <div className="modal__form-group">
              <label htmlFor="inspectionData.validUntil" className="modal__label">
                Действителен до
              </label>
              <input
                id="inspectionData.validUntil"
                name="inspectionData.validUntil"
                type="date"
                value={formData.inspectionData?.validUntil || ''}
                onChange={handleInputChange}
                className={`modal__input ${errors.validUntil ? 'modal__input--error' : ''}`}
              />
              {errors.validUntil && <span className="modal__error">{errors.validUntil}</span>}
            </div>
          </>
        )}

        <div className="modal__form-group modal__form-group--full">
          <label htmlFor="description" className="modal__label modal__label--required">
            Описание
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className={`modal__input modal__input--textarea ${errors.description ? 'modal__input--error' : ''}`}
            placeholder="Краткое описание расхода..."
            rows={3}
            required
          />
          {errors.description && <span className="modal__error">{errors.description}</span>}
        </div>
      </div>

      <div className="modal__actions-container">
        <div className="modal__actions modal__actions--centered">
          <button
            type="button"
            className="btn btn--cancel"
            onClick={onCancel}
            disabled={loading}
          >
            Отмена
          </button>
          <button
            type="submit"
            className={`btn btn--action ${loading ? 'btn--action-loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Сохранение...' : expense ? 'Сохранить' : 'Сохранить'}
          </button>
        </div>
        
        <div className="modal__footer-signature">
          © 2025 <span className="modal__footer-app-name">RuNiko</span>
        </div>
      </div>
    </form>
  );
};

export default ExpenseForm;