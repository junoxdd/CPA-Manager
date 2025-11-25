import React from 'react';
import { X, Check, Sparkles, ShieldCheck, Zap, Crown } from 'lucide-react';

interface UpgradeModalProps {
  onClose: () => void;
  onUpgrade: () => void;
  onStartTrial: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ onClose, onUpgrade, onStartTrial }) => {
  return (
    <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="glass max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row border border-white/10">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 z-20 text-white"><X size={24}/></button>

        {/* Left Side: Value Prop */}
        <div className="w-full md:w-2/5 bg-surfaceHighlight/30 p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gold/10 to-transparent pointer-events-none"></div>
          
          <div className="relative z-10">
             <div className="w-16 h-16 bg-gold text-black flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(251,191,36,0.4)]">
               <Crown size={32} />
             </div>
             <h2 className="text-3xl font-bold text-white mb-2">CPA <span className="text-gold">PRO</span></h2>
             <p className="text-secondary text-sm leading-relaxed">
               Para operadores que levam o jogo a sério. Desbloqueie inteligência de dados, segurança e histórico ilimitado.
             </p>
          </div>

          <div className="relative z-10 mt-8 space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-gold" size={20} />
              <span className="text-sm font-medium text-gray-300">Backup na Nuvem</span>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="text-gold" size={20} />
              <span className="text-sm font-medium text-gray-300">Análise de Alta Performance</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="text-gold" size={20} />
              <span className="text-sm font-medium text-gray-300">Histórico Ilimitado</span>
            </div>
          </div>
        </div>

        {/* Right Side: Comparison & Actions */}
        <div className="w-full md:w-3/5 p-8 bg-surface/80">
          <h3 className="text-lg font-bold text-white mb-6 text-center uppercase tracking-widest">Escolha seu nível</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            {/* Free Column */}
            <div className="p-4 border border-white/5 bg-white/5 flex flex-col items-center opacity-60">
              <span className="text-xs font-bold text-secondary uppercase mb-2">Iniciante</span>
              <span className="text-xl font-bold text-white mb-4">Free</span>
              <ul className="space-y-2 text-xs text-secondary w-full mb-4">
                <li className="flex gap-2"><Check size={12}/> Dashboard Básico</li>
                <li className="flex gap-2"><Check size={12}/> 30 dias de Histórico</li>
                <li className="flex gap-2 opacity-50"><X size={12}/> Sem Backup</li>
              </ul>
              <button onClick={onClose} className="mt-auto w-full py-2 text-xs font-bold border border-white/10 hover:bg-white/5 text-white">Manter Free</button>
            </div>

            {/* Pro Column */}
            <div className="p-4 border border-gold/30 bg-gold/5 flex flex-col items-center relative transform scale-105 shadow-2xl">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gold text-black text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">Recomendado</div>
              <span className="text-xs font-bold text-gold uppercase mb-2">Profissional</span>
              <span className="text-xl font-bold text-white mb-4">PRO</span>
              <ul className="space-y-2 text-xs text-gray-300 w-full mb-4">
                <li className="flex gap-2 text-white"><Check size={12} className="text-gold"/> Tudo do Free</li>
                <li className="flex gap-2 text-white"><Check size={12} className="text-gold"/> Backup Automático</li>
                <li className="flex gap-2 text-white"><Check size={12} className="text-gold"/> Gráficos Avançados</li>
                <li className="flex gap-2 text-white"><Check size={12} className="text-gold"/> PDF Export</li>
              </ul>
              <button onClick={onUpgrade} className="mt-auto w-full py-2 text-xs font-bold bg-gold text-black hover:bg-white transition-colors flex items-center justify-center gap-1 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                <Sparkles size={12} /> ATIVAR AGORA
              </button>
            </div>
          </div>

          <div className="text-center">
            <button onClick={onStartTrial} className="text-xs text-secondary hover:text-white underline decoration-dotted transition-colors">
              Quero testar 7 dias grátis (Trial)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
