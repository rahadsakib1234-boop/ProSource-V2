/**
 * Products Page
 * Manage and view all products across all clients
 */

import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Layout } from '@/components/Layout';
import { Product } from '@/types';

export default function Products() {
  const { products, clients } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    status: 'pending',
  });

  const filteredProducts = useMemo(() => {
    return products.searchProducts(searchQuery);
  }, [searchQuery, products.products]);

  const getClientName = (clientId: string) => {
    return clients.getClientById(clientId)?.name || 'Unknown Client';
  };

  const handleAddProduct = async () => {
    if (!formData.clientId || !formData.name) return;
    try {
      await products.saveProduct(formData as Omit<Product, 'id' | 'createdAt'>);
      setFormData({ status: 'pending' });
      setShowForm(false);
    } catch (err) {
      console.error('Failed to save product:', err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await products.deleteProduct(id);
      } catch (err) {
        console.error('Failed to delete product:', err);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'badge-orange';
      case 'sourced':
        return 'badge-green';
      case 'delivered':
        return 'badge-blue';
      case 'cancelled':
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
            <h1 className="text-2xl font-bold text-foreground">Products</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-accent text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
          >
            + Add Product
          </button>
        </div>

        {/* Products Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-foreground">Product</th>
                  <th className="px-6 py-3 text-left font-semibold text-foreground">Client</th>
                  <th className="px-6 py-3 text-left font-semibold text-foreground">Qty</th>
                  <th className="px-6 py-3 text-left font-semibold text-foreground">Cost</th>
                  <th className="px-6 py-3 text-left font-semibold text-foreground">Charge</th>
                  <th className="px-6 py-3 text-left font-semibold text-foreground">Status</th>
                  <th className="px-6 py-3 text-left font-semibold text-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-secondary/50 transition-colors">
                      <td className="px-6 py-3 font-medium text-foreground">{product.name}</td>
                      <td className="px-6 py-3 text-muted-foreground">{getClientName(product.clientId)}</td>
                      <td className="px-6 py-3 text-muted-foreground">
                        {product.qty} {product.unit}
                      </td>
                      <td className="px-6 py-3 text-muted-foreground font-mono">
                        {product.cost} {product.costCur}
                      </td>
                      <td className="px-6 py-3 text-muted-foreground font-mono">
                        {product.charge} {product.chargeCur}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`badge ${getStatusColor(product.status)}`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Product Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-2xl p-6 w-full max-w-2xl shadow-lg max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-bold text-foreground mb-4">Add New Product</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
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

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">Product Name</label>
                  <input
                    type="text"
                    placeholder="Product name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Quantity</label>
                  <input
                    type="number"
                    placeholder="Qty"
                    value={formData.qty || ''}
                    onChange={(e) => setFormData({ ...formData, qty: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Unit</label>
                  <input
                    type="text"
                    placeholder="Unit (pcs, kg, etc)"
                    value={formData.unit || ''}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Cost</label>
                  <input
                    type="number"
                    placeholder="Cost"
                    value={formData.cost || ''}
                    onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Cost Currency</label>
                  <input
                    type="text"
                    placeholder="USD"
                    value={formData.costCur || ''}
                    onChange={(e) => setFormData({ ...formData, costCur: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Charge</label>
                  <input
                    type="number"
                    placeholder="Charge"
                    value={formData.charge || ''}
                    onChange={(e) => setFormData({ ...formData, charge: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Charge Currency</label>
                  <input
                    type="text"
                    placeholder="BDT"
                    value={formData.chargeCur || ''}
                    onChange={(e) => setFormData({ ...formData, chargeCur: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                  <select
                    value={formData.status || 'pending'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="pending">Pending</option>
                    <option value="sourced">Sourced</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
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
                  onClick={handleAddProduct}
                  className="flex-1 px-4 py-2 bg-accent text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
                >
                  Add Product
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
