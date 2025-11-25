
import React, { Suspense } from 'react';
import { Cycle } from '../types';
import { LoadingSkeleton } from './LoadingSkeleton';
import { PlanGate } from './PlanGate';

const PlatformRanking = React.lazy(() => import('./PlatformRanking').then(module => ({ default: module.PlatformRanking })));

interface DashboardSummaryProps {
  cycles: Cycle[];
  isPrivacyMode: boolean;
  isPro: boolean;
  onUpgrade: () => void;
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({ 
  cycles, isPrivacyMode, isPro, onUpgrade 
}) => {

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-white border-l-4 border-gold pl-3 uppercase tracking-wider">Ranking de Plataformas</h2>
      
      <Suspense fallback={<LoadingSkeleton />}>
         <PlanGate feature="advanced_charts" isPro={isPro} onUpgrade={onUpgrade} label="Ranking de Plataformas">
            <PlatformRanking cycles={cycles} isPrivacyMode={isPrivacyMode} />
         </PlanGate>
      </Suspense>
    </div>
  );
};
