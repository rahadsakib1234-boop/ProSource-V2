import { useApp } from '@/contexts/AppContext';
import { Layout } from '@/components/Layout';
import { StatCard } from '@/components/StatCard';
import { formatCurrency } from '@/services/currency';
import { CORE_PLATFORM_SECTIONS, getActiveIndustryBlueprint, getActiveIndustryProfile } from '@/services/templateCustomization';

function MetricRow({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/30 px-4 py-3">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold text-foreground">{value}</div>
      {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
}

export default function Reports() {
  const { clients, products, leads, invoices, settings, auth } = useApp();
  const industry = getActiveIndustryProfile(settings.settings);
  const blueprint = getActiveIndustryBlueprint(settings.settings);

  const totalRevenue = invoices.getTotalRevenue();
  const paidRevenue = invoices.getPaidAmount();
  const unpaidRevenue = invoices.getUnpaidAmount();
  const conversionRate = leads.getConversionRate();
  const openLeads = leads.getOpenLeads();
  const recentInvoices = invoices.invoices.slice(0, 5);
  const isAdmin = auth.user?.role === 'admin';

  const reportLines = [
    { label: 'Clients', value: clients.clients.length.toString(), hint: 'Active business relationships' },
    { label: 'Products', value: products.products.length.toString(), hint: 'Listings, items, or offers' },
    { label: 'Open Leads', value: openLeads.length.toString(), hint: `${conversionRate}% conversion` },
    { label: 'Revenue', value: formatCurrency(totalRevenue, settings.settings.currency), hint: `${formatCurrency(paidRevenue, settings.settings.currency)} collected / ${formatCurrency(unpaidRevenue, settings.settings.currency)} pending` },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reports</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {industry?.icon} {industry?.name || 'Industry'} analytics, workflow, and core platform reporting.
            </p>
          </div>
          <button
            onClick={() => { window.location.hash = '#/export'; }}
            className="px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium hover:bg-secondary transition-colors"
          >
            Open Export Center
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon="💰" label="Revenue" value={formatCurrency(totalRevenue, settings.settings.currency)} variant="purple" />
          <StatCard icon="✅" label="Paid Revenue" value={formatCurrency(paidRevenue, settings.settings.currency)} variant="green" />
          <StatCard icon="🧾" label="Unpaid Revenue" value={formatCurrency(unpaidRevenue, settings.settings.currency)} variant="orange" />
          <StatCard icon="🎯" label="Lead Conversion" value={`${conversionRate}%`} variant="accent" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {reportLines.map((item) => (
            <MetricRow key={item.label} {...item} />
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Core platform sections</h3>
              <p className="text-xs text-muted-foreground mt-1">These exist in every industry setup.</p>
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

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm xl:col-span-2">
            <h3 className="text-sm font-semibold text-foreground mb-4">Blueprint analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">KPIs</p>
                <div className="flex flex-wrap gap-2">
                  {blueprint.kpis.map((item) => (
                    <span key={item} className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-foreground">{item}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Reports</p>
                <div className="flex flex-wrap gap-2">
                  {blueprint.reports.map((item) => (
                    <span key={item} className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-foreground">{item}</span>
                  ))}
                </div>
              </div>
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
            <h3 className="text-sm font-semibold text-foreground mb-4">Active workflow</h3>
            <div className="space-y-3">
              <div className="rounded-xl border border-border bg-secondary/30 p-4 text-sm text-foreground">
                {blueprint.workflows[0] || 'Default CRM flow'}
              </div>
              <div className="rounded-xl border border-border bg-secondary/30 p-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Actions</p>
                <div className="flex flex-wrap gap-2">
                  {blueprint.actions.map((action) => (
                    <span key={action} className="rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground">{action}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Recent Invoices</h3>
              <span className="text-xs text-muted-foreground">{isAdmin ? 'Admin view' : 'Read-only view'}</span>
            </div>
            <div className="divide-y divide-border">
              {recentInvoices.length > 0 ? recentInvoices.map((inv) => (
                <div key={inv.id} className="px-6 py-3 flex items-center justify-between hover:bg-secondary/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">{inv.num}</p>
                    <p className="text-xs text-muted-foreground">{inv.issueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{formatCurrency(inv.total, inv.currency)}</p>
                    <p className="text-xs text-muted-foreground">{inv.payStatus.toUpperCase()}</p>
                  </div>
                </div>
              )) : (
                <div className="px-6 py-8 text-center text-sm text-muted-foreground">No invoices yet</div>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Open Leads</h3>
              <span className="text-xs text-muted-foreground">Pipeline</span>
            </div>
            <div className="divide-y divide-border">
              {openLeads.length > 0 ? openLeads.slice(0, 6).map((lead) => (
                <div key={lead.id} className="px-6 py-3 flex items-center justify-between hover:bg-secondary/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{lead.product || 'No product selected'}</p>
                  </div>
                  <p className="text-xs font-semibold text-blue-600 uppercase">{lead.status}</p>
                </div>
              )) : (
                <div className="px-6 py-8 text-center text-sm text-muted-foreground">No open leads</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
