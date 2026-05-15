import { openDB, DBSchema, IDBPDatabase } from "idb";
import { clearAllData, dbGetAll, dbPut } from "@/services/db";
import type { Client, Invoice, Lead, Product, Settings } from "@/types";

const SETTINGS_KEY = "ps_settings";
const DEFAULT_SETTINGS: Settings = {
  name: "ProSource",
  wa: "",
  email: "",
  currency: "BDT",
  invPrefix: "INV-",
  industry: "sourcing",
  isConfigured: false,
  authEnabled: false,
};

export interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTimestamp: number | null;
  pendingChanges: number;
  failedChanges: number;
  syncError?: string;
}

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

interface BackupSnapshot {
  version: string;
  exportedAt: string;
  settings: Settings;
  clients: Client[];
  products: Product[];
  leads: Lead[];
  invoices: Invoice[];
}

interface BackupRecord {
  id: string;
  filename: string;
  size: number;
  createdAt: number;
  encrypted: boolean;
  payload: string;
}

interface SyncStateRecord {
  key: "state";
  state: SyncState;
}

interface SyncDB extends DBSchema {
  syncQueue: {
    key: string;
    value: SyncQueueItem;
    indexes: {
      "by-status": SyncQueueItem["status"];
      "by-entity": [SyncQueueItem["entityType"], string];
      "by-created": number;
    };
  };
  syncState: {
    key: "state";
    value: SyncStateRecord;
  };
  backups: {
    key: string;
    value: BackupRecord;
    indexes: {
      "by-created": number;
    };
  };
}

function getLocalSettings(): Settings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveLocalSettings(settings: Settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function downloadUrlFromText(text: string) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
  return url;
}

class SyncService {
  private db: IDBPDatabase<SyncDB> | null = null;
  private initialized = false;
  private syncState: SyncState = {
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    isSyncing: false,
    lastSyncTimestamp: null,
    pendingChanges: 0,
    failedChanges: 0,
  };
  private listeners: Set<(state: SyncState) => void> = new Set();
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private onOnline = () => this.handleOnline();
  private onOffline = () => this.handleOffline();

