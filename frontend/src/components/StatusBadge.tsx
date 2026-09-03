import React from 'react';

interface StatusBadgeProps {
  status?: string | null;
  className?: string;
}

/**
 * Visual badge conversion engine hiding all raw database strings.
 * - 'verified' -> 🟢 Official Data
 * - 'curated' -> 🔵 Market Reference
 * - 'incomplete' -> ⚠️ Needs Verification
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const norm = (status || '').toLowerCase().trim();

  if (norm === 'verified') {
    return (
      <span className={`bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${className}`}>
        <span>🟢</span>
        <span>Official Data</span>
      </span>
    );
  }

  if (norm === 'curated') {
    return (
      <span className={`bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${className}`}>
        <span>🔵</span>
        <span>Market Reference</span>
      </span>
    );
  }

  // default / incomplete / fallback
  return (
    <span className={`bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${className}`}>
      <span>⚠️</span>
      <span>Needs Verification</span>
    </span>
  );
};

interface DutySourceBadgeProps {
  source?: string | null;
  className?: string;
}

/**
 * Duty rate source badge conversion engine:
 * - 'confirmed' -> 🔒 Tariff Matched
 * - 'default_fallback' (or others) -> ⚡ Indicative Estimate
 */
export const DutySourceBadge: React.FC<DutySourceBadgeProps> = ({ source, className = '' }) => {
  const norm = (source || '').toLowerCase().trim();

  if (norm === 'confirmed') {
    return (
      <span className={`bg-teal-50 text-teal-700 border border-teal-200 text-[11px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${className}`}>
        <span>🔒</span>
        <span>Tariff Matched</span>
      </span>
    );
  }

  return (
    <span className={`bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${className}`}>
      <span>⚡</span>
      <span>Indicative Estimate</span>
    </span>
  );
};
