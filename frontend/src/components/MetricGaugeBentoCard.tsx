import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Flame, 
  Activity,
  Award,
  Zap
} from 'lucide-react';
import { TradePayload, TradeParameters } from '../types';

interface MetricGaugeBentoCardProps {
  payload: TradePayload;
  parameters: TradeParameters;
  onOpenReportModal: () => void;
}

export const MetricGaugeBentoCard: React.FC<MetricGaugeBentoCardProps> = ({
  payload,
  parameters,
  onOpenReportModal,
}) => {
  const score = payload.viability_score;
  const confidence = payload.data_confidence;

  // Circular gauge calculations
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Semantic color based on score
  const getScoreColor = () => {
    if (score >= 80) return { ring: 'stroke-emerald-500', text: 'text-emerald-700', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (score >= 60) return { ring: 'stroke-blue-500', text: 'text-blue-700', badge: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (score >= 40) return { ring: 'stroke-amber-500', text: 'text-amber-700', badge: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { ring: 'stroke-rose-500', text: 'text-rose-700', badge: 'bg-rose-50 text-rose-700 border-rose-200' };
  };

  const colors = getScoreColor();

  return (
    <div 
      id="viability-metric-bento-card"
      className="col-span-12 xl:col-span-4 bg-white dark:bg-stone-800 rounded-2xl border border-slate-200/60 shadow-sm p-6 flex flex-col justify-between"
    >
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                FEASIBILITY ENGINE
              </span>
              <h3 className="text-sm font-bold text-slate-900 leading-none">
                Viability & Confidence
              </h3>
            </div>
          </div>

          <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${colors.badge}`}>
            {confidence} CONFIDENCE
          </span>
        </div>

        {/* Circular SVG Gauge Visual */}
        <div className="flex items-center justify-center py-3">
          <div className="relative flex items-center justify-center">
            <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 120 120">
              {/* Background Circle */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="stroke-slate-100"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Animated Value Arc */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                className={`${colors.ring} transition-all duration-700 ease-out`}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Centered Readout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Score</span>
              <span className={`text-3xl font-black font-mono tracking-tight ${colors.text}`}>
                {score}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">out of 100</span>
            </div>
          </div>
        </div>

        {/* Risk Summary Highlight */}
        <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-slate-700">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="font-mono text-[10px] uppercase text-slate-500">risk_summary</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            {payload.risk_summary}
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="text-[11px] font-mono text-slate-400">
          Confidence: <span className="font-bold text-slate-700">{payload.analysis.ai_explanation.confidence.toUpperCase()}</span>
        </div>
        <button
          onClick={onOpenReportModal}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors cursor-pointer"
        >
          View Full Dossier
        </button>
      </div>
    </div>
  );
};
