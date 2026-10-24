import { apiClient } from './apiClient';
import { authService } from './authService';

// Real shape of one entry in the array returned by POST /api/opportunity
export interface BackendOpportunityMatch {
  product_id: string;
  product_name: string;
  unit_price_pkr: number;
  moq: number;
  estimated_total_pkr: number;
  data_status: 'verified' | 'curated' | 'incomplete';
  source: 'local_dataset';
}

export interface OpportunityRequest {
  capital: number;
  category?: string;
}

/**
 * NOTE: this service has no current caller. Inspection of the frontend (Funnel
 * Step 2's product table) found it does full category+text browsing across the
 * whole catalog, not budget-ranked top-3 discovery - swapping it for this
 * endpoint's output would shrink the visible product list, which is a product
 * behavior change beyond "technically required for API integration." Wired up
 * here, ready to call, the same way the backend keeps accio_service.py ready
 * without forcing an integration point that doesn't exist yet.
 */
export const opportunityService = {
  async getOpportunities(req: OpportunityRequest): Promise<BackendOpportunityMatch[]> {
    await authService.ensureAuthenticated();
    return apiClient.post<BackendOpportunityMatch[]>('/opportunity', {
      capital: req.capital,
      category: req.category ?? 'Electronics',
    });
  },
};
