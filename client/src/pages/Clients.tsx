/**
 * Clients Page
 * Manage and view all clients
 */

import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Layout } from '@/components/Layout';
import { Client } from '@/types';

export default function Clients() {
  const { clients } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Client>>({
    currency: 'BDT',
  });

  const filteredClients = useMemo(() => {
    return clients.searchClients(searchQuery);
  }, [searchQuery, clients.clients]);

  const handleAddClient = async () => {
    if (!formData.name) return;
    try {
      await clients.saveClient(formData as Omit<Client, 'id' | 'createdAt'>);
      setFormData({ currency: 'BDT' });
      setShowForm(false);
    } catch (err) {
      console.error('Failed to save client:', err);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      try {
        await clients.deleteClient(id);
      } catch (err) {
        console.error('Failed to delete client:', err);
      }
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Layout onSearch={setSearchQuery}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Clients</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-accent text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
          >
            + Add Client
          </button>
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="client-card cursor-pointer"
              onClick={() => setSelectedClient(client)}
            >
              <div className="client-card-header">
                <div className="avatar">{getInitials(client.name)}</div>
                <div className="client-info">
                  <div className="client-name">{client.name}</div>
                  <div className="client-meta">
                    {client.company && <span>{client.company}</span>}
                    {client.phone && <span>{client.phone}</span>}
                  </div>
                </div>
              </div>
              {selectedClient?.id === client.id && (
                <div className="border-t border-border p-4 space-y-2">
                  {client.email && (
                    <p className="text-xs text-muted-foreground">
                      <strong>Email:</strong> {client.email}
                    </p>
                  )}
                  {client.platform && (
                    <p className="text-xs text-muted-foreground">
                      <strong>Platform:</strong> {client.platform}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    <strong>Currency:</strong> {client.currency}
                  </p>
                  {client.notes && (
                    <p className="text-xs text-muted-foreground">
                      <strong>Notes:</strong> {client.notes}
                    </p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClient(client.id);
                      }}
                      className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No clients found</p>
          </div>
        )}

        {/* Add Client Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-2xl p-6 w-full max-w-md shadow-lg">
              <h2 className="text-lg font-bold text-foreground mb-4">Add New Client</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Client Name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <input
                  type="text"
                  placeholder="Company"
                  value={formData.company || ''}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <textarea
                  placeholder="Notes"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg font-medium text-sm hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddClient}
                  className="flex-1 px-4 py-2 bg-accent text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
                >
                  Add Client
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
