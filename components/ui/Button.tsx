import React, { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'gold' | 'profit';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = "font-bold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";
  
  const variants = {
    primary: "bg-primary hover:bg-primaryGlow text-white shadow-neon-primary",
    secondary: "bg-white/5 hover:bg-white/10 text-secondary hover:text-white border border-white/10",
    danger: "bg-loss/10 hover:bg-loss/20 text-loss border border-loss/20",
    ghost: "bg-transparent hover:bg-white/5 text-secondary hover:text-white",
    gold: "bg-gold text-black hover:bg-white shadow-[0_0_15px_rgba(251,191,36,0.3)]",
    profit: "bg-profit text-white hover:bg-profit/80 shadow-neon-profit"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-3 text-sm",
    lg: "px-6 py-4 text-base"
  };

  return (
    <button
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" size={size === 'sm' ? 14 : 18} />
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
};