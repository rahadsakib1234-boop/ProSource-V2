/**
 * Topbar Component
 * Top navigation bar with search and page title
 */

import { useState } from 'react';
import { LogOut, UserCircle2 } from 'lucide-react';
import { useHashLocation } from 'wouter/use-hash-location';
import { useApp } from '@/contexts/AppContext';
import { getIndustryProfile } from '@/services/industries';
import { NotificationPanel } from './NotificationPanel';

interface TopbarProps {
  title?: string;
  subtitle?: string;
  onSearch?: (query: string) => void;
}

const BASE_PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Overview of your workspace' },
  '/clients': { title: 'Clients', subtitle: 'Manage client relationships' },
  '/products': { title: 'Products', subtitle: 'All products across all clients' },
  '/leads': { title: 'Leads', subtitle: 'Quote requests and potential clients' },
  '/pipeline': { title: 'Pipeline', subtitle: 'Sales pipeline view' },
  '/invoices': { title: 'Invoices', subtitle: 'Professional invoice management' },
  '/currency': { title: 'Currency', subtitle: 'Exchange rates & calculations' },
  '/export': { title: 'Export', subtitle: 'Reports & data exports' },
  '/settings': { title: 'Settings', subtitle: 'Configure your CRM' },
  '/users': { title: 'Team', subtitle: 'Manage employees and permissions' },
};

export function Topbar({ onSearch }: TopbarProps) {
  const [location] = useHashLocation();
  const { settings, auth } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const industry = getIndustryProfile(settings.settings.industry || 'sourcing');
  const terms = industry?.terminology;
  const workspaceType = auth.user?.accountType === 'personal' ? 'Personal workspace' : 'Company workspace';

  const pageInfo = BASE_PAGE_TITLES[location] || { title: 'ProSource', subtitle: '' };
  const title = pageInfo.title === 'Clients' && terms?.clients ? terms.clients :
    pageInfo.title === 'Products' && terms?.products ? terms.products :
    pageInfo.title === 'Leads' && terms?.leads ? terms.leads :
    pageInfo.title === 'Invoices' && terms?.invoices ? terms.invoices : pageInfo.title;
  const subtitle = pageInfo.subtitle;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <div className="topbar">
      <div className="flex-1">
        <div className="topbar-title">
          {title}
          {subtitle && <small>{subtitle}</small>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground">
          <UserCircle2 className="h-4 w-4" />
          <span>{auth.user?.username || 'Signed in'} · {workspaceType}</span>
        </div>

        <button
          type="button"
          onClick={() => auth.logout()}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-medium text-foreground transition hover:bg-secondary"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>

        <div className="search-global">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearch}
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>

        <div className="ml-4">
          <NotificationPanel />
        </div>
      </div>
    </div>
  );
}
