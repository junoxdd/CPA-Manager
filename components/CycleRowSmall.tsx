
import React, { useMemo } from 'react';
import { Cycle } from '../types';
import { formatCurrency } from '../utils/formatters';
import { formatTime } from '../utils/dateUtils';
import { getBadgeForCycle } from '../services/cycleService';
import { Trophy, HeartCrack, Clock, ChevronRight } from 'lucide-react';

interface CycleRowSmallProps {
  cycle: Cycle;
  allCycles?: Cycle[];
  preCalculatedAvg?: number;
  isPrivacyMode: boolean;
  onClick: (cycle: Cycle) => void;
}

export const CycleRowSmall: React.FC<CycleRowSmallProps> = ({ 
  cycle, 
  allCycles = [], 
  preCalculatedAvg, 
  isPrivacyMode, 
  onClick 
}) => {
  
  const badge = useMemo(() => {
    return getBadgeForCycle(cycle, preCalculatedAvg);
  }, [cycle, preCalculatedAvg]);

  const isProfit = cycle.profit >= 0;
  const hasTags = cycle.tags && cycle.tags.length > 0;

  return (
    <div 
      onClick={() => onClick(cycle)}
      className="group flex items-center justify-between p-3 bg-white/5 border-b border-white/5 last:border-0 hover:bg-white/10 cursor-pointer transition-all duration-200 active:scale-[0.99]"
    >
      <div className="flex items-center gap-3">
        <div className={`flex flex-col items-center justify-center w-10 h-10 rounded-lg border transition-colors ${isProfit ? 'bg-profit/10 border-profit/20' : 'bg-loss/10 border-loss/20'}`}>
           {badge ? (
             badge.type === 'high_profit' ? <Trophy size={16} className="text-gold" /> : <HeartCrack size={16} className="text-loss" />
           ) : (
             <Clock size={16} className={isProfit ? "text-profit/70" : "text-loss/70"} />
           )}
        </div>
        <div>
          <div className="flex items-center gap-2">
             <span className="text-sm font-bold text-white">{cycle.platform}</span>
             {badge && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${badge.type === 'high_profit' ? 'bg-gold/10 text-gold' : 'bg-loss/10 text-loss'}`}>
                    {badge.label}
                </span>
             )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-mono text-secondary flex items-center gap-1">
                {formatTime(cycle.createdAt)}
            </span>
            {hasTags && (
                <div className="flex gap-1">
                    {cycle.tags!.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[9px] text-primary/80 bg-primary/10 px-1 rounded">#{tag}</span>
                    ))}
                    {cycle.tags!.length > 2 && <span className="text-[9px] text-secondary">+{cycle.tags!.length - 2}</span>}
                </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
           <span className={`block text-sm font-bold font-mono ${cycle.profit >= 0 ? 'text-profit' : 'text-loss'} ${isPrivacyMode ? 'blur-[4px]' : ''}`}>
             {formatCurrency(cycle.profit, isPrivacyMode)}
           </span>
        </div>
        <ChevronRight size={14} className="text-secondary/50 group-hover:text-white transition-colors" />
      </div>
    </div>
  );
};
