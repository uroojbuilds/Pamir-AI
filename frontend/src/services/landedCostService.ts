import { apiClient } from './apiClient';
import { authService } from './authService';

export interface LandedCostRequest {
  productId: string;
  quantity: number;
  targetCurrency?: 'PKR' | 'CNY';
}

// Real shape returned by POST /api/landed-cost on the FastAPI backend (see main.py)
export interface BackendLandedCostData {
  product_id: string;
  currency_used: 'PKR' | 'CNY';
  exchange_rate: number;
  exchange_rate_status: 'verified' | 'curated' | 'estimated';
  product_cost: number;
  shipping_cost: number;
  duty_rate_percent: number;
  duty_rate_source: 'confirmed' | 'default_fallback';
  customs_cost: number;
  total_landed_cost: number;
  weight_used_kg: number;
  note: string;
}

export const landedCostService = {
  /**
   * Calls the real backend's deterministic landed-cost engine (/api/landed-cost).
   * Requires auth - authService.ensureAuthenticated() bootstraps a demo session
   * transparently, same as rfqService. Throws on failure so callers (App.tsx)
   * can fall back to the local calculator.ts estimate.
   */
  async getLandedCost(req: LandedCostRequest): Promise<BackendLandedCostData> {
    await authService.ensureAuthenticated();
    return apiClient.post<BackendLandedCostData>('/landed-cost', {
      product_id: req.productId,
      quantity: req.quantity,
      target_currency: req.targetCurrency ?? 'PKR',
    });
  },
};
