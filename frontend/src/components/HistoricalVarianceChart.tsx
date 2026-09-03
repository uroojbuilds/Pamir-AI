import React, { useState } from 'react';
import { 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Area, 
  ComposedChart 
} from 'recharts';
import { ArrowUpRight, Activity } from 'lucide-react';

interface HistoricalVarianceChartProps {
  category: string;
  unitLandedCostPkr: number;
  productName: string;
}

export const HistoricalVarianceChart: React.FC<HistoricalVarianceChartProps> = ({
  category,
  unitLandedCostPkr,
  productName,
}) => {
  const [timeframe, setTimeframe] = useState<'8m' | '4m'>('8m');

  const baseCost = unitLandedCostPkr || 1280;
  const markupMultiplier = category === 'Machinery' ? 1.60 : category === 'Apparel' ? 1.75 : 1.65;
  const baseMarket = Math.round(baseCost * markupMultiplier);

  const rawData = [
    { month: 'Aug 25', costRatio: 1.05, marketRatio: 1.03 },
    { month: 'Sep 25', costRatio: 1.07, marketRatio: 1.05 },
    { month: 'Oct 25', costRatio: 1.02, marketRatio: 1.02 },
    { month: 'Nov 25', costRatio: 0.99, marketRatio: 1.04 },
    { month: 'Dec 25', costRatio: 1.03, marketRatio: 1.08 },
    { month: 'Jan 26', costRatio: 0.97, marketRatio: 1.06 },
    { month: 'Feb 26', costRatio: 0.95, marketRatio: 1.07 },
    { month: 'Current', costRatio: 0.93, marketRatio: 1.06 },
  ];

  const chartData = (timeframe === '4m' ? rawData.slice(4) : rawData).map((d) => {
    const landedCost = Math.round(baseCost * d.costRatio);
    const marketPrice = Math.round(baseMarket * d.marketRatio);
    const spread = marketPrice - landedCost;
    return {
      month: d.month,
      landedCost,
      marketPrice,
      spread,
    };
  });

  const latest = chartData[chartData.length - 1];
  const grossSpread = latest.spread;
  const grossMarginPercent = Math.round((grossSpread / latest.marketPrice) * 100);

  const formatCurrencyAxis = (value: number) => {
    if (value >= 1000000) return `Rs ${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `Rs ${(value / 1000).toFixed(1)}k`;
    return `Rs ${value}`;
  };

  return (
    <div className="bg-white dark:bg-stone-800 p-6 rounded-2xl border border-stone-200/80 dark:border-stone-700 shadow-sm space-y-6">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]"></span>
            <h3 className="font-extrabold text-sm text-stone-900 dark:text-stone-100">
              Landed Cost vs. Market Price Historical Variance
            </h3>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-orange-50 dark:bg-orange-950/40 text-[#C2410C] dark:text-orange-400 border border-orange-200 dark:border-orange-800">
              {category} CATEGORY
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Tracking 8-month historical price delta between imported CIF Karachi unit landed cost and domestic Pakistan wholesale market price.
          </p>
        </div>

        {/* Timeframe Toggle Buttons */}
        <div className="flex items-center bg-[#FAF8F5] dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-1 shrink-0">
          <button
            type="button"
            onClick={() => setTimeframe('8m')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              timeframe === '8m'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-2xs border border-stone-200 dark:border-stone-700'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            8 Months Trend
          </button>
          <button
            type="button"
            onClick={() => setTimeframe('4m')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              timeframe === '4m'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-2xs border border-stone-200 dark:border-stone-700'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            Recent 4 Months
          </button>
        </div>
      </div>

      {/* 4 Stat Inset Chips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-[#FAF8F5] dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-stone-500 dark:text-stone-400 uppercase">Current Landed Cost</span>
            <span className="w-2 h-2 rounded-full bg-[#EA580C]"></span>
          </div>
          <div className="text-base font-black font-mono text-stone-900 dark:text-stone-100 mt-1">
            Rs {latest.landedCost.toLocaleString()}
          </div>
          <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500">Avg: Rs {Math.round(baseCost).toLocaleString()}</span>
        </div>

        <div className="p-3 bg-[#FAF8F5] dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-stone-500 dark:text-stone-400 uppercase">Domestic Market Price</span>
            <span className="w-2 h-2 rounded-full bg-[#15803D]"></span>
          </div>
          <div className="text-base font-black font-mono text-[#15803D] mt-1">
            Rs {latest.marketPrice.toLocaleString()}
          </div>
          <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500">Avg: Rs {Math.round(baseMarket).toLocaleString()}</span>
        </div>

        <div className="p-3 bg-[#FAF8F5] dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-stone-500 dark:text-stone-400 uppercase">Gross Spread Delta</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#15803D]" />
          </div>
          <div className="text-base font-black font-mono text-stone-900 dark:text-stone-100 mt-1">
            +Rs {grossSpread.toLocaleString()}
          </div>
          <span className="text-[10px] font-mono font-bold text-[#15803D]">{grossMarginPercent}% gross margin</span>
        </div>

        <div className="p-3 bg-[#FAF8F5] dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-stone-500 dark:text-stone-400 uppercase">Variance Stability</span>
            <Activity className="w-3.5 h-3.5 text-[#EA580C]" />
          </div>
          <div className="text-base font-extrabold text-stone-900 dark:text-stone-100 mt-1">
            Stable Spread
          </div>
          <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500">Volatility: Low</span>
        </div>
      </div>

      {/* Chart Legend */}
      <div className="flex items-center justify-center gap-6 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#15803D]"></span>
          <span className="text-stone-700 dark:text-stone-300 font-bold">Domestic Wholesale Market Price</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#EA580C]"></span>
          <span className="text-stone-700 dark:text-stone-300 font-bold">Landed Cost (CIF Karachi)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800"></span>
          <span className="text-stone-500 dark:text-stone-400 font-medium">Margin Opportunity Window</span>
        </div>
      </div>

      {/* Recharts Graphical Body */}
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 15, left: 15, bottom: 0 }}>
            <defs>
              <linearGradient id="marginSpreadGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#15803D" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#15803D" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-stone-700" vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="#94a3b8" 
              tick={{ fontSize: 11, fontFamily: 'monospace' }} 
              axisLine={false} 
              tickLine={false} 
            />
            <YAxis 
              width={65}
              stroke="#94a3b8" 
              tick={{ fontSize: 11, fontFamily: 'monospace' }} 
              tickFormatter={formatCurrencyAxis} 
              axisLine={false} 
              tickLine={false} 
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1c1917',
                borderColor: '#44403c',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
                fontFamily: 'monospace',
                fontSize: '11px',
                color: '#f8fafc',
              }}
              formatter={(val: any, name: string) => [`Rs ${Number(val).toLocaleString()}`, name]}
            />
            {/* Area without tooltip trigger */}
            <Area 
              type="monotone" 
              dataKey="marketPrice" 
              fill="url(#marginSpreadGrad)" 
              stroke="none"
              tooltipType="none"
            />
            <Line
              type="monotone" 
              name="Domestic Wholesale"
              dataKey="marketPrice" 
              stroke="#15803D" 
              strokeWidth={2.5} 
              strokeDasharray="4 4" 
              dot={{ r: 3.5, fill: '#15803D', strokeWidth: 0 }} 
              activeDot={{ r: 5 }} 
            />
            <Line
              type="monotone" 
              name="Landed Cost (CIF)"
              dataKey="landedCost" 
              stroke="#EA580C" 
              strokeWidth={2.5} 
              dot={{ r: 3.5, fill: '#EA580C', strokeWidth: 0 }} 
              activeDot={{ r: 5 }} 
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Category Intelligence Analysis Note */}
      <div className="p-3.5 bg-[#FAF8F5] dark:bg-stone-900 border border-stone-200/80 dark:border-stone-700 rounded-xl flex items-start gap-2.5 text-xs">
        <div className="w-5 h-5 rounded-md bg-orange-50 dark:bg-orange-950/40 text-[#EA580C] border border-orange-200 dark:border-orange-800 flex items-center justify-center shrink-0 mt-0.5 font-bold">
          ↗
        </div>
        <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
          <strong className="font-extrabold text-stone-900 dark:text-stone-100">Category Intelligence Analysis:</strong> Industrial components maintain consistent gross markups with steady import clearance schedules and stable FOB pricing in Zhejiang. Currently calculated for <strong className="text-stone-900 dark:text-stone-100">{productName}</strong> at target order volume.
        </p>
      </div>
    </div>
  );
};