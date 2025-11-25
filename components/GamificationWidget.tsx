
import React from 'react';
import { Trophy } from 'lucide-react';
import { useGamification } from '../contexts/GamificationContext';

export const GamificationWidget: React.FC = () => {
  const { profile } = useGamification();
  const progress = Math.min(100, (profile.currentXP / profile.nextLevelXP) * 100);

  return (
    <div className="glass p-4 mb-6 flex items-center justify-between bg-surface/50 border-l-4 border-gold relative overflow-hidden animate-fade-in">
      <div className="absolute right-0 top-0 w-32 h-32 bg-gold/10 blur-[40px] rounded-full pointer-events-none"></div>

      <div className="flex items-center gap-4 z-10">
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800 to-black border border-gold/30 flex items-center justify-center shadow-lg">
            <Trophy className="text-gold" size={20} />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-gold text-black text-[10px] font-bold px-1.5 py-0.5 rounded shadow-md">
            {profile.level}
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            Operador {profile.titles?.[0] || 'Novato'} <span className="text-[10px] text-secondary font-normal">{profile.currentXP} XP</span>
          </span>
          <div className="w-32 sm:w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-gold to-yellow-200 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end z-10">
         <span className="text-[9px] text-secondary uppercase tracking-widest">RPG System</span>
         <span className="text-xs font-bold text-gold">Ativo</span>
      </div>
    </div>
  );
};
