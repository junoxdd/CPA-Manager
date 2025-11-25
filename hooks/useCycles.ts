
import { useState, useCallback, useMemo, useEffect } from 'react';
import { Cycle, User, DashboardPeriod } from '../types';
import { 
  fetchCycles, saveCycle, updateCycle as updateCycleService, softDeleteCycle as deleteCycleService, 
  getDashboardStats, getAdvancedStats, filterCyclesByPeriod 
} from '../services/cycleService';
import { checkAutomations } from '../services/automationService';
import { checkSmartAlerts, saveAlertsBatch } from '../services/alertService';
import { getLocalDate } from '../utils/dateUtils';

export const useCycles = (user: User | null, period: DashboardPeriod = 'monthly') => {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Initial Fetch
  useEffect(() => {
    let mounted = true;
    if (user) {
      setLoading(true);
      fetchCycles(user.id).then(data => {
        if (mounted) {
          setCycles(data);
          setLoading(false);
        }
      });
    } else {
      setCycles([]);
      setLoading(false);
    }
    return () => { mounted = false; };
  }, [user?.id]); 

  // --- CRUD METHODS ---

  const registerNewCycle = useCallback(async (data: any) => {
    if (!user) return null;
    
    // Perform DB Insert
    const { data: newCycle, error } = await saveCycle(user.id, data);
    
    if (error) {
      throw error; 
    }

    if (newCycle) {
      // Optimistic Update with Integrity Check
      const deposit = Number(newCycle.deposit);
      const withdrawal = Number(newCycle.withdrawal);
      const chest = Number(newCycle.chest);
      const mathProfit = (withdrawal + chest) - deposit;
      
      if (Math.abs(newCycle.profit - mathProfit) > 0.01) {
          newCycle.profit = mathProfit;
      }
      
      const updatedCycles = [newCycle, ...cycles];
      setCycles(updatedCycles);
      
      // RUN AUTOMATIONS & ALERTS IN BATCH (Safe Zone)
      // We collect all alerts and save them in one go to avoid Rate Limits
      setTimeout(() => {
         const autoAlerts = checkAutomations(user, updatedCycles);
         const smartAlerts = checkSmartAlerts(user, updatedCycles);
         const allNewAlerts = [...autoAlerts, ...smartAlerts];
         
         if (allNewAlerts.length > 0) {
            saveAlertsBatch(user.id, allNewAlerts);
         }
      }, 500);
    }
    return newCycle;
  }, [user, cycles]);

  const modifyCycle = useCallback(async (id: string, data: any) => {
    if (!user) return;
    
    const { data: updatedCycle, error } = await updateCycleService(user.id, id, data);
    
    if (error) {
      throw error; 
    }

    if (updatedCycle) {
      setCycles(prev => prev.map(c => c.id === id ? updatedCycle : c));
    }
  }, [user]);

  const removeCycle = useCallback(async (id: string) => {
    if (!user) return;
    
    const previousCycles = [...cycles];
    setCycles(prev => prev.filter(c => c.id !== id));
    
    const { error } = await deleteCycleService(user.id, id);
    if (error) {
        setCycles(previousCycles);
        throw error;
    }
  }, [user, cycles]);

  const reloadCycles = useCallback(async () => {
     if(!user) return;
     const data = await fetchCycles(user.id);
     setCycles(data);
  }, [user]);

  // --- STATS CALCULATION ---
  
  const filteredCycles = useMemo(() => filterCyclesByPeriod(cycles, period), [cycles, period]);
  const dashboardStats = useMemo(() => getDashboardStats(filteredCycles), [filteredCycles]);
  const globalStats = useMemo(() => getDashboardStats(cycles), [cycles]);
  const advancedStats = useMemo(() => getAdvancedStats(filteredCycles), [filteredCycles]);

  const todayCycles = useMemo(() => {
    const todayStr = getLocalDate();
    return cycles
      .filter(c => c.date === todayStr && !c.deletedAt)
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [cycles]);

  const globalAverageProfit = useMemo(() => {
     let sum = 0, count = 0;
     for (const c of cycles) {
         if (c.profit > 0) {
             sum += c.profit;
             count++;
         }
     }
     return count ? sum / count : 0;
  }, [cycles]);

  return {
    cycles,
    filteredCycles,
    todayCycles,
    dashboardStats,
    globalStats,
    advancedStats,
    globalAverageProfit,
    reloadCycles,
    registerNewCycle,
    modifyCycle,
    removeCycle,
    loading
  };
};
