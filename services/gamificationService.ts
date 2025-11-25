
import { Cycle, GamificationProfile, ActiveQuest, Achievement } from '../types';
import { supabase } from '../lib/supabase';

// --- CALCULATIONS ---

export const calculateLevel = (totalProfit: number) => {
  if (totalProfit <= 0) return { level: 1, xp: 0, nextLevelXp: 1000, progress: 0 };
  
  const xp = Math.floor(totalProfit);
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;
  
  const currentLevelBaseXp = 100 * Math.pow(level - 1, 2);
  const nextLevelBaseXp = 100 * Math.pow(level, 2);
  const levelRange = nextLevelBaseXp - currentLevelBaseXp;
  const currentProgress = xp - currentLevelBaseXp;
  
  const progress = Math.min(100, Math.max(0, (currentProgress / levelRange) * 100));

  return { level, xp, nextLevelXp: nextLevelBaseXp, progress };
};

export const calculateStreak = (cycles: Cycle[]) => {
  if (!cycles.length) return 0;
  const sorted = [...cycles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const dates = Array.from(new Set(sorted.map(c => c.date))); 
  
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  const d = new Date(); d.setDate(d.getDate() - 1);
  const yesterday = d.toISOString().split('T')[0];

  if (dates[0] !== today && dates[0] !== yesterday) return 0;

  let currentDate = new Date(dates[0]);
  streak = 1;

  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i]);
    const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    if (diffDays === 1) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }
  return streak;
};

// --- HELPER: Safe Error Logging ---
const logDbError = (context: string, error: any) => {
    // Ignore PGRST204 errors (No Content) if handled by fallback logic
    if (error?.code !== 'PGRST204') {
        const msg = typeof error === 'object' ? JSON.stringify(error, null, 2) : String(error);
        console.warn(`${context}: ${msg}`);
    }
};

// --- DB SYNC OPERATIONS ---

// 1. Load Full Gamification State
export const fetchGamificationState = async (userId: string) => {
    // Try to get from profiles table first
    const { data: profileData, error: profileError } = await supabase.from('profiles').select('settings').eq('id', userId).single();

    let gamificationProfile = profileData?.settings?.gamification;

    // Fallback to User Metadata if not in profiles or profiles lacks settings column
    if (!gamificationProfile || (profileError)) {
         const { data: { user } } = await supabase.auth.getUser();
         gamificationProfile = user?.user_metadata?.gamification;
    }

    // Try/Catch blocks for dedicated tables to prevent app crash if tables don't exist yet
    let missions = [];
    let achievements = [];
    
    try {
        const { data: m } = await supabase.from('missions').select('*').eq('user_id', userId);
        missions = m || [];
    } catch (e) { console.warn("Missions table check failed", e); }

    try {
        const { data: a } = await supabase.from('achievements').select('*').eq('user_id', userId);
        achievements = a || [];
    } catch (e) { console.warn("Achievements table check failed", e); }

    return {
        profile: gamificationProfile,
        missions: missions,
        achievements: achievements
    };
};

// 2. Sync Active Quests (Upsert)
export const syncMissionsToDB = async (userId: string, missions: ActiveQuest[]) => {
    if (!missions.length) return;

    // Mapping payload
    const payload = missions.map(m => ({
        user_id: userId,
        mission_id: m.id,
        progress: m.currentValue || 0,
        target: m.targetValue || 1,
        is_completed: !!m.isCompleted,
        type: m.type,
        frequency: m.frequency,
        expires_at: m.expiresAt || new Date().toISOString(), // Ensure expiry is saved
        updated_at: new Date().toISOString()
    }));

    const { error } = await supabase.from('missions').upsert(payload, { onConflict: 'user_id,mission_id' });
    if (error) logDbError("Erro sync missions", error);
};

// 3. Sync Achievements (Only Insert New Unlocked)
export const syncAchievementsToDB = async (userId: string, achievements: Achievement[]) => {
    const unlocked = achievements.filter(a => a.isUnlocked);
    if (!unlocked.length) return;

    const payload = unlocked.map(a => ({
        user_id: userId,
        id: a.id,
        unlocked_at: a.unlockedAt ? new Date(a.unlockedAt).toISOString() : new Date().toISOString()
    }));

    const { error } = await supabase.from('achievements').upsert(payload, { onConflict: 'user_id,id' });
    if (error) logDbError("Erro sync achievements", error);
};

// 4. Sync Profile Stats (Level, XP)
export const syncGamificationProfileToDB = async (userId: string, profile: GamificationProfile) => {
    // Try to save to profiles.settings first
    const { data: current, error: fetchError } = await supabase.from('profiles').select('settings').eq('id', userId).single();
    
    let savedToProfile = false;

    if (!fetchError) {
         const newSettings = { ...(current?.settings || {}), gamification: profile };
         const { error: updateError } = await supabase.from('profiles').update({ settings: newSettings }).eq('id', userId);
         
         if (!updateError) {
             savedToProfile = true;
         } else {
             logDbError("Erro sync gamification profile (Table)", updateError);
         }
    }

    // Fallback: Save to User Metadata ALWAYS if table update fails
    if (!savedToProfile) {
        const { error: metaError } = await supabase.auth.updateUser({
            data: { gamification: profile }
        });
        if (metaError) logDbError("Erro sync gamification profile (Metadata)", metaError);
    }
};
