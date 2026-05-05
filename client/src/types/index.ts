/**
 * ProSource CRM - Core Data Models
 * Defines TypeScript interfaces for all entities in the application
 */

export interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  company?: string;
  platform?: string;
  currency: string;
  notes?: string;
  customData?: Record<string, any>;
  createdAt: number;
}

export interface Product {
  id: string;
  clientId: string;
  name: string;
  qty: number;
  unit: string;
  cost: number;
  costCur: string;
  charge: number;
  chargeCur: string;
  status: 'pending' | 'sourced' | 'delivered' | 'cancelled';
  supplier?: string;
  link?: string;
  tracking?: string;
  shipstatus?: 'ordered' | 'processing' | 'shipped_cn' | 'in_transit' | 'arrived' | 'delivered_ship';
  note?: string;
  images?: string[];
  files?: string[];
  customData?: Record<string, any>;
  createdAt: number;
}

export interface Lead {
  id: string;
  name: string;
  contact?: string;
  product?: string;
  country?: string;
  budget?: string;
  status: 'new' | 'contacted' | 'negotiating' | 'closed' | 'lost';
  followup?: string;
  source?: string;
  notes?: string;
  convertedToClientId?: string;
  customData?: Record<string, any>;
  createdAt: number;
}

export interface Invoice {
  id: string;
  num: string;
  clientId: string;
  issueDate: string;
  dueDate: string;
  discount: number;
  tax: number;
  notes?: string;
  payStatus: 'unpaid' | 'partial' | 'paid';
  currency: string;
  subtotal: number;
  discAmt: number;
  taxAmt: number;
  total: number;
  products: InvoiceProduct[];
  createdAt: number;
  updatedAt: number;
}

export interface InvoiceProduct {
  id: string;
  name: string;
  qty: number;
  unit: string;
  price: number;
}

export interface Currency {
  code: string;
  name: string;
  flag: string;
}

export interface Settings {
  name: string;
  wa: string;
  email: string;
  currency: string;
  invPrefix: string;
  industry?: string;
  isConfigured?: boolean;
}

export interface IndustryProfile {
  id: string;
  name: string;
  description: string;
  icon: string;
  defaultModules: string[];
  terminology: {
    clients: string;
    products: string;
    leads: string;
    invoices: string;
  };
  customFields: {
    clients?: CustomFieldDefinition[];
    products?: CustomFieldDefinition[];
    leads?: CustomFieldDefinition[];
  };
}

export interface CustomFieldDefinition {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'currency';
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

export interface LicensePayload {
  product: string;
  name: string;
  email: string;
  seats: number;
  issuedAt: string;
  expiresAt?: string;
}

export interface LicenseState {
  valid: boolean;
  expired?: boolean;
  payload?: LicensePayload;
  userName?: string;
  userEmail?: string;
  expiresAt?: string;
  seats?: number;
}

export interface ExchangeRates {
  [key: string]: number;
}
