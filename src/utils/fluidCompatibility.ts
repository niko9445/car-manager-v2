// Правила совместимости жидкостей
export const FLUID_COMPATIBILITY = {
  '5W-30': { incompatibleWith: ['10W-40', '15W-40'] },
  '5W-40': { incompatibleWith: ['5W-30', '0W-20'] },
  'G12': { incompatibleWith: ['G11', 'G13'] },
  'G12+': { incompatibleWith: ['G11'] },
  'DOT4': { incompatibleWith: ['DOT3'] },
  'DOT5': { incompatibleWith: ['DOT3', 'DOT4'] }
};

export const checkFluidCompatibility = (currentFluid: string, newFluid: string): { compatible: boolean; warning?: string } => {
  const rules = FLUID_COMPATIBILITY[currentFluid as keyof typeof FLUID_COMPATIBILITY];
  
  if (!rules) return { compatible: true };
  
  if (rules.incompatibleWith.includes(newFluid)) {
    return {
      compatible: false,
      warning: `Внимание! ${currentFluid} несовместим с ${newFluid}. Рекомендуется промывка системы.`
    };
  }
  
  return { compatible: true };
};

// Получение истории жидкостей для автомобиля
export const getFluidHistory = (car: any, fluidType: string): string[] => {
  const history: string[] = [];
  
  car.maintenance?.forEach((maintenance: any) => {
    if (maintenance.customFields?.oilType) {
      history.push(maintenance.customFields.oilType);
    }
    if (maintenance.customFields?.type) {
      history.push(maintenance.customFields.type);
    }
  });
  
  return Array.from(new Set(history));
};