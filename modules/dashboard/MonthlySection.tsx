
import React, { Suspense } from 'react';
import { DashboardHighlights } from '../../components/DashboardHighlights';
import { DashboardPerformance } from '../../components/DashboardPerformance';
import { useCyclesContext } from '../../contexts/CycleContext';
import { useUI } from '../../contexts/UIContext';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';

interface MonthlySectionProps {
  isPro: boolean;
  onUpgrade: () => void;
  variant?: 'monthly' | 'all';
}

export const MonthlySection: React.FC<MonthlySectionProps> = ({ isPro, onUpgrade, variant = 'monthly' }) => {
  const { dashboardStats, advancedStats, filteredCycles, cycles } = useCyclesContext();
  const { isPrivacyMode } = useUI();

  return (
    <div className="space-y-8">
       <DashboardHighlights 
          stats={dashboardStats} 
          advancedStats={advancedStats} 
          isPrivacyMode={isPrivacyMode} 
          dashboardPeriod={variant}
          allCycles={cycles}
      />
      <Suspense fallback={<LoadingSkeleton />}>
        <DashboardPerformance 
            cycles={filteredCycles} 
            isPrivacyMode={isPrivacyMode} 
            isPro={isPro} 
            onUpgrade={onUpgrade} 
            period={variant}
        />
      </Suspense>
    </div>
  );
};
