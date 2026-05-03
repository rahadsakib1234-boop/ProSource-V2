/**
 * Leads Page
 * Manage quote requests and potential clients
 */

import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Layout } from '@/components/Layout';
import { Lead } from '@/types';

export default function Leads() {
  const { leads } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Lead>>({
    status: 'new',
  });

  const filteredLeads = useMemo(() => {
    return leads.searchLeads(searchQuery);
  }, [searchQuery, leads.leads]);

  const handleAddLead = async () => {
    if (!formData.name) return;
    try {
      await leads.saveLead(formData as Omit<Lead, 'id' | 'createdAt'>);
      setFormData({ status: 'new' });
      setShowForm(false);
    } catch (err) {
      console.error('Failed to save lead:', err);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      try {
        await leads.deleteLead(id);
      } catch (err) {
        console.error('Failed to delete lead:', err);
      }
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: Lead['status']) => {
    try {
      const lead = leads.getLeadById(id);
      if (lead) {
        await leads.saveLead({ ...lead, status: newStatus });
      }
    } catch (err) {
      console.error('Failed to update lead status:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'badge-blue';
      case 'contacted':
        return 'badge-orange';
      case 'negotiating':
        return 'badge-purple';
      case 'closed':
        return 'badge-green';
      case 'lost':
        return 'badge-red';
      default:
        return 'badge-gray';
    }
  };

  return (
    <Layout onSearch={setSearchQuery}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Leads</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-accent text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
          >
            + Add Lead
          </button>
        </div>

        {/* Leads Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.map((lead) => (
            <div
              key={lead.id}
              className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{lead.name}</h3>
                  {lead.contact && <p className="text-xs text-muted-foreground mt-1">{lead.contact}</p>}
                </div>
                <span className={`badge ${getStatusColor(lead.status)}`}>{lead.status}</span>
              </div>

              {lead.product && (
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Product:</strong> {lead.product}
                </p>
              )}

              {lead.country && (
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Country:</strong> {lead.country}
                </p>
              )}

              {lead.budget && (
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Budget:</strong> {lead.budget}
                </p>
              )}

              {lead.notes && (
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {lead.notes}
                </p>
              )}

              <div className="flex gap-2 pt-3 border-t border-border">
                <select
                  value={lead.status}
                  onChange={(e) => handleUpdateStatus(lead.id, e.target.value as Lead['status'])}
                  className="flex-1 px-2 py-1 text-xs border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="negotiating">Negotiating</option>
                  <option value="closed">Closed</option>
                  <option value="lost">Lost</option>
                </select>
                <button
                  onClick={() => handleDeleteLead(lead.id)}
                  className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredLeads.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No leads found</p>
          </div>
        )}

        {/* Add Lead Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-2xl p-6 w-full max-w-md shadow-lg max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-bold text-foreground mb-4">Add New Lead</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Lead Name</label>
                  <input
                    type="text"
                    placeholder="Lead name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Contact</label>
                  <input
                    type="text"
                    placeholder="Email or phone"
                    value={formData.contact || ''}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Product</label>
                  <input
                    type="text"
                    placeholder="Product name"
                    value={formData.product || ''}
                    onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Country</label>
                  <input
                    type="text"
                    placeholder="Country"
                    value={formData.country || ''}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Budget</label>
                  <input
                    type="text"
                    placeholder="Budget range"
                    value={formData.budget || ''}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                  <select
                    value={formData.status || 'new'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="negotiating">Negotiating</option>
                    <option value="closed">Closed</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
                  <textarea
                    placeholder="Additional notes"
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
                  onClick={handleAddLead}
                  className="flex-1 px-4 py-2 bg-accent text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
                >
                  Add Lead
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
