
import { supabase } from '../lib/supabase';
import { Cycle, AppSettings, DashboardPeriod, AdvancedStats, Badge } from '../types';
import { getLocalDate } from '../utils/dateUtils';
import { v4 as uuidv4 } from 'uuid';

// --- HELPER: Safe Float Parser (Universal) ---
// Converte "R$ 1.500,00", "1500.00", "1,500.00" para number puro (1500.00)
const safeFloat = (value: any): number => {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (!value) return 0;
  
  let str = String(value).trim();
  
  // Remove símbolos de moeda e espaços
  str = str.replace(/[R$\s]/g, '');

  // Detecta formato brasileiro (ponto como milhar, vírgula como decimal)
  // Ex: 1.500,00 -> Se tem vírgula e ponto, e a vírgula é o último separador
  if (str.includes(',') && str.includes('.')) {
     const lastDot = str.lastIndexOf('.');
     const lastComma = str.lastIndexOf(',');
     if (lastComma > lastDot) {
         // Formato BR: remove pontos, troca vírgula por ponto
         str = str.replace(/\./g, '').replace(',', '.');
     } else {
         // Formato US com separadores: remove vírgulas
         str = str.replace(/,/g, '');
     }
  } else if (str.includes(',')) {
     // Apenas vírgula (ex: 50,00) -> troca por ponto
     str = str.replace(',', '.');
  }

  const result = parseFloat(str);
  return isNaN(result) ? 0 : Number(result.toFixed(2));
};

// --- HELPER: Normalizer (Mapper Snake_case -> CamelCase) ---
export const normalizeCycle = (c: any): Cycle => {
  if (!c) return {} as Cycle; // Safety Check

  const deposit = safeFloat(c.deposit);
  const withdrawal = safeFloat(c.withdrawal);
  const chest = safeFloat(c.chest);
  
  let profit = safeFloat(c.profit);
  
  // Fallback de consistência matemática
  if (c.profit === null || c.profit === undefined) {
      profit = Number(((withdrawal + chest) - deposit).toFixed(2));
  }

  return {
    id: c.id,
    date: c.date, // YYYY-MM-DD direto do banco
    deposit: deposit,
    withdrawal: withdrawal,
    chest: chest,
    profit: profit, 
    notes: c.notes || '',
    platform: c.platform || 'Outros',
    tags: Array.isArray(c.tags) ? c.tags : [],
    createdAt: c.created_at ? new Date(c.created_at).getTime() : Date.now(),
    deletedAt: c.deleted_at ? new Date(c.deleted_at).getTime() : null
  };
};

// --- HELPER: Payload Cleaner ---
const preparePayload = (data: Partial<Cycle>, userId: string) => {
    const deposit = safeFloat(data.deposit);
    const withdrawal = safeFloat(data.withdrawal);
    const chest = safeFloat(data.chest);
    
    // Cálculo de lucro mandatório no backend para evitar inconsistência
    const profit = Number(((withdrawal + chest) - deposit).toFixed(2));

    return {
        user_id: userId,
        date: data.date || getLocalDate(),
        deposit,
        withdrawal,
        chest,
        profit,
        platform: data.platform || 'Outros',
        notes: data.notes || '',
        tags: Array.isArray(data.tags) ? data.tags : [], 
        updated_at: new Date().toISOString()
    };
};

// --- CRUD OPERATIONS ---

export const fetchCycles = async (userId: string): Promise<Cycle[]> => {
  if (!userId) return [];

  const { data, error } = await supabase
    .from('cycles')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar ciclos:', JSON.stringify(error, null, 2));
    return []; 
  }

  return (data || []).map(normalizeCycle);
};

