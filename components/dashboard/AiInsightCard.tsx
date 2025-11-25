
import React from 'react';
import { AiInsights } from '../AiInsights';
import { useCyclesContext } from '../../contexts/CycleContext';
import { useFilters } from '../../contexts/FilterContext';

interface AiInsightCardProps {
  isPro: boolean;
}

export const AiInsightCard: React.FC<AiInsightCardProps> = ({ isPro }) => {
  const { dashboardStats, filteredCycles } = useCyclesContext();
  const { dashboardPeriod } = useFilters();

  return (
    <AiInsights 
        stats={dashboardStats} 
        cycles={filteredCycles} 
        period={dashboardPeriod}
        variant={isPro ? 'pro' : 'standard'}
    />
  );
};
