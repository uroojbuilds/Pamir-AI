import React from 'react';
import { DollarSign, Plane, Scale, Package, TrendingUp, Info } from 'lucide-react';
import { TradeCalculations, TradeParameters } from '../types';

interface LandedCostLedgerCardProps {
  calculations: TradeCalculations;
  parameters: TradeParameters;
  onQuantityAdjust: (delta: number) => void;
}

export const LandedCostLedgerCard: React.FC<LandedCostLedgerCardProps> = ({
  calculations,
  parameters,
  onQuantityAdjust,
}) => {
  const {
    product_cost_pkr,
    shipping_cost_pkr,
    duty_rate_percent,
    customs_cost_pkr,
    total_landed_cost_pkr,
    unit_landed_cost_pkr,
    weight_used_kg,
    duty_rate_source,
    exchange_rate_used
  } = calculations;

  // Compute percentages for the inline bar chart
  const total = total_landed_cost_pkr || 1;
  const productPct = Math.round((product_cost_pkr / total) * 100);
  const shippingPct = Math.round((shipping_cost_pkr / total) * 100);
  const customsPct = Math.max(0, 100 - productPct - shippingPct);

  return (
    <div 
      id="landed-cost-ledger-card"
      className="col-span-1 lg:col-span-2 bg-white dark:bg-stone-800 p-6 rounded-xl border border-slate-200/60 shadow-sm flex flex-col justify-between"
    >
      {/* Header Info */}
      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                WIDGET 01 // FINANCIAL LEDGER
              </span>
              <span className="text-xs text-slate-400 font-medium">Air Cargo Karachi ($5/kg)</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Landed Cost Ledger
            </h2>
          </div>

          {/* Quantity Controls in Card */}
          <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => onQuantityAdjust(-5)}
              className="w-7 h-7 flex items-center justify-center rounded bg-white dark:bg-stone-800 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 shadow-2xs cursor-pointer transition-colors"
              title="Decrease quantity by 5"
            >
              -
            </button>
            <span className="px-2 text-xs font-mono font-bold text-slate-900">
              {parameters.quantity} pcs
            </span>
            <button
              onClick={() => onQuantityAdjust(5)}
              className="w-7 h-7 flex items-center justify-center rounded bg-white dark:bg-stone-800 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 shadow-2xs cursor-pointer transition-colors"
              title="Increase quantity by 5"
            >
              +
            </button>
          </div>
        </div>

        {/* Prominent Bold Total Layout Tracking total_landed_cost_pkr */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-5 text-white shadow-inner mb-6">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
            <span className="font-mono uppercase tracking-wider">total_landed_cost_pkr</span>
            <span className="text-[11px] bg-slate-700/80 px-2 py-0.5 rounded text-emerald-400 font-mono font-semibold">
              Per unit: Rs {unit_landed_cost_pkr.toLocaleString()}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-white">
              Rs {total_landed_cost_pkr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-400 uppercase font-bold">PKR</span>
          </div>
        </div>

        {/* Inline Comparative Bar Chart Skeleton */}
        <div className="mb-6" id="landed-cost-proportional-bar">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
            <span>Cost Distribution Proportion</span>
            <span className="font-mono text-[11px] text-slate-400">Total Lot: {weight_used_kg} kg</span>
          </div>

          <div className="w-full h-4 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
            <div 
              style={{ width: `${productPct}%` }} 
              className="bg-blue-600 h-full transition-all duration-500 ease-out relative group"
              title={`Product Cost: ${productPct}%`}
            />
            <div 
              style={{ width: `${shippingPct}%` }} 
              className="bg-amber-500 h-full transition-all duration-500 ease-out relative group"
              title={`Shipping Freight: ${shippingPct}%`}
            />
            <div 
              style={{ width: `${customsPct}%` }} 
              className="bg-emerald-500 h-full transition-all duration-500 ease-out relative group"
              title={`FBR Duty: ${customsPct}%`}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5 text-[11px] font-medium text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span>Factory Price ({productPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Air Freight ({shippingPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>FBR Customs ({customsPct}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Numerical Data Rows Bound Directly to FastAPI Schema Keys */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
        {/* Item 1: Product Cost */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-tight flex items-center gap-1 mb-1">
            <Package className="w-3.5 h-3.5 text-blue-600" />
            product_cost_pkr
          </div>
          <div className="text-base font-bold font-mono text-slate-900">
            Rs {product_cost_pkr.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 truncate">
            Rate: Rs {exchange_rate_used.toFixed(2)}/USD
          </div>
        </div>

        {/* Item 2: Shipping Cost */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-tight flex items-center gap-1 mb-1">
            <Plane className="w-3.5 h-3.5 text-amber-600" />
            shipping_cost_pkr
          </div>
          <div className="text-base font-bold font-mono text-slate-900">
            Rs {shipping_cost_pkr.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 truncate">
            {weight_used_kg} kg @ $5.00/kg
          </div>
        </div>

        {/* Item 3: Customs Cost */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-tight flex items-center gap-1 mb-1">
            <Scale className="w-3.5 h-3.5 text-emerald-600" />
            customs_cost_pkr
          </div>
          <div className="text-base font-bold font-mono text-slate-900">
            Rs {customs_cost_pkr.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 truncate">
            FBR Tariff: <span className="font-bold text-emerald-700">{duty_rate_percent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
