
import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Calendar, Loader2, Camera, Hash } from 'lucide-react';
import { Cycle, User } from '../types';
import { getCommonPlatforms, getCommonTags } from '../services/cycleService';
import { extractDataFromScreenshot } from '../services/aiService';
import { getLocalDate } from '../utils/dateUtils';
import { useHaptic } from '../hooks/useHaptic';
import { useCyclesContext } from '../contexts/CycleContext';
import { useUI } from '../contexts/UIContext';

interface CycleFormProps {
  onClose: () => void;
  onSuccess: (message: string) => void;
  cycleToEdit?: Cycle | null;
  cycleToDuplicate?: Cycle | null;
  user: User;
  currentCount: number;
  onShowPremium: () => void;
}

export const CycleForm: React.FC<CycleFormProps> = ({ 
  onClose, onSuccess, cycleToEdit, cycleToDuplicate, user, currentCount, onShowPremium 
}) => {
  const { registerNewCycle, modifyCycle } = useCyclesContext();
  const { showToast } = useUI();
  
  const [formData, setFormData] = useState({
    date: getLocalDate(), 
    deposit: '', withdrawal: '', chest: '', platform: '', notes: ''
  });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  const [commonPlatforms, setCommonPlatforms] = useState<string[]>([]);
  const [commonTags, setCommonTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMounted = useRef(true);
  
  const haptic = useHaptic();

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    setCommonPlatforms(getCommonPlatforms(user.id));
    setCommonTags(getCommonTags(user.id));

    if (cycleToEdit) {
      setFormData({
        date: cycleToEdit.date,
        deposit: cycleToEdit.deposit.toString(),
        withdrawal: cycleToEdit.withdrawal.toString(),
        chest: cycleToEdit.chest.toString(),
        platform: cycleToEdit.platform,
        notes: cycleToEdit.notes
      });
      setTags(cycleToEdit.tags || []);
    } else if (cycleToDuplicate) {
      setFormData({
        date: getLocalDate(),
        deposit: cycleToDuplicate.deposit.toString(),
        withdrawal: cycleToDuplicate.withdrawal.toString(),
        chest: cycleToDuplicate.chest.toString(),
        platform: cycleToDuplicate.platform,
        notes: cycleToDuplicate.notes
      });
      setTags(cycleToDuplicate.tags || []);
    }
  }, [cycleToEdit, cycleToDuplicate, user.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ',') {
          e.preventDefault();
          addTag(tagInput);
      }
  };

  const addTag = (t: string) => {
      const clean = t.trim().replace(/^#/, '');
      if (clean && !tags.includes(clean)) {
          setTags([...tags, clean]);
          setTagInput('');
      }
  };

  const removeTag = (t: string) => {
      setTags(tags.filter(tag => tag !== t));
  };

  const handleQuickAdd = (amount: number) => {
    haptic.light();
    // Simple parse just for the quick add UI logic, strict parse happens on submit
    const current = parseFloat(formData.deposit.replace(',', '.') || '0') || 0;
    setFormData(prev => ({ ...prev, deposit: (current + amount).toFixed(2) }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsProcessingOCR(true);
      const reader = new FileReader();
      reader.onload = async (ev) => {
          const base64 = ev.target?.result as string;
          const extracted = await extractDataFromScreenshot(base64);
          
          if (extracted && isMounted.current) {
              setFormData(prev => ({
                  ...prev,
                  deposit: extracted.deposit !== undefined ? extracted.deposit.toString() : prev.deposit,
                  withdrawal: extracted.withdrawal !== undefined ? extracted.withdrawal.toString() : prev.withdrawal,
                  platform: extracted.platform || prev.platform,
                  date: extracted.date || prev.date
              }));
              haptic.success();
          } else if (isMounted.current) {
              showToast("Não foi possível ler o print. Tente inserir manualmente.", 'error');
              haptic.error();
          }
          if(isMounted.current) setIsProcessingOCR(false);
      };
      reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSaving) return; 
    
    setIsSaving(true);
    haptic.success();

    // Pass strings directly to the context/service which now has the Robust 'safeFloat' parser
    // This avoids double parsing issues at the UI layer
    const payload = {
      date: formData.date || getLocalDate(),
      deposit: formData.deposit,
      withdrawal: formData.withdrawal,
      chest: formData.chest,
      platform: formData.platform || 'Outros',
      notes: formData.notes,
      tags
    };

    const timeoutId = setTimeout(() => {
        if (isSaving && isMounted.current) {
            setIsSaving(false);
            showToast("A operação está demorando. Verifique sua conexão.", 'error');
        }
    }, 12000); // 12s timeout allows for retry logic in service

    try {
        if (cycleToEdit) {
            await modifyCycle(cycleToEdit.id, payload);
            if(isMounted.current) {
                clearTimeout(timeoutId);
                onSuccess('Ciclo atualizado!');
            }
        } else {
            await registerNewCycle(payload);
            if(isMounted.current) {
                clearTimeout(timeoutId);
                onSuccess(cycleToDuplicate ? 'Ciclo duplicado!' : 'Ciclo registrado!');
            }
        }
    } catch (err: any) {
        clearTimeout(timeoutId);
        console.error("Erro no salvamento:", err);
        const errorMsg = typeof err === 'string' ? err : (err?.message || "Erro desconhecido");
        if(isMounted.current) {
            showToast(`Erro ao salvar: ${errorMsg}`, 'error');
            haptic.error();
        }
    } finally {
        if(isMounted.current) setIsSaving(false); 
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-fade-in">
      <form onSubmit={handleSubmit} className="glass bg-surface p-6 w-full max-w-lg rounded-xl shadow-2xl max-h-[95vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-6">
           <div className="flex items-center gap-2">
               <h2 className="text-xl font-bold text-white">
                 {cycleToEdit ? 'Editar' : cycleToDuplicate ? 'Duplicar' : 'Novo'} Ciclo
               </h2>
               {!cycleToEdit && (
                 <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessingOCR}
                    className="ml-2 p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-secondary hover:text-primary transition-colors flex items-center gap-1"
                    title="Importar de Print"
                 >
                    {isProcessingOCR ? <Loader2 size={16} className="animate-spin"/> : <Camera size={16} />}
                    <span className="text-[10px] font-bold uppercase">OCR</span>
                 </button>
               )}
               <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
           </div>
           <button type="button" onClick={onClose}><X className="text-secondary hover:text-white"/></button>
        </div>

        <div className="space-y-4">
           <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                 <label className="text-[10px] uppercase font-bold text-secondary">Data</label>
                 <div className="relative">
                    <Calendar className="absolute left-3 top-3 text-primary" size={16}/>
                    <input type="date" name="date" value={formData.date} onChange={handleChange} required 
                      className="w-full bg-white/5 border border-white/10 rounded p-2 pl-10 text-white focus:border-primary outline-none bg-gradient-to-r from-primary/5 to-transparent"/>
                 </div>
              </div>
              <div>
                 <label className="text-[10px] uppercase font-bold text-secondary">Plataforma</label>
                 <input 
                    type="text" 
                    name="platform" 
                    value={formData.platform} 
                    onChange={handleChange} 
                    maxLength={100}
                    list="platforms"
                    className="w-full bg-white/5 border border-white/10 rounded p-2 text-white focus:border-primary outline-none"
                    autoComplete="off"
                 />
                 <datalist id="platforms">
                    {commonPlatforms.map((p, i) => <option key={i} value={p} />)}
                 </datalist>
              </div>
           </div>

           <div className="grid grid-cols-3 gap-3">
              <div>
                 <label className="text-[10px] uppercase font-bold text-secondary">Depósito</label>
                 <input type="text" inputMode="decimal" name="deposit" value={formData.deposit} onChange={handleChange} required placeholder="0,00"
                   className="w-full bg-white/5 border border-white/10 rounded p-2 text-white focus:border-primary outline-none"/>
                 
                 <div className="flex gap-1 mt-1">
                    <button type="button" onClick={() => handleQuickAdd(50)} className="px-1.5 py-0.5 bg-white/5 hover:bg-primary/20 text-[9px] text-secondary hover:text-primary rounded border border-white/5 transition-colors">+50</button>
                    <button type="button" onClick={() => handleQuickAdd(100)} className="px-1.5 py-0.5 bg-white/5 hover:bg-primary/20 text-[9px] text-secondary hover:text-primary rounded border border-white/5 transition-colors">+100</button>
                 </div>
              </div>
              <div>
                 <label className="text-[10px] uppercase font-bold text-profit">Saque</label>
                 <input type="text" inputMode="decimal" name="withdrawal" value={formData.withdrawal} onChange={handleChange} placeholder="0,00"
                   className="w-full bg-white/5 border border-white/10 rounded p-2 text-profit focus:border-profit outline-none"/>
              </div>
              <div>
                 <label className="text-[10px] uppercase font-bold text-gold">Baú (CPA)</label>
                 <input type="text" inputMode="decimal" name="chest" value={formData.chest} onChange={handleChange} placeholder="0,00"
                   className="w-full bg-white/5 border border-white/10 rounded p-2 text-gold focus:border-gold outline-none"/>
              </div>
           </div>
           
           <div>
               <label className="text-[10px] uppercase font-bold text-secondary flex items-center gap-1"><Hash size={10}/> Tags</label>
               <div className="flex flex-wrap gap-2 p-2 bg-white/5 border border-white/10 rounded min-h-[42px]">
                   {tags.map(tag => (
                       <span key={tag} className="px-2 py-1 bg-primary/20 text-primary text-[10px] font-bold rounded flex items-center gap-1">
                           #{tag} <button type="button" onClick={() => removeTag(tag)} className="hover:text-white"><X size={10}/></button>
                       </span>
                   ))}
                   <input 
                        type="text" 
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        placeholder={tags.length === 0 ? "Ex: #madrugada, #alavancagem" : ""}
                        className="flex-1 bg-transparent outline-none text-xs text-white min-w-[60px]"
                        list="common-tags"
                   />
                   <datalist id="common-tags">
                        {commonTags.map((t,i) => <option key={i} value={t}/>)}
                   </datalist>
               </div>
           </div>

           <div>
              <label className="text-[10px] uppercase font-bold text-secondary">Notas</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} maxLength={1000}
                className="w-full bg-white/5 border border-white/10 rounded p-2 text-white focus:border-primary outline-none resize-none"/>
              <div className="text-[9px] text-secondary text-right">{formData.notes.length}/1000</div>
           </div>
        </div>

        <button type="submit" disabled={isSaving} className="w-full mt-6 bg-primary hover:bg-primaryGlow text-white font-bold py-3 rounded shadow-neon-primary transition-all flex items-center justify-center gap-2 disabled:opacity-50">
           {isSaving ? <Loader2 size={18} className="animate-spin"/> : <><Save size={18}/> Salvar Ciclo</>}
        </button>
      </form>
    </div>
  );
};
