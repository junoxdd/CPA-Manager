
import React from 'react';
import { X, Bell, Trash2, CheckCircle2, AlertTriangle, TrendingUp, Target } from 'lucide-react';
import { Alert } from '../types';
import { markAlertRead, deleteAlert } from '../services/alertService';

interface AlertsModalProps {
  alerts: Alert[];
  onClose: () => void;
  onUpdate: () => void;
  userId: string;
}

export const AlertsModal: React.FC<AlertsModalProps> = ({ alerts, onClose, onUpdate, userId }) => {
  const handleMarkRead = (id: string) => { markAlertRead(userId, id); onUpdate(); };
  const handleDelete = (id: string) => { deleteAlert(userId, id); onUpdate(); };

  const getIcon = (type: Alert['type']) => {
    switch (type) {
      case 'risco': return <AlertTriangle size={18} className="text-loss"/>;
      case 'performance': return <TrendingUp size={18} className="text-primary"/>;
      case 'meta': return <Target size={18} className="text-gold"/>;
      default: return <Bell size={18} className="text-secondary"/>;
    }
  };

  return (
    <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-xl flex items-center justify-center z-[90] p-4 animate-fade-in">
      <div className="glass w-full max-w-md border border-white/10 shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-5 border-b border-white/5 bg-white/5">
          <h2 className="text-white font-bold flex items-center gap-2"><Bell size={20} className="text-gold"/> Alertas</h2>
          <button onClick={onClose} className="text-secondary hover:text-white"><X size={24}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {alerts.length === 0 ? <div className="text-center py-10 text-secondary text-sm">Nenhum alerta.</div> : alerts.map(alert => (
            <div key={alert.id} className={`p-4 border ${alert.readAt ? 'bg-white/5 border-white/5 opacity-60' : 'bg-primary/5 border-primary/30'} transition-all group relative`}>
               <div className="flex gap-3">
                 <div className="mt-1 p-1.5 rounded-full bg-black/40 border border-white/10 h-fit">{getIcon(alert.type)}</div>
                 <div className="flex-1">
                    <p className="text-sm text-gray-200 mb-1 leading-relaxed">{alert.message}</p>
                    {alert.data?.hint && <p className="text-xs text-secondary italic mb-2">💡 {alert.data.hint}</p>}
                    <p className="text-[10px] text-gray-500">{new Date(alert.createdAt).toLocaleString()}</p>
                 </div>
               </div>
               <div className="flex justify-end gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 {!alert.readAt && <button onClick={() => handleMarkRead(alert.id)} className="p-1.5 text-profit hover:bg-profit/10 rounded"><CheckCircle2 size={16}/></button>}
                 <button onClick={() => handleDelete(alert.id)} className="p-1.5 text-loss hover:bg-loss/10 rounded"><Trash2 size={16}/></button>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
