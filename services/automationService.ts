import { Cycle, User, Alert } from '../types';
import { saveAlert } from './alertService';

export const runAutomations = (user: User, cycles: Cycle[]) => {
  if (!cycles.length) return;

  // Uses hydrated alerts from User object instead of fetching
  const alerts = user.alerts || [];
  
  // Ordena ciclos para pegar o mais recente corretamente
  const sortedCycles = [...cycles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const lastCycle = sortedCycles[0];
  
  const lastCycleTime = lastCycle.createdAt || new Date(lastCycle.date).getTime();
  const hoursSinceLast = (Date.now() - lastCycleTime) / (1000 * 60 * 60);

  // 1. Alerta de Inatividade (24h)
  if (hoursSinceLast > 24) {
    const hasAlert = alerts.some(a => a.type === 'system' && a.message.includes('24h') && !a.readAt);
    if (!hasAlert) {
      saveAlert(user.id, {
        userId: user.id,
        type: 'system',
        message: 'Você não registra operações há mais de 24h.',
        data: { hint: 'A consistência vence o jogo. Registre agora.' }
      });
    }
  }

  // 2. Sugestão de Meta Dinâmica
  // Se o lucro do último ciclo foi 20% maior que a média geral
  if (cycles.length > 5) {
      const totalProfit = cycles.reduce((acc, c) => acc + c.profit, 0);
      const avgProfit = totalProfit / cycles.length;
      
      if (lastCycle.profit > avgProfit * 1.2) {
         const hasGoalAlert = alerts.some(a => a.type === 'meta' && a.message.includes('Meta Dinâmica'));
         if (!hasGoalAlert) {
           saveAlert(user.id, {
             userId: user.id,
             type: 'meta',
             message: 'Sua performance subiu! Que tal aumentar sua meta diária?',
             data: { hint: 'Aproveite a boa fase para crescer.' }
           });
         }
      }
  }
};