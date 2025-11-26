
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Cycle, SmartAlertConfig } from '../types';

interface ModalState {
  form: boolean;
  settings: boolean;
  achievements: boolean;
  flex: boolean;
  alerts: boolean;
  import: boolean;
  trash: boolean;
  hall: boolean;
  missions: boolean;
  profile: boolean;
  reports: boolean;
}

interface UIContextType {
  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;
  modals: ModalState;
  openModal: (modal: keyof ModalState) => void;
  closeModal: (modal: keyof ModalState) => void;
  toast: { visible: boolean; message: string; type: 'success' | 'error' };
  showToast: (message: string, type?: 'success' | 'error') => void;
  hideToast: () => void;
  
  smartAlert: SmartAlertConfig | null;
  triggerSmartAlert: (config: Omit<SmartAlertConfig, 'visible'>) => void;
  closeSmartAlert: () => void;

  editingCycle: Cycle | null;
  setEditingCycle: (c: Cycle | null) => void;
  duplicatingCycle: Cycle | null;
  setDuplicatingCycle: (c: Cycle | null) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPrivacyMode, setIsPrivacyMode] = useState(() => localStorage.getItem('cpa_privacy_mode') === 'true');
  
  useEffect(() => {
    localStorage.setItem('cpa_privacy_mode', isPrivacyMode.toString());
  }, [isPrivacyMode]);

  const togglePrivacyMode = () => setIsPrivacyMode(prev => !prev);

  const [modals, setModals] = useState<ModalState>({
    form: false, settings: false, achievements: false, flex: false, 
    alerts: false, import: false, trash: false, 
    hall: false, missions: false, profile: false, reports: false
  });

  const [editingCycle, setEditingCycle] = useState<Cycle | null>(null);
  const [duplicatingCycle, setDuplicatingCycle] = useState<Cycle | null>(null);

  const openModal = useCallback((modal: keyof ModalState) => {
    setModals(prev => ({ ...prev, [modal]: true }));
  }, []);

  const closeModal = useCallback((modal: keyof ModalState) => {
    setModals(prev => ({ ...prev, [modal]: false }));
  }, []);

  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({ 
    visible: false, message: '', type: 'success' 
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  const [smartAlert, setSmartAlert] = useState<SmartAlertConfig | null>(null);

  const triggerSmartAlert = useCallback((config: Omit<SmartAlertConfig, 'visible'>) => {
    setSmartAlert({ ...config, visible: true });
    setTimeout(() => {
       setSmartAlert(prev => prev ? { ...prev, visible: false } : null);
    }, 8000);
  }, []);

  const closeSmartAlert = useCallback(() => {
    setSmartAlert(prev => prev ? { ...prev, visible: false } : null);
  }, []);

  return (
    <UIContext.Provider value={{
      isPrivacyMode, togglePrivacyMode,
      modals, openModal, closeModal,
      toast, showToast, hideToast,
      smartAlert, triggerSmartAlert, closeSmartAlert,
      editingCycle, setEditingCycle,
      duplicatingCycle, setDuplicatingCycle
    }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
};
