import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, Car, AppModalType, ModalData } from '../types';


// Типы для действий
type AppAction =
  | { type: 'SET_CARS'; payload: Car[] }
  | { type: 'SET_SELECTED_CAR'; payload: Car | null }
  | { type: 'SET_ACTIVE_SECTION'; payload: 'maintenance' | 'carData' }
  | { type: 'SET_IS_MOBILE'; payload: boolean }
  | { type: 'SET_SIDEBAR_OPEN'; payload: boolean }
  | { type: 'OPEN_MODAL'; payload: { modalType: AppModalType; data?: ModalData } }
  | { type: 'CLOSE_MODAL'; payload: { modalType: AppModalType } };

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialState: AppState = {
  cars: [],
  selectedCar: null,
  activeSection: 'maintenance',
  isMobile: false,
  sidebarOpen: false,
  modals: {
    addCar: false,
    editCar: false,
    confirmDelete: false,
    addMaintenance: false,
    addCarData: false,
    editCarData: false
  },
  modalData: {}
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CARS':
      return { ...state, cars: action.payload };
    case 'SET_SELECTED_CAR':
      return { ...state, selectedCar: action.payload };
    case 'OPEN_MODAL':
      return {
        ...state,
        modals: { ...state.modals, [action.payload.modalType]: true },
        modalData: { ...state.modalData, ...action.payload.data }
      };
    case 'CLOSE_MODAL':
      return {
        ...state,
        modals: { ...state.modals, [action.payload.modalType]: false },
        modalData: {}
      };
    default:
      return state;
  }
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};