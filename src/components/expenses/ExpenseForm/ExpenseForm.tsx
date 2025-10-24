import React, { useState, useEffect } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Expense, ExpenseCategory } from '../../../types';
import { ExpenseService } from '../../../services/expenseService';

interface ExpenseFormData {
  date: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  odometer?: number;
}

interface ExpenseFormErrors {
  date?: string;
  category?: string;
  amount?: string;
  description?: string;
  odometer?: string;
}

interface ExpenseFormProps {
  expense?: Expense;
  onSave: () => void;
  onCancel: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ 
  expense, 
  onSave, 
  onCancel 
}) => {
  const { state } = useApp();
  const { selectedCar } = state;
  
  const [formData, setFormData] = useState<ExpenseFormData>({
    date: new Date().toISOString().split('T')[0],
    category: 'fuel',
    amount: 0,
    description: '',
    odometer: undefined
  });
  
  const [errors, setErrors] = useState<ExpenseFormErrors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expense) {
      setFormData({
        date: expense.date,
        category: expense.category,
        amount: expense.amount,
        description: expense.description,
        odometer: expense.odometer
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: 'fuel',
        amount: 0,
        description: '',
        odometer: undefined
      });
    }
  }, [expense]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' || name === 'odometer' 
        ? value === '' ? undefined : Number(value)
        : value
    }));
    
    if (errors[name as keyof ExpenseFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ExpenseFormErrors = {};

    if (!formData.date) {
      newErrors.date = 'Укажите дату расхода';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Укажите корректную сумму';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Введите описание расхода';
    }

    if (formData.odometer !== undefined && formData.odometer < 0) {
      newErrors.odometer = 'Пробег не может быть отрицательным';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !selectedCar) {
      return;
    }

    setLoading(true);

    try {
      console.log('Saving expense...', formData);
      
      if (expense) {
        const result = await ExpenseService.updateExpense(expense.id, {
          ...formData,
          carId: selectedCar.id
        });
        console.log('Expense updated:', result);
      } else {
        const result = await ExpenseService.addExpense({
          ...formData,
          carId: selectedCar.id
        });
        console.log('Expense added:', result);
      }
      
      setTimeout(() => {
        console.log('Calling onSave...');
        onSave();
      }, 100);
      
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Ошибка при сохранении расхода');
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions: { value: ExpenseCategory; label: string; icon: string }[] = [
    { value: 'fuel', label: '⛽ Заправка', icon: '⛽' },
    { value: 'maintenance', label: '🔧 Техобслуживание', icon: '🔧' },
    { value: 'repairs', label: '🛠️ Ремонт', icon: '🛠️' },
    { value: 'parts', label: '⚙️ Запчасти', icon: '⚙️' },
    { value: 'insurance', label: '🛡️ Страховка', icon: '🛡️' },
    { value: 'taxes', label: '📄 Налоги', icon: '📄' },
    { value: 'parking', label: '🅿️ Парковка', icon: '🅿️' },
    { value: 'washing', label: '🧼 Мойка', icon: '🧼' },
    { value: 'fines', label: '🚨 Штрафы', icon: '🚨' },
    { value: 'other', label: '💰 Прочее', icon: '💰' }
  ];

  return (
    <form className="modal__form" onSubmit={handleSubmit}>
      <div className="modal__form-grid">
        <div className="modal__form-group">
          <label htmlFor="date" className="modal__label modal__label--required">
            Дата расхода
          </label>
          <input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleInputChange}
            className={`modal__input ${errors.date ? 'modal__input--error' : ''}`}
            required
          />
          {errors.date && <span className="modal__error">{errors.date}</span>}
        </div>

        <div className="modal__form-group">
          <label htmlFor="category" className="modal__label modal__label--required">
            Категория
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="modal__input"
          >
            {categoryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="modal__form-group">
          <label htmlFor="amount" className="modal__label modal__label--required">
            Сумма (₽)
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount || ''}
            onChange={handleInputChange}
            className={`modal__input ${errors.amount ? 'modal__input--error' : ''}`}
            placeholder="0.00"
            required
          />
          {errors.amount && <span className="modal__error">{errors.amount}</span>}
        </div>

        <div className="modal__form-group">
          <label htmlFor="odometer" className="modal__label">
            Пробег (км)
          </label>
          <input
            id="odometer"
            name="odometer"
            type="number"
            min="0"
            value={formData.odometer || ''}
            onChange={handleInputChange}
            className={`modal__input ${errors.odometer ? 'modal__input--error' : ''}`}
            placeholder="Необязательно"
          />
          {errors.odometer && <span className="modal__error">{errors.odometer}</span>}
        </div>

        <div className="modal__form-group modal__form-group--full">
          <label htmlFor="description" className="modal__label modal__label--required">
            Описание
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className={`modal__input modal__input--textarea ${errors.description ? 'modal__input--error' : ''}`}
            placeholder="Краткое описание расхода..."
            rows={3}
            required
          />
          {errors.description && <span className="modal__error">{errors.description}</span>}
        </div>
      </div>

      <div className="modal__actions modal__actions--between">
        <button
          type="button"
          className="btn btn--secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Отмена
        </button>
        <button
          type="submit"
          className="btn btn--primary"
          disabled={loading}
        >
          {loading ? 'Сохранение...' : expense ? 'Обновить' : 'Добавить расход'}
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;