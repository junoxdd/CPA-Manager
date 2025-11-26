
import React, { Suspense } from 'react';
import { User, Cycle, Alert, Report } from '../types';

// Lazy Imports for Modals
const CycleForm = React.lazy(() => import('./CycleForm').then(m => ({ default: m.CycleForm })));
const SettingsModal = React.lazy(() => import('./SettingsModal').then(m => ({ default: m.SettingsModal })));
const GamificationHub = React.lazy(() => import('./GamificationHub').then(m => ({ default: m.GamificationHub })));
const FlexCardModal = React.lazy(() => import('./FlexCardModal').then(m => ({ default: m.FlexCardModal })));
const AlertsModal = React.lazy(() => import('./AlertsModal').then(m => ({ default: m.AlertsModal })));
const ReportsModal = React.lazy(() => import('./ReportsModal').then(m => ({ default: m.ReportsModal })));
const HistoryImportModal = React.lazy(() => import('./HistoryImportModal').then(m => ({ default: m.HistoryImportModal })));
const TrashModal = React.lazy(() => import('./TrashModal').then(m => ({ default: m.TrashModal })));
const HallOfFameModal = React.lazy(() => import('./HallOfFameModal').then(m => ({ default: m.HallOfFameModal })));
const UpgradeModal = React.lazy(() => import('./UpgradeModal').then(m => ({ default: m.UpgradeModal })));
const OnboardingPro = React.lazy(() => import('./OnboardingPro').then(m => ({ default: m.OnboardingPro })));
const ProfileModal = React.lazy(() => import('./ProfileModal').then(m => ({ default: m.ProfileModal })));
const MissionsModal = React.lazy(() => import('./MissionsModal').then(m => ({ default: m.MissionsModal })));

interface ModalManagerProps {
  modals: any;
  closeModal: (modal: string) => void;
  user: User;
  setUser: (u: User) => void;
  cycles: Cycle[];
  reloadCycles: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  isPro: boolean;
  openUpgradeModal: () => void;
  isUpgradeModalOpen: boolean;
  closeUpgradeModal: () => void;
  handleUpgrade: () => void;
  handleStartTrial: () => void;
  isOnboardingOpen: boolean;
  closeOnboarding: () => void;
  editingCycle: Cycle | null;
  duplicatingCycle: Cycle | null;
  stats: { daily: number, weekly: number, monthly: number };
  handleReloadSettings: () => void;
  isPrivacyMode: boolean;
  alerts: Alert[];
  reports: Report[];
}

export const ModalManager: React.FC<ModalManagerProps> = ({
  modals, closeModal, user, setUser, cycles, reloadCycles, showToast, isPro,
  openUpgradeModal, isUpgradeModalOpen, closeUpgradeModal, handleUpgrade, handleStartTrial,
  isOnboardingOpen, closeOnboarding, editingCycle, duplicatingCycle, stats,
  handleReloadSettings, isPrivacyMode, alerts, reports
}) => {
  return (
    <Suspense fallback={null}>
      {modals.form && (
        <CycleForm 
          user={user} 
          onClose={() => closeModal('form')} 
          // CycleContext handles update optimistically, so no reloadCycles needed here
          onSuccess={(msg) => { showToast(msg); closeModal('form'); }} 
          cycleToEdit={editingCycle}
          cycleToDuplicate={duplicatingCycle}
          currentCount={cycles.length} 
          onShowPremium={openUpgradeModal} 
        />
      )}
      {modals.settings && (
        <SettingsModal 
          onClose={() => { closeModal('settings'); handleReloadSettings(); }} 
          onImportSuccess={reloadCycles} 
          onClearSuccess={reloadCycles} 
          onToast={showToast} 
          userId={user.id} 
          isPro={isPro} 
          onUpgrade={openUpgradeModal} 
        />
      )}
      {modals.profile && (
        <ProfileModal 
          user={user} 
          onClose={() => closeModal('profile')} 
          onUpdate={(u) => { setUser(u); showToast("Perfil salvo", "success"); }} 
          showToast={showToast} 
        />
      )}
      {modals.trash && <TrashModal onClose={() => closeModal('trash')} onUpdate={reloadCycles} userId={user.id} />}
      {modals.hall && <HallOfFameModal onClose={() => closeModal('hall')} cycles={cycles} isPrivacyMode={isPrivacyMode} />}
      
      {(modals.missions || modals.achievements) && <GamificationHub onClose={() => { closeModal('missions'); closeModal('achievements'); }} />}
      {modals.missions && <MissionsModal onClose={() => closeModal('missions')} user={user} cycles={cycles} isPro={isPro} onUpgrade={openUpgradeModal} />}

      {modals.flex && <FlexCardModal onClose={() => closeModal('flex')} stats={stats} user={user} />}
      {modals.alerts && <AlertsModal alerts={alerts} onClose={() => { closeModal('alerts'); handleReloadSettings(); }} onUpdate={handleReloadSettings} userId={user.id} />}
      {modals.reports && <ReportsModal reports={reports} onClose={() => closeModal('reports')} onUpdate={handleReloadSettings} user={user} isPro={isPro} onUpgrade={openUpgradeModal} />}

      {modals.import && <HistoryImportModal onClose={() => closeModal('import')} onSuccess={(msg) => { reloadCycles(); showToast(msg); }} user={user} />}
      
      {isUpgradeModalOpen && <UpgradeModal onClose={closeUpgradeModal} onUpgrade={handleUpgrade} onStartTrial={handleStartTrial} />}
      {isOnboardingOpen && <OnboardingPro onClose={closeOnboarding} />}
    </Suspense>
  );
};
