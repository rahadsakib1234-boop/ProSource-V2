import type { User } from '@/types';

export const APP_MODULES = [
  'dashboard',
  'clients',
  'products',
  'leads',
  'pipeline',
  'invoices',
  'users',
  'reports',
  'files',
  'settings',
  'currency',
  'export',
] as const;

export type ModuleKey = (typeof APP_MODULES)[number];

export const MODULE_LABELS: Record<ModuleKey, string> = {
  dashboard: 'Dashboard',
  clients: 'Clients',
  products: 'Products',
  leads: 'Leads',
  pipeline: 'Pipeline',
  invoices: 'Invoices',
  users: 'Team',
  reports: 'Reports',
  files: 'Files',
  settings: 'Settings',
  currency: 'Currency',
  export: 'Export',
};

export const DEFAULT_EMPLOYEE_MODULES: ModuleKey[] = [
  'dashboard',
  'clients',
  'products',
  'leads',
  'pipeline',
  'invoices',
  'reports',
];

export const DEFAULT_ADMIN_MODULES: ModuleKey[] = [...APP_MODULES];

export const PATH_TO_MODULE: Record<string, ModuleKey> = {
  '/': 'dashboard',
  '/clients': 'clients',
  '/products': 'products',
  '/leads': 'leads',
  '/pipeline': 'pipeline',
  '/invoices': 'invoices',
  '/users': 'users',
  '/employees': 'users',
  '/reports': 'reports',
  '/files': 'files',
  '/settings': 'settings',
  '/currency': 'currency',
  '/export': 'export',
};

export function getModuleForPath(path: string): ModuleKey {
  return PATH_TO_MODULE[path] ?? 'dashboard';
}

export function getAllowedModules(user: User | null | undefined): ModuleKey[] {
  if (!user) return [];
  if (user.role === 'admin') return DEFAULT_ADMIN_MODULES;
  return (user.permissions?.length ? user.permissions : DEFAULT_EMPLOYEE_MODULES) as ModuleKey[];
}

export function canAccessModule(user: User | null | undefined, moduleKey: ModuleKey): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const permissions = user.permissions?.length ? user.permissions : DEFAULT_EMPLOYEE_MODULES;
  return permissions.includes(moduleKey);
}

export function isAdminWorkspace(user: User | null | undefined): boolean {
  return user?.accountType === 'company' && user?.role === 'admin';
}
