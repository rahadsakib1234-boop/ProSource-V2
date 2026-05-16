import { useState, useCallback, useEffect } from 'react';
import { Client } from '@/types';
import { cloudDb } from '@/services/cloudDb';
import { generateId } from '@/services/utils';
import { useAuth } from './useAuth';

export function useClients(enabled = true) {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClients = useCallback(async () => {
    if (!user?.organizationId) return;
    try {
      setLoading(true);
      const data = await cloudDb.getAll<Client>('clients', user.organizationId);
      setClients(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load clients');
      console.error('Error loading clients:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.organizationId]);

  const saveClient = useCallback(
    async (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string; updatedAt?: string }) => {
      if (!user?.organizationId) throw new Error('No active organization');
      try {
        const clientData: Client = {
          id: client.id || generateId(),
          createdAt: client.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...client,
        } as Client;

        await cloudDb.put('clients', clientData, user.organizationId);

        await loadClients();
        return clientData;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save client');
        throw err;
      }
    },
    [loadClients, user?.organizationId]
  );

  const deleteClient = useCallback(
    async (id: string) => {
      if (!user?.organizationId) throw new Error('No active organization');
      try {
        await cloudDb.delete('clients', id, user.organizationId);
        await loadClients();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete client');
        throw err;
      }
    },
    [loadClients, user?.organizationId]
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
