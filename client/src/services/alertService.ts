/**
 * Alert Service - Manages admin notifications and alerts
 */

export type AlertType = 'sync_failed' | 'backup_completed' | 'restore_triggered' | 'info' | 'warning' | 'error';

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
}

class AlertService {
  private alerts: Alert[] = [];
  private listeners: Set<(alerts: Alert[]) => void> = new Set();
  private storageKey = 'prosource-alerts';

  constructor() {
    this.loadAlerts();
  }

  /**
   * Add a new alert
   */
  addAlert(type: AlertType, title: string, message: string, actionUrl?: string) {
    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random()}`,
      type,
      title,
      message,
      timestamp: Date.now(),
      read: false,
      actionUrl,
    };

    this.alerts.unshift(alert); // Add to beginning
    this.saveAlerts();
    this.notifyListeners();

    // Auto-remove old alerts after 7 days
    this.cleanOldAlerts();

    return alert;
  }

  /**
   * Mark alert as read
   */
  markAsRead(alertId: string) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.read = true;
      this.saveAlerts();
      this.notifyListeners();
    }
  }

  /**
   * Mark all alerts as read
   */
  markAllAsRead() {
    this.alerts.forEach(a => a.read = true);
    this.saveAlerts();
    this.notifyListeners();
  }

  /**
   * Delete an alert
   */
  deleteAlert(alertId: string) {
    this.alerts = this.alerts.filter(a => a.id !== alertId);
    this.saveAlerts();
    this.notifyListeners();
  }

  /**
   * Get all alerts
   */
  getAlerts(): Alert[] {
    return [...this.alerts];
  }

  /**
   * Get unread alert count
   */
  getUnreadCount(): number {
    return this.alerts.filter(a => !a.read).length;
  }

  /**
   * Get alerts by type
   */
  getAlertsByType(type: AlertType): Alert[] {
    return this.alerts.filter(a => a.type === type);
  }

  /**
   * Subscribe to alert changes
   */
  subscribe(listener: (alerts: Alert[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Sync failure alert
   */
  alertSyncFailed(error: string) {
    return this.addAlert(
      'sync_failed',
      '⚠️ Sync Failed',
      `Cloud synchronization failed: ${error}`,
      '/settings'
    );
  }

  /**
   * Backup completed alert
   */
  alertBackupCompleted(filename: string, size: number) {
    return this.addAlert(
      'backup_completed',
      '✓ Backup Complete',
      `Backup created successfully: ${filename} (${(size / 1024 / 1024).toFixed(2)} MB)`,
      '/settings'
    );
  }

  /**
   * Restore triggered alert
   */
  alertRestoreTriggered(filename: string) {
    return this.addAlert(
      'restore_triggered',
      '🔄 Restore Started',
      `Restoring from backup: ${filename}. This may take a few minutes.`,
      '/settings'
    );
  }

  // Private methods

  private saveAlerts() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.alerts));
    } catch (error) {
      console.error('Failed to save alerts:', error);
    }
  }

  private loadAlerts() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.alerts = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load alerts:', error);
      this.alerts = [];
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.alerts]));
  }

  private cleanOldAlerts() {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    this.alerts = this.alerts.filter(a => a.timestamp > sevenDaysAgo);
    this.saveAlerts();
  }
}

export const alertService = new AlertService();
