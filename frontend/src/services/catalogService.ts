import { apiClient } from './apiClient';
import { ProductItem } from '../types';
import { PRODUCTS_CATALOG } from '../data/tradeData';

// Public, read-only reference endpoints on the real Pamir AI backend
// (Pamir_AI_Backend/main.py) - no auth required, same dataset every other
// endpoint (landed-cost, opportunity, rfq, ...) reads from.
export const catalogService = {
  /**
   * Fetches the complete catalog of sourced China electronics lots.
   * Automatically unwraps { success: true, data: ProductItem[] } from the backend.
   */
  async getCatalog(): Promise<ProductItem[]> {
    try {
      const products = await apiClient.get<ProductItem[]>('/catalog', { skipAuth: true });
      if (Array.isArray(products) && products.length > 0) {
        return products;
      }
      return PRODUCTS_CATALOG;
    } catch (err) {
      console.warn('[CatalogService] Backend unreachable, using local static catalog fallback:', err);
      return PRODUCTS_CATALOG;
    }
  },

  /**
   * Fetch specific product details by SKU ID.
   */
  async getProductById(productId: string): Promise<ProductItem | null> {
    try {
      const product = await apiClient.get<ProductItem>(`/catalog/${productId}`, { skipAuth: true });
      if (product) return product;
    } catch {
      // Fallback
    }
    return PRODUCTS_CATALOG.find(p => p.product_id === productId) || null;
  }
};
