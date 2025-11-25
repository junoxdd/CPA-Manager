
import React, { useMemo } from 'react';
import { X, Trophy, Target, Gem, Banknote, Zap, Shield, Rocket, Crown, Star, Ghost } from 'lucide-react';
import { Cycle } from '../types';
import { calculateAchievements } from '../services/achievementService';

interface AchievementsModalProps {
  onClose: () => void;
  cycles: Cycle[];
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ onClose, cycles }) => {
  
  const achievements = useMemo(() => calculateAchievements(cycles), [cycles]);
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const progressPercentage = (unlockedCount / achievements.length) * 100;

  const getIcon = (name: string) => {
    switch (name) {
      case 'target': return <Target size={24} />;
      case 'gem': return <Gem size={24} />;
      case 'banknote': return <Banknote size={24} />;
      case 'trophy': return <Trophy size={24} />;
      case 'zap': return <Zap size={24} />;
      case 'shield': return <Shield size={24} />;
      case 'rocket': return <Rocket size={24} />;
      case 'crown': return <Crown size={24} />;
      case 'star': return <Star size={24} />;
      case 'ghost': return <Ghost size={24} />;
      default: return <Trophy size={24} />;
    }
  };

  const getColorClasses = (color: string, isUnlocked: boolean) => {
    if (!isUnlocked) return 'text-secondary bg-white/5 border-white/5 grayscale opacity-50';
    
    switch (color) {
      case 'gold': return 'text-gold bg-gold/10 border-gold/30 shadow-[0_0_15px_rgba(251,191,36,0.3)]';
      case 'profit': return 'text-profit bg-profit/10 border-profit/30 shadow-[0_0_15px_rgba(34,197,94,0.3)]';
      case 'primary': return 'text-primary bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(99,102,241,0.3)]';
      case 'loss': return 'text-loss bg-loss/10 border-loss/30 shadow-[0_0_15px_rgba(251,113,133,0.3)]';
      case 'purple': return 'text-purple-400 bg-purple-500/10 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.3)]';
      default: return 'text-white';
    }
  };

  return (
    <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-xl flex items-center justify-center z-[80] p-4 animate-fade-in">
      <div className="glass border border-white/10 w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-surfaceHighlight">
             <div className="h-full bg-gradient-to-r from-primary via-profit to-gold transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          
          <div className="flex items-center gap-3 z-10">
            <div className="p-2 bg-gold/20 text-gold">
              <Trophy size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Conquistas</h2>
              <p className="text-xs text-secondary uppercase tracking-wider font-bold">
                {unlockedCount} de {achievements.length} Desbloqueadas
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-secondary hover:text-white z-10 p-2 hover:bg-white/10 transition-colors"><X size={24}/></button>
        </div>

        {/* Grid */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className={`
                  relative p-4 border transition-all duration-300 flex items-start gap-4 group
                  ${getColorClasses(achievement.color, achievement.isUnlocked)}
                  ${!achievement.isUnlocked ? 'hover:opacity-70' : 'hover:scale-[1.02]'}
                `}
              >
                <div className={`p-3 ${achievement.isUnlocked ? 'bg-black/20' : 'bg-white/5'}`}>
                  {getIcon(achievement.iconName)}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-bold ${achievement.isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                      {achievement.isSecret && !achievement.isUnlocked ? '???' : achievement.title}
                    </h3>
                    {achievement.progress !== undefined && !achievement.isUnlocked && !achievement.isSecret && (
                      <span className="text-[10px] font-mono opacity-70 py-0.5 px-1.5 bg-black/30 border border-white/10">
                        {achievement.progress}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {achievement.isSecret && !achievement.isUnlocked ? 'Conquista Secreta' : achievement.description}
                  </p>
                  {/* Reward XP Display added */}
                  <span className="mt-2 inline-block text-[9px] font-bold px-1.5 py-0.5 bg-white/10 rounded">
                    +{achievement.rewardXP} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
