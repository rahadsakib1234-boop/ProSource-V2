/**
 * Invoices Page
 * Professional invoice management
 */

import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Layout } from '@/components/Layout';
import { Invoice } from '@/types';
import { formatCurrency } from '@/services/currency';

export default function Invoices() {
  const { invoices, clients, settings } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Invoice>>({
  subtotal: 0,
  discAmt: 0,
  taxAmt: 0,
  total: 0,
  payStatus: 'unpaid',
  currency: settings.settings.currency,
  products: [],
});
  const filteredInvoices = useMemo(() => {
    return invoices.searchInvoices(searchQuery);
  }, [searchQuery, invoices.invoices]);

  const handleAddInvoice = async () => {
  if (!formData.num || !formData.clientId) return;

  const subtotal = Number(formData.subtotal) || 0;
  const discAmt = Number(formData.discAmt) || 0;
  const taxAmt = Number(formData.taxAmt) || 0;
  const total = subtotal - discAmt + taxAmt;

  try {
    await invoices.saveInvoice({
      ...formData,
      subtotal,
      discAmt,
      taxAmt,
      total,
      payStatus: formData.payStatus || 'unpaid',
      currency: formData.currency || settings.settings.currency,
      products: formData.products || [],
    } as Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>);

    setFormData({
      subtotal: 0,
      discAmt: 0,
      taxAmt: 0,
      total: 0,
      payStatus: 'unpaid',
      currency: settings.settings.currency,
      products: [],
    });
    setShowForm(false);
  } catch (err) {
    console.error('Failed to save invoice:', err);
  }
};

  const handleDeleteInvoice = async (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      try {
        await invoices.deleteInvoice(id);
      } catch (err) {
        console.error('Failed to delete invoice:', err);
      }
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: Invoice['payStatus']) => {
    try {
      const invoice = invoices.getInvoiceById(id);
      if (invoice) {
        await invoices.saveInvoice({
          ...invoice,
          payStatus: newStatus,
          updatedAt: Date.now(),
        });
      }
    } catch (err) {
      console.error('Failed to update invoice status:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'badge-green';
      case 'partial':
        return 'badge-orange';
      case 'unpaid':
        return 'badge-red';
      default:
        return 'badge-gray';
    }
  };

  const getClientName = (clientId: string) => {
    return clients.getClientById(clientId)?.name || 'Unknown Client';
  };

  return (
    <Layout onSearch={setSearchQuery}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-accent text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
          >
            + Create Invoice
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Total Revenue</p>
            <p className="text-2xl font-bold text-foreground font-mono">
              {formatCurrency(invoices.getTotalRevenue(), settings.settings.currency)}
            </p>
          </div>
          <div className="bg-card border border-green-200 rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Paid</p>
            <p className="text-2xl font-bold text-green-600 font-mono">
              {formatCurrency(invoices.getPaidAmount(), settings.settings.currency)}
            </p>
          </div>
          <div className="bg-card border border-orange-200 rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Unpaid</p>
            <p className="text-2xl font-bold text-orange-600 font-mono">
              {formatCurrency(invoices.getUnpaidAmount(), settings.settings.currency)}
            </p>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-foreground">Invoice #</th>
                  <th className="px-6 py-3 text-left font-semibold text-foreground">Client</th>
                  <th className="px-6 py-3 text-left font-semibold text-foreground">Issue Date</th>
                  <th className="px-6 py-3 text-left font-semibold text-foreground">Amount</th>
                  <th className="px-6 py-3 text-left font-semibold text-foreground">Status</th>
                  <th className="px-6 py-3 text-left font-semibold text-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-secondary/50 transition-colors">
                      <td className="px-6 py-3 font-medium text-foreground">{invoice.num}</td>
                      <td className="px-6 py-3 text-muted-foreground">{getClientName(invoice.clientId)}</td>
                      <td className="px-6 py-3 text-muted-foreground text-sm">{invoice.issueDate}</td>
                      <td className="px-6 py-3 text-muted-foreground font-mono">
                        {formatCurrency(invoice.total, invoice.currency)}
                      </td>
                      <td className="px-6 py-3">
                        <select
                          value={invoice.payStatus}
                          onChange={(e) => handleUpdateStatus(invoice.id, e.target.value as any)}
                          className={`text-xs px-2 py-1 rounded border-0 focus:outline-none focus:ring-2 focus:ring-accent ${
                            invoice.payStatus === 'paid'
                              ? 'bg-green-100 text-green-700'
                              : invoice.payStatus === 'partial'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-red-100 text-red-700'
                          }`}
                        >
                          <option value="unpaid">Unpaid</option>
                          <option value="partial">Partial</option>
                          <option value="paid">Paid</option>
                        </select>
                      </td>
                      <td className="px-6 py-3">
                        <button
                          onClick={() => handleDeleteInvoice(invoice.id)}
                          className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      No invoices found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Invoice Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-2xl p-6 w-full max-w-2xl shadow-lg max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-bold text-foreground mb-4">Create New Invoice</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Invoice #</label>
                  <input
                    type="text"
                    placeholder={`${settings.settings.invPrefix}001`}
                    value={formData.num || ''}
                    onChange={(e) => setFormData({ ...formData, num: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Client</label>
                  <select
                    value={formData.clientId || ''}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">Select a client</option>
                    {clients.clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={formData.issueDate || ''}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate || ''}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
  <label className="block text-sm font-medium text-foreground mb-1">Subtotal</label>
  <input
    type="number"
    placeholder="0.00"
    value={formData.subtotal || ''}
    onChange={(e) => setFormData({ ...formData, subtotal: Number(e.target.value) || 0 })}
    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
  />
</div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Currency</label>
                  <input
                    type="text"
                    placeholder="BDT"
                    value={formData.currency || ''}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
  <label className="block text-sm font-medium text-foreground mb-1">Discount Amount</label>
  <input
    type="number"
    placeholder="0"
    value={formData.discAmt || ''}
    onChange={(e) => setFormData({ ...formData, discAmt: Number(e.target.value) || 0 })}
    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
  />
</div>

               <div>
  <label className="block text-sm font-medium text-foreground mb-1">Tax Amount</label>
  <input
    type="number"
    placeholder="0"
    value={formData.taxAmt || ''}
    onChange={(e) => setFormData({ ...formData, taxAmt: Number(e.target.value) || 0 })}
    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
  />
</div>
                <div className="col-span-2">
  <label className="block text-sm font-medium text-foreground mb-1">Total</label>
  <div className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-secondary/40">
    {formatCurrency(
      (Number(formData.subtotal) || 0) - (Number(formData.discAmt) || 0) + (Number(formData.taxAmt) || 0),
      formData.currency || settings.settings.currency
    )}
  </div>
</div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                  <select
                    value={formData.payStatus || 'unpaid'}
                    onChange={(e) => setFormData({ ...formData, payStatus: e.target.value as any })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
                  <textarea
                    placeholder="Invoice notes"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg font-medium text-sm hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddInvoice}
                  className="flex-1 px-4 py-2 bg-accent text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
                >
                  Create Invoice
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
