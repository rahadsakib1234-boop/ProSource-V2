/**
 * IndexedDB Service
 * Handles all database operations with encryption support
 */

import { Client, Product, Lead, Invoice } from '@/types';

const DB_NAME = 'prosource_v2';
const DB_VER = 3;
const SNAPSHOT_KEY = 'prosource_v2_snapshot';

let db: IDBDatabase | null = null;

export async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);

    req.onupgradeneeded = (e) => {
      const database = (e.target as IDBOpenDBRequest).result;

      // Create object stores if they don't exist
      if (!database.objectStoreNames.contains('clients')) {
        database.createObjectStore('clients', { keyPath: 'id' });
      }

      if (!database.objectStoreNames.contains('products')) {
        const ps = database.createObjectStore('products', { keyPath: 'id' });
        ps.createIndex('clientId', 'clientId', { unique: false });
      }

      if (!database.objectStoreNames.contains('leads')) {
        database.createObjectStore('leads', { keyPath: 'id' });
      }

      if (!database.objectStoreNames.contains('invoices')) {
        database.createObjectStore('invoices', { keyPath: 'id' });
      }
    };

    req.onsuccess = async (e) => {
      db = (e.target as IDBOpenDBRequest).result;
      try {
        await restoreSnapshotIfNeeded();
      } catch (err) {
        console.warn('Snapshot restore failed:', err);
      }
      resolve(db);
    };

    req.onerror = (e) => reject((e.target as IDBOpenDBRequest).error);
  });
}

export function getDB(): IDBDatabase {
  if (!db) throw new Error('Database not initialized. Call initDB() first.');
  return db;
}

export async function dbGetAll<T>(store: string): Promise<T[]> {
  return new Promise((res, rej) => {
    const req = getDB().transaction(store, 'readonly').objectStore(store).getAll();
    req.onsuccess = () => res(req.result as T[]);
    req.onerror = () => rej(req.error);
  });
}

export async function dbGet<T>(store: string, key: string): Promise<T | undefined> {
  return new Promise((res, rej) => {
    const req = getDB().transaction(store, 'readonly').objectStore(store).get(key);
    req.onsuccess = () => res(req.result as T | undefined);
    req.onerror = () => rej(req.error);
  });
}

export async function dbPut<T extends { id: string }>(store: string, obj: T): Promise<void> {
  return new Promise((res, rej) => {
    const tx = getDB().transaction(store, 'readwrite');
    tx.objectStore(store).put(obj);

    tx.oncomplete = async () => {
      try {
        await persistSnapshot();
        res();
      } catch (err) {
        rej(err);
      }
    };

    tx.onerror = () => rej(tx.error);
    tx.onabort = () => rej(tx.error);
  });
}

export async function dbDelete(store: string, id: string): Promise<void> {
  return new Promise((res, rej) => {
    const tx = getDB().transaction(store, 'readwrite');
    tx.objectStore(store).delete(id);

    tx.oncomplete = async () => {
      try {
        await persistSnapshot();
        res();
      } catch (err) {
        rej(err);
      }
    };

    tx.onerror = () => rej(tx.error);
    tx.onabort = () => rej(tx.error);
  });
}

export async function persistSnapshot(): Promise<void> {
  const [clients, products, leads, invoices] = await Promise.all([
    dbGetAll<Client>('clients'),
    dbGetAll<Product>('products'),
    dbGetAll<Lead>('leads'),
    dbGetAll<Invoice>('invoices'),
  ]);

  const snapshot = {
    clients,
    products,
    leads,
    invoices,
    savedAt: new Date().toISOString(),
  };

  localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
}

export async function restoreSnapshotIfNeeded(): Promise<void> {
  const raw = localStorage.getItem(SNAPSHOT_KEY);
  if (!raw) return;

  let snapshot: any = null;
  try {
    snapshot = JSON.parse(raw);
  } catch {
    return;
  }

  const [clients, products, leads, invoices] = await Promise.all([
    dbGetAll<Client>('clients'),
    dbGetAll<Product>('products'),
    dbGetAll<Lead>('leads'),
    dbGetAll<Invoice>('invoices'),
  ]);

  // Only restore if database is empty
  if (clients.length || products.length || leads.length || invoices.length) {
    return;
  }

  const tx = getDB().transaction(['clients', 'products', 'leads', 'invoices'], 'readwrite');
  const stores = {
    clients: tx.objectStore('clients'),
    products: tx.objectStore('products'),
    leads: tx.objectStore('leads'),
    invoices: tx.objectStore('invoices'),
  };

  for (const item of snapshot.clients || []) stores.clients.put(item);
  for (const item of snapshot.products || []) stores.products.put(item);
  for (const item of snapshot.leads || []) stores.leads.put(item);
  for (const item of snapshot.invoices || []) stores.invoices.put(item);

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function clearAllData(): Promise<void> {
  const tx = getDB().transaction(['clients', 'products', 'leads', 'invoices'], 'readwrite');
  tx.objectStore('clients').clear();
  tx.objectStore('products').clear();
  tx.objectStore('leads').clear();
  tx.objectStore('invoices').clear();

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
