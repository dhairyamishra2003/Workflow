import React from 'react';
import { X, Check, Bell, Info, AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react';
import useNotificationStore from '../../store/notificationStore';

const NOTIFICATION_ICONS = {
  info: <Info className="w-4 h-4 text-indigo-400" />,
  success: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-400" />,
  error: <AlertOctagon className="w-4 h-4 text-red-400" />,
};

const NotificationItem = ({ item, onRead }) => {
  return (
    <div
      className={`p-3.5 rounded-xl border flex gap-3 transition-all duration-300 ${
        item.read
          ? 'bg-white/[0.01] border-white/5 opacity-60'
          : 'bg-white/[0.03] border-white/10 shadow-lg shadow-primary-500/2'
      }`}
    >
      <div className="shrink-0 mt-0.5">{NOTIFICATION_ICONS[item.type] || <Info className="w-4 h-4 text-gray-400" />}</div>
      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span className="font-semibold text-xs text-gray-200 truncate">{item.title}</span>
          {!item.read && (
            <button
              onClick={() => onRead(item._id)}
              className="p-0.5 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-all shrink-0"
              title="Mark as read"
            >
              <Check className="w-3 h-3" />
            </button>
          )}
        </div>
        <p className="text-[11px] text-gray-400 leading-normal">{item.message}</p>
        <span className="text-[9px] text-gray-600 mt-0.5">{new Date(item.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

const NotificationDrawer = ({ isOpen, onClose }) => {
  const { notifications, markRead, markAllRead } = useNotificationStore();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />

      <aside className="fixed inset-y-0 right-0 w-80 bg-dark-800/90 backdrop-blur-xl border-l border-white/10 z-50 flex flex-col h-full overflow-hidden shadow-2xl animate-slide-in">
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary-400" />
            <h3 className="font-semibold text-sm text-gray-200">System Alerts</h3>
          </div>
          <div className="flex items-center gap-2">
            {notifications.some((n) => !n.read) && (
              <button
                onClick={markAllRead}
                className="text-[10px] uppercase font-bold tracking-wider text-primary-400 hover:text-primary-300 transition-all"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {notifications.length > 0 ? (
            notifications.map((item) => (
              <NotificationItem key={item._id} item={item} onRead={markRead} />
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 gap-2">
              <Bell className="w-8 h-8 text-gray-600 animate-pulse" />
              <p className="text-xs">No alerts or notifications yet.</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default NotificationDrawer;