  async initialize() {
    if (this.initialized) return;

    this.db = await openDB<SyncDB>("prosource-sync", 2, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("syncQueue")) {
          const store = db.createObjectStore("syncQueue", { keyPath: "id" });
          store.createIndex("by-status", "status");
          store.createIndex("by-entity", ["entityType", "entityId"]);
          store.createIndex("by-created", "createdAt");
        }

        if (!db.objectStoreNames.contains("syncState")) {
          db.createObjectStore("syncState", { keyPath: "key" });
        }

        if (!db.objectStoreNames.contains("backups")) {
          const backups = db.createObjectStore("backups", { keyPath: "id" });
          backups.createIndex("by-created", "createdAt");
        }
      },
    });

    const savedState = await this.db.get("syncState", "state");
    if (savedState) {
      this.syncState = { ...this.syncState, ...savedState.state };
    }

    window.addEventListener("online", this.onOnline);
    window.addEventListener("offline", this.onOffline);
    this.startPeriodicSync();
    this.initialized = true;
    this.notifyListeners();
  }

  async queueChange(
    operation: "create" | "update" | "delete",
    entityType: "client" | "product" | "lead" | "invoice",
    entityId: string,
    payload: Record<string, any>
  ) {
    await this.ensureDb();

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

    await this.db!.put("syncQueue", item);
    await this.updatePendingCount();
    this.notifyListeners();

    if (this.syncState.isOnline && !this.syncState.isSyncing) {
      void this.performSync();
    }
  }

  async performSync() {
    await this.ensureDb();
    if (this.syncState.isSyncing) return;

    this.syncState.isSyncing = true;
    this.notifyListeners();

    try {
      const pendingItems = await this.getQueueItemsByStatus("pending");
      if (pendingItems.length > 0) {
        for (const item of pendingItems) {
          item.status = "synced";
          await this.db!.put("syncQueue", item);
        }
      }

      this.syncState.lastSyncTimestamp = Date.now();
      this.syncState.syncError = undefined;
      await this.updatePendingCount();
    } catch (error) {
      this.syncState.syncError = error instanceof Error ? error.message : "Unknown sync error";
      console.error("Sync error:", error);
    } finally {
      this.syncState.isSyncing = false;
      this.notifyListeners();
    }
  }

  async getBackups() {
    await this.ensureDb();
    const backups = await this.db!.getAllFromIndex("backups", "by-created");
    return backups
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(({ payload, ...meta }) => ({
        ...meta,
        createdAt: new Date(meta.createdAt).toISOString(),
      }));
  }

  async createBackup() {
    await this.ensureDb();
    const snapshot = await this.buildBackupSnapshot();
    const payload = JSON.stringify(snapshot, null, 2);
    const size = new Blob([payload]).size;
    const backup: BackupRecord = {
      id: crypto.randomUUID(),
      filename: `prosource-backup-${new Date().toISOString().slice(0, 10)}.json`,
      size,
      createdAt: Date.now(),
      encrypted: false,
      payload,
    };

    await this.db!.put("backups", backup);
    return { id: backup.id, filename: backup.filename, size: backup.size, createdAt: new Date(backup.createdAt).toISOString(), encrypted: backup.encrypted };
  }

  async restoreBackup(backupId: string) {
    await this.ensureDb();
    const backup = await this.db!.get("backups", backupId);
    if (!backup) {
      throw new Error("Backup not found");
    }

    const snapshot = JSON.parse(backup.payload) as BackupSnapshot;
    await clearAllData();

    for (const client of snapshot.clients ?? []) {
      await dbPut("clients", client);
    }
    for (const product of snapshot.products ?? []) {
      await dbPut("products", product);
    }
    for (const lead of snapshot.leads ?? []) {
      await dbPut("leads", lead);
    }
    for (const invoice of snapshot.invoices ?? []) {
      await dbPut("invoices", invoice);
    }

    saveLocalSettings(snapshot.settings ?? { ...DEFAULT_SETTINGS });
    this.syncState.lastSyncTimestamp = Date.now();
    await this.updatePendingCount();
    this.notifyListeners();

    return { restored: true };
  }

  async deleteBackup(backupId: string) {
    await this.ensureDb();
    await this.db!.delete("backups", backupId);
    return { deleted: true };
  }

  async downloadBackup(backupId: string) {
    await this.ensureDb();
    const backup = await this.db!.get("backups", backupId);
    if (!backup) {
      throw new Error("Backup not found");
    }

    return downloadUrlFromText(backup.payload);
  }

  getSyncStatus(): SyncState {
    return { ...this.syncState };
  }

  subscribe(listener: (state: SyncState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async manualSync() {
    if (!this.syncState.isOnline) {
      throw new Error("Cannot sync while offline");
    }
    await this.performSync();
  }

  private async buildBackupSnapshot(): Promise<BackupSnapshot> {
    const [clients, products, leads, invoices] = await Promise.all([
      dbGetAll<Client>("clients"),
      dbGetAll<Product>("products"),
      dbGetAll<Lead>("leads"),
      dbGetAll<Invoice>("invoices"),
    ]);

    return {
      version: "2.0",
      exportedAt: new Date().toISOString(),
      settings: getLocalSettings(),
      clients,
      products,
      leads,
      invoices,
    };
  }

  private async getQueueItemsByStatus(status: SyncQueueItem["status"]) {
    const tx = this.db!.transaction("syncQueue", "readonly");
    const index = tx.objectStore("syncQueue").index("by-status");
    return index.getAll(IDBKeyRange.only(status));
  }

  private async updatePendingCount() {
    await this.ensureDb();
    const pending = await this.getQueueItemsByStatus("pending");
    const failed = await this.getQueueItemsByStatus("failed");

    this.syncState.pendingChanges = pending.length;
    this.syncState.failedChanges = failed.length;
    await this.db!.put("syncState", { key: "state", state: this.syncState });
  }

  private handleOnline() {
    this.syncState.isOnline = true;
    this.notifyListeners();
    void this.performSync();
  }

  private handleOffline() {
    this.syncState.isOnline = false;
    this.notifyListeners();
  }

  private startPeriodicSync() {
    this.syncInterval = setInterval(() => {
      if (this.syncState.isOnline && !this.syncState.isSyncing) {
        void this.performSync();
      }
    }, 30000);
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener({ ...this.syncState }));
  }

  private async ensureDb() {
    if (!this.db) {
      await this.initialize();
    }
    if (!this.db) {
      throw new Error("Sync service not initialized");
    }
  }

  async destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    window.removeEventListener("online", this.onOnline);
    window.removeEventListener("offline", this.onOffline);
    this.initialized = false;
  }
}

export const syncService = new SyncService();
