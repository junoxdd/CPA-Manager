import React from 'react';
import { Crown } from 'lucide-react';

interface PlanBadgeProps {
  isPro: boolean;
  isTrial: boolean;
  onClick: () => void;
}

export const PlanBadge: React.FC<PlanBadgeProps> = ({ isPro, isTrial, onClick }) => {
  if (isPro) {
    return (
      <div 
        onClick={isTrial ? onClick : undefined}
        className={`flex items-center gap-1.5 px-3 py-1 border ${isTrial ? 'cursor-pointer border-primary/50 bg-primary/10' : 'border-gold/30 bg-gold/10'} rounded-full`}
      >
        <Crown size={12} className={isTrial ? 'text-primary' : 'text-gold'} />
        <span className={`text-[10px] font-bold uppercase tracking-wider ${isTrial ? 'text-primary' : 'text-gold'}`}>
          {isTrial ? 'TRIAL' : 'PRO'}
        </span>
      </div>
    );
  }

  return (
    <div onClick={onClick} className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full cursor-pointer hover:bg-white/10 transition-colors">
      <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">FREE</span>
    </div>
  );
};
