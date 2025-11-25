
import React, { useMemo } from 'react';
import { Cycle } from '../types';
import { getPlatformStats } from '../services/cycleService';
import { Trophy, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface PlatformRankingProps {
  cycles: Cycle[];
  isPrivacyMode: boolean;
}

export const PlatformRanking: React.FC<PlatformRankingProps> = ({ cycles, isPrivacyMode }) => {
  const { topWinners, topLosers } = useMemo(() => getPlatformStats(cycles), [cycles]);

  if (topWinners.length === 0 && topLosers.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {/* Winners */}
      <div className="glass p-5 border-t border-border bg-surface/50">
        <h3 className="text-sm font-bold text-profit mb-4 uppercase tracking-widest flex items-center gap-2">
          <Trophy size={16} /> Minas de Ouro
        </h3>
        <div className="space-y-4">
          {topWinners.map((stat, idx) => (
            <div key={idx} className="relative group">
              <div className="flex justify-between items-end mb-1 text-xs">
                <span className="font-bold text-foreground">{stat.name}</span>
                <div className="text-right">
                   <span className="block font-mono text-profit font-bold">{formatCurrency(stat.totalProfit, isPrivacyMode)}</span>
                   <span className="text-[10px] text-secondary">Ciclos Lucrativos: {stat.winRate.toFixed(0)}%</span>
                </div>
              </div>
              <div className="h-1.5 w-full bg-surfaceHighlight overflow-hidden">
                 <div className="h-full bg-profit shadow-[0_0_10px_var(--profit)]" style={{ width: `${Math.min(100, (stat.totalProfit / topWinners[0].totalProfit) * 100)}%` }}></div>
              </div>
            </div>
          ))}
          {topWinners.length === 0 && <p className="text-xs text-secondary italic">Nenhuma plataforma lucrativa ainda.</p>}
        </div>
      </div>

      {/* Losers */}
      <div className="glass p-5 border-t border-border bg-surface/50">
        <h3 className="text-sm font-bold text-loss mb-4 uppercase tracking-widest flex items-center gap-2">
          <AlertTriangle size={16} /> Zona de Risco
        </h3>
        <div className="space-y-4">
          {topLosers.map((stat, idx) => (
            <div key={idx} className="relative group">
              <div className="flex justify-between items-end mb-1 text-xs">
                <span className="font-bold text-foreground">{stat.name}</span>
                 <div className="text-right">
                   <span className="block font-mono text-loss font-bold">{formatCurrency(stat.totalProfit, isPrivacyMode)}</span>
                   <span className="text-[10px] text-secondary">{stat.count} Operações</span>
                </div>
              </div>
              <div className="h-1.5 w-full bg-surfaceHighlight overflow-hidden">
                 <div className="h-full bg-loss shadow-[0_0_10px_var(--loss)]" style={{ width: `${Math.min(100, (Math.abs(stat.totalProfit) / Math.abs(topLosers[0].totalProfit)) * 100)}%` }}></div>
              </div>
            </div>
          ))}
          {topLosers.length === 0 && <p className="text-xs text-secondary italic">Nenhum prejuízo considerável.</p>}
        </div>
      </div>
    </div>
  );
};
