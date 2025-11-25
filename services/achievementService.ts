import { Cycle, Achievement } from '../types';

export const calculateAchievements = (cycles: Cycle[]): Achievement[] => {
  const totalProfit = cycles.reduce((sum, c) => sum + c.profit, 0);
  const totalChests = cycles.reduce((sum, c) => sum + c.chest, 0);
  const maxProfitInOneCycle = Math.max(...cycles.map(c => c.profit), 0);
  
  // Logic for streaks (Sniper)
  const sortedCycles = [...cycles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  let currentStreak = 0;
  let maxStreak = 0;
  // Simple streak logic: consecutive cycles with profit > 0
  // Note: Realistically this should check consecutive DAYS, but for simplicity we check cycles here.
  // Optimization: We iterate once.
  for (const c of sortedCycles) {
    if (c.profit > 0) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return [
    {
      id: 'first_blood',
      title: 'First Blood',
      description: 'Registre sua primeira operação no sistema.',
      iconName: 'zap',
      isUnlocked: cycles.length > 0,
      color: 'primary',
      rewardXP: 100
    },
    {
      id: 'sniper',
      title: 'Sniper',
      description: '5 operações seguidas com lucro positivo.',
      iconName: 'target',
      isUnlocked: maxStreak >= 5,
      progress: Math.min(Math.floor((maxStreak / 5) * 100), 100),
      color: 'profit',
      rewardXP: 500
    },
    {
      id: 'high_roller',
      title: 'High Roller',
      description: 'Faça um único ciclo com lucro acima de R$ 1.000,00.',
      iconName: 'banknote',
      isUnlocked: maxProfitInOneCycle >= 1000,
      color: 'profit',
      rewardXP: 1000
    },
    {
      id: 'diamond_hands',
      title: 'Diamond Hands',
      description: 'Acumule um lucro total de R$ 10.000,00 em caixa.',
      iconName: 'gem',
      isUnlocked: totalProfit >= 10000,
      progress: Math.min(Math.max(0, Math.floor((totalProfit / 10000) * 100)), 100),
      color: 'primary',
      rewardXP: 2000
    },
    {
      id: 'cpa_master',
      title: 'Caçador de Bônus',
      description: 'Acumule R$ 5.000,00 apenas em Baús (CPA).',
      iconName: 'trophy',
      isUnlocked: totalChests >= 5000,
      progress: Math.min(Math.floor((totalChests / 5000) * 100), 100),
      color: 'gold',
      rewardXP: 1500
    },
    {
      id: 'iron_shield',
      title: 'Escudo de Ferro',
      description: 'Complete 50 ciclos registrados no total.',
      iconName: 'shield',
      isUnlocked: cycles.length >= 50,
      progress: Math.min(Math.floor((cycles.length / 50) * 100), 100),
      color: 'loss', // Using the 'red' color for aggressive grinding
      rewardXP: 800
    }
  ];
};