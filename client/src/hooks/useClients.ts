import { useState, useCallback, useEffect } from 'react';
import { Client } from '@/types';
import { dbGetAll, dbPut, dbDelete } from '@/services/db';
import { generateId } from '@/services/utils';

export function useClients(enabled = true) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dbGetAll<Client>('clients');
      setClients(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load clients');
      console.error('Error loading clients:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveClient = useCallback(
    async (client: Omit<Client, 'id' | 'createdAt'> & { id?: string; createdAt?: number }) => {
      try {
        const clientData: Client = {
          id: client.id || generateId(),
          createdAt: client.createdAt || Date.now(),
          ...client,
        } as Client;

        await dbPut('clients', clientData);
        await loadClients();
        return clientData;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save client');
        throw err;
      }
    },
    [loadClients]
  );

  const deleteClient = useCallback(
    async (id: string) => {
      try {
        await dbDelete('clients', id);
        await loadClients();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete client');
        throw err;
      }
    },
    [loadClients]
  );

  const getClientById = useCallback((id: string) => {
    return clients.find((c) => c.id === id);
  }, [clients]);

  const searchClients = useCallback((query: string) => {
    const q = query.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.company?.toLowerCase().includes(q) ?? false) ||
        (c.phone?.toLowerCase().includes(q) ?? false) ||
        (c.email?.toLowerCase().includes(q) ?? false)
    );
  }, [clients]);

  useEffect(() => {
    if (!enabled) return;
    loadClients();
  }, [enabled, loadClients]);

  return {
    clients,
    loading,
    error,
    loadClients,
    saveClient,
    deleteClient,
    getClientById,
    searchClients,
  };
}
