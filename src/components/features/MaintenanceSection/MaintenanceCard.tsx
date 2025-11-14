import React from 'react';
import { Maintenance, Car } from '../../../types';
import { useCurrency } from '../../../contexts/CurrencyContext';
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

  // Получаем данные о категории и подкатегории
  const categoryData = MAINTENANCE_CATEGORIES.find(cat => cat.id === maintenance.categoryId);
  const subcategoryData = categoryData?.subcategories.find(sub => sub.id === maintenance.subcategoryId);

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
        key !== 'cost' // Исключаем стоимость
      )
      .map(([key, value]) => {
        const fieldConfig = subcategoryData?.fields.find(field => field.name === key);
        const label = fieldConfig?.label || key;
        
        let displayValue = value;
        if (typeof value === 'boolean') {
          displayValue = '✓';
        }
        
        return { label, value: displayValue };
      });
  };

  const customFields = formatCustomFields();
  const hasCustomFields = customFields && customFields.length > 0;

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
            {subcategoryData?.name || 'Техническое обслуживание'}
          </div>
          
          {/* В нераскрытой карточке ТОЛЬКО затраты */}
          <div className="card__preview">
            {maintenance.cost && (
              <div className="card__preview-item">
                <span className="card__preview-label">Затраты:</span>
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
              title="Редактировать"
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
              title="Удалить"
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
              <div className="card__info-label">Категория</div>
              <div className="card__info-value">
                {categoryData?.icon} {categoryData?.name}
              </div>
            </div>
            
            {maintenance.mileage > 0 && (
              <div className="card__info-item">
                <div className="card__info-label">Пробег</div>
                <div className="card__info-value">{formatNumber(maintenance.mileage)} км</div>
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