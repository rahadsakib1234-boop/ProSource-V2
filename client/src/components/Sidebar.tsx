/**
 * Sidebar Component
 * Main navigation sidebar with menu items
 */

import { useHashLocation } from 'wouter/use-hash-location';
import { useApp } from '@/contexts/AppContext';
import { getIndustryProfile } from '@/services/industries';
import { isModuleVisible } from '@/services/templateCustomization';
import { canAccessModule } from '@/services/accessControl';
import { SyncStatusIndicator } from './SyncStatusIndicator';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
}

export function Sidebar() {
  const [location, setLocation] = useHashLocation();
  const { clients, products, leads, settings, auth } = useApp();
  
  const industry = getIndustryProfile(settings.settings.industry || 'sourcing');
  const terms = industry?.terminology;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/' },
    { id: 'clients', label: terms?.clients || 'CRM', icon: '👥', path: '/clients', badge: clients.clients.length },
    { id: 'products', label: terms?.products || 'Products', icon: '📦', path: '/products', badge: products.products.length },
    { id: 'leads', label: terms?.leads || 'Leads', icon: '🎯', path: '/leads', badge: leads.getOpenLeads().length },
    { id: 'pipeline', label: 'Operations', icon: '🔄', path: '/pipeline' },
    { id: 'invoices', label: terms?.invoices || 'Finance', icon: '🧾', path: '/invoices' },
    { id: 'users', label: 'Team', icon: '👥', path: '/users' },
    { id: 'reports', label: 'Reports', icon: '📈', path: '/reports' },
    { id: 'files', label: 'Files', icon: '🗂️', path: '/files' },
    { id: 'settings', label: 'Settings', icon: '⚙️', path: '/settings' },
  ]
    .filter(item => isModuleVisible(settings.settings, item.id))
    .filter(item => canAccessModule(auth.user, item.id as any));

  const isActive = (path: string) => location === path;
  const workspaceType = auth.user?.accountType === 'personal' ? 'Personal workspace' : 'Company workspace';

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo flex justify-between items-center pr-4">
        <div>
          <div className="brand">
            Pro<span>Source</span>
          </div>
          <div className="tagline">{workspaceType}</div>
        </div>
        <button 
          onClick={() => auth.logout()}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-lg"
          title="Logout"
        >
          🚪
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Main</div>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setLocation(item.path)}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="nav-badge">{item.badge}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="border-t border-white/10 px-3 py-3">
        <SyncStatusIndicator />
      </div>

      <div className="border-t border-white/10 px-3 py-3 text-xs text-sidebar-foreground/40 font-mono">
        {auth.user?.role === 'admin' ? 'Admin access' : 'Employee access'}
      </div>
    </div>
  );
}
