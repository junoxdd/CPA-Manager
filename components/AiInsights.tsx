
import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Cpu, Zap, BrainCircuit, AlertOctagon } from 'lucide-react';
import { DashboardStats, Cycle, DashboardPeriod } from '../types';
import { generateContextAwareInsight } from '../services/aiService';

interface AiInsightsProps {
  stats: DashboardStats;
  cycles: Cycle[];
  period: DashboardPeriod;
  variant?: 'standard' | 'pro';
}

export const AiInsights: React.FC<AiInsightsProps> = ({ stats, cycles, period, variant = 'standard' }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastProcessedPeriod, setLastProcessedPeriod] = useState<DashboardPeriod | null>(null);

  useEffect(() => {
    // Auto generate if period changes and we have data, but only occasionally to simulate "smart" trigger
    if (period !== lastProcessedPeriod && cycles.length > 0) {
        setInsight(null); 
        setLastProcessedPeriod(period);
    }
  }, [period, lastProcessedPeriod, cycles.length]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateContextAwareInsight(stats, cycles, period);
      setInsight(result);
    } catch { 
      setInsight("Minha análise está indisponível no momento."); 
    } finally { 
      setLoading(false); 
    }
  };

  const isPro = variant === 'pro';
  const isNeuro = insight && insight.includes("NEURO-LINK");
  
  // Theme based on content
  let themeColor = period === 'daily' ? 'text-primary' : period === 'weekly' ? 'text-[#00FF88]' : 'text-gold';
  let borderColor = period === 'daily' ? 'border-primary/30' : period === 'weekly' ? 'border-[#00FF88]/30' : 'border-gold/30';
  let bgGradient = period === 'daily' ? 'from-primary/5' : period === 'weekly' ? 'from-[#00FF88]/5' : 'from-gold/5';

  if (isNeuro) {
      themeColor = 'text-purple-400';
      borderColor = 'border-purple-500/50';
      bgGradient = 'from-purple-500/10';
  }

  const title = isNeuro 
    ? 'NEURO-LINK ATIVO' 
    : period === 'daily' ? 'Insight Diário' : period === 'weekly' ? 'Análise Semanal' : period === 'monthly' ? 'Estratégia Mensal' : 'Análise Geral';

  return (
    <div className={`relative overflow-hidden rounded-xl border ${borderColor} bg-surface/50 transition-all duration-500 mb-6 group animate-fade-in`}>
      {/* Dynamic Background */}
      <div className={`absolute inset-0 bg-gradient-to-r ${bgGradient} to-transparent opacity-50`}></div>
      
      <div className="relative z-10 p-5">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-start gap-3">
            <div className={`mt-1 w-10 h-10 flex items-center justify-center rounded-lg border border-white/5 bg-black/40 shadow-inner`}>
              {loading ? (
                  <RefreshCw size={20} className={`${themeColor} animate-spin`} />
              ) : isNeuro ? (
                  <BrainCircuit size={20} className="text-purple-400 animate-pulse" />
              ) : (
                  <Cpu size={20} className={themeColor} />
              )}
            </div>
            <div>
              <h3 className="text-white font-bold text-sm flex items-center gap-2">
                CPA Manager IA <span className={`text-[10px] bg-white/10 px-1.5 rounded font-normal uppercase ${isNeuro ? 'text-purple-300 border border-purple-500/30' : 'text-secondary'}`}>{title}</span>
              </h3>
              <p className="text-secondary text-xs mt-0.5 max-w-[250px] leading-tight">
                {insight ? (isNeuro ? "Padrão comportamental detectado." : "Análise concluída.") : "Toque para gerar uma análise contextual dos seus dados."}
              </p>
            </div>
          </div>
          
          {!loading && (
            <button 
                onClick={handleGenerate} 
                className={`px-4 py-2 rounded-lg text-[10px] font-bold border border-white/5 ${themeColor} bg-white/5 hover:bg-white/10 transition-colors uppercase tracking-wider flex items-center gap-1`}
            >
              {insight ? <><RefreshCw size={12}/> Atualizar</> : <><Sparkles size={12}/> Analisar</>}
            </button>
          )}
        </div>

        {loading && (
            <div className="mt-4 space-y-2 animate-pulse">
                <div className="h-2 w-3/4 bg-white/5 rounded"></div>
                <div className="h-2 w-1/2 bg-white/5 rounded"></div>
            </div>
        )}
        
        {insight && !loading && (
          <div className={`mt-4 bg-black/20 border rounded-lg p-4 backdrop-blur-sm animate-slide-up ${isNeuro ? 'border-purple-500/20 bg-purple-900/10' : 'border-white/5'}`}>
            <div className="flex gap-3">
                {isNeuro ? <AlertOctagon size={16} className="text-purple-400 mt-0.5 shrink-0" /> : <Zap size={16} className={`${themeColor} mt-0.5 shrink-0`} />}
                <div className="text-gray-200 text-xs leading-relaxed font-medium whitespace-pre-line">
                    {insight.replace('🧠 NEURO-LINK:', '')}
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
