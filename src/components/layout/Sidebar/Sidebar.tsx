import React, { useState } from 'react';
import { SidebarProps } from '../../../types';
import CarCard from '../../ui/CarCard/CarCard';
import SettingsModal from '../../modals/SettingsModal/SettingsModal';

const Sidebar: React.FC<SidebarProps> = ({
  cars,
  selectedCar,
  setSelectedCar,
  isMobile = false,
  onClose,
  onAddCar,
  onDeleteCar,
  className = ''
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleCarSelect = (car: any) => {
    setSelectedCar(car);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <>
      <div className={`sidebar ${className}`}>
        {/* Хедер сайдбара */}
        <div className="sidebar__header">
          <div className="sidebar__header-top">
            <h2 className="sidebar__title">Мои автомобили</h2>
          </div>
          
          {/* Кнопки действий */}
          <div className="sidebar__actions">
            <div className="sidebar__actions-row">
              <button 
                className="btn btn--primary btn--full"
                onClick={onAddCar}
                type="button"
              >
                <svg className="btn__icon" viewBox="0 0 24 24" fill="none" width="16" height="16">
                  <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Добавить
              </button>
              
              {/* Кнопка настроек справа от кнопки добавления */}
              <button 
                className="sidebar__settings-btn"
                onClick={handleSettingsClick}
                type="button"
                title="Настройки"
              >
                <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                  <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 019 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Список автомобилей */}
        <div className="sidebar__content">
          {cars.length === 0 ? (
            <div className="sidebar__empty">
              <p className="sidebar__empty-text">Нет добавленных автомобилей</p>
            </div>
          ) : (
            <div className="sidebar__cars">
              {cars.map((car, index) => (
                <CarCard
                  key={car.id}
                  car={car}
                  isSelected={selectedCar?.id === car.id}
                  onSelect={() => handleCarSelect(car)}
                  position={index}
                  isMobile={isMobile}
                  onDelete={onDeleteCar}
                />
              ))}
            </div>
          )}
        </div>

        {/* Футер с подписью */}
        <div className="sidebar__footer">
          <div className="sidebar-footer__credits">
            © 2025 <span className="sidebar-footer__app-name">RuNiko</span>
          </div>
        </div>
      </div>

      {/* Модальное окно настроек */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
};

export default Sidebar;