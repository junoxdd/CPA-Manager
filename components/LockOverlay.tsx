import React from 'react';
import { Lock, Sparkles } from 'lucide-react';

interface LockOverlayProps {
  onUnlock: () => void;
  label?: string;
  compact?: boolean;
}

export const LockOverlay: React.FC<LockOverlayProps> = ({ onUnlock, label = "Recurso PRO", compact = false }) => {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 backdrop-blur-sm bg-[#020617]/60 border border-white/5 transition-all duration-300 group">
      {!compact && (
        <div className="mb-3 p-3 bg-black/40 rounded-full border border-white/10 shadow-2xl group-hover:scale-110 transition-transform duration-300">
          <Lock size={24} className="text-secondary group-hover:text-gold transition-colors" />
        </div>
      )}
      
      {compact ? (
         <button onClick={(e) => { e.stopPropagation(); onUnlock(); }} className="p-2 bg-gold/10 text-gold hover:bg-gold hover:text-black transition-colors rounded">
           <Lock size={16} />
         </button>
      ) : (
        <>
          <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
            {label} <span className="text-[10px] bg-gold text-black px-1.5 py-0.5 font-bold rounded-sm uppercase">PRO</span>
          </h3>
          <p className="text-xs text-secondary mb-4 text-center max-w-[200px]">
            Disponível no plano profissional.
          </p>
          <button 
            onClick={(e) => { e.stopPropagation(); onUnlock(); }}
            className="px-6 py-2 bg-gold text-black text-xs font-bold uppercase tracking-widest hover:bg-white hover:shadow-[0_0_20px_rgba(251,191,36,0.5)] transition-all flex items-center gap-2"
          >
            <Sparkles size={14} /> Desbloquear
          </button>
        </>
      )}
    </div>
  );
};
