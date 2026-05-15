/**
 * Dashboard Page
 * Overview of key metrics and recent activity
 */

import { useApp } from '@/contexts/AppContext';
import { Layout } from '@/components/Layout';
import { StatCard } from '@/components/StatCard';
import { formatCurrency } from '@/services/currency';
import { CORE_PLATFORM_SECTIONS, getActiveIndustryProfile, getActiveIndustryBlueprint } from '@/services/templateCustomization';

export default function Dashboard() {
  const { clients, products, leads, invoices, settings, auth } = useApp();
  const isAdmin = auth.user?.role === 'admin';
  const industry = getActiveIndustryProfile(settings.settings);
  const blueprint = getActiveIndustryBlueprint(settings.settings);

  const totalRevenue = invoices.getTotalRevenue();
  const paidAmount = invoices.getPaidAmount();
  const unpaidAmount = invoices.getUnpaidAmount();
  const conversionRate = leads.getConversionRate();

  const recentInvoices = invoices.invoices.slice(0, 5);
  const openLeads = leads.getOpenLeads();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {industry?.icon} {industry?.name || 'Industry'} template active
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card px-4 py-3 text-right">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Workflow</div>
            <div className="text-sm font-semibold text-foreground">{blueprint.workflows[0] || 'Default CRM flow'}</div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Core Platform Structure</h3>
              <p className="text-xs text-muted-foreground mt-1">
                The same workspace foundation appears in every industry.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {CORE_PLATFORM_SECTIONS.map((section) => (
              <div key={section.id} className="rounded-2xl border border-border bg-secondary/30 px-4 py-3">
                <div className="text-sm font-semibold text-foreground">{section.label}</div>
                <div className="mt-1 text-xs text-muted-foreground">{section.description}</div>
              </div>
            ))}
          </div>
        </div>

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
          {isAdmin && (
            <StatCard
              icon="💰"
              label="Total Revenue"
              value={formatCurrency(totalRevenue, settings.settings.currency)}
              variant="purple"
            />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-4">Dashboard KPIs</h3>
            <div className="flex flex-wrap gap-2">
              {blueprint.kpis.map((item) => (
                <span key={item} className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-foreground">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-4">CRM Sections</h3>
            <div className="flex flex-wrap gap-2">
              {blueprint.crm.map((item) => (
                <span key={item} className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-foreground">{item}</span>
              ))}
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-4">Automation Actions</h3>
            <div className="flex flex-wrap gap-2">
              {blueprint.actions.map((item) => (
                <span key={item} className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-foreground">{item}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-4">Operations & Finance</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Operations</p>
                <div className="flex flex-wrap gap-2">
                  {blueprint.operations.map((item) => (
                    <span key={item} className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-foreground">{item}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Finance</p>
                <div className="flex flex-wrap gap-2">
                  {blueprint.finance.map((item) => (
                    <span key={item} className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-foreground">{item}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-4">Reports & Workflow</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Reports</p>
                <div className="flex flex-wrap gap-2">
                  {blueprint.reports.map((item) => (
                    <span key={item} className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-foreground">{item}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Workflow</p>
                <div className="rounded-xl border border-border bg-secondary/30 px-4 py-3 text-sm text-foreground">
                  {blueprint.workflows[0] || 'Default CRM flow'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-6`}>
          {/* Recent Invoices */}
          {isAdmin && (
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
                        <p className="text-sm font-semibold text-foreground">{formatCurrency(inv.total, inv.currency)}</p>
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
          )}

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
