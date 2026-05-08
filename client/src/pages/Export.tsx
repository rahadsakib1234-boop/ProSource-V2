/**
 * Export Page
 * Dual Excel export (client-safe vs private), JSON backup/restore, CSV exports
 * Drop-in replacement for the placeholder Export.tsx
 *
 * NOTE: Uses SheetJS (xlsx) for Excel generation.
 * Add to your project: pnpm add xlsx
 * Then this file works with zero other changes.
 */

import { useState, useRef, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Layout } from '@/components/Layout';
import { Client, Product, Lead, Invoice } from '@/types';

// ─── SheetJS dynamic import helper ───────────────────────────────────────────
// We load SheetJS lazily so it doesn't bloat startup
async function getXLSX() {
  // @ts-ignore
  const XLSX = await import('xlsx');
  return XLSX;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-GB');
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBlob(blob, filename);
}

function downloadCSV(rows: string[][], filename: string) {
  const csv = rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
}

// ─── Excel Export Functions ───────────────────────────────────────────────────

async function exportPrivateExcel(
  clients: Client[],
  products: Product[],
  leads: Lead[],
  invoices: Invoice[],
  businessName: string
) {
  const XLSX = await getXLSX();

  // Sheet 1: Products (FULL — with supplier, cost, margin)
  const productRows = products.map(p => {
    const client = clients.find(c => c.id === p.clientId);
    const margin = p.charge - p.cost;
    const marginPct = p.cost > 0 ? ((margin / p.cost) * 100).toFixed(1) : '—';
    return {
      'Product Name': p.name,
      'Client': client?.name ?? '—',
      'Qty': p.qty,
      'Unit': p.unit,
      'Cost Price': p.cost,
      'Cost Currency': p.costCur,
      'Charge Price': p.charge,
      'Charge Currency': p.chargeCur,
      'Margin': margin,
      'Margin %': marginPct,
      'Supplier': p.supplier ?? '—',        // ← CONFIDENTIAL
      'Supplier Link': p.link ?? '—',       // ← CONFIDENTIAL
      'Tracking': p.tracking ?? '—',        // ← CONFIDENTIAL
      'Status': p.status,
      'Ship Status': p.shipstatus ?? '—',
      'Notes': p.note ?? '—',
      'Created': fmtDate(p.createdAt),
    };
  });

  // Sheet 2: Clients (FULL)
  const clientRows = clients.map(c => ({
    'Name': c.name,
    'Company': c.company ?? '—',
    'Phone': c.phone ?? '—',
    'Email': c.email ?? '—',
    'Platform': c.platform ?? '—',
    'Currency': c.currency,
    'Notes': c.notes ?? '—',
    'Created': fmtDate(c.createdAt),
  }));

  // Sheet 3: Leads (FULL)
  const leadRows = leads.map(l => ({
    'Name': l.name,
    'Contact': l.contact ?? '—',
    'Product': l.product ?? '—',
    'Country': l.country ?? '—',
    'Budget': l.budget ?? '—',
    'Status': l.status,
    'Source': l.source ?? '—',
    'Follow-up': l.followup ?? '—',
    'Notes': l.notes ?? '—',
    'Created': fmtDate(l.createdAt),
  }));

  // Sheet 4: Invoices (FULL)
  const invoiceRows = invoices.map(inv => {
    const client = clients.find(c => c.id === inv.clientId);
    return {
      'Invoice #': inv.num,
      'Client': client?.name ?? '—',
      'Issue Date': inv.issueDate,
      'Due Date': inv.dueDate,
      'Subtotal': inv.subtotal,
      'Discount': inv.discAmt,
      'Tax': inv.taxAmt,
      'Total': inv.total,
      'Currency': inv.currency,
      'Status': inv.payStatus,
      'Notes': inv.notes ?? '—',
    };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(productRows), 'Products (Private)');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(clientRows), 'Clients');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(leadRows), 'Leads');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(invoiceRows), 'Invoices');

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  downloadBlob(blob, `${businessName}_PRIVATE_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

async function exportClientExcel(
  clients: Client[],
  products: Product[],
  invoices: Invoice[],
  businessName: string
) {
  const XLSX = await getXLSX();

  // Sheet 1: Products (CLIENT SAFE — NO supplier, cost, margin)
  const productRows = products.map(p => {
    const client = clients.find(c => c.id === p.clientId);
    return {
      'Product Name': p.name,
      'Client': client?.name ?? '—',
      'Qty': p.qty,
      'Unit': p.unit,
      'Price': p.charge,                    // Only charge price shown
      'Currency': p.chargeCur,
      'Status': p.status,
      'Tracking': p.tracking ?? '—',       // Tracking is OK to share
      'Notes': p.note ?? '—',
      'Date': fmtDate(p.createdAt),
    };
  });

  // Sheet 2: Invoices (CLIENT SAFE)
  const invoiceRows = invoices.map(inv => {
    const client = clients.find(c => c.id === inv.clientId);
    return {
      'Invoice #': inv.num,
      'Client': client?.name ?? '—',
      'Issue Date': inv.issueDate,
      'Due Date': inv.dueDate,
      'Total': inv.total,
      'Currency': inv.currency,
      'Status': inv.payStatus,
    };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(productRows), 'Products');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(invoiceRows), 'Invoices');

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  downloadBlob(blob, `${businessName}_Client_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// ─── Export Card Component ────────────────────────────────────────────────────

interface ExportCardProps {
  icon: string;
  title: string;
  description: string;
  badge?: { label: string; color: string };
  actions: { label: string; onClick: () => void; primary?: boolean; loading?: boolean }[];
  warning?: string;
}

function ExportCard({ icon, title, description, badge, actions, warning }: ExportCardProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground">{title}</h3>
            {badge && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: badge.color + '22', color: badge.color }}>
                {badge.label}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
          {warning && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 mt-2">
              ⚠️ {warning}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={action.onClick}
            disabled={action.loading}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              action.primary
                ? 'bg-accent text-white hover:opacity-90 disabled:opacity-60'
                : 'border border-border hover:bg-secondary disabled:opacity-60'
            }`}
          >
            {action.loading ? (
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            ) : null}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Stat Badge ───────────────────────────────────────────────────────────────

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-secondary/50 rounded-xl">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-bold text-sm" style={{ color }}>{value}</span>
    </div>
  );
}

// ─── Main Export Page ─────────────────────────────────────────────────────────

export default function Export() {
  const { clients, products, leads, invoices, settings } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState<string | null>(null);
  const [restoreMsg, setRestoreMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const businessName = settings.settings.name || 'ProSource';

  const run = useCallback(async (key: string, fn: () => Promise<void>) => {
    setLoading(key);
    try { await fn(); } catch (e) { console.error(e); alert('Export failed. Make sure xlsx is installed: pnpm add xlsx'); }
    finally { setLoading(null); }
  }, []);

  // ── Excel Exports ──

  const handlePrivateExcel = () => run('private_excel', () =>
    exportPrivateExcel(clients.clients, products.products, leads.leads, invoices.invoices, businessName)
  );

  const handleClientExcel = () => run('client_excel', () =>
    exportClientExcel(clients.clients, products.products, invoices.invoices, businessName)
  );

  // ── CSV Exports ──

  const handleProductsCSV = () => {
    const rows = [
      ['Name', 'Client', 'Qty', 'Unit', 'Cost', 'Cost Cur', 'Charge', 'Charge Cur', 'Supplier', 'Status', 'Created'],
      ...products.products.map(p => {
        const client = clients.clients.find(c => c.id === p.clientId);
        return [p.name, client?.name ?? '', String(p.qty), p.unit, String(p.cost), p.costCur, String(p.charge), p.chargeCur, p.supplier ?? '', p.status, fmtDate(p.createdAt)];
      }),
    ];
    downloadCSV(rows, `${businessName}_products_private.csv`);
  };

  const handleLeadsCSV = () => {
    const rows = [
      ['Name', 'Contact', 'Product', 'Country', 'Budget', 'Status', 'Source', 'Notes', 'Created'],
      ...leads.leads.map(l => [l.name, l.contact ?? '', l.product ?? '', l.country ?? '', l.budget ?? '', l.status, l.source ?? '', l.notes ?? '', fmtDate(l.createdAt)]),
    ];
    downloadCSV(rows, `${businessName}_leads.csv`);
  };

  const handleClientsCSV = () => {
    const rows = [
      ['Name', 'Company', 'Phone', 'Email', 'Platform', 'Currency', 'Notes', 'Created'],
      ...clients.clients.map(c => [c.name, c.company ?? '', c.phone ?? '', c.email ?? '', c.platform ?? '', c.currency, c.notes ?? '', fmtDate(c.createdAt)]),
    ];
    downloadCSV(rows, `${businessName}_clients.csv`);
  };

  // ── JSON Backup ──

  const handleBackup = () => {
    const snapshot = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      business: businessName,
      data: {
        clients: clients.clients,
        products: products.products,
        leads: leads.leads,
        invoices: invoices.invoices,
        settings: settings.settings,
      },
    };
    downloadJSON(snapshot, `${businessName}_backup_${new Date().toISOString().slice(0, 10)}.json`);
  };

  // ── JSON Restore ──

  const handleRestoreClick = () => fileInputRef.current?.click();

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRestoreMsg(null);

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      if (!json.data || !json.version) {
        setRestoreMsg({ type: 'error', text: 'Invalid backup file format.' });
        return;
      }

      const { clients: cls, products: prods, leads: lds, invoices: invs } = json.data;

      if (!Array.isArray(cls) || !Array.isArray(prods) || !Array.isArray(lds) || !Array.isArray(invs)) {
        setRestoreMsg({ type: 'error', text: 'Backup data appears corrupted.' });
        return;
      }

      const confirmed = confirm(
        `This will restore:\n• ${cls.length} clients\n• ${prods.length} products\n• ${lds.length} leads\n• ${invs.length} invoices\n\nThis will MERGE with existing data (duplicate IDs will be overwritten). Continue?`
      );

      if (!confirmed) return;

      // Restore by saving each record through existing hooks (merge/upsert)
      for (const c of cls) await clients.saveClient(c);
      for (const p of prods) await products.saveProduct(p);
      for (const l of lds) await leads.saveLead(l);
      for (const inv of invs) await invoices.saveInvoice(inv);

      setRestoreMsg({ type: 'success', text: `Restored ${cls.length} clients, ${prods.length} products, ${lds.length} leads, ${invs.length} invoices.` });
    } catch (err) {
      setRestoreMsg({ type: 'error', text: 'Failed to parse backup file. Make sure it is a valid JSON backup.' });
    }

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Data summary ──
  const totalRevenue = invoices.getTotalRevenue();
  const paidRevenue = invoices.getPaidAmount();

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Export & Backup</h1>
          <p className="text-sm text-muted-foreground mt-1">Download your data or create a full backup</p>
        </div>

        {/* Data Summary */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wider text-muted-foreground">Current Data</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <StatPill label="Clients" value={clients.clients.length} color="#6366f1" />
            <StatPill label="Products" value={products.products.length} color="#10b981" />
            <StatPill label="Leads" value={leads.leads.length} color="#f59e0b" />
            <StatPill label="Invoices" value={invoices.invoices.length} color="#8b5cf6" />
          </div>
        </div>

        {/* Section: Excel Exports */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 px-1">📊 Excel Exports</h2>
          <div className="space-y-3">

            <ExportCard
              icon="🔒"
              title="Private Full Export"
              description="Complete data including supplier names, cost prices, margins, and all confidential sourcing info. For your eyes only."
              badge={{ label: 'PRIVATE', color: '#ef4444' }}
              warning="Never share this file with clients — it contains your supplier and cost data."
              actions={[{
                label: loading === 'private_excel' ? 'Exporting...' : '⬇ Download Private Excel',
                onClick: handlePrivateExcel,
                primary: true,
                loading: loading === 'private_excel',
              }]}
            />

            <ExportCard
              icon="📤"
              title="Client-Safe Export"
              description="Clean report with only charge prices, product status, and invoice totals. Safe to share directly with clients."
              badge={{ label: 'CLIENT SAFE', color: '#10b981' }}
              actions={[{
                label: loading === 'client_excel' ? 'Exporting...' : '⬇ Download Client Excel',
                onClick: handleClientExcel,
                primary: true,
                loading: loading === 'client_excel',
              }]}
            />
          </div>
        </div>

        {/* Section: CSV Exports */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 px-1">📋 CSV Exports</h2>
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
            <p className="text-sm text-muted-foreground">Individual data tables as CSV — useful for importing into other tools.</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={handleProductsCSV} className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors">
                📦 Products CSV
              </button>
              <button onClick={handleClientsCSV} className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors">
                👥 Clients CSV
              </button>
              <button onClick={handleLeadsCSV} className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors">
                🎯 Leads CSV
              </button>
            </div>
          </div>
        </div>

        {/* Section: Backup & Restore */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 px-1">💾 Backup & Restore</h2>
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <p className="text-sm text-muted-foreground">
              Full JSON backup of all your data. Use this to transfer data between devices or restore after reinstalling.
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleBackup}
                className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                ⬇ Download Backup (.json)
              </button>
              <button
                onClick={handleRestoreClick}
                className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
              >
                ⬆ Restore from Backup
              </button>
            </div>

            {restoreMsg && (
              <div className={`text-sm px-4 py-3 rounded-xl border ${
                restoreMsg.type === 'success'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                {restoreMsg.type === 'success' ? '✅ ' : '❌ '}{restoreMsg.text}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Restoring merges data — existing records with the same ID will be overwritten. New records will be added. No data will be deleted.
            </p>
          </div>
        </div>

        {/* Hidden file input for restore */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleRestoreFile}
          className="hidden"
        />
      </div>
    </Layout>
  );
}