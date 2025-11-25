
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DashboardPeriod, ViewMode } from '../types';

interface FilterContextType {
  dashboardPeriod: DashboardPeriod;
  setDashboardPeriod: (p: DashboardPeriod) => void;
  view: ViewMode;
  setView: (v: ViewMode) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dashboardPeriod, setDashboardPeriod] = useState<DashboardPeriod>('monthly');
  const [view, setView] = useState<ViewMode>('dashboard');

  return (
    <FilterContext.Provider value={{ dashboardPeriod, setDashboardPeriod, view, setView }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) throw new Error('useFilters must be used within FilterProvider');
  return context;
};
