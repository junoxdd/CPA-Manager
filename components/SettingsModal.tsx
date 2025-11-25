
import React, { useRef, useState, useEffect } from 'react';
import { X, Download, Upload, Trash2, AlertTriangle, Settings as SettingsIcon, FileSpreadsheet, Loader2 } from 'lucide-react';
import { exportData, importData, clearAllData, getSettings, saveSettings, exportCSV } from '../services/cycleService';
import { PlanGate } from './PlanGate';

interface SettingsModalProps {
  onClose: () => void;
  onImportSuccess: () => void;
  onClearSuccess: () => void;
  onToast: (msg: string, type: 'success' | 'error') => void;
  userId: string;
  isPro: boolean;
  onUpgrade: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  onClose, onImportSuccess, onClearSuccess, onToast, userId, isPro, onUpgrade 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stopLoss, setStopLoss] = useState<string>('');
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    const settings = getSettings(userId);
    if (settings.stopLossLimit) {
        setStopLoss(settings.stopLossLimit.toString());
    }
  }, [userId]);

  const handleSaveSettings = () => {
    const currentSettings = getSettings(userId);
    const limit = parseFloat(stopLoss);
    saveSettings(userId, { 
        ...currentSettings, 
        stopLossLimit: isNaN(limit) ? undefined : limit 
    });
    onToast('Configurações salvas!', 'success');
  };

  const handleExportJSON = async () => {
    if (!isPro) { onUpgrade(); return; }
    setIsExporting(true);
    try {
        const jsonString = await exportData(userId);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `cpa_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        onToast('Backup JSON baixado!', 'success');
    } catch {
        onToast('Erro ao exportar.', 'error');
    } finally {
        setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    if (!isPro) { onUpgrade(); return; }
    setIsExporting(true);
    try {
        const csvString = await exportCSV(userId);
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `cpa_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        onToast('Planilha CSV baixada!', 'success');
    } catch {
        onToast('Erro ao exportar CSV.', 'error');
    } finally {
        setIsExporting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPro) { onUpgrade(); return; }
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
          const success = await importData(userId, content);
          if (success) {
            onImportSuccess();
            onToast('Dados restaurados com sucesso!', 'success');
            onClose();
          } else {
            onToast('Falha na importação. Verifique o arquivo.', 'error');
          }
      }
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleClearAll = async () => {
    if (confirm('ATENÇÃO: Isso apagará TODOS os seus ciclos, conquistas e resetará seu nível. Ação irreversível. Continuar?')) {
      setIsClearing(true);
      try {
        await clearAllData(userId);
        onClearSuccess();
        onToast('Sistema resetado. Recarregando...', 'success');
        setTimeout(() => {
            window.location.reload();
        }, 1500);
      } catch (error) {
        setIsClearing(false);
        onToast('Erro ao resetar. Tente novamente.', 'error');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-[#020617]/80 backdrop-blur-xl flex items-center justify-center z-[60] p-4 animate-fade-in">
      <div className="glass border border-white/10 w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/5">
          <h2 className="text-xl font-bold text-white flex items-center gap-3"><SettingsIcon size={20} className="text-primary"/> Configurações</h2>
          <button onClick={onClose} className="text-secondary hover:text-white"><X size={24}/></button>
        </div>

        <div className="p-6 space-y-6">
          <div>
             <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-3">Gestão de Risco</h3>
             <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                <label className="text-xs text-gray-300 flex items-center gap-2 mb-2">
                    <AlertTriangle size={14} className="text-loss"/> Limite de Stop Loss Diário
                </label>
                <div className="flex gap-2">
                    <input 
                        type="number" 
                        value={stopLoss}
                        onChange={(e) => setStopLoss(e.target.value)}
                        placeholder="Ex: 100.00"
                        className="flex-1 bg-black/30 border border-white/10 rounded px-3 py-2 text-white text-sm focus:border-loss outline-none"
                    />
                    <button onClick={handleSaveSettings} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-xs font-bold rounded text-white">Salvar</button>
                </div>
             </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-4">Dados & Backup</h3>
            <PlanGate feature="auto_backup" isPro={isPro} onUpgrade={onUpgrade} label="Backup & Restore">
              <div className="grid grid-cols-3 gap-3">
                <button onClick={handleExportJSON} disabled={isExporting} className="p-3 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-gold/30 transition-all flex flex-col items-center gap-2 group disabled:opacity-50">
                  {isExporting ? <Loader2 size={20} className="animate-spin text-gold"/> : <Download size={20} className="text-gold group-hover:scale-110 transition-transform" />}
                  <span className="text-[10px] font-medium text-gray-300">Backup JSON</span>
                </button>
                <button onClick={handleExportCSV} disabled={isExporting} className="p-3 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-profit/30 transition-all flex flex-col items-center gap-2 group disabled:opacity-50">
                   {isExporting ? <Loader2 size={20} className="animate-spin text-profit"/> : <FileSpreadsheet size={20} className="text-profit group-hover:scale-110 transition-transform" />}
                  <span className="text-[10px] font-medium text-gray-300">Export CSV</span>
                </button>
                <button onClick={() => !isImporting && fileInputRef.current?.click()} disabled={isImporting} className="p-3 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-primary/30 transition-all flex flex-col items-center gap-2 group disabled:opacity-50">
                  {isImporting ? <Loader2 size={20} className="text-primary animate-spin" /> : <Upload size={20} className="text-primary group-hover:scale-110 transition-transform" />}
                  <span className="text-[10px] font-medium text-gray-300">Restaurar</span>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                </button>
              </div>
            </PlanGate>
          </div>

          <div className="p-4 bg-loss/5 border border-loss/10 rounded-lg">
            <button onClick={handleClearAll} disabled={isClearing} className="w-full py-3 bg-loss/10 text-loss hover:bg-loss hover:text-white transition-colors text-sm font-bold flex items-center justify-center gap-2 rounded disabled:opacity-50">
              {isClearing ? <Loader2 size={16} className="animate-spin"/> : <Trash2 size={16}/>} Restaurar Sistema
            </button>
            <p className="text-[10px] text-loss text-center mt-2 opacity-70">
                Isso apagará ciclos, missões e conquistas permanentemente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
