import React from 'react';
import Modal from '../../ui/Modal/Modal';
import CurrencySwitcher from '../../ui/CurrencySwitcher/CurrencySwitcher';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const handleExport = () => {
    // Ваша логика экспорта
    console.log('Export data');
  };

  const handleImport = () => {
    // Ваша логика импорта
    console.log('Import data');
  };

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
            {/* Кнопка Скачать - зеленый акцент */}
            <button 
              onClick={handleExport}
              style={{ 
                padding: '12px 16px', 
                border: '1px solid var(--color-accent-green)', 
                background: 'var(--color-accent-green)',
                borderRadius: 'var(--radius-md)',
                minHeight: '44px',
                color: 'white',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'var(--color-accent-green-dark)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'var(--color-accent-green)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 16L12 8M9 13L12 16L15 13M8 12H6a2 2 0 00-2 2v4a2 2 0 002 2h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2"/>
              </svg>
              Скачать
            </button>

            {/* Кнопка Загрузить - синий акцент */}
            <button 
              onClick={handleImport}
              style={{ 
                padding: '12px 16px', 
                border: '1px solid var(--color-accent-blue)', 
                background: 'var(--color-accent-blue)',
                borderRadius: 'var(--radius-md)',
                minHeight: '44px',
                color: 'white',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'var(--color-accent-blue-dark)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'var(--color-accent-blue)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 8L12 16M9 11L12 8L15 11M8 12H6a2 2 0 00-2 2v4a2 2 0 002 2h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2"/>
              </svg>
              Загрузить
            </button>
          </div>
        </div>

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
            margin: '0 0 var(--space-2) 0'
          }}>
            Внешний вид
          </h3>
          <p style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            margin: '0 0 var(--space-4) 0',
            lineHeight: '1.4'
          }}>
            Настройки темы появятся в будущих обновлениях
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