import React from 'react';
import { X, Crown, Check, Sparkles } from 'lucide-react';

interface PremiumModalProps {
  onClose: () => void;
  onUpgrade: () => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ onClose, onUpgrade }) => {
  return (
    <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-xl flex items-center justify-center z-[70] p-4 animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden border border-white/10 shadow-2xl group perspective-1000">
        
        {/* Card Background - Holographic feel */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 z-0"></div>
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-transparent via-white/5 to-transparent rotate-45 pointer-events-none"></div>
        
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 transition-colors z-20 text-white"><X size={20}/></button>

        <div className="relative z-10 p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gold to-yellow-600 flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.4)] rotate-3 group-hover:rotate-0 transition-transform duration-500">
            <Crown size={40} className="text-white drop-shadow-md" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">CPA PRO</h2>
          <p className="text-secondary mb-8">Desbloqueie o potencial máximo das suas operações.</p>

          <div className="space-y-3 mb-8 text-left">
             {['Ciclos Ilimitados', 'Backup na Nuvem', 'Analytics Profissional', 'Suporte VIP'].map((item, i) => (
               <div key={i} className="flex items-center gap-3 p-3 bg-white/5 border border-white/5">
                 <div className="p-1 bg-gold/20 text-gold"><Check size={12} /></div>
                 <span className="text-sm font-medium text-gray-200">{item}</span>
               </div>
             ))}
          </div>

          <button onClick={onUpgrade} className="w-full py-4 font-bold text-black bg-gold hover:bg-white transition-all shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_40px_rgba(251,191,36,0.6)] flex items-center justify-center gap-2">
            <Sparkles size={18} /> TORNAR-SE PRO
          </button>
        </div>
      </div>
    </div>
  );
};