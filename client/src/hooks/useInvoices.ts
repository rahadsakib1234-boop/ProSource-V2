import { useState, useCallback, useEffect } from 'react';
import { Invoice } from '@/types';
import { dbGetAll, dbPut, dbDelete } from '@/services/db';
import { generateId } from '@/services/utils';
import { syncService } from '@/services/syncService';

export function useInvoices(enabled = true) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dbGetAll<Invoice>('invoices');
      setInvoices(data.sort((a, b) => (b.updatedAt || b.createdAt) > (a.updatedAt || a.createdAt) ? 1 : -1));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
      console.error('Error loading invoices:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveInvoice = useCallback(
    async (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string; updatedAt?: string }) => {
      try {
        const invoiceData: Invoice = {
          id: invoice.id || generateId(),
          createdAt: invoice.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...invoice,
        } as Invoice;

        await dbPut('invoices', invoiceData);

        const operation = invoice.id ? 'update' : 'create';
        await syncService.queueChange(operation, 'invoice', invoiceData.id, invoiceData);

        await loadInvoices();
        return invoiceData;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save invoice');
        throw err;
      }
    },
    [loadInvoices]
  );

  const deleteInvoice = useCallback(
    async (id: string) => {
      try {
        await dbDelete('invoices', id);
        await syncService.queueChange('delete', 'invoice', id, {});
        await loadInvoices();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete invoice');
        throw err;
      }
    },
    [loadInvoices]
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
