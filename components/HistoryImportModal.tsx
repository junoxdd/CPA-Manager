
import React, { useState } from 'react';
import { X, FileSpreadsheet, ArrowRight, Check, AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import { User, Cycle } from '../types';
import { saveCyclesBatch } from '../services/cycleService';
import { parseTextHistory } from '../services/aiService';

interface HistoryImportModalProps {
  onClose: () => void;
  onSuccess: (msg: string) => void;
  user: User;
}

export const HistoryImportModal: React.FC<HistoryImportModalProps> = ({ onClose, onSuccess, user }) => {
  const [rawText, setRawText] = useState('');
  const [parsedData, setParsedData] = useState<Partial<Cycle>[]>([]);
  const [step, setStep] = useState<'input' | 'preview'>('input');
  const [defaultPlatform, setDefaultPlatform] = useState('Importado');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const processText = async () => {
    if (!rawText.trim()) return;
    
    setIsAnalyzing(true);
    try {
        const extracted = await parseTextHistory(rawText);
        
        const result: Partial<Cycle>[] = extracted.map(item => {
            let deposit = 0;
            let withdrawal = 0;
            const profit = Number(item.profit || 0); // Force Number

            if (item.deposit !== undefined && item.withdrawal !== undefined) {
                deposit = Number(item.deposit);
                withdrawal = Number(item.withdrawal);
            } else {
                if (profit >= 0) {
                    withdrawal = profit;
                } else {
                    deposit = Math.abs(profit);
                }
            }

            return {
                date: item.date || new Date().toISOString().split('T')[0],
                profit: profit,
                deposit: deposit,
                withdrawal: withdrawal,
                chest: Number(item.chest || 0),
                platform: item.platform !== "Importado" && item.platform ? item.platform : defaultPlatform,
                notes: item.notes || 'Importado via AI'
            };
        });

        setParsedData(result);
        setStep('preview');
    } catch (error) {
        console.error(error);
        alert("Erro ao processar texto. Tente simplificar ou usar o formato padrão.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
        // Use batch insert for performance and transaction-like behavior
        const { count, error } = await saveCyclesBatch(user.id, parsedData);
        
        if (error) {
            alert("Erro ao salvar no banco de dados. Tente novamente.");
        } else {
            onSuccess(`${count} registros importados com sucesso!`);
            onClose();
        }
    } catch (e) {
        console.error("Save error", e);
        alert("Erro crítico ao salvar.");
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-xl flex items-center justify-center z-[80] p-4 animate-fade-in">
      <div className="glass w-full max-w-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 text-primary rounded-lg">
                <FileSpreadsheet size={24} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-white">Importar Histórico</h2>
                <p className="text-xs text-secondary">Cole dados do Excel ou Bloco de Notas.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-secondary hover:text-white"><X size={24}/></button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            
            {step === 'input' ? (
                <div className="space-y-4">
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg flex gap-3 items-start">
                        <Sparkles className="text-primary shrink-0 mt-0.5" size={18} />
                        <div className="text-xs text-secondary leading-relaxed">
                            <p className="font-bold text-white mb-1">IA Ativada</p>
                            <p>Você pode colar dados bagunçados. Nossa Inteligência Artificial vai identificar Datas, Valores e Nomes de Plataforma automaticamente.</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-secondary uppercase">Nome Padrão da Plataforma (Opcional)</label>
                        <input 
                            type="text" 
                            value={defaultPlatform}
                            maxLength={50}
                            onChange={(e) => setDefaultPlatform(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 p-3 text-white text-sm focus:border-primary outline-none rounded"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-secondary uppercase">Cole seus dados aqui</label>
                        <textarea 
                            value={rawText}
                            maxLength={5000}
                            onChange={(e) => setRawText(e.target.value)}
                            placeholder="Exemplo:&#10;01/05/2024  Ganhei 150 reais na Bet365&#10;02/05  Perdi 50 conto no Tigrinho&#10;Ontem lucrei 200"
                            className="w-full h-48 bg-black/30 border border-white/10 p-4 text-sm text-mono text-white focus:border-primary outline-none rounded resize-none placeholder-secondary/30"
                        />
                        <div className="text-[9px] text-secondary text-right">{rawText.length}/5000</div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-white">Pré-visualização ({parsedData.length} itens)</h3>
                        <button onClick={() => setStep('input')} className="text-xs text-secondary hover:text-primary underline">Editar Texto</button>
                    </div>
                    
                    <div className="border border-white/10 rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-white/5 text-secondary text-xs uppercase font-bold">
                                <tr>
                                    <th className="p-3">Data</th>
                                    <th className="p-3">Plataforma</th>
                                    <th className="p-3 text-right">Lucro Líquido</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {parsedData.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-white/5">
                                        <td className="p-3 text-gray-300 font-mono">{item.date}</td>
                                        <td className="p-3 text-gray-300">{item.platform}</td>
                                        <td className={`p-3 text-right font-bold font-mono ${(item.profit || 0) >= 0 ? 'text-profit' : 'text-loss'}`}>
                                            {(item.profit || 0).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {parsedData.length === 0 && (
                        <div className="p-4 bg-loss/10 border border-loss/20 text-loss text-sm flex items-center gap-2">
                            <AlertTriangle size={16}/> Não conseguimos identificar dados válidos. Verifique o texto.
                        </div>
                    )}
                </div>
            )}

        </div>

        <div className="p-6 border-t border-white/5 bg-white/5 flex gap-3">
            {step === 'input' ? (
                <>
                    <button onClick={onClose} disabled={isAnalyzing} className="px-6 py-3 font-bold text-secondary hover:text-white transition-colors">Cancelar</button>
                    <button onClick={processText} disabled={!rawText.trim() || isAnalyzing} className="flex-1 bg-primary hover:bg-primaryGlow text-white font-bold py-3 rounded shadow-neon-primary disabled:opacity-50 flex items-center justify-center gap-2">
                        {isAnalyzing ? <><Loader2 size={18} className="animate-spin"/> Analisando...</> : <>Processar com IA <ArrowRight size={18} /></>}
                    </button>
                </>
            ) : (
                <>
                    <button onClick={() => setStep('input')} className="px-6 py-3 font-bold text-secondary hover:text-white transition-colors">Voltar</button>
                    <button onClick={handleSave} disabled={parsedData.length === 0 || isSaving} className="flex-1 bg-profit hover:bg-profit/80 text-white font-bold py-3 rounded shadow-neon-profit disabled:opacity-50 flex items-center justify-center gap-2">
                        {isSaving ? <Loader2 size={18} className="animate-spin"/> : <Check size={18} />} Confirmar Importação
                    </button>
                </>
            )}
        </div>

      </div>
    </div>
  );
};
