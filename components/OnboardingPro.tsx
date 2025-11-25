import React, { useState } from 'react';
import { Check, ArrowRight, Crown, Shield, BarChart2, Palette } from 'lucide-react';

interface OnboardingProProps {
  onClose: () => void;
}

export const OnboardingPro: React.FC<OnboardingProProps> = ({ onClose }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: <Crown size={48} className="text-gold" />,
      title: "Bem-vindo à Elite",
      desc: "Você agora faz parte do grupo PRO. Suas ferramentas foram desbloqueadas e seus limites removidos."
    },
    {
      icon: <Shield size={48} className="text-primary" />,
      title: "Seus Dados Seguros",
      desc: "Agora você conta com backup automático na nuvem. Nunca mais perca seu histórico de operações."
    },
    {
      icon: <BarChart2 size={48} className="text-profit" />,
      title: "Inteligência Avançada",
      desc: "Acesse o Ranking de Plataformas e Gráficos de Evolução sem borrões ou bloqueios."
    },
    {
      icon: <Palette size={48} className="text-white" />,
      title: "Tema Exclusivo",
      desc: "Você pode ativar o tema Dourado nas configurações para ostentar seu novo status."
    }
  ];

  const current = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[110] p-4 animate-fade-in">
      <div className="max-w-md w-full text-center">
        
        <div className="mb-8 flex justify-center relative">
          <div className="absolute inset-0 bg-gold/20 blur-[50px] rounded-full"></div>
          <div className="relative w-24 h-24 bg-surface border border-white/10 flex items-center justify-center shadow-2xl">
            {current.icon}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-4 animate-slide-up">{current.title}</h2>
        <p className="text-secondary mb-8 leading-relaxed animate-slide-up">{current.desc}</p>

        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-gold' : 'w-2 bg-white/10'}`}></div>
          ))}
        </div>

        <button onClick={handleNext} className="w-full py-4 bg-white text-black font-bold hover:bg-gold transition-colors flex items-center justify-center gap-2 shadow-xl">
          {step === steps.length - 1 ? 'COMEÇAR A USAR' : 'PRÓXIMO'} <ArrowRight size={18} />
        </button>

      </div>
    </div>
  );
};
