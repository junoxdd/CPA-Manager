
import React, { useEffect, useState, useCallback } from 'react';
import { LayoutDashboard, List, Plus, Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from './lib/supabase';

// Core
import { User } from './types';
import { saveSettings, softDeleteCycle } from './services/cycleService';
import { ensureUserProfile } from './services/authService'; // Updated import

// Contexts
import { UIProvider, useUI } from './contexts/UIContext';
import { FilterProvider, useFilters } from './contexts/FilterContext';
import { CycleProvider, useCyclesContext } from './contexts/CycleContext';
import { GamificationProvider } from './contexts/GamificationContext';

// Hooks
import { usePlan } from './hooks/usePlan';

// Components
import { Toast } from './components/Toast';
import { SmartAlert } from './components/SmartAlert';
import { GoalWidget } from './components/GoalWidget';
import { LoginScreen } from './components/LoginScreen';
import { DashboardActions } from './components/DashboardActions';
import { GamificationWidget } from './components/GamificationWidget';
import { Tooltip } from './components/Tooltip';
import { ModalManager } from './components/ModalManager';

// Lazy Loaded View Components
const CycleList = React.lazy(() => import('./components/CycleList').then(m => ({ default: m.CycleList })));
const DailySection = React.lazy(() => import('./modules/dashboard/DailySection').then(m => ({ default: m.DailySection })));
const WeeklySection = React.lazy(() => import('./modules/dashboard/WeeklySection').then(m => ({ default: m.WeeklySection })));
const MonthlySection = React.lazy(() => import('./modules/dashboard/MonthlySection').then(m => ({ default: m.MonthlySection })));
const AiInsightCard = React.lazy(() => import('./components/dashboard/AiInsightCard').then(m => ({ default: m.AiInsightCard })));

const AppContent = ({ user, setUser }: { user: User, setUser: (u: User | null) => void }) => {
  const { 
    isPrivacyMode, togglePrivacyMode, modals, openModal, closeModal, 
    toast, showToast, hideToast, smartAlert, closeSmartAlert, 
    editingCycle, setEditingCycle, duplicatingCycle, setDuplicatingCycle 
  } = useUI();
  
  const { dashboardPeriod, setDashboardPeriod, view, setView } = useFilters();
  const { cycles, globalStats, reloadCycles } = useCyclesContext();
  
  const plan = usePlan(user, (updatedUser) => setUser(updatedUser));
  const [monthlyGoal, setMonthlyGoal] = useState<number>(5000);
  const [stopLossLimit, setStopLossLimit] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (user.preferences) {
      setMonthlyGoal(user.preferences.monthlyGoal);
      setStopLossLimit(user.preferences.stopLossLimit);
    }
  }, [user.preferences]);

  // NOTE: Automation useEffect removed to prevent infinite loops. 
  // Automations are now triggered in useCycles.ts upon register/update.

  const handleUpdateGoal = useCallback((newGoal: number) => {
    setMonthlyGoal(newGoal);
    const updatedSettings = { monthlyGoal: newGoal, stopLossLimit };
    saveSettings(user.id, updatedSettings);
    setUser({ ...user, preferences: updatedSettings });
    showToast('Meta atualizada!');
  }, [user, stopLossLimit, showToast, setUser]);

  const handleReloadSettings = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
        // Use ensureUserProfile here too to be safe and get fresh data
        const updated = await ensureUserProfile(session.user);
        if (updated) {
            setUser(updated);
            setStopLossLimit(updated.preferences?.stopLossLimit);
        }
    }
    reloadCycles();
  }, [setUser, reloadCycles]);

  const handleSoftDelete = useCallback((id: string) => {
    softDeleteCycle(user.id, id).then(() => {
        reloadCycles();
        showToast("Ciclo movido para lixeira");
    });
  }, [user.id, reloadCycles, showToast]);

  const handleNewCycle = () => {
      setEditingCycle(null);
      setDuplicatingCycle(null);
      openModal('form');
  };

  const handleEditCycle = (cycle: any) => {
      setEditingCycle(cycle);
      setDuplicatingCycle(null);
      openModal('form');
  };

  const handleDuplicateCycle = (cycle: any) => {
      setDuplicatingCycle(cycle);
      setEditingCycle(null);
      openModal('form');
  };

  return (
    <div className="min-h-screen font-sans pb-24 md:pb-10 bg-background">
      <nav className="sticky top-0 z-40 mx-0 mb-6">
        <div className="glass px-4 py-3 flex items-center justify-between gap-4 bg-surface/50 backdrop-blur-xl border-b border-white/5">
            <div className="cursor-pointer group" onClick={() => setView('dashboard')}>
              <span className="text-[10px] font-bold text-foreground leading-none tracking-wider group-hover:text-white transition-colors">CPA MANAGER</span>
            </div>
            <div className="flex-1 flex justify-center px-2 md:px-4 min-w-0 z-10">
              <GoalWidget currentMonthlyProfit={globalStats.monthlyProfit} monthlyGoal={monthlyGoal} onUpdateGoal={handleUpdateGoal} compact={true} isPrivacyMode={isPrivacyMode} />
            </div>
            <div className="hidden md:flex items-center flex-shrink-0 z-20 gap-2">
              <Tooltip text={isPrivacyMode ? "Mostrar Valores" : "Ocultar Valores"}>
                  <button onClick={togglePrivacyMode} className="h-9 w-9 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-secondary hover:text-white transition-colors">
                    {isPrivacyMode ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
              </Tooltip>
              <div className="h-6 w-[1px] bg-white/10 mx-1"></div>
              <DashboardActions 
                  onNewCycle={handleNewCycle}
                  onReports={() => openModal('reports')}
                  onAlerts={() => openModal('alerts')}
                  onShare={() => openModal('flex')}
                  onAchievements={() => openModal('missions')}
                  onMissions={() => openModal('missions')}
                  onProfile={() => openModal('profile')}
                  onSettings={() => openModal('settings')}
                  onImportHistory={() => openModal('import')}
                  onTrash={() => openModal('trash')}
                  onHallOfFame={() => openModal('hall')}
                  onLogout={() => { supabase.auth.signOut(); setUser(null); }}
                  alertCount={(user.alerts || []).filter(a => !a.readAt).length}
                  userAvatar={user.avatarUrl}
              />
            </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <GamificationWidget />

        <div className="md:hidden mb-6 flex gap-2">
           <button onClick={togglePrivacyMode} className="h-9 w-9 flex items-center justify-center rounded-lg bg-white/5 text-secondary border border-white/10">
              {isPrivacyMode ? <EyeOff size={18} /> : <Eye size={18} />}
           </button>
           <div className="flex-1 overflow-x-auto">
             <DashboardActions 
                  onNewCycle={handleNewCycle} 
                  onReports={() => openModal('reports')}
                  onAlerts={() => openModal('alerts')}
                  onShare={() => openModal('flex')}
                  onAchievements={() => openModal('missions')}
                  onMissions={() => openModal('missions')}
                  onProfile={() => openModal('profile')}
                  onSettings={() => openModal('settings')}
                  onImportHistory={() => openModal('import')}
                  onTrash={() => openModal('trash')}
                  onHallOfFame={() => openModal('hall')}
                  onLogout={() => { supabase.auth.signOut(); setUser(null); }}
                  alertCount={(user.alerts || []).filter(a => !a.readAt).length}
                  userAvatar={user.avatarUrl}
              />
           </div>
        </div>

        <div className="flex justify-between items-center mb-8 border-b border-border pb-2">
          <div className="flex gap-6">
            <button onClick={() => setView('dashboard')} className={`pb-2 flex items-center gap-2 text-sm font-medium border-b-2 transition-colors ${view === 'dashboard' ? 'border-primary text-primary' : 'border-transparent text-secondary hover:text-white'}`}><LayoutDashboard size={18}/> Dashboard</button>
            <button onClick={() => setView('list')} className={`pb-2 flex items-center gap-2 text-sm font-medium border-b-2 transition-colors ${view === 'list' ? 'border-primary text-primary' : 'border-transparent text-secondary hover:text-white'}`}><List size={18}/> Histórico</button>
          </div>
        </div>

        <div className="space-y-8 min-h-[500px]">
          {view === 'dashboard' ? (
             <>
                <div className="flex justify-end mb-4">
                  <div className="bg-white/5 p-1 rounded-lg flex gap-1">
                    {(['daily', 'weekly', 'monthly', 'all'] as const).map((period) => (
                      <button
                        key={period}
                        onClick={() => setDashboardPeriod(period)}
                        className={`px-4 py-2 text-xs font-bold uppercase rounded-md transition-all duration-300 ${dashboardPeriod === period ? 'bg-primary text-white shadow-lg scale-105' : 'text-secondary hover:text-white hover:bg-white/5'}`}
                      >
                        {period === 'daily' ? 'Hoje' : period === 'weekly' ? 'Semana' : period === 'monthly' ? 'Mês' : 'Geral'}
                      </button>
                    ))}
                  </div>
                </div>

                <React.Suspense fallback={<div className="h-24 glass animate-pulse"/>}>
                    <AiInsightCard isPro={plan.isPro} />
                </React.Suspense>

                <div key={dashboardPeriod} className="animate-fade-in">
                    <React.Suspense fallback={<div className="h-96 glass animate-pulse"/>}>
                        {dashboardPeriod === 'daily' && <DailySection stopLossLimit={stopLossLimit} />}
                        {dashboardPeriod === 'weekly' && <WeeklySection isPro={plan.isPro} onUpgrade={plan.openUpgradeModal} />}
                        {(dashboardPeriod === 'monthly' || dashboardPeriod === 'all') && <MonthlySection isPro={plan.isPro} onUpgrade={plan.openUpgradeModal} variant={dashboardPeriod} />}
                    </React.Suspense>
                </div>
             </>
          ) : (
            <React.Suspense fallback={<div className="h-96 glass animate-pulse"/>}>
              <CycleList 
                cycles={cycles} 
                onEdit={handleEditCycle} 
                onDuplicate={handleDuplicateCycle}
                onDelete={handleSoftDelete} 
                isPrivacyMode={isPrivacyMode} 
                isPro={plan.isPro} 
                onUpgrade={plan.openUpgradeModal} 
              />
            </React.Suspense>
          )}
        </div>
      </main>

      <div className="md:hidden fixed bottom-0 left-0 w-full glass z-50 px-6 py-3 flex items-center justify-between bg-surface/80 backdrop-blur-xl border-t border-border">
        <button onClick={() => setView('dashboard')} className={view === 'dashboard' ? 'text-primary' : 'text-secondary'}><LayoutDashboard size={24}/></button>
        <div className="relative -top-8">
          <button onClick={handleNewCycle} className="w-16 h-16 bg-primary text-white flex items-center justify-center rounded-full shadow-neon-primary border-[6px] border-background"><Plus size={32}/></button>
        </div>
        <button onClick={() => setView('list')} className={view === 'list' ? 'text-primary' : 'text-secondary'}><List size={24}/></button>
      </div>

      <ModalManager 
        modals={modals}
        closeModal={closeModal}
        user={user}
        setUser={setUser}
        cycles={cycles}
        reloadCycles={reloadCycles}
        showToast={showToast}
        isPro={plan.isPro}
        openUpgradeModal={plan.openUpgradeModal}
        isUpgradeModalOpen={plan.isUpgradeModalOpen}
        closeUpgradeModal={plan.closeUpgradeModal}
        handleUpgrade={plan.handleUpgrade}
        handleStartTrial={plan.handleStartTrial}
        isOnboardingOpen={plan.isOnboardingOpen}
        closeOnboarding={plan.closeOnboarding}
        editingCycle={editingCycle}
        duplicatingCycle={duplicatingCycle}
        stats={{ daily: globalStats.dailyProfit, weekly: globalStats.weeklyProfit, monthly: globalStats.monthlyProfit }}
        handleReloadSettings={handleReloadSettings}
        isPrivacyMode={isPrivacyMode}
        alerts={user.alerts || []}
        reports={user.reports || []}
      />

      <Toast message={toast.message} isVisible={toast.visible} onClose={hideToast} type={toast.type} />
      {smartAlert && <SmartAlert config={smartAlert} onClose={closeSmartAlert} />}
    </div>
  );
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            // Self-healing: Ensure profile exists
            const safeUser = await ensureUserProfile(session.user);
            setUser(safeUser);
        }
        setCheckingAuth(false);
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        // Self-healing here too
        const safeUser = await ensureUserProfile(session.user);
        setUser(safeUser);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (checkingAuth) return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white gap-2">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
  );

  if (!user) return <LoginScreen onLogin={() => {}} />; 

  return (
    <UIProvider>
      <FilterProvider>
        <CycleProvider user={user}>
           <GamificationProvider user={user}>
              <AppContent user={user} setUser={setUser} />
           </GamificationProvider>
        </CycleProvider>
      </FilterProvider>
    </UIProvider>
  );
}

export default App;
