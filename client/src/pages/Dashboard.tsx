/**
 * Dashboard Page
 * Overview of key metrics and recent activity
 */

import { useApp } from '@/contexts/AppContext';
import { Layout } from '@/components/Layout';
import { StatCard } from '@/components/StatCard';
import { formatCurrency } from '@/services/currency';

export default function Dashboard() {
  const { clients, products, leads, invoices, settings } = useApp();

  const totalRevenue = invoices.getTotalRevenue();
  const paidAmount = invoices.getPaidAmount();
  const unpaidAmount = invoices.getUnpaidAmount();
  const conversionRate = leads.getConversionRate();

  const recentInvoices = invoices.invoices.slice(0, 5);
  const openLeads = leads.getOpenLeads();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon="👥"
            label="Total Clients"
            value={clients.clients.length}
            variant="accent"
          />
          <StatCard
            icon="📦"
            label="Total Products"
            value={products.products.length}
            variant="green"
          />
          <StatCard
            icon="🎯"
            label="Open Leads"
            value={openLeads.length}
            subtitle={`${conversionRate}% conversion`}
            variant="orange"
          />
          <StatCard
            icon="💰"
            label="Total Revenue"
            value={formatCurrency(totalRevenue, settings.settings.currency)}
            variant="purple"
          />
        </div>

        {/* Revenue Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-4">Paid Invoices</h3>
            <div className="text-3xl font-bold text-green-600 font-mono">
              {formatCurrency(paidAmount, settings.settings.currency)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {invoices.filterByPayStatus('paid').length} invoices
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-4">Unpaid Invoices</h3>
            <div className="text-3xl font-bold text-orange-600 font-mono">
              {formatCurrency(unpaidAmount, settings.settings.currency)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {invoices.filterByPayStatus('unpaid').length + invoices.filterByPayStatus('partial').length} invoices
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-4">Pending Products</h3>
            <div className="text-3xl font-bold text-blue-600 font-mono">
              {products.filterByStatus('pending').length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {products.filterByStatus('sourced').length} sourced
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Invoices */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Recent Invoices</h3>
            </div>
            <div className="divide-y divide-border">
              {recentInvoices.length > 0 ? (
                recentInvoices.map((inv) => (
                  <div key={inv.id} className="px-6 py-3 flex items-center justify-between hover:bg-secondary/50">
                    <div>
                      <p className="text-sm font-medium text-foreground">{inv.num}</p>
                      <p className="text-xs text-muted-foreground">{inv.issueDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        {formatCurrency(inv.total, inv.currency)}
                      </p>
                      <p className={`text-xs font-medium ${
                        inv.payStatus === 'paid' ? 'text-green-600' :
                        inv.payStatus === 'partial' ? 'text-orange-600' :
                        'text-red-600'
                      }`}>
                        {inv.payStatus.toUpperCase()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-muted-foreground text-sm">
                  No invoices yet
                </div>
              )}
            </div>
          </div>

          {/* Open Leads */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Open Leads</h3>
            </div>
            <div className="divide-y divide-border">
              {openLeads.length > 0 ? (
                openLeads.slice(0, 5).map((lead) => (
                  <div key={lead.id} className="px-6 py-3 flex items-center justify-between hover:bg-secondary/50">
                    <div>
                      <p className="text-sm font-medium text-foreground">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">{lead.product}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-blue-600">{lead.status.toUpperCase()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-muted-foreground text-sm">
                  No open leads
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
