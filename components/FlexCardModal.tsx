
import React, { useRef, useState } from 'react';
import { X, Download, Share2, Eye, EyeOff, Smartphone, Square } from 'lucide-react';
import { User } from '../types';
import { formatCurrency } from '../utils/formatters';
// @ts-ignore
import html2canvas from 'html2canvas';

interface FlexCardModalProps {
  onClose: () => void;
  stats: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  user: User;
}

export const FlexCardModal: React.FC<FlexCardModalProps> = ({ onClose, stats, user }) => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [showValue, setShowValue] = useState(true);
  const [format, setFormat] = useState<'square' | 'story'>('square');
  const [loading, setLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const currentProfit = period === 'daily' ? stats.daily : period === 'weekly' ? stats.weekly : stats.monthly;
  const isProfit = currentProfit >= 0;
  const label = period === 'daily' ? 'LUCRO HOJE' : period === 'weekly' ? 'SEMANA' : 'MÊS ATUAL';

  const quotes = [
    "O mercado respeita quem tem disciplina.",
    "Mais um dia no Green.",
    "Foco no longo prazo.",
    "Gestão de risco é tudo.",
    "A consistência vence a sorte.",
    "High Stakes, High Rewards."
  ];
  const [quote] = useState(quotes[Math.floor(Math.random() * quotes.length)]);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 200));

      const element = cardRef.current;
      const options = {
        backgroundColor: '#020617', 
        scale: 3, 
        useCORS: true,
        allowTaint: true,
        logging: false,
      };

      const canvas = await html2canvas(element, options);
      
      const link = document.createElement('a');
      link.download = `cpa-manager-${period}-${format}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Erro ao gerar imagem", err);
      alert("Erro ao gerar imagem. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-xl flex items-center justify-center z-[90] p-4 animate-fade-in">
      <div className="w-full max-w-md flex flex-col gap-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        <div className="glass p-4 flex justify-between items-center bg-surface border border-white/10">
          <h2 className="text-white font-bold flex items-center gap-2">
            <Share2 className="text-gold" size={20} /> Compartilhar Resultado
          </h2>
          <button onClick={onClose} className="text-secondary hover:text-white"><X size={24}/></button>
        </div>

        {/* Card Preview Area */}
        <div className="flex justify-center items-center min-h-[350px]">
          <div 
            ref={cardRef} 
            className={`
                relative bg-[#020617] overflow-hidden shadow-2xl border border-white/10 flex flex-col items-center justify-between p-6 transition-all
                ${format === 'square' ? 'w-[320px] h-[320px]' : 'w-[300px] h-[533px]'}
            `}
            style={{
              backgroundImage: `
                radial-gradient(circle at 50% 0%, ${isProfit ? 'rgba(34, 197, 94, 0.15)' : 'rgba(251, 113, 133, 0.15)'}, transparent 70%),
                linear-gradient(to bottom, #020617, #0f172a)
              `
            }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>

            <div className="w-full flex justify-between items-center z-10">
               <div className="flex items-center gap-2">
                 <div className="w-6 h-4 bg-red-600 border border-white/20 relative overflow-hidden">
                    <div className="absolute top-0.5 left-0.5 text-[4px] text-yellow-400">★</div>
                 </div>
                 <span className="text-[10px] font-bold text-white tracking-widest">CPA MANAGER</span>
               </div>
               <div className="text-[8px] text-secondary border border-white/10 px-1.5 py-0.5 rounded uppercase">
                 {new Date().toLocaleDateString('pt-BR')}
               </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center z-10 w-full gap-2">
               <span className="text-xs font-bold text-secondary uppercase tracking-[0.2em] mb-2">{label}</span>
               
               {showValue ? (
                 <div className={`font-mono font-bold tracking-tighter ${format === 'square' ? 'text-4xl' : 'text-5xl'} ${isProfit ? 'text-profit drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'text-loss drop-shadow-[0_0_15px_rgba(251,113,133,0.4)]'}`}>
                   {formatCurrency(currentProfit)}
                 </div>
               ) : (
                 <div className={`font-mono font-bold tracking-widest ${format === 'square' ? 'text-4xl' : 'text-5xl'} ${isProfit ? 'text-profit' : 'text-loss'}`}>
                   {isProfit ? 'PROFIT' : 'LOSS'}
                 </div>
               )}

               <div className={`mt-3 px-3 py-1 text-[10px] font-bold uppercase border ${isProfit ? 'border-profit/30 text-profit bg-profit/5' : 'border-loss/30 text-loss bg-loss/5'}`}>
                 {isProfit ? '▲ Positivo' : '▼ Negativo'}
               </div>
            </div>

            <div className="w-full z-10 text-center">
              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-3"></div>
              <p className="text-[10px] text-gray-400 italic font-medium">"{quote}"</p>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="glass p-4 space-y-4 bg-surface/80 border border-white/5">
            <div className="flex justify-center gap-2">
                <button onClick={() => setFormat('square')} className={`flex items-center gap-1 px-3 py-2 text-xs rounded ${format === 'square' ? 'bg-white text-black' : 'bg-white/5 text-secondary'}`}>
                    <Square size={14} /> Quadrado (Post)
                </button>
                <button onClick={() => setFormat('story')} className={`flex items-center gap-1 px-3 py-2 text-xs rounded ${format === 'story' ? 'bg-white text-black' : 'bg-white/5 text-secondary'}`}>
                    <Smartphone size={14} /> Story (9:16)
                </button>
            </div>

           <div className="flex justify-center gap-2">
              {['daily', 'weekly', 'monthly'].map((p) => (
                <button 
                  key={p}
                  onClick={() => setPeriod(p as any)} 
                  className={`px-4 py-2 text-xs font-bold uppercase transition-all ${period === p ? 'bg-white text-black' : 'bg-white/5 text-secondary hover:bg-white/10'}`}
                >
                  {p === 'daily' ? 'Hoje' : p === 'weekly' ? 'Semana' : 'Mês'}
                </button>
              ))}
           </div>

           <div className="flex justify-center gap-4">
              <button 
                onClick={() => setShowValue(!showValue)}
                className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-colors"
              >
                {showValue ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>

              <button 
                onClick={handleDownload}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gold text-black text-xs font-bold hover:bg-white transition-colors shadow-[0_0_20px_rgba(251,191,36,0.3)]"
              >
                {loading ? 'Gerando...' : <><Download size={16} /> Baixar Imagem</>}
              </button>
           </div>
        </div>

      </div>
    </div>
  );
};
