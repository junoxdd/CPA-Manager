
import { GoogleGenAI } from "@google/genai";
import { Cycle, DashboardStats, DashboardPeriod } from "../types";
import { formatCurrency } from "../utils/formatters";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MAX_AI_INPUT_LENGTH = 5000;

// --- Helpers ---

const truncate = (str: string, max: number) => str.length > max ? str.slice(0, max) + '...' : str;

const cleanAndParseJSON = (text: string | undefined): any => {
  if (!text) return null;
  try { return JSON.parse(text); } 
  catch { 
    const cleaned = text?.replace(/```json\n?|```/g, '').trim();
    try { return JSON.parse(cleaned || '{}'); } catch { return null; }
  }
};

// --- Core Generator ---

const generateRawInsight = async (
  stats: DashboardStats,
  cycles: Cycle[],
  period: DashboardPeriod
): Promise<string> => {
  try {
    const recentCycles = cycles.slice(0, 10).map(c => 
      `- ${c.date}: ${truncate(c.platform, 20)} | ${c.profit >= 0 ? 'Win' : 'Loss'}: ${formatCurrency(c.profit)}`
    ).join('\n');

    let contextPrompt = "";
    if (period === 'daily') {
        contextPrompt = `CONTEXTO: DIÁRIO. Lucro Hoje: ${formatCurrency(stats.dailyProfit)}. Ops: ${cycles.length}. Recomende ação imediata.`;
    } else if (period === 'weekly') {
        contextPrompt = `CONTEXTO: SEMANAL. Saldo: ${formatCurrency(stats.weeklyProfit)}. Analise consistência.`;
    } else {
        contextPrompt = `CONTEXTO: MENSAL/MACRO. Acumulado: ${formatCurrency(stats.monthlyProfit)}. Projeção: ${formatCurrency(stats.projectedProfit || 0)}. Visão estratégica.`;
    }

    const systemInstruction = `Você é a "CPA Manager IA", especialista em iGaming. Seja técnico, direto e motivador. Máximo 3 frases.`;
    const fullPrompt = `${systemInstruction}\n${contextPrompt}\nDADOS RECENTES:\n${recentCycles}`;

    const response = await ai.models.generateContent({ 
        model: 'gemini-2.5-flash', 
        contents: fullPrompt.slice(0, MAX_AI_INPUT_LENGTH) 
    });
    
    return response.text?.trim() || "Análise indisponível.";
  } catch (error) {
    return "Conexão neural instável.";
  }
};

// --- Neuro-Link (Psychological Profiler) ---

export const getNeuroPsychProfile = async (cycles: Cycle[]): Promise<string | null> => {
  try {
    if (cycles.length < 5) return null;
    const recentCycles = cycles.slice(0, 50);
    const dataSummary = recentCycles.map(c => `${c.date} (${new Date(c.createdAt).getHours()}h): ${c.profit}`).join('\n');

    const systemInstruction = `
      Você é o NEURO-LINK, módulo de psicologia para traders.
      Encontre padrão de risco (dia, horário, perdas).
      Seja curto e misterioso. Ex: "Padrão de falha às sextas detectado."
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${systemInstruction}\nHistórico Recente:\n${dataSummary}`
    });

    return response.text?.trim() || null;
  } catch {
      return null;
  }
};

// --- Public Methods ---

export const generateContextAwareInsight = async (stats: DashboardStats, cycles: Cycle[], period: DashboardPeriod) => {
    // 30% chance to show Neuro-Link if enough data
    if (cycles.length > 10 && Math.random() > 0.7) {
        const neuro = await getNeuroPsychProfile(cycles);
        if (neuro) return `🧠 NEURO-LINK: ${neuro}`;
    }
    return generateRawInsight(stats, cycles, period);
};

// --- OCR & Parsing ---

export const extractDataFromScreenshot = async (base64Image: string): Promise<Partial<Cycle> | null> => {
  try {
    const base64Data = base64Image.includes('base64,') ? base64Image.split('base64,')[1] : base64Image;
    const prompt = `Analise print de aposta. Identifique: Deposit, Withdrawal (0 se perdeu), Platform, Date (YYYY-MM-DD). JSON Only.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ inlineData: { mimeType: 'image/png', data: base64Data } }, { text: prompt }] },
      config: { responseMimeType: 'application/json' }
    });
    
    const parsed = cleanAndParseJSON(response.text);
    if (parsed && (parsed.deposit !== undefined || parsed.withdrawal !== undefined)) {
        return {
            deposit: Math.abs(Number(parsed.deposit) || 0),
            withdrawal: Math.abs(Number(parsed.withdrawal) || 0),
            platform: parsed.platform || undefined,
            date: parsed.date || undefined,
            chest: 0
        };
    }
    return null;
  } catch { return null; }
};

export const parseTextHistory = async (rawText: string): Promise<any[]> => {
  try {
    if (!rawText) return [];
    const prompt = `Converta texto em JSON estrito. Data YYYY-MM-DD. Profit pode ser negativo. Se sem plataforma, 'Importado'. Ex: { "cycles": [{ "date": "...", "profit": 0, "platform": "..." }] }. Texto: "${truncate(rawText, 2000)}"`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    return cleanAndParseJSON(response.text)?.cycles || [];
  } catch { return []; }
};

export const auditCycleData = (deposit: number, withdrawal: number, profit: number): {valid: boolean, message?: string} => {
  const calcProfit = withdrawal - deposit;
  // Use margin of error for float math
  if (Math.abs(calcProfit - profit) < 0.1) return { valid: true };
  return { valid: false, message: `Inconsistência: Lucro real seria ${calcProfit.toFixed(2)}.` };
};
