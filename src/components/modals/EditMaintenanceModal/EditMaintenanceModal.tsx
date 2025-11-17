import React, { useState, useEffect } from 'react';
import Modal from '../../ui/Modal/Modal';
import { EditMaintenanceModalProps } from '../../../types';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { useTranslation } from '../../../contexts/LanguageContext';
import { MAINTENANCE_CATEGORIES } from '../../../data/maintenanceCategories';

const EditMaintenanceModal: React.FC<EditMaintenanceModalProps> = ({ 
  maintenance, 
  onClose, 
  onSave 
}) => {
  const { getCurrencySymbol } = useCurrency();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    date: maintenance.date,
    mileage: maintenance.mileage.toString(),
    cost: maintenance.cost ? maintenance.cost.toString() : ''
  });

  const [customFields, setCustomFields] = useState<Record<string, any>>(
    maintenance.customFields || {}
  );

  // Получаем данные о категории и подкатегории
  const categoryData = MAINTENANCE_CATEGORIES.find(cat => cat.id === maintenance.categoryId);
  const subcategoryData = categoryData?.subcategories.find(sub => sub.id === maintenance.subcategoryId);

  useEffect(() => {
    // Инициализируем форму данными из maintenance
    setFormData({
      date: maintenance.date,
      mileage: maintenance.mileage.toString(),
      cost: maintenance.cost ? maintenance.cost.toString() : ''
    });
    setCustomFields(maintenance.customFields || {});
  }, [maintenance]);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (formData.date) {
      const updatedData = {
        date: formData.date,
        mileage: formData.mileage ? parseInt(formData.mileage) : 0,
        cost: formData.cost ? parseInt(formData.cost) : null,
        categoryId: maintenance.categoryId,
        subcategoryId: maintenance.subcategoryId,
        customFields
      };
      onSave(maintenance.id, updatedData);
    }
  };

  const handleInputChange = (field: string, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCustomFieldChange = (fieldName: string, value: any): void => {
    setCustomFields(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const isFormValid = formData.date;

  return (
    <Modal isOpen={true} onClose={onClose} title={t('maintenance.edit')} size="lg">
      <form className="modal__form" onSubmit={handleSubmit}>
        
        {/* Информация о категории (только для отображения) */}
        <div className="card card--compact">
          <div className="card__header">
            <h3 className="card__title card__title--sm">{t('maintenance.category')}</h3>
          </div>
          <div className="card__content">
            <div className="modal__info-row">
              <div className="modal__info-label">{t('maintenance.category')}:</div>
              <div className="modal__info-value">
                {categoryData?.icon} {t(`maintenanceCategories.${maintenance.categoryId}`)} {/* <-- ИСПРАВЛЕНО */}
              </div>
            </div>
            <div className="modal__info-row">
              <div className="modal__info-label">{t('maintenance.subcategory')}:</div>
              <div className="modal__info-value">
                {t(`maintenanceCategories.subcategories.${maintenance.subcategoryId}`)} {/* <-- ИСПРАВЛЕНО */}
              </div>
            </div>
          </div>
        </div>

        {/* Основные параметры */}
        <div className="card card--compact">
          <div className="card__header">
            <h3 className="card__title card__title--sm">{t('maintenance.mainParameters')}</h3>
          </div>
          <div className="card__content">
            <div className="modal__form-grid">
              <div className="modal__form-group">
                <label className="modal__label modal__label--required">{t('maintenance.date')}</label>
                <input
                  type="date"
                  className="modal__input"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  required
                />
              </div>

              <div className="modal__form-group">
                <label className="modal__label">{t('maintenance.mileage')} ({t('units.km')})</label>
                <input
                  type="number"
                  className="modal__input"
                  value={formData.mileage}
                  onChange={(e) => handleInputChange('mileage', e.target.value)}
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
                  onChange={(e) => handleInputChange('cost', e.target.value)}
                  min="0"
                  placeholder={t('common.optional')} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Детали работ (если есть кастомные поля) */}
        {subcategoryData && subcategoryData.fields.length > 0 && (
          <div className="card card--compact">
            <div className="card__header">
              <h3 className="card__title card__title--sm">{t('maintenance.workDetails')}</h3> {/* <-- ДОБАВИТЬ */}
            </div>
            <div className="card__content">
              <div className="modal__form-grid">
                {subcategoryData.fields
                  .filter(field => field.name !== 'cost')
                  .map(field => (
                    <div key={field.name} className="modal__form-group">
                      <label className={`modal__label ${field.required ? 'modal__label--required' : ''}`}>
                        {field.label}
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
                          <span className="modal__checkbox-label">{field.label}</span>
                        </label>
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
            <button type="button" className="btn btn--cancel" onClick={onClose}>
              {t('common.cancel')}
            </button>
            <button 
              type="submit" 
              className="btn btn--action"
              disabled={!isFormValid}
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

export default EditMaintenanceModal;