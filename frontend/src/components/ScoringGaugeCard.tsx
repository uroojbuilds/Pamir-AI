import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle, Info, Sparkles } from 'lucide-react';
import { TradeAiAnalysis } from '../types';

interface ScoringGaugeCardProps {
  analysis: TradeAiAnalysis;
}

export const ScoringGaugeCard: React.FC<ScoringGaugeCardProps> = ({ analysis }) => {
  const {
    viability_score,
    data_confidence,
    risk_summary,
    trade_assurance_status,
    moq_level
  } = analysis;

  // Gauge calculation for circle SVG
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (viability_score / 100) * circumference;

  // Semantic color logic
  const isHigh = viability_score >= 75;
  const isMedium = viability_score >= 50 && viability_score < 75;

  const scoreColor = isHigh 
    ? 'text-emerald-600' 
    : (isMedium ? 'text-blue-600' : 'text-amber-600');

  const strokeColor = isHigh 
    ? '#10b981' 
    : (isMedium ? '#2563eb' : '#f59e0b');

  const riskBoxStyle = isHigh
    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
    : (isMedium ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-amber-50 border-amber-200 text-amber-900');

  const RiskIcon = isHigh ? CheckCircle : AlertTriangle;

  return (
    <div 
      id="scoring-gauge-card"
      className="col-span-1 bg-white dark:bg-stone-800 p-5 rounded-xl border border-slate-200/60 shadow-sm flex flex-col justify-between"
    >
      <div>
        {/* Widget Subheader */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
            WIDGET 02 // VIABILITY
          </span>
          <span className="text-[11px] text-slate-400 font-mono font-medium">FastAPI Engine</span>
        </div>

        <h2 className="text-base font-bold text-slate-900 mb-4">
          Trade Viability Score
        </h2>

        {/* Circular Gauge and Metrics Center */}
        <div className="flex items-center justify-center my-2">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG Ring Gauge */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              {/* Background Track */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="stroke-slate-100"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Animated Progress Ring */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke={strokeColor}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Inner Center Score Display */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className={`text-3xl font-extrabold font-mono tracking-tight ${scoreColor}`}>
                {viability_score}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400">
                / 100 Index
              </span>
            </div>
          </div>
        </div>

        {/* Semantically Colored Warning/Success Box */}
        <div className={`mt-3 p-3.5 rounded-xl border ${riskBoxStyle} text-xs transition-all duration-300`}>
          <div className="flex items-start gap-2">
            <RiskIcon className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold mb-0.5">
                {isHigh ? 'High Viability Opportunity' : (isMedium ? 'Moderate Sourcing Risk' : 'High Vigilance Required')}
              </div>
              <p className="text-[11px] leading-relaxed opacity-90 font-medium">
                {risk_summary}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Confidence & Trade Assurance Signal Badges */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-500 font-medium">Data Confidence:</span>
          <span className={`
            font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded border
            ${data_confidence === 'verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'}
          `}>
            {data_confidence}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[11px] text-slate-500 font-medium">MOQ:</span>
          <span className="font-mono text-[11px] font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
            {moq_level}
          </span>
        </div>
      </div>
    </div>
  );
};
