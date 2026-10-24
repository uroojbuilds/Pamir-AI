import { apiClient } from './apiClient';
import { authService } from './authService';

export interface LaunchKitRequest {
  productId: string;
  quantity?: number;
}

// Real shape returned by POST /api/launch-kit on the FastAPI backend (see main.py)
export interface BackendLaunchKitData {
  product_id: string;
  product_name: string;
  supplier_name: string;
  quantity: number;
  cost_summary: {
    product_cost_pkr: number;
    shipping_cost_pkr: number;
    duty_rate_percent: number;
    duty_rate_source: string;
    customs_cost_pkr: number;
    total_landed_cost_pkr: number;
  };
  viability_score: number;
  marketing: {
    description: string;
    caption: string;
    source: 'fallback' | 'wanx';
    wanx_status: string;
  };
  import_checklist: string[];
}

/**
 * NOTE: this service has no current caller. No checklist/"launch kit" export
 * surface exists anywhere in the frontend today (CargoReportModal covers cost
 * breakdown + viability only, sourced from the payload prop, and has no
 * marketing/checklist section) - adding one would be new UI, which the
 * project rule disallows. Wired up here and ready to call once such a
 * surface exists.
 */
export const launchKitService = {
  async getLaunchKit(req: LaunchKitRequest): Promise<BackendLaunchKitData> {
    await authService.ensureAuthenticated();
    return apiClient.post<BackendLaunchKitData>('/launch-kit', {
      product_id: req.productId,
      quantity: req.quantity ?? 1,
    });
  },
};
