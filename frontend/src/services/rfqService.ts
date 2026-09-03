import { apiClient } from './apiClient';
import { authService } from './authService';

// UI-facing shape (unchanged, so components using rfqService don't need to change)
export interface RfqDraftRequest {
  productId: string;
  productName: string;
  supplierName: string;
  quantity: number;
  targetPriceUsd?: number;
  incoterm: 'FOB' | 'EXW' | 'CIF';
  destinationPort: string;
  customNotes?: string;
}

export interface RfqDraftResponse {
  rfqId: string;
  generatedText: string;
  timestamp: string;
  /** Full raw payload from the backend, for callers that want more than the text draft. */
  raw?: BackendRfqData;
}

// Real shape returned by POST /api/rfq on the FastAPI backend (see main.py)
interface BackendRfqData {
  rfq_id: string;
  product_id: string;
  product_name: string;
  category: string;
  specifications: { moq: number | string; weight_kg: number | string; note: string };
  supplier_id: string;
  supplier_name: string;
  trade_assurance: boolean | null;
  trade_assurance_label: string;
  requested_quantity: number;
  moq: number | null;
  meets_moq: boolean;
  moq_note: string | null;
  reference_unit_price_usd: number | null;
  price_source: string;
  target_price_usd: number | null;
  estimated_reference_total_usd: number | null;
  shipping_destination: string;
  data_status: string;
  source: string;
  source_date: string;
  supplier_questions: string[];
  note: string;
}

function buildProformaText(data: BackendRfqData, customNotes?: string): string {
  const lines = [
    `REQUEST FOR QUOTATION — ${data.rfq_id}`,
    `Product: ${data.product_name} (${data.product_id}, ${data.category})`,
    `Supplier: ${data.supplier_name} (${data.supplier_id})`,
    `${data.trade_assurance_label}`,
    '',
    `Requested quantity: ${data.requested_quantity}${data.meets_moq ? '' : '  \u26a0 below stated MOQ'}`,
    data.moq_note ? data.moq_note : `Supplier MOQ: ${data.moq ?? 'unknown'}`,
    data.reference_unit_price_usd !== null
      ? `Reference unit price: $${data.reference_unit_price_usd} (${data.price_source}) — est. total $${data.estimated_reference_total_usd}`
      : `Reference unit price: unavailable — requesting quotation from supplier.`,
    data.target_price_usd !== null ? `Target price: $${data.target_price_usd}` : '',
    `Shipping destination: ${data.shipping_destination}`,
    '',
    'Questions for supplier:',
    ...data.supplier_questions.map((q, i) => `  ${i + 1}. ${q}`),
    customNotes ? `\nBuyer notes: ${customNotes}` : '',
    '',
    `Source: ${data.source} (${data.source_date})`,
    data.note,
  ];
  return lines.filter(Boolean).join('\n');
}

export const rfqService = {
  /**
   * Generates an RFQ against the real backend (/api/rfq), which requires an
   * authenticated request. authService.ensureAuthenticated() transparently
   * logs in (or signs up on first run) a demo session before calling.
   */
  async generateRfq(payload: RfqDraftRequest): Promise<RfqDraftResponse> {
    try {
      await authService.ensureAuthenticated();
      const data = await apiClient.post<BackendRfqData>('/rfq', {
        product_id: payload.productId,
        quantity: payload.quantity,
        shipping_destination: payload.destinationPort,
        target_price_usd: payload.targetPriceUsd ?? null,
      });
      return {
        rfqId: data.rfq_id,
        generatedText: buildProformaText(data, payload.customNotes),
        timestamp: new Date().toISOString(),
        raw: data,
      };
    } catch (err) {
      console.warn('[RfqService] Backend unreachable, using local draft fallback:', err);
      const rfqId = `RFQ-${Date.now().toString(36).toUpperCase()}`;
      return {
        rfqId,
        generatedText: `[OFFLINE DRAFT — backend unreachable] RFQ proforma for ${payload.productName} (${payload.quantity} units to ${payload.destinationPort})`,
        timestamp: new Date().toISOString(),
      };
    }
  }
};
