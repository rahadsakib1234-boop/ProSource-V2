/**
 * Sync Service - Manages local-to-cloud synchronization
 * Handles change detection, queuing, and conflict resolution
 */

import { openDB, DBSchema, IDBPDatabase } from "idb";

interface SyncQueueItem {
  id: string;
  operation: "create" | "update" | "delete";
  entityType: "client" | "product" | "lead" | "invoice";
  entityId: string;
  payload: Record<string, any>;
  localUpdatedAt: number;
  status: "pending" | "synced" | "failed";
  retryCount: number;
  error?: string;
  createdAt: number;
}

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTimestamp: number | null;
  pendingChanges: number;
  failedChanges: number;
  syncError?: string;
}

interface SyncDB extends DBSchema {
  syncQueue: {
    key: string;
    value: SyncQueueItem;
    indexes: {
      "by-status": "status";
      "by-entity": ["entityType", "entityId"];
      "by-created": "createdAt";
    };
  };
  syncState: {
    key: "state";
    value: SyncState;
  };
}

class SyncService {
  private db: IDBPDatabase<SyncDB> | null = null;
  private syncState: SyncState = {
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSyncTimestamp: null,
    pendingChanges: 0,
    failedChanges: 0,
  };
  private listeners: Set<(state: SyncState) => void> = new Set();
  private syncInterval: NodeJS.Timeout | null = null;

