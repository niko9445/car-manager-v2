import React, { useEffect } from 'react';
import { Maintenance, Car } from '../../../types';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { useTranslation } from '../../../contexts/LanguageContext';
import { MAINTENANCE_CATEGORIES } from '../../../data/maintenanceCategories';

interface MaintenanceCardProps {
  maintenance: Maintenance;
  car: Car;
  onDelete: () => void;
  onEdit: () => void;
  position: number;
  isExpanded: boolean;
  onToggle: () => void;
}

const MaintenanceCard: React.FC<MaintenanceCardProps> = ({ 
  maintenance, 
  car, 
  onDelete, 
  onEdit, 
  position,
  isExpanded,
  onToggle
}) => {
  const { formatCurrency } = useCurrency();
  const { t } = useTranslation();

  // Получаем данные о категории и подкатегории
  const categoryData = MAINTENANCE_CATEGORIES.find(cat => cat.id === maintenance.categoryId);
  const subcategoryData = categoryData?.subcategories.find(sub => sub.id === maintenance.subcategoryId);

  // 🔴 ДОБАВЛЕНО: Отладочное логирование
  useEffect(() => {
    console.log('🔧 [MaintenanceCard] DEBUG:', {
      id: maintenance.id,
      subcategoryId: maintenance.subcategoryId,
      categoryId: maintenance.categoryId,
      categoryData: categoryData?.name,
      subcategoryData: subcategoryData?.name,
      // workType: maintenance.workType // 🔴 УБРАНО - этого поля может не быть
    });
  }, [maintenance, categoryData, subcategoryData]);

  const handleCardClick = () => {
    onToggle();
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString('ru-RU');
  };

  // Форматируем кастомные поля для отображения
  const formatCustomFields = () => {
    if (!maintenance.customFields) return null;
    
    return Object.entries(maintenance.customFields)
      .filter(([key, value]) => 
        value !== '' && 
        value !== null && 
        value !== undefined && 
        value !== false &&
        key !== 'cost'
      )
      .map(([key, value]) => {
        const fieldConfig = subcategoryData?.fields.find(field => field.name === key);
        
        // ИСПРАВЛЕНИЕ: Используем перевод для лейбла
        const label = fieldConfig ? t(`maintenanceFields.${fieldConfig.name}`) : key;
        
        let displayValue = value;
        if (typeof value === 'boolean') {
          displayValue = '✓';
        }
        
        return { label, value: displayValue };
      });
  };

  const customFields = formatCustomFields();
  const hasCustomFields = customFields && customFields.length > 0;

  // 🔴 ИСПРАВЛЕНО: Получаем название для заголовка
  const getMaintenanceTitle = (): string => {
    // 1. Пробуем получить название подкатегории
    if (subcategoryData?.name) {
      return subcategoryData.name;
    }
    
    // 2. Пробуем получить название категории
    if (categoryData?.name) {
      return categoryData.name;
    }
    
    // 3. Используем fallback перевод
    return t('maintenance.technicalService');
  };

  // 🔴 ИСПРАВЛЕНО: Получаем название для категории
  const getCategoryTitle = (): string => {
    return categoryData?.name || t('maintenance.technicalService');
  };

  return (
    <div 
      className={`card card--interactive ${isExpanded ? 'card--expanded' : ''}`}
      onClick={handleCardClick}
      style={{ animationDelay: `${position * 0.1}s` }}
    >
      <div className="card__header">
        <div className="card__main-info">
          {/* Дата как лейбл сверху */}
          <div className="maintenance-date-label">
            {formatDate(maintenance.date)}
          </div>
          
          {/* Тип работ как заголовок */}
          <div className="maintenance-type">
            {getMaintenanceTitle()} {/* 🔴 ИСПРАВЛЕНО */}
          </div>
          
          {/* В нераскрытой карточке ТОЛЬКО затраты */}
          <div className="card__preview">
            {maintenance.cost && (
              <div className="card__preview-item">
                <span className="card__preview-label">{t('maintenance.costs')}:</span>
                <span className="card__preview-value">
                  {formatCurrency(maintenance.cost)}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="card__header-actions">
          <div className="card__corner-actions">
            <button 
              className="card__corner-action"
              onClick={(e) => handleActionClick(e, onEdit)}
              title={t('common.edit')}
              type="button"
            >
              <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
            <button 
              className="card__corner-action card__corner-action--danger"
              onClick={(e) => handleActionClick(e, onDelete)}
              title={t('common.delete')} 
              type="button"
            >
              <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Полный вид - появляется при раскрытии */}
      {isExpanded && (
        <div className="card__expanded-content">
          {/* Основная информация */}
          <div className="card__info-grid">
            <div className="card__info-item">
              <div className="card__info-label">{t('maintenance.category')}</div>
              <div className="card__info-value">
                {categoryData?.icon} {getCategoryTitle()} {/* 🔴 ИСПРАВЛЕНО */}
              </div>
            </div>
            
            {maintenance.mileage > 0 && (
              <div className="card__info-item">
                <div className="card__info-label">{t('maintenance.mileage')}</div>
                <div className="card__info-value">{formatNumber(maintenance.mileage)} {t('units.km')}</div>
              </div>
            )}
            
          </div>

          {/* Детали работ */}
          {hasCustomFields && (
            <div style={{ 
              marginTop: '20px'
            }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr',
                gap: '12px'
              }}>
                {customFields.map((field, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div style={{
                      color: 'var(--color-text-secondary)',
                      fontWeight: '500',
                      fontSize: '12px'
                    }}>
                      {field.label}
                    </div>
                    <div style={{
                      color: 'var(--color-text-primary)',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>
                      {field.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MaintenanceCard;