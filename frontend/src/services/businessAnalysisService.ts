import { apiClient } from './apiClient';
import { authService } from './authService';
import { AiExplanation } from '../types';

export interface BusinessAnalysisRequest {
  productId: string;
}

// Real shape returned by POST /api/business-analysis on the FastAPI backend (see main.py).
// ai_explanation is null unless DASHSCOPE_API_KEY is configured server-side (qwen_status
// will be "not_configured" in that case) - see services/qwen_service.py.
export interface BackendBusinessAnalysisData {
  product_id: string;
  viability_score: number;
  data_confidence: 'verified' | 'curated' | 'incomplete';
  trade_assurance_status: boolean | null;
  moq_level: 'Low' | 'Medium' | 'High';
  risk_summary: string;
  qwen_status: 'available' | 'not_configured' | 'unavailable' | 'error';
  ai_explanation: AiExplanation | null;
}

export const businessAnalysisService = {
  /**
   * Calls the real backend's deterministic viability scoring engine
   * (/api/business-analysis), additively explained by Qwen when configured.
   * Requires auth. Throws on failure so callers can fall back to the local
   * calculator.ts estimate.
   */
  async getBusinessAnalysis(req: BusinessAnalysisRequest): Promise<BackendBusinessAnalysisData> {
    await authService.ensureAuthenticated();
    return apiClient.post<BackendBusinessAnalysisData>('/business-analysis', {
      product_id: req.productId,
    });
  },
};
