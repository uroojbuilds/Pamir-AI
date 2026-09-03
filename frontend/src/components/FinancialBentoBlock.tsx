import React from 'react';
import { 
  Building2, 
  Plane, 
  Scale, 
  Package, 
  TrendingUp, 
  Layers, 
  ArrowUpRight, 
  FileCheck2, 
  ShieldCheck, 
  Sparkles,
  Info,
  DollarSign
} from 'lucide-react';
import { TradeCalculations, TradeParameters, TradePayload } from '../types';
import { getProductById } from '../utils/calculator';

interface FinancialBentoBlockProps {
  payload: TradePayload;
  parameters: TradeParameters;
  onQuantityAdjust: (delta: number) => void;
  onParameterChange: (newParams: Partial<TradeParameters>) => void;
}

export const FinancialBentoBlock: React.FC<FinancialBentoBlockProps> = ({
  payload,
  parameters,
  onQuantityAdjust,
}) => {
  const calc = payload.calculations;
  const product = getProductById(payload.product_id);

  // Proportions for visual distribution bar
  const total = calc.total_landed_cost_pkr || 1;
  const productPct = Math.round((calc.product_cost_pkr / total) * 100);
  const shippingPct = Math.round((calc.shipping_cost_pkr / total) * 100);
  const customsPct = Math.max(0, 100 - productPct - shippingPct);

  return (
    <div 
      id="financial-bento-wide-block"
      className="col-span-12 xl:col-span-8 bg-white dark:bg-stone-800 rounded-2xl border border-slate-200/60 shadow-sm p-6 flex flex-col justify-between"
    >
      {/* Top Meta Bar */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100/70 text-blue-800 border border-blue-200">
                  PRIMARY FINANCIAL ENGINE
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  CORRIDOR: CHINA ➔ KHI
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight mt-0.5">
                Total Landed Cost Ledger
              </h2>
            </div>
          </div>

          {/* Quick Volume Stepper */}
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-semibold px-2">Lot Volume:</span>
            <button
              onClick={() => onQuantityAdjust(-10)}
              className="w-7 h-7 rounded-lg bg-white dark:bg-stone-800 hover:bg-slate-100 text-slate-700 font-mono font-bold text-xs border border-slate-200 shadow-2xs cursor-pointer transition-colors"
              title="Decrease by 10 units"
            >
              -10
            </button>
            <span className="px-2 font-mono font-bold text-sm text-slate-900 min-w-[50px] text-center">
              {parameters.quantity} pcs
            </span>
            <button
              onClick={() => onQuantityAdjust(10)}
              className="w-7 h-7 rounded-lg bg-white dark:bg-stone-800 hover:bg-slate-100 text-slate-700 font-mono font-bold text-xs border border-slate-200 shadow-2xs cursor-pointer transition-colors"
              title="Increase by 10 units"
            >
              +10
            </button>
          </div>
        </div>

        {/* Big SaaS Financial Output Banner */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-md mb-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-44 h-44 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="md:col-span-7 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-mono mb-1">
              <span className="uppercase tracking-wider">FastAPI Payload: total_landed_cost_pkr</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
                Rs {calc.total_landed_cost_pkr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-extrabold text-blue-400 font-mono uppercase">PKR</span>
            </div>
            <p className="text-xs text-slate-300 mt-2 font-medium">
              Comprehensive CIF valuation to Karachi Port including air freight transit & customs tariffs.
            </p>
          </div>

          <div className="md:col-span-5 grid grid-cols-2 gap-3 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-5">
            <div className="bg-white dark:bg-stone-800/5 rounded-xl p-3 border border-white/10">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Unit Landed Cost</span>
              <span className="text-lg font-bold font-mono text-emerald-400">
                Rs {calc.unit_landed_cost_pkr.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">per delivered piece</span>
            </div>
            <div className="bg-white dark:bg-stone-800/5 rounded-xl p-3 border border-white/10">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Gross Weight</span>
              <span className="text-lg font-bold font-mono text-amber-300">
                {calc.weight_used_kg} kg
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Air Cargo @ $5.00/kg</span>
            </div>
            <div className="bg-white dark:bg-stone-800/5 rounded-xl p-3 border border-white/10 col-span-2 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Allocated Capital</span>
                <span className="text-sm font-bold font-mono text-slate-100">
                  Rs {parameters.capital.toLocaleString()} PKR
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${parameters.capital >= calc.total_landed_cost_pkr ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                {parameters.capital >= calc.total_landed_cost_pkr ? 'Budget Sufficient' : 'Budget Deficit'}
              </span>
            </div>
          </div>
        </div>

        {/* Proportional Cost Distribution Spectrum */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              Proportional Cost Allocation Spectrum
            </span>
            <span className="text-[11px] text-slate-400 font-mono">100% CIF Karachi Model</span>
          </div>

          <div className="w-full h-3.5 rounded-full bg-slate-100 overflow-hidden flex p-0.5 gap-0.5 border border-slate-200">
            <div 
              style={{ width: `${productPct}%` }} 
              className="bg-blue-600 h-full rounded-l-full transition-all duration-500 ease-out" 
              title={`Product: ${productPct}%`} 
            />
            <div 
              style={{ width: `${shippingPct}%` }} 
              className="bg-amber-500 h-full transition-all duration-500 ease-out" 
              title={`Shipping: ${shippingPct}%`} 
            />
            <div 
              style={{ width: `${customsPct}%` }} 
              className="bg-emerald-500 h-full rounded-r-full transition-all duration-500 ease-out" 
              title={`Tariff: ${customsPct}%`} 
            />
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50/50 border border-blue-100">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"></span>
              <div className="truncate">
                <div className="text-[10px] text-slate-500 font-semibold">Factory FOB ({productPct}%)</div>
                <div className="font-mono font-bold text-slate-900 text-xs">Rs {calc.product_cost_pkr.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50/50 border border-amber-100">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
              <div className="truncate">
                <div className="text-[10px] text-slate-500 font-semibold">Air Freight ({shippingPct}%)</div>
                <div className="font-mono font-bold text-slate-900 text-xs">Rs {calc.shipping_cost_pkr.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/50 border border-emerald-100">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
              <div className="truncate">
                <div className="text-[10px] text-slate-500 font-semibold">FBR Duty ({customsPct}%)</div>
                <div className="font-mono font-bold text-slate-900 text-xs">Rs {calc.customs_cost_pkr.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Numerical Data Rows Bound Directly to FastAPI Schema Keys */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
          <div className="text-[10px] font-mono uppercase font-bold text-slate-400">product_cost_pkr</div>
          <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">Rs {calc.product_cost_pkr.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500">Unit: ${(product.supplier_price ?? 0).toFixed(2)} USD</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
          <div className="text-[10px] font-mono uppercase font-bold text-slate-400">shipping_cost_pkr</div>
          <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">Rs {calc.shipping_cost_pkr.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500">Rate: $5.00/kg Air</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
          <div className="text-[10px] font-mono uppercase font-bold text-slate-400">duty_rate_percent</div>
          <div className="text-sm font-bold font-mono text-emerald-700 mt-0.5">{calc.duty_rate_percent}%</div>
          <div className="text-[10px] text-slate-500">Source: {calc.duty_rate_source}</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
          <div className="text-[10px] font-mono uppercase font-bold text-slate-400">customs_cost_pkr</div>
          <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">Rs {calc.customs_cost_pkr.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500">WeBOC Surcharge</div>
        </div>
      </div>
    </div>
  );
};
