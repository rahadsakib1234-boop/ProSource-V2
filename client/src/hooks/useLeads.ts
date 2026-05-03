/**
 * useLeads Hook
 * Manages lead data and operations
 */

import { useState, useCallback, useEffect } from 'react';
import { Lead } from '@/types';
import { dbGetAll, dbPut, dbDelete } from '@/services/db';
import { generateId } from '@/services/utils';

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLeads = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dbGetAll<Lead>('leads');
      setLeads(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads');
      console.error('Error loading leads:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveLead = useCallback(
    async (lead: Omit<Lead, 'id' | 'createdAt'> & { id?: string; createdAt?: number }) => {
      try {
        const leadData: Lead = {
          id: lead.id || generateId(),
          createdAt: lead.createdAt || Date.now(),
          ...lead,
        } as Lead;

        await dbPut('leads', leadData);
        await loadLeads();
        return leadData;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save lead');
        throw err;
      }
    },
    [loadLeads]
  );

  const deleteLead = useCallback(
    async (id: string) => {
      try {
        await dbDelete('leads', id);
        await loadLeads();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete lead');
        throw err;
      }
    },
    [loadLeads]
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
    loadLeads();
  }, [loadLeads]);

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
