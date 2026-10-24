export interface HistoricalVarianceDataPoint {
  period: string;
  month: string;
  landed_cost: number;
  market_price: number;
  margin_spread: number;
  margin_percentage: number;
  freight_index: number;
  duty_factor: number;
}

export interface CategoryVarianceTrends {
  category: string;
  base_spread_pct: number;
  trend_direction: 'widening' | 'compressing' | 'stable';
  volatility_rating: 'Low' | 'Moderate' | 'High';
  historical_data: HistoricalVarianceDataPoint[];
  summary: string;
}

export const CATEGORY_HISTORICAL_DATA: Record<string, CategoryVarianceTrends> = {
  Electronics: {
    category: 'Electronics',
    base_spread_pct: 38.4,
    trend_direction: 'widening',
    volatility_rating: 'Moderate',
    summary: 'Landed costs have stabilized following container rate normalization, while wholesale resale prices in Karachi/Lahore tech markets remain resilient.',
    historical_data: [
      { period: '2025-08', month: 'Aug 25', landed_cost: 1420, market_price: 2150, margin_spread: 730, margin_percentage: 34.0, freight_index: 6.2, duty_factor: 20 },
      { period: '2025-09', month: 'Sep 25', landed_cost: 1460, market_price: 2200, margin_spread: 740, margin_percentage: 33.6, freight_index: 6.0, duty_factor: 20 },
      { period: '2025-10', month: 'Oct 25', landed_cost: 1390, market_price: 2180, margin_spread: 790, margin_percentage: 36.2, freight_index: 5.5, duty_factor: 20 },
      { period: '2025-11', month: 'Nov 25', landed_cost: 1350, market_price: 2250, margin_spread: 900, margin_percentage: 40.0, freight_index: 5.2, duty_factor: 20 },
      { period: '2025-12', month: 'Dec 25', landed_cost: 1380, market_price: 2320, margin_spread: 940, margin_percentage: 40.5, freight_index: 5.4, duty_factor: 20 },
      { period: '2026-01', month: 'Jan 26', landed_cost: 1320, market_price: 2280, margin_spread: 960, margin_percentage: 42.1, freight_index: 5.0, duty_factor: 20 },
      { period: '2026-02', month: 'Feb 26', landed_cost: 1300, market_price: 2300, margin_spread: 1000, margin_percentage: 43.5, freight_index: 5.0, duty_factor: 20 },
      { period: '2026-03', month: 'Current', landed_cost: 1280, market_price: 2340, margin_spread: 1060, margin_percentage: 45.3, freight_index: 5.0, duty_factor: 20 },
    ]
  }
};

/**
 * Dynamically scales category historical trend curve to match the specific unit landed cost of the selected product
 */
export function getScaledHistoricalVariance(category: string, currentUnitLandedCostPkr: number): CategoryVarianceTrends {
  const normCategory = CATEGORY_HISTORICAL_DATA[category] ? category : 'Electronics';
  const rawTrend = CATEGORY_HISTORICAL_DATA[normCategory];

  const currentReferencePoint = rawTrend.historical_data[rawTrend.historical_data.length - 1];
  const scaleRatio = currentUnitLandedCostPkr > 0 && currentReferencePoint.landed_cost > 0
    ? currentUnitLandedCostPkr / currentReferencePoint.landed_cost
    : 1;

  const scaledData = rawTrend.historical_data.map((point, index) => {
    const isCurrent = index === rawTrend.historical_data.length - 1;
    const landed_cost = isCurrent ? Math.round(currentUnitLandedCostPkr) : Math.round(point.landed_cost * scaleRatio);
    // Local market wholesale multiplier typically ranges 1.6x to 2.4x
    const multiplier = 1 + (point.margin_percentage / 100) * 1.35;
    const market_price = Math.round(landed_cost * multiplier);
    const margin_spread = market_price - landed_cost;
    const margin_percentage = Math.round((margin_spread / market_price) * 100);

    return {
      ...point,
      landed_cost,
      market_price,
      margin_spread,
      margin_percentage
    };
  });

  return {
    ...rawTrend,
    historical_data: scaledData
  };
}
