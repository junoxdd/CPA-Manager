
export interface Cycle {
  id: string;
  date: string;
  deposit: number;
  withdrawal: number;
  chest: number;
  profit: number;
  notes: string;
  platform: string;
  tags?: string[];
  createdAt: number;
  deletedAt?: number | null;
}

export interface DashboardStats {
  totalProfit: number;
  dailyProfit: number;
  yesterdayProfit: number;
  totalDeposit: number;
  totalWithdrawal: number;
  totalChests: number;
  weeklyProfit: number;
  monthlyProfit: number;
  projectedProfit?: number;
}

export interface AdvancedStats {
  winRate: number;
  averageProfit: number;
  volatility: number;
  trend: 'up' | 'down' | 'neutral';
  riskScore: number;
  averageCycleProfit: number;
  aiInsight?: string;
}

export interface AppSettings {
  monthlyGoal: number;
  stopLossLimit?: number;
  theme?: 'light' | 'dark';
}

export type ViewMode = 'dashboard' | 'list';
export type DashboardPeriod = 'daily' | 'weekly' | 'monthly' | 'all';
export type UserPlan = 'free' | 'pro';
export type Theme = 'light' | 'dark';

export interface User {
  id: string;
  email: string;
  name: string;
  nickname?: string;
  phone?: string;
  bio?: string;
  plan: UserPlan;
  planStartedAt?: number;
  trialEndsAt?: number | null;
  avatarUrl?: string;
  preferences?: AppSettings;
  // Persisted JSONB Data
  gamificationState?: {
    profile: GamificationProfile;
    activeQuests: ActiveQuest[];
    achievements: Achievement[];
  };
  alerts?: Alert[];
}

export type PlanFeature = 
  | 'history_unlimited' 
  | 'reports_pdf' 
  | 'advanced_charts' 
  | 'auto_backup' 
  | 'pro_theme' 
  | 'projections'
  | 'priority_support';

export interface PlanPermissions {
  canUse: (feature: PlanFeature) => boolean;
}

export interface PlanStatusResponse {
  plan: UserPlan;
  isPro: boolean;
  isTrial: boolean;
  trialEndsAt: string | null;
  daysLeft: number;
  features: Record<PlanFeature, boolean>;
}

export type OnboardingStep = 'welcome' | 'benefits' | 'theme' | 'backup' | 'finish';

export interface Alert {
  id: string;
  userId: string;
  type: 'performance' | 'risco' | 'meta' | 'system';
  message: string;
  data?: {
    hint?: string;
    [key: string]: any;
  };
  createdAt: number;
  readAt: number | null;
}

// --- GAMIFICATION RPG SYSTEM TYPES ---

export type QuestFrequency = 'daily' | 'weekly' | 'monthly';
export type QuestDifficulty = 'easy' | 'medium' | 'hard' | 'pro';
export type QuestType = 'profit' | 'volume' | 'streak' | 'consistency' | 'discipline' | 'tags' | 'ai' | 'time';

export interface QuestTemplate {
  id: string;
  title: string;
  description: string;
  difficulty: QuestDifficulty;
  frequency: QuestFrequency;
  type: QuestType;
  targetValue: number;
  rewardXP: number;
  isPro?: boolean;
  icon: 'sword' | 'shield' | 'target' | 'fire' | 'zap' | 'brain' | 'clock' | 'star';
}

export interface ActiveQuest extends QuestTemplate {
  currentValue: number;
  isCompleted: boolean;
  generatedAt: string; // YYYY-MM-DD string for rotation tracking
  expiresAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: 'target' | 'gem' | 'banknote' | 'trophy' | 'zap' | 'shield' | 'ghost' | 'crown' | 'star' | 'rocket';
  isUnlocked: boolean;
  unlockedAt?: number;
  isSecret?: boolean;
  progress?: number; // 0-100 percentage
  targetValue?: number;
  currentValue?: number;
  color: 'gold' | 'profit' | 'primary' | 'loss' | 'purple';
  rewardXP: number;
}

export interface GamificationProfile {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  totalXP: number;
  streakDays: number;
  lastActiveDate: string;
  titles: string[];
  equippedTitle?: string;
}

// Legacy simple Quest interface (kept for compatibility)
export interface Quest {
  id: string;
  title: string;
  description: string;
  difficulty: QuestDifficulty;
  target: number;
  current: number;
  rewardXP: number;
  isCompleted: boolean;
  icon: 'sword' | 'shield' | 'target' | 'fire' | 'zap';
}

export interface SmartAlertConfig {
  visible: boolean;
  title: string;
  message: string;
  type: 'insight' | 'warning' | 'success' | 'neutral';
  actionLabel?: string;
  onAction?: () => void;
}

export interface Badge {
  type: 'high_profit' | 'loss';
  label: string;
}