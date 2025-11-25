
import { QuestTemplate, Achievement } from '../types';

// --- QUEST TEMPLATES DATABASE ---

export const DAILY_QUESTS: QuestTemplate[] = [
  { id: 'd_start', title: 'Aquecimento', description: 'Registre ao menos 1 operação.', difficulty: 'easy', frequency: 'daily', type: 'volume', targetValue: 1, rewardXP: 50, icon: 'sword' },
  { id: 'd_vol_5', title: 'Mão na Massa', description: 'Complete 5 ciclos hoje.', difficulty: 'medium', frequency: 'daily', type: 'volume', targetValue: 5, rewardXP: 100, icon: 'zap' },
  { id: 'd_vol_10', title: 'Hard Work', description: 'Registre 10 operações hoje.', difficulty: 'hard', frequency: 'daily', type: 'volume', targetValue: 10, rewardXP: 200, icon: 'fire' },
  { id: 'd_green', title: 'Dia Verde', description: 'Termine o dia no positivo.', difficulty: 'medium', frequency: 'daily', type: 'profit', targetValue: 1, rewardXP: 150, icon: 'target' },
  { id: 'd_profit_100', title: 'Centenário', description: 'Lucre R$ 100,00 hoje.', difficulty: 'medium', frequency: 'daily', type: 'profit', targetValue: 100, rewardXP: 120, icon: 'banknote' } as any,
  { id: 'd_profit_500', title: 'Meta Batida', description: 'Atinja R$ 500,00 de lucro hoje.', difficulty: 'hard', frequency: 'daily', type: 'profit', targetValue: 500, rewardXP: 300, icon: 'star' },
  { id: 'd_no_tilt', title: 'Zero Tilt', description: 'Não tenha nenhum prejuízo > R$ 100 hoje.', difficulty: 'medium', frequency: 'daily', type: 'discipline', targetValue: 1, rewardXP: 150, icon: 'shield' },
  { id: 'd_tags', title: 'Organizado', description: 'Use tags em 3 ciclos.', difficulty: 'easy', frequency: 'daily', type: 'tags', targetValue: 3, rewardXP: 80, icon: 'star' },
  { id: 'd_morning', title: 'Operador Matinal', description: 'Registre 2 ciclos antes do meio-dia.', difficulty: 'easy', frequency: 'daily', type: 'time', targetValue: 2, rewardXP: 70, icon: 'clock' },
  { id: 'd_night', title: 'Turno da Noite', description: 'Registre 2 ciclos após as 20h.', difficulty: 'easy', frequency: 'daily', type: 'time', targetValue: 2, rewardXP: 70, icon: 'clock' },
  { id: 'd_streak_3', title: 'Hat-Trick', description: '3 vitórias seguidas hoje.', difficulty: 'hard', frequency: 'daily', type: 'streak', targetValue: 3, rewardXP: 250, icon: 'zap' },
  { id: 'd_pro_sniper', title: 'Sniper Elite (PRO)', description: '5 ciclos hoje sem NENHUM loss.', difficulty: 'pro', frequency: 'daily', type: 'streak', targetValue: 5, rewardXP: 500, isPro: true, icon: 'target' },
  { id: 'd_pro_grind', title: 'Grinder Pro (PRO)', description: '20 ciclos em um único dia.', difficulty: 'pro', frequency: 'daily', type: 'volume', targetValue: 20, rewardXP: 400, isPro: true, icon: 'sword' },
];

export const WEEKLY_QUESTS: QuestTemplate[] = [
  { id: 'w_active_4', title: 'Presença', description: 'Opere em 4 dias diferentes esta semana.', difficulty: 'medium', frequency: 'weekly', type: 'consistency', targetValue: 4, rewardXP: 400, icon: 'clock' },
  { id: 'w_profit_1k', title: 'Salário Semanal', description: 'Acumule R$ 1.000 de lucro na semana.', difficulty: 'hard', frequency: 'weekly', type: 'profit', targetValue: 1000, rewardXP: 600, icon: 'banknote' } as any,
  { id: 'w_vol_50', title: 'Volume Alto', description: '50 ciclos na semana.', difficulty: 'hard', frequency: 'weekly', type: 'volume', targetValue: 50, rewardXP: 500, icon: 'fire' },
  { id: 'w_tags_master', title: 'Analista', description: 'Use tags em 20 ciclos.', difficulty: 'medium', frequency: 'weekly', type: 'tags', targetValue: 20, rewardXP: 300, icon: 'star' },
  { id: 'w_no_red_day', title: 'Semana Invicta', description: 'Nenhum dia negativo na semana (min 3 dias).', difficulty: 'hard', frequency: 'weekly', type: 'discipline', targetValue: 1, rewardXP: 1000, icon: 'shield' },
  { id: 'w_pro_whale', title: 'Baleia (PRO)', description: 'R$ 5.000 de lucro na semana.', difficulty: 'pro', frequency: 'weekly', type: 'profit', targetValue: 5000, rewardXP: 2000, isPro: true, icon: 'star' },
];

