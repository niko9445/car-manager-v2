import { useCallback, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useLocalStorage } from './useLocalStorage';
import { Car, AppModalType, ModalData, SectionType } from '../types';

export const useAppLogic = () => {
  const [cars, setCars] = useLocalStorage<Car[]>('cars', []);
  const { state, dispatch } = useApp();
  const { selectedCar, isMobile, sidebarOpen, modals, modalData } = state;

  // Синхронизация cars с контекстом
  useEffect(() => {
    dispatch({ type: 'SET_CARS', payload: cars });
  }, [cars, dispatch]);

  // Адаптивность
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      dispatch({ type: 'SET_IS_MOBILE', payload: mobile });
      dispatch({ type: 'SET_SIDEBAR_OPEN', payload: !mobile });
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [dispatch]);

  // Оптимизированные обработчики
  const handleSetSelectedCar = useCallback((car: Car) => {
    dispatch({ type: 'SET_SELECTED_CAR', payload: car });
  }, [dispatch]);

  const handleSetActiveSection = useCallback((section: SectionType) => {
    dispatch({ type: 'SET_ACTIVE_SECTION', payload: section });
  }, [dispatch]);

  const handleSetSidebarOpen = useCallback((open: boolean) => {
    dispatch({ type: 'SET_SIDEBAR_OPEN', payload: open });
  }, [dispatch]);

  const openModal = useCallback((modalType: AppModalType, data?: ModalData) => {
    dispatch({ type: 'OPEN_MODAL', payload: { modalType, data } });
  }, [dispatch]);

  const closeModal = useCallback(() => {
    Object.keys(modals).forEach(modalType => {
      if (modals[modalType as AppModalType]) {
        dispatch({ type: 'CLOSE_MODAL', payload: { modalType: modalType as AppModalType } });
      }
    });
  }, [modals, dispatch]);

  return {
    cars,
    setCars,
    state,
    selectedCar,
    isMobile,
    sidebarOpen,
    modals,
    modalData,
    handleSetSelectedCar,
    handleSetActiveSection,
    handleSetSidebarOpen,
    openModal,
    closeModal
  };
};