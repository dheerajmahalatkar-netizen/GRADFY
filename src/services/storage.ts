import { DEFAULT_GRADING_CONFIG } from '../data/defaultConfig';
import { SAMPLE_BATCHES } from '../data/sampleBatches';
import { SAMPLE_USERS } from '../data/sampleUsers';
import { INITIAL_NOTIFICATIONS, INITIAL_AUDIT_LOGS } from '../data/sampleNotifications';
import {
  Batch,
  GradingConfiguration,
  HumanVerification,
  LotSegregation,
  SyncQueueItem,
  SystemStatus,
  AppNotification,
  AuditLog,
  AppUser,
  UserRole,
} from '../types';

const STORAGE_KEYS = {
  BATCHES: 'gradfy_batches_v2',
  CONFIG: 'gradfy_config_v2',
  SYNC_QUEUE: 'gradfy_sync_queue_v2',
  AUDIT_LOGS: 'gradfy_audit_logs_v2',
  NOTIFICATIONS: 'gradfy_notifications_v2',
  CURRENT_USER: 'gradfy_current_user_v2',
  LAST_SYNC: 'gradfy_last_sync_v2',
};

class StorageService {
  private batches: Batch[] = [];
  private config: GradingConfiguration = DEFAULT_GRADING_CONFIG;
  private syncQueue: SyncQueueItem[] = [];
  private notifications: AppNotification[] = [];
  private auditLogs: AuditLog[] = [];
  private currentUser: AppUser = SAMPLE_USERS.farmer;
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    try {
      // Load batches
      const savedBatches = localStorage.getItem(STORAGE_KEYS.BATCHES);
      if (savedBatches) {
        this.batches = JSON.parse(savedBatches);
      } else {
        this.batches = [...SAMPLE_BATCHES];
        this.saveBatchesToDisk();
      }

      // Load config
      const savedConfig = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (savedConfig) {
        this.config = JSON.parse(savedConfig);
      } else {
        this.config = DEFAULT_GRADING_CONFIG;
        localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(this.config));
      }

      // Load sync queue
      const savedQueue = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      if (savedQueue) {
        this.syncQueue = JSON.parse(savedQueue);
      }

      // Load notifications
      const savedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (savedNotifs) {
        this.notifications = JSON.parse(savedNotifs);
      } else {
        this.notifications = [...INITIAL_NOTIFICATIONS];
        this.saveNotificationsToDisk();
      }

      // Load audit logs
      const savedAudits = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (savedAudits) {
        this.auditLogs = JSON.parse(savedAudits);
      } else {
        this.auditLogs = [...INITIAL_AUDIT_LOGS];
        this.saveAuditLogsToDisk();
      }

