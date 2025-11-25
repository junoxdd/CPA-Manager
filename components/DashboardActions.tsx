
import React from 'react';
import { Plus, FileText, Bell, Share2, Trophy, Settings, LogOut, FileSpreadsheet, Trash2, Star, Target, User as UserIcon } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface DashboardActionsProps {
  onNewCycle: () => void;
  onReports: () => void;
  onAlerts: () => void;
  onShare: () => void;
  onAchievements: () => void;
  onSettings: () => void;
  onImportHistory: () => void;
  onTrash: () => void;
  onHallOfFame: () => void;
  onMissions: () => void;
  onProfile: () => void; // Added Profile Action
  onLogout: () => void;
  alertCount: number;
  userAvatar?: string;
}

export const DashboardActions: React.FC<DashboardActionsProps> = ({
  onNewCycle, onReports, onAlerts, onShare, onAchievements, onSettings, onImportHistory, onTrash, onHallOfFame, onMissions, onProfile, onLogout, alertCount, userAvatar
}) => {
  const iconBtnClass = "relative h-9 w-9 flex items-center justify-center rounded-lg transition-all duration-300 active:scale-95 border border-transparent hover:border-white/10 hover:shadow-glass";
  const glassContainerClass = "glass px-3 py-2 bg-surface/40 backdrop-blur-xl border border-white/5 flex items-center gap-2 md:gap-4 rounded-xl shadow-lg overflow-x-auto scrollbar-hide max-w-full flex-shrink-0";

  return (
    <div className={glassContainerClass}>
        <span className="hidden xl:block text-[10px] font-bold text-secondary uppercase tracking-widest whitespace-nowrap mr-2">
          Ações
        </span>
        
        <div className="hidden md:block">
          <Tooltip text="Novo Ciclo">
            <button 
              onClick={onNewCycle} 
              className="h-9 px-4 bg-primary hover:bg-primaryGlow text-white font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-2 shadow-neon-primary hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all active:scale-95 whitespace-nowrap"
            >
              <Plus size={16} strokeWidth={3}/> 
              <span>Registrar</span>
            </button>
          </Tooltip>
        </div>

        <div className="hidden md:block h-6 w-[1px] bg-white/10"></div>

        <div className="flex items-center gap-1 md:gap-2">
          <Tooltip text="Importar Planilha">
            <button onClick={onImportHistory} className={`${iconBtnClass} bg-white/5 text-secondary hover:text-white hover:bg-white/10`}>
              <FileSpreadsheet size={18}/>
            </button>
          </Tooltip>

          <Tooltip text="Relatórios PDF">
            <button onClick={onReports} className={`${iconBtnClass} bg-white/5 text-secondary hover:text-white hover:bg-white/10`}>
              <FileText size={18}/>
            </button>
          </Tooltip>

          <Tooltip text="Alertas">
              <button onClick={onAlerts} className={`${iconBtnClass} bg-white/5 text-secondary hover:text-white hover:bg-white/10`}>
                <Bell size={18}/>
                {alertCount > 0 && (
                  <span className="absolute top-1.5 right-2 w-2 h-2 bg-loss rounded-full border border-[#020617] animate-pulse"></span>
                )}
              </button>
          </Tooltip>

          <Tooltip text="Share Card">
              <button onClick={onShare} className={`${iconBtnClass} bg-white/5 text-secondary hover:text-white hover:bg-white/10`}>
                <Share2 size={18}/>
              </button>
          </Tooltip>
          
          <Tooltip text="Missões">
              <button onClick={onMissions} className={`${iconBtnClass} bg-white/5 text-purple-400 hover:text-white hover:bg-purple-500/20`}>
                <Target size={18}/>
              </button>
          </Tooltip>

          <Tooltip text="Hall da Fama">
              <button onClick={onHallOfFame} className={`${iconBtnClass} bg-white/5 text-gold hover:text-white hover:bg-gold/10`}>
                <Star size={18}/>
              </button>
          </Tooltip>

          <Tooltip text="Conquistas">
              <button onClick={onAchievements} className={`${iconBtnClass} bg-white/5 text-secondary hover:text-white hover:bg-white/10`}>
                <Trophy size={18}/>
              </button>
          </Tooltip>
        </div>

        <div className="h-6 w-[1px] bg-white/10"></div>

        <div className="flex items-center gap-1 md:gap-2 ml-auto md:ml-0">
          <Tooltip text="Perfil">
              <button onClick={onProfile} className={`${iconBtnClass} text-secondary hover:text-white hover:bg-white/5`}>
                <UserIcon size={18}/>
              </button>
          </Tooltip>
          
          <Tooltip text="Lixeira">
              <button onClick={onTrash} className={`${iconBtnClass} text-secondary hover:text-loss hover:bg-loss/10`}>
                <Trash2 size={18}/>
              </button>
          </Tooltip>

          <Tooltip text="Configurações">
            <button onClick={onSettings} className={`${iconBtnClass} text-secondary hover:text-white hover:bg-white/5`}>
              <Settings size={18}/>
            </button>
          </Tooltip>
          
          <Tooltip text="Sair">
            <button onClick={onLogout} className={`${iconBtnClass} text-loss/70 hover:text-loss hover:bg-loss/10 border-transparent hover:border-loss/20`}>
              <LogOut size={18}/>
            </button>
          </Tooltip>
        </div>
    </div>
  );
};
