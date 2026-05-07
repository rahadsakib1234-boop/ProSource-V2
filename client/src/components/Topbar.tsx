/**
 * Topbar Component
 * Top navigation bar with search and page title
 */

import { useState } from 'react';
import { useHashLocation } from 'wouter/use-hash-location';
import { useApp } from '@/contexts/AppContext';
import { getIndustryProfile } from '@/services/industries';
import { NotificationPanel } from './NotificationPanel';

interface TopbarProps {
  title?: string;
  subtitle?: string;
  onSearch?: (query: string) => void;
}

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Overview of your sourcing business' },
  '/clients': { title: 'Clients', subtitle: 'Manage client relationships' },
  '/products': { title: 'Products', subtitle: 'All products across all clients' },
  '/leads': { title: 'Leads', subtitle: 'Quote requests and potential clients' },
  '/pipeline': { title: 'Pipeline', subtitle: 'Sales pipeline view' },
  '/invoices': { title: 'Invoices', subtitle: 'Professional invoice management' },
  '/currency': { title: 'Currency', subtitle: 'Exchange rates & calculations' },
  '/export': { title: 'Export', subtitle: 'Reports & data exports' },
  '/settings': { title: 'Settings', subtitle: 'Configure your CRM' },
};

export function Topbar({ onSearch }: TopbarProps) {
  const [location] = useHashLocation();
  const { settings } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const industry = getIndustryProfile(settings.settings.industry || 'sourcing');
  const terms = industry?.terminology;

  const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
    '/': { title: 'Dashboard', subtitle: 'Overview of your sourcing business' },
    '/clients': { title: terms?.clients || 'Clients', subtitle: 'Manage client relationships' },
    '/products': { title: terms?.products || 'Products', subtitle: 'All products across all clients' },
    '/leads': { title: terms?.leads || 'Leads', subtitle: 'Quote requests and potential clients' },
    '/pipeline': { title: 'Pipeline', subtitle: 'Sales pipeline view' },
    '/invoices': { title: terms?.invoices || 'Invoices', subtitle: 'Professional invoice management' },
    '/currency': { title: 'Currency', subtitle: 'Exchange rates & calculations' },
    '/export': { title: 'Export', subtitle: 'Reports & data exports' },
    '/settings': { title: 'Settings', subtitle: 'Configure your CRM' },
  };

  const pageInfo = PAGE_TITLES[location] || { title: 'ProSource', subtitle: '' };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <div className="topbar">
      {/* Title */}
      <div className="flex-1">
        <div className="topbar-title">
          {pageInfo.title}
          {pageInfo.subtitle && <small>{pageInfo.subtitle}</small>}
        </div>
      </div>

      {/* Search */}
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

      {/* Notifications */}
      <div className="ml-4">
        <NotificationPanel />
      </div>
    </div>
  );
}
