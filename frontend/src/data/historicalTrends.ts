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
  },
  Machinery: {
    category: 'Machinery',
    base_spread_pct: 44.2,
    trend_direction: 'stable',
    volatility_rating: 'Low',
    summary: 'Industrial components maintain consistent gross markups with steady import clearance schedules and stable FOB pricing in Zhejiang.',
    historical_data: [
      { period: '2025-08', month: 'Aug 25', landed_cost: 3850, market_price: 5600, margin_spread: 1750, margin_percentage: 31.3, freight_index: 7.0, duty_factor: 15 },
      { period: '2025-09', month: 'Sep 25', landed_cost: 3900, market_price: 5800, margin_spread: 1900, margin_percentage: 32.8, freight_index: 6.8, duty_factor: 15 },
      { period: '2025-10', month: 'Oct 25', landed_cost: 3750, market_price: 5750, margin_spread: 2000, margin_percentage: 34.8, freight_index: 6.2, duty_factor: 15 },
      { period: '2025-11', month: 'Nov 25', landed_cost: 3700, market_price: 5900, margin_spread: 2200, margin_percentage: 37.3, freight_index: 5.8, duty_factor: 15 },
      { period: '2025-12', month: 'Dec 25', landed_cost: 3800, market_price: 6100, margin_spread: 2300, margin_percentage: 37.7, freight_index: 6.0, duty_factor: 15 },
      { period: '2026-01', month: 'Jan 26', landed_cost: 3650, market_price: 6200, margin_spread: 2550, margin_percentage: 41.1, freight_index: 5.3, duty_factor: 15 },
      { period: '2026-02', month: 'Feb 26', landed_cost: 3600, market_price: 6350, margin_spread: 2750, margin_percentage: 43.3, freight_index: 5.0, duty_factor: 15 },
      { period: '2026-03', month: 'Current', landed_cost: 3550, market_price: 6400, margin_spread: 2850, margin_percentage: 44.5, freight_index: 5.0, duty_factor: 15 },
    ]
  },
  Apparel: {
    category: 'Apparel',
    base_spread_pct: 52.0,
    trend_direction: 'widening',
    volatility_rating: 'Moderate',
    summary: 'Fast fashion and streetwear blanks reflect highest local market multiplier over FOB cost, driven by high domestic e-commerce demand.',
    historical_data: [
      { period: '2025-08', month: 'Aug 25', landed_cost: 720, market_price: 1350, margin_spread: 630, margin_percentage: 46.7, freight_index: 5.5, duty_factor: 25 },
      { period: '2025-09', month: 'Sep 25', landed_cost: 740, market_price: 1400, margin_spread: 660, margin_percentage: 47.1, freight_index: 5.4, duty_factor: 25 },
      { period: '2025-10', month: 'Oct 25', landed_cost: 710, market_price: 1450, margin_spread: 740, margin_percentage: 51.0, freight_index: 5.0, duty_factor: 25 },
      { period: '2025-11', month: 'Nov 25', landed_cost: 680, market_price: 1500, margin_spread: 820, margin_percentage: 54.7, freight_index: 4.8, duty_factor: 25 },
      { period: '2025-12', month: 'Dec 25', landed_cost: 700, market_price: 1600, margin_spread: 900, margin_percentage: 56.3, freight_index: 5.2, duty_factor: 25 },
      { period: '2026-01', month: 'Jan 26', landed_cost: 670, market_price: 1580, margin_spread: 910, margin_percentage: 57.6, freight_index: 4.9, duty_factor: 25 },
      { period: '2026-02', month: 'Feb 26', landed_cost: 650, market_price: 1620, margin_spread: 970, margin_percentage: 59.9, freight_index: 4.8, duty_factor: 25 },
      { period: '2026-03', month: 'Current', landed_cost: 640, market_price: 1650, margin_spread: 1010, margin_percentage: 61.2, freight_index: 4.8, duty_factor: 25 },
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
