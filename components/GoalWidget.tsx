
import React, { useState } from 'react';
import { Target, Check, X } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface GoalWidgetProps {
  currentMonthlyProfit: number;
  monthlyGoal: number;
  onUpdateGoal: (newGoal: number) => void;
  compact?: boolean;
  isPrivacyMode?: boolean;
}

export const GoalWidget: React.FC<GoalWidgetProps> = ({ 
  currentMonthlyProfit, 
  monthlyGoal, 
  onUpdateGoal, 
  compact = false,
  isPrivacyMode = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempGoal, setTempGoal] = useState(monthlyGoal.toString());

  const percentage = Math.min(100, Math.max(0, (currentMonthlyProfit / (monthlyGoal || 1)) * 100));
  const isAchieved = currentMonthlyProfit >= monthlyGoal;
  
  const weeklyGoal = monthlyGoal / 4;

  const handleSave = () => {
    const val = parseFloat(tempGoal);
    if (!isNaN(val) && val > 0) { onUpdateGoal(val); setIsEditing(false); }
  };

  const format = (val: number) => isPrivacyMode ? '****' : formatCurrency(val).replace('R$', '').trim();

  if (compact) {
    return (
      <div className="glass px-1 py-1 flex items-center gap-3 border-border shadow-glass group transition-all hover:border-secondary/20 mx-auto bg-surface/50 dark:bg-glass-bg max-w-full overflow-hidden">
        <div className={`w-8 h-8 flex items-center justify-center shadow-inner ${isAchieved ? 'bg-gold text-black shadow-[0_0_15px_var(--gold)]' : 'bg-surfaceHighlight text-secondary'} flex-shrink-0`}>
          <Target size={14} />
        </div>

        <div className="w-28 sm:w-40 flex flex-col justify-center pr-3 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-1 h-full justify-center">
              <input type="number" value={tempGoal} onChange={(e) => setTempGoal(e.target.value)} autoFocus
                className="w-full bg-surfaceHighlight border border-primary text-xs text-foreground text-center py-0.5 outline-none" 
                onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setIsEditing(false); }}/>
              <button onClick={handleSave} className="text-profit hover:scale-110"><Check size={12}/></button>
              <button onClick={() => setIsEditing(false)} className="text-loss hover:scale-110"><X size={12}/></button>
            </div>
          ) : (
            <div onClick={() => setIsEditing(true)} className="cursor-pointer">
              <div className="flex justify-between text-[10px] font-mono mb-1">
                 <span className={`${isAchieved ? 'text-gold' : 'text-foreground'} font-bold truncate`}>{format(currentMonthlyProfit)}</span>
                 <span className="text-secondary opacity-60 truncate">/ {format(monthlyGoal)}</span>
              </div>
              <div className="h-1.5 w-full bg-surfaceHighlight overflow-hidden shadow-inner relative">
                <div className={`h-full transition-all duration-1000 ease-out ${isAchieved ? 'bg-gold shadow-[0_0_10px_var(--gold)]' : 'bg-gradient-to-r from-primary to-profit'}`} style={{ width: `${percentage}%` }}></div>
              </div>
              <div className="flex justify-between mt-0.5">
                  <span className="text-[8px] text-secondary truncate">Semana: {format(weeklyGoal)}</span>
                  <span className="text-[8px] text-gold font-bold">{percentage.toFixed(0)}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};
