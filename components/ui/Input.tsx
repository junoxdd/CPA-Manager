import React, { InputHTMLAttributes, ForwardRefRenderFunction, forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
  containerClassName?: string;
}

const InputBase: ForwardRefRenderFunction<HTMLInputElement, InputProps> = (
  { label, icon: Icon, error, className = '', containerClassName = '', ...props },
  ref
) => {
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label className="text-[10px] uppercase font-bold text-secondary mb-1 block">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" 
            size={18} 
          />
        )}
        <input
          ref={ref}
          className={`
            w-full bg-black/30 border border-white/10 rounded-lg 
            text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary 
            outline-none transition-all placeholder:text-secondary/50
            ${Icon ? 'pl-10 py-3' : 'p-3'}
            ${error ? 'border-loss focus:border-loss focus:ring-loss' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-loss mt-1">{error}</span>}
    </div>
  );
};

export const Input = forwardRef(InputBase);