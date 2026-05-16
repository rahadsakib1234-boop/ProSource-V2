export type SyncState = {
  isSyncing: boolean;
  isOnline: boolean;
  pendingChanges: number;
  failedChanges: number;
  lastSyncTimestamp: string | null;
  syncError: string | null;
};

type Listener = (state: SyncState) => void;

const defaultState: SyncState = {
  isSyncing: false,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  pendingChanges: 0,
  failedChanges: 0,
  lastSyncTimestamp: null,
  syncError: null,
};

class SyncService {
  private state: SyncState = { ...defaultState };
  private listeners = new Set<Listener>();

  private emit() {
    for (const listener of this.listeners) listener({ ...this.state });
  }

  initialize() {
    this.state.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.emit();
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => this.listeners.delete(listener);
  }

  getSyncStatus() {
    return { ...this.state };
  }

  destroy() {
    this.listeners.clear();
  }

  async manualSync() {
    this.state.isSyncing = true;
    this.state.syncError = null;
    this.emit();
    await new Promise((resolve) => setTimeout(resolve, 150));
    this.state.isSyncing = false;
    this.state.lastSyncTimestamp = new Date().toISOString();
    this.emit();
  }

  async fullHydrate() {
    this.state.lastSyncTimestamp = new Date().toISOString();
    this.emit();
  }

  async createBackup() {
    const payload = JSON.stringify({ createdAt: new Date().toISOString() });
    const size = new Blob([payload]).size;
    return { id: crypto.randomUUID(), filename: `backup-${Date.now()}.json`, size };
  }

  async getBackups() {
    return [];
  }

  async restoreBackup(_backupId: string) {
    return true;
  }

  async deleteBackup(_backupId: string) {
    return true;
  }

  async downloadBackup(_backupId: string) {
    return 'data:application/json;charset=utf-8,' + encodeURIComponent('{}');
  }
}

export const syncService = new SyncService();
