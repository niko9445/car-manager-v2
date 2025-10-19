import React, { useState, useMemo } from 'react';
import Modal from '../../ui/Modal/Modal';
import { CarFormData } from '../../../types';
import { carBrands, engineTypes, transmissionTypes } from '../../../data/carBrands';
import './AddCarModal.css';

interface AddCarModalProps {
  onClose: () => void;
  onSave: (carData: CarFormData) => void;
}

const AddCarModal: React.FC<AddCarModalProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState<CarFormData>({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    engineType: 'petrol',
    transmission: 'manual',
    vin: ''
  });

  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);
  const [showModelSuggestions, setShowModelSuggestions] = useState(false);

  // Фильтрация марок по вводу
  const filteredBrands = useMemo(() => {
    return Object.keys(carBrands).filter(brand =>
      brand.toLowerCase().includes(formData.brand.toLowerCase())
    );
  }, [formData.brand]);

  // Фильтрация моделей по выбранной марке
  const filteredModels = useMemo(() => {
    if (!formData.brand || !carBrands[formData.brand as keyof typeof carBrands]) {
      return [];
    }
    return carBrands[formData.brand as keyof typeof carBrands].filter(model =>
      model.toLowerCase().includes(formData.model.toLowerCase())
    );
  }, [formData.brand, formData.model]);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (formData.brand && formData.model) {
      onSave(formData);
    }
  };

  const handleBrandSelect = (brand: string) => {
    setFormData({ ...formData, brand, model: '' });
    setShowBrandSuggestions(false);
  };

  const handleModelSelect = (model: string) => {
    setFormData({ ...formData, model });
    setShowModelSuggestions(false);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Добавить автомобиль" size="md">
      <form className="addcarmodal__form" onSubmit={handleSubmit}>
        {/* Поле марки с автодополнением */}
        <div className="form__group">
          <label className="form__label form__label--required">Марка</label>
          <input
            className="form__input"
            type="text"
            value={formData.brand}
            onChange={(e) => setFormData({...formData, brand: e.target.value})}
            onFocus={() => setShowBrandSuggestions(true)}
            onBlur={() => setTimeout(() => setShowBrandSuggestions(false), 200)}
            required
          />
          {showBrandSuggestions && filteredBrands.length > 0 && (
            <div className="addcarmodal__suggestions">
              {filteredBrands.map(brand => (
                <div
                  key={brand}
                  className="addcarmodal__suggestion-item"
                  onMouseDown={() => handleBrandSelect(brand)}
                >
                  {brand}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Поле модели с автодополнением */}
        <div className="form__group">
          <label className="form__label form__label--required">Модель</label>
          <input
            className="form__input"
            type="text"
            value={formData.model}
            onChange={(e) => setFormData({...formData, model: e.target.value})}
            onFocus={() => setShowModelSuggestions(true)}
            onBlur={() => setTimeout(() => setShowModelSuggestions(false), 200)}
            required
            disabled={!formData.brand}
          />
          {showModelSuggestions && filteredModels.length > 0 && (
            <div className="addcarmodal__suggestions">
              {filteredModels.map(model => (
                <div
                  key={model}
                  className="addcarmodal__suggestion-item"
                  onMouseDown={() => handleModelSelect(model)}
                >
                  {model}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Год выпуска */}
        <div className="form__group">
          <label className="form__label form__label--required">Год выпуска</label>
          <input
            className="form__input"
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
            required
            min="1950"
            max={new Date().getFullYear()}
          />
        </div>

        {/* Тип двигателя */}
        <div className="form__group">
          <label className="form__label">Двигатель</label>
          <select
            className="form__select"
            value={formData.engineType}
            onChange={(e) => setFormData({...formData, engineType: e.target.value as any})}
          >
            {engineTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Коробка передач */}
        <div className="form__group">
          <label className="form__label">Коробка передач</label>
          <select
            className="form__select"
            value={formData.transmission}
            onChange={(e) => setFormData({...formData, transmission: e.target.value as any})}
          >
            {transmissionTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* VIN-код */}
        <div className="form__group">
          <label className="form__label">VIN-код</label>
          <input
            className="form__input"
            type="text"
            value={formData.vin}
            onChange={(e) => setFormData({...formData, vin: e.target.value})}
            placeholder="Необязательно"
          />
        </div>

        <div className="form__actions">
          <button 
            type="button" 
            className="btn btn--secondary" 
            onClick={onClose}
          >
            Отмена
          </button>
          <button 
            type="submit" 
            className="btn btn--primary"
          >
            Добавить авто
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddCarModal;