
import React, { useEffect, useState } from 'react';
import { X, Target, Shield, Zap, Check, Lock } from 'lucide-react';
import { User, Cycle, Quest } from '../types';
import { checkQuestProgress } from '../services/questService';
import { PlanGate } from './PlanGate';

interface MissionsModalProps {
  onClose: () => void;
  user: User;
  cycles: Cycle[];
  isPro: boolean;
  onUpgrade: () => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({ onClose, user, cycles, isPro, onUpgrade }) => {
  const [quests, setQuests] = useState<Quest[]>([]);

  useEffect(() => {
    // Recalculate progress on open
    const updated = checkQuestProgress(user, cycles);
    setQuests(updated);
  }, [user, cycles.length]);

  const getIcon = (icon: string) => {
      switch(icon) {
          case 'target': return <Target size={18} />;
          case 'shield': return <Shield size={18} />;
          case 'zap': return <Zap size={18} />;
          default: return <Target size={18} />;
      }
  };

  return (
    <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-xl flex items-center justify-center z-[80] p-4 animate-fade-in">
      <div className="glass w-full max-w-2xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-gradient-to-br from-primary to-purple-600 text-white rounded shadow-lg">
                <Target size={24} />
             </div>
             <div>
                <h2 className="text-xl font-bold text-white">Central de Missões</h2>
                <p className="text-xs text-secondary uppercase tracking-wider">Desafios Semanais</p>
             </div>
          </div>
          <button onClick={onClose} className="text-secondary hover:text-white"><X size={24}/></button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
            
            {/* Free Quests */}
            <div>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Zap size={16} className="text-gold"/> Missões Ativas
                </h3>
                <div className="grid gap-3">
                    {quests.filter(q => q.difficulty !== 'pro').map(quest => (
                        <div key={quest.id} className={`p-4 border rounded-xl relative overflow-hidden transition-all ${quest.isCompleted ? 'bg-profit/10 border-profit/30' : 'bg-white/5 border-white/5'}`}>
                            <div className="flex justify-between items-start relative z-10">
                                <div className="flex gap-3">
                                    <div className={`p-2 rounded-lg h-fit ${quest.isCompleted ? 'bg-profit text-black' : 'bg-white/10 text-secondary'}`}>
                                        {quest.isCompleted ? <Check size={20} /> : getIcon(quest.icon)}
                                    </div>
                                    <div>
                                        <h4 className={`font-bold text-sm ${quest.isCompleted ? 'text-profit' : 'text-white'}`}>{quest.title}</h4>
                                        <p className="text-xs text-gray-400 mb-2">{quest.description}</p>
                                        
                                        {/* Progress Bar */}
                                        <div className="w-32 h-1.5 bg-black/40 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-1000 ${quest.isCompleted ? 'bg-profit' : 'bg-primary'}`} 
                                                style={{ width: `${Math.min(100, (quest.current / quest.target) * 100)}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-[10px] text-secondary mt-1">{quest.current} / {quest.target}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold bg-white/10 px-2 py-1 rounded text-gold">+{quest.rewardXP} XP</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* PRO Quests */}
            <div>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Shield size={16} className="text-purple-400"/> Missões Elite (PRO)
                </h3>
                <PlanGate feature="advanced_charts" isPro={isPro} onUpgrade={onUpgrade} label="Desafios PRO">
                    <div className="grid gap-3">
                        {quests.filter(q => q.difficulty === 'pro').map(quest => (
                            <div key={quest.id} className={`p-4 border rounded-xl relative overflow-hidden ${quest.isCompleted ? 'bg-purple-500/10 border-purple-500/30' : 'bg-white/5 border-white/5'}`}>
                                <div className="flex justify-between items-start relative z-10">
                                    <div className="flex gap-3">
                                        <div className={`p-2 rounded-lg h-fit ${quest.isCompleted ? 'bg-purple-500 text-white' : 'bg-white/10 text-secondary'}`}>
                                            {getIcon(quest.icon)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-white">{quest.title}</h4>
                                            <p className="text-xs text-gray-400 mb-2">{quest.description}</p>
                                            <div className="w-32 h-1.5 bg-black/40 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-purple-500 transition-all duration-1000"
                                                    style={{ width: `${Math.min(100, (quest.current / quest.target) * 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold bg-purple-500/20 px-2 py-1 rounded text-purple-300">+{quest.rewardXP} XP</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </PlanGate>
            </div>

        </div>
      </div>
    </div>
  );
};
