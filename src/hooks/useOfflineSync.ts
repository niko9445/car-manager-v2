// hooks/useOfflineSync.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { syncService } from '../services/database/baseService';

export const useOfflineSync = () => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  // Отслеживаем онлайн статус
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🌐 Интернет подключен');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      console.log('📴 Интернет отключен');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Авто-синхронизация при появлении интернета
  useEffect(() => {
    if (isOnline && user && !isSyncing) {
      const syncData = async () => {
        setIsSyncing(true);
        setSyncStatus('syncing');
        
        try {
          console.log('🔄 Запуск автоматической синхронизации...');
          const result = await syncService.syncAllTables(user.id);
          setLastSync(new Date());
          setSyncStatus('success');
          
          console.log('✅ Авто-синхронизация завершена:', result);
          
          // Через 3 секунды возвращаем статус в idle
          setTimeout(() => setSyncStatus('idle'), 3000);
        } catch (error) {
          console.error('❌ Ошибка авто-синхронизации:', error);
          setSyncStatus('error');
          
          // Через 5 секунд возвращаем статус в idle
          setTimeout(() => setSyncStatus('idle'), 5000);
        } finally {
          setIsSyncing(false);
        }
      };

      // Ждем немного перед синхронизацией
      const timeoutId = setTimeout(syncData, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [isOnline, user, isSyncing]);

  const manualSync = useCallback(async () => {
    if (!user) {
      throw new Error('Пользователь не авторизован');
    }

    setIsSyncing(true);
    setSyncStatus('syncing');
    
    try {
      console.log('🔄 Запуск ручной синхронизации...');
      const result = await syncService.syncAllTables(user.id);
      setLastSync(new Date());
      setSyncStatus('success');
      
      console.log('✅ Ручная синхронизация завершена:', result);
      
      // Через 3 секунды возвращаем статус в idle
      setTimeout(() => setSyncStatus('idle'), 3000);
      
      return result;
    } catch (error) {
      console.error('❌ Ошибка ручной синхронизации:', error);
      setSyncStatus('error');
      
      // Через 5 секунд возвращаем статус в idle
      setTimeout(() => setSyncStatus('idle'), 5000);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, [user]);

  // Проверяем есть ли данные для синхронизации
  const hasPendingSync = useCallback(() => {
    const tables = ['cars', 'maintenance', 'expenses', 'car_data'];
    
    for (const table of tables) {
      const queueKey = `sync_queue_${table}`;
      const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
      
      if (queue.length > 0) {
        return true;
      }
    }
    
    return false;
  }, []);

  const getPendingCount = useCallback(() => {
    const tables = ['cars', 'maintenance', 'expenses', 'car_data'];
    let total = 0;
    
    for (const table of tables) {
      const queueKey = `sync_queue_${table}`;
      const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
      total += queue.length;
    }
    
    return total;
  }, []);

  return {
    isOnline,
    isSyncing,
    lastSync,
    syncStatus,
    manualSync,
    hasPendingSync: hasPendingSync(),
    pendingCount: getPendingCount()
  };
};