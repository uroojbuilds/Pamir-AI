import React from 'react';
import { Sparkles, CheckCircle2, AlertCircle, ShieldAlert, Lightbulb, Bot, Terminal, Copy, Check } from 'lucide-react';
import { AiExplanation } from '../types';

interface AiContextSheetProps {
  aiExplanation: AiExplanation;
  productName: string;
  productId: string;
  onCopyReasoning: () => void;
  isCopied: boolean;
}

export const AiContextSheet: React.FC<AiContextSheetProps> = ({
  aiExplanation,
  productName,
  productId,
  onCopyReasoning,
  isCopied,
}) => {
  const {
    reasoning,
    strengths,
    risks,
    warnings,
    recommendation,
    confidence
  } = aiExplanation;

  return (
    <div 
      id="wide-ai-context-sheet"
      className="col-span-1 lg:col-span-3 bg-white dark:bg-stone-800 p-6 rounded-xl border border-slate-200/60 shadow-sm"
    >
      {/* Header bar with Qwen 3 badge and copy shortcut */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                WIDGET 03 // QWEN REASONING LAYER
              </span>
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Confidence: {confidence}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              Comprehensive Trade Feasibility Analysis: <span className="text-indigo-700">{productName}</span>
            </h2>
          </div>
        </div>

        {/* Quick Action Anchor to Copy AI Analysis */}
        <button
          onClick={onCopyReasoning}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all cursor-pointer shadow-2xs"
          title="Copy reasoning text to clipboard"
        >
          {isCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-bold">Copied to Clipboard</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>Copy Analysis</span>
            </>
          )}
        </button>
      </div>

      {/* Main Grounded Reasoning Text Row with plenty of breathing room */}
      <div className="mb-6 bg-slate-50/70 p-5 rounded-xl border border-slate-200/70">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-indigo-600" />
          Executive Sourcing Evaluation
        </div>
        <p className="text-sm text-slate-800 leading-relaxed font-normal">
          {reasoning}
        </p>
      </div>

      {/* Grid of Strengths, Risks & Warnings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Column 1: Key Sourcing Strengths */}
        <div className="bg-white dark:bg-stone-800 p-4 rounded-xl border border-emerald-100 bg-emerald-50/20">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wide mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Competitive Advantages
          </div>
          <ul className="space-y-2.5">
            {strengths.map((item, idx) => (
              <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 2: Corridors & Cost Risks */}
        <div className="bg-white dark:bg-stone-800 p-4 rounded-xl border border-amber-100 bg-amber-50/20">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wide mb-3">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            Trade & Margin Risks
          </div>
          <ul className="space-y-2.5">
            {risks.map((item, idx) => (
              <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: FBR & Customs Compliance Warnings */}
        <div className="bg-white dark:bg-stone-800 p-4 rounded-xl border border-rose-100 bg-rose-50/20">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-800 uppercase tracking-wide mb-3">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            Customs Clearance Warnings
          </div>
          <ul className="space-y-2.5">
            {warnings.map((item, idx) => (
              <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Actionable Strategy Recommendation */}
      <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 flex items-start gap-3">
        <Lightbulb className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <div className="text-xs font-bold text-blue-900 uppercase tracking-wide mb-0.5">
            Architect Recommendation
          </div>
          <p className="text-xs text-blue-800 leading-relaxed font-medium">
            {recommendation}
          </p>
        </div>
      </div>
    </div>
  );
};
