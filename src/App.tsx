import React, { useState, useEffect } from 'react';
import { UserRole, Batch, GradingConfiguration, SystemStatus, AppUser, AppNotification } from './types';
import { storageService } from './services/storage';
import { TopBar } from './components/navigation/TopBar';
import { MobileBottomNav } from './components/navigation/MobileBottomNav';
import { GlobalSearchModal } from './components/navigation/GlobalSearchModal';
import { NotificationCenterModal } from './components/navigation/NotificationCenterModal';
import { SyncCenterModal } from './components/navigation/SyncCenterModal';
import { UniqueHomePage } from './components/home/UniqueHomePage';
import { GradingStudio } from './components/grading/GradingStudio';
import { FarmerDashboard } from './components/dashboards/FarmerDashboard';
import { BuyerDashboard } from './components/dashboards/BuyerDashboard';
import { InspectorAdminDashboard } from './components/dashboards/InspectorAdminDashboard';
import { VerificationAuditView } from './components/verification/VerificationAuditView';
import { ReportCenterView } from './components/reports/ReportCenterView';
import { ModelInfoCenterView } from './components/system/ModelInfoCenterView';
import { DigitalQualityReportModal } from './components/reports/DigitalQualityReportModal';
import { LotSegregationModal } from './components/grading/LotSegregationModal';
import { HumanVerificationModal } from './components/verification/HumanVerificationModal';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('farmer');
  const [currentUser, setCurrentUser] = useState<AppUser>(storageService.getCurrentUser());
  const [activeTab, setActiveTab] = useState<string>('home');
  const [batches, setBatches] = useState<Batch[]>([]);
  const [config, setConfig] = useState<GradingConfiguration>(storageService.getConfig());
  const [systemStatus, setSystemStatus] = useState<SystemStatus>(storageService.getSystemStatus());
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [auditReportId, setAuditReportId] = useState<string>('REP-GRD-0891');

  // Modals & Drawers
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
  const [syncCenterModalOpen, setSyncCenterModalOpen] = useState(false);
  const [reportModalBatch, setReportModalBatch] = useState<Batch | null>(null);
  const [lotsModalBatch, setLotsModalBatch] = useState<Batch | null>(null);
  const [verificationModalBatch, setVerificationModalBatch] = useState<Batch | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync state from storage
  const reloadStorageState = () => {
    setBatches(storageService.getBatches());
    setConfig(storageService.getConfig());
    setSystemStatus(storageService.getSystemStatus());
    setNotifications(storageService.getNotifications());
    setCurrentUser(storageService.getCurrentUser());
  };

  useEffect(() => {
    reloadStorageState();

    const handleOnline = () => {
      reloadStorageState();
      showToast('Internet connection restored. Synchronizing offline queue...');
      handleTriggerSync();
    };

    const handleOffline = () => {
      reloadStorageState();
      showToast('You are now in Offline Mode. All records saved locally to device.');
    };

    // Hash navigation listener for #verify/[report-id]
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#verify/')) {
        const reportId = hash.replace('#verify/', '');
        setAuditReportId(reportId);
        setActiveTab('traceability');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    const updatedUser = storageService.setUserRole(role);
    setCurrentUser(updatedUser);
    showToast(`Switched active workspace persona: ${updatedUser.name} (${role.toUpperCase()})`);
  };

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    try {
      const { syncedCount, errors } = await storageService.processSyncQueue();
      reloadStorageState();
      if (syncedCount > 0) {
        showToast(`Successfully synchronized ${syncedCount} record(s) with central database.`);
      } else if (errors > 0) {
        showToast('Sync completed with minor network retries.');
      } else {
        showToast('Local database is up to date.');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveBatch = (savedBatch: Batch) => {
    const updated = storageService.saveBatch(savedBatch);
    reloadStorageState();
    setSelectedBatch(updated);
    showToast(`Batch ${savedBatch.batchCode} saved successfully to local storage.`);
  };

  const handleUpdateConfig = (newConfig: GradingConfiguration) => {
    storageService.saveConfig(newConfig);
    reloadStorageState();
    showToast('Grading configuration and OQI weights updated successfully.');
  };

  const handleSelectBatch = (batch: Batch) => {
    setSelectedBatch(batch);
    setActiveTab('grading');
  };

  const handleNewBatch = () => {
    setSelectedBatch(null);
    setActiveTab('grading');
  };

  const handleOpenAudit = (reportId: string) => {
    setAuditReportId(reportId);
    setActiveTab('traceability');
  };

  const handleLotsSaved = (lots: any) => {
    if (!lotsModalBatch) return;
    const updated = storageService.saveLots(lotsModalBatch.id, lots);
    if (updated) {
      reloadStorageState();
      setSelectedBatch(updated);
      showToast(`Batch segregated into ${lots.length} commercial lots.`);
    }
  };

  const handleVerificationDone = (batchId: string, verification: any) => {
    const updated = storageService.recordHumanVerification(batchId, verification);
    if (updated) {
      reloadStorageState();
      setSelectedBatch(updated);
      showToast(`Batch ${updated.batchCode} signed and certified by inspector.`);
    }
  };

  const handleResetDemo = () => {
    if (confirm('Reset database to default calibrated demonstration batches?')) {
      storageService.resetToSampleData();
      reloadStorageState();
      setSelectedBatch(null);
      showToast('Database reset to default demo dataset.');
    }
  };

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#fbf9f5] text-[#1f2421] flex flex-col font-sans pb-16 md:pb-0">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 bg-[#14291f] text-white px-4 py-2.5 rounded-xl border border-[#2d4d3b] text-xs font-medium shadow-2xl flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Navigation (Strict 3-zone Top Bar Contract) */}
      <TopBar
        currentRole={currentRole}
        currentUser={currentUser}
        onRoleChange={handleRoleChange}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOnline={systemStatus.online}
        syncQueueCount={systemStatus.syncQueueCount}
        unreadNotificationsCount={unreadNotifsCount}
        onOpenSearch={() => setSearchModalOpen(true)}
        onOpenNotifications={() => setNotificationsModalOpen(true)}
        onOpenSync={() => setSyncCenterModalOpen(true)}
        isSyncing={isSyncing}
      />

      {/* Main Viewport Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* VIEW 1: Unique Home Page */}
        {activeTab === 'home' && (
          <UniqueHomePage
            onStartGrading={() => {
              setSelectedBatch(null);
              setActiveTab('grading');
            }}
            onExplorePlatform={() => {
              setActiveTab('dashboard');
            }}
            onOpenAudit={handleOpenAudit}
          />
        )}

        {/* VIEW 2: Grading Studio */}
        {activeTab === 'grading' && (
          <GradingStudio
            config={config}
            onSaveBatch={handleSaveBatch}
            initialBatch={selectedBatch}
            onOpenVerificationAudit={handleOpenAudit}
          />
        )}

        {/* VIEW 3: Role-Specific Workspace Dashboards */}
        {activeTab === 'dashboard' && (
          <>
            {currentRole === 'farmer' && (
              <FarmerDashboard
                batches={batches}
                onSelectBatch={handleSelectBatch}
                onNewBatch={handleNewBatch}
                onOpenReport={(batch) => setReportModalBatch(batch)}
              />
            )}
            {currentRole === 'buyer' && (
              <BuyerDashboard
                batches={batches}
                onSelectBatch={handleSelectBatch}
                onNewBatch={handleNewBatch}
                onOpenReport={(batch) => setReportModalBatch(batch)}
                onOpenLots={(batch) => setLotsModalBatch(batch)}
                onOpenVerification={(batch) => setVerificationModalBatch(batch)}
                onOpenQrVerification={() => setActiveTab('traceability')}
              />
            )}
            {currentRole === 'inspector' && (
              <InspectorAdminDashboard
                batches={batches}
                config={config}
                onUpdateConfig={handleUpdateConfig}
                onOpenVerification={(batch) => setVerificationModalBatch(batch)}
                onSaveVerification={handleVerificationDone}
                systemStatus={systemStatus}
                onTriggerSync={handleTriggerSync}
                isSyncing={isSyncing}
              />
            )}
          </>
        )}

        {/* VIEW 4: Advanced Report Center (Section 32) */}
        {activeTab === 'reports' && (
          <ReportCenterView
            batches={batches}
            onOpenReport={(batch) => setReportModalBatch(batch)}
            onOpenVerification={handleOpenAudit}
          />
        )}

        {/* VIEW 5: Traceability & Public QR Verifier */}
        {activeTab === 'traceability' && (
          <VerificationAuditView
            initialReportId={auditReportId}
            onBack={() => setActiveTab('dashboard')}
          />
        )}

        {/* VIEW 6: Model Information & System Health Center (Section 34, 35) */}
        {activeTab === 'system-info' && (
          <ModelInfoCenterView
            config={config}
            systemStatus={systemStatus}
          />
        )}
      </main>

      {/* Global Modals & Drawers */}
      {searchModalOpen && (
        <GlobalSearchModal
          batches={batches}
          isOpen={searchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          onSelectBatch={handleSelectBatch}
          onOpenReport={(batch) => setReportModalBatch(batch)}
          onOpenVerification={handleOpenAudit}
        />
      )}

      {notificationsModalOpen && (
        <NotificationCenterModal
          notifications={notifications}
          isOpen={notificationsModalOpen}
          onClose={() => setNotificationsModalOpen(false)}
          onMarkRead={(id) => {
            storageService.markNotificationAsRead(id);
            setNotifications(storageService.getNotifications());
          }}
          onMarkAllRead={() => {
            storageService.markAllNotificationsAsRead();
            setNotifications(storageService.getNotifications());
          }}
          onClearAll={() => {
            storageService.clearAllNotifications();
            setNotifications([]);
          }}
          onNavigateToBatch={(batchId) => {
            const found = storageService.getBatchById(batchId);
            if (found) handleSelectBatch(found);
          }}
        />
      )}

      {syncCenterModalOpen && (
        <SyncCenterModal
          isOpen={syncCenterModalOpen}
          onClose={() => setSyncCenterModalOpen(false)}
          systemStatus={systemStatus}
          syncQueue={storageService.getSyncQueue()}
          onTriggerSync={handleTriggerSync}
          isSyncing={isSyncing}
        />
      )}

      {reportModalBatch && (
        <DigitalQualityReportModal
          batch={reportModalBatch}
          isOpen={Boolean(reportModalBatch)}
          onClose={() => setReportModalBatch(null)}
        />
      )}

      {lotsModalBatch && (
        <LotSegregationModal
          batch={lotsModalBatch}
          isOpen={Boolean(lotsModalBatch)}
          onClose={() => setLotsModalBatch(null)}
          onSaveLots={handleLotsSaved}
        />
      )}

      {verificationModalBatch && (
        <HumanVerificationModal
          batch={verificationModalBatch}
          isOpen={Boolean(verificationModalBatch)}
          onClose={() => setVerificationModalBatch(null)}
          onCompleteVerification={(v) => {
            handleVerificationDone(verificationModalBatch.id, v);
            setVerificationModalBatch(null);
          }}
        />
      )}

      {/* Mobile-First Bottom Navigation Bar (Section 30, 31 requirement) */}
      <MobileBottomNav
        currentRole={currentRole}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenSearch={() => setSearchModalOpen(true)}
        onOpenSync={() => setSyncCenterModalOpen(true)}
        syncQueueCount={systemStatus.syncQueueCount}
      />

      {/* Footer */}
      <footer className="hidden md:block border-t border-[#e5dec9] bg-[#f5f0e8] text-xs text-[#556159] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#14291f] tracking-tight">GRADFY</span>
            <span>·</span>
            <span>Intelligent Agricultural Quality Infrastructure & Cryptographic Traceability</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Model: {config.version}</span>
            <span>·</span>
            <button
              onClick={handleResetDemo}
              className="text-[#c85a32] hover:underline focus:outline-none"
            >
              Reset Calibrated Demo Data
            </button>
            <span>·</span>
            <span>© 2026 GRADFY Agricultural Technology Platform</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
