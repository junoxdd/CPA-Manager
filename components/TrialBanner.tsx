import React from 'react';
import { Clock, Crown } from 'lucide-react';

interface TrialBannerProps {
  daysLeft: number;
  onUpgrade: () => void;
}

export const TrialBanner: React.FC<TrialBannerProps> = ({ daysLeft, onUpgrade }) => {
  return (
    <div className="bg-gradient-to-r from-gold/20 via-primary/20 to-gold/20 border-b border-gold/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-white">
          <Clock size={16} className="text-gold animate-pulse" />
          <span>
            Você está no <span className="font-bold text-gold">Trial PRO</span>. 
            Restam <span className="font-bold text-white">{daysLeft} dias</span> para expirar.
          </span>
        </div>
        <button 
          onClick={onUpgrade}
          className="text-[10px] sm:text-xs bg-gold text-black px-3 py-1 font-bold hover:bg-white transition-colors flex items-center gap-1 shadow-[0_0_10px_rgba(251,191,36,0.3)]"
        >
          <Crown size={12} /> ASSINAR DEFINITIVO
        </button>
      </div>
    </div>
  );
};
