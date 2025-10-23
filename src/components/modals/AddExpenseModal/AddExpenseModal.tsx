import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import Modal from '../../ui/Modal/Modal';
import ExpenseForm from '../../expenses/ExpenseForm/ExpenseForm';
import './AddExpenseModal.css';

const AddExpenseModal: React.FC = () => {
  const { state, dispatch } = useApp();
  const { modals, modalData } = state;

  const isOpen = modals.addExpense || modals.editExpense;
  const isEditMode = modals.editExpense;
  
  // Правильно получаем expense для редактирования
  const expense = isEditMode && modalData && 'expense' in modalData 
    ? modalData.expense 
    : undefined;

  const handleClose = () => {
    if (isEditMode) {
      dispatch({ type: 'CLOSE_MODAL', payload: { modalType: 'editExpense' } });
    } else {
      dispatch({ type: 'CLOSE_MODAL', payload: { modalType: 'addExpense' } });
    }
  };

  const handleSave = () => {
    // При сохранении закрываем модальное окно
    // Данные автоматически перезагрузятся в ExpenseTracker из-за изменения состояния modal
    handleClose();
  };

  // Обработчик успешного сохранения формы
  const handleFormSave = () => {
    handleSave();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Редактировать расход' : 'Добавить расход'}
      size="md"
    >
      <ExpenseForm
        expense={expense}
        onSave={handleFormSave}
        onCancel={handleClose}
      />
    </Modal>
  );
};

export default AddExpenseModal;