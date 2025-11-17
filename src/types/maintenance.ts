// Типы для системы категорий ТО
export interface MaintenanceCategory {
  id: string;
  name: string;
  icon: string;
  subcategories: MaintenanceSubcategory[];
}

export interface MaintenanceSubcategory {
  id: string;
  name: string;
  fields: FormField[];
  defaultValues?: Record<string, any>;
}

export interface FormField {
  type: 'text' | 'number' | 'select' | 'checkbox' | 'date';
  name: string;
  label: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface MaintenanceFormData {
  categoryId: string;
  subcategoryId: string;
  date: string;
  mileage: number;
  cost: number | null;
  customFields: Record<string, any>;
  description?: string;
}