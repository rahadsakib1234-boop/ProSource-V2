import { useState, useCallback, useEffect } from 'react';
import { Product } from '@/types';
import { dbGetAll, dbPut, dbDelete } from '@/services/db';
import { generateId } from '@/services/utils';
import { syncService } from '@/services/syncService';

export function useProducts(enabled = true) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dbGetAll<Product>('products');
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveProduct = useCallback(
    async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string; updatedAt?: string }) => {
      try {
        const productData: Product = {
          id: product.id || generateId(),
          createdAt: product.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...product,
        } as Product;

        await dbPut('products', productData);

        const operation = product.id ? 'update' : 'create';
        await syncService.queueChange(operation, 'product', productData.id, productData);

        await loadProducts();
        return productData;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save product');
        throw err;
      }
    },
    [loadProducts]
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      try {
        await dbDelete('products', id);
        await syncService.queueChange('delete', 'product', id, {});
        await loadProducts();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete product');
        throw err;
      }
    },
    [loadProducts]
  );

  const getProductsByClientId = useCallback(
    (clientId: string) => {
      return products.filter((p) => p.clientId === clientId);
    },
    [products]
  );

  const getProductById = useCallback(
    (id: string) => {
      return products.find((p) => p.id === id);
    },
    [products]
  );

  const searchProducts = useCallback(
    (query: string) => {
      const q = query.toLowerCase();
      return products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.supplier?.toLowerCase().includes(q) ?? false) ||
          (p.tracking?.toLowerCase().includes(q) ?? false)
      );
    },
    [products]
  );

  const filterByStatus = useCallback(
    (status: Product['status']) => {
      return products.filter((p) => p.status === status);
    },
    [products]
  );

  useEffect(() => {
    if (!enabled) return;
    loadProducts();
  }, [enabled, loadProducts]);

  return {
    products,
    loading,
    error,
    loadProducts,
    saveProduct,
    deleteProduct,
    getProductsByClientId,
    getProductById,
    searchProducts,
    filterByStatus,
  };
}
