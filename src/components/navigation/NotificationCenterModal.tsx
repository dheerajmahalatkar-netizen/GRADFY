import React from 'react';
import { AppNotification } from '../../types';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  RefreshCw,
  CheckCheck,
  Trash2,
} from 'lucide-react';

interface NotificationCenterModalProps {
  notifications: AppNotification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onNavigateToBatch?: (batchId: string) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkRead,
  onMarkAllRead,
  onClearAll,
  onNavigateToBatch,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'low_confidence':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'verification_completed':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case 'sync_completed':
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
      case 'report_generated':
        return <FileText className="w-4 h-4 text-[#c85a32]" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-[#1b382b]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40 backdrop-blur-xs p-3 sm:p-6">
      <div className="bg-white rounded-2xl border border-[#dad2c3] max-w-md w-full overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in slide-in-from-top-4">
        {/* Header */}
        <div className="p-4 border-b border-[#e5dec9] flex items-center justify-between bg-[#fbf9f5]">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#14291f]" />
            <h3 className="text-sm font-bold text-[#14291f]">Notification Center</h3>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 bg-[#c85a32] text-white rounded text-[10px] font-mono font-bold">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-[11px] font-medium text-[#1b382b] hover:underline flex items-center gap-1"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-900 text-xs px-2 py-1 rounded"
            >
              ✕
            </button>
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto divide-y divide-[#ece6da]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#556159]">
              No notifications yet. Activity will appear here.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  onMarkRead(n.id);
                  if (n.batchId) {
                    onNavigateToBatch?.(n.batchId);
                    onClose();
                  }
                }}
                className={`p-4 transition-colors cursor-pointer flex items-start gap-3 text-xs ${
                  n.read ? 'bg-white hover:bg-[#fbf9f5]' : 'bg-emerald-50/40 hover:bg-emerald-50/70'
                }`}
              >
                <div className="p-2 rounded-lg bg-white border border-[#dad2c3] shrink-0 mt-0.5 shadow-2xs">
                  {getIcon(n.type)}
                </div>

                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#14291f]">{n.title}</span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {new Date(n.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#4b554e] leading-snug">{n.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 bg-[#f5f0e8] border-t border-[#dad2c3] flex items-center justify-between text-[11px]">
            <span className="text-[#556159]">Persistent offline notification storage</span>
            <button
              onClick={onClearAll}
              className="text-neutral-500 hover:text-rose-700 flex items-center gap-1 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
