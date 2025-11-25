import { useState, useEffect, useCallback } from 'react';
import { User, PlanFeature } from '../types';
import { getPlanStatus, checkPermission, setPlan, startTrial } from '../services/planService';

export const usePlan = (user: User | null, onUserUpdate: (u: User) => void) => {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  
  const planStatus = user ? getPlanStatus(user) : null;

  const canUseFeature = useCallback((feature: PlanFeature): boolean => {
    if (!user) return false;
    return checkPermission(user, feature);
  }, [user]);

  const openUpgradeModal = () => setIsUpgradeModalOpen(true);
  const closeUpgradeModal = () => setIsUpgradeModalOpen(false);

  const handleUpgrade = async () => {
    if (!user) return;
    const updatedUser = await setPlan(user, 'pro');
    onUserUpdate(updatedUser);
    setIsUpgradeModalOpen(false);
    setIsOnboardingOpen(true); // Start onboarding after upgrade
  };

  const handleStartTrial = async () => {
    if (!user) return;
    const updatedUser = await startTrial(user);
    onUserUpdate(updatedUser);
    setIsUpgradeModalOpen(false);
    setIsOnboardingOpen(true);
  };

  return {
    plan: user?.plan || 'free',
    isPro: planStatus?.isPro || false,
    isTrial: planStatus?.isTrial || false,
    trialDaysLeft: planStatus?.daysLeft || 0,
    canUseFeature,
    openUpgradeModal,
    closeUpgradeModal,
    isUpgradeModalOpen,
    handleUpgrade,
    handleStartTrial,
    isOnboardingOpen,
    closeOnboarding: () => setIsOnboardingOpen(false)
  };
};
