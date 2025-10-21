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
  const expense = modalData.expenseToEdit;

  const handleClose = () => {
    if (isEditMode) {
      dispatch({ type: 'CLOSE_MODAL', payload: { modalType: 'editExpense' } });
    } else {
      dispatch({ type: 'CLOSE_MODAL', payload: { modalType: 'addExpense' } });
    }
  };

  const handleSave = () => {
    handleClose();
    // Можно добавить callback для обновления списка расходов
    // Например, dispatch({ type: 'REFRESH_EXPENSES' });
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
        onSave={handleSave}
        onCancel={handleClose}
      />
    </Modal>
  );
};

export default AddExpenseModal;