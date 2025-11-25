import React, { useEffect, useState } from 'react';
import { X, RefreshCcw, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { Cycle } from '../types';
import { getTrash, restoreCycle, permanentDeleteCycle } from '../services/cycleService';
import { formatCurrency, formatDate } from '../utils/formatters';

interface TrashModalProps {
  onClose: () => void;
  onUpdate: () => void;
  userId: string;
}

export const TrashModal: React.FC<TrashModalProps> = ({ onClose, onUpdate, userId }) => {
  const [trashItems, setTrashItems] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [trigger, setTrigger] = useState(0);

  // Replaced potential useMemo usage with clean useEffect handling for async data
  useEffect(() => {
    let mounted = true;
    
    const fetchTrash = async () => {
        setLoading(true);
        try {
            const items = await getTrash(userId);
            if (mounted) {
                setTrashItems(items);
            }
        } catch (error) {
            console.error("Error fetching trash:", error);
            if (mounted) setTrashItems([]);
        } finally {
            if (mounted) setLoading(false);
        }
    };

    fetchTrash();
    return () => { mounted = false; };
  }, [userId, trigger]);

  const handleRestore = async (id: string) => {
    await restoreCycle(userId, id);
    onUpdate();
    setTrigger(t => t + 1);
  };

  const handlePermanentDelete = async (id: string) => {
    if (confirm("Tem certeza? Essa ação não pode ser desfeita.")) {
        await permanentDeleteCycle(userId, id);
        onUpdate();
        setTrigger(t => t + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-xl flex items-center justify-center z-[80] p-4 animate-fade-in">
      <div className="glass w-full max-w-2xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-loss/20 text-loss rounded">
                <Trash2 size={20} />
             </div>
             <h2 className="text-xl font-bold text-white">Lixeira</h2>
          </div>
          <button onClick={onClose} className="text-secondary hover:text-white"><X size={24}/></button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            {loading ? (
                <div className="flex items-center justify-center py-10">
                    <Loader2 size={24} className="animate-spin text-primary" />
                </div>
            ) : trashItems.length === 0 ? (
                <div className="text-center py-10 text-secondary">
                    <p>A lixeira está vazia.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="p-3 bg-loss/5 border border-loss/10 rounded flex items-center gap-2 text-xs text-loss mb-4">
                        <AlertTriangle size={14}/> Itens na lixeira não contam para o saldo e serão excluídos após 30 dias.
                    </div>
                    {trashItems.map(item => (
                        <div key={item.id} className="flex justify-between items-center p-4 glass border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                            <div>
                                <p className="text-white font-bold text-sm">{item.platform}</p>
                                <p className="text-xs text-secondary">{formatDate(item.date)} • {formatCurrency(item.profit)}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleRestore(item.id)} className="p-2 text-primary hover:bg-primary/10 rounded tooltip" title="Restaurar">
                                    <RefreshCcw size={16} />
                                </button>
                                <button onClick={() => handlePermanentDelete(item.id)} className="p-2 text-loss hover:bg-loss/10 rounded tooltip" title="Excluir Permanentemente">
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};