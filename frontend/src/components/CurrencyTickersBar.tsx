import React from 'react';
import { RefreshCw, Settings, ShieldCheck, Activity } from 'lucide-react';
import { ExchangeRatesData } from '../types';
import { PamirLogo } from './PamirLogo';
import { ThemeToggle } from './ThemeToggle';

interface CurrencyTickersBarProps {
  onOpenAuditLog?: () => void;
  auditCount?: number;
  rates: ExchangeRatesData;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  lastUpdated?: string;
}

export const CurrencyTickersBar: React.FC<CurrencyTickersBarProps> = ({
  onOpenAuditLog,
  auditCount = 0,
  rates,
  isRefreshing = false,
  onRefresh,
  lastUpdated,
}) => {
  const usdPkr = rates?.USD_PKR_INTERBANK ? rates.USD_PKR_INTERBANK.toFixed(2) : '279.30';
  const openMarket = rates?.USD_PKR_OPEN_MARKET ? rates.USD_PKR_OPEN_MARKET.toFixed(2) : '278.50';
  const usdCny = rates?.USD_CNY ? rates.USD_CNY.toFixed(2) : '6.72';

  return (
    <div 
      id="global-currency-tickers-bar"
      className="bg-white dark:bg-[#1A1612] border-b border-stone-200/90 dark:border-stone-800 px-6 py-3 sticky top-0 z-30 shadow-xs text-stone-900 dark:text-[#FAF8F3] select-none transition-colors duration-200"
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-4 pb-2.5 border-b border-stone-100 dark:border-stone-800">
        
        <div className="flex items-center gap-3 shrink-0">
          <PamirLogo size="sm" showText={true} />
          <span className="text-[11px] font-mono text-[#6B5B4F] dark:text-stone-400 hidden lg:inline border-l border-stone-200 dark:border-stone-700 pl-3 font-semibold">
            Digital Trade Terminal · HS Tariff Engine
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {lastUpdated && (
            <span className="text-[11px] font-mono text-[#6B5B4F] dark:text-stone-400 hidden md:inline font-medium">
              {lastUpdated}
            </span>
          )}

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh SBP Forex Rates"
              className="text-xs text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white font-bold px-3 py-1.5 rounded-xl bg-[#FAF8F5] dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#C2410C] dark:text-[#FB923C]' : 'text-stone-500 dark:text-stone-400'}`} />
              <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Sync SBP Rates'}</span>
            </button>
          )}

          {onOpenAuditLog && (
            <button
              type="button"
              onClick={onOpenAuditLog}
              className="text-xs text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white font-bold px-3 py-1.5 rounded-xl bg-[#FAF8F5] dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Settings className="w-3.5 h-3.5 text-[#C2410C]" />
              <span>Audit Ledger</span>
              {auditCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 text-[10px] font-mono font-black">
                  {auditCount}
                </span>
              )}
            </button>
          )}
          <ThemeToggle />
        </div>
      </div>

      {/* Ticker Row: High-Contrast FinTech Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2.5">
        
        {/* SBP Interbank */}
        <div className="flex items-center justify-between gap-2 bg-[#FAF8F5] dark:bg-stone-900 border border-stone-200/90 dark:border-stone-700 px-3.5 py-2 rounded-xl text-xs font-mono shadow-2xs">
          <span className="text-[#6B5B4F] dark:text-stone-400 text-xs font-bold">SBP Interbank:</span>
          <div className="flex items-center gap-2">
            <span className="font-black text-stone-900 dark:text-[#FAF8F3] text-sm tracking-tight">
              USD / PKR = Rs {usdPkr}
            </span>
            <span className="bg-emerald-50 text-[#15803D] border border-emerald-200/80 text-[10px] font-extrabold px-2 py-0.5 rounded-md inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] animate-pulse" />
              <span>Official SBP</span>
            </span>
          </div>
        </div>

        {/* Open Market */}
        <div className="flex items-center justify-between gap-2 bg-[#FAF8F5] dark:bg-stone-900 border border-stone-200/90 dark:border-stone-700 px-3.5 py-2 rounded-xl text-xs font-mono shadow-2xs">
          <span className="text-[#6B5B4F] dark:text-stone-400 text-xs font-bold">Open Market Mid:</span>
          <div className="flex items-center gap-2">
            <span className="font-black text-stone-900 dark:text-[#FAF8F3] text-sm tracking-tight">
              USD / PKR = Rs {openMarket}
            </span>
            <span className="bg-amber-50 text-amber-800 border border-amber-200/80 text-[10px] font-extrabold px-2 py-0.5 rounded-md inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Market Ref</span>
            </span>
          </div>
        </div>

        {/* Foreign Cross-Rate */}
        <div className="flex items-center justify-between gap-2 bg-[#FAF8F5] dark:bg-stone-900 border border-stone-200/90 dark:border-stone-700 px-3.5 py-2 rounded-xl text-xs font-mono shadow-2xs">
          <span className="text-[#6B5B4F] dark:text-stone-400 text-xs font-bold">China PBOC Cross:</span>
          <div className="flex items-center gap-2">
            <span className="font-black text-[#C2410C] text-sm tracking-tight">
              USD / CNY = ¥ {usdCny}
            </span>
            <span className="bg-orange-50 text-[#C2410C] border border-orange-200/80 text-[10px] font-extrabold px-2 py-0.5 rounded-md inline-flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-[#EA580C]" />
              <span>Indicative FX</span>
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};