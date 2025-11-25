
import { Cycle, Alert, User } from '../types';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Helper to get alerts is now primarily via the User context in React or Metadata
export const getAlerts = (userId: string): Alert[] => {
    return []; 
};

/**
 * Saves a batch of alerts by storing them inside user_metadata.
 * Replaces individual saveAlert calls to prevent Rate Limit errors.
 */
export const saveAlertsBatch = async (userId: string, newAlertsData: Omit<Alert, 'id' | 'createdAt' | 'readAt'>[]) => {
  if (newAlertsData.length === 0) return;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const currentAlerts: Alert[] = user.user_metadata?.alerts || [];
    const timestamp = Date.now();

    // Create full alert objects
    const createdAlerts: Alert[] = newAlertsData.map(a => ({
        id: uuidv4(),
        createdAt: timestamp,
        readAt: null,
        ...a
    }));

    // Filter duplicates based on message and time (24h debounce) to avoid spam
    const uniqueNewAlerts = createdAlerts.filter(newA => {
        const duplicate = currentAlerts.find(existing => 
            existing.type === newA.type && 
            existing.message === newA.message && 
            (timestamp - existing.createdAt < 24 * 60 * 60 * 1000)
        );
        return !duplicate;
    });

    if (uniqueNewAlerts.length === 0) return;

    // Merge and limit to 50 alerts
    const updatedAlerts = [...uniqueNewAlerts, ...currentAlerts].slice(0, 50);

    const { error } = await supabase.auth.updateUser({
      data: { alerts: updatedAlerts }
    });

    if (error) console.error("Failed to save alerts batch", error);
    
  } catch (error) {
    console.error("Failed to save alerts", error);
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

/**
 * Generates smart alerts based on user data but DOES NOT save them directly.
 * Returns the alerts so they can be batched.
 */
export const checkSmartAlerts = (user: User, cycles: Cycle[]): Omit<Alert, 'id' | 'createdAt' | 'readAt'>[] => {
  if (!user || !cycles.length) return [];

  const generatedAlerts: Omit<Alert, 'id' | 'createdAt' | 'readAt'>[] = [];
  const todayStr = new Date().toISOString().split('T')[0];
  
  // 1. Inactivity
  const lastCycle = cycles[0]; 
  if (lastCycle) {
    const lastDate = new Date(lastCycle.createdAt).getTime();
    const hoursDiff = (Date.now() - lastDate) / (1000 * 60 * 60);
    if (hoursDiff > 48) {
        generatedAlerts.push({ userId: user.id, type: 'performance', message: 'Você não registra operações há 2 dias.', data: { hint: 'Consistência > Sorte' } });
    }
  }

  // 2. Risk
  if (cycles.length >= 3) {
    const last3 = cycles.slice(0, 3);
    const allLosses = last3.every(c => c.profit < 0);
    if (allLosses) {
        generatedAlerts.push({ userId: user.id, type: 'risco', message: 'Alerta de Risco: 3 prejuízos seguidos.', data: { hint: 'Pare por hoje.' } });
    }
  }

  // 3. Performance
  const dailyProfit = cycles.filter(c => c.date === todayStr).reduce((sum, c) => sum + c.profit, 0);
  if (dailyProfit > 500) {
      generatedAlerts.push({ userId: user.id, type: 'meta', message: `Dia excelente! Lucro de R$ ${dailyProfit.toFixed(2)} hoje.`, data: { hint: 'Proteja seu lucro.' } });
  }

  return generatedAlerts;
};

export const generateSmartAlerts = async (user: User, cycles: Cycle[]) => {
  const alerts = checkSmartAlerts(user, cycles);
  if (alerts.length > 0) {
    await saveAlertsBatch(user.id, alerts);
  }
};