      // Load user
      const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
      } else {
        this.currentUser = SAMPLE_USERS.farmer;
      }

      this.isInitialized = true;
    } catch (err) {
      console.error('Storage initialization error:', err);
      this.batches = [...SAMPLE_BATCHES];
      this.config = DEFAULT_GRADING_CONFIG;
      this.notifications = [...INITIAL_NOTIFICATIONS];
      this.auditLogs = [...INITIAL_AUDIT_LOGS];
    }
  }

  private saveBatchesToDisk() {
    try {
      localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(this.batches));
    } catch (e) {
      console.warn('LocalStorage batch save quota limit, persisting memory state:', e);
    }
  }

  private saveSyncQueueToDisk() {
    try {
      localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(this.syncQueue));
    } catch (e) {
      console.warn('LocalStorage sync queue save error:', e);
    }
  }

  private saveNotificationsToDisk() {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
    } catch (e) {
      console.warn('LocalStorage notifications save error:', e);
    }
  }

  private saveAuditLogsToDisk() {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
    } catch (e) {
      console.warn('LocalStorage audit logs save error:', e);
    }
  }

  // BATCH METHODS
  public getBatches(): Batch[] {
    return [...this.batches];
  }

  public getBatchById(id: string): Batch | undefined {
    return this.batches.find((b) => b.id === id || b.batchCode === id);
  }

  public getBatchByReportId(reportId: string): Batch | undefined {
    return this.batches.find(
      (b) => b.qualityPassport?.reportId === reportId || b.analysisResult?.id === reportId
    );
  }

  public saveBatch(batch: Batch): Batch {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const existingIndex = this.batches.findIndex((b) => b.id === batch.id);

    const updatedBatch: Batch = {
      ...batch,
      updatedAt: new Date().toISOString(),
      syncStatus: isOnline ? 'synced' : 'pending_sync',
    };

    if (existingIndex >= 0) {
      this.batches[existingIndex] = updatedBatch;
    } else {
      this.batches.unshift(updatedBatch);
    }

    this.saveBatchesToDisk();

    // Log audit event
    this.addAuditLog({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: this.currentUser.name,
      role: this.currentUser.role,
      action: existingIndex >= 0 ? 'BATCH_UPDATED' : 'BATCH_CREATED',
      details: `${existingIndex >= 0 ? 'Updated' : 'Created'} batch ${batch.batchCode} (${batch.quantityKg} kg, ${batch.variety}).`,
      batchId: batch.id,
    });

    // Add notification if new or flagged
    if (batch.analysisResult?.flaggedForHumanReview) {
      this.addNotification({
        id: `notif-${Date.now()}`,
        title: 'Review Required: ' + batch.batchCode,
        message: `Batch flagged for low confidence (${batch.analysisResult.confidenceScore}%) or high sprouting.`,
        type: 'low_confidence',
        timestamp: new Date().toISOString(),
        read: false,
        batchId: batch.id,
        reportId: batch.qualityPassport?.reportId,
      });
    }

    // Queue for sync if offline or new
    this.enqueueSync({
      id: `sync-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      batchId: updatedBatch.id,
      action: existingIndex >= 0 ? 'update_analysis' : 'create_batch',
      timestamp: new Date().toISOString(),
      retryCount: 0,
      status: isOnline ? 'completed' : 'pending',
      payload: updatedBatch,
    });

    return updatedBatch;
  }

  public deleteBatch(id: string): boolean {
    const initialLen = this.batches.length;
    const batch = this.getBatchById(id);
    this.batches = this.batches.filter((b) => b.id !== id);
    if (this.batches.length !== initialLen) {
      this.saveBatchesToDisk();
      if (batch) {
        this.addAuditLog({
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: this.currentUser.name,
          role: this.currentUser.role,
          action: 'BATCH_DELETED',
          details: `Deleted batch ${batch.batchCode}.`,
          batchId: id,
        });
      }
      return true;
    }
    return false;
  }

  // HUMAN VERIFICATION
  public recordHumanVerification(batchId: string, verification: HumanVerification): Batch | null {
    const batch = this.getBatchById(batchId);
    if (!batch) return null;

    batch.humanVerification = verification;
    batch.status = 'Verified';
    if (batch.analysisResult) {
      batch.analysisResult.overallGrade = verification.finalGrade;
      batch.analysisResult.oqiScore = verification.finalOqi;
      batch.analysisResult.flaggedForHumanReview = false;
    }

    if (batch.qualityPassport) {
      batch.qualityPassport.overallGrade = verification.finalGrade;
      batch.qualityPassport.oqiScore = verification.finalOqi;
      batch.qualityPassport.verificationStatus = 'VERIFIED_BY_INSPECTOR';
      batch.qualityPassport.isTamperVerified = true;
    }

    const saved = this.saveBatch(batch);

    this.addAuditLog({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: verification.verifiedBy,
      role: verification.role,
      action: verification.status === 'MODIFIED' ? 'GRADE_OVERRIDDEN' : 'GRADE_APPROVED',
      details: `${verification.status === 'MODIFIED' ? 'Adjusted' : 'Confirmed'} grade to ${verification.finalGrade} (OQI ${verification.finalOqi}). Notes: ${verification.inspectorNotes}`,
      batchId,
    });

    this.addNotification({
      id: `notif-${Date.now()}`,
      title: 'Batch Verified by Inspector',
      message: `${batch.batchCode} verified by ${verification.verifiedBy}. Final Grade: ${verification.finalGrade}.`,
      type: 'verification_completed',
      timestamp: new Date().toISOString(),
      read: false,
      batchId,
      reportId: batch.qualityPassport?.reportId,
    });

    return saved;
  }

  // LOT SEGREGATION
  public saveLots(batchId: string, lots: LotSegregation[]): Batch | null {
    const batch = this.getBatchById(batchId);
    if (!batch) return null;

    batch.lots = lots;
    batch.status = 'Lot Segregated';
    const saved = this.saveBatch(batch);

    this.addAuditLog({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: this.currentUser.name,
      role: this.currentUser.role,
      action: 'LOTS_SEGREGATED',
      details: `Divided batch ${batch.batchCode} into ${lots.length} commercial lots.`,
      batchId,
    });

    this.addNotification({
      id: `notif-${Date.now()}`,
      title: 'Commercial Lots Created',
      message: `${lots.length} lots created for ${batch.batchCode} (${lots.map((l) => l.name).join(', ')}).`,
      type: 'report_generated',
      timestamp: new Date().toISOString(),
      read: false,
      batchId,
    });

    return saved;
  }

  // CONFIGURATION METHODS
  public getConfig(): GradingConfiguration {
    return { ...this.config };
  }

  public saveConfig(newConfig: GradingConfiguration): void {
    this.config = { ...newConfig, lastUpdated: new Date().toISOString().split('T')[0] };
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(this.config));

    this.addAuditLog({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: this.currentUser.name,
      role: this.currentUser.role,
      action: 'CONFIGURATION_UPDATED',
      details: `Updated grading standard: ${newConfig.configName} (${newConfig.version}).`,
    });

    this.enqueueSync({
      id: `sync-cfg-${Date.now()}`,
      batchId: 'global-config',
      action: 'update_config',
      timestamp: new Date().toISOString(),
      retryCount: 0,
      status: 'pending',
      payload: this.config,
    });
  }

  // NOTIFICATION METHODS
  public getNotifications(): AppNotification[] {
    return [...this.notifications];
  }

  public addNotification(notification: AppNotification): void {
    this.notifications.unshift(notification);
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }
    this.saveNotificationsToDisk();
  }

  public markNotificationAsRead(id: string): void {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.saveNotificationsToDisk();
    }
  }

  public markAllNotificationsAsRead(): void {
    this.notifications.forEach((n) => {
      n.read = true;
    });
    this.saveNotificationsToDisk();
  }

  public clearAllNotifications(): void {
    this.notifications = [];
    this.saveNotificationsToDisk();
  }

  // AUDIT LOG METHODS
  public getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  public addAuditLog(log: AuditLog): void {
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 100) {
      this.auditLogs = this.auditLogs.slice(0, 100);
    }
    this.saveAuditLogsToDisk();
  }

  // USER / PERSONA METHODS
  public getCurrentUser(): AppUser {
    return { ...this.currentUser };
  }

  public setUserRole(role: UserRole): AppUser {
    const user = SAMPLE_USERS[role] || SAMPLE_USERS.farmer;
    this.currentUser = { ...user };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
    return this.currentUser;
  }

  // SYNC QUEUE METHODS
  public getSyncQueue(): SyncQueueItem[] {
    return [...this.syncQueue];
  }

  public enqueueSync(item: SyncQueueItem): void {
    if (item.status === 'completed') return;
    this.syncQueue.push(item);
    this.saveSyncQueueToDisk();
  }

  public async processSyncQueue(): Promise<{ syncedCount: number; errors: number }> {
    const pendingItems = this.syncQueue.filter((item) => item.status === 'pending');
    if (pendingItems.length === 0) {
      return { syncedCount: 0, errors: 0 };
    }

    let syncedCount = 0;
    let errors = 0;

    for (const item of pendingItems) {
      item.status = 'syncing';
      try {
        await new Promise((resolve) => setTimeout(resolve, 250));

        const batch = this.batches.find((b) => b.id === item.batchId);
        if (batch) {
          batch.syncStatus = 'synced';
        }

        item.status = 'completed';
        syncedCount++;
      } catch (err: any) {
        item.status = 'failed';
        item.retryCount += 1;
        item.error = err?.message || 'Sync failed';
        errors++;
      }
    }

    this.syncQueue = this.syncQueue.filter((item) => item.status !== 'completed').slice(-20);
    this.saveBatchesToDisk();
    this.saveSyncQueueToDisk();

    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());

    if (syncedCount > 0) {
      this.addNotification({
        id: `notif-${Date.now()}`,
        title: 'Cloud Synchronization Complete',
        message: `${syncedCount} offline record(s) transmitted to central PostgreSQL database.`,
        type: 'sync_completed',
        timestamp: new Date().toISOString(),
        read: false,
      });

      this.addAuditLog({
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'SyncWorkerService',
        role: 'Background System',
        action: 'QUEUE_SYNCHRONIZED',
        details: `Successfully uploaded ${syncedCount} queued records to central registry.`,
      });
    }

    return { syncedCount, errors };
  }

  // SYSTEM STATUS
  public getSystemStatus(): SystemStatus {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const pendingCount = this.syncQueue.filter((q) => q.status === 'pending').length;
    const lastSync = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.LAST_SYNC) : null;

    // Approximate storage usage in MB
    let totalChars = 0;
    try {
      totalChars =
        (localStorage.getItem(STORAGE_KEYS.BATCHES)?.length || 0) +
        (localStorage.getItem(STORAGE_KEYS.CONFIG)?.length || 0) +
        (localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE)?.length || 0) +
        (localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)?.length || 0) +
        (localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)?.length || 0);
    } catch {
      totalChars = 50000;
    }
    const storageUsageMb = Math.round((totalChars / 1024 / 1024) * 100) / 100;

    return {
      online: isOnline,
      localDbActive: true,
      syncQueueCount: pendingCount,
      lastSyncTime: lastSync,
      modelVersion: this.config.version,
      backendConnected: true,
      geminiVisionAvailable: true,
      storageUsageMb: Math.max(0.12, storageUsageMb),
      indexedDbRecordsCount: this.batches.length + this.auditLogs.length,
    };
  }

  // RESET TO DEMO DATA
  public resetToSampleData(): void {
    this.batches = [...SAMPLE_BATCHES];
    this.config = DEFAULT_GRADING_CONFIG;
    this.syncQueue = [];
    this.notifications = [...INITIAL_NOTIFICATIONS];
    this.auditLogs = [...INITIAL_AUDIT_LOGS];
    this.currentUser = SAMPLE_USERS.farmer;
    this.saveBatchesToDisk();
    this.saveSyncQueueToDisk();
    this.saveNotificationsToDisk();
    this.saveAuditLogsToDisk();
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(this.config));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
  }
}

export const storageService = new StorageService();
