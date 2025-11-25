
import React, { Suspense } from 'react';
import { DashboardHighlights } from '../../components/DashboardHighlights';
import { DashboardPerformance } from '../../components/DashboardPerformance';
import { useCyclesContext } from '../../contexts/CycleContext';
import { useUI } from '../../contexts/UIContext';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';

interface WeeklySectionProps {
  isPro: boolean;
  onUpgrade: () => void;
}

export const WeeklySection: React.FC<WeeklySectionProps> = ({ isPro, onUpgrade }) => {
  const { dashboardStats, advancedStats, filteredCycles, cycles } = useCyclesContext();
  const { isPrivacyMode } = useUI();

  return (
    <div className="space-y-8">
       <DashboardHighlights 
          stats={dashboardStats} 
          advancedStats={advancedStats} 
          isPrivacyMode={isPrivacyMode} 
          dashboardPeriod="weekly"
          allCycles={cycles}
      />
      <Suspense fallback={<LoadingSkeleton />}>
        <DashboardPerformance 
            cycles={filteredCycles} 
            isPrivacyMode={isPrivacyMode} 
            isPro={isPro} 
            onUpgrade={onUpgrade} 
            period="weekly"
        />
      </Suspense>
    </div>
  );
};
