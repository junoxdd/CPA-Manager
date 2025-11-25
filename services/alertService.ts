import { Cycle, Alert, User } from '../types';
import { supabase } from '../lib/supabase';

// Helper to get alerts is now primarily via the User context in React or Metadata
export const getAlerts = (userId: string): Alert[] => {
    return []; 
};

/**
 * Saves an alert by storing it inside user_metadata.
 */
export const saveAlert = async (userId: string, alertData: Omit<Alert, 'id' | 'createdAt' | 'readAt'>) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const currentAlerts: Alert[] = user.user_metadata?.alerts || [];
    
    const newAlert: Alert = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        readAt: null,
        ...alertData
    };

    const updatedAlerts = [newAlert, ...currentAlerts].slice(0, 50);

    const { error } = await supabase.auth.updateUser({
      data: { alerts: updatedAlerts }
    });

    if (error) console.error("Failed to save alert to metadata", error);
    
  } catch (error) {
    console.error("Failed to save alert", error);
  }
};

export const markAlertRead = async (userId: string, alertId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const currentAlerts: Alert[] = user.user_metadata?.alerts || [];
  const updatedAlerts = currentAlerts.map(a => a.id === alertId ? { ...a, readAt: Date.now() } : a);
  
  await supabase.auth.updateUser({
    data: { alerts: updatedAlerts }
  });
};

export const deleteAlert = async (userId: string, alertId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const currentAlerts: Alert[] = user.user_metadata?.alerts || [];
  const updatedAlerts = currentAlerts.filter(a => a.id !== alertId);

  await supabase.auth.updateUser({
    data: { alerts: updatedAlerts }
  });
};

export const generateSmartAlerts = async (user: User, cycles: Cycle[]) => {
  if (!user || !cycles.length) return;

  const alerts = user.alerts || [];
  const todayStr = new Date().toISOString().split('T')[0];
  
  // 1. Inactivity
  const lastCycle = cycles[0]; 
  if (lastCycle) {
    const lastDate = new Date(lastCycle.createdAt).getTime();
    const hoursDiff = (Date.now() - lastDate) / (1000 * 60 * 60);
    if (hoursDiff > 48) {
      const hasInactivityAlert = alerts.some(a => a.type === 'performance' && a.createdAt > Date.now() - 86400000);
      if (!hasInactivityAlert) {
        await saveAlert(user.id, { userId: user.id, type: 'performance', message: 'Você não registra operações há 2 dias.', data: { hint: 'Consistência > Sorte' } });
      }
    }
  }

  // 2. Risk
  if (cycles.length >= 3) {
    const last3 = cycles.slice(0, 3);
    const allLosses = last3.every(c => c.profit < 0);
    if (allLosses) {
      const hasRiskAlert = alerts.some(a => a.type === 'risco' && a.createdAt > Date.now() - 43200000);
      if (!hasRiskAlert) {
        await saveAlert(user.id, { userId: user.id, type: 'risco', message: 'Alerta de Risco: 3 prejuízos seguidos.', data: { hint: 'Pare por hoje.' } });
      }
    }
  }

  // 3. Performance
  const dailyProfit = cycles.filter(c => c.date === todayStr).reduce((sum, c) => sum + c.profit, 0);
  if (dailyProfit > 500) {
     const hasGoodDayAlert = alerts.some(a => a.type === 'meta' && a.message.includes('Dia excelente'));
     if (!hasGoodDayAlert) {
        await saveAlert(user.id, { userId: user.id, type: 'meta', message: `Dia excelente! Lucro de R$ ${dailyProfit.toFixed(2)} hoje.`, data: { hint: 'Proteja seu lucro.' } });
     }
  }
};