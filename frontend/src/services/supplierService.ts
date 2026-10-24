import { apiClient } from './apiClient';
import { authService } from './authService';
import { ProductItem } from '../types';
import { getSupplierProfile, SupplierProfile } from '../utils/supplierHelper';

// Real shape returned by POST /api/supplier-info on the FastAPI backend (see main.py).
// This is the ONLY data the backend actually has about a supplier - it does NOT
// have location, platform, lead time, certifications, or marketplace links (those
// fields do not exist anywhere in Pamir_AI_Backend's dataset, so the backend never
// fabricates them - see main.py's TRADE_ASSURANCE_INTEGRATION_NOTE for the same
// philosophy applied to trade assurance).
export interface BackendSupplierInfoData {
  product_id: string;
  product_name: string;
  supplier_id: string;
  supplier_name: string;
  trade_assurance: boolean | null;
  trade_assurance_integration_status: string;
  source: string;
  source_date: string;
  data_status: 'verified' | 'curated' | 'incomplete';
}

// Real shape of one entry in the array returned by POST /api/supplier-match
export interface BackendSupplierMatch {
  product_id: string;
  product_name: string;
  supplier_id: string;
  supplier_name: string;
  unit_price_pkr: number;
  moq: number;
  estimated_total_pkr: number;
  trade_assurance: boolean | null;
  trade_assurance_label: string;
  trade_assurance_integration_status: string;
  data_status: 'verified' | 'curated' | 'incomplete';
  match_score: number;
  source: string;
  source_date: string;
}

export interface SupplierMatchRequest {
  capital: number;
  category?: string;
}

export const supplierService = {
  /**
   * Fetches the real, backend-confirmed supplier fields for one product
   * (/api/supplier-info) and merges them into the UI-facing SupplierProfile
   * shape used by SupplierDossierModal. Fields the backend genuinely has
   * (trade_assurance, data_status, source, source_date) come from the
   * backend on success; presentational fields the backend does not track
   * (location, platform, certifications, marketplace links) are kept from
   * the local derivation, since inventing them server-side would violate
   * the backend's own no-fabrication policy. Falls back entirely to the
   * local profile if the backend is unreachable.
   */
  async getSupplierProfile(product: ProductItem): Promise<SupplierProfile> {
    const localProfile = getSupplierProfile(product);
    try {
      await authService.ensureAuthenticated();
      const data = await apiClient.post<BackendSupplierInfoData>('/supplier-info', {
        product_id: product.product_id,
      });
      return {
        ...localProfile,
        supplier_name: data.supplier_name,
        supplier_id: data.supplier_id,
        trade_assurance: data.trade_assurance ?? localProfile.trade_assurance,
      };
    } catch (err) {
      console.warn('[SupplierService] Backend unreachable, using local supplier profile fallback:', err);
      return localProfile;
    }
  },

  /**
   * Finds product+supplier pairs matching a budget/category (/api/supplier-match).
   * Requires auth. Throws on failure - no local equivalent exists for this
   * ranked/scored view, so callers should handle the error explicitly rather
   * than silently substituting different data.
   */
  async getSupplierMatches(req: SupplierMatchRequest): Promise<BackendSupplierMatch[]> {
    await authService.ensureAuthenticated();
    return apiClient.post<BackendSupplierMatch[]>('/supplier-match', {
      capital: req.capital,
      category: req.category ?? 'Electronics',
    });
  },
};
