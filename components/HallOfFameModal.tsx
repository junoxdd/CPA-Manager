
import React, { useMemo } from 'react';
import { X, Trophy, Medal, Star } from 'lucide-react';
import { Cycle } from '../types';
import { getTopCycles } from '../services/cycleService';
import { formatCurrency, formatDate } from '../utils/formatters';

interface HallOfFameModalProps {
  onClose: () => void;
  cycles: Cycle[];
  isPrivacyMode: boolean;
}

export const HallOfFameModal: React.FC<HallOfFameModalProps> = ({ onClose, cycles, isPrivacyMode }) => {
  
  const topCycles = useMemo(() => getTopCycles(cycles, 10), [cycles]);

  return (
    <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-xl flex items-center justify-center z-[80] p-4 animate-fade-in">
      <div className="glass w-full max-w-md border border-gold/20 shadow-[0_0_50px_rgba(251,191,36,0.1)] overflow-hidden max-h-[90vh] flex flex-col relative">
        
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-gold/10 to-transparent pointer-events-none"></div>

        <div className="flex justify-between items-center p-6 border-b border-white/5 relative z-10">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-gold text-black rounded shadow-[0_0_15px_var(--gold)]">
                <Trophy size={24} />
             </div>
             <div>
                <h2 className="text-xl font-bold text-white">Hall da Fama</h2>
                <p className="text-xs text-secondary uppercase tracking-wider">Top 10 Maiores Lucros</p>
             </div>
          </div>
          <button onClick={onClose} className="text-secondary hover:text-white"><X size={24}/></button>
        </div>

        <div className="p-0 overflow-y-auto custom-scrollbar flex-1 relative z-10">
            {topCycles.length === 0 ? (
                <div className="p-10 text-center text-secondary">
                    <p>Registre ciclos lucrativos para entrar no Hall da Fama.</p>
                </div>
            ) : (
                <div>
                    {topCycles.map((cycle, index) => {
                        let rankIcon = <span className="font-mono text-secondary text-sm">#{index + 1}</span>;
                        let rowClass = "border-b border-white/5 bg-transparent hover:bg-white/5";
                        
                        if (index === 0) {
                            rankIcon = <Trophy size={20} className="text-gold drop-shadow-md" />;
                            rowClass = "bg-gradient-to-r from-gold/10 to-transparent border-b border-gold/20";
                        } else if (index === 1) {
                            rankIcon = <Medal size={20} className="text-gray-300" />;
                        } else if (index === 2) {
                            rankIcon = <Medal size={20} className="text-orange-400" />;
                        }

                        return (
                            <div key={cycle.id} className={`flex items-center justify-between p-4 ${rowClass} transition-colors`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-8 flex justify-center">{rankIcon}</div>
                                    <div>
                                        <p className="text-white font-bold text-sm">{cycle.platform}</p>
                                        <p className="text-[10px] text-secondary">{formatDate(cycle.date)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-mono font-bold ${index === 0 ? 'text-gold text-lg' : 'text-profit'}`}>
                                        {formatCurrency(cycle.profit, isPrivacyMode)}
                                    </p>
                                    {index === 0 && <div className="flex items-center justify-end gap-1 text-[8px] text-gold uppercase tracking-widest"><Star size={8} fill="currentColor"/> Recorde</div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
