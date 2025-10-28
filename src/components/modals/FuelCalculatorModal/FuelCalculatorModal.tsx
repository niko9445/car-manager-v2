import React, { useState } from 'react';
import Modal from '../../ui/Modal/Modal';

interface FuelCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FuelCalculatorModal: React.FC<FuelCalculatorModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const [formData, setFormData] = useState({
    tankCapacity: '',
    currentRange: '',
    currentConsumption: ''
  });

  const calculateFuel = () => {
    if (formData.currentRange && formData.currentConsumption) {
      return (parseFloat(formData.currentRange) * parseFloat(formData.currentConsumption)) / 100;
    }
    return 0;
  };

  const currentFuel = calculateFuel();
  const freeSpace = formData.tankCapacity ? 
    parseFloat(formData.tankCapacity) - currentFuel : 0;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const clearForm = () => {
    setFormData({
      tankCapacity: '',
      currentRange: '',
      currentConsumption: ''
    });
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Калькулятор бака"
    >
      <div className="fuel-calculator-modal">
        <div className="modal__content">
          {/* Кастомный заголовок с иконкой */}
          <div className="fuel-calculator-header">
            <div className="fuel-calculator-title">
             <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                <rect x="4" y="4" width="16" height="16" rx="1" stroke="currentColor" strokeWidth="2"/>
                <line x1="8" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="2"/>
                <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2"/>
                <line x1="8" y1="16" x2="12" y2="16" stroke="currentColor" strokeWidth="2"/>
                <line x1="14" y1="16" x2="16" y2="16" stroke="currentColor" strokeWidth="2"/>
                </svg>
              Калькулятор бака
            </div>
          </div>

          <div className="modal__form">
            <div className="modal__form-grid">
              <div className="modal__form-group">
                <label className="modal__label">Ёмкость бака (л)</label>
                <input
                  type="number"
                  className="modal__input"
                  value={formData.tankCapacity}
                  onChange={(e) => handleInputChange('tankCapacity', e.target.value)}
                  placeholder="55"
                  step="1"
                />
              </div>

              <div className="modal__form-group">
                <label className="modal__label">Запас хода (км)</label>
                <input
                  type="number"
                  className="modal__input"
                  value={formData.currentRange}
                  onChange={(e) => handleInputChange('currentRange', e.target.value)}
                  placeholder="350"
                  step="1"
                />
              </div>

              <div className="modal__form-group">
                <label className="modal__label">Ср. расход (л/100км)</label>
                <input
                  type="number"
                  className="modal__input"
                  step="0.1"
                  value={formData.currentConsumption}
                  onChange={(e) => handleInputChange('currentConsumption', e.target.value)}
                  placeholder="8.0"
                />
              </div>
            </div>

            {currentFuel > 0 && (
              <div className="fuel-calculator-results">
                <div className="card">
                  <div className="card__header">
                    <h3 className="card__title">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="9 22 9 12 15 12 15 22" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Текущее состояние
                    </h3>
                  </div>
                  <div className="card__content">
                    <div className="fuel-calculator-result-item">
                      <span className="fuel-calculator-label">Сейчас в баке:</span>
                      <span className="fuel-calculator-value">~{currentFuel.toFixed(1)} л</span>
                    </div>
                    {formData.tankCapacity && (
                      <div className="fuel-calculator-result-item">
                        <span className="fuel-calculator-label">Свободно в баке:</span>
                        <span className="fuel-calculator-value">~{freeSpace.toFixed(1)} л</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="modal__actions modal__actions--center">
              <div className="fuel-calculator-actions">
                {/* Первая строка: кнопка Очистить на всю ширину */}
                <div className="fuel-calculator-actions__row fuel-calculator-actions__row--single">
                  <button 
                    type="button" 
                    className="btn btn--secondary"
                    onClick={clearForm}
                  >
                    Очистить
                  </button>
                </div>
                
                {/* Вторая строка: кнопки Закрыть и Готово рядом */}
                <div className="fuel-calculator-actions__row fuel-calculator-actions__row--double">
                  <button 
                    type="button" 
                    className="btn btn--secondary"
                    onClick={onClose}
                  >
                    Закрыть
                  </button>
                  <button 
                    type="button" 
                    className="btn btn--primary"
                    onClick={onClose}
                  >
                    Готово
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default FuelCalculatorModal;