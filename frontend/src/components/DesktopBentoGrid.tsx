import React from 'react';
import { 
  TrendingUp, 
  ShieldCheck, 
  Scale, 
  Layers, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  DollarSign,
  Cpu,
  Clock,
  Weight
} from 'lucide-react';
import { TradePayload, TradeParameters } from '../types';

interface DesktopBentoGridProps {
  payload: TradePayload;
  parameters: TradeParameters;
}

export const DesktopBentoGrid: React.FC<DesktopBentoGridProps> = ({ payload, parameters }) => {
  return (
    <div className="space-y-4 select-none">
      
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-stone-700 dark:text-stone-300">
          <Cpu className="w-3.5 h-3.5 text-[#EA580C]" />
          <span>Qwen-2.5-Trade Financial Telemetry Matrix</span>
        </div>
        <span className="text-[11px] font-mono text-[#15803D] font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
          ✓ FBR SRO 2024 Compliant
        </span>
      </div>

      {/* 4-Card Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Unit Landed Cost */}
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#6B5B4F] text-xs font-mono font-bold uppercase">
            <span>Unit Landed Cost</span>
            <DollarSign className="w-4 h-4 text-[#EA580C]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-[#C2410C]">
              Rs {payload.calculations.unit_landed_cost_pkr.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-stone-500 dark:text-stone-400 font-bold">/ unit</span>
          </div>
          <p className="text-[11px] text-[#6B5B4F] font-medium leading-snug">
            All-inclusive CIF Karachi + FBR duties per earbud.
          </p>
        </div>

        {/* Card 2: Viability Score */}
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#6B5B4F] text-xs font-mono font-bold uppercase">
            <span>AI Viability</span>
            <TrendingUp className="w-4 h-4 text-[#15803D]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-[#15803D]">
              {payload.viability_score} <span className="text-sm font-bold text-stone-500 dark:text-stone-400">/ 100</span>
            </span>
          </div>
          <p className="text-[11px] text-[#15803D] font-bold leading-snug">
            ✨ Qwen-2.5: High profit margin potential in PK.
          </p>
        </div>

        {/* Card 3: Tariff & Customs Ratio */}
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#6B5B4F] text-xs font-mono font-bold uppercase">
            <span>FBR Customs Ratio</span>
            <Scale className="w-4 h-4 text-[#EA580C]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-stone-900 dark:text-stone-100">
              {payload.duty_rate_percent}%
            </span>
            <span className="text-xs font-mono text-stone-500 dark:text-stone-400 font-bold">Duty Rate</span>
          </div>
          <p className="text-[11px] text-[#6B5B4F] font-medium leading-snug">
            Duty Surcharge: Rs {payload.customs_cost_pkr.toLocaleString()}
          </p>
        </div>

        {/* Card 4: Logistics & SBP FX Rate */}
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#6B5B4F] text-xs font-mono font-bold uppercase">
            <span>SBP Forex Baseline</span>
            <ShieldCheck className="w-4 h-4 text-[#15803D]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-stone-900 dark:text-stone-100">
              Rs 279.30
            </span>
            <span className="text-xs font-mono text-stone-500 dark:text-stone-400 font-bold">/ USD</span>
          </div>
          <p className="text-[11px] text-[#6B5B4F] font-medium leading-snug">
            China OEM rate locked at ¥ 6.72 / USD.
          </p>
        </div>

      </div>
    </div>
  );
};