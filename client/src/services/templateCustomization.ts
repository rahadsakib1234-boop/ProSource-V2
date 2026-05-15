import type { InvoiceBranding, Lead, Settings } from '@/types';
import { getIndustryProfile } from './industries';
import { getIndustryBlueprint } from './industryBlueprints';

export const CORE_PLATFORM_SECTIONS = [
  { id: 'Dashboard', label: 'Dashboard', description: 'Overview + KPIs' },
  { id: 'CRM', label: 'CRM', description: 'Leads / clients / contacts' },
  { id: 'Operations', label: 'Operations', description: 'Core business workflow' },
  { id: 'Finance', label: 'Finance', description: 'Payments / revenue' },
  { id: 'Team', label: 'Team', description: 'Staff / users' },
  { id: 'Reports', label: 'Reports', description: 'Analytics' },
  { id: 'Files', label: 'Files', description: 'Documents / media' },
  { id: 'Settings', label: 'Settings', description: 'Workspace configuration' },
] as const;

export type ModuleId = 'Dashboard' | 'Clients' | 'Products' | 'Leads' | 'Pipeline' | 'Operations' | 'Finance' | 'Reports' | 'Files' | 'Team' | 'Settings' | 'Invoices' | 'Currency' | 'Export' | 'Users' | 'Employees';

export const CORE_MODULE_IDS: ModuleId[] = ['Dashboard', 'Clients', 'Products', 'Leads', 'Pipeline', 'Operations', 'Finance', 'Reports', 'Files', 'Team', 'Settings'];

export const MODULE_OPTIONS: { id: ModuleId; label: string; description: string }[] = [
  { id: 'Dashboard', label: 'Dashboard', description: 'Overview and business metrics' },
  { id: 'Clients', label: 'CRM', description: 'Customer, contact, and partner records' },
  { id: 'Products', label: 'Products', description: 'Items, offers, or listings' },
  { id: 'Leads', label: 'Leads', description: 'Incoming opportunities' },
  { id: 'Pipeline', label: 'Pipeline', description: 'Deal and workflow tracking' },
  { id: 'Operations', label: 'Operations', description: 'Core business workflow' },
  { id: 'Finance', label: 'Finance', description: 'Payments and revenue' },
  { id: 'Reports', label: 'Reports', description: 'Analytics and business intelligence' },
  { id: 'Files', label: 'Files', description: 'Documents and media' },
  { id: 'Team', label: 'Team', description: 'Staff and users' },
  { id: 'Settings', label: 'Settings', description: 'Workspace configuration' },
  { id: 'Invoices', label: 'Invoices', description: 'Billing and payment tracking' },
  { id: 'Currency', label: 'Currency', description: 'Exchange rate tools' },
  { id: 'Export', label: 'Export', description: 'Backup and data exports' },
  { id: 'Users', label: 'Users', description: 'User access management' },
  { id: 'Employees', label: 'Employees', description: 'Employee records' },
];

export const STAGE_OPTIONS: { id: Lead['status']; label: string; hint: string }[] = [
  { id: 'new', label: 'New', hint: 'Incoming lead or inquiry' },
  { id: 'contacted', label: 'Contacted', hint: 'First reply or follow-up sent' },
  { id: 'negotiating', label: 'Negotiating', hint: 'Active deal discussion' },
  { id: 'closed', label: 'Closed', hint: 'Won or completed deal' },
  { id: 'lost', label: 'Lost', hint: 'No longer active' },
];

export const FIELD_LABEL_OPTIONS: { key: string; label: string; help: string }[] = [
  { key: 'products.supplier', label: 'Product supplier', help: 'Supplier / source label in products' },
  { key: 'products.link', label: 'Product link', help: 'Link / URL label in products' },
  { key: 'products.tracking', label: 'Tracking number', help: 'Tracking / shipment label' },
  { key: 'products.cost', label: 'Cost', help: 'Cost field label' },
  { key: 'products.charge', label: 'Charge', help: 'Sell / charge field label' },
  { key: 'leads.contact', label: 'Contact', help: 'Lead contact label' },
  { key: 'leads.product', label: 'Interested in', help: 'Lead product/service label' },
  { key: 'leads.country', label: 'Country', help: 'Target country label' },
  { key: 'leads.budget', label: 'Budget', help: 'Budget label' },
  { key: 'invoice.number', label: 'Invoice number', help: 'Invoice ID label' },
  { key: 'invoice.issueDate', label: 'Issue date', help: 'Invoice issue date label' },
  { key: 'invoice.dueDate', label: 'Due date', help: 'Invoice due date label' },
  { key: 'invoice.discount', label: 'Discount', help: 'Discount label' },
  { key: 'invoice.tax', label: 'Tax', help: 'Tax label' },
];

export function getActiveIndustryProfile(settings?: Settings) {
  return getIndustryProfile(settings?.industry || 'sourcing') || getIndustryProfile('sourcing');
}

export function getActiveIndustryBlueprint(settings?: Settings) {
  const profile = getActiveIndustryProfile(settings);
  return getIndustryBlueprint(profile?.id || settings?.industry || 'sourcing');
}

export function isModuleVisible(settings: Settings | undefined, moduleId: string): boolean {
  const visibility = settings?.templateCustomization?.moduleVisibility;
  if (!visibility) return true;
  if (visibility[moduleId] === false) return false;
  return true;
}

export function getStageLabel(settings: Settings | undefined, stageId: Lead['status'], fallback: string): string {
  return settings?.templateCustomization?.stageLabels?.[stageId] || fallback;
}

export function getFieldLabel(settings: Settings | undefined, key: string, fallback: string): string {
  return settings?.templateCustomization?.fieldLabels?.[key] || fallback;
}

export function getInvoiceBranding(settings?: Settings): InvoiceBranding {
  return settings?.invoiceBranding || {};
}

export function buildIndustryTemplateSettings(settings: Settings, industryId: string): Settings {
  const profile = getIndustryProfile(industryId) || getIndustryProfile('sourcing');
  const blueprint = getIndustryBlueprint(profile?.id || industryId || 'sourcing');
  const templateModuleIds = new Set(profile?.defaultModules || []);
  const coreModuleIds = new Set<ModuleId>(CORE_MODULE_IDS);
  const moduleVisibility = MODULE_OPTIONS.reduce<Partial<Record<ModuleId, boolean>>>((acc, mod) => {
    acc[mod.id] = coreModuleIds.has(mod.id) || templateModuleIds.has(mod.id);
    return acc;
  }, {});

  return {
    ...settings,
    industry: profile?.id || industryId || settings.industry || 'sourcing',
    templateCustomization: {
      stageLabels: {},
      fieldLabels: {},
      moduleVisibility,
    },
    dashboardBlueprint: blueprint.dashboard,
    crmBlueprint: blueprint.crm,
    operationsBlueprint: blueprint.operations,
    financeBlueprint: blueprint.finance,
    reportsBlueprint: blueprint.reports,
    kpiBlueprint: blueprint.kpis,
    workflowBlueprint: blueprint.workflows,
    actionBlueprint: blueprint.actions,
  };
}
