// hooks/useArticles.ts
import { useState, useEffect } from 'react';
import { Article } from '../types';
import { articleService } from '../services/database/articles';
import { useApp } from '../contexts/AppContext';

export const useArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { state } = useApp();
  const { selectedCar } = state;

  const loadArticles = async () => {
    if (!selectedCar) {
      setArticles([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Загрузка запчастей для автомобиля:', selectedCar.id);
      const articlesData = await articleService.getArticlesByCar(selectedCar.id);
      console.log('✅ Загружены запчасти:', articlesData);
      setArticles(articlesData);
    } catch (err) {
      console.error('❌ Ошибка загрузки запчастей:', err);
      setError('Не удалось загрузить запчасти');
    } finally {
      setLoading(false);
    }
  };

  const addArticle = async (articleData: { category: string; subcategory: string; articleNumber: string }) => {
    if (!selectedCar) return;

    try {
        // Оптимистичное обновление
        const tempArticle: Article = {
        id: `temp-${Date.now()}`,
        ...articleData,
        createdAt: new Date().toISOString(),
        carId: selectedCar.id
        };
        
        setArticles(prev => [tempArticle, ...prev]);

        // Создание в Supabase
        const result = await articleService.createArticle(selectedCar.id, articleData);
        
        // Замена временной записи
        setArticles(prev => prev.map(item => 
        item.id === tempArticle.id ? result : item
        ));

    } catch (error) {
        console.error('❌ Ошибка создания запчасти:', error);
        // Откат при ошибке
        setArticles(prev => prev.filter(item => !item.id.startsWith('temp-')));
    }
    };

  const updateArticle = (articleId: string, updatedData: { category: string; subcategory: string; articleNumber: string }) => {
    setArticles(prev => prev.map(article => 
      article.id === articleId 
        ? { ...article, ...updatedData }
        : article
    ));
  };

  const deleteArticle = (articleId: string) => {
    setArticles(prev => prev.filter(article => article.id !== articleId));
  };

  // Загружаем запчасти при изменении выбранного автомобиля
  useEffect(() => {
    loadArticles();
  }, [selectedCar?.id]);

  return {
    articles,
    loading,
    error,
    loadArticles,
    addArticle,
    updateArticle,
    deleteArticle
  };
};