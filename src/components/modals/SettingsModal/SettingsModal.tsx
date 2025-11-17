import React from 'react';
import Modal from '../../ui/Modal/Modal';
import CurrencySwitcher from '../../ui/CurrencySwitcher/CurrencySwitcher';
import { ThemeSwitcher } from '../../ui/ThemeSwitcher/ThemeSwitcher';
import { LanguageSwitcher } from '../../ui/LanguageSwitcher/LanguageSwitcher'; // <-- ДОБАВИТЬ
import DataManager from '../../DataManager/DataManager';
import { useTranslation } from '../../../contexts/LanguageContext'; // <-- ДОБАВИТЬ

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation(); // <-- ДОБАВИТЬ

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={t('settings.title')} // <-- ИСПОЛЬЗУЕМ ПЕРЕВОД
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
            margin: '0 0 var(--space-4) 0'
          }}>
            {t('settings.interfaceTheme')}
          </h3>
          <p style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            margin: '0 0 var(--space-4) 0',
            lineHeight: '1.4'
          }}>
            {t('settings.chooseTheme')}
          </p>
          <ThemeSwitcher />
        </div>

        {/* Секция языка */}
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
            {t('settings.interfaceLanguage')}
          </h3>
          <p style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            margin: '0 0 var(--space-4) 0',
            lineHeight: '1.4'
          }}>
            {t('settings.chooseLanguage')}
          </p>
          <LanguageSwitcher />
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
            {t('settings.currency')}
          </h3>
          <p style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            margin: '0 0 var(--space-4) 0',
            lineHeight: '1.4'
          }}>
            {t('settings.chooseCurrency')}
          </p>
          <CurrencySwitcher />
        </div>

        {/* Секция управления данными */}
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
            {t('settings.dataManagement')}
          </h3>
          <p style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            margin: '0 0 var(--space-4) 0',
            lineHeight: '1.4'
          }}>
            {t('settings.backupRestore')}
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
              {t('app.copyright')}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;