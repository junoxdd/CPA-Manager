import { Cycle, User, QuestTemplate, ActiveQuest, Achievement, GamificationProfile, QuestFrequency } from '../types';
import { ALL_QUEST_TEMPLATES, ACHIEVEMENTS_DB } from './gamificationLibrary';
import { getLocalDate } from '../utils/dateUtils';

// --- HELPERS ---

const seededRandom = (seed: number) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

const getSeedFromDate = (dateStr: string): number => {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
      hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
      hash |= 0;
  }
  return Math.abs(hash);
};

const getStartOfWeek = (date: Date): string => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
  d.setDate(diff);
  return getLocalDate(d);
};

const getStartOfMonth = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
};

// --- GENERATION ---

export const generateQuestsForPeriod = (
  user: User, 
  frequency: QuestFrequency, 
  existingQuests: ActiveQuest[]
): ActiveQuest[] => {
  
  const today = getLocalDate();
  let seedBase = today;
  let expiration = today;
  
  if (frequency === 'weekly') {
      seedBase = getStartOfWeek(new Date());
      const d = new Date(seedBase);
      d.setDate(d.getDate() + 7);
      expiration = getLocalDate(d);
  } else if (frequency === 'monthly') {
      seedBase = getStartOfMonth(new Date());
      const d = new Date(seedBase);
      d.setMonth(d.getMonth() + 1);
      expiration = getLocalDate(d);
  }

  const currentQuests = existingQuests.filter(q => q.frequency === frequency && q.generatedAt === seedBase);
  if (currentQuests.length > 0) return currentQuests;

  let pool = ALL_QUEST_TEMPLATES.filter(q => q.frequency === frequency);
  if (user.plan !== 'pro') {
      pool = pool.filter(q => !q.isPro);
  }

  const count = frequency === 'daily' ? 3 : frequency === 'weekly' ? 3 : 2;
  
  const newQuests: ActiveQuest[] = [];
  const seed = getSeedFromDate(seedBase) + user.email.length;
  const usedIndices = new Set<number>();

  for (let i = 0; i < count; i++) {
      if (pool.length === 0) break;
      
      let index = Math.floor(seededRandom(seed + i) * pool.length);
      let attempts = 0;
      while(usedIndices.has(index) && attempts < 20) {
          index = (index + 1) % pool.length;
          attempts++;
      }
      usedIndices.add(index);

      const template = pool[index];
      newQuests.push({
          ...template,
          currentValue: 0,
          isCompleted: false,
          generatedAt: seedBase,
          expiresAt: expiration
      });
  }

  return newQuests;
};

// --- EVALUATION ---

export const evaluateQuests = (quests: ActiveQuest[], cycles: Cycle[], user: User): { updatedQuests: ActiveQuest[], xpGained: number } => {
    let xpGained = 0;
    const today = getLocalDate();
    const todayCycles = cycles.filter(c => c.date === today);
    
    const updatedQuests = quests.map(q => {
        if (q.isCompleted) return q;

        let relevantCycles = cycles;
        if (q.frequency === 'daily') relevantCycles = todayCycles;

        let value = 0;
        
        switch(q.type) {
            case 'volume': value = relevantCycles.length; break;
            case 'profit': value = relevantCycles.reduce((sum, c) => sum + c.profit, 0); break;
            case 'tags': value = relevantCycles.filter(c => c.tags && c.tags.length > 0).length; break;
            case 'discipline':
                if (q.id === 'd_no_tilt') {
                   const hasTilt = relevantCycles.some(c => c.profit < -100);
                   value = hasTilt ? 0 : 1;
                } 
                break;
            case 'time':
                if (q.id === 'd_morning') value = relevantCycles.filter(c => new Date(c.createdAt).getHours() < 12).length;
                if (q.id === 'd_night') value = relevantCycles.filter(c => new Date(c.createdAt).getHours() >= 20).length;
                break;
            case 'streak':
                let maxStreak = 0;
                let currentStreak = 0;
                const sorted = [...relevantCycles].sort((a,b) => (a.createdAt || 0) - (b.createdAt || 0));
                for(const c of sorted) {
                    if(c.profit > 0) currentStreak++; else currentStreak = 0;
                    if(currentStreak > maxStreak) maxStreak = currentStreak;
                }
                value = maxStreak;
                break;
            case 'consistency':
                 const uniqueDays = new Set(relevantCycles.map(c => c.date)).size;
                 value = uniqueDays;
                 break;
        }

        if (value >= q.targetValue) {
            xpGained += q.rewardXP;
            return { ...q, currentValue: value, isCompleted: true };
        }

        return { ...q, currentValue: value };
    });

    return { updatedQuests, xpGained };
};

export const evaluateAchievements = (achievements: Achievement[], cycles: Cycle[]): { updatedAchievements: Achievement[], newUnlocks: Achievement[] } => {
    const newUnlocks: Achievement[] = [];
    
    const totalVolume = cycles.length;
    const totalProfit = cycles.reduce((acc, c) => acc + c.profit, 0);
    const totalChests = cycles.reduce((acc, c) => acc + c.chest, 0);

    const updatedAchievements = achievements.map(ach => {
        if (ach.isUnlocked) return ach;

        let unlocked = false;
        let current = 0;

        if (ach.id.startsWith('ach_vol')) {
            current = totalVolume;
            if (totalVolume >= (ach.targetValue || 0)) unlocked = true;
        }
        else if (ach.id.startsWith('ach_prof')) {
            current = totalProfit;
            if (totalProfit >= (ach.targetValue || 0)) unlocked = true;
        }
        else if (ach.id === 'ach_win') {
             if (cycles.some(c => c.profit > 0)) unlocked = true;
        }
        else if (ach.id === 'ach_chest') {
            current = totalChests;
            if (totalChests >= (ach.targetValue || 0)) unlocked = true;
        }

        if (unlocked) {
            const newAch = { ...ach, isUnlocked: true, unlockedAt: Date.now(), currentValue: current, progress: 100 };
            newUnlocks.push(newAch);
            return newAch;
        }

        const progress = ach.targetValue ? Math.min(100, (current / ach.targetValue) * 100) : 0;
        return { ...ach, currentValue: current, progress };
    });

    return { updatedAchievements, newUnlocks };
};