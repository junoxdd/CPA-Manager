import React, { ReactNode } from 'react';
import { PlanFeature } from '../types';
import { LockOverlay } from './LockOverlay';

interface PlanGateProps {
  feature: PlanFeature;
  isPro: boolean;
  children: ReactNode;
  onUpgrade: () => void;
  label?: string;
  compact?: boolean;
  className?: string;
}

export const PlanGate: React.FC<PlanGateProps> = ({ 
  feature, 
  isPro, 
  children, 
  onUpgrade,
  label,
  compact = false,
  className = ""
}) => {
  return (
    <div className={`relative ${className}`}>
      {/* If not PRO, render content with blur and overlay on top */}
      {!isPro && (
        <LockOverlay onUnlock={onUpgrade} label={label} compact={compact} />
      )}
      
      {/* Render children normally (if not pro, they will be blurred by overlay's backdrop or just sit under it) */}
      <div className={!isPro ? 'pointer-events-none select-none opacity-50 filter blur-[2px]' : ''}>
        {children}
      </div>
    </div>
  );
};
