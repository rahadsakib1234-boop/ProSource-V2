import React, { createContext, useContext, useEffect, useState } from 'react';
import { useClients } from '@/hooks/useClients';
import { useProducts } from '@/hooks/useProducts';
import { useLeads } from '@/hooks/useLeads';
import { useInvoices } from '@/hooks/useInvoices';
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/hooks/useAuth';
import { fetchExchangeRates } from '@/services/currency';
import { syncService } from '@/services/syncService';
import { initDB } from '@/services/db';

interface AppContextType {
  dbReady: boolean;
  dbError: string | null;
  clients: ReturnType<typeof useClients>;
  products: ReturnType<typeof useProducts>;
  leads: ReturnType<typeof useLeads>;
  invoices: ReturnType<typeof useInvoices>;
  settings: ReturnType<typeof useSettings>;
  auth: ReturnType<typeof useAuth>;
  ratesReady: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [ratesReady, setRatesReady] = useState(false);

  const auth = useAuth();
  const settings = useSettings();
  const clients = useClients(dbReady && auth.isAuthenticated);
  const products = useProducts(dbReady && auth.isAuthenticated);
  const leads = useLeads(dbReady && auth.isAuthenticated);
  const invoices = useInvoices(dbReady && auth.isAuthenticated);

  useEffect(() => {
    async function initializeDB() {
      try {
        await initDB();
        syncService.initialize();
        setDbReady(true);
        setDbError(null);
      } catch (err) {
        setDbError(err instanceof Error ? err.message : 'Failed to initialize database');
        console.error('Database initialization error:', err);
      }
    }

    initializeDB();
  }, []);

  useEffect(() => {
    async function loadRates() {
      try {
        await fetchExchangeRates();
        setRatesReady(true);
      } catch (err) {
        console.error('Failed to fetch exchange rates:', err);
        setRatesReady(true);
      }
    }

    loadRates();
  }, []);

  useEffect(() => {
    if (dbReady && auth.isAuthenticated) {
      syncService.fullHydrate().then(() => {
        // Refresh handled by hooks.
      });
    }
  }, [dbReady, auth.isAuthenticated]);

  const value: AppContextType = {
    dbReady,
    dbError,
    clients,
    products,
    leads,
    invoices,
    settings,
    auth,
    ratesReady,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
