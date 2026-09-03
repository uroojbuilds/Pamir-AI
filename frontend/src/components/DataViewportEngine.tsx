import React from 'react';
import { 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  Sliders, 
  ArrowRight,
  TrendingUp,
  Package,
  Layers
} from 'lucide-react';
import { TradePayload, TradeParameters, PresetLotMacro } from '../types';
import { PRESET_LOT_MACROS } from '../data/tradeData';
import { FinancialBentoBlock } from './FinancialBentoBlock';
import { MetricGaugeBentoCard } from './MetricGaugeBentoCard';
import { AiContextHorizonSheet } from './AiContextHorizonSheet';

interface DataViewportEngineProps {
  payload: TradePayload;
  parameters: TradeParameters;
  onParametersChange: (newParams: Partial<TradeParameters>) => void;
  onExportPdf: () => void;
  onCopyAllText: () => void;
  isCopied: boolean;
  onSelectPreset: (preset: PresetLotMacro) => void;
  activePresetId: string | null;
}

export const DataViewportEngine: React.FC<DataViewportEngineProps> = ({
  payload,
  parameters,
  onParametersChange,
  onExportPdf,
  onCopyAllText,
  isCopied,
  onSelectPreset,
  activePresetId,
}) => {
  const handleQuantityAdjust = (delta: number) => {
    const next = Math.max(1, (parameters.quantity || 1) + delta);
    onParametersChange({ quantity: next });
  };

  return (
    <main 
      id="primary-desktop-saas-viewport" 
      className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto w-full max-w-[1600px] mx-auto"
    >
      {/* Top SaaS Controls & Preset Lot Macro Action Bar */}
      <div className="bg-white dark:bg-stone-800 rounded-2xl border border-slate-200/60 shadow-sm p-4 sm:p-5 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        {/* Preset Macros */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mr-1">
            Lot Macros:
          </span>
          {PRESET_LOT_MACROS.map((preset) => {
            const isSelected = activePresetId === preset.id || parameters.product_id === preset.product_id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`
                  px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border
                  ${isSelected 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs ring-2 ring-blue-500/20' 
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'}
                `}
              >
                <span>{preset.label}</span>
                <span className="font-mono opacity-70 text-[10px]">({preset.quantity}u)</span>
              </button>
            );
          })}
        </div>

        {/* Global Export & Copy Actions */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={onCopyAllText}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-stone-800 hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs transition-all cursor-pointer"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{isCopied ? 'Payload Copied!' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={onExportPdf}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Cargo Dossier</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          🔥 HIGH-DENSITY CRISP BENTO GRID SYSTEM
          - 12-Column Responsive SaaS Grid
          - Block 1 (8 Cols): Wide Landed Cost Ledger with Financial Visualizer
          - Block 2 (4 Cols): Sharp Square Viability Score Gauge & Risk Box
          - Block 3 (12 Cols): Expansive Full-Width AI Context Horizon Sheet
          ========================================================================= */}
      <div className="grid grid-cols-12 gap-6" id="bento-grid-workspace-canvas">
        {/* 1. Wide Financial Bento Block (Calculated Outputs: total_landed_cost_pkr, shipping, customs) */}
        <FinancialBentoBlock
          payload={payload}
          parameters={parameters}
          onQuantityAdjust={handleQuantityAdjust}
          onParameterChange={onParametersChange}
        />

        {/* 2. Compact Square Metric Card (Viability Score Gauge & Data Confidence) */}
        <MetricGaugeBentoCard
          payload={payload}
          parameters={parameters}
          onOpenReportModal={onExportPdf}
        />

        {/* 3. Expansive Full-Width AI Horizon Sheet (ai_explanation, reasoning, strengths, risks) */}
        <AiContextHorizonSheet
          payload={payload}
          parameters={parameters}
          onOpenReportModal={onExportPdf}
        />
      </div>
    </main>
  );
};
