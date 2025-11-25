
import { DashboardPeriod } from '../types';

export interface AiLogEntry {
  id: string;
  timestamp: number;
  type: 'insight' | 'alert' | 'pattern_detection';
  period: DashboardPeriod;
  content: string;
  contextData?: any;
}

const LOG_KEY = 'cpa_ai_internal_logs';

// Sistema de logs interno da IA (Memória)
export const aiLogger = {
  log: (type: AiLogEntry['type'], period: DashboardPeriod, content: string, contextData?: any) => {
    try {
      const entry: AiLogEntry = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        timestamp: Date.now(),
        type,
        period,
        content,
        contextData
      };

      const currentLogs = aiLogger.getLogs();
      // Mantém apenas os últimos 50 logs para não pesar o storage
      const updatedLogs = [entry, ...currentLogs].slice(0, 50);
      
      localStorage.setItem(LOG_KEY, JSON.stringify(updatedLogs));
      return entry;
    } catch (e) {
      console.warn('Falha ao registrar log da IA', e);
      return null;
    }
  },

  getLogs: (): AiLogEntry[] => {
    try {
      const stored = localStorage.getItem(LOG_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  getLastInsight: (period: DashboardPeriod): AiLogEntry | undefined => {
    const logs = aiLogger.getLogs();
    return logs.find(l => l.type === 'insight' && l.period === period);
  },

  clear: () => {
    localStorage.removeItem(LOG_KEY);
  }
};