  async initialize() {
    this.db = await openDB<SyncDB>("prosource-sync", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("syncQueue")) {
          const store = db.createObjectStore("syncQueue", { keyPath: "id" });
          store.createIndex("by-status", "status");
          store.createIndex("by-entity", ["entityType", "entityId"]);
          store.createIndex("by-created", "createdAt");
        }

        if (!db.objectStoreNames.contains("syncState")) {
          db.createObjectStore("syncState");
        }
      },
    });

    // Load persisted sync state
    const savedState = await this.db.get("syncState", "state");
    if (savedState) {
      this.syncState = { ...this.syncState, ...savedState };
    }

    // Setup online/offline listeners
    window.addEventListener("online", () => this.handleOnline());
    window.addEventListener("offline", () => this.handleOffline());

    // Start periodic sync
    this.startPeriodicSync();

    // Notify listeners of initial state
    this.notifyListeners();
  }

  /**
   * Queue a change for synchronization
   */
  async queueChange(
    operation: "create" | "update" | "delete",
    entityType: "client" | "product" | "lead" | "invoice",
    entityId: string,
    payload: Record<string, any>
  ) {
    if (!this.db) throw new Error("Sync service not initialized");

    const item: SyncQueueItem = {
      id: `${entityType}-${entityId}-${Date.now()}`,
      operation,
      entityType,
      entityId,
      payload,
      localUpdatedAt: Date.now(),
      status: "pending",
      retryCount: 0,
      createdAt: Date.now(),
    };

    await this.db.add("syncQueue", item);
    await this.updatePendingCount();
    this.notifyListeners();

    // Attempt immediate sync if online
    if (this.syncState.isOnline && !this.syncState.isSyncing) {
      this.performSync();
    }
  }

  /**
   * Perform synchronization with cloud
   */
  async performSync() {
    if (!this.db || this.syncState.isSyncing) return;

    this.syncState.isSyncing = true;
    this.notifyListeners();

    try {
      // Get all pending changes
      const pendingItems = await this.db.getAllFromIndex(
        "syncQueue",
        "by-status",
        "pending"
      );

      if (pendingItems.length === 0) {
        this.syncState.isSyncing = false;
        this.notifyListeners();
        return;
      }

      // Prepare batch for upload
      const changes = pendingItems.map((item) => ({
        operation: item.operation,
        entityType: item.entityType,
        entityId: item.entityId,
        payload: item.payload,
        localUpdatedAt: item.localUpdatedAt,
      }));

      // Push changes to cloud
      const response = await fetch("/api/trpc/sync.pushChanges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ changes }),
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Update queue items based on response
      for (const resultItem of result.results) {
        const queueItem = pendingItems.find(
          (item) => item.entityId === resultItem.entityId
        );

        if (queueItem) {
          if (resultItem.status === "synced") {
            queueItem.status = "synced";
          } else if (resultItem.status === "conflict") {
            // Handle conflict: pull latest version from cloud
            await this.handleConflict(queueItem);
          } else if (resultItem.status === "failed") {
            queueItem.status = "failed";
            queueItem.error = resultItem.error;
            queueItem.retryCount++;
          }

          await this.db.put("syncQueue", queueItem);
        }
      }

      // Update last sync timestamp
      this.syncState.lastSyncTimestamp = Date.now();
      this.syncState.syncError = undefined;

      // Pull changes from cloud
      await this.pullChanges();

      await this.updatePendingCount();
    } catch (error) {
      this.syncState.syncError =
        error instanceof Error ? error.message : "Unknown sync error";
      console.error("Sync error:", error);
    } finally {
      this.syncState.isSyncing = false;
      this.notifyListeners();
    }
  }

  /**
   * Pull latest changes from cloud
   */
  private async pullChanges() {
    const response = await fetch("/api/trpc/sync.pullChanges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lastSyncTimestamp: this.syncState.lastSyncTimestamp || 0,
      }),
    });

    if (!response.ok) return;

    const result = await response.json();

    // Apply changes to local IndexedDB
    for (const change of result.changes) {
      // This would integrate with your existing CRM data store
      // For now, just log that we received the change
      console.log("Received cloud change:", change);
    }
  }

  /**
   * Handle conflict using last-write-wins strategy
   */
  private async handleConflict(queueItem: SyncQueueItem) {
    // Cloud version is newer, so we discard local change
    // In a real app, you might want to notify the user
    console.warn(
      `Conflict detected for ${queueItem.entityType} ${queueItem.entityId}. Cloud version kept.`
    );

    // Mark as synced but with conflict flag
    queueItem.status = "synced";
    queueItem.error = "Conflict: cloud version was newer";
  }

  /**
   * Get current sync status
   */
  getSyncStatus(): SyncState {
    return { ...this.syncState };
  }

  /**
   * Subscribe to sync state changes
   */
  subscribe(listener: (state: SyncState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Manually trigger sync
   */
  async manualSync() {
    if (!this.syncState.isOnline) {
      throw new Error("Cannot sync while offline");
    }
    await this.performSync();
  }

  /**
   * Get backup status and list
   */
  async getBackups() {
    const response = await fetch("/api/trpc/backup.listBackups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ limit: 10, offset: 0 }),
    });

    if (!response.ok) throw new Error("Failed to fetch backups");
    return response.json();
  }

  /**
   * Create a new backup
   */
  async createBackup() {
    const response = await fetch("/api/trpc/backup.createBackup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (!response.ok) throw new Error("Failed to create backup");
    return response.json();
  }

  /**
   * Restore from backup
   */
  async restoreBackup(backupId: string) {
    const response = await fetch("/api/trpc/backup.restoreBackup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ backupId }),
    });

    if (!response.ok) throw new Error("Failed to restore backup");
    return response.json();
  }

  // Private methods

  private handleOnline() {
    this.syncState.isOnline = true;
    this.notifyListeners();
    this.performSync();
  }

  private handleOffline() {
    this.syncState.isOnline = false;
    this.notifyListeners();
  }

  private startPeriodicSync() {
    // Sync every 30 seconds if online and not already syncing
    this.syncInterval = setInterval(() => {
      if (this.syncState.isOnline && !this.syncState.isSyncing) {
        this.performSync();
      }
    }, 30000);
  }

  private async updatePendingCount() {
    if (!this.db) return;

    const pending = await this.db.getAllFromIndex(
      "syncQueue",
      "by-status",
      "pending"
    );
    const failed = await this.db.getAllFromIndex(
      "syncQueue",
      "by-status",
      "failed"
    );

    this.syncState.pendingChanges = pending.length;
    this.syncState.failedChanges = failed.length;

    await this.db.put("syncState", "state", this.syncState);
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener({ ...this.syncState }));
  }

  async destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    if (this.db) {
      this.db.close();
    }
  }
}

// Export singleton instance
export const syncService = new SyncService();
