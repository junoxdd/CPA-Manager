
import React, { useMemo } from 'react';
import { Cycle } from '../types';
import { formatCurrency } from '../utils/formatters';
import { formatTime } from '../utils/dateUtils';
import { getBadgeForCycle } from '../services/cycleService';
import { Trophy, HeartCrack, ChevronRight } from 'lucide-react';

interface CycleRowTodayProps {
  cycle: Cycle;
  allCycles?: Cycle[]; // Optional if preCalculatedAvg is provided
  preCalculatedAvg?: number; // Optimization
  isPrivacyMode: boolean;
  cycleNumber: number;
  onClick: (cycle: Cycle) => void;
}

export const CycleRowToday: React.FC<CycleRowTodayProps> = ({ 
  cycle, 
  allCycles = [], 
  preCalculatedAvg, 
  isPrivacyMode, 
  cycleNumber, 
  onClick 
}) => {
  
  // Use pre-calculated average if available to avoid O(N) lookup inside map
  const badge = useMemo(() => {
    return getBadgeForCycle(cycle, preCalculatedAvg);
  }, [cycle, preCalculatedAvg]);

  const isProfit = cycle.profit >= 0;
  const displayName = `Ciclo ${cycleNumber}`;

  return (
    <div
      onClick={() => onClick(cycle)}
      className="group flex items-center justify-between py-3 px-3 border-b border-white/5 last:border-0 hover:bg-white/[0.03] cursor-pointer transition-all duration-200 rounded-lg"
    >
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-mono text-secondary/60 min-w-[32px]">
          {formatTime(cycle.createdAt)}
        </span>

        <div className="flex items-center gap-2.5">
           <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_6px] ${isProfit ? 'bg-profit shadow-profit/40' : 'bg-loss shadow-loss/40'}`}></div>

           <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
             {displayName}
           </span>

           {badge && (
             <div className="opacity-70 group-hover:opacity-100 transition-opacity transform scale-90">
                {badge.type === 'high_profit' ? <Trophy size={12} className="text-gold" /> : <HeartCrack size={12} className="text-loss" />}
             </div>
           )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className={`text-sm font-bold font-mono tracking-tight ${isProfit ? 'text-profit' : 'text-loss'} ${isPrivacyMode ? 'blur-[4px]' : ''}`}>
          {formatCurrency(cycle.profit, isPrivacyMode)}
        </span>
        <ChevronRight size={14} className="text-white/10 group-hover:text-white/50 transition-colors" />
      </div>
    </div>
  );
};
