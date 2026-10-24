import type { ProductItem } from '../types';
import type { RatesState } from '../state/AppContext';

/** Supplier unit price in USD (converts if the dataset row is quoted in CNY). null = no price in dataset. */
export function priceUsd(p: ProductItem, rates: Pick<RatesState, 'cny'>): number | null {
  if (p.supplier_price == null) return null;
  return p.currency === 'CNY' ? p.supplier_price / rates.cny : p.supplier_price;
}

/** Cost of the minimum order quantity in PKR (FOB product cost only). null if price or MOQ is unknown. */
export function moqCostPkr(p: ProductItem, rates: Pick<RatesState, 'cny' | 'interbank'>): number | null {
  const usd = priceUsd(p, rates);
  if (usd == null || !p.moq) return null;
  return usd * p.moq * rates.interbank;
}

export const fitsBudget = (p: ProductItem, budget: number, rates: Pick<RatesState, 'cny' | 'interbank'>) => {
  const c = moqCostPkr(p, rates);
  return c != null && c <= budget;
};
