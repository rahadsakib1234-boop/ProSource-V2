/**
 * AppContext
 * Global application state and data management
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useClients } from '@/hooks/useClients';
import { useProducts } from '@/hooks/useProducts';
import { useLeads } from '@/hooks/useLeads';
import { useInvoices } from '@/hooks/useInvoices';
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/hooks/useAuth';
import { initDB } from '@/services/db';
import { fetchExchangeRates } from '@/services/currency';

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

  const clients = useClients(dbReady);
  const products = useProducts(dbReady);
  const leads = useLeads(dbReady);
  const invoices = useInvoices(dbReady);
  const settings = useSettings();
  const auth = useAuth();

  useEffect(() => {
    async function initializeDB() {
      try {
        await initDB();
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
