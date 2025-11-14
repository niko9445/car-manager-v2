import { useState, useEffect } from 'react';
import { FavoriteMaintenance } from '../types';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteMaintenance[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('maintenanceFavorites');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  const saveFavorites = (newFavorites: FavoriteMaintenance[]) => {
    setFavorites(newFavorites);
    localStorage.setItem('maintenanceFavorites', JSON.stringify(newFavorites));
  };

  const addToFavorites = (maintenanceData: any, name: string) => {
    const newFavorite: FavoriteMaintenance = {
      id: Date.now().toString(),
      categoryId: maintenanceData.categoryId,
      subcategoryId: maintenanceData.subcategoryId,
      customFields: maintenanceData.customFields,
      name,
      usedCount: 1,
      lastUsed: new Date().toISOString()
    };

    const updatedFavorites = [...favorites, newFavorite];
    saveFavorites(updatedFavorites);
  };

  const updateFavoriteUsage = (favoriteId: string) => {
    const updatedFavorites = favorites.map(fav => 
      fav.id === favoriteId 
        ? { ...fav, usedCount: fav.usedCount + 1, lastUsed: new Date().toISOString() }
        : fav
    );
    saveFavorites(updatedFavorites);
  };

  const removeFromFavorites = (favoriteId: string) => {
    const updatedFavorites = favorites.filter(fav => fav.id !== favoriteId);
    saveFavorites(updatedFavorites);
  };

  return {
    favorites,
    addToFavorites,
    updateFavoriteUsage,
    removeFromFavorites
  };
};