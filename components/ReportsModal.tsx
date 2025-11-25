
import React, { useState } from 'react';
import { X, FileText, Download, Loader2 } from 'lucide-react';
import { Report, User } from '../types';
import { generateReportMock } from '../services/reportService';
import { PlanGate } from './PlanGate';

interface ReportsModalProps {
  onClose: () => void;
  reports: Report[];
  onUpdate: () => void;
  user: User;
  isPro: boolean;
  onUpgrade: () => void;
}

export const ReportsModal: React.FC<ReportsModalProps> = ({ onClose, reports, onUpdate, user, isPro, onUpgrade }) => {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async (period: 'daily' | 'weekly' | 'monthly') => {
    if (!isPro) { onUpgrade(); return; }
    setGenerating(true);
    try { await generateReportMock(user, period); onUpdate(); } finally { setGenerating(false); }
  };

  return (
    <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-xl flex items-center justify-center z-[90] p-4 animate-fade-in">
      <div className="glass w-full max-w-2xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/5">
          <h2 className="text-xl font-bold text-white flex items-center gap-3"><FileText size={24} className="text-primary"/> Livro de Operações</h2>
          <button onClick={onClose} className="text-secondary hover:text-white"><X size={24}/></button>
        </div>
        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                 <h3 className="text-sm font-bold text-secondary uppercase tracking-widest mb-4">Gerar Novo Relatório</h3>
                 <PlanGate feature="reports_pdf" isPro={isPro} onUpgrade={onUpgrade} label="PDF Inteligente">
                    <div className="space-y-3">
                       {['daily', 'weekly', 'monthly'].map(p => (
                         <button key={p} disabled={generating} onClick={() => handleGenerate(p as any)} className="w-full py-4 bg-white/5 border border-white/10 hover:bg-primary/10 hover:border-primary/30 transition-all flex items-center justify-between px-4 group">
                            <span className="text-sm font-bold text-gray-300 capitalize">{p === 'daily' ? 'Diário' : p === 'weekly' ? 'Semanal' : 'Mensal'}</span>
                            {generating ? <Loader2 size={18} className="animate-spin text-primary"/> : <Download size={18} className="text-secondary group-hover:text-primary"/>}
                         </button>
                       ))}
                    </div>
                 </PlanGate>
              </div>
              <div className="border-l border-white/5 pl-0 md:pl-8 mt-6 md:mt-0">
                 <h3 className="text-sm font-bold text-secondary uppercase tracking-widest mb-4">Histórico</h3>
                 <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {reports.length === 0 ? <p className="text-xs text-gray-600 italic">Nenhum relatório gerado.</p> : reports.map(report => (
                         <div key={report.id} className="flex items-center justify-between p-3 bg-black/20 border border-white/5">
                            <div>
                               <p className="text-xs font-bold text-white capitalize">{report.period === 'daily' ? 'Diário' : report.period === 'weekly' ? 'Semanal' : 'Mensal'}</p>
                               <p className="text-[10px] text-gray-500">{new Date(report.createdAt).toLocaleDateString()}</p>
                            </div>
                            <button className="p-2 text-primary hover:bg-white/5 rounded"><Download size={16}/></button>
                         </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
