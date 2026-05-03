/**
 * useProducts Hook
 * Manages product data and operations
 */

import { useState, useCallback, useEffect } from 'react';
import { Product } from '@/types';
import { dbGetAll, dbPut, dbDelete } from '@/services/db';
import { generateId } from '@/services/utils';

export function useProducts() {
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
    async (product: Omit<Product, 'id' | 'createdAt'> & { id?: string; createdAt?: number }) => {
      try {
        const productData: Product = {
          id: product.id || generateId(),
          createdAt: product.createdAt || Date.now(),
          ...product,
        } as Product;

        await dbPut('products', productData);
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
    loadProducts();
  }, [loadProducts]);

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
