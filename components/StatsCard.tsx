
import React from 'react';
import { DollarSign, Archive, Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { formatCurrency } from '../utils/formatters';

interface StatsCardProps {
  title: string;
  value: number;
  type?: 'profit' | 'loss' | 'neutral';
  icon?: 'money' | 'chest' | 'chart';
  isCurrency?: boolean;
  isPrivacyMode?: boolean;
  trend?: 'up' | 'down' | 'neutral';
}

const StatsCardComponent: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  type = 'neutral', 
  icon = 'money',
  isCurrency = true,
  isPrivacyMode = false,
  trend
}) => {
  
  const displayValue = isCurrency 
    ? formatCurrency(Math.abs(value), isPrivacyMode)
    : (isPrivacyMode ? '****' : value);

  // Default (Neutral)
  let colorClass = 'text-foreground'; 
  let iconGradient = 'from-secondary/20 to-secondary/5';
  let iconColor = 'text-secondary';
  let hoverEffect = 'hover:shadow-glass hover:border-secondary/20';
  let tooltipText = "Estatística Geral";

  if (type === 'profit') {
    if (value >= 0) {
      colorClass = 'text-profit drop-shadow-[0_0_5px_rgba(34,197,94,0.3)]';
      iconGradient = 'from-profit/20 to-profit/5';
      iconColor = 'text-profit';
      hoverEffect = 'hover:shadow-neon-profit hover:border-profit/30';
      tooltipText = "Saldo Positivo";
    } else {
      colorClass = 'text-loss drop-shadow-[0_0_5px_rgba(251,113,133,0.3)]';
      iconGradient = 'from-loss/20 to-loss/5';
      iconColor = 'text-loss';
      hoverEffect = 'hover:shadow-neon-loss hover:border-loss/30';
      tooltipText = "Saldo Negativo";
    }
  }

  if (icon === 'chest') {
    colorClass = 'text-gold drop-shadow-[0_0_5px_rgba(251,191,36,0.3)]';
    iconGradient = 'from-gold/20 to-gold/5';
    iconColor = 'text-gold';
    hoverEffect = 'hover:shadow-[0_0_20px_rgba(251,191,36,0.2)] hover:border-gold/30';
    tooltipText = "Bônus Acumulados";
  }

  const IconComponent = () => {
    if (icon === 'chest') return <Archive size={20} />;
    if (icon === 'chart') return <Activity size={20} />;
    return <DollarSign size={20} />;
  };

  return (
    <div className={`glass p-5 flex flex-col justify-between transition-all duration-300 group hover:scale-[1.02] hover:-translate-y-1 ${hoverEffect} bg-surface/50`}>
      <div className="flex justify-between items-start mb-4">
        <span className="text-secondary text-xs font-bold uppercase tracking-widest opacity-80">{title}</span>
        <Tooltip text={tooltipText}>
          <div className={`p-2.5 bg-gradient-to-br ${iconGradient} ${iconColor} shadow-inner`}>
            <IconComponent />
          </div>
        </Tooltip>
      </div>
      <div className="flex items-baseline justify-between">
        <h3 className={`text-2xl md:text-3xl font-bold font-mono tracking-tight ${colorClass} ${isPrivacyMode ? 'blur-[6px]' : ''}`}>
          {isCurrency && value < 0 && !isPrivacyMode ? '-' : ''}{displayValue}
        </h3>
        
        {trend && (
           <div className={`flex items-center text-xs font-bold ${trend === 'up' ? 'text-profit' : trend === 'down' ? 'text-loss' : 'text-secondary'}`}>
              {trend === 'up' ? <TrendingUp size={14}/> : trend === 'down' ? <TrendingDown size={14}/> : <Minus size={14} />}
           </div>
        )}
      </div>
    </div>
  );
};

export const StatsCard = React.memo(StatsCardComponent);
