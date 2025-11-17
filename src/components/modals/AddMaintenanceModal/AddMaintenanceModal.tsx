import React, { useState, useEffect } from 'react';
import Modal from '../../ui/Modal/Modal';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { useTranslation } from '../../../contexts/LanguageContext';
import { MAINTENANCE_CATEGORIES } from '../../../data/maintenanceCategories';

interface AddMaintenanceModalProps {
  onClose: () => void;
  onSave: (maintenanceData: any) => void;
  selectedCar?: any;
}

const AddMaintenanceModal: React.FC<AddMaintenanceModalProps> = ({ onClose, onSave, selectedCar }) => {
  const { getCurrencySymbol } = useCurrency();
  const { t } = useTranslation();
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [customFields, setCustomFields] = useState<Record<string, any>>({});
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    mileage: '',
    cost: '',
  });

  const selectedCategoryData = MAINTENANCE_CATEGORIES.find(cat => cat.id === selectedCategory);
  const selectedSubcategoryData = selectedCategoryData?.subcategories.find(sub => sub.id === selectedSubcategory);

  // Автозаполнение на основе предыдущих записей
  useEffect(() => {
    if (selectedSubcategoryData && selectedCar) {
      const lastMaintenance = selectedCar.maintenance
        ?.filter((m: any) => m.subcategoryId === selectedSubcategory)
        ?.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

      if (lastMaintenance?.customFields) {
        setCustomFields(lastMaintenance.customFields);
      } else if (selectedSubcategoryData.defaultValues) {
        setCustomFields(selectedSubcategoryData.defaultValues);
      }
    }
  }, [selectedSubcategory, selectedCar, selectedSubcategoryData]);

  const handleCustomFieldChange = (fieldName: string, value: any) => {
    setCustomFields(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (formData.date && selectedCategory && selectedSubcategory) {
      onSave({
        date: formData.date,
        mileage: formData.mileage ? parseInt(formData.mileage) : 0,
        cost: formData.cost ? parseInt(formData.cost) : null,
        categoryId: selectedCategory,
        subcategoryId: selectedSubcategory,
        customFields
      });
    }
  };

  const isFormValid = formData.date && selectedCategory && selectedSubcategory;

  // Рекомендация по пробегу на основе предыдущего ТО
  const getMileageRecommendation = () => {
    if (!selectedCar?.maintenance || !selectedSubcategory) return null;

    const lastSimilarMaintenance = selectedCar.maintenance
      .filter((m: any) => m.subcategoryId === selectedSubcategory)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    if (lastSimilarMaintenance) {
      const recommendedMileage = lastSimilarMaintenance.mileage + 10000; // Пример: +10к км
      return t('maintenance.mileageRecommendation', {
        recommendedMileage: recommendedMileage.toLocaleString('ru-RU'),
        lastMileage: lastSimilarMaintenance.mileage.toLocaleString('ru-RU')
      });
    }

    return null;
  };

  const mileageRecommendation = getMileageRecommendation();

  return (
    <Modal isOpen={true} onClose={onClose} title={t('maintenance.add')} size="lg">
      <form className="modal__form" onSubmit={handleSubmit}>
        
        {/* Шаг 1: Выбор категории */}
        <div className="modal__form-section">
          <div className="modal__form-group">
            <label className="modal__label modal__label--required">{t('maintenance.selectCategory')}</label>
            <select
              className="modal__input"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedSubcategory('');
                setCustomFields({});
              }}
              required
            >
              <option value="">-- {t('maintenance.selectCategory')} --</option>
              {MAINTENANCE_CATEGORIES.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {t(`maintenanceCategories.${category.id}`)} {/* <-- ИСПРАВЛЕНО */}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Шаг 2: Выбор конкретной работы */}
        {selectedCategoryData && (
          <div className="modal__form-section">
            <div className="modal__form-group">
              <label className="modal__label modal__label--required">{t('maintenance.selectSubcategory')}</label>
              <select
                className="modal__input"
                value={selectedSubcategory}
                onChange={(e) => {
                  setSelectedSubcategory(e.target.value);
                  setCustomFields({});
                }}
                required
              >
                <option value="">-- {t('maintenance.selectSubcategory')} --</option>
                {selectedCategoryData.subcategories.map(subcategory => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {t(`maintenanceCategories.subcategories.${subcategory.id}`)} {/* <-- ИСПРАВЛЕНО */}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Шаг 3: Основные поля и поля категории */}
        {selectedSubcategoryData && (
          <>
            {/* Рекомендация по пробегу */}
            {mileageRecommendation && (
              <div className="modal__recommendation">
                <div className="modal__recommendation-icon">💡</div>
                <div className="modal__recommendation-text">{mileageRecommendation}</div>
              </div>
            )}

            {/* Основные поля */}
            <div className="modal__form-section">
              <div className="modal__form-grid">
                <div className="modal__form-group">
                  <label className="modal__label modal__label--required">{t('maintenance.date')}</label>
                  <input
                    type="date"
                    className="modal__input"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>

                <div className="modal__form-group">
                  <label className="modal__label modal__label--required">{t('maintenance.mileage')} ({t('units.km')})</label>
                  <input
                    type="number"
                    className="modal__input"
                    value={formData.mileage}
                    onChange={(e) => setFormData({...formData, mileage: e.target.value})}
                    required
                    min="0"
                    placeholder={t('maintenance.currentMileage')}
                  />
                </div>

                <div className="modal__form-group">
                  <label className="modal__label">{t('maintenance.cost')} ({getCurrencySymbol()})</label>
                  <input
                    type="number"
                    className="modal__input"
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: e.target.value})}
                    min="0"
                    placeholder={t('common.optional')} 
                  />
                </div>
              </div>
            </div>

            {/* Поля выбранной подкатегории */}
            {selectedSubcategoryData.fields.length > 0 && (
              <div className="modal__form-section">
                <div className="modal__form-grid">
                  {selectedSubcategoryData.fields
                    .filter(field => field.name !== 'cost')
                    .map(field => (
                      <div key={field.name} className="modal__form-group">
                        <label className={`modal__label ${field.required ? 'modal__label--required' : ''}`}>
                          {field.label} {/* <-- ЗДЕСЬ ОСТАВЛЯЕМ КАК ЕСТЬ, т.к. это лейблы полей форм */}
                        </label>
                        
                        {field.type === 'text' && (
                          <input
                            type="text"
                            className="modal__input"
                            value={customFields[field.name] || ''}
                            onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                            required={field.required}
                            placeholder={field.placeholder}
                          />
                        )}
                        
                        {field.type === 'number' && (
                          <input
                            type="number"
                            className="modal__input"
                            value={customFields[field.name] || ''}
                            onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                            required={field.required}
                            placeholder={field.placeholder}
                            min={field.min}
                            step={field.step}
                          />
                        )}

                        {field.type === 'select' && field.options && (
                          <select
                            className="modal__input"
                            value={customFields[field.name] || ''}
                            onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                            required={field.required}
                          >
                            <option value="">{t('common.choose')}</option>
                            {field.options.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        )}

                        {field.type === 'checkbox' && (
                          <label className="modal__checkbox">
                            <input
                              type="checkbox"
                              checked={customFields[field.name] || false}
                              onChange={(e) => handleCustomFieldChange(field.name, e.target.checked)}
                            />
                            <span className="modal__checkbox-label">{field.label}</span> {/* <-- ЗДЕСЬ ОСТАВЛЯЕМ КАК ЕСТЬ */}
                          </label>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Кнопки действий */}
        <div className="modal__actions-container">
          <div className="modal__actions modal__actions--centered">
            <button type="button" className="btn btn--cancel" onClick={onClose}>
              {t('common.cancel')}
            </button>
            <button 
              type="submit" 
              className="btn btn--action"
              disabled={!isFormValid}
            >
              {t('maintenance.add')}
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

export default AddMaintenanceModal;