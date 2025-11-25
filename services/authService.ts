
import { supabase } from '../lib/supabase';
import { User } from '../types';

/**
 * Mapeia o usuário do Supabase e o perfil do banco para o tipo interno User.
 */
export const mapSupabaseUser = (sbUser: any, profile: any): User => {
  const metadata = sbUser.user_metadata || {};
  const dbProfile = profile || {};
  
  return {
    id: sbUser.id,
    email: sbUser.email || '',
    name: dbProfile.name || metadata.name || sbUser.email?.split('@')[0] || 'Operador',
    nickname: dbProfile.nickname || metadata.nickname,
    phone: dbProfile.phone || metadata.phone,
    bio: dbProfile.bio || metadata.bio,
    plan: 'pro', // Force PRO for everyone in this version
    trialEndsAt: null, 
    planStartedAt: dbProfile.created_at ? new Date(dbProfile.created_at).getTime() : Date.now(),
    avatarUrl: dbProfile.avatar_url || metadata.avatar_url || `https://ui-avatars.com/api/?name=${sbUser.email?.split('@')[0]}&background=6366f1&color=fff`,
    
    preferences: dbProfile.settings || metadata.settings || { monthlyGoal: 5000 },
    gamificationState: dbProfile.settings?.gamification || metadata.gamification || undefined,
    
    alerts: metadata.alerts || [], 
    reports: metadata.reports || []
  };
};

/**
 * Garante que o perfil do usuário exista no banco de dados.
 * Se não existir (usuário antigo), cria na hora para evitar erros de Foreign Key.
 */
export const ensureUserProfile = async (sessionUser: any): Promise<User | null> => {
    if (!sessionUser) return null;

    // 1. Tenta buscar o perfil existente
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .maybeSingle();

    // 2. Se encontrou, retorna mapeado
    if (profile) {
        return mapSupabaseUser(sessionUser, profile);
    }

    // 3. Se não encontrou, CRIA O PERFIL (Self-Healing)
    console.log("Perfil não encontrado no DB. Criando automaticamente...");
    
    const newProfilePayload = {
        id: sessionUser.id,
        email: sessionUser.email,
        name: sessionUser.user_metadata?.name || sessionUser.email?.split('@')[0] || 'Operador',
        settings: { monthlyGoal: 5000, gamification: { level: 1, titles: ["Novato"], currentXP: 0 } }
    };

    const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert([newProfilePayload])
        .select()
        .single();

    if (insertError) {
        console.error("Erro fatal ao criar perfil automático:", insertError);
        // Retorna um objeto de usuário "in memory" para não travar o app, 
        // mas funcionalidades de banco podem falhar.
        return mapSupabaseUser(sessionUser, null);
    }

    return mapSupabaseUser(sessionUser, newProfile);
};

export const updateProfile = async (userId: string, updates: Partial<User>) => {
  try {
    const profileUpdates: any = { updated_at: new Date().toISOString() };
    const { data: current } = await supabase.from('profiles').select('settings').eq('id', userId).single();
    let currentSettings = current?.settings || {};

    if (updates.name !== undefined) profileUpdates.name = updates.name;
    if (updates.nickname !== undefined) profileUpdates.nickname = updates.nickname;
    if (updates.phone !== undefined) profileUpdates.phone = updates.phone;
    if (updates.bio !== undefined) profileUpdates.bio = updates.bio;
    if (updates.avatarUrl !== undefined) profileUpdates.avatar_url = updates.avatarUrl;
    
    if (updates.preferences !== undefined) {
       currentSettings = { ...currentSettings, ...updates.preferences };
       profileUpdates.settings = currentSettings;
    }
    
    if (updates.gamificationState !== undefined) {
        currentSettings = { ...currentSettings, gamification: updates.gamificationState };
        profileUpdates.settings = currentSettings;
    }

    const { error: dbError } = await supabase.from('profiles').update(profileUpdates).eq('id', userId);

    if (dbError) {
      console.error("Erro ao atualizar perfil:", dbError);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Erro crítico ao atualizar perfil:', error);
    return false;
  }
};

export const updateUserPlan = async (user: User): Promise<User> => {
  // Mock implementation since we are forcing PRO in mapSupabaseUser
  // In a real implementation, this would persist plan changes to DB
  return user;
};
