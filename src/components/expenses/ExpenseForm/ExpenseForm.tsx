import React, { useState, useEffect } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Expense, ExpenseCategory } from '../../../types';
import { ExpenseService } from '../../../services/expenseService';
import './ExpenseForm.css';

// Локальный интерфейс для формы
interface ExpenseFormData {
  date: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  odometer?: number;
}

// Интерфейс для ошибок с правильными типами
interface ExpenseFormErrors {
  date?: string;
  category?: string;
  amount?: string;
  description?: string;
  odometer?: string;
}

interface ExpenseFormProps {
  expense?: Expense; // Если передано - режим редактирования
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
      // Режим редактирования - заполняем форму данными
      setFormData({
        date: expense.date,
        category: expense.category,
        amount: expense.amount,
        description: expense.description,
        odometer: expense.odometer
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
    
    // Очищаем ошибку при изменении поля
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
      if (expense) {
        // Режим редактирования
        await ExpenseService.updateExpense(expense.id, {
          ...formData,
          carId: selectedCar.id
        });
      } else {
        // Режим добавления
        await ExpenseService.addExpense({
          ...formData,
          carId: selectedCar.id
        });
      }
      
      onSave();
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
    <form className="form" onSubmit={handleSubmit}>
      <div className="form__fields">
        <div className="form__group">
          <label htmlFor="date" className="form__label form__label--required">
            Дата расхода
          </label>
          <input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleInputChange}
            className={`form__input ${errors.date ? 'form__input--error' : ''}`}
            required
          />
          {errors.date && <span className="form__error">{errors.date}</span>}
        </div>

        <div className="form__group">
          <label htmlFor="category" className="form__label form__label--required">
            Категория
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="form__select"
          >
            {categoryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form__group">
          <label htmlFor="amount" className="form__label form__label--required">
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
            className={`form__input ${errors.amount ? 'form__input--error' : ''}`}
            placeholder="0.00"
            required
          />
          {errors.amount && <span className="form__error">{errors.amount}</span>}
        </div>

        <div className="form__group">
          <label htmlFor="odometer" className="form__label">
            Пробег (км)
          </label>
          <input
            id="odometer"
            name="odometer"
            type="number"
            min="0"
            value={formData.odometer || ''}
            onChange={handleInputChange}
            className={`form__input ${errors.odometer ? 'form__input--error' : ''}`}
            placeholder="Необязательно"
          />
          {errors.odometer && <span className="form__error">{errors.odometer}</span>}
        </div>

        <div className="form__group">
          <label htmlFor="description" className="form__label form__label--required">
            Описание
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className={`form__textarea ${errors.description ? 'form__textarea--error' : ''}`}
            placeholder="Краткое описание расхода..."
            rows={3}
            required
          />
          {errors.description && <span className="form__error">{errors.description}</span>}
        </div>
      </div>

      <div className="form__actions">
        <button
          type="button"
          className="btn btn--outline"
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