export const saveCycle = async (userId: string, cycleData: Omit<Cycle, 'id' | 'createdAt'> & { profit?: number }) => {
  // RETRY LOGIC: Tenta salvar até 3 vezes se der erro de rede
  const MAX_RETRIES = 3;
  let attempt = 0;
  let lastError = null;

  while (attempt < MAX_RETRIES) {
      try {
        const payload = {
            ...preparePayload(cycleData, userId),
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabase.from('cycles').insert([payload]).select().single();

        if (!error && data) {
            return { data: normalizeCycle(data), error: null };
        }
        
        // Se o erro for específico de sessão, tenta atualizar a sessão antes de tentar de novo
        if (error && (error.code === 'PGRST301' || error.message.includes('JWT'))) {
             await supabase.auth.refreshSession();
        }

        lastError = error;
        throw error; // Força cair no catch para retry

      } catch (err: any) {
        lastError = err;
        attempt++;
        // Espera exponencial: 500ms, 1000ms...
        if (attempt < MAX_RETRIES) {
            await new Promise(r => setTimeout(r, 500 * attempt));
            console.warn(`Tentativa de salvar falhou (${attempt}/${MAX_RETRIES}). Tentando novamente...`);
        }
      }
  }

  console.error("Erro Definitivo ao salvar ciclo:", lastError);
  return { data: null, error: lastError };
};

export const saveCyclesBatch = async (userId: string, cyclesData: Partial<Cycle>[]) => {
  if (!cyclesData.length) return { count: 0, error: null };

  const payload = cyclesData.map(c => ({
    ...preparePayload(c, userId),
    created_at: new Date().toISOString()
  }));

  const { data, error } = await supabase.from('cycles').insert(payload).select();
  
  if (error) console.error("Erro no salvamento em lote:", JSON.stringify(error, null, 2));
  return { count: data?.length || 0, error };
};

export const updateCycle = async (userId: string, id: string, data: Partial<Cycle>) => {
  try {
    const payload = preparePayload(data, userId);
    
    // Removemos chaves que não devem ser alteradas no update
    delete (payload as any).user_id; 
    delete (payload as any).created_at;

    const { data: updatedRecord, error } = await supabase
      .from('cycles')
      .update(payload)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
        console.error("Erro ao atualizar ciclo:", error);
        return { data: null, error };
    }

    if (!updatedRecord) return { data: null, error: new Error("No data returned from update") };

    return { data: normalizeCycle(updatedRecord), error: null };
  } catch (e: any) {
    return { data: null, error: e };
  }
};

export const softDeleteCycle = async (userId: string, id: string) => {
  const { error } = await supabase
    .from('cycles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId);
  
  if (error) console.error('Erro ao deletar:', JSON.stringify(error, null, 2));
  return { error };
};

// --- SETTINGS & TAGS ---

export const fetchTags = async (userId: string): Promise<string[]> => {
    const { data } = await supabase.rpc('get_unique_tags', { userid: userId }); 
    if (!data) return [];
    return data.map((d: any) => d.tag);
};

export const saveSettings = async (userId: string, settings: AppSettings) => {
  try {
    const { data: current, error: fetchError } = await supabase.from('profiles').select('settings').eq('id', userId).single();
    
    if (!fetchError || fetchError.code !== 'PGRST204') {
        const newSettings = { ...(current?.settings || {}), ...settings };
        await supabase.from('profiles').update({ settings: newSettings }).eq('id', userId);
    }
    await supabase.auth.updateUser({ data: { settings: settings } });

  } catch (error) {
    console.error("Erro ao salvar configurações:", error);
  }
};

export const getSettings = (userId: string): AppSettings => ({ monthlyGoal: 5000 });

// --- TRASH & UTILS ---

export const getTrash = async (userId: string): Promise<Cycle[]> => {
    const { data, error } = await supabase
        .from('cycles')
        .select('*')
        .eq('user_id', userId)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });
    
    if (error) return [];
    return (data || []).map(normalizeCycle);
};

export const restoreCycle = async (userId: string, id: string) => {
    await supabase.from('cycles').update({ deleted_at: null }).eq('id', id).eq('user_id', userId);
};

export const permanentDeleteCycle = async (userId: string, id: string) => {
    await supabase.from('cycles').delete().eq('id', id).eq('user_id', userId);
};

// --- IMPORT / EXPORT ---

