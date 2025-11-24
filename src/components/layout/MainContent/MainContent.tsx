import React, { useState } from 'react';
import MaintenanceSection from '../../features/MaintenanceSection/MaintenanceSection';
import CarDataSection from '../../features/CarDataSection/CarDataSection';
import ExpenseTracker from '../../expenses/ExpenseTracker/ExpenseTracker';
import EditMaintenanceModal from '../../modals/EditMaintenanceModal/EditMaintenanceModal';
import AddArticleModal from '../../modals/AddArticleModal/AddArticleModal';
import EditArticleModal from '../../modals/EditArticleModal/EditArticleModal'; 
import { MainContentProps, Maintenance, Article } from '../../../types';
import { useTranslation } from '../../../contexts/LanguageContext';
import { useApp } from '../../../contexts/AppContext';
import { useCarOperations } from '../../../hooks/useCarOperations';
import { articleService } from '../../../services/database/articles';
import { carDataService } from '../../../services/database/carData'

const MainContent: React.FC<MainContentProps> = ({ 
  cars, 
  setCars, 
  activeSection, 
  setActiveSection,
  onAddMaintenance,
  onAddCarData,
  onDeleteMaintenance,
  onDeleteCarData,
  onEditCarData,
  onEditCar,
  isMobile = false,
  onOpenSidebar
}) => {
  const [editingMaintenance, setEditingMaintenance] = useState<Maintenance | null>(null);
  const [isEditMaintenanceModalOpen, setIsEditMaintenanceModalOpen] = useState(false);
  const { t } = useTranslation();
  const { state } = useApp();
  const selectedCar = state.selectedCar;
  const [isAddArticleModalOpen, setIsAddArticleModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isEditArticleModalOpen, setIsEditArticleModalOpen] = useState(false);

  console.log('🟡 [MainContent] RENDER', {
  selectedCarId: selectedCar?.id,
  activeSection,
  carsCount: cars.length,
  carDataCount: selectedCar?.carData?.length,
  carData: selectedCar?.carData
});

  // УДАЛЯЕМ: деструктуризацию несуществующих функций
  const { /* editArticle, deleteArticle */ } = useCarOperations(cars, setCars);

  const handleEditMaintenance = (maintenance: Maintenance): void => {
    setIsEditMaintenanceModalOpen(false);
    setEditingMaintenance(null);
    
    setTimeout(() => {
      setEditingMaintenance(maintenance);
      setIsEditMaintenanceModalOpen(true);
    }, 10);
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setIsEditArticleModalOpen(true);
  };

  const handleOpenAddArticleModal = () => {
    setIsAddArticleModalOpen(true);
  };

  const handleAddArticle = async () => {
    if (!selectedCar) {
      console.error('No car selected');
      return;
    }

    try {
      console.log('🔄 Обновление данных после добавления артикула...');
      
      // ОБНОВЛЯЕМ ДАННЫЕ ИЗ БАЗЫ
      await refreshCarData();
      
      // ЗАКРЫВАЕМ МОДАЛКУ
      setIsAddArticleModalOpen(false);
      
      console.log('✅ Данные обновлены, модалка закрыта');
      
    } catch (error) {
      console.error('❌ Ошибка обновления данных:', error);
    }
  };

  const refreshCarData = async () => {
    if (!selectedCar) {
      console.log('🟡 [MainContent] refreshCarData - нет выбранного авто');
      return;
    }
    
    try {
      console.log('🔄 [MainContent] refreshCarData - начало', selectedCar.id);
      
      const [carDataResult, articlesResult] = await Promise.all([
        carDataService.getCarDataByCar(selectedCar.id),
        articleService.getArticlesByCar(selectedCar.id)
      ]);

      console.log('🟡 [MainContent] refreshCarData - данные получены', {
        carData: carDataResult.length,
        articles: articlesResult.length
      });

      // Обновляем глобальное состояние
      const updatedCars = cars.map(c => {
        if (c.id === selectedCar.id) {
          const updatedCar = {
            ...c,
            carData: carDataResult,
            articles: articlesResult
          };
          console.log('🟡 [MainContent] refreshCarData - обновленный авто', updatedCar);
          return updatedCar;
        }
        return c;
      });
      
      setCars(updatedCars);
      
      console.log('🟢 [MainContent] refreshCarData - завершено');
      
    } catch (error) {
      console.error('🔴 [MainContent] refreshCarData - ошибка:', error);
    }
  };

  const handleSaveMaintenance = (maintenanceId: string, updatedData: Partial<Maintenance>): void => {
    if (!selectedCar) return;

    const updatedCars = cars.map(car => {
      if (car.id === selectedCar.id) {
        const updatedMaintenance = car.maintenance?.map(maintenanceItem => 
          maintenanceItem.id === maintenanceId ? { ...maintenanceItem, ...updatedData } : maintenanceItem
        );
        return { ...car, maintenance: updatedMaintenance };
      }
      return car;
    });
    setCars(updatedCars);
    setIsEditMaintenanceModalOpen(false);
    setEditingMaintenance(null);
  };

  const handleSaveArticle = async (articleId: string, updatedData: { category: string; subcategory: string; articleNumber: string }) => {
    if (!selectedCar) return;

    try {
      console.log('🔄 Обновление статьи через Supabase...');
      
      await articleService.updateArticle(articleId, updatedData);
      console.log('✅ Статья обновлена в Supabase:', articleId);
      
      // ОБНОВЛЯЕМ ДАННЫЕ
      await refreshCarData();
      
      setIsEditArticleModalOpen(false);
      setEditingArticle(null);
      
    } catch (error) {
      console.error('❌ Ошибка обновления статьи в Supabase:', error);
    }
  };

  const handleDeleteArticle = async (article: Article) => {
    if (!selectedCar) return;
    
    try {
      console.log('🔄 Удаление статьи через Supabase...');
      
      await articleService.deleteArticle(article.id);
      console.log('✅ Статья удалена из Supabase:', article.id);
      
      // ОБНОВЛЯЕМ ДАННЫЕ
      await refreshCarData();
      
    } catch (error) {
      console.error('❌ Ошибка удаления статьи из Supabase:', error);
    }
  };

  if (!selectedCar) {
    return (
      <div className="main-welcome">
        <div className="main-welcome__background">
          <div className="main-welcome__road"></div>
          <div className="main-welcome__car-silhouette"></div>
        </div>
        
        <div className="main-welcome__content">
          <div className="main-welcome__icon">
            <div className="main-welcome__steering-wheel">
              <div className="main-welcome__wheel"></div>
              <div className="main-welcome__spokes"></div>
            </div>
          </div>
          
          <div className="main-welcome__text">
            <h1 className="main-welcome__title">
              {t('app.name')}
            </h1>
            
            <p className="main-welcome__subtitle">
              {t('app.tagline')}
            </p>
          </div>

          <div className="main-welcome__action">
            {isMobile ? (
              <button 
                className="btn btn--primary main-welcome__button"
                onClick={onOpenSidebar}
                type="button"
              >
                <svg className="btn__icon" viewBox="0 0 24 24" fill="none" width="18" height="18">
                  <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                {t('cars.selectCar')}
              </button>
            ) : (
              <div className="main-welcome__hint">
                <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                  <path d="M14 5l7 7m0 0l-7 7m7-7H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>{t('cars.selectCar')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'maintenance':
        return (
          <MaintenanceSection 
            car={selectedCar}
            cars={cars}
            setCars={setCars}
            onAddMaintenance={onAddMaintenance}
            onDeleteMaintenance={onDeleteMaintenance}
            onEditMaintenance={handleEditMaintenance}
          />
        );
      
      case 'carData':
        return (
          <CarDataSection 
            car={selectedCar}
            cars={cars}
            setCars={setCars}
            onAddCarData={onAddCarData}
            onDeleteCarData={onDeleteCarData}
            onEditCarData={onEditCarData}
            onEditCar={onEditCar}
            onAddArticle={handleOpenAddArticleModal}
            onEditArticle={handleEditArticle} 
            onDeleteArticle={handleDeleteArticle}
          />
        );
      
      case 'expenses':
        return <ExpenseTracker />;
      
      default:
        return null;
    }
  };

  return (
    <div className="main-content">
      <div className="main-content__header">
        <div className="main-content__header-top">
          {isMobile && (
            <button 
              className="menu-toggle-compact"
              onClick={onOpenSidebar}
              type="button"
              aria-label={t('navigation.openMenu')}
            >
              <span className="menu-toggle-compact__line"></span>
              <span className="menu-toggle-compact__line"></span>
              <span className="menu-toggle-compact__line"></span>
            </button>
          )}
          <h1 className="main-content__title">
            {selectedCar.brand} {selectedCar.model}
            {selectedCar.year && (
              <span className="car-year-badge">{selectedCar.year}</span>
            )}
          </h1>
        </div>
        
        <div className="main-content__tabs">
          <button
            className={`btn btn--secondary btn--sm ${activeSection === 'maintenance' ? 'btn--primary' : ''}`}
            onClick={() => setActiveSection('maintenance')}
            type="button"
          >
            <svg className="btn__icon" viewBox="0 0 24 24" fill="none" width="14" height="14">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2"/>
            </svg>
            {t('navigation.maintenance')}
          </button>
          
          <button
            className={`btn btn--secondary btn--sm ${activeSection === 'carData' ? 'btn--primary' : ''}`}
            onClick={() => setActiveSection('carData')}
            type="button"
          >
            <svg className="btn__icon" viewBox="0 0 24 24" fill="none" width="14" height="14">
              <path d="M12 11a5 5 0 0 1 5 5v6H7v-6a5 5 0 0 1 5-5z" stroke="currentColor" strokeWidth="2"/>
              <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            {t('navigation.carData')}
          </button>

          <button
            className={`btn btn--secondary btn--sm ${activeSection === 'expenses' ? 'btn--primary' : ''}`}
            onClick={() => setActiveSection('expenses')}
            type="button"
          >
            <svg className="btn__icon" viewBox="0 0 24 24" fill="none" width="14" height="14">
              <path d="M12 1v22M5 6h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="2"/>
              <path d="M17 10h.01M7 10h.01" stroke="currentColor" strokeWidth="2"/>
            </svg>
            {t('navigation.expenses')}
          </button>
        </div>
      </div>

      <div className="main-content__content">
        {renderSection()}
      </div>

      {isAddArticleModalOpen && (
        <AddArticleModal 
          onClose={() => setIsAddArticleModalOpen(false)}
          onSave={handleAddArticle} // Просто закрываем
        />
      )}

      {isEditMaintenanceModalOpen && editingMaintenance && (
        <EditMaintenanceModal
          maintenance={editingMaintenance}
          onClose={() => {
            setIsEditMaintenanceModalOpen(false);
            setEditingMaintenance(null);
          }}
          onSave={handleSaveMaintenance}
        />
      )}

      {isEditArticleModalOpen && editingArticle && (
        <EditArticleModal
          article={editingArticle}
          onClose={() => {
            setIsEditArticleModalOpen(false);
            setEditingArticle(null);
          }}
          onSave={handleSaveArticle}
        />
      )}
    </div>
  );
};

export default MainContent;