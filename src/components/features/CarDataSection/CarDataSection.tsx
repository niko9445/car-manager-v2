import React, { useState, useEffect } from 'react';
import { CarDataSectionProps, Article, CarDataEntry } from '../../../types';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { useTranslation } from '../../../contexts/LanguageContext';
import ConfirmModal from '../../ui/ConfirmModal/ConfirmModal';
import { carDataService } from '../../../services/database/carData';
import { articleService } from '../../../services/database/articles';
import { useApp } from '../../../contexts/AppContext';

type DataSubsection = 'info' | 'articles';

const CarDataSection: React.FC<CarDataSectionProps> = ({ 
  car, 
  cars, 
  onAddCarData, 
  onAddArticle,
  onDeleteCarData,
  onEditCarData,
  onEditCar,
  onEditArticle,
  onDeleteArticle
}) => {
  const { state, dispatch } = useApp();
  const { cars: globalCars } = state;
  const [activeSubsection, setActiveSubsection] = useState<DataSubsection>('info');
  const currentCar = globalCars.find(c => c.id === car.id) || car;
  const { getCurrencySymbol } = useCurrency();
  const { t } = useTranslation();
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [loading, setLoading] = useState(false);
  const [articlesLoading, setArticlesLoading] = useState(false);

  // Используем данные из глобального состояния
  const carData = currentCar.carData || [];
  const articles = currentCar.articles || [];

  // Загрузка данных только при первом монтировании или смене автомобиля
  useEffect(() => {
    const loadData = async () => {
      if (!car?.id) return;
      
      // Проверяем, есть ли уже данные в глобальном состоянии
      const hasData = carData.length > 0 || articles.length > 0;
      if (hasData) {
        console.log('🔍 CarDataSection: Данные уже есть в глобальном состоянии, пропускаем загрузку');
        return;
      }
      
      try {
        setLoading(true);
        setArticlesLoading(true);
        
        console.log('🔄 CarDataSection: Загрузка данных для автомобиля:', car.id);
        
        const [carDataResult, articlesResult] = await Promise.all([
          carDataService.getCarDataByCar(car.id),
          articleService.getArticlesByCar(car.id)
        ]);

        // Обновляем глобальное состояние с новыми данными
        const updatedCars = globalCars.map(c => {
          if (c.id === car.id) {
            return {
              ...c,
              carData: carDataResult,
              articles: articlesResult
            };
          }
          return c;
        });
        
        dispatch({ type: 'SET_CARS', payload: updatedCars });
        
        console.log('✅ CarDataSection: Данные загружены', {
          carData: carDataResult.length,
          articles: articlesResult.length
        });
        
      } catch (error) {
        console.error('❌ CarDataSection: Ошибка загрузки данных:', error);
      } finally {
        setLoading(false);
        setArticlesLoading(false);
      }
    };

    loadData();
  }, [car.id]); // Только при смене car.id

  // Обработчики для статей с Supabase
  const handleAddArticleWithSupabase = async (articleData: { category: string; subcategory: string; articleNumber: string }) => {
    console.log('🔍 CarDataSection: handleAddArticleWithSupabase вызван');

    try {
      // ОПТИМИСТИЧНОЕ ОБНОВЛЕНИЕ
      const tempArticle: Article = {
        id: `temp-${Date.now()}`,
        ...articleData,
        createdAt: new Date().toISOString(),
        carId: car.id
      };
      
      const updatedCarsOptimistic = globalCars.map(c => {
        if (c.id === car.id) {
          return {
            ...c,
            articles: [...(c.articles || []), tempArticle]
          };
        }
        return c;
      });
      
      dispatch({ type: 'SET_CARS', payload: updatedCarsOptimistic });
      
      console.log('🔄 CarDataSection: Создание статьи в Supabase...');
      const result = await articleService.createArticle(car.id, articleData);
      
      console.log('✅ CarDataSection: Статья создана в Supabase:', result.id);
      
      // ЗАМЕНЯЕМ временную запись на реальную
      const updatedCarsFinal = globalCars.map(c => {
        if (c.id === car.id) {
          return {
            ...c,
            articles: (c.articles || []).map(item => 
              item.id === tempArticle.id ? result : item
            )
          };
        }
        return c;
      });
      
      dispatch({ type: 'SET_CARS', payload: updatedCarsFinal });
      
      console.log('✅ CarDataSection: Оптимистичное обновление завершено');
      
      // Уведомляем родительский компонент
      onAddArticle && onAddArticle();
      
    } catch (error) {
      console.error('❌ CarDataSection: Ошибка создания статьи:', error);
      
      // ОТКАТ оптимистичного обновления при ошибке
      const rolledBackCars = globalCars.map(c => {
        if (c.id === car.id) {
          return {
            ...c,
            articles: (c.articles || []).filter(item => !item.id.startsWith('temp-'))
          };
        }
        return c;
      });
      
      dispatch({ type: 'SET_CARS', payload: rolledBackCars });
    }
  };

  const handleEditArticleWithSupabase = async (articleId: string, updatedData: { category: string; subcategory: string; articleNumber: string }) => {
    try {
      console.log('🔄 Обновление статьи:', articleId);
      const result = await articleService.updateArticle(articleId, updatedData);
      
      // ПРИНУДИТЕЛЬНО ОБНОВЛЯЕМ ДАННЫЕ
      await refreshCarData();
      
      console.log('✅ CarDataSection: Данные обновлены после редактирования');
      
      // Уведомляем родительский компонент - передаем полный объект Article
      onEditArticle && onEditArticle(result);
    } catch (error) {
      console.error('❌ Ошибка обновления статьи:', error);
    }
  };

  const handleDeleteArticleWithSupabase = async (article: Article) => {
    try {
      console.log('🗑️ Удаление статьи:', article.id);
      await articleService.deleteArticle(article.id);
      
      // ПРИНУДИТЕЛЬНО ОБНОВЛЯЕМ ДАННЫЕ
      await refreshCarData();
      
      console.log('✅ CarDataSection: Данные обновлены после удаления');
      
      // Уведомляем родительский компонент
      onDeleteArticle && onDeleteArticle(article);
    } catch (error) {
      console.error('❌ Ошибка удаления статьи:', error);
    }
  };

  const handleAddClick = () => {
    if (activeSubsection === 'info') {
      onAddCarData && onAddCarData();
    } else if (activeSubsection === 'articles') {
      onAddArticle && onAddArticle();
    }
  };

  const handleDeleteClick = (article: Article) => {
    setArticleToDelete(article);
  };

  const handleConfirmDelete = () => {
    if (articleToDelete) {
      handleDeleteArticleWithSupabase(articleToDelete);
    }
    setArticleToDelete(null);
  };

  const handleCancelDelete = () => {
    setArticleToDelete(null);
  };

  // Список ключей переводов для carDataFields
  const translationKeys = {
    insurance: true,
    inspection: true,
    dimensions: true,
    engineCode: true,
    fuelType: true,
    consumption: true,
    power: true,
    engineVolume: true,
    cost: true,
    purchaseDate: true,
    color: true,
    bodyType: true,
    drive: true,
    acceleration: true,
    maxSpeed: true,
    torque: true,
    weight: true,
    trunkVolume: true,
    country: true,
    warranty: true,
    tax: true
  };

  // Функция для проверки специальных категорий
  const isSpecialCategory = (fieldName: string): boolean => {
    const specialCategories = ['dimensions', 'consumption', 'Размеры', 'Расход'];
    return specialCategories.includes(fieldName) || 
           fieldName === t('carDataFields.dimensions') || 
           fieldName === t('carDataFields.consumption');
  };

  // Функция для парсинга текстового формата
  const parseTextFormat = (text: string): any => {
    const result: any = {};
    
    // Парсим размеры
    const lengthMatch = text.match(/Длина\s*\(?мм\)?:?\s*:?\s*(\d+)/i);
    const widthMatch = text.match(/Ширина\s*\(?мм\)?:?\s*:?\s*(\d+)/i);
    const heightMatch = text.match(/Высота\s*\(?мм\)?:?\s*:?\s*(\d+)/i);
    const clearanceMatch = text.match(/Клиренс\s*\(?мм\)?:?\s*:?\s*(\d+)/i);
    const wheelSizeMatch = text.match(/Размер колес:?\s*([^:]+?)(?=\s*Сверловка|\s*Размеры дисков|$)/i);
    const boltPatternMatch = text.match(/Сверловка\s*\(?PCD\)?:?\s*:?\s*([^:]+?)(?=\s*Размеры дисков|$)/i);
    const wheelDimensionsMatch = text.match(/Размеры дисков:?\s*([^:]+)/i);
    
    if (lengthMatch) result.length = lengthMatch[1];
    if (widthMatch) result.width = widthMatch[1];
    if (heightMatch) result.height = heightMatch[1];
    if (clearanceMatch) result.clearance = clearanceMatch[1];
    if (wheelSizeMatch) result.wheelSize = wheelSizeMatch[1].trim();
    if (boltPatternMatch) result.boltPattern = boltPatternMatch[1].trim();
    if (wheelDimensionsMatch) result.wheelDimensions = wheelDimensionsMatch[1].trim();
    
    // Парсим расход
    const mixedMatch = text.match(/Смешанный\s*\(л\/100км\):?\s*([\d.,]+)/i);
    const cityMatch = text.match(/По городу\s*\(л\/100км\):?\s*([\d.,]+)/i);
    const highwayMatch = text.match(/По трассе\s*\(л\/100км\):?\s*([\d.,]+)/i);
    
    if (mixedMatch) result.mixed = mixedMatch[1];
    if (cityMatch) result.city = cityMatch[1];
    if (highwayMatch) result.highway = highwayMatch[1];
    
    return result;
  };

  // Функция для рендеринга специальных категорий из текста
  const renderTextSpecialCategory = (field: any): React.ReactNode => {
    const data = parseTextFormat(field.value);
    
    if (field.name === 'dimensions' || field.name === t('carDataFields.dimensions')) {
      const items = [];
      
      if (data.length) items.push({ label: 'Длина', value: data.length });
      if (data.width) items.push({ label: 'Ширина', value: data.width });
      if (data.height) items.push({ label: 'Высота', value: data.height });
      if (data.clearance) items.push({ label: 'Клиренс', value: data.clearance });
      if (data.wheelSize) items.push({ label: 'Размер колес', value: data.wheelSize });
      if (data.boltPattern) items.push({ label: 'Сверловка', value: data.boltPattern });
      if (data.wheelDimensions) items.push({ label: 'Размеры дисков', value: data.wheelDimensions });
      
      if (items.length > 0) {
        return (
          <div className="special-category-container">
            {items.map((item, index) => (
              <div key={index} className="special-category-item">
                <span className="special-category-label">{item.label}</span>
                <span className="special-category-value">{item.value}</span>
              </div>
            ))}
          </div>
        );
      }
    }
    
    if (field.name === 'consumption' || field.name === t('carDataFields.consumption')) {
      const items = [];
      
      if (data.mixed) items.push({ label: 'Смешанный', value: data.mixed });
      if (data.city) items.push({ label: 'По городу', value: data.city });
      if (data.highway) items.push({ label: 'По трассе', value: data.highway });
      
      if (items.length > 0) {
        return (
          <div className="special-category-container">
            {items.map((item, index) => (
              <div key={index} className="special-category-item">
                <span className="special-category-label">{item.label}</span>
                <span className="special-category-value">{item.value}</span>
              </div>
            ))}
          </div>
        );
      }
    }
    
    return (
      <span className="main-data-value">
        {field.value}
      </span>
    );
  };


  const refreshCarData = async () => {
    if (!car?.id) return;
    
    try {
      console.log('🔄 CarDataSection: Принудительное обновление данных');
      
      const [carDataResult, articlesResult] = await Promise.all([
        carDataService.getCarDataByCar(car.id),
        articleService.getArticlesByCar(car.id)
      ]);

      // Обновляем глобальное состояние
      const updatedCars = globalCars.map(c => {
        if (c.id === car.id) {
          return {
            ...c,
            carData: carDataResult,
            articles: articlesResult
          };
        }
        return c;
      });
      
      dispatch({ type: 'SET_CARS', payload: updatedCars });
      
      console.log('✅ CarDataSection: Данные обновлены', {
        carData: carDataResult.length,
        articles: articlesResult.length
      });
      
    } catch (error) {
      console.error('❌ CarDataSection: Ошибка обновления данных:', error);
    }
  };

  // Функция для рендеринга специальных категорий
  const renderSpecialCategory = (field: any): React.ReactNode => {
    if (!field.value) {
      return (
        <span className="main-data-value">
          {formatAdditionalValue(field)}
        </span>
      );
    }

    try {
      let data;
      if (typeof field.value === 'string') {
        try {
          data = JSON.parse(field.value);
        } catch (jsonError) {
          return renderTextSpecialCategory(field);
        }
      } else {
        data = field.value;
      }
      
      if (field.name === 'dimensions' || field.name === t('carDataFields.dimensions')) {
        const items = [];
        
        if (data.length) items.push({ label: t('dimensions.length'), value: `${data.length} мм` });
        if (data.width) items.push({ label: t('dimensions.width'), value: `${data.width} мм` });
        if (data.height) items.push({ label: t('dimensions.height'), value: `${data.height} мм` });
        if (data.clearance) items.push({ label: t('dimensions.clearance'), value: `${data.clearance} мм` });
        if (data.wheelSize) items.push({ label: t('dimensions.wheelSize'), value: data.wheelSize });
        
        if (items.length > 0) {
          return (
            <div className="special-category-container">
              {items.map((item, index) => (
                <div key={index} className="special-category-item">
                  <span className="special-category-label">{item.label}</span>
                  <span className="special-category-value">{item.value}</span>
                </div>
              ))}
            </div>
          );
        }
      }
      
      if (field.name === 'consumption' || field.name === t('carDataFields.consumption')) {
        const items = [];
        
        if (data.mixed) items.push({ label: t('consumption.mixed'), value: `${data.mixed} л/100км` });
        if (data.city) items.push({ label: t('consumption.city'), value: `${data.city} л/100км` });
        if (data.highway) items.push({ label: t('consumption.highway'), value: `${data.highway} л/100км` });
        
        if (items.length > 0) {
          return (
            <div className="special-category-container">
              {items.map((item, index) => (
                <div key={index} className="special-category-item">
                  <span className="special-category-label">{item.label}</span>
                  <span className="special-category-value">{item.value}</span>
                </div>
              ))}
            </div>
          );
        }
      }
      
      return (
        <span className="main-data-value">
          {formatAdditionalValue(field)}
        </span>
      );
    } catch (error) {
      return (
        <span className="main-data-value">
          {formatAdditionalValue(field)}
        </span>
      );
    }
  };

  // Функция форматирования дополнительных данных
  const formatAdditionalValue = (field: any): string => {
    if (!field || !field.value) return '';
    
    let value = field.value;
    let unit = field.unit || '';
    
    if (field.name === 'cost' || field.name === 'insurance' || field.name === 'tax') {
      if (!unit || unit.includes('руб') || unit.includes('₽')) {
        unit = getCurrencySymbol();
      }
    }
    
    if (field.name === 'insurance' || field.name === 'inspection' || field.name === 'purchaseDate') {
      return value;
    }
    
    return `${value}${unit ? ` ${unit}` : ''}`;
  };

  // Функция для перевода типа двигателя
  const getTranslatedEngineType = (engineType: string): string => {
    switch (engineType) {
      case 'petrol':
        return t('engineTypes.petrol');
      case 'diesel':
        return t('engineTypes.diesel');
      case 'electric':
        return t('engineTypes.electric');
      case 'hybrid':
        return t('engineTypes.hybrid');
      default:
        return t('engineTypes.other');
    }
  };

  // Функция для перевода типа коробки передач
  const getTranslatedTransmission = (transmission: string): string => {
    switch (transmission) {
      case 'manual':
        return t('transmissionTypes.manual');
      case 'automatic':
        return t('transmissionTypes.automatic');
      case 'cvt':
        return t('transmissionTypes.cvt');
      case 'dual-clutch':
        return t('transmissionTypes.dual-clutch');
      case 'semi-automatic':
        return t('transmissionTypes.semi-automatic');
      case 'sequential':
        return t('transmissionTypes.sequential');
      default:
        return t('transmissionTypes.other');
    }
  };

  // Объединяем основные данные и дополнительные данные в один массив для отображения
  const allDataItems = [
    { id: 'brand', name: t('cars.brand'), value: currentCar.brand, isStatic: true },
    { id: 'model', name: t('cars.model'), value: currentCar.model, isStatic: true },
    { id: 'year', name: t('cars.year'), value: currentCar.year.toString(), isStatic: true },
    ...(currentCar.engineType ? [
      { 
        id: 'engineType', 
        name: t('cars.engineType'),
        value: getTranslatedEngineType(currentCar.engineType),
        isStatic: true 
      }
    ] : []),
    ...(currentCar.transmission ? [
      { 
        id: 'transmission', 
        name: t('cars.transmission'),
        value: getTranslatedTransmission(currentCar.transmission),
        isStatic: true 
      }
    ] : []),
    ...(currentCar.vin ? [
      { id: 'vin', name: t('cars.vin'), value: currentCar.vin, isStatic: true }
    ] : [])
  ];

  // Используем статьи из глобального состояния
  const carArticles = articles;

  // Рендер контента для вкладки "Информация об авто"
  const renderInfoContent = () => (
    <div className="car-data-section__all-data">
      {loading ? (
        <div className="car-data-section__loading">
          <div className="car-data-section__spinner"></div>
          <p>{t('carData.loading')}</p>
        </div>
      ) : (allDataItems.length > 0 || carData.length > 0) ? (
        <div className="main-data-grid">
          {/* Основные данные */}
          {allDataItems.map((item) => (
            <div key={item.id} className="main-data-item">
              <span className="main-data-label">{item.name}</span>
              <span className="main-data-value">{item.value}</span>
            </div>
          ))}
          
          {/* Дополнительные данные ИЗ SUPABASE */}
          {carData.map((dataEntry, index) => {
            return dataEntry.fields.map((field, fieldIndex) => {
              const isSpecial = isSpecialCategory(field.name);
              
              return (
                <div 
                  key={`${dataEntry.id}-${fieldIndex}`} 
                  className={`main-data-item ${isSpecial ? 'main-data-item--full-width' : ''}`}
                >
                  <span className="main-data-label">
                    {field.name in translationKeys ? t(`carDataFields.${field.name}`) : field.name}
                  </span>
                  {renderSpecialCategory(field)}
                </div>
              );
            });
          })}
        </div>
      ) : (
        <div className="section__empty">
          <div className="section__empty-icon">🚗</div>
          <h3 className="section__empty-text">{t('carData.noData')}</h3>
          <p className="section__empty-subtext">
            {t('carData.addFirstData')}
          </p>
          <div className="section__empty-actions">
            <button 
              className="btn btn--primary"
              onClick={() => onEditCar && onEditCar(currentCar)}
            >
              {t('carData.add')}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Рендер контента для вкладки "Артикулы"
  const renderArticlesContent = () => (
    <div className="articles-container">
      {articlesLoading ? (
        <div className="car-data-section__loading">
          <div className="car-data-section__spinner"></div>
          <p>{t('articles.loading')}</p>
        </div>
      ) : carArticles.length > 0 ? (
        <div className="articles-categories-grid">
          {(() => {
            // Группируем артикулы по категориям
            const articlesByCategory: { [key: string]: Article[] } = {};
            
            carArticles.forEach(article => {
              const categoryKey = article.category;
              if (!articlesByCategory[categoryKey]) {
                articlesByCategory[categoryKey] = [];
              }
              articlesByCategory[categoryKey].push(article);
            });

            // Сортируем категории по алфавиту
            const sortedCategories = Object.keys(articlesByCategory).sort((a, b) => 
              t(`articles.categories.${a}`).localeCompare(t(`articles.categories.${b}`))
            );

            return sortedCategories.map((categoryKey, categoryIndex) => (
              <div 
                key={categoryKey} 
                className={`articles-category-card articles-category-card--${categoryIndex % 2 === 0 ? 'even' : 'odd'}`}
              >
                <div className="articles-category-header">
                  <h3 className="articles-category-title">
                    {t(`articles.categories.${categoryKey}`)}
                  </h3>
                </div>
                
                <div className="articles-subcategories-list">
                  {articlesByCategory[categoryKey].map((article, index) => (
                    <div 
                      key={article.id} 
                      className="articles-subcategory-item"
                    >
                      <div className="articles-subcategory-info">
                        <span className="articles-subcategory-name">
                          {t(`articles.subcategories.${article.subcategory}`) || article.subcategory}
                        </span>
                        <span className="articles-subcategory-number">
                          {article.articleNumber}
                        </span>
                      </div>
                      <div className="articles-subcategory-actions">
                        <button 
                          className="article-action"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditArticle && onEditArticle(article);
                          }}
                          title={t('common.edit')}
                        >
                          <svg viewBox="0 0 24 24" fill="none" width="12" height="12">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </button>
                        <button 
                          className="article-action article-action--danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(article);
                          }}
                          title={t('common.delete')}
                          type="button"
                        >
                          <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ));
          })()}
        </div>
      ) : (
        <div className="articles-empty">
          <div className="articles-empty-icon">🔧</div>
          <h3 className="articles-empty-text">{t('articles.noArticles')}</h3>
          <p className="articles-empty-subtext">
            {t('articles.addFirstArticle')}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="car-data-section">
      <div className="section-header">
        <div className="section-title">
          <div className="main-content__tabs">
            <button
              className={`btn btn--secondary btn--sm ${activeSubsection === 'info' ? 'btn--primary' : ''}`}
              onClick={() => setActiveSubsection('info')}
              type="button"
              style={{ border: '1px solid var(--color-border-primary)' }}
            >
              <svg className="btn__icon" viewBox="0 0 24 24" fill="none" width="14" height="14">
                <path d="M12 16v-4m0-4h.01M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {t('cars.carInfo')}
            </button>
            
            <button
              className={`btn btn--secondary btn--sm ${activeSubsection === 'articles' ? 'btn--primary' : ''}`}
              onClick={() => setActiveSubsection('articles')}
              type="button"
              style={{ border: '1px solid var(--color-border-primary)' }}
            >
              <svg className="btn__icon" viewBox="0 0 24 24" fill="none" width="14" height="14">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {t('articles.title')}
            </button>
          </div>
          <div className="section-title__actions">
            {/* Кнопка редактирования - показываем только в разделе "Об авто" */}
            {activeSubsection === 'info' && (
              <button 
                className="btn btn--primary btn--compact"
                onClick={() => onEditCar && onEditCar(currentCar)}
                type="button"
                title={t('cars.editCar')} 
              >
                <svg className="btn__icon" viewBox="0 0 24 24" fill="none">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            )}
            
            {/* Кнопка добавления - показываем всегда */}
            <button 
              className="btn btn--primary btn--compact"
              onClick={handleAddClick}
              type="button"
              title={activeSubsection === 'info' ? t('carData.add') : t('articles.add')} 
            >
                <svg className="btn__icon" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="section-content">
        {activeSubsection === 'info' ? renderInfoContent() : renderArticlesContent()}
      </div>

      {/* Используем готовый ConfirmModal компонент */}
      <ConfirmModal
        isOpen={!!articleToDelete}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={t('articles.deleteArticle')}
        message={t('articles.confirmDeleteMessage', { articleNumber: articleToDelete?.articleNumber })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        type="delete"
      />
    </div>
  );
};

export default CarDataSection;