const normalizeCycleData = (raw: any, userId: string): any => {
    const deposit = safeFloat(raw.deposit);
    const withdrawal = safeFloat(raw.withdrawal);
    const chest = safeFloat(raw.chest);
    const profit = raw.profit !== undefined ? safeFloat(raw.profit) : ((withdrawal + chest) - deposit);
    
    return {
        id: (raw.id && raw.id.length > 10) ? raw.id : undefined,
        user_id: userId,
        date: getLocalDate(raw.date || raw.dateString),
        deposit,
        withdrawal,
        chest,
        profit, 
        platform: raw.platform || 'Outros',
        notes: raw.notes || '',
        tags: Array.isArray(raw.tags) ? raw.tags : (raw.tagsList || []),
        created_at: raw.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString(),
        deleted_at: null
    };
};

export const importData = async (userId: string, jsonString: string): Promise<boolean> => {
    try {
        const parsed = JSON.parse(jsonString);
        let cyclesRaw: any[] = [];

        if (Array.isArray(parsed)) cyclesRaw = parsed;
        else if (parsed.cycles && Array.isArray(parsed.cycles)) cyclesRaw = parsed.cycles;
        else return false;

        if (cyclesRaw.length === 0) return true;

        const normalizedData = cyclesRaw.map(c => normalizeCycleData(c, userId));
        const { error } = await supabase.from('cycles').insert(normalizedData);

        if (error) {
            console.error("Erro no import DB:", JSON.stringify(error, null, 2));
            return false;
        }
        return true;
    } catch (e) {
        console.error("Erro na importação:", e);
        return false;
    }
};

export const exportData = async (userId: string): Promise<string> => {
    const cycles = await fetchCycles(userId);
    const backup = {
        userId,
        exportedAt: new Date().toISOString(),
        cycles,
        version: "3.0 (SQL)"
    };
    return JSON.stringify(backup, null, 2);
};

export const exportCSV = async (userId: string): Promise<string> => {
    const cycles = await fetchCycles(userId);
    let csv = "ID,Data,Plataforma,Entrada,Saida,Bau,Lucro,Tags,Notas\n";
    cycles.forEach(c => {
        const tagsStr = c.tags ? c.tags.join(';') : '';
        csv += `${c.id},${c.date},${c.platform},${c.deposit},${c.withdrawal},${c.chest},${c.profit},"${tagsStr}","${c.notes}"\n`;
    });
    return csv;
};

// --- HARD RESET ---
export const clearAllData = async (userId: string) => {
    try {
        await supabase.from('cycles').delete().eq('user_id', userId);
        await supabase.from('missions').delete().eq('user_id', userId);
        await supabase.from('achievements').delete().eq('user_id', userId);
        
        const defaultGamification = { level: 1, titles: ["Novato"], currentXP: 0, totalXP: 0 };
        await supabase.from('profiles').update({
            settings: { monthlyGoal: 5000, gamification: defaultGamification }
        }).eq('id', userId);

        await supabase.auth.updateUser({
            data: { gamification: defaultGamification, alerts: [], reports: [] }
        });

    } catch (e) {
        console.error("Erro no Hard Reset:", e);
        throw e;
    }
};

// --- ANALYTICS ---

export const filterCyclesByPeriod = (cycles: Cycle[], period: DashboardPeriod): Cycle[] => {
  if (!cycles?.length) return [];
  if (period === 'all') return cycles;
  
  const todayStr = getLocalDate();

  if (period === 'daily') return cycles.filter(c => c.date === todayStr);

  const now = new Date();
  now.setHours(0,0,0,0);
  let threshold = 0;

  if (period === 'weekly') {
    threshold = now.getTime() - (6 * 24 * 60 * 60 * 1000);
  } else if (period === 'monthly') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    threshold = startOfMonth.getTime();
  }

  return cycles.filter(c => {
      const [y, m, d] = c.date.split('-').map(Number);
      return new Date(y, m - 1, d).getTime() >= threshold;
  });
};

