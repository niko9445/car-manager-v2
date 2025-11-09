import React, { useState } from 'react';
import Modal from '../../ui/Modal/Modal';
import { CarFormData } from '../../../types';
import { carBrands, engineTypes, transmissionTypes } from '../../../data/carBrands';

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



  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (formData.brand && formData.model) {
      onSave(formData);
    }
  };


  return (
    <Modal isOpen={true} onClose={onClose} title="Добавить автомобиль" size="md">
      <form className="modal__form" onSubmit={handleSubmit}>
        <div className="modal__form-grid">
          
          {/* Поле марки с автодополнением */}
          <div className="modal__form-group">
            <label className="modal__label modal__label--required">Марка</label>
            <select
              className="modal__input"
              value={formData.brand}
              onChange={(e) => setFormData({...formData, brand: e.target.value, model: ''})}
              required
            >
              <option value="">Выберите марку</option>
              {Object.keys(carBrands).map(brand => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          {/* Поле модели с автодополнением */}
          <div className="modal__form-group">
            <label className="modal__label modal__label--required">Модель</label>
            <select
              className="modal__input"
              value={formData.model}
              onChange={(e) => setFormData({...formData, model: e.target.value})}
              required
              disabled={!formData.brand}
            >
              <option value="">Выберите модель</option>
              {formData.brand && carBrands[formData.brand as keyof typeof carBrands]?.map(model => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          {/* Год выпуска */}
          <div className="modal__form-group">
            <label className="modal__label modal__label--required">Год выпуска</label>
            <input
              className="modal__input"
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
              required
              min="1950"
              max={new Date().getFullYear()}
            />
          </div>

          {/* Тип двигателя */}
          <div className="modal__form-group">
            <label className="modal__label">Двигатель</label>
            <select
              className="modal__input"
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
          <div className="modal__form-group">
            <label className="modal__label">Коробка передач</label>
            <select
              className="modal__input"
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
          <div className="modal__form-group">
            <label className="modal__label">VIN-код</label>
            <input
              className="modal__input"
              type="text"
              value={formData.vin}
              onChange={(e) => setFormData({...formData, vin: e.target.value})}
              placeholder="Необязательно"
            />
          </div>
        </div>

        <div className="modal__actions-container">
          <div className="modal__actions modal__actions--centered">
            <button 
              type="button" 
              className="btn btn--secondary" 
              onClick={onClose}
            >
              Отмена
            </button>
            <button 
              type="submit" 
              className="btn btn--action"
              disabled={!formData.brand || !formData.model}
            >
              Добавить
            </button>
          </div>
          
          {/* ДОБАВИТЬ подпись в футер модального окна */}
          <div className="modal__footer-signature">
            © 2025 <span className="modal__footer-app-name">RuNiko</span>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AddCarModal;