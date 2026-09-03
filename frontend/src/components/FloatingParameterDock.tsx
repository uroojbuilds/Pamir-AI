import React from 'react';
import { 
  Building2, 
  ChevronRight, 
  Layers, 
  Activity, 
  ShieldCheck, 
  Radio, 
  Sparkles,
  ArrowRight,
  Database,
  History,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { TradeParameters, PresetLotMacro } from '../types';
import { PRESET_LOT_MACROS, PRODUCTS_CATALOG, DUTY_RATES_MAP } from '../data/tradeData';
import { getProductById } from '../utils/calculator';

interface FloatingParameterDockProps {
  parameters: TradeParameters;
  onParametersChange: (newParams: Partial<TradeParameters>, autoTrigger?: boolean) => void;
  onExecuteCanvas: () => void;
  activePresetId: string | null;
  onSelectPreset: (preset: PresetLotMacro) => void;
}

export const FloatingParameterDock: React.FC<FloatingParameterDockProps> = ({
  parameters,
  onParametersChange,
  onExecuteCanvas,
  activePresetId,
  onSelectPreset,
}) => {
  const currentProduct = getProductById(parameters.product_id);
  const currentDuty = DUTY_RATES_MAP[parameters.product_id] ?? 20;

  return (
    <div className="w-full max-w-5xl mx-auto py-8 sm:py-12 px-4" id="saas-initial-dock-container">
      {/* SaaS Hero Brand Header */}
      <div className="text-center mb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-mono font-bold tracking-tight">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          PAK-CHINA CORRIDOR TRADE INTELLIGENCE
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
          Pamir<span className="text-blue-600">AI</span> Trade Command Studio
        </h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
          High-precision cross-border landed cost simulation, FBR customs duty classification, and automated China factory procurement analytics.
        </p>
      </div>

      {/* Main Studio Control Bento Card */}
      <div className="bg-white dark:bg-stone-800 rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-10 space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* SECTION 1: 1-Click Preset Lot Macros */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-mono font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              1-Click Sourcing Lot Macros
            </label>
            <span className="text-xs text-slate-400 font-mono">Instant Fast-Forward</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {PRESET_LOT_MACROS.map((preset) => {
              const isSelected = activePresetId === preset.id || parameters.product_id === preset.product_id;
              return (
                <button
                  key={preset.id}
                  onClick={() => onSelectPreset(preset)}
                  className={`
                    p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between
                    ${isSelected 
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-sm' 
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'}
                  `}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono font-bold text-xs text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded">
                        {preset.product_id}
                      </span>
                      <span className="text-xs font-mono font-extrabold text-slate-900">
                        {preset.quantity} Units
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm mb-1">{preset.label}</div>
                    <div className="text-xs text-slate-500 line-clamp-1">{preset.product_name}</div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Capital:</span>
                    <span className="font-bold text-slate-800">Rs {preset.capital.toLocaleString()} PKR</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: Custom Parameter Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6 border-t border-slate-100">
          {/* Sourcing SKU */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-slate-500 mb-1.5">
              Target China SKU / Lot
            </label>
            <select
              value={parameters.product_id}
              onChange={(e) => onParametersChange({ product_id: e.target.value })}
              className="w-full px-3.5 py-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
            >
              {PRODUCTS_CATALOG.map((p) => (
                <option key={p.product_id} value={p.product_id}>
                  [{p.product_id}] {p.product_name} (${(p.supplier_price ?? 0).toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-slate-500 mb-1.5">
              Order Volume (Pieces)
            </label>
            <input
              type="number"
              min={1}
              value={parameters.quantity}
              onChange={(e) => onParametersChange({ quantity: parseInt(e.target.value) || 1 })}
              className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Capital Allocation */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-slate-500 mb-1.5">
              Allocated Budget (PKR)
            </label>
            <input
              type="number"
              step={5000}
              value={parameters.capital}
              onChange={(e) => onParametersChange({ capital: parseInt(e.target.value) || 0 })}
              className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Live Parameters Summary Badge Bar */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-mono">SELECTED SKU SPECS</div>
              <div className="text-sm font-bold text-white">{currentProduct.product_name}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">Supplier MOQ</span>
              <span className="font-bold text-blue-400">{currentProduct.moq || 10} pcs</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Duty Tariff</span>
              <span className="font-bold text-emerald-400">{currentDuty}%</span>
            </div>
            <button
              onClick={onExecuteCanvas}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <span>Launch Studio Canvas</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
