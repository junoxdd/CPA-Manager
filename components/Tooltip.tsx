import React, { ReactNode } from 'react';

interface TooltipProps {
  text: string;
  children: ReactNode;
  position?: 'top' | 'bottom';
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children, position = 'top' }) => {
  return (
    <div className="relative group flex items-center justify-center">
      {children}
      <div 
        className={`
          absolute left-1/2 -translate-x-1/2 px-2 py-1 bg-[#1a1a1a] border border-white/10 
          text-white text-[10px] font-medium shadow-xl opacity-0 group-hover:opacity-100 
          transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50
          ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}
        `}
      >
        {text}
        {/* Arrow */}
        <div 
          className={`
            absolute left-1/2 -translate-x-1/2 border-4 border-transparent
            ${position === 'top' ? 'top-full border-t-[#1a1a1a]' : 'bottom-full border-b-[#1a1a1a]'}
          `}
        />
      </div>
    </div>
  );
};