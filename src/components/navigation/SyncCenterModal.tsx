import React from 'react';
import { SyncQueueItem, SystemStatus } from '../../types';
import {
  RefreshCw,
  Wifi,
  WifiOff,
  Database,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Cpu,
  Layers,
} from 'lucide-react';

interface SyncCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemStatus: SystemStatus;
  syncQueue: SyncQueueItem[];
  onTriggerSync: () => void;
  isSyncing: boolean;
}

export const SyncCenterModal: React.FC<SyncCenterModalProps> = ({
  isOpen,
  onClose,
  systemStatus,
  syncQueue,
  onTriggerSync,
  isSyncing,
}) => {
  if (!isOpen) return null;

  const pendingItems = syncQueue.filter((i) => i.status === 'pending');
  const failedItems = syncQueue.filter((i) => i.status === 'failed');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#fbf9f5] rounded-3xl border border-[#dad2c3] max-w-xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-white border-b border-[#e5dec9] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-800">
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#14291f]">
                GRADFY Offline Sync Center
              </h3>
              <p className="text-xs text-[#556159]">
                Local database synchronization queue and connection health
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-900 p-1.5 rounded-lg hover:bg-neutral-100"
          >
            ✕
          </button>
        </div>

        {/* Status Dashboard */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs">
          {/* Main Status Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-white rounded-xl border border-[#dad2c3] space-y-1">
              <span className="text-[10px] text-[#556159] uppercase font-mono block">
                Network Connection
              </span>
              <div className="flex items-center gap-1.5 font-bold font-mono text-xs">
                {systemStatus.online ? (
                  <>
                    <Wifi className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-800">ONLINE (CLOUD CONNECTED)</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-amber-600" />
                    <span className="text-amber-800">OFFLINE (LOCAL STORAGE)</span>
                  </>
                )}
              </div>
              <span className="text-[10px] text-neutral-400 block mt-1">
                Last sync: {systemStatus.lastSyncTime ? new Date(systemStatus.lastSyncTime).toLocaleTimeString() : 'Never'}
              </span>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-[#dad2c3] space-y-1">
              <span className="text-[10px] text-[#556159] uppercase font-mono block">
                Local Device Persistence
              </span>
              <div className="flex items-center gap-1.5 font-bold font-mono text-xs text-[#14291f]">
                <HardDrive className="w-4 h-4 text-[#1b382b]" />
                <span>INDEXEDDB ACTIVE</span>
              </div>
              <span className="text-[10px] text-neutral-400 block mt-1">
                Storage: ~{systemStatus.storageUsageMb} MB ({systemStatus.indexedDbRecordsCount} cached records)
              </span>
            </div>
          </div>

          {/* Sync Trigger CTA */}
          <div className="p-4 bg-white rounded-xl border border-[#dad2c3] flex items-center justify-between">
            <div>
              <span className="font-bold text-[#14291f] block">
                {pendingItems.length > 0
                  ? `${pendingItems.length} records awaiting upload`
                  : 'All local records synchronized'}
              </span>
              <span className="text-[11px] text-[#556159]">
                Pushes offline inspections, verification audits, and lot allocations to server
              </span>
            </div>

            <button
              onClick={onTriggerSync}
              disabled={isSyncing || (!systemStatus.online && pendingItems.length === 0)}
              className="px-4 py-2 bg-[#1b382b] hover:bg-[#14291f] disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-colors shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronizing...' : 'SYNC NOW'}</span>
            </button>
          </div>

          {/* Pending Queue List */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#14291f] uppercase tracking-wider text-[11px]">
              Sync Queue Inspection ({syncQueue.length} items logged)
            </h4>

            <div className="border border-[#e5dec9] rounded-xl overflow-hidden bg-white divide-y divide-[#ece6da]">
              {syncQueue.length === 0 ? (
                <div className="p-6 text-center text-[#556159]">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1 opacity-70" />
                  Queue empty. Local state matches central database.
                </div>
              ) : (
                syncQueue.slice(0, 10).map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between text-[11px] font-mono">
                    <div>
                      <span className="font-bold text-[#14291f]">{item.action}</span>
                      <span className="text-neutral-400 ml-2">Batch: {item.batchId}</span>
                      <div className="text-[10px] text-neutral-400 font-sans">
                        Queued: {new Date(item.timestamp).toLocaleTimeString()}
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'syncing'
                          ? 'bg-blue-100 text-blue-800'
                          : item.status === 'failed'
                          ? 'bg-rose-100 text-rose-800'
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
      </div>
    </div>
  );
};
