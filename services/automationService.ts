
import { Cycle, User, Alert } from '../types';

/**
 * Checks for automation triggers and returns alerts to be saved.
 * Does NOT call saveAlert directly to allow batching.
 */
export const checkAutomations = (user: User, cycles: Cycle[]): Omit<Alert, 'id' | 'createdAt' | 'readAt'>[] => {
  if (!cycles.length) return [];

  const generatedAlerts: Omit<Alert, 'id' | 'createdAt' | 'readAt'>[] = [];
  
  // Ordena ciclos para pegar o mais recente corretamente
  const sortedCycles = [...cycles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const lastCycle = sortedCycles[0];
  
  const lastCycleTime = lastCycle.createdAt || new Date(lastCycle.date).getTime();
  const hoursSinceLast = (Date.now() - lastCycleTime) / (1000 * 60 * 60);

  // 1. Alerta de Inatividade (24h)
  if (hoursSinceLast > 24) {
      generatedAlerts.push({
        userId: user.id,
        type: 'system',
        message: 'Você não registra operações há mais de 24h.',
        data: { hint: 'A consistência vence o jogo. Registre agora.' }
      });
  }

  // 2. Sugestão de Meta Dinâmica
  if (cycles.length > 5) {
      const totalProfit = cycles.reduce((acc, c) => acc + c.profit, 0);
      const avgProfit = totalProfit / cycles.length;
      
      if (lastCycle.profit > avgProfit * 1.2) {
           generatedAlerts.push({
             userId: user.id,
             type: 'meta',
             message: 'Sua performance subiu! Que tal aumentar sua meta diária?',
             data: { hint: 'Aproveite a boa fase para crescer.' }
           });
      }
  }

  return generatedAlerts;
};

// Legacy support (if needed, but should be replaced)
export const runAutomations = (user: User, cycles: Cycle[]) => {
    // Deprecated in favor of checkAutomations + batch save
};
