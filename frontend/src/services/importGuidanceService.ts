import { apiClient } from './apiClient';
import { authService } from './authService';

export interface ImportGuidanceRequest {
  productId: string;
}

interface GuidanceItem {
  item: string;
  data_status: string;
  note?: string;
  value?: unknown;
}

// Real shape returned by POST /api/import-guidance on the FastAPI backend (see main.py)
export interface BackendImportGuidanceData {
  product_id: string;
  product_name: string;
  category: string;
  guidance_status: string;
  before_ordering: GuidanceItem[];
  customs: {
    data_status: string;
    pct_code: string | null;
    duty_rate_percent: number | null;
    classification_note: string | null;
    source: string | null;
    source_date: string | null;
    note?: string;
  };
  documentation: GuidanceItem[];
  supplier_checks: GuidanceItem[];
  warnings: string[];
  data_sources: { topic: string; source: string; source_date: string }[];
  disclaimer: string;
}

/**
 * NOTE: this service has no current caller. TariffRulesView.tsx is a static,
 * product-agnostic PCT reference table across the whole CUSTOMS_TARIFFS
 * dataset - there is no per-product drill-down surface in the frontend today
 * to attach this endpoint's per-product guidance to without adding new UI,
 * which the project rule disallows. Wired up here and ready to call once
 * such a surface exists (e.g. a "View Import Guidance" action on a product).
 */
export const importGuidanceService = {
  async getImportGuidance(req: ImportGuidanceRequest): Promise<BackendImportGuidanceData> {
    await authService.ensureAuthenticated();
    return apiClient.post<BackendImportGuidanceData>('/import-guidance', {
      product_id: req.productId,
    });
  },
};
