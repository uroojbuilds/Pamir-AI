import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  CheckCircle2, 
  AlertOctagon, 
  HelpCircle, 
  Scale, 
  ExternalLink, 
  ChevronRight,
  TrendingUp,
  FileText,
  BadgeCheck
} from 'lucide-react';
import { TradePayload, TradeParameters } from '../types';

interface AiContextHorizonSheetProps {
  payload: TradePayload;
  parameters: TradeParameters;
  onOpenReportModal: () => void;
}

export const AiContextHorizonSheet: React.FC<AiContextHorizonSheetProps> = ({
  payload,
  parameters,
  onOpenReportModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'reasoning' | 'strengths' | 'risks' | 'recommendation'>('reasoning');
  const ai = payload.analysis.ai_explanation;

  return (
    <div 
      id="ai-context-horizon-sheet"
      className="col-span-12 bg-white dark:bg-stone-800 rounded-2xl border border-slate-200/60 shadow-sm p-6 sm:p-8"
    >
      {/* Horizon Sheet Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                VENTURE INTEL HORIZON
              </span>
              <span className="text-xs text-slate-400 font-mono">
                CONFIDENCE: {ai.confidence.toUpperCase()}
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight mt-0.5">
              Qwen-3 Trade Feasibility & Strategic Reasoning Matrix
            </h2>
          </div>
        </div>

        {/* Sub Navigation Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
          <button
            onClick={() => setActiveSubTab('reasoning')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'reasoning'
                ? 'bg-white dark:bg-stone-800 text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Executive Reasoning
          </button>
          <button
            onClick={() => setActiveSubTab('strengths')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'strengths'
                ? 'bg-white dark:bg-stone-800 text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Key Strengths ({ai.strengths.length})
          </button>
          <button
            onClick={() => setActiveSubTab('risks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'risks'
                ? 'bg-white dark:bg-stone-800 text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Trade Risks ({ai.risks.length})
          </button>
          <button
            onClick={() => setActiveSubTab('recommendation')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'recommendation'
                ? 'bg-white dark:bg-stone-800 text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Strategic Advisory
          </button>
        </div>
      </div>

      {/* Main Expansive Horizon Grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Columns: Dynamic Detailed AI Explanations */}
        <div className="lg:col-span-8 space-y-6">
          {activeSubTab === 'reasoning' && (
            <div className="space-y-4">
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/70">
                <div className="text-xs font-mono font-bold uppercase text-slate-400 mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  ai_explanation.reasoning
                </div>
                <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-line font-medium">
                  {ai.reasoning}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mb-2">
                    <BadgeCheck className="w-4 h-4 text-emerald-600" />
                    Market Viability Score
                  </div>
                  <div className="text-2xl font-black font-mono text-emerald-900">
                    {payload.viability_score} / 100
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-1 font-medium">
                    Calculated by Qwen-3 indexing FOB price, air transit, and local Pakistan retail elasticity.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/30">
                  <div className="flex items-center gap-2 text-blue-800 font-bold text-xs mb-2">
                    <Scale className="w-4 h-4 text-blue-600" />
                    FBR Tariff Schedule Compliance
                  </div>
                  <div className="text-2xl font-black font-mono text-blue-900">
                    {payload.duty_rate_percent}% Duty
                  </div>
                  <p className="text-[11px] text-blue-700 mt-1 font-medium">
                    Applicable under Pakistan Customs Tariff (PCT 2026) for {payload.category}.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'strengths' && (
            <div className="space-y-3">
              <div className="text-xs font-mono font-bold uppercase text-slate-400 mb-1">
                ai_explanation.strengths
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ai.strengths.map((str, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      ✓
                    </div>
                    <span className="text-xs font-semibold text-slate-800 leading-snug">{str}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'risks' && (
            <div className="space-y-3">
              <div className="text-xs font-mono font-bold uppercase text-slate-400 mb-1">
                ai_explanation.risks
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ai.risks.map((risk, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-amber-50/40 border border-amber-200/70 flex items-start gap-3">
                    <AlertOctagon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <span className="text-xs font-semibold text-slate-800 leading-snug">{risk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'recommendation' && (
            <div className="p-5 rounded-2xl bg-blue-50/40 border border-blue-200/70 space-y-3">
              <div className="text-xs font-mono font-bold uppercase text-blue-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Strategic Advisory Directive
              </div>
              <p className="text-slate-900 text-sm font-semibold leading-relaxed">
                "{ai.recommendation}"
              </p>
              <div className="pt-2 text-xs text-slate-500 font-mono">
                Suggested next milestone: Finalize supplier RFQ sample validation with Shenzhen trading agent before issuing LC.
              </div>
            </div>
          )}
        </div>

        {/* Right 4 Columns: High-Density Executive Callout Sidebar */}
        <div className="lg:col-span-4 bg-slate-50 rounded-2xl p-5 border border-slate-200/70 flex flex-col justify-between space-y-4">
          <div>
            <div className="text-xs font-mono font-bold uppercase text-slate-500 mb-3 flex items-center justify-between">
              <span>Sourcing Specification</span>
              <span className="text-blue-600 font-mono">{parameters.product_id}</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-500">Target Product:</span>
                <span className="font-bold text-slate-900 text-right truncate max-w-[170px]" title={payload.product_name}>
                  {payload.product_name}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-500">Order Quantity:</span>
                <span className="font-mono font-bold text-slate-900">{parameters.quantity} Units</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-500">SBP Exchange Peg:</span>
                <span className="font-mono font-bold text-slate-900">Rs 279.30 PKR / USD</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-500">Transit Gateway:</span>
                <span className="font-semibold text-slate-800">Shenzhen (SZX) ➔ KHI</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onOpenReportModal}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <span>Export Executive Trade Dossier</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
