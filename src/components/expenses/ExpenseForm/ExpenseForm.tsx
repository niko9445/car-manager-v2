import React, { useState, useEffect } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Expense, ExpenseCategory, FuelData, PartsData, InsuranceData, InspectionData } from '../../../types';
import { expenseService } from '../../../services/database/expenses';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { useTranslation } from '../../../contexts/LanguageContext'; // <-- ДОБАВИТЬ
import { useAuth } from '../../../contexts/AuthContext';

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
  const { t } = useTranslation();
  const { user } = useAuth();
  
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
  const [quickTags, setQuickTags] = useState<string[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);

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

  // Сброс описания при смене категории
  useEffect(() => {
    if (!expense) {
      setFormData(prev => ({
        ...prev,
        description: ''
      }));
    }
  }, [formData.category, expense]);


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
    };
  };

  //Функция для быстрых слов
  const handleQuickTagSelect = (tag: string) => {
    setFormData(prev => {
      const currentDescription = prev.description.trim();
      
      if (!currentDescription) {
        return { ...prev, description: tag };
      }
      
      const tagsInDescription = currentDescription
        .split('+')
        .map(t => t.trim())
        .filter(t => t.length > 0);
      
      const isTagSelected = tagsInDescription.includes(tag);
      
      if (isTagSelected) {
        const newTags = tagsInDescription.filter(t => t !== tag);
        return { ...prev, description: newTags.join(' + ') };
      } else {
        const newTags = [...tagsInDescription, tag];
        return { ...prev, description: newTags.join(' + ') };
      }
    });
  };

  const validateForm = (): boolean => {
    const newErrors: ExpenseFormErrors = {};

    if (!formData.date) {
      newErrors.date = t('expenseForm.dateRequired'); // <-- ПЕРЕВОД
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = t('expenseForm.amountRequired'); // <-- ПЕРЕВОД
    }

    if (!formData.description.trim()) {
      newErrors.description = t('expenseForm.descriptionRequired'); // <-- ПЕРЕВОД
    }

    if (formData.odometer !== undefined && formData.odometer < 0) {
      newErrors.odometer = t('expenseForm.odometerInvalid'); // <-- ПЕРЕВОД
    }

    // Валидация полей заправки
    if (formData.category === 'fuel') {
      if (formData.fuelData?.liters !== undefined && formData.fuelData.liters <= 0) {
        newErrors.liters = t('expenseForm.litersRequired'); // <-- ПЕРЕВОД
      }
    }

    // Валидация полей страховки
    if (formData.category === 'insurance') {
      if (formData.insuranceData?.series && formData.insuranceData.series.length !== 2) {
        newErrors.series = t('expenseForm.seriesRequired'); // <-- ПЕРЕВОД
      }
      if (formData.insuranceData?.number && formData.insuranceData.number.length === 0) {
        newErrors.number = t('expenseForm.numberRequired'); // <-- ПЕРЕВОД
      }
      if (!formData.insuranceData?.startDate) {
        newErrors.startDate = t('expenseForm.startDateRequired'); // <-- ПЕРЕВОД
      }
      if (!formData.insuranceData?.endDate) {
        newErrors.endDate = t('expenseForm.endDateRequired'); // <-- ПЕРЕВОД
      }
    }

    // Валидация полей техосмотра
    if (formData.category === 'inspection') {
      if (formData.inspectionData?.series && formData.inspectionData.series.length !== 2) {
        newErrors.series = t('expenseForm.seriesRequired'); // <-- ПЕРЕВОД
      }
      if (formData.inspectionData?.number && formData.inspectionData.number.length === 0) {
        newErrors.number = t('expenseForm.numberRequired'); // <-- ПЕРЕВОД
      }
      if (!formData.inspectionData?.validUntil) {
        newErrors.validUntil = t('expenseForm.validUntilRequired'); // <-- ПЕРЕВОД
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !selectedCar || !user) {
      return;
    }

    setLoading(true);

    try {
      console.log('Saving expense...', formData);
      
      if (expense) {
        // ИЗМЕНИТЬ: используем новый сервис для обновления
        const result = await expenseService.updateExpense(expense.id, {
          date: formData.date,
          category: formData.category,
          amount: formData.amount,
          description: formData.description,
          odometer: formData.odometer,
          fuelData: formData.fuelData,
          partsData: formData.partsData,
          insuranceData: formData.insuranceData,
          inspectionData: formData.inspectionData
        });
        console.log('Expense updated:', result);
      } else {
        // ИЗМЕНИТЬ: используем новый сервис для создания
        const result = await expenseService.createExpense({
          date: formData.date,
          category: formData.category,
          amount: formData.amount,
          description: formData.description,
          odometer: formData.odometer,
          fuelData: formData.fuelData,
          partsData: formData.partsData,
          insuranceData: formData.insuranceData,
          inspectionData: formData.inspectionData
        }, selectedCar.id);
        console.log('Expense added:', result);
      }
      
      setTimeout(() => {
        console.log('Calling onSave...');
        onSave();
      }, 100);
      
    } catch (error) {
      console.error('Error saving expense:', error);
      alert(t('expenseForm.saveError'));
    } finally {
      setLoading(false);
    }
  };


  const categoryOptions: { value: ExpenseCategory; label: string; icon: string }[] = [
    { value: 'fuel', label: `⛽ ${t('expenseCategories.fuel')}`, icon: '⛽' }, // <-- ПЕРЕВОД
    { value: 'maintenance', label: `🔧 ${t('expenseCategories.maintenance')}`, icon: '🔧' }, // <-- ПЕРЕВОД
    { value: 'repairs', label: `🛠️ ${t('expenseCategories.repairs')}`, icon: '🛠️' }, // <-- ПЕРЕВОД
    { value: 'parts', label: `⚙️ ${t('expenseCategories.parts')}`, icon: '⚙️' }, // <-- ПЕРЕВОД
    { value: 'insurance', label: `🛡️ ${t('expenseCategories.insurance')}`, icon: '🛡️' }, // <-- ПЕРЕВОД
    { value: 'taxes', label: `📄 ${t('expenseCategories.taxes')}`, icon: '📄' }, // <-- ПЕРЕВОД
    { value: 'parking', label: `🅿️ ${t('expenseCategories.parking')}`, icon: '🅿️' }, // <-- ПЕРЕВОД
    { value: 'washing', label: `🧼 ${t('expenseCategories.washing')}`, icon: '🧼' }, // <-- ПЕРЕВОД
    { value: 'fines', label: `🚨 ${t('expenseCategories.fines')}`, icon: '🚨' }, // <-- ПЕРЕВОД
    { value: 'inspection', label: `📋 ${t('expenseCategories.inspection')}`, icon: '📋' }, // <-- ПЕРЕВОД
    { value: 'other', label: `💰 ${t('expenseCategories.other')}`, icon: '💰' } // <-- ПЕРЕВОД
  ];

  const getQuickTags = (key: string): string[] => {
    const tags = t(key, { returnObjects: true });
    
    // Проверяем, что это массив строк
    if (Array.isArray(tags) && tags.every(item => typeof item === 'string')) {
      return tags as string[];
    }
    
    // Fallback значения на случай проблем с переводами
    const fallbackTags: Record<string, string[]> = {
      'expenseForm.quickTags.fuel': ['АИ-92', 'АИ-95', 'АИ-98', 'Дизель', 'Газ'],
      'expenseForm.quickTags.maintenance': ['Масло', 'Фильтр', 'Тормоза', 'Шины', 'АКБ', 'Жидкости'],
      'expenseForm.quickTags.repairs': ['Двигатель', 'Трансмиссия', 'Электрика', 'Кузов', 'Подвеска', 'Выхлопная'],
      'expenseForm.quickTags.parts': ['Свечи', 'Тормозные колодки', 'Амортизаторы', 'Ремень ГРМ', 'Диски', 'Щетки'],
      'expenseForm.quickTags.insurance': ['КАСКО', 'Годовая', 'Полгода'],
      'expenseForm.quickTags.taxes': ['Транспортный'],
      'expenseForm.quickTags.parking': ['ТЦ', 'Улица', 'Подземная', 'Аэропорт', 'Вокзал', 'Отель'],
      'expenseForm.quickTags.washing': ['Автомат', 'Ручная', 'Самообслуживание', 'Полная', 'Бесконтактная', 'Полировка'],
      'expenseForm.quickTags.fines': ['Скорость', 'Парковка', 'Пересечение', 'Стоянка', 'Ремень', 'Телефон'],
      'expenseForm.quickTags.inspection': ['Плановый', 'Внеочередной', 'Предпродажный', 'Техосмотр', 'Диагностика'],
      'expenseForm.quickTags.other': ['Кофе', 'Чай', 'Сигареты', 'Комбо', 'Еда', 'Вода', 'Снеки']
    };
    
    return fallbackTags[key] || [];
  };

  const quickTagsByCategory: Record<ExpenseCategory, string[]> = {
    fuel: getQuickTags('expenseForm.quickTags.fuel'),
    maintenance: getQuickTags('expenseForm.quickTags.maintenance'),
    repairs: getQuickTags('expenseForm.quickTags.repairs'),
    parts: getQuickTags('expenseForm.quickTags.parts'),
    insurance: getQuickTags('expenseForm.quickTags.insurance'),
    taxes: getQuickTags('expenseForm.quickTags.taxes'),
    parking: getQuickTags('expenseForm.quickTags.parking'),
    washing: getQuickTags('expenseForm.quickTags.washing'),
    fines: getQuickTags('expenseForm.quickTags.fines'),
    inspection: getQuickTags('expenseForm.quickTags.inspection'),
    other: getQuickTags('expenseForm.quickTags.other')
  };

  const isFuelCategory = formData.category === 'fuel';
  const isPartsCategory = formData.category === 'parts';
  const isInsuranceCategory = formData.category === 'insurance';
  const isInspectionCategory = formData.category === 'inspection';

  return (
    <form className="modal__form" onSubmit={handleSubmit}>
      <div className="modal__form-grid">
        <div className="modal__form-group">
          <label htmlFor="date" className="modal__label modal__label--required">
            {t('expenses.date')} {/* <-- ПЕРЕВОД */}
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
            {t('expenses.category')} {/* <-- ПЕРЕВОД */}
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
            {t('expenses.amount')} ({getCurrencySymbol()}) {/* <-- ПЕРЕВОД */}
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

        {/* Поля для заправки */}
        {isFuelCategory && (
          <>
            <div className="modal__form-group">
              <label htmlFor="fuelData.liters" className="modal__label">
                {t('expenseForm.fuelLiters')} {/* <-- ПЕРЕВОД */}
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
          </>
        )}

        {/* Поля для запчастей */}
        {isPartsCategory && (
          <>
            <div className="modal__form-group">
              <label htmlFor="partsData.article" className="modal__label">
                {t('expenseForm.partArticle')} {/* <-- ПЕРЕВОД */}
              </label>
              <input
                id="partsData.article"
                name="partsData.article"
                type="text"
                value={formData.partsData?.article || ''}
                onChange={handleInputChange}
                className="modal__input"
                placeholder={t('expenseForm.articlePlaceholder')} 
              />
            </div>

            <div className="modal__form-group">
              <label htmlFor="partsData.link" className="modal__label">
                {t('expenseForm.link')} {/* <-- ПЕРЕВОД */}
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
              <label className="modal__label">{t('expenseForm.seriesNumber')}</label> {/* <-- ПЕРЕВОД */}
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '8px' }}>
                <input
                  type="text"
                  value={formData.insuranceData?.series || ''}
                  onChange={(e) => handleSeriesChange(e, 'insurance')}
                  className={`modal__input ${errors.series ? 'modal__input--error' : ''}`}
                  placeholder={t('expenseForm.series')} 
                  maxLength={2}
                  style={{ textTransform: 'uppercase', textAlign: 'center' }}
                />
                <input
                  type="text"
                  value={formData.insuranceData?.number || ''}
                  onChange={(e) => handleNumberChange(e, 'insurance')}
                  className={`modal__input ${errors.number ? 'modal__input--error' : ''}`}
                  placeholder={t('expenseForm.number')} 
                />
              </div>
              {(errors.series || errors.number) && (
                <span className="modal__error">{errors.series || errors.number}</span>
              )}
            </div>

            <div className="modal__form-group modal__form-group--full">
              <label className="modal__label">{t('expenseForm.insurancePeriod')}</label> {/* <-- ПЕРЕВОД */}
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
              <label className="modal__label">{t('expenseForm.seriesNumber')}</label> {/* <-- ПЕРЕВОД */}
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '8px' }}>
                <input
                  type="text"
                  value={formData.inspectionData?.series || ''}
                  onChange={(e) => handleSeriesChange(e, 'inspection')}
                  className={`modal__input ${errors.series ? 'modal__input--error' : ''}`}
                  placeholder={t('expenseForm.series')} 
                  maxLength={2}
                  style={{ textTransform: 'uppercase', textAlign: 'center' }}
                />
                <input
                  type="text"
                  value={formData.inspectionData?.number || ''}
                  onChange={(e) => handleNumberChange(e, 'inspection')}
                  className={`modal__input ${errors.number ? 'modal__input--error' : ''}`}
                  placeholder={t('expenseForm.number')} 
                />
              </div>
              {(errors.series || errors.number) && (
                <span className="modal__error">{errors.series || errors.number}</span>
              )}
            </div>

            <div className="modal__form-group">
              <label htmlFor="inspectionData.validUntil" className="modal__label">
                {t('expenseForm.validUntil')} {/* <-- ПЕРЕВОД */}
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
            {t('expenses.description')} {/* <-- ПЕРЕВОД */}
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className={`modal__input modal__input--textarea ${errors.description ? 'modal__input--error' : ''}`}
            placeholder={t('expenseForm.descriptionPlaceholder')} 
            rows={3}
            required
          />
          {errors.description && <span className="modal__error">{errors.description}</span>}
          {quickTagsByCategory[formData.category] && quickTagsByCategory[formData.category].length > 0 && (
            <div className="quick-tags">
              <div className="quick-tags__container">
                {quickTagsByCategory[formData.category].map(tag => {
                  const currentTags = formData.description
                    .split('+')
                    .map(t => t.trim())
                    .filter(t => t.length > 0);
                  
                  const isSelected = currentTags.includes(tag);
                  
                  return (
                    <button
                      key={tag}
                      type="button"
                      className={`quick-tag ${isSelected ? 'quick-tag--selected' : ''}`}
                      onClick={() => handleQuickTagSelect(tag)}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
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
            {t('common.cancel')} {/* <-- ПЕРЕВОД */}
          </button>
          <button
            type="submit"
            className={`btn btn--action ${loading ? 'btn--action-loading' : ''}`}
            disabled={loading}
          >
            {loading ? t('expenseForm.saving') : t('common.save')} {/* <-- ПЕРЕВОД */}
          </button>
        </div>
        
        <div className="modal__footer-signature">
          {t('app.copyright')} {/* <-- ПЕРЕВОД */}
        </div>
      </div>
    </form>
  );
};

export default ExpenseForm;