import React from 'react';
import Modal from '../../ui/Modal/Modal';
import CurrencySwitcher from '../../ui/CurrencySwitcher/CurrencySwitcher';
import { ThemeSwitcher } from '../../ui/ThemeSwitcher/ThemeSwitcher';
import DataManager from '../../DataManager/DataManager';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Настройки" 
      size="md"
      className="settings-modal"
    >
      <div className="settings-content" style={{ 
        background: 'var(--color-bg-secondary)',
        padding: '0',
        borderRadius: '12px'
      }}>
        
        {/* Секция темы */}
        <div style={{ 
          padding: 'var(--space-5)',
          borderBottom: '1px solid var(--color-border-primary)',
          background: 'var(--color-bg-tertiary)'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: 'var(--color-text-primary)',
            margin: '0 0 var(--space-4) 0' // Увеличиваем отступ снизу
          }}>
            Тема интерфейса
          </h3>
          <ThemeSwitcher />
        </div>

        {/* Секция валюты */}
        <div style={{ 
          padding: 'var(--space-5)',
          borderBottom: '1px solid var(--color-border-primary)',
          background: 'var(--color-bg-tertiary)'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: 'var(--color-text-primary)',
            margin: '0 0 var(--space-2) 0'
          }}>
            Валюта
          </h3>
          <p style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            margin: '0 0 var(--space-4) 0',
            lineHeight: '1.4'
          }}>
            Выберите валюту для отображения сумм
          </p>
          <CurrencySwitcher />
        </div>

        {/* Секция управления данными */}
        <div style={{ 
          padding: 'var(--space-5)',
          borderBottom: '1px solid var(--color-border-primary)',
          background: 'var(--color-bg-tertiary)'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: 'var(--color-text-primary)',
            margin: '0 0 var(--space-2) 0'
          }}>
            Управление данными
          </h3>
          <p style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            margin: '0 0 var(--space-4) 0',
            lineHeight: '1.4'
          }}>
            Резервное копирование и восстановление данных
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            width: '100%'
          }}>
            <DataManager />
          </div>
        </div>

        {/* Секция языка */}
        <div style={{ 
          padding: 'var(--space-5)',
          background: 'var(--color-bg-tertiary)'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: 'var(--color-text-primary)',
            margin: '0 0 var(--space-2) 0'
          }}>
            Язык
          </h3>
          <p style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            margin: '0 0 var(--space-4) 0',
            lineHeight: '1.4'
          }}>
            Выбор языка интерфейса
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: 'var(--space-2) var(--space-3)',
            background: 'var(--color-bg-tertiary)',
            border: '1px solid var(--color-border-secondary)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-muted)',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            <span>Скоро</span>
          </div>
        </div>

        {/* Подпись */}
        <div style={{
          padding: 'var(--space-5)',
          borderTop: '1px solid var(--color-border-primary)',
          textAlign: 'center',
          background: 'var(--color-bg-tertiary)',
          borderRadius: '0 0 12px 12px'
        }}>
          <div style={{ opacity: '0.7' }}>
            <span style={{
              fontSize: '14px',
              color: 'var(--color-text-muted)'
            }}>
              © 2025 RuNiko
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;