
import React, { useState } from 'react';
import { X, Trophy, Target, Shield, Zap, Calendar, Crown, Lock, Star, Brain, Swords, Flame } from 'lucide-react';
import { useGamification } from '../contexts/GamificationContext';
import { ActiveQuest, Achievement } from '../types';

interface GamificationHubProps {
  onClose: () => void;
}

export const GamificationHub: React.FC<GamificationHubProps> = ({ onClose }) => {
  const { profile, activeQuests, achievements } = useGamification();
  const [tab, setTab] = useState<'missions' | 'achievements'>('missions');

  const daily = activeQuests.filter(q => q.frequency === 'daily');
  const weekly = activeQuests.filter(q => q.frequency === 'weekly');
  const monthly = activeQuests.filter(q => q.frequency === 'monthly');

  const progressPercent = Math.min(100, (profile.currentXP / profile.nextLevelXP) * 100);

  const getIcon = (name: string) => {
      switch(name) {
          case 'target': return <Target size={18}/>;
          case 'shield': return <Shield size={18}/>;
          case 'zap': return <Zap size={18}/>;
          case 'brain': return <Brain size={18}/>;
          case 'clock': return <Calendar size={18}/>;
          case 'sword': return <Swords size={18}/>;
          case 'fire': return <Flame size={18}/>;
          default: return <Star size={18}/>;
      }
  };

  return (
    <div className="fixed inset-0 bg-[#020617]/95 backdrop-blur-xl flex items-center justify-center z-[90] p-4 animate-fade-in">
      <div className="glass w-full max-w-5xl h-[90vh] border border-white/10 shadow-2xl overflow-hidden flex flex-col rounded-2xl">
        
        <div className="p-6 border-b border-white/5 bg-gradient-to-r from-surfaceHighlight/30 to-transparent relative">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 text-secondary hover:text-white bg-black/20 rounded-full"><X size={24}/></button>
            
            <div className="flex items-center gap-6">
                <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold to-yellow-700 flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                        <Crown size={32} className="text-black" />
                    </div>
                    <div className="absolute -bottom-3 -right-3 bg-black border border-gold text-gold font-black text-xs w-8 h-8 flex items-center justify-center rounded-full">
                        {profile.level}
                    </div>
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-1">Operador {profile.titles?.[0] || 'Novato'}</h2>
                    <div className="w-full max-w-md h-4 bg-black/50 rounded-full overflow-hidden border border-white/10 relative">
                        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-gold transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white drop-shadow-md">
                            {profile.currentXP} / {profile.nextLevelXP} XP
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div className="flex border-b border-white/5 bg-black/20">
            <button onClick={() => setTab('missions')} className={`flex-1 py-4 font-bold uppercase text-sm transition-colors ${tab === 'missions' ? 'bg-white/5 text-white border-b-2 border-gold' : 'text-secondary hover:text-white'}`}>Missões</button>
            <button onClick={() => setTab('achievements')} className={`flex-1 py-4 font-bold uppercase text-sm transition-colors ${tab === 'achievements' ? 'bg-white/5 text-white border-b-2 border-primary' : 'text-secondary hover:text-white'}`}>Conquistas</button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[#020617]">
            
            {tab === 'missions' && (
                <div className="space-y-8 animate-slide-up">
                    <Section title="Diárias (Reseta 00h)" icon={<Calendar size={16} className="text-primary"/>} items={daily} getIcon={getIcon} />
                    <Section title="Semanais" icon={<Zap size={16} className="text-gold"/>} items={weekly} getIcon={getIcon} />
                    <Section title="Mensais" icon={<Trophy size={16} className="text-purple-400"/>} items={monthly} getIcon={getIcon} />
                </div>
            )}

            {tab === 'achievements' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-up">
                    {achievements.map(ach => (
                        <div key={ach.id} className={`p-4 border rounded-xl flex items-center gap-4 relative overflow-hidden transition-all hover:scale-[1.01] ${ach.isUnlocked ? 'bg-white/5 border-white/10' : 'bg-black/40 border-white/5 opacity-60'}`}>
                             <div className={`p-3 rounded-full ${ach.isUnlocked ? 'bg-'+ach.color+'/20 text-'+ach.color : 'bg-white/5 text-secondary'}`}>
                                 {ach.isUnlocked ? <Trophy size={20}/> : <Lock size={20}/>}
                             </div>
                             <div>
                                 <h4 className="font-bold text-sm text-white">{ach.isSecret && !ach.isUnlocked ? '???' : ach.title}</h4>
                                 <p className="text-xs text-gray-400 leading-tight">{ach.isSecret && !ach.isUnlocked ? 'Conquista Secreta' : ach.description}</p>
                                 {ach.isUnlocked && <span className="text-[10px] text-gold font-bold mt-1 block">Desbloqueado</span>}
                             </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

const Section = ({ title, icon, items, getIcon }: { title: string, icon: any, items: ActiveQuest[], getIcon: any }) => (
    <div>
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 opacity-80 border-b border-white/5 pb-2">{icon} {title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(q => (
                <div key={q.id} className={`relative p-4 border rounded-xl transition-all group ${q.isCompleted ? 'bg-profit/10 border-profit/30' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                    <div className="flex justify-between items-start mb-2">
                         <div className="flex items-center gap-2">
                             <div className={`p-1.5 rounded ${q.isCompleted ? 'bg-profit/20 text-profit' : 'bg-white/10 text-secondary'}`}>
                                 {getIcon(q.icon)}
                             </div>
                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${q.isPro ? 'bg-gold text-black' : 'bg-white/10 text-secondary'}`}>{q.type}</span>
                         </div>
                         <span className="text-[10px] font-bold text-gold">+{q.rewardXP} XP</span>
                    </div>
                    
                    <h4 className={`font-bold text-sm mb-1 mt-2 ${q.isCompleted ? 'text-profit' : 'text-white'}`}>{q.title}</h4>
                    <p className="text-xs text-gray-400 mb-3 min-h-[32px]">{q.description}</p>
                    
                    <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${q.isCompleted ? 'bg-profit' : 'bg-primary'}`} style={{ width: `${Math.min(100, (q.currentValue/q.targetValue)*100)}%` }}></div>
                    </div>
                    <div className="flex justify-between mt-1 text-[10px] text-secondary">
                        <span>{q.currentValue} / {q.targetValue}</span>
                        <span>{q.isCompleted ? 'Completo' : 'Em andamento'}</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);
