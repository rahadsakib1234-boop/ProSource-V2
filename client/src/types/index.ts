/**
 * ProSource CRM - Core Data Models
 * Defines TypeScript interfaces for all entities in the application
 */

export interface Client {
  id: string;
  organizationId: string;
  name: string;
  phone?: string;
  email?: string;
  company?: string;
  platform?: string;
  currency: string;
  notes?: string;
  customData?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  organizationId: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  organizationId: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  organizationId: string;
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
  createdAt: string;
  updatedAt: string;
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
  id: string;
  organizationId: string;
  name: string;
  wa: string;
  email: string;
  currency: string;
  invPrefix: string;
  industry?: string;
  isConfigured?: boolean;
  authEnabled?: boolean;
  templateCustomization?: TemplateCustomization;
  invoiceBranding?: InvoiceBranding;
  dashboardBlueprint?: string[];
  crmBlueprint?: string[];
  operationsBlueprint?: string[];
  financeBlueprint?: string[];
  reportsBlueprint?: string[];
  kpiBlueprint?: string[];
  workflowBlueprint?: string[];
  actionBlueprint?: string[];
  updatedAt: string;
}

export interface TemplateCustomization {
  stageLabels?: Partial<Record<'new' | 'contacted' | 'negotiating' | 'closed' | 'lost', string>>;
  fieldLabels?: Record<string, string>;
  moduleVisibility?: Partial<Record<string, boolean>>;
}

export interface InvoiceBranding {
  businessName?: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  footerNote?: string;
}

export interface User {
  id: string;
  organizationId: string;
  username: string;
  email?: string;
  role: 'admin' | 'employee';
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface IndustryBlueprint {
  dashboard: string[];
  crm: string[];
  operations: string[];
  finance: string[];
  reports: string[];
  kpis: string[];
  workflows: string[];
  actions: string[];
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
  navLabels?: Partial<Record<'dashboard' | 'clients' | 'products' | 'leads' | 'pipeline' | 'invoices' | 'users' | 'reports' | 'files' | 'settings', string>>;
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
