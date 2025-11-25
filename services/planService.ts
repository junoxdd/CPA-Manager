import { User, UserPlan, PlanFeature, PlanStatusResponse } from '../types';
import { updateUserPlan } from './authService';

export const getPlanStatus = (user: User): PlanStatusResponse => {
  // FORCE FREE TO USER: Everyone is considered PRO internally
  return {
    plan: 'pro',
    isPro: true,
    isTrial: false,
    trialEndsAt: null,
    daysLeft: 365, // Arbitrary high number
    features: {
      history_unlimited: true,
      reports_pdf: true,
      advanced_charts: true,
      auto_backup: true,
      pro_theme: true,
      projections: true,
      priority_support: true
    }
  };
};

export const checkPermission = (user: User, feature: PlanFeature): boolean => {
  // Always allow
  return true;
};

export const setPlan = async (user: User, plan: UserPlan): Promise<User> => {
  const updatedUser = { ...user, plan };
  if (plan === 'pro') updatedUser.trialEndsAt = null; 
  return updateUserPlan(updatedUser);
};

export const startTrial = async (user: User): Promise<User> => {
  // Logic kept for compatibility, but effectively does nothing in "Free Mode"
  const updatedUser: User = {
    ...user,
    plan: 'pro', // Force pro
    trialEndsAt: null
  };
  return updateUserPlan(updatedUser);
};