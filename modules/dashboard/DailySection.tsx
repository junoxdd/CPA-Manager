
import React from 'react';
import { DashboardHighlights } from '../../components/DashboardHighlights';
import { useCyclesContext } from '../../contexts/CycleContext';
import { useUI } from '../../contexts/UIContext';

interface DailySectionProps {
  stopLossLimit?: number;
}

export const DailySection: React.FC<DailySectionProps> = ({ stopLossLimit }) => {
  const { dashboardStats, advancedStats, todayCycles, cycles } = useCyclesContext();
  const { isPrivacyMode, setEditingCycle, openModal, setDuplicatingCycle } = useUI();

  const handleEdit = (cycle: any) => {
    setEditingCycle(cycle);
    setDuplicatingCycle(null);
    openModal('form');
  };

  const handleNewCycle = () => {
    setEditingCycle(null);
    setDuplicatingCycle(null);
    openModal('form');
  };

  return (
    <DashboardHighlights 
        stats={dashboardStats} 
        advancedStats={advancedStats} 
        isPrivacyMode={isPrivacyMode} 
        dashboardPeriod="daily"
        stopLossLimit={stopLossLimit}
        todayCycles={todayCycles}
        onEditCycle={handleEdit}
        onNewCycle={handleNewCycle}
        allCycles={cycles}
    />
  );
};