export const MONTHLY_QUESTS: QuestTemplate[] = [
  { id: 'm_marathon', title: 'Maratonista', description: '15 dias operados no mês.', difficulty: 'medium', frequency: 'monthly', type: 'consistency', targetValue: 15, rewardXP: 1500, icon: 'clock' },
  { id: 'm_volume_200', title: 'Operador de Elite', description: '200 ciclos no mês.', difficulty: 'hard', frequency: 'monthly', type: 'volume', targetValue: 200, rewardXP: 2000, icon: 'sword' },
  { id: 'm_profit_goal', title: 'Bater a Meta', description: 'Atinja sua meta mensal configurada.', difficulty: 'hard', frequency: 'monthly', type: 'profit', targetValue: 1, rewardXP: 2500, icon: 'target' },
  { id: 'm_pro_legend', title: 'Lenda Viva (PRO)', description: 'Mês sem dias negativos (min 15 dias).', difficulty: 'pro', frequency: 'monthly', type: 'discipline', targetValue: 1, rewardXP: 5000, isPro: true, icon: 'star' },
];

export const ALL_QUEST_TEMPLATES = [...DAILY_QUESTS, ...WEEKLY_QUESTS, ...MONTHLY_QUESTS];

// --- ACHIEVEMENTS DATABASE ---

export const ACHIEVEMENTS_DB: Achievement[] = [
  // Basics
  { id: 'ach_start', title: 'Primeiro Passo', description: 'Registre seu primeiro ciclo.', iconName: 'target', isUnlocked: false, color: 'primary', rewardXP: 50 },
  { id: 'ach_win', title: 'Primeiro Green', description: 'Tenha seu primeiro lucro.', iconName: 'zap', isUnlocked: false, color: 'profit', rewardXP: 100 },
  
  // Volume
  { id: 'ach_vol_10', title: 'Iniciante', description: '10 Ciclos Registrados', iconName: 'rocket', isUnlocked: false, color: 'primary', rewardXP: 100, targetValue: 10 },
  { id: 'ach_vol_50', title: 'Veterano', description: '50 Ciclos Registrados', iconName: 'rocket', isUnlocked: false, color: 'primary', rewardXP: 300, targetValue: 50 },
  { id: 'ach_vol_100', title: 'Centurião', description: '100 Ciclos Registrados', iconName: 'rocket', isUnlocked: false, color: 'gold', rewardXP: 500, targetValue: 100 },
  { id: 'ach_vol_500', title: 'Mestre do Clique', description: '500 Ciclos Registrados', iconName: 'crown', isUnlocked: false, color: 'purple', rewardXP: 1000, targetValue: 500 },
  { id: 'ach_vol_1000', title: 'Lenda', description: '1000 Ciclos Registrados', iconName: 'rocket', isUnlocked: false, color: 'purple', rewardXP: 5000, targetValue: 1000 },

  // Profit
  { id: 'ach_prof_1k', title: 'Primeiro K', description: 'Lucro total de R$ 1.000', iconName: 'banknote', isUnlocked: false, color: 'profit', rewardXP: 200, targetValue: 1000 },
  { id: 'ach_prof_10k', title: 'High Roller', description: 'Lucro total de R$ 10.000', iconName: 'gem', isUnlocked: false, color: 'gold', rewardXP: 1000, targetValue: 10000 },
  { id: 'ach_prof_50k', title: 'Baleia', description: 'Lucro total de R$ 50.000', iconName: 'crown', isUnlocked: false, color: 'purple', rewardXP: 2500, targetValue: 50000 },

  // Streaks
  { id: 'ach_str_3', title: 'No Fluxo', description: '3 dias seguidos operando.', iconName: 'zap', isUnlocked: false, color: 'primary', rewardXP: 150, targetValue: 3 },
  { id: 'ach_str_7', title: 'Consistente', description: '7 dias seguidos operando.', iconName: 'zap', isUnlocked: false, color: 'gold', rewardXP: 400, targetValue: 7 },
  { id: 'ach_str_30', title: 'Disciplina de Ferro', description: '30 dias seguidos operando.', iconName: 'zap', isUnlocked: false, color: 'purple', rewardXP: 2000, targetValue: 30 },

  // Specifics
  { id: 'ach_sniper', title: 'Mira Laser', description: '10 ciclos seguidos sem loss.', iconName: 'target', isUnlocked: false, color: 'gold', rewardXP: 500 },
  { id: 'ach_chest', title: 'Caçador de Baús', description: 'R$ 5.000 ganhos apenas em bônus.', iconName: 'star', isUnlocked: false, color: 'primary', rewardXP: 600, targetValue: 5000 },

  // Secret Achievements
  { id: 'sec_comeback', title: 'A Fênix', description: 'Recupere um prejuízo diário de R$ 500.', iconName: 'ghost', isUnlocked: false, isSecret: true, color: 'gold', rewardXP: 1000 },
  { id: 'sec_insomniac', title: 'Vampiro', description: 'Opere 5 dias seguidos de madrugada (00h-04h).', iconName: 'ghost', isUnlocked: false, isSecret: true, color: 'purple', rewardXP: 800 },
  { id: 'sec_perfect', title: 'Mão de Deus', description: 'Semana perfeita com 7 dias de lucro (min 50 ciclos).', iconName: 'crown', isUnlocked: false, isSecret: true, color: 'purple', rewardXP: 5000 },
];