export const getDashboardStats = (cycles: Cycle[]) => {
  const stats = {
    totalProfit: 0, dailyProfit: 0, yesterdayProfit: 0,
    totalDeposit: 0, totalWithdrawal: 0, totalChests: 0,
    weeklyProfit: 0, monthlyProfit: 0, projectedProfit: 0, count: cycles.length
  };

  if (!cycles.length) return stats;

  const todayStr = getLocalDate();
  const now = new Date();
  const yesterday = new Date(now); 
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDate(yesterday);
  
  const weekThreshold = new Date().getTime() - (7 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  for (const cycle of cycles) {
    const [y, m, d] = cycle.date.split('-').map(Number);
    const cycleTime = new Date(y, m - 1, d).getTime();
    
    // Ensure numbers for stats
    const prof = safeFloat(cycle.profit);
    const dep = safeFloat(cycle.deposit);
    const wd = safeFloat(cycle.withdrawal);
    const ch = safeFloat(cycle.chest);

    stats.totalProfit += prof;
    stats.totalDeposit += dep;
    stats.totalWithdrawal += wd;
    stats.totalChests += ch;

    if (cycle.date === todayStr) stats.dailyProfit += prof;
    if (cycle.date === yesterdayStr) stats.yesterdayProfit += prof;
    if (cycleTime >= weekThreshold) stats.weeklyProfit += prof;
    if (cycleTime >= startOfMonth) stats.monthlyProfit += prof;
  }
  
  const daysPassed = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  stats.projectedProfit = daysPassed > 0 
    ? stats.monthlyProfit + ((stats.monthlyProfit / daysPassed) * (daysInMonth - daysPassed))
    : stats.monthlyProfit;

  return stats;
};

export const getAdvancedStats = (cycles: Cycle[]): AdvancedStats => {
  const total = cycles.length;
  if (total === 0) return { winRate: 0, averageProfit: 0, volatility: 0, trend: 'neutral', riskScore: 0, averageCycleProfit: 0 };

  const wins = cycles.filter(c => c.profit > 0).length;
  const totalProfit = cycles.reduce((a, b) => a + b.profit, 0);
  const winRate = (wins / total) * 100;
  
  const recent = cycles.slice(0, 10);
  const recentProfit = recent.reduce((a,b) => a + b.profit, 0);
  const trend = (recent.length > 0 && (recentProfit / recent.length) > (totalProfit / total)) ? 'up' : 'down';

  return {
    winRate,
    averageProfit: totalProfit / total,
    averageCycleProfit: totalProfit / total,
    volatility: 0,
    trend,
    riskScore: winRate < 50 ? 80 : 20
  };
};

export const getCommonPlatforms = (userId: string) => ['Bet365', 'Betano', 'Stake', 'Blaze', 'Outros'];
export const getCommonTags = (userId: string) => ['madrugada', 'alavancagem', 'teste', 'bonus', 'live', 'mobile', 'bot'];
export const getBadgeForCycle = (cycle: Cycle, avg?: number): Badge | null => cycle.profit > 1000 ? { type: 'high_profit', label: 'Big Win' } : null;
export const getTopCycles = (cycles: Cycle[], limit: number) => cycles.sort((a,b) => b.profit - a.profit).slice(0, limit);

export const getPlatformStats = (cycles: Cycle[]) => {
    const map = new Map<string, {profit: number, count: number}>();
    cycles.forEach(c => {
        const curr = map.get(c.platform) || { profit: 0, count: 0 };
        curr.profit += c.profit;
        curr.count += 1;
        map.set(c.platform, curr);
    });
    
    const arr = Array.from(map.entries()).map(([name, val]) => ({ name, totalProfit: val.profit, count: val.count, winRate: 0 })); 
    const topWinners = arr.filter(p => p.totalProfit > 0).sort((a,b) => b.totalProfit - a.totalProfit).slice(0, 5);
    const topLosers = arr.filter(p => p.totalProfit < 0).sort((a,b) => a.totalProfit - b.totalProfit).slice(0, 5);

    return { topWinners, topLosers };
};

export const getWeekdayStats = (cycles: Cycle[]) => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const stats = days.map(d => ({ name: d, profit: 0 }));
    cycles.forEach(c => {
        const [y,m,d] = c.date.split('-').map(Number);
        const dayIndex = new Date(y, m-1, d).getDay();
        if (stats[dayIndex]) stats[dayIndex].profit += c.profit;
    });
    return stats;
};
