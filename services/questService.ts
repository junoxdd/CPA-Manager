
import { Cycle, Quest, User } from '../types';
import { getLocalDate } from '../utils/dateUtils';

const QUESTS_KEY = (userId: string) => `cpa_quests_${userId}`;

// Template of available quests
const QUEST_TEMPLATES: Omit<Quest, 'current' | 'isCompleted'>[] = [
  { id: 'q_weekly_profit', title: 'Semana Verde', description: 'Termine a semana com lucro positivo.', difficulty: 'medium', target: 1, rewardXP: 500, icon: 'target' },
  { id: 'q_consistency_3', title: 'Tríade de Ouro', description: '3 dias seguidos com lucro.', difficulty: 'hard', target: 3, rewardXP: 800, icon: 'fire' },
  { id: 'q_volume_20', title: 'Grinder', description: 'Registre 20 operações esta semana.', difficulty: 'easy', target: 20, rewardXP: 300, icon: 'sword' },
  { id: 'q_no_tilt', title: 'Mente Blindada', description: 'Nenhum prejuízo maior que R$ 200 em um ciclo.', difficulty: 'medium', target: 1, rewardXP: 400, icon: 'shield' },
  // PRO Quests
  { id: 'q_pro_sniper', title: 'Sniper Elite (PRO)', description: 'Acerte 5 ciclos seguidos sem loss.', difficulty: 'pro', target: 5, rewardXP: 1500, icon: 'zap' },
  { id: 'q_pro_10k', title: 'High Roller (PRO)', description: 'Movimente R$ 10k em volume total.', difficulty: 'pro', target: 10000, rewardXP: 2000, icon: 'target' }
];

export const getQuests = (userId: string): Quest[] => {
  const stored = localStorage.getItem(QUESTS_KEY(userId));
  if (stored) {
    return JSON.parse(stored);
  }
  // Initialize default quests
  const initialQuests = QUEST_TEMPLATES.map(t => ({ ...t, current: 0, isCompleted: false }));
  saveQuests(userId, initialQuests);
  return initialQuests;
};

const saveQuests = (userId: string, quests: Quest[]) => {
  localStorage.setItem(QUESTS_KEY(userId), JSON.stringify(quests));
};

export const checkQuestProgress = (user: User, cycles: Cycle[]) => {
  let quests = getQuests(user.id);
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  startOfWeek.setHours(0,0,0,0);

  // Filter cycles for this week
  const weeklyCycles = cycles.filter(c => new Date(c.date).getTime() >= startOfWeek.getTime());

  // 1. Volume Quest
  const volumeQuestIndex = quests.findIndex(q => q.id === 'q_volume_20');
  if (volumeQuestIndex !== -1 && !quests[volumeQuestIndex].isCompleted) {
    quests[volumeQuestIndex].current = weeklyCycles.length;
    if (quests[volumeQuestIndex].current >= quests[volumeQuestIndex].target) {
      quests[volumeQuestIndex].isCompleted = true;
    }
  }

  // 2. Consistency (Streak)
  const consistencyQuestIndex = quests.findIndex(q => q.id === 'q_consistency_3');
  if (consistencyQuestIndex !== -1 && !quests[consistencyQuestIndex].isCompleted) {
     // Logic: Check dates
     const dates = [...new Set(weeklyCycles.filter(c => c.profit > 0).map(c => c.date))].sort();
     let maxStreak = 0;
     let currentStreak = 0;
     // Simplified streak check
     for (let i = 0; i < dates.length; i++) {
        currentStreak++; // Naive implementation for demo
        if (currentStreak > maxStreak) maxStreak = currentStreak;
     }
     quests[consistencyQuestIndex].current = maxStreak;
     if (maxStreak >= 3) quests[consistencyQuestIndex].isCompleted = true;
  }

  // 3. PRO Sniper
  if (user.plan === 'pro') {
      const sniperIndex = quests.findIndex(q => q.id === 'q_pro_sniper');
      if (sniperIndex !== -1 && !quests[sniperIndex].isCompleted) {
          // Find consecutive wins in weekly cycles
          let maxWinStreak = 0;
          let currentWinStreak = 0;
          // Sort by creation time
          const sorted = [...weeklyCycles].sort((a,b) => (a.createdAt || 0) - (b.createdAt || 0));
          for(const c of sorted) {
              if (c.profit > 0) currentWinStreak++;
              else currentWinStreak = 0;
              if (currentWinStreak > maxWinStreak) maxWinStreak = currentWinStreak;
          }
          quests[sniperIndex].current = maxWinStreak;
          if (maxWinStreak >= 5) quests[sniperIndex].isCompleted = true;
      }
  }

  saveQuests(user.id, quests);
  return quests;
};
