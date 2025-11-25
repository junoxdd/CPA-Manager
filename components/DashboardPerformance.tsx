
import React, { Suspense } from 'react';
import { Cycle, DashboardPeriod } from '../types';
import { LoadingSkeleton } from './LoadingSkeleton';

const Charts = React.lazy(() => import('./Charts').then(module => ({ default: module.Charts })));
const PerformanceCalendar = React.lazy(() => import('./PerformanceCalendar').then(module => ({ default: module.PerformanceCalendar })));

interface DashboardPerformanceProps {
  cycles: Cycle[];
  isPrivacyMode: boolean;
  isPro: boolean;
  onUpgrade: () => void;
  period: DashboardPeriod;
}

export const DashboardPerformance: React.FC<DashboardPerformanceProps> = ({ 
  cycles, isPrivacyMode, isPro, onUpgrade, period
}) => {
  
  const isDaily = period === 'daily';
  const isWeekly = period === 'weekly';
  const isMonthly = period === 'monthly' || period === 'all';

  if (isDaily) return null; // Daily view has its own list in Highlights

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-lg font-bold text-white border-l-4 border-primary pl-3 uppercase tracking-wider">
          {isWeekly ? 'Performance Semanal' : 'Performance & Evolução'}
      </h2>
      
      <Suspense fallback={<LoadingSkeleton />}>
        {/* Heatmap Section - Only for Monthly/All */}
        {isMonthly && (
            <div className="animate-slide-up">
                <PerformanceCalendar cycles={cycles} isPrivacyMode={isPrivacyMode} />
            </div>
        )}
        
        {/* Detailed Charts */}
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <Charts 
            cycles={cycles} 
            isPrivacyMode={isPrivacyMode} 
            isPro={isPro} 
            onUpgrade={onUpgrade} 
            />
        </div>
      </Suspense>
    </div>
  );
};
