import React, { createContext, useContext, ReactNode } from 'react';
import { Cycle, DashboardStats, AdvancedStats, User } from '../types';
import { useCycles } from '../hooks/useCycles';
import { useFilters } from './FilterContext';

interface CycleContextType {
  cycles: Cycle[];
  filteredCycles: Cycle[];
  todayCycles: Cycle[];
  dashboardStats: DashboardStats;
  globalStats: DashboardStats;
  advancedStats: AdvancedStats;
  reloadCycles: () => void;
  registerNewCycle: (data: any) => Promise<Cycle | null>;
  modifyCycle: (id: string, data: any) => Promise<void>;
  removeCycle: (id: string) => Promise<void>;
  globalAverageProfit: number;
  loading: boolean;
}

const CycleContext = createContext<CycleContextType | undefined>(undefined);

export const CycleProvider: React.FC<{ children: ReactNode; user: User | null }> = ({ children, user }) => {
  const { dashboardPeriod } = useFilters();
  
  // Leveraging existing hook logic but exposing it via Context
  const cycleData = useCycles(user, dashboardPeriod);

  return (
    <CycleContext.Provider value={cycleData}>
      {children}
    </CycleContext.Provider>
  );
};

export const useCyclesContext = () => {
  const context = useContext(CycleContext);
  if (!context) throw new Error('useCyclesContext must be used within CycleProvider');
  return context;
};