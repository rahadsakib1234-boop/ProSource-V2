import React, { useEffect, useState } from 'react';
import { alertService, type Alert } from '@/services/alertService';
import { Bell, X, Check, AlertCircle, Info } from 'lucide-react';

/**
 * Notification Panel Component
 * Displays admin alerts and notifications in a dropdown
 */
export function NotificationPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Subscribe to alert changes
    const unsubscribe = alertService.subscribe((newAlerts) => {
      setAlerts(newAlerts);
      setUnreadCount(alertService.getUnreadCount());
    });

    // Load initial alerts
    setAlerts(alertService.getAlerts());
    setUnreadCount(alertService.getUnreadCount());

    return unsubscribe;
  }, []);

  const handleMarkAsRead = (alertId: string) => {
    alertService.markAsRead(alertId);
  };

  const handleDelete = (alertId: string) => {
    alertService.deleteAlert(alertId);
  };

  const handleMarkAllAsRead = () => {
    alertService.markAllAsRead();
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'sync_failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'backup_completed':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'restore_triggered':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getAlertBgColor = (type: string) => {
    switch (type) {
      case 'sync_failed':
        return 'bg-red-50 border-red-200';
      case 'backup_completed':
        return 'bg-green-50 border-green-200';
      case 'restore_triggered':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Alerts List */}
          <div className="divide-y divide-gray-200">
            {alerts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 border-l-4 transition-colors ${
                    alert.read ? 'bg-gray-50' : 'bg-blue-50 border-l-blue-500'
                  } ${getAlertBgColor(alert.type)}`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {alert.title}
                      </h4>
                      <p className="text-gray-600 text-sm mt-1">
                        {alert.message}
                      </p>
                      <p className="text-gray-400 text-xs mt-2">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(alert.id)}
                      className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {!alert.read && (
                    <button
                      onClick={() => handleMarkAsRead(alert.id)}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
