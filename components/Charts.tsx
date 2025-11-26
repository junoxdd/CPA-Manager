import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area, ReferenceLine } from 'recharts';
import { Cycle } from '../types';
import { PlanGate } from './PlanGate';
import { getWeekdayStats } from '../services/cycleService';

interface ChartsProps {
  cycles: Cycle[];
  isPrivacyMode?: boolean;
  isPro: boolean;
  onUpgrade: () => void;
}

const COLOR_PROFIT = '#22c55e';
const COLOR_LOSS = '#fb7185';
const COLOR_GOLD = '#fbbf24';
const COLOR_NEUTRAL = '#64748b';
const COLOR_PRIMARY = '#6366f1';

export const Charts: React.FC<ChartsProps> = React.memo(({ cycles, isPrivacyMode = false, isPro, onUpgrade }) => {
  
  // --- Preparação de Dados (Memoized) ---

  const dailyData = useMemo(() => {
    if (cycles.length === 0) return [];
    const map = new Map<string, number>();
    // Clona e ordena para processamento cronológico
    [...cycles].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).forEach(c => {
      const current = map.get(c.date) || 0;
      map.set(c.date, current + c.profit);
    });
    // Últimos 30 dias de atividade
    return Array.from(map.entries()).map(([date, profit]) => ({
      date: date.split('-').slice(1).join('/'),
      profit,
    })).slice(-30);
  }, [cycles]);

  const averageProfit = useMemo(() => {
      if (dailyData.length === 0) return 0;
      return dailyData.reduce((acc, curr) => acc + curr.profit, 0) / dailyData.length;
  }, [dailyData]);

  const distributionData = useMemo(() => {
    const totalWithdrawal = cycles.reduce((sum, c) => sum + c.withdrawal, 0);
    const totalChests = cycles.reduce((sum, c) => sum + c.chest, 0);
    if (totalWithdrawal === 0 && totalChests === 0) return [];
    return [
      { name: 'Saques', value: totalWithdrawal },
      { name: 'Baús (CPA)', value: totalChests },
    ];
  }, [cycles]);

  const evolutionData = useMemo(() => {
    if (cycles.length === 0) return [];
    let cumulative = 0;
    return [...cycles]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(c => {
        cumulative += c.profit;
        return { date: c.date.split('-').slice(1).join('/'), total: cumulative };
      });
  }, [cycles]);

  // Cálculo pesado movido para service/memo
  const weekdayData = useMemo(() => {
    return isPro ? getWeekdayStats(cycles) : [];
  }, [cycles, isPro]);

  // --- Render Helpers ---

  const formatValue = (val: number) => 
    isPrivacyMode ? 'R$ ****' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      return (
        <div className="glass p-3 border-border shadow-2xl bg-surface/90 backdrop-blur">
          <p className="text-secondary text-xs mb-1 font-mono">{label}</p>
          <p className={`font-mono font-bold ${val >= 0 ? 'text-profit' : 'text-loss'}`}>
            {formatValue(val)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (cycles.length === 0) {
      return <div className="text-center py-8 text-secondary text-sm">Registre ciclos para ver os gráficos.</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      {/* Performance Diária */}
      <div className="glass p-5 lg:col-span-2 border-t border-border bg-surface/50 w-full min-w-0">
        <h3 className="text-sm font-bold text-foreground mb-6 uppercase tracking-widest opacity-80 flex justify-between">
           <span>Performance Diária (30 Dias)</span>
           <span className="text-[10px] text-secondary normal-case">Média: {formatValue(averageProfit)}</span>
        </h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" tick={{fill: '#64748b', fontSize: 10}} axisLine={false} tickLine={false} />
              <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 10}} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'var(--surface-highlight)', opacity: 0.4}} />
              <ReferenceLine y={averageProfit} stroke={COLOR_GOLD} strokeDasharray="3 3" label={{ value: 'Média', fill: COLOR_GOLD, fontSize: 10, position: 'right' }}/>
              <Bar dataKey="profit" radius={[2, 2, 0, 0]}>
                {dailyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? COLOR_PROFIT : COLOR_LOSS} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Melhores Dias - PRO */}
      <PlanGate feature="advanced_charts" isPro={isPro} onUpgrade={onUpgrade} label="Análise por Dia da Semana" className="w-full min-w-0">
        <div className="glass p-5 border-t border-border bg-surface/50 h-full w-full">
            <h3 className="text-sm font-bold text-foreground mb-6 uppercase tracking-widest opacity-80">Melhores Dias</h3>
            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weekdayData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b', fontSize: 10}} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: 'var(--surface-highlight)', opacity: 0.4}} />
                        <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                            {weekdayData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? COLOR_PRIMARY : COLOR_LOSS} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </PlanGate>

      {/* Distribuição */}
      <div className="glass p-5 border-t border-border bg-surface/50 w-full min-w-0">
        <h3 className="text-sm font-bold text-foreground mb-6 uppercase tracking-widest opacity-80">Origem dos Ganhos</h3>
        {distributionData.length > 0 ? (
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distributionData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  <Cell key="cell-0" fill={COLOR_NEUTRAL} stroke="none" />
                  <Cell key="cell-1" fill={COLOR_GOLD} stroke="none" />
                </Pie>
                <Tooltip contentStyle={{backgroundColor:'var(--surface)', borderColor:'var(--border)', borderRadius:'0px', color: 'var(--foreground)'}} itemStyle={{color:'var(--foreground)'}} formatter={(val:number)=>formatValue(val)} />
                <Legend verticalAlign="bottom" iconType="square" wrapperStyle={{ color: 'var(--secondary)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[250px] w-full flex items-center justify-center text-xs text-secondary">Dados insuficientes</div>
        )}
      </div>

      {/* Evolução - PRO */}
      <PlanGate feature="advanced_charts" isPro={isPro} onUpgrade={onUpgrade} label="Gráfico de Evolução" className="lg:col-span-2 w-full min-w-0">
        <div className="glass p-5 border-t border-border bg-surface/50 h-full">
          <h3 className="text-sm font-bold text-foreground mb-6 uppercase tracking-widest opacity-80">Evolução de Caixa</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolutionData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLOR_PRIMARY} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLOR_PRIMARY} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" tick={{fill: '#64748b', fontSize: 10}} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 10}} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="total" stroke={COLOR_PRIMARY} strokeWidth={3} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </PlanGate>

    </div>
  );
});