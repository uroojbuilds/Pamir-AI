/**
 * PamirAI Trade Command Canvas - Type Definitions
 * Exact alignment with FastAPI Python backend payload schemas
 */

export interface ExchangeRatesData {
  USD_PKR_INTERBANK: number;
  USD_PKR_OPEN_MARKET: number;
  USD_CNY: number;
  last_updated?: string;
  is_loading?: boolean;
}

export interface TradeParameters {
  capital: number;
  category: string;
  product_id: string;
  product_name: string;
  quantity: number;
  target_currency: 'PKR' | 'CNY';
}

export interface TradeCalculations {
  product_cost_pkr: number;
  shipping_cost_pkr: number;
  duty_rate_percent: number;
  customs_cost_pkr: number;
  total_landed_cost_pkr: number;
  unit_landed_cost_pkr: number;
  shipping_method: 'Air' | 'Express' | 'Sea';
  shipping_rate_usd: number;
  weight_used_kg: number;
  duty_rate_source: 'confirmed' | 'default_fallback';
  exchange_rate_used: number;
  exchange_rate_status: 'verified' | 'curated' | 'estimated';
}

export interface AiExplanation {
  reasoning: string;
  strengths: string[];
  risks: string[];
  warnings: string[];
  recommendation: string;
  confidence: 'low' | 'medium' | 'high' | string;
}

export interface TradeAiAnalysis {
  viability_score: number;
  data_confidence: 'verified' | 'curated' | 'incomplete';
  trade_assurance_status: boolean | null;
  moq_level: 'Low' | 'Medium' | 'High';
  risk_summary: string;
  qwen_status: 'available' | 'not_configured' | 'unavailable' | 'error';
  ai_explanation: AiExplanation;
}

export interface TradePayload {
  // 1. Parameters
  capital: number;
  category: string;
  product_id: string;
  product_name: string;
  
  // 2. Calculations
  product_cost_pkr: number;
  shipping_cost_pkr: number;
  duty_rate_percent: number;
  customs_cost_pkr: number;
  total_landed_cost_pkr: number;
  
  // 3. AI Analysis
  viability_score: number;
  data_confidence: 'verified' | 'curated' | 'incomplete';
  risk_summary: string;
  ai_explanation: AiExplanation;

  // Metadata & Extra details
  calculations: TradeCalculations;
  analysis: TradeAiAnalysis;
}

export interface ProductItem {
  product_id: string;
  product_name: string;
  category: string;
  supplier_price: number | null;
  unit_price_pkr?: number;
  currency: string;
  moq: number | null;
  weight_kg: number | null;
  supplier_id: string;
  supplier_name: string;
  trade_assurance: boolean | null;
  source: string;
  source_date: string;
  data_status: 'verified' | 'curated' | 'incomplete';
}

export interface MarketingCopyPayload {
  product_description: string;
  social_media_caption: string;
}

export interface CurrencyRate {
  base_currency: string;
  target_currency: string;
  rate: number;
  source: string;
  source_date: string;
  data_status: 'verified' | 'curated' | 'estimated';
}

export interface CustomsTariffEntry {
  pct_code: string;
  description: string;
  category: string;
  duty_rate: number;
  source: string;
  source_date: string;
  data_status: 'verified' | 'curated';
}

export interface ShippingMethodRate {
  route: string;
  shipping_method: 'Air' | 'Express' | 'Sea (LCL)';
  estimated_cost: number;
  currency: string;
  unit: string;
  source: string;
  source_date: string;
  data_status: 'verified';
}

export interface AuditLogEntry {
  id: string; // e.g. "LOG-20260831-001"
  record_id: string; // e.g. "REC-P001"
  timestamp: string; // ISO string
  user_id: string; // e.g. "kafa.rwp@gmail.com"
  field_name: string; // 'capital' | 'category' | 'product_id' | 'total_landed_cost_pkr' | etc.
  previous_value: string | number;
  new_value: string | number;
  action_type: 'INITIAL_LOAD' | 'PRESET_MACRO_SELECT' | 'MANUAL_OVERRIDE' | 'RECALCULATION' | 'EXPORT_EXECUTED';
  metadata?: Record<string, unknown>;
}

export interface PresetLotMacro {
  id: string;
  label: string;
  icon: string;
  product_id: string;
  product_name: string;
  capital: number;
  category: string;
  quantity: number;
  tagline: string;
}

export type ActiveNavTab = 'sourcing' | 'rfqs' | 'tariff' | 'audit' | 'catalog';
