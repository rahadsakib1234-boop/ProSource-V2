/**
 * Sidebar Component
 * Main navigation sidebar with menu items
 */

import { useLocation } from 'wouter';
import { useApp } from '@/contexts/AppContext';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
}

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const { clients, products, leads } = useApp();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/' },
    { id: 'clients', label: 'Clients', icon: '👥', path: '/clients', badge: clients.clients.length },
    { id: 'products', label: 'Products', icon: '📦', path: '/products', badge: products.products.length },
    { id: 'leads', label: 'Leads', icon: '🎯', path: '/leads', badge: leads.getOpenLeads().length },
    { id: 'pipeline', label: 'Pipeline', icon: '🔄', path: '/pipeline' },
    { id: 'invoices', label: 'Invoices', icon: '🧾', path: '/invoices' },
  ];

  const toolItems: NavItem[] = [
    { id: 'currency', label: 'Currency', icon: '💱', path: '/currency' },
    { id: 'export', label: 'Export', icon: '📥', path: '/export' },
    { id: 'settings', label: 'Settings', icon: '⚙️', path: '/settings' },
  ];

  const isActive = (path: string) => location === path;

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="brand">
          Pro<span>Source</span>
        </div>
        <div className="tagline">CRM v2</div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {/* Main Section */}
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

        {/* Tools Section */}
        <div className="nav-section-label mt-6">Tools</div>
        {toolItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setLocation(item.path)}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 px-3 py-3 text-xs text-sidebar-foreground/40 font-mono">
        v2.0.0
      </div>
    </div>
  );
}
