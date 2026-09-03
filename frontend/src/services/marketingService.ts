import { apiClient } from './apiClient';
import { authService } from './authService';
import { MarketingCopyPayload } from '../types';

export interface MarketingRequest {
  productId: string;
  /** "english" | "urdu" | "roman_urdu" - see main.py MarketingRequest */
  language?: string;
}

// Real shape returned by POST /api/marketing on the FastAPI backend (see main.py).
// source is always "fallback" (deterministic template) unless WANX_API_KEY is
// configured server-side and wanx_service.py has a real implementation - see
// that file's header comment for why it's not implemented yet.
export interface BackendMarketingData {
  product_id: string;
  product_name: string;
  language: string;
  product_description: string;
  social_media_caption: string;
  source: 'fallback' | 'wanx';
  wanx_status: 'available' | 'not_configured' | 'unavailable' | 'error';
}

export const marketingService = {
  /**
   * Calls the real backend's marketing-copy endpoint (/api/marketing). Requires
   * auth. Throws on failure (network/offline) so callers can fall back to the
   * local wanxCopywriter.ts template.
   */
  async getMarketingCopy(req: MarketingRequest): Promise<BackendMarketingData> {
    await authService.ensureAuthenticated();
    return apiClient.post<BackendMarketingData>('/marketing', {
      product_id: req.productId,
      language: req.language ?? 'english',
    });
  },
};

/** Adapts the backend response to the UI-facing MarketingCopyPayload shape used by MultiStepSourcingFunnel. */
export function toMarketingCopyPayload(data: BackendMarketingData): MarketingCopyPayload {
  return {
    product_description: data.product_description,
    social_media_caption: data.social_media_caption,
  };
}
