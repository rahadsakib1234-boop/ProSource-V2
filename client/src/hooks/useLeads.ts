import { useState, useCallback, useEffect } from 'react';
import { Lead } from '@/types';
import { cloudDb } from '@/services/cloudDb';
import { generateId } from '@/services/utils';
import { useAuth } from './useAuth';

export function useLeads(enabled = true) {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLeads = useCallback(async () => {
    if (!user?.organizationId) return;
    try {
      setLoading(true);
      const data = await cloudDb.getAll<Lead>('leads', user.organizationId);
      setLeads(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads');
      console.error('Error loading leads:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.organizationId]);

  const saveLead = useCallback(
    async (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string; updatedAt?: string }) => {
      if (!user?.organizationId) throw new Error('No active organization');
      try {
        const leadData: Lead = {
          id: lead.id || generateId(),
          createdAt: lead.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...lead,
        } as Lead;

        await cloudDb.put('leads', leadData, user.organizationId);

        await loadLeads();
        return leadData;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save lead');
        throw err;
      }
    },
    [loadLeads, user?.organizationId]
  );

  const deleteLead = useCallback(
    async (id: string) => {
      if (!user?.organizationId) throw new Error('No active organization');
      try {
        await cloudDb.delete('leads', id, user.organizationId);
        await loadLeads();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete lead');
        throw err;
      }
    },
    [loadLeads, user?.organizationId]
  );

  const getLeadById = useCallback(
    (id: string) => {
      return leads.find((l) => l.id === id);
    },
    [leads]
  );

  const searchLeads = useCallback(
    (query: string) => {
      const q = query.toLowerCase();
      return leads.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          (l.product?.toLowerCase().includes(q) ?? false) ||
          (l.country?.toLowerCase().includes(q) ?? false)
      );
    },
    [leads]
  );

  const filterByStatus = useCallback(
    (status: Lead['status']) => {
      return leads.filter((l) => l.status === status);
    },
    [leads]
  );

  const getOpenLeads = useCallback(() => {
    return leads.filter((l) => !['closed', 'lost'].includes(l.status));
  }, [leads]);

  const getConversionRate = useCallback(() => {
    if (leads.length === 0) return 0;
    const closed = leads.filter((l) => l.status === 'closed').length;
    return Math.round((closed / leads.length) * 100);
  }, [leads]);

  useEffect(() => {
    if (!enabled) return;
    loadLeads();
  }, [enabled, loadLeads]);

  return {
    leads,
    loading,
    error,
    loadLeads,
    saveLead,
    deleteLead,
    getLeadById,
    searchLeads,
    filterByStatus,
    getOpenLeads,
    getConversionRate,
  };
}
