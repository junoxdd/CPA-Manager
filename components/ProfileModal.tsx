
import React, { useState } from 'react';
import { X, User, Phone, Mail, Save, Loader2, Camera } from 'lucide-react';
import { User as UserType } from '../types';
import { updateProfile } from '../services/authService';

interface ProfileModalProps {
  user: UserType;
  onClose: () => void;
  onUpdate: (updatedUser: UserType) => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onUpdate, showToast }) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    nickname: user.nickname || '',
    phone: user.phone || '',
    bio: user.bio || '',
    avatarUrl: user.avatarUrl || ''
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const success = await updateProfile(user.id, formData);
      if (success) {
        onUpdate({ ...user, ...formData });
        showToast('Perfil atualizado!', 'success');
        onClose();
      } else {
        showToast('Erro ao atualizar.', 'error');
      }
    } catch (err) {
      showToast('Erro de conexão.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-xl flex items-center justify-center z-[80] p-4 animate-fade-in">
      <div className="glass w-full max-w-lg border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><User size={24} className="text-primary"/> Editar Perfil</h2>
          <button onClick={onClose} className="text-secondary hover:text-white"><X size={24}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
            
            <div className="flex flex-col items-center gap-4 mb-6">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary shadow-neon-primary">
                    <img src={formData.avatarUrl || `https://ui-avatars.com/api/?name=${formData.name}&background=6366f1&color=fff`} alt="Avatar" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                        <Camera size={24} className="text-white"/>
                    </div>
                </div>
                <input 
                  type="text" 
                  name="avatarUrl" 
                  placeholder="URL da Imagem (Avatar)" 
                  value={formData.avatarUrl} 
                  onChange={handleChange}
                  className="w-full text-xs bg-black/30 border border-white/10 rounded px-2 py-1 text-center text-secondary focus:border-primary outline-none"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-secondary uppercase mb-1 block">Nome</label>
                    <div className="relative">
                        <User size={14} className="absolute left-3 top-3 text-secondary"/>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required
                            className="w-full bg-white/5 border border-white/10 rounded p-2.5 pl-9 text-white text-sm focus:border-primary outline-none"/>
                    </div>
                </div>
                <div>
                    <label className="text-xs font-bold text-secondary uppercase mb-1 block">Apelido</label>
                    <input type="text" name="nickname" value={formData.nickname} onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-white text-sm focus:border-primary outline-none"/>
                </div>
            </div>

            <div>
                <label className="text-xs font-bold text-secondary uppercase mb-1 block">Telefone</label>
                <div className="relative">
                    <Phone size={14} className="absolute left-3 top-3 text-secondary"/>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded p-2.5 pl-9 text-white text-sm focus:border-primary outline-none"/>
                </div>
            </div>

            <div>
                <label className="text-xs font-bold text-secondary uppercase mb-1 block">Bio</label>
                <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} maxLength={150}
                    className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-white text-sm focus:border-primary outline-none resize-none" placeholder="Uma breve descrição..."/>
            </div>

            <div className="pt-4">
                <button type="submit" disabled={saving} className="w-full bg-primary hover:bg-primaryGlow text-white font-bold py-3 rounded shadow-neon-primary transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                    {saving ? <Loader2 size={18} className="animate-spin"/> : <><Save size={18}/> Salvar Alterações</>}
                </button>
            </div>

        </form>
      </div>
    </div>
  );
};
