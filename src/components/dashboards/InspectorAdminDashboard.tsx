import React, { useState } from 'react';
import { Batch, GradingConfiguration, HumanVerification, SyncQueueItem, SystemStatus } from '../../types';
import { storageService } from '../../services/storage';
import { InspectorWorkbench } from '../verification/InspectorWorkbench';
import {
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Database,
  Cpu,
  RefreshCw,
  AlertTriangle,
  History,
  Save,
  Check,
  FileCheck,
} from 'lucide-react';

interface InspectorAdminDashboardProps {
  batches: Batch[];
  config: GradingConfiguration;
  onUpdateConfig: (newConfig: GradingConfiguration) => void;
  onOpenVerification: (batch: Batch) => void;
  onSaveVerification?: (batchId: string, verification: HumanVerification) => void;
  systemStatus: SystemStatus;
  onTriggerSync: () => void;
  isSyncing: boolean;
}

export const InspectorAdminDashboard: React.FC<InspectorAdminDashboardProps> = ({
  batches,
  config,
  onUpdateConfig,
  onOpenVerification,
  onSaveVerification,
  systemStatus,
  onTriggerSync,
  isSyncing,
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'config' | 'system' | 'dataset' | 'audit'>('queue');
  const [localConfig, setLocalConfig] = useState<GradingConfiguration>({ ...config });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [workbenchBatch, setWorkbenchBatch] = useState<Batch | null>(null);

  // Batches needing human inspection
  const pendingReviewBatches = batches.filter(
    (b) => b.analysisResult?.flaggedForHumanReview && !b.humanVerification
  );
  const completedReviews = batches.filter((b) => b.humanVerification);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(localConfig);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const syncQueue = storageService.getSyncQueue();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-[#14291f] to-[#1f382a] rounded-2xl text-white border border-[#2d4d3b] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
              QUALITY INSPECTOR CONSOLE
            </span>
            <span className="text-xs text-neutral-400">· APMC Calibration & Oversight</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Grading Rules, Verification & Model Governance</h2>
          <p className="text-xs text-neutral-300 mt-0.5">
            Maintain configurable onion grading parameters, resolve uncertain AI inferences, and audit synchronization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onTriggerSync}
            disabled={isSyncing}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Offline Queue'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#dad2c3] pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'queue'
              ? 'bg-[#1b382b] text-white shadow-2xs'
              : 'text-[#556159] hover:text-[#14291f] hover:bg-[#f5f0e8]'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Verification Queue ({pendingReviewBatches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'config'
              ? 'bg-[#1b382b] text-white shadow-2xs'
              : 'text-[#556159] hover:text-[#14291f] hover:bg-[#f5f0e8]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Grading Standard Configuration</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'system'
              ? 'bg-[#1b382b] text-white shadow-2xs'
              : 'text-[#556159] hover:text-[#14291f] hover:bg-[#f5f0e8]'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>System & Offline Status</span>
        </button>

        <button
          onClick={() => setActiveTab('dataset')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'dataset'
              ? 'bg-[#1b382b] text-white shadow-2xs'
              : 'text-[#556159] hover:text-[#14291f] hover:bg-[#f5f0e8]'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Feedback Dataset ({completedReviews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'audit'
              ? 'bg-[#1b382b] text-white shadow-2xs'
              : 'text-[#556159] hover:text-[#14291f] hover:bg-[#f5f0e8]'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Audit Trail ({storageService.getAuditLogs().length})</span>
        </button>
      </div>

      {/* TAB 1: Verification Queue (Feature 11) */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-[#dad2c3] shadow-2xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#14291f]">
                Batches Awaiting Human Inspector Sign-Off
              </h3>
              <p className="text-xs text-[#556159]">
                Inferences flagged for low confidence (&lt;{config.uncertaintyThreshold}%) or high sprouting requiring physical audit
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-amber-100 text-amber-900 border border-amber-300">
              {pendingReviewBatches.length} PENDING
            </span>
          </div>

          {pendingReviewBatches.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#dad2c3] space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-[#14291f]">Verification Queue Clear</h4>
              <p className="text-xs text-[#556159] max-w-sm mx-auto">
                All processed batches currently exceed the confidence threshold and meet automated certification rules.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingReviewBatches.map((batch) => {
                const analysis = batch.analysisResult;
                return (
                  <div
                    key={batch.id}
                    className="p-5 bg-white rounded-2xl border border-[#dad2c3] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#14291f]">
                          {batch.batchCode}
                        </span>
                        <span className="text-[#556159]">·</span>
                        <span className="font-semibold text-xs text-[#14291f]">{batch.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 rounded font-bold">
                          FLAGGED: {analysis?.confidence} CONFIDENCE ({analysis?.confidenceScore}%)
                        </span>
                      </div>
                      <p className="text-xs text-[#556159]">
                        Farmer: {batch.farmerName} ({batch.location}) · Variety: {batch.variety} · {batch.quantityKg} kg
                      </p>
                      <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 mt-2">
                        <strong>Reason: </strong>
                        {analysis?.flagReason || 'Requires inspector verification.'}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right font-mono text-xs">
                        <div className="text-[#556159]">AI Grade: <strong className="text-[#14291f]">{analysis?.overallGrade}</strong></div>
                        <div className="text-[#556159]">OQI: <strong className="text-[#14291f]">{analysis?.oqiScore}</strong></div>
                      </div>

                      <button
                        onClick={() => setWorkbenchBatch(batch)}
                        className="px-4 py-2 bg-[#1b382b] hover:bg-[#14291f] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs whitespace-nowrap"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                        <span>Open Verification Workbench</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Grading Configuration (Feature 32) */}
      {activeTab === 'config' && (
        <form onSubmit={handleSaveConfig} className="p-6 bg-white rounded-2xl border border-[#dad2c3] shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#e5dec9]">
            <div>
              <h3 className="text-sm font-bold text-[#14291f]">
                Configurable Grading Engine Parameters
              </h3>
              <p className="text-xs text-[#556159]">
                Adjust mathematical weights for OQI calculation and grade classification boundaries
              </p>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-[#1b382b] hover:bg-[#14291f] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {savedSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
              <span>{savedSuccess ? 'Configuration Saved!' : 'Save Configuration'}</span>
            </button>
          </div>

          {/* Configuration Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-[#556159] block mb-1">
                Standard Profile Name:
              </label>
              <input
                type="text"
                value={localConfig.configName}
                onChange={(e) => setLocalConfig({ ...localConfig, configName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#dad2c3] text-xs font-medium"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#556159] block mb-1">
                Standard Version Code:
              </label>
              <input
                type="text"
                value={localConfig.version}
                onChange={(e) => setLocalConfig({ ...localConfig, version: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#dad2c3] text-xs font-mono font-medium"
              />
            </div>
          </div>

          {/* OQI Factor Weights */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-[#14291f] uppercase tracking-wider">
              Onion Quality Index (OQI) Measurable Factor Weights (Must Sum to 100%)
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-3 bg-[#fbf9f5] rounded-xl border border-[#dad2c3]">
                <label className="text-[11px] text-[#556159] block mb-1">Size Uniformity (%)</label>
                <input
                  type="number"
                  value={localConfig.weights.sizeUniformity}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      weights: { ...localConfig.weights, sizeUniformity: Number(e.target.value) },
                    })
                  }
                  className="w-full px-2 py-1.5 rounded border border-[#dad2c3] font-mono font-bold text-center"
                />
              </div>

              <div className="p-3 bg-[#fbf9f5] rounded-xl border border-[#dad2c3]">
                <label className="text-[11px] text-[#556159] block mb-1">Defect Rate (%)</label>
                <input
                  type="number"
                  value={localConfig.weights.defectRate}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      weights: { ...localConfig.weights, defectRate: Number(e.target.value) },
                    })
                  }
                  className="w-full px-2 py-1.5 rounded border border-[#dad2c3] font-mono font-bold text-center"
                />
              </div>

              <div className="p-3 bg-[#fbf9f5] rounded-xl border border-[#dad2c3]">
                <label className="text-[11px] text-[#556159] block mb-1">Sprouting (%)</label>
                <input
                  type="number"
                  value={localConfig.weights.sproutingRate}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      weights: { ...localConfig.weights, sproutingRate: Number(e.target.value) },
                    })
                  }
                  className="w-full px-2 py-1.5 rounded border border-[#dad2c3] font-mono font-bold text-center"
                />
              </div>

              <div className="p-3 bg-[#fbf9f5] rounded-xl border border-[#dad2c3]">
                <label className="text-[11px] text-[#556159] block mb-1">Skin Sheath (%)</label>
                <input
                  type="number"
                  value={localConfig.weights.skinCondition}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      weights: { ...localConfig.weights, skinCondition: Number(e.target.value) },
                    })
                  }
                  className="w-full px-2 py-1.5 rounded border border-[#dad2c3] font-mono font-bold text-center"
                />
              </div>

              <div className="p-3 bg-[#fbf9f5] rounded-xl border border-[#dad2c3]">
                <label className="text-[11px] text-[#556159] block mb-1">Shape (%)</label>
                <input
                  type="number"
                  value={localConfig.weights.shapeCharacteristics}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      weights: { ...localConfig.weights, shapeCharacteristics: Number(e.target.value) },
                    })
                  }
                  className="w-full px-2 py-1.5 rounded border border-[#dad2c3] font-mono font-bold text-center"
                />
              </div>
            </div>
          </div>

          {/* Grade Thresholds & Uncertainty Policy */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
            <div className="p-3 bg-[#fbf9f5] rounded-xl border border-[#dad2c3]">
              <label className="text-[11px] font-semibold text-[#556159] block mb-1">
                Grade A Minimum OQI:
              </label>
              <input
                type="number"
                value={localConfig.gradeThresholds.gradeA_MinOQI}
                onChange={(e) =>
                  setLocalConfig({
                    ...localConfig,
                    gradeThresholds: {
                      ...localConfig.gradeThresholds,
                      gradeA_MinOQI: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-1.5 rounded border border-[#dad2c3] font-mono font-bold"
              />
            </div>

            <div className="p-3 bg-[#fbf9f5] rounded-xl border border-[#dad2c3]">
              <label className="text-[11px] font-semibold text-[#556159] block mb-1">
                Grade A Max Permissible Defects (%):
              </label>
              <input
                type="number"
                value={localConfig.gradeThresholds.gradeA_MaxDefectPct}
                onChange={(e) =>
                  setLocalConfig({
                    ...localConfig,
                    gradeThresholds: {
                      ...localConfig.gradeThresholds,
                      gradeA_MaxDefectPct: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-1.5 rounded border border-[#dad2c3] font-mono font-bold"
              />
            </div>

            <div className="p-3 bg-[#fbf9f5] rounded-xl border border-[#dad2c3]">
              <label className="text-[11px] font-semibold text-[#556159] block mb-1">
                Human Review Trigger (Confidence &lt; %):
              </label>
              <input
                type="number"
                value={localConfig.uncertaintyThreshold}
                onChange={(e) =>
                  setLocalConfig({
                    ...localConfig,
                    uncertaintyThreshold: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-1.5 rounded border border-[#dad2c3] font-mono font-bold"
              />
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: System & Offline Observability (Feature 34 & Feature 12) */}
      {activeTab === 'system' && (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-xl border border-[#dad2c3]">
              <div className="text-[11px] text-[#556159]">Network Connectivity</div>
              <div className="text-base font-bold font-mono text-[#14291f] mt-1 flex items-center gap-1.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    systemStatus.online ? 'bg-emerald-600' : 'bg-amber-500'
                  }`}
                />
                <span>{systemStatus.online ? 'ONLINE' : 'OFFLINE MODE'}</span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#dad2c3]">
              <div className="text-[11px] text-[#556159]">Local IndexedDB Cache</div>
              <div className="text-base font-bold font-mono text-emerald-700 mt-1">ACTIVE</div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#dad2c3]">
              <div className="text-[11px] text-[#556159]">Offline Queue Backlog</div>
              <div className="text-base font-bold font-mono text-[#14291f] mt-1 tabular-nums">
                {systemStatus.syncQueueCount} records
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#dad2c3]">
              <div className="text-[11px] text-[#556159]">Active Model Pipeline</div>
              <div className="text-base font-bold font-mono text-[#14291f] mt-1 truncate">
                {systemStatus.modelVersion}
              </div>
            </div>
          </div>

          {/* Sync Queue List */}
          <div className="bg-white rounded-2xl border border-[#dad2c3] overflow-hidden shadow-2xs">
            <div className="px-6 py-4 border-b border-[#e5dec9] flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#14291f]">
                  Synchronization Queue State
                </h4>
                <p className="text-xs text-[#556159]">
                  Track records written offline awaiting server replication
                </p>
              </div>

              <button
                onClick={onTriggerSync}
                disabled={isSyncing || syncQueue.length === 0}
                className="px-3 py-1.5 bg-[#1b382b] hover:bg-[#14291f] disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Process Queue</span>
              </button>
            </div>

            <div className="divide-y divide-[#ece6da]">
              {syncQueue.length === 0 ? (
                <div className="p-8 text-center text-[#556159]">
                  All records in sync with master database.
                </div>
              ) : (
                syncQueue.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between font-mono text-xs">
                    <div>
                      <span className="font-bold text-[#14291f]">{item.action}</span>
                      <span className="text-[#556159] ml-2">Batch: {item.batchId}</span>
                      <div className="text-[10px] text-neutral-400 font-sans mt-0.5">
                        Queued: {new Date(item.timestamp).toLocaleTimeString()}
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        item.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'syncing'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Feedback Dataset (Feature 11) */}
      {activeTab === 'dataset' && (
        <div className="bg-white rounded-2xl border border-[#dad2c3] p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#e5dec9]">
            <div>
              <h3 className="text-sm font-bold text-[#14291f]">
                Verified Human Feedback Training Dataset
              </h3>
              <p className="text-xs text-[#556159]">
                Pairs of original AI inference vs inspector corrections preserved for future model retraining
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#1b382b]">
              {completedReviews.length} Verified Entries
            </span>
          </div>

          <div className="divide-y divide-[#ece6da]">
            {completedReviews.map((batch) => {
              const hv = batch.humanVerification!;
              return (
                <div key={batch.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#14291f]">{batch.batchCode}</span>
                      <span className="text-[#556159]">·</span>
                      <span className="text-[11px] font-mono text-emerald-700 font-semibold">
                        {hv.status === 'MODIFIED' ? 'OVERRIDDEN BY INSPECTOR' : 'APPROVED'}
                      </span>
                    </div>
                    <p className="text-[#38433d]">
                      <strong>Inspector: </strong>
                      {hv.verifiedBy} ({hv.role}) · {new Date(hv.timestamp).toLocaleDateString()}
                    </p>
                    <p className="text-[#556159] italic">"{hv.inspectorNotes}"</p>
                  </div>

                  <div className="text-right font-mono text-xs">
                    <div>
                      Original AI: <span className="line-through text-neutral-400">{hv.originalGrade}</span>
                    </div>
                    <div className="font-bold text-[#15803d]">Verified: {hv.finalGrade}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: Audit Trail (Section 25) */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-[#dad2c3] p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#e5dec9]">
            <div>
              <h3 className="text-sm font-bold text-[#14291f]">
                System & Inspection Audit Trail Log
              </h3>
              <p className="text-xs text-[#556159]">
                Chronological record of quality reviews, lot segregations, and configuration updates
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#1b382b]">
              {storageService.getAuditLogs().length} Entries Logged
            </span>
          </div>

          <div className="divide-y divide-[#ece6da]">
            {storageService.getAuditLogs().map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4 font-mono text-[11px]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1b382b] bg-[#f0eae0] px-1.5 py-0.2 rounded text-[10px]">
                      {log.action}
                    </span>
                    <span className="text-neutral-400">·</span>
                    <span className="font-sans font-semibold text-[#14291f]">{log.actor}</span>
                    <span className="text-[10px] text-[#556159]">({log.role})</span>
                  </div>
                  <p className="font-sans text-xs text-[#38433d]">{log.details}</p>
                </div>

                <div className="text-right text-[10px] text-neutral-400 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dedicated Inspector Verification Workbench Modal */}
      {workbenchBatch && (
        <InspectorWorkbench
          batch={workbenchBatch}
          onClose={() => setWorkbenchBatch(null)}
          onSaveVerification={(verification) => {
            if (onSaveVerification) {
              onSaveVerification(workbenchBatch.id, verification);
            } else {
              storageService.recordHumanVerification(workbenchBatch.id, verification);
            }
            setWorkbenchBatch(null);
          }}
        />
      )}
    </div>
  );
};
