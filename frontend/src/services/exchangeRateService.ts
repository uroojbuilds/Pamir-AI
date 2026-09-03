import { apiClient } from './apiClient';
import { DEFAULT_USD_TO_PKR_RATE, DEFAULT_USD_TO_CNY_RATE } from '../utils/calculator';

export interface ExchangeRatesPayload {
  rates: {
    USD_PKR_INTERBANK: number;
    USD_PKR_OPEN_MARKET: number;
    USD_CNY: number;
  };
  sources?: {
    interbank?: string;
    open_market?: string;
    indicative_cny?: string;
  };
  data_status?: {
    interbank?: string;
    open_market?: string;
    indicative_cny?: string;
  };
  timestamp?: string;
  last_updated?: string;
  note?: string;
}

// Real shape returned by GET /api/backend's /exchange-rates (see main.py):
// { usd_pkr_interbank: {rate, data_status, source, source_date}, usd_pkr_open_market: {...}, usd_cny: {...}, note }
interface BackendExchangeRates {
  usd_pkr_interbank: { rate: number; data_status: string; source: string; source_date: string };
  usd_pkr_open_market: { rate: number; data_status: string; source: string; source_date: string };
  usd_cny: { rate: number; data_status: string; source: string; source_date: string };
  note: string;
}

export const exchangeRateService = {
  /**
   * Fetches foreign exchange rates from the real backend. These are dataset
   * snapshots (verified/curated/estimated, each with a source and
   * source_date) - not a live market feed, and the UI should not imply
   * second-by-second movement. Public endpoint, no auth required.
   */
  async getExchangeRates(): Promise<ExchangeRatesPayload> {
    try {
      const data = await apiClient.get<BackendExchangeRates>('/exchange-rates', { skipAuth: true });
      if (data && data.usd_pkr_interbank && data.usd_cny) {
        return {
          rates: {
            USD_PKR_INTERBANK: data.usd_pkr_interbank.rate,
            USD_PKR_OPEN_MARKET: data.usd_pkr_open_market.rate,
            USD_CNY: data.usd_cny.rate,
          },
          sources: {
            interbank: data.usd_pkr_interbank.source,
            open_market: data.usd_pkr_open_market.source,
            indicative_cny: data.usd_cny.source,
          },
          data_status: {
            interbank: data.usd_pkr_interbank.data_status,
            open_market: data.usd_pkr_open_market.data_status,
            indicative_cny: data.usd_cny.data_status,
          },
          timestamp: data.usd_pkr_interbank.source_date,
          last_updated: data.usd_pkr_interbank.source_date,
          note: data.note,
        };
      }
      throw new Error('Malformed exchange rate response');
    } catch (err) {
      console.warn('[ExchangeRateService] Backend unreachable, using local defaults:', err);
      return {
        rates: {
          USD_PKR_INTERBANK: DEFAULT_USD_TO_PKR_RATE,
          USD_PKR_OPEN_MARKET: 278.50,
          USD_CNY: DEFAULT_USD_TO_CNY_RATE,
        },
        timestamp: new Date().toISOString(),
        last_updated: 'Fallback Reference (backend unreachable)',
      };
    }
  }
};
