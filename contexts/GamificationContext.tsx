
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { GamificationProfile, ActiveQuest, Achievement } from '../types';
import { ACHIEVEMENTS_DB, ALL_QUEST_TEMPLATES } from '../services/gamificationLibrary';
import { generateQuestsForPeriod, evaluateQuests, evaluateAchievements } from '../services/gamificationEngine';
import { fetchGamificationState, syncMissionsToDB, syncAchievementsToDB, syncGamificationProfileToDB } from '../services/gamificationService';
import { useCyclesContext } from './CycleContext';
import { useUI } from './UIContext';

interface GamificationContextType {
  profile: GamificationProfile;
  activeQuests: ActiveQuest[];
  achievements: Achievement[];
  refreshGamification: () => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

const INITIAL_PROFILE: GamificationProfile = {
  level: 1,
  currentXP: 0,
  nextLevelXP: 1000,
  totalXP: 0,
  streakDays: 0,
  lastActiveDate: '',
  titles: ['Novato'],
  equippedTitle: 'Novato'
};

export const GamificationProvider: React.FC<{ children: ReactNode, user: any }> = ({ children, user }) => {
  const { cycles } = useCyclesContext();
  const { showToast } = useUI();
  
  const [profile, setProfile] = useState<GamificationProfile>(INITIAL_PROFILE);
  const [activeQuests, setActiveQuests] = useState<ActiveQuest[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS_DB);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. LOAD FROM DB ON MOUNT
  useEffect(() => {
    const loadData = async () => {
        if (!user) return;
        try {
            const { profile: dbProfile, missions: dbMissions, achievements: dbAchievements } = await fetchGamificationState(user.id);
            
            if (dbProfile) {
                // SAFETY MERGE: Ensure arrays like 'titles' are not undefined if missing in DB
                setProfile(prev => ({
                    ...INITIAL_PROFILE, // Base defaults
                    ...dbProfile, // DB overrides
                    titles: (dbProfile.titles && dbProfile.titles.length > 0) ? dbProfile.titles : INITIAL_PROFILE.titles
                }));
            }
            
            // HYDRATION: Map DB missions (raw data) back to full ActiveQuest objects using templates
            if (dbMissions && dbMissions.length > 0) {
                 const hydratedMissions = dbMissions.map((m: any) => {
                     const template = ALL_QUEST_TEMPLATES.find(t => t.id === m.mission_id);
                     if (!template) return null;

                     return {
                         ...template,
                         // Mapping columns with fallbacks
                         currentValue: m.progress !== undefined ? m.progress : (m.current_value || 0),
                         targetValue: m.target !== undefined ? m.target : (m.target_value || template.targetValue),
                         isCompleted: m.is_completed,
                         // DB might not return expires_at if column missing, so we must calculate or fallback
                         expiresAt: m.expires_at || m.created_at || new Date().toISOString(),
                         generatedAt: m.created_at || new Date().toISOString()
                     } as ActiveQuest;
                 }).filter((m): m is ActiveQuest => {
                     if (!m) return false;
                     return true; 
                 });

                 // Filter valid/current based on today's date
                 const validMissions = hydratedMissions.filter(m => {
                    const expiry = new Date(m.expiresAt);
                    // If expiry is invalid or in past, it's expired. However, if DB didn't return expiry (missing column),
                    // we might want to keep it or let the refresh logic regenerate. 
                    // For now, if we have data, we show it.
                    return !isNaN(expiry.getTime());
                 });
                 
                 if (validMissions.length > 0) {
                    setActiveQuests(validMissions);
                 }
            }

            // HYDRATION: Merge DB achievements
            if (dbAchievements && dbAchievements.length > 0) {
                const merged = ACHIEVEMENTS_DB.map(base => {
                    const existing = dbAchievements.find((a: any) => (a.id === base.id) || (a.achievement_id === base.id));
                    return existing ? { 
                        ...base, 
                        isUnlocked: true, 
                        // Fallback for unlockedAt if column missing
                        unlockedAt: existing.unlocked_at ? new Date(existing.unlocked_at).getTime() : Date.now() 
                    } : base;
                });
                setAchievements(merged);
            }

            setIsLoaded(true);
        } catch (e) {
            console.error("Failed to load gamification", e);
        }
    };
    loadData();
  }, [user?.id]);

  // 2. CALCULATION ENGINE
  const refreshGamification = async () => {
      if (!user || isProcessing || !isLoaded) return;
      
      setIsProcessing(true);

      try {
          await new Promise(r => setTimeout(r, 0)); // Tick break

          let currentQuests = [...activeQuests];
          // Generate if empty or missing types
          if (currentQuests.length === 0) {
            const daily = generateQuestsForPeriod(user, 'daily', currentQuests);
            const weekly = generateQuestsForPeriod(user, 'weekly', currentQuests);
            const monthly = generateQuestsForPeriod(user, 'monthly', currentQuests);
            currentQuests = [...daily, ...weekly, ...monthly];
          }

          const { updatedQuests, xpGained: newQuestXP } = evaluateQuests(currentQuests, cycles, user);
          const { updatedAchievements, newUnlocks } = evaluateAchievements(achievements, cycles);
          
          newUnlocks.forEach(u => showToast(`🏆 Conquista: ${u.title}`, 'success'));
          
          const questXP = updatedQuests.filter(q => q.isCompleted).reduce((acc, q) => acc + q.rewardXP, 0);
          const achXP = updatedAchievements.filter(a => a.isUnlocked).reduce((acc, a) => acc + a.rewardXP, 0);
          const totalXP = questXP + achXP;
          
          const level = Math.floor(Math.sqrt(totalXP / 100)) + 1; 
          const nextLevelXP = 100 * Math.pow(level, 2);

          if (level > profile.level) {
              showToast(`🆙 LEVEL UP! Nível ${level}`, 'success');
          }

          const newProfile: GamificationProfile = {
              ...profile,
              level,
              currentXP: totalXP,
              totalXP,
              nextLevelXP,
              lastActiveDate: new Date().toISOString()
          };

          const hasChanged = 
            JSON.stringify(newProfile) !== JSON.stringify(profile) ||
            JSON.stringify(updatedQuests) !== JSON.stringify(activeQuests) ||
            JSON.stringify(updatedAchievements) !== JSON.stringify(achievements);

          if (hasChanged) {
              setProfile(newProfile);
              setActiveQuests(updatedQuests);
              setAchievements(updatedAchievements);

              // SYNC TO DB
              await Promise.all([
                  syncGamificationProfileToDB(user.id, newProfile),
                  syncMissionsToDB(user.id, updatedQuests),
                  syncAchievementsToDB(user.id, updatedAchievements)
              ]);
          }

      } catch (e) {
          console.error("Gamification sync error", e);
      } finally {
          setIsProcessing(false);
      }
  };

  // Trigger refresh on cycle change or load
  useEffect(() => {
      if (user && isLoaded && cycles.length > 0) {
          if (debounceRef.current) clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(() => refreshGamification(), 2000);
      }
      return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [cycles.length, user?.id, isLoaded]);

  return (
    <GamificationContext.Provider value={{ profile, activeQuests, achievements, refreshGamification }}>
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) throw new Error('useGamification must be used within GamificationProvider');
  return context;
};
