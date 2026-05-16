import { useState, useCallback, useEffect } from 'react';
import { Invoice } from '@/types';
import { cloudDb } from '@/services/cloudDb';
import { generateId } from '@/services/utils';
import { useAuth } from './useAuth';

export function useInvoices(enabled = true) {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInvoices = useCallback(async () => {
    if (!user?.organizationId) return;
    try {
      setLoading(true);
      const data = await cloudDb.getAll<Invoice>('invoices', user.organizationId);
      setInvoices(data.sort((a, b) => (b.updatedAt || b.createdAt) > (a.updatedAt || a.createdAt) ? 1 : -1));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
      console.error('Error loading invoices:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.organizationId]);

  const saveInvoice = useCallback(
    async (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string; updatedAt?: string }) => {
      if (!user?.organizationId) throw new Error('No active organization');
      try {
        const invoiceData: Invoice = {
          id: invoice.id || generateId(),
          createdAt: invoice.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...invoice,
        } as Invoice;

        await cloudDb.put('invoices', invoiceData, user.organizationId);

        await loadInvoices();
        return invoiceData;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save invoice');
        throw err;
      }
    },
    [loadInvoices, user?.organizationId]
  );

  const deleteInvoice = useCallback(
    async (id: string) => {
      if (!user?.organizationId) throw new Error('No active organization');
      try {
        await cloudDb.delete('invoices', id, user.organizationId);
        await loadInvoices();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete invoice');
        throw err;
      }
    },
    [loadInvoices, user?.organizationId]
  );

  const getInvoiceById = useCallback(
    (id: string) => {
      return invoices.find((inv) => inv.id === id);
    },
    [invoices]
  );

  const getInvoicesByClientId = useCallback(
    (clientId: string) => {
      return invoices.filter((inv) => inv.clientId === clientId);
    },
    [invoices]
  );

  const searchInvoices = useCallback(
    (query: string) => {
      const q = query.toLowerCase();
      return invoices.filter((inv) => (inv.num || '').toLowerCase().includes(q));
    },
    [invoices]
  );

  const filterByPayStatus = useCallback(
    (payStatus: Invoice['payStatus']) => {
      return invoices.filter((inv) => inv.payStatus === payStatus);
    },
    [invoices]
  );

  const getTotalRevenue = useCallback(() => {
    return invoices.reduce((sum, inv) => sum + inv.total, 0);
  }, [invoices]);

  const getPaidAmount = useCallback(() => {
    return invoices
      .filter((inv) => inv.payStatus === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);
  }, [invoices]);

  const getUnpaidAmount = useCallback(() => {
    return invoices
      .filter((inv) => inv.payStatus !== 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);
  }, [invoices]);

  useEffect(() => {
    if (!enabled) return;
    loadInvoices();
  }, [enabled, loadInvoices]);

  return {
    invoices,
    loading,
    error,
    loadInvoices,
    saveInvoice,
    deleteInvoice,
    getInvoiceById,
    getInvoicesByClientId,
    searchInvoices,
    filterByPayStatus,
    getTotalRevenue,
    getPaidAmount,
    getUnpaidAmount,
  };
}
