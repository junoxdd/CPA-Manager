
import React, { useMemo } from 'react';
import { DashboardStats, AdvancedStats, Cycle, DashboardPeriod } from '../types';
import { StatsCard } from './StatsCard';
import { Activity, Ghost, TrendingUp, Clock, Calendar, AlertTriangle, Crosshair, Plus } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { CycleRowToday } from './CycleRowToday';

interface DashboardHighlightsProps {
  stats: DashboardStats;
  advancedStats: AdvancedStats;
  isPrivacyMode: boolean;
  dashboardPeriod: DashboardPeriod;
  stopLossLimit?: number;
  todayCycles?: Cycle[];
  onEditCycle?: (cycle: Cycle) => void;
  onNewCycle?: () => void;
  allCycles?: Cycle[];
}

const DashboardHighlightsComponent: React.FC<DashboardHighlightsProps> = ({ 
  stats, advancedStats, isPrivacyMode, dashboardPeriod, stopLossLimit,
  todayCycles, onEditCycle, onNewCycle, allCycles
}) => {
  
  const isDaily = dashboardPeriod === 'daily';
  const isWeekly = dashboardPeriod === 'weekly';
  const isMonthly = dashboardPeriod === 'monthly';
  const isAll = dashboardPeriod === 'all';
  
  // Stop Loss Logic (Only relevant for Daily)
  const isStopLossTriggered = useMemo(() => {
     return isDaily && stopLossLimit !== undefined && stats.dailyProfit <= -stopLossLimit;
  }, [isDaily, stopLossLimit, stats.dailyProfit]);

  // Average Profit Calc for Badges
  const averageProfit = useMemo(() => {
      if (!allCycles || allCycles.length === 0) return 0;
      const profits = allCycles.filter(c => c.profit > 0).map(c => c.profit);
      return profits.length > 0 ? profits.reduce((a,b) => a+b, 0) / profits.length : 0;
  }, [allCycles]);

  return (
    <div className={`space-y-6 transition-all duration-500 animate-fade-in ${isStopLossTriggered ? 'p-4 border-2 border-loss bg-loss/5 rounded-xl shadow-[0_0_30px_rgba(251,113,133,0.2)] animate-pulse-slow' : ''}`}>
      
      {isStopLossTriggered && (
          <div className="flex items-center justify-center gap-2 text-loss font-bold text-sm uppercase tracking-widest mb-2 animate-pulse">
              <AlertTriangle size={16} /> Stop Loss Atingido! Pare de operar.
          </div>
      )}

      {/* DYNAMIC GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CARD 1: MAIN PROFIT (Always Visible) */}
        <div className="relative group lg:col-span-2">
            <StatsCard 
              title={`Lucro (${isDaily ? 'Hoje' : isWeekly ? 'Esta Semana' : isMonthly ? 'Este Mês' : 'Total Geral'})`}
              value={isDaily ? stats.dailyProfit : isWeekly ? stats.weeklyProfit : isMonthly ? stats.monthlyProfit : stats.totalProfit} 
              type="profit" 
              icon="chart"
              isPrivacyMode={isPrivacyMode}
              trend={advancedStats.trend}
            />
            
            {/* Ghost Mode (Daily Only) */}
            {isDaily && (
                <div className="absolute bottom-4 right-4 text-[10px] font-mono text-secondary opacity-60 flex items-center gap-1 pointer-events-none">
                    <Ghost size={10} />
                    Ontem: {formatCurrency(stats.yesterdayProfit, isPrivacyMode)}
                </div>
            )}
        </div>

        {/* CARD 2: DYNAMIC CONTEXT */}
        {isDaily ? (
             // DAILY: Show Today's Count/Volume instead of projection
             <div className="glass p-5 flex flex-col justify-between bg-surface/50 border border-white/5">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-secondary text-xs font-bold uppercase tracking-widest opacity-80">Volume Hoje</span>
                    <Crosshair size={16} className="text-primary"/>
                </div>
                <div className="flex items-end gap-2">
                    <span className={`text-2xl font-mono font-bold text-white ${isPrivacyMode ? 'blur-sm' : ''}`}>
                        {todayCycles?.length || 0} <span className="text-sm text-secondary font-normal">Ciclos</span>
                    </span>
                </div>
                <div className="text-[10px] text-secondary mt-1 flex gap-2">
                    <span className="text-profit">Win: {todayCycles?.filter(c => c.profit > 0).length || 0}</span>
                    <span className="text-loss">Loss: {todayCycles?.filter(c => c.profit < 0).length || 0}</span>
                </div>
             </div>
        ) : isWeekly ? (
             // WEEKLY: Show Average Profit per Day
             <div className="glass p-5 flex flex-col justify-between bg-surface/50 border border-white/5">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-secondary text-xs font-bold uppercase tracking-widest opacity-80">Média Diária</span>
                    <Calendar size={16} className="text-[#00FF88]"/>
                </div>
                <div className="flex items-end gap-2">
                    <span className={`text-2xl font-mono font-bold text-white ${isPrivacyMode ? 'blur-sm' : ''}`}>
                         {formatCurrency(stats.weeklyProfit / 7, isPrivacyMode)}
                    </span>
                </div>
                <span className="text-[9px] text-secondary mt-1">Estimativa últimos 7 dias</span>
             </div>
        ) : (
             // MONTHLY OR ALL: Show Projection
             <div className="glass p-5 flex flex-col justify-between bg-surface/50 border border-white/5 transition-all hover:border-primary/20 group">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-secondary text-xs font-bold uppercase tracking-widest opacity-80 group-hover:text-primary transition-colors">Projeção (Mês)</span>
                    <TrendingUp size={16} className="text-primary"/>
                </div>
                <div className="flex items-end gap-2">
                    <span className={`text-2xl font-mono font-bold ${stats.projectedProfit && stats.projectedProfit >= 0 ? 'text-primary' : 'text-loss'} ${isPrivacyMode ? 'blur-sm' : ''}`}>
                        {formatCurrency(stats.projectedProfit || 0, isPrivacyMode)}
                    </span>
                </div>
                <span className="text-[9px] text-secondary mt-1">Baseado na média atual</span>
            </div>
        )}
        
        {/* CARD 3: WIN RATE (Always Visible but contextual data could change in future) */}
        <div className="glass p-5 flex flex-col justify-between bg-surface/50 transition-all hover:border-gold/20 group">
          <div className="flex justify-between items-start mb-2">
             <span className="text-secondary text-xs font-bold uppercase tracking-widest opacity-80 group-hover:text-gold transition-colors">Taxa de Acerto</span>
             <Activity size={16} className="text-gold"/>
          </div>
          <div className="flex items-end gap-2">
             <span className={`text-2xl font-mono font-bold ${advancedStats.winRate >= 50 ? 'text-profit' : 'text-loss'}`}>{advancedStats.winRate.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-surfaceHighlight h-1.5 mt-3 overflow-hidden rounded-full">
             <div className={`h-full ${advancedStats.winRate >= 50 ? 'bg-profit' : 'bg-loss'}`} style={{ width: `${advancedStats.winRate}%` }}></div>
          </div>
        </div>
      </div>

      {/* LIST SECTION: Dynamic based on view */}
      {isDaily ? (
          <div className="glass bg-surface/30 border border-white/5 rounded-xl overflow-hidden animate-slide-up">
             <div className="px-5 py-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded text-primary">
                        <Clock size={14} />
                    </div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest">Linha do Tempo (Hoje)</h3>
                </div>
                
                <div className="flex items-center gap-3">
                    {todayCycles && todayCycles.length > 0 && (
                        <span className="text-[10px] font-bold px-2 py-1 bg-white/5 rounded-full text-secondary border border-white/5">
                            {todayCycles.length}
                        </span>
                    )}
                    <button 
                        onClick={onNewCycle}
                        className="w-7 h-7 flex items-center justify-center bg-primary hover:bg-primaryGlow text-white rounded-lg shadow-neon-primary transition-all active:scale-95"
                    >
                        <Plus size={16} strokeWidth={3} />
                    </button>
                </div>
             </div>
             
             <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                {todayCycles && todayCycles.length > 0 ? (
                    <div className="flex flex-col gap-1">
                        {todayCycles.map((cycle, index) => (
                            <CycleRowToday 
                                key={cycle.id}
                                cycle={cycle}
                                preCalculatedAvg={averageProfit}
                                isPrivacyMode={isPrivacyMode}
                                cycleNumber={todayCycles.length - index} // Reverse count visual
                                onClick={onEditCycle || (() => {})}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="py-10 text-center flex flex-col items-center gap-3">
                       <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-secondary/30 border border-white/5">
                           <Calendar size={24} />
                       </div>
                       <div>
                           <p className="text-sm font-medium text-gray-400">Nenhum ciclo hoje</p>
                           <p className="text-xs text-secondary/50 mt-1">Suas operações do dia aparecerão aqui.</p>
                       </div>
                    </div>
                )}
             </div>
          </div>
      ) : (
          /* For Weekly/Monthly we show specific charts in the Performance Component, not a list here */
          <div className="hidden"></div>
      )}

    </div>
  );
};

export const DashboardHighlights = React.memo(DashboardHighlightsComponent);
