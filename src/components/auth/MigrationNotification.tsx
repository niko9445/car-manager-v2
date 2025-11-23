// components/auth/MigrationNotification.tsx
import React from 'react';
import { useDataMigration } from '../../hooks/useDataMigration';
import './MigrationNotification.css';

export const MigrationNotification: React.FC = () => {
  const { isMigrating, migrationStatus, shouldMigrate } = useDataMigration();

  if (!shouldMigrate && !isMigrating) return null;

  return (
    <div className="migration-notification">
      <div className="migration-content">
        {isMigrating ? (
          <>
            <div className="migration-spinner"></div>
            <div className="migration-text">
              <h3>Перенос данных...</h3>
              <p>Мигрируем ваши автомобили в облачное хранилище</p>
            </div>
          </>
        ) : migrationStatus.completed ? (
          <>
            <div className="migration-success">✓</div>
            <div className="migration-text">
              <h3>Миграция завершена!</h3>
              <p>Успешно перенесено {migrationStatus.migratedCount} автомобилей</p>
            </div>
          </>
        ) : migrationStatus.error ? (
          <>
            <div className="migration-error">⚠</div>
            <div className="migration-text">
              <h3>Ошибка миграции</h3>
              <p>Данные остаются в локальном хранилище</p>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};