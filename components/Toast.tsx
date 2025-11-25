import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  type?: 'success' | 'error';
}

export const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose, type = 'success' }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => onClose(), 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 right-1/2 translate-x-1/2 md:right-8 md:translate-x-0 z-[100] animate-slide-up">
      <div className={`flex items-center gap-3 px-5 py-3 glass border shadow-2xl backdrop-blur-xl ${
        type === 'success' ? 'border-profit/30 bg-profit/10 shadow-neon-profit' : 'border-loss/30 bg-loss/10 shadow-neon-loss'
      }`}>
        {type === 'success' ? <CheckCircle2 className="text-profit" size={18} /> : <AlertCircle className="text-loss" size={18} />}
        <span className="text-sm font-bold text-white tracking-wide whitespace-nowrap">{message}</span>
      </div>
    </div>
  );
};