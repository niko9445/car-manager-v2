import React, { useState } from 'react';
import Modal from '../../ui/Modal/Modal';
import { CarFormData } from '../../../types';
import { carBrands, engineTypes, transmissionTypes } from '../../../data/carBrands';
import { useTranslation } from '../../../contexts/LanguageContext'; // <-- ДОБАВИТЬ

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

  const { t } = useTranslation(); // <-- ДОБАВИТЬ

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (formData.brand && formData.model) {
      onSave(formData);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={t('cars.addCar')} size="md"> {/* <-- ПЕРЕВОД */}
      <form className="modal__form" onSubmit={handleSubmit}>
        <div className="modal__form-grid">
          
          {/* Поле марки с автодополнением */}
          <div className="modal__form-group">
            <label className="modal__label modal__label--required">{t('cars.brand')}</label> {/* <-- ПЕРЕВОД */}
            <select
              className="modal__input"
              value={formData.brand}
              onChange={(e) => setFormData({...formData, brand: e.target.value, model: ''})}
              required
            >
              <option value="">{t('cars.selectBrand')}</option> {/* <-- ПЕРЕВОД */}
              {Object.keys(carBrands).map(brand => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          {/* Поле модели с автодополнением */}
          <div className="modal__form-group">
            <label className="modal__label modal__label--required">{t('cars.model')}</label> {/* <-- ПЕРЕВОД */}
            <select
              className="modal__input"
              value={formData.model}
              onChange={(e) => setFormData({...formData, model: e.target.value})}
              required
              disabled={!formData.brand}
            >
              <option value="">{t('cars.selectModel')}</option> {/* <-- ПЕРЕВОД */}
              {formData.brand && carBrands[formData.brand as keyof typeof carBrands]?.map(model => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          {/* Год выпуска */}
          <div className="modal__form-group">
            <label className="modal__label modal__label--required">{t('cars.year')}</label> {/* <-- ПЕРЕВОД */}
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
            <label className="modal__label">{t('cars.engineType')}</label> {/* <-- ПЕРЕВОД */}
            <select
              className="modal__input"
              value={formData.engineType}
              onChange={(e) => setFormData({...formData, engineType: e.target.value as any})}
            >
              {engineTypes.map(type => (
                <option key={type} value={type}>
                  {t(`engineTypes.${type}`)} {/* <-- ПЕРЕВОД */}
                </option>
              ))}
            </select>
          </div>

          {/* Коробка передач */}
          <div className="modal__form-group">
            <label className="modal__label">{t('cars.transmission')}</label> {/* <-- ПЕРЕВОД */}
            <select
              className="modal__input"
              value={formData.transmission}
              onChange={(e) => setFormData({...formData, transmission: e.target.value as any})}
            >
              {transmissionTypes.map(type => (
                <option key={type} value={type}>
                  {t(`transmissionTypes.${type}`)} {/* <-- ПЕРЕВОД */}
                </option>
              ))}
            </select>
          </div>

          {/* VIN-код */}
          <div className="modal__form-group">
            <label className="modal__label">{t('cars.vin')}</label> {/* <-- ПЕРЕВОД */}
            <input
              className="modal__input"
              type="text"
              value={formData.vin}
              onChange={(e) => setFormData({...formData, vin: e.target.value})}
              placeholder={t('common.optional')} 
            />
          </div>
        </div>

        <div className="modal__actions-container">
          <div className="modal__actions modal__actions--centered">
            <button 
              type="button" 
              className="btn btn--cancel" 
              onClick={onClose}
            >
              {t('common.cancel')} {/* <-- ПЕРЕВОД */}
            </button>
            <button 
              type="submit" 
              className="btn btn--action"
              disabled={!formData.brand || !formData.model}
            >
              {t('common.add')} {/* <-- ПЕРЕВОД */}
            </button>
          </div>
          
          {/* ДОБАВИТЬ подпись в футер модального окна */}
          <div className="modal__footer-signature">
            {t('app.copyright')} {/* <-- ПЕРЕВОД */}
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AddCarModal;