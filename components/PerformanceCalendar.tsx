
import React, { useMemo, useState } from 'react';
import { Cycle } from '../types';
import { Tooltip } from './Tooltip';
import { formatCurrency } from '../utils/formatters';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { CycleRowSmall } from './CycleRowSmall';

interface PerformanceCalendarProps {
  cycles: Cycle[];
  isPrivacyMode: boolean;
}

// Optimization: Memoize Day Cell to prevent re-rendering all 30 days when one changes
const DayCell = React.memo(({ day, profit, hasData, isSelected, onClick, isPrivacyMode }: any) => {
  const getDayClass = (p: number) => {
    if (p === 0) return 'bg-white/5 border-white/5 text-secondary hover:bg-white/10';
    if (p < 0) return 'bg-loss/20 text-loss border-loss/30 hover:bg-loss/30';
    if (p < 200) return 'bg-profit/20 text-profit border-profit/20 hover:bg-profit/30';
    if (p < 1000) return 'bg-profit/40 text-profit border-profit/30 hover:bg-profit/50';
    return 'bg-profit text-black font-bold border-profit shadow-[0_0_10px_var(--profit)] hover:opacity-90';
  };

  return (
    <Tooltip text={hasData ? `${formatCurrency(profit, isPrivacyMode)}` : `Dia ${day}: Sem registros`}>
      <button 
        onClick={onClick}
        className={`
            w-full aspect-square flex items-center justify-center border transition-all rounded-lg relative
            ${isSelected ? 'ring-2 ring-white scale-105 z-10' : ''}
            ${hasData ? getDayClass(profit) : 'bg-white/5 border-white/5 text-secondary/30 hover:bg-white/10'}
        `}
      >
        <span className="text-xs font-mono">{day}</span>
        {hasData && (
            <div className={`absolute bottom-1 w-1 h-1 rounded-full ${profit >= 0 ? 'bg-current' : 'bg-loss'}`}></div>
        )}
      </button>
    </Tooltip>
  );
});

export const PerformanceCalendar: React.FC<PerformanceCalendarProps> = ({ cycles, isPrivacyMode }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const daysInMonth = useMemo(() => new Date(currentYear, currentMonth + 1, 0).getDate(), [currentYear, currentMonth]);
  const firstDayOfWeek = useMemo(() => new Date(currentYear, currentMonth, 1).getDay(), [currentYear, currentMonth]); // 0 = Sunday

  // Group cycles by date string YYYY-MM-DD - Heavily Memoized
  const cyclesByDate = useMemo(() => {
      const map = new Map<string, Cycle[]>();
      cycles.forEach(c => {
          const existing = map.get(c.date) || [];
          existing.push(c);
          map.set(c.date, existing);
      });
      return map;
  }, [cycles]);

  // Helper to get date string for current view's day
  const getDateStr = (day: number) => {
      return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const changeMonth = (offset: number) => {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() + offset);
      setCurrentDate(newDate);
      setSelectedDay(null);
  };

  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  const selectedCycles = useMemo(() => selectedDay ? cyclesByDate.get(selectedDay) || [] : [], [selectedDay, cyclesByDate]);

  return (
    <div className="space-y-4">
        <div className="glass p-5 border-t border-border bg-surface/50 transition-all duration-300">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest opacity-80">
                <span>Performance: <span className="text-primary capitalize">{monthName}</span></span>
            </h3>
            <div className="flex items-center gap-2">
                <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-white/10 rounded text-secondary"><ChevronLeft size={18}/></button>
                <button onClick={() => changeMonth(1)} className="p-1 hover:bg-white/10 rounded text-secondary"><ChevronRight size={18}/></button>
            </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="text-center text-[10px] font-bold text-secondary uppercase py-2">
                {day}
            </div>
            ))}

            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square bg-transparent" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = getDateStr(day);
            const dayCycles = cyclesByDate.get(dateStr) || [];
            const profit = dayCycles.reduce((sum, c) => sum + c.profit, 0);
            const hasData = dayCycles.length > 0;
            const isSelected = selectedDay === dateStr;
            
            return (
               <DayCell 
                 key={day}
                 day={day}
                 profit={profit}
                 hasData={hasData}
                 isSelected={isSelected}
                 isPrivacyMode={isPrivacyMode}
                 onClick={() => setSelectedDay(isSelected ? null : dateStr)}
               />
            );
            })}
        </div>
        
        {/* Interactive Day Details */}
        {selectedDay && (
            <div className="mt-4 animate-slide-up">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/5">
                    <h4 className="text-xs font-bold text-white uppercase">
                        Detalhes de {new Date(selectedDay).toLocaleDateString('pt-BR')}
                    </h4>
                    <button onClick={() => setSelectedDay(null)} className="text-secondary hover:text-white"><X size={14}/></button>
                </div>
                
                {selectedCycles.length > 0 ? (
                    <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto custom-scrollbar">
                        {selectedCycles.map(cycle => (
                            <div key={cycle.id} className="pointer-events-none"> 
                                <CycleRowSmall 
                                    cycle={cycle} 
                                    isPrivacyMode={isPrivacyMode} 
                                    onClick={() => {}} 
                                />
                            </div>
                        ))}
                        <div className="mt-2 text-right text-xs font-bold text-white border-t border-white/5 pt-2">
                            Total do Dia: <span className={selectedCycles.reduce((s,c)=>s+c.profit,0) >= 0 ? 'text-profit' : 'text-loss'}>
                                {formatCurrency(selectedCycles.reduce((s,c)=>s+c.profit,0), isPrivacyMode)}
                            </span>
                        </div>
                    </div>
                ) : (
                    <p className="text-xs text-secondary text-center py-2">Nenhuma operação registrada neste dia.</p>
                )}
            </div>
        )}
        </div>
    </div>
  );
};
