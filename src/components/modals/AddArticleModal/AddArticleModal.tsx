import React, { useState, useMemo } from 'react';
import Modal from '../../ui/Modal/Modal';
import { useTranslation } from '../../../contexts/LanguageContext';
import { articleService } from '../../../services/database/articles'; // <-- ИМПОРТ СЕРВИСА
import { useAuth } from '../../../contexts/AuthContext';
import { useApp } from '../../../contexts/AppContext';


interface AddArticleModalProps {
  onClose: () => void;
  onSave: () => void;
}

interface Subcategory {
  key: string;
  name: string;
}

interface Category {
  key: string;
  name: string;
  subcategories: Subcategory[];
}

const AddArticleModal: React.FC<AddArticleModalProps> = ({ onClose, onSave }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [articleNumber, setArticleNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const { user } = useAuth();
  const { state } = useApp();
  const { selectedCar } = state;

  // Полная структура категорий и подкатегорий запчастей с переводами
  const articleCategories = useMemo((): Category[] => [
    {
      key: 'engine',
      name: t('articles.categories.engine'),
      subcategories: [
        { key: 'pistons', name: t('articles.subcategories.pistons') },
        { key: 'cylinders', name: t('articles.subcategories.cylinders') },
        { key: 'crankshaft', name: t('articles.subcategories.crankshaft') },
        { key: 'camshaft', name: t('articles.subcategories.camshaft') },
        { key: 'valves', name: t('articles.subcategories.valves') },
        { key: 'timing_belt', name: t('articles.subcategories.timing_belt') },
        { key: 'timing_chain', name: t('articles.subcategories.timing_chain') },
        { key: 'gaskets', name: t('articles.subcategories.gaskets') },
        { key: 'oil_pump', name: t('articles.subcategories.oil_pump') },
        { key: 'water_pump', name: t('articles.subcategories.water_pump') },
        { key: 'turbo', name: t('articles.subcategories.turbo') },
        { key: 'injectors', name: t('articles.subcategories.injectors') },
        { key: 'fuel_pump', name: t('articles.subcategories.fuel_pump') },
        { key: 'spark_plugs', name: t('articles.subcategories.spark_plugs') },
        { key: 'ignition_coils', name: t('articles.subcategories.ignition_coils') }
      ]
    },
    {
      key: 'transmission',
      name: t('articles.categories.transmission'),
      subcategories: [
        { key: 'clutch_kit', name: t('articles.subcategories.clutch_kit') },
        { key: 'clutch_disc', name: t('articles.subcategories.clutch_disc') },
        { key: 'clutch_bearing', name: t('articles.subcategories.clutch_bearing') },
        { key: 'gearbox', name: t('articles.subcategories.gearbox') },
        { key: 'gears', name: t('articles.subcategories.gears') },
        { key: 'synchronizers', name: t('articles.subcategories.synchronizers') },
        { key: 'cv_joints', name: t('articles.subcategories.cv_joints') },
        { key: 'cv_boots', name: t('articles.subcategories.cv_boots') },
        { key: 'drive_shafts', name: t('articles.subcategories.drive_shafts') },
        { key: 'differential', name: t('articles.subcategories.differential') }
      ]
    },
    {
      key: 'suspension',
      name: t('articles.categories.suspension'),
      subcategories: [
        { key: 'shock_absorbers', name: t('articles.subcategories.shock_absorbers') },
        { key: 'springs', name: t('articles.subcategories.springs') },
        { key: 'ball_joints', name: t('articles.subcategories.ball_joints') },
        { key: 'bushings', name: t('articles.subcategories.bushings') },
        { key: 'stabilizer_links', name: t('articles.subcategories.stabilizer_links') },
        { key: 'tie_rods', name: t('articles.subcategories.tie_rods') },
        { key: 'wheel_bearings', name: t('articles.subcategories.wheel_bearings') },
        { key: 'control_arms', name: t('articles.subcategories.control_arms') }
      ]
    },
    {
      key: 'brakes',
      name: t('articles.categories.brakes'),
      subcategories: [
        { key: 'brake_pads', name: t('articles.subcategories.brake_pads') },
        { key: 'brake_discs', name: t('articles.subcategories.brake_discs') },
        { key: 'brake_drums', name: t('articles.subcategories.brake_drums') },
        { key: 'brake_calipers', name: t('articles.subcategories.brake_calipers') },
        { key: 'brake_hoses', name: t('articles.subcategories.brake_hoses') },
        { key: 'brake_fluid', name: t('articles.subcategories.brake_fluid') },
        { key: 'master_cylinder', name: t('articles.subcategories.master_cylinder') },
        { key: 'abs_sensors', name: t('articles.subcategories.abs_sensors') }
      ]
    },
    {
      key: 'electrical',
      name: t('articles.categories.electrical'),
      subcategories: [
        { key: 'battery', name: t('articles.subcategories.battery') },
        { key: 'alternator', name: t('articles.subcategories.alternator') },
        { key: 'starter', name: t('articles.subcategories.starter') },
        { key: 'ignition_coils', name: t('articles.subcategories.ignition_coils') },
        { key: 'spark_plugs', name: t('articles.subcategories.spark_plugs') },
        { key: 'sensors', name: t('articles.subcategories.sensors') },
        { key: 'fuses', name: t('articles.subcategories.fuses') },
        { key: 'relays', name: t('articles.subcategories.relays') },
        { key: 'wiring', name: t('articles.subcategories.wiring') }
      ]
    },
    {
      key: 'body',
      name: t('articles.categories.body'),
      subcategories: [
        { key: 'doors', name: t('articles.subcategories.doors') },
        { key: 'bumpers', name: t('articles.subcategories.bumpers') },
        { key: 'fenders', name: t('articles.subcategories.fenders') },
        { key: 'hood', name: t('articles.subcategories.hood') },
        { key: 'trunk_lid', name: t('articles.subcategories.trunk_lid') },
        { key: 'mirrors', name: t('articles.subcategories.mirrors') },
        { key: 'glass', name: t('articles.subcategories.glass') },
        { key: 'body_panels', name: t('articles.subcategories.body_panels') }
      ]
    },
    {
      key: 'interior',
      name: t('articles.categories.interior'),
      subcategories: [
        { key: 'seats', name: t('articles.subcategories.seats') },
        { key: 'dashboard', name: t('articles.subcategories.dashboard') },
        { key: 'steering_wheel', name: t('articles.subcategories.steering_wheel') },
        { key: 'carpets', name: t('articles.subcategories.carpets') },
        { key: 'headliner', name: t('articles.subcategories.headliner') },
        { key: 'door_cards', name: t('articles.subcategories.door_cards') },
        { key: 'airbags', name: t('articles.subcategories.airbags') },
        { key: 'climate_control', name: t('articles.subcategories.climate_control') }
      ]
    },
    {
      key: 'exterior',
      name: t('articles.categories.exterior'),
      subcategories: [
        { key: 'lights_head', name: t('articles.subcategories.lights_head') },
        { key: 'lights_tail', name: t('articles.subcategories.lights_tail') },
        { key: 'lights_fog', name: t('articles.subcategories.lights_fog') },
        { key: 'grille', name: t('articles.subcategories.grille') },
        { key: 'moldings', name: t('articles.subcategories.moldings') },
        { key: 'spoiler', name: t('articles.subcategories.spoiler') },
        { key: 'roof_rack', name: t('articles.subcategories.roof_rack') }
      ]
    },
    {
      key: 'tires',
      name: t('articles.categories.tires'),
      subcategories: [
        { key: 'summer_tires', name: t('articles.subcategories.summer_tires') },
        { key: 'winter_tires', name: t('articles.subcategories.winter_tires') },
        { key: 'all_season_tires', name: t('articles.subcategories.all_season_tires') },
        { key: 'runflat_tires', name: t('articles.subcategories.runflat_tires') }
      ]
    },
    {
      key: 'wheels',
      name: t('articles.categories.wheels'),
      subcategories: [
        { key: 'steel_wheels', name: t('articles.subcategories.steel_wheels') },
        { key: 'alloy_wheels', name: t('articles.subcategories.alloy_wheels') },
        { key: 'wheel_covers', name: t('articles.subcategories.wheel_covers') },
        { key: 'wheel_bolts', name: t('articles.subcategories.wheel_bolts') }
      ]
    },
    {
      key: 'oil',
      name: t('articles.categories.oil'),
      subcategories: [
        { key: 'engine_oil', name: t('articles.subcategories.engine_oil') },
        { key: 'transmission_oil', name: t('articles.subcategories.transmission_oil') },
        { key: 'brake_fluid', name: t('articles.subcategories.brake_fluid') },
        { key: 'coolant', name: t('articles.subcategories.coolant') },
        { key: 'power_steering_fluid', name: t('articles.subcategories.power_steering_fluid') },
        { key: 'washer_fluid', name: t('articles.subcategories.washer_fluid') }
      ]
    },
    {
      key: 'filters',
      name: t('articles.categories.filters'),
      subcategories: [
        { key: 'air_filter', name: t('articles.subcategories.air_filter') },
        { key: 'oil_filter', name: t('articles.subcategories.oil_filter') },
        { key: 'fuel_filter', name: t('articles.subcategories.fuel_filter') },
        { key: 'cabin_filter', name: t('articles.subcategories.cabin_filter') }
      ]
    },
    {
      key: 'lighting',
      name: t('articles.categories.lighting'),
      subcategories: [
        { key: 'headlight_bulbs', name: t('articles.subcategories.headlight_bulbs') },
        { key: 'taillight_bulbs', name: t('articles.subcategories.taillight_bulbs') },
        { key: 'fog_light_bulbs', name: t('articles.subcategories.fog_light_bulbs') },
        { key: 'interior_light_bulbs', name: t('articles.subcategories.interior_light_bulbs') },
        { key: 'xenon_ballasts', name: t('articles.subcategories.xenon_ballasts') },
        { key: 'led_modules', name: t('articles.subcategories.led_modules') }
      ]
    },
    {
      key: 'cooling',
      name: t('articles.categories.cooling'),
      subcategories: [
        { key: 'radiator', name: t('articles.subcategories.radiator') },
        { key: 'cooling_fan', name: t('articles.subcategories.cooling_fan') },
        { key: 'thermostat', name: t('articles.subcategories.thermostat') },
        { key: 'water_pump', name: t('articles.subcategories.water_pump') },
        { key: 'hoses', name: t('articles.subcategories.hoses') },
        { key: 'coolant_tank', name: t('articles.subcategories.coolant_tank') }
      ]
    },
    {
      key: 'other',
      name: t('articles.categories.other'),
      subcategories: [
        { key: 'tools', name: t('articles.subcategories.tools') },
        { key: 'accessories', name: t('articles.subcategories.accessories') },
        { key: 'cleaning', name: t('articles.subcategories.cleaning') },
        { key: 'care_products', name: t('articles.subcategories.care_products') }
      ]
    }
  ], [t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !selectedCar) {
      console.error('❌ Пользователь не авторизован или автомобиль не выбран');
      return;
    }

    if (!isFormValid()) return;

    setLoading(true);

    try {
      console.log('🔄 Создание запчасти для автомобиля:', selectedCar.id);
      
      // Сохраняем в Supabase через сервис
      const result = await articleService.createArticle(selectedCar.id, {
        category: selectedCategory,
        subcategory: selectedSubcategory,
        articleNumber: articleNumber.trim()
      });

      console.log('✅ Запчасть создана:', result.id);
      
      // Уведомляем родительский компонент
      onSave();
      
    } catch (error) {
      console.error('❌ Ошибка создания запчасти:', error);
      // TODO: Добавить уведомление об ошибке для пользователя
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryKey: string) => {
    setSelectedCategory(categoryKey);
    setSelectedSubcategory('');
  };

  const isFormValid = () => {
    return selectedCategory && selectedSubcategory && articleNumber.trim();
  };

  const selectedCategoryData = articleCategories.find(cat => cat.key === selectedCategory);

  return (
    <Modal isOpen={true} onClose={onClose} title={t('articles.addArticle')} size="md">
      <form className="modal__form" onSubmit={handleSubmit}>
        
        {/* Шаг 1: Выбор категории */}
        <div className="modal__form-section">
          <div className="modal__form-group">
            <label className="modal__label">{t('articles.selectCategory')}</label>
            <select
              className="modal__input"
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              required
              disabled={loading}
            >
              <option value="">{t('articles.chooseCategory')}</option>
              {articleCategories.map(category => (
                <option key={category.key} value={category.key}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Шаг 2: Выбор подкатегории */}
        {selectedCategoryData && (
          <div className="modal__form-section">
            <div className="modal__form-group">
              <label className="modal__label">{t('articles.selectSubcategory')}</label>
              <select
                className="modal__input"
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                required
                disabled={loading}
              >
                <option value="">{t('articles.chooseSubcategory')}</option>
                {selectedCategoryData.subcategories.map(subcategory => (
                  <option key={subcategory.key} value={subcategory.key}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Шаг 3: Ввод артикула */}
        {selectedSubcategory && (
          <div className="modal__form-section">
            <div className="modal__form-group">
              <label className="modal__label">{t('articles.articleNumber')}</label>
              <input
                type="text"
                className="modal__input"
                placeholder={t('articles.enterArticleNumber')}
                value={articleNumber}
                onChange={(e) => setArticleNumber(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>
        )}

        {/* Кнопки действий */}
        <div className="modal__actions-container">
          <div className="modal__actions modal__actions--centered">
            <button 
              type="button" 
              className="btn btn--cancel" 
              onClick={onClose}
              disabled={loading}
            >
              {t('common.cancel')}
            </button>
            <button 
              type="submit" 
              className={`btn btn--action ${loading ? 'btn--action-loading' : ''}`}
              disabled={!isFormValid() || loading}
            >
              {loading ? t('common.saving') : t('common.add')}
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

export default AddArticleModal;