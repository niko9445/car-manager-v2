import React from 'react';
import { Car, SidebarProps } from '../../../types';
import CarCard from '../../ui/CarCard/CarCard';
import DataManager from '../../DataManager/DataManager';
import './Sidebar.css';

const Sidebar: React.FC<SidebarProps> = ({
  cars,
  selectedCar,
  setSelectedCar,
  isMobile = false,
  onClose,
  onAddCar,
  onDeleteCar,
}) => {
  const handleCarSelect = (car: Car) => {
    setSelectedCar(car);
  };

  const handleDeleteClick = () => {
    if (selectedCar) onDeleteCar(selectedCar);
  };

  return (
    <aside className="sidebar__container">
      <div className="sidebar__header">
        <h2 className="sidebar__title">Мои автомобили</h2>

        <div className="sidebar__header-actions">
          {selectedCar && (
            <button
              className="sidebar__delete-btn"
              onClick={handleDeleteClick}
              type="button"
              title={`Удалить ${selectedCar.brand} ${selectedCar.model}`}
            >
              🗑️
            </button>
          )}

          <button className="sidebar__add-button" onClick={onAddCar} type="button">
            <span className="sidebar__add-icon">+</span>
            Добавить авто
          </button>

          {isMobile && (
            <button
              className="sidebar__close-btn"
              onClick={onClose}
              aria-label="Закрыть меню"
              type="button"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="sidebar__cars-list">
        {cars.length === 0 ? (
          <div className="sidebar__empty">
            <div className="sidebar__empty-icon">🚗</div>
            <p className="sidebar__empty-text">Нет автомобилей</p>
            <p className="sidebar__empty-subtext">Добавьте первый автомобиль</p>
          </div>
        ) : (
          cars.map((car) => (
            <CarCard
              key={car.id}
              car={car}
              isSelected={selectedCar?.id === car.id}
              onSelect={() => handleCarSelect(car)}
              isMobile={isMobile}
            />
          ))
        )}
      </div>

      <div className="sidebar__data-manager">
        <DataManager />
      </div>
    </aside>
  );
};

export default Sidebar;
