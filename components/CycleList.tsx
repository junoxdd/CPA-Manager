
import React, { useState, useMemo } from 'react';
import { Cycle, DashboardPeriod } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { filterCyclesByPeriod, getBadgeForCycle } from '../services/cycleService';
import { Tooltip } from './Tooltip';
import { Pencil, Trash2, Filter, Copy, Trophy, HeartCrack } from 'lucide-react';
import { CycleRowSmall } from './CycleRowSmall'; // Re-use component for mobile consistency

interface CycleListProps {
  cycles: Cycle[];
  onEdit: (cycle: Cycle) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (cycle: Cycle) => void;
  isPrivacyMode?: boolean;
  isPro: boolean;
  onUpgrade: () => void;
}

export const CycleList: React.FC<CycleListProps> = ({ 
  cycles, onEdit, onDelete, onDuplicate, isPrivacyMode = false, isPro, onUpgrade 
}) => {
  const [visibleCount, setVisibleCount] = useState(20);
  const [historyPeriod, setHistoryPeriod] = useState<DashboardPeriod>('all');

  const filteredCycles = useMemo(() => {
    return filterCyclesByPeriod(cycles, historyPeriod);
  }, [cycles, historyPeriod]);

  // Pagination slice
  const visibleCycles = useMemo(() => filteredCycles.slice(0, visibleCount), [filteredCycles, visibleCount]);
  const hasMore = filteredCycles.length > visibleCount;

  // Calculate average once for the entire list to avoid O(N^2) behavior in rows
  const averageProfit = useMemo(() => {
     if (cycles.length === 0) return 0;
     const profits = cycles.filter(c => c.profit > 0).map(c => c.profit);
     return profits.length ? profits.reduce((a,b) => a+b, 0) / profits.length : 0;
  }, [cycles]);

  const filters: { key: DashboardPeriod; label: string }[] = [
    { key: 'daily', label: 'Diário' },
    { key: 'weekly', label: '7 Dias' },
    { key: 'monthly', label: '30 Dias' },
    { key: 'all', label: 'Todos' },
  ];

  // Helper for desktop table badges
  const renderBadge = (cycle: Cycle) => {
    const badge = getBadgeForCycle(cycle, averageProfit);
    if (!badge) return null;
    
    if (badge.type === 'high_profit') {
        return <Tooltip text={badge.label}><Trophy size={14} className="text-gold" /></Tooltip>;
    }
    if (badge.type === 'loss') {
        return <Tooltip text={badge.label}><HeartCrack size={14} className="text-loss" /></Tooltip>;
    }
    return null;
  };

  return (
    <div className="space-y-4 pb-10">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
        <div className="flex items-center gap-2 text-secondary text-xs font-bold uppercase tracking-widest">
           <Filter size={14} />
           <span>Filtros</span>
        </div>
        <div className="flex bg-black/30 p-1 rounded-lg">
           {filters.map(f => (
              <button
                key={f.key}
                onClick={() => { setHistoryPeriod(f.key); setVisibleCount(20); }}
                className={`px-3 py-1.5 text-[10px] sm:text-xs font-bold uppercase rounded transition-all ${
                  historyPeriod === f.key 
                    ? 'bg-primary text-white shadow-lg' 
                    : 'text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                {f.label}
              </button>
           ))}
        </div>
      </div>

      {filteredCycles.length === 0 && (
         <div className="p-8 text-center glass bg-surface/50">
            <p className="text-secondary text-sm">Nenhum registro encontrado para este período.</p>
         </div>
      )}

      {/* Mobile View */}
      <div className="md:hidden space-y-3">
        {visibleCycles.map(c => (
           <div key={c.id} className="glass p-0 overflow-hidden bg-surface/50 border-l-4 border-l-primary">
              <CycleRowSmall 
                cycle={c}
                isPrivacyMode={isPrivacyMode}
                onClick={() => onEdit(c)}
                preCalculatedAvg={averageProfit}
              />
              {/* Quick Actions Footer for Mobile */}
              <div className="bg-black/20 p-2 flex justify-end gap-3 border-t border-white/5">
                <button onClick={(e) => { e.stopPropagation(); onDuplicate && onDuplicate(c); }} className="text-[10px] text-secondary hover:text-white flex items-center gap-1"><Copy size={12}/> Duplicar</button>
                <button onClick={(e) => { e.stopPropagation(); onDelete && onDelete(c.id); }} className="text-[10px] text-secondary hover:text-loss flex items-center gap-1"><Trash2 size={12}/> Excluir</button>
              </div>
           </div>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block glass overflow-hidden bg-surface/50">
        <table className="w-full">
           <thead className="bg-white/5 text-secondary text-xs uppercase">
             <tr>
               <th className="p-4 text-left">Data</th>
               <th className="p-4 text-left">Plataforma</th>
               <th className="p-4 text-right text-profit">Entrada</th>
               <th className="p-4 text-right text-loss">Saída</th>
               <th className="p-4 text-right text-gold">Baú</th>
               <th className="p-4 text-right">Lucro</th>
               <th className="p-4 text-center">Ações</th>
             </tr>
           </thead>
           <tbody>
             {visibleCycles.map(c => (
               <tr key={c.id} className="border-t border-white/5 hover:bg-white/5 transition-colors group">
                 <td className="p-4 font-mono text-sm text-gray-300">{formatDate(c.date)}</td>
                 <td className="p-4 text-sm font-bold text-white flex items-center gap-2">
                     {c.platform}
                     {renderBadge(c)}
                 </td>
                 <td className="p-4 text-right font-mono text-xs text-secondary">{formatCurrency(c.deposit, isPrivacyMode)}</td>
                 <td className="p-4 text-right font-mono text-xs text-secondary">{formatCurrency(c.withdrawal, isPrivacyMode)}</td>
                 <td className="p-4 text-right font-mono text-xs text-gold">{c.chest > 0 ? formatCurrency(c.chest, isPrivacyMode) : '-'}</td>
                 <td className={`p-4 text-right font-bold font-mono ${c.profit >= 0 ? 'text-profit' : 'text-loss'}`}>
                   {formatCurrency(c.profit, isPrivacyMode)}
                 </td>
                 <td className="p-4 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Tooltip text="Duplicar"><button onClick={() => onDuplicate && onDuplicate(c)} className="p-1.5 hover:text-white hover:bg-white/5 rounded"><Copy size={16}/></button></Tooltip>
                    <Tooltip text="Editar"><button onClick={() => onEdit(c)} className="p-1.5 hover:text-primary hover:bg-white/5 rounded"><Pencil size={16}/></button></Tooltip>
                    <Tooltip text="Excluir"><button onClick={() => onDelete && onDelete(c.id)} className="p-1.5 hover:text-loss hover:bg-white/5 rounded"><Trash2 size={16}/></button></Tooltip>
                 </td>
               </tr>
             ))}
           </tbody>
        </table>
      </div>

      {hasMore && (
        <button 
          onClick={() => setVisibleCount(prev => prev + 20)}
          className="w-full py-3 text-sm font-bold text-secondary bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg transition-all"
        >
          Carregar Mais ({filteredCycles.length - visibleCount} restantes)...
        </button>
      )}
    </div>
  );
};
