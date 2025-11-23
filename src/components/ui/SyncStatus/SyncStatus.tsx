// components/ui/SyncStatus/SyncStatus.tsx
import React from 'react';
import { useOfflineSync } from '../../../hooks/useOfflineSync';
import './SyncStatus.css';

export const SyncStatus: React.FC = () => {
  const { 
    isOnline, 
    isSyncing, 
    lastSync, 
    syncStatus, 
    manualSync, 
    hasPendingSync,
    pendingCount 
  } = useOfflineSync();

  if (!isOnline) {
    return (
      <div className="sync-status sync-status--offline">
        <div className="sync-status-icon">📴</div>
        <div className="sync-status-text">
          <div className="sync-status-title">Оффлайн режим</div>
          <div className="sync-status-subtitle">Данные сохраняются локально</div>
        </div>
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div className="sync-status sync-status--syncing">
        <div className="sync-status-spinner"></div>
        <div className="sync-status-text">
          <div className="sync-status-title">Синхронизация...</div>
          <div className="sync-status-subtitle">Обновляем данные</div>
        </div>
      </div>
    );
  }

  if (hasPendingSync && syncStatus === 'success') {
    return (
      <div className="sync-status sync-status--success">
        <div className="sync-status-icon">✅</div>
        <div className="sync-status-text">
          <div className="sync-status-title">Синхронизировано</div>
          <div className="sync-status-subtitle">
            {pendingCount > 0 ? `Осталось: ${pendingCount}` : 'Все данные актуальны'}
          </div>
        </div>
      </div>
    );
  }

  if (hasPendingSync) {
    return (
      <div className="sync-status sync-status--pending">
        <div className="sync-status-icon">⏳</div>
        <div className="sync-status-text">
          <div className="sync-status-title">Ожидание синхронизации</div>
          <div className="sync-status-subtitle">{pendingCount} операций</div>
        </div>
        <button 
          className="sync-status-button"
          onClick={manualSync}
          disabled={isSyncing}
        >
          Синхронизировать
        </button>
      </div>
    );
  }

  // По умолчанию не показываем ничего если все синхронизировано
  return null;
};