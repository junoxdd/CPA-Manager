
import React from 'react';
import { X, AlertTriangle, TrendingUp, CheckCircle2, BrainCircuit } from 'lucide-react';
import { SmartAlertConfig } from '../types';

interface SmartAlertProps {
  config: SmartAlertConfig;
  onClose: () => void;
}

export const SmartAlert: React.FC<SmartAlertProps> = ({ config, onClose }) => {
  if (!config.visible) return null;

  const getIcon = () => {
    switch(config.type) {
        case 'insight': return <BrainCircuit size={20} className="text-primary" />;
        case 'warning': return <AlertTriangle size={20} className="text-loss" />;
        case 'success': return <CheckCircle2 size={20} className="text-profit" />;
        default: return <TrendingUp size={20} className="text-secondary" />;
    }
  };

  const getBorderColor = () => {
    switch(config.type) {
        case 'insight': return 'border-primary/40 shadow-neon-primary';
        case 'warning': return 'border-loss/40 shadow-neon-loss';
        case 'success': return 'border-profit/40 shadow-neon-profit';
        default: return 'border-white/10';
    }
  };

  return (
    <div className={`fixed top-24 right-4 z-[100] w-80 glass border ${getBorderColor()} bg-[#020617]/90 backdrop-blur-xl p-4 rounded-xl shadow-2xl animate-slide-in-right flex flex-col gap-2`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/5 rounded-lg border border-white/5">
                {getIcon()}
            </div>
            <h4 className="text-sm font-bold text-white">{config.title}</h4>
        </div>
        <button onClick={onClose} className="text-secondary hover:text-white">
            <X size={16} />
        </button>
      </div>
      
      <p className="text-xs text-gray-300 leading-relaxed pl-10">
        {config.message}
      </p>

      {config.actionLabel && (
        <div className="pl-10 mt-1">
            <button 
                onClick={() => { config.onAction && config.onAction(); onClose(); }}
                className="text-[10px] font-bold uppercase text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded transition-colors"
            >
                {config.actionLabel}
            </button>
        </div>
      )}
    </div>
  );
};
