import React, { useState } from 'react';
import { PamirLogo } from './PamirLogo';
import { 
  ShieldCheck, 
  ArrowRight, 
  Package, 
  TrendingUp, 
  Sparkles, 
  Sun, 
  Moon, 
  Clock, 
  Weight, 
  Cpu, 
  CheckCircle2 
} from 'lucide-react';

export const ThemePreviewModal: React.FC = () => {
  const [isDarkVariant, setIsDarkVariant] = useState(false);

  return (
    <div className={`w-full transition-colors duration-200 p-6 lg:p-10 border-b select-none ${
      isDarkVariant 
        ? 'bg-[#1A1612] text-[#FAF8F3] border-stone-800' 
        : 'bg-[#FAF8F3] text-stone-900 border-stone-200'
    }`}>
      
      {/* Header Banner with Pitch Narrative & Mode Switcher */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200/60 dark:border-stone-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono mb-2 border shadow-2xs bg-amber-500/10 text-amber-700 border-amber-600/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-bold uppercase tracking-wider">The CPEC Palette · Silk Route Terminal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Pakistan-China Digital Trade Corridor
          </h2>
          <p className="text-xs sm:text-sm mt-1 max-w-2xl text-stone-600">
            Terracotta for China’s industrial OEM supply chains, Forest Green for Pakistani trade compliance, and Silk Saffron across a warm, anti-glare canvas.
          </p>
        </div>

        {/* Demo Room Mode Switcher */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsDarkVariant(!isDarkVariant)}
            className={`px-4 py-2.5 rounded-2xl font-mono text-xs font-bold flex items-center gap-2 border shadow-sm transition-all cursor-pointer ${
              isDarkVariant
                ? 'bg-[#252019] text-amber-400 border-amber-500/40 hover:bg-[#2e2820]'
                : 'bg-white text-stone-800 border-stone-300 hover:bg-stone-50'
            }`}
          >
            {isDarkVariant ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Switch to Warm Silk Daylight</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-stone-600" />
                <span>Demo-Room Dark Variant</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Showcase Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-6">
        
        {/* Left Column: Palette Token Architecture & Contrast Ledger */}
        <div className={`lg:col-span-5 p-6 rounded-3xl border shadow-sm space-y-4 ${
          isDarkVariant ? 'bg-[#252019] border-stone-800' : 'bg-white border-stone-200'
        }`}>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600 font-bold">
              Token Architecture & WCAG Standards
            </span>
            <h3 className="text-lg font-extrabold mt-0.5">Geopolitical Color Ledger</h3>
            <p className="text-xs text-stone-500 mt-1">
              Engineered with high contrast ratios (&gt;4.5:1) for auditoriums and projectors.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="p-3 rounded-2xl border border-stone-200 bg-[#FAF8F3] text-stone-900 shadow-2xs">
              <span className="text-[10px] font-bold block">Warm Silk Canvas</span>
              <span className="text-[9px] font-mono text-stone-500">#FAF8F3 · Anti-Glare</span>
            </div>
            <div className="p-3 rounded-2xl border border-stone-200 bg-white text-stone-900 shadow-2xs">
              <span className="text-[10px] font-bold block">Elevated Card</span>
              <span className="text-[9px] font-mono text-stone-500">#FFFFFF · Pure Contrast</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#C2410C] text-white shadow-2xs">
              <span className="text-[10px] font-bold block">Terracotta (Text)</span>
              <span className="text-[9px] font-mono text-orange-200">#C2410C · AA Compliant</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#15803D] text-white shadow-2xs">
              <span className="text-[10px] font-bold block">Pakistan Forest</span>
              <span className="text-[9px] font-mono text-emerald-200">#15803D · FBR Verified</span>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-200/60 dark:border-stone-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-stone-500">Projector Canvas:</span>
              <span className="font-bold text-amber-600">Zero Whiteout Glare</span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-stone-500">AI Intelligence Core:</span>
              <span className="font-bold text-emerald-600">Qwen-2.5-Trade Embedded</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Mock B2B Terminal Card with 7 Critical Fixes */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500">
              Live Mock UI · Trade Command Card
            </span>
            <span className="text-[11px] font-mono font-semibold text-amber-700 dark:text-amber-400">
              {isDarkVariant ? 'Demo-Room Dark Active (#1A1612)' : 'Warm Silk Daylight Active (#FAF8F3)'}
            </span>
          </div>

          {/* Actual Card Container */}
          <div className={`rounded-3xl p-6 border shadow-lg space-y-5 transition-all ${
            isDarkVariant 
              ? 'bg-[#252019] border-stone-800 text-[#FAF8F3]' 
              : 'bg-white border-stone-200 text-stone-900'
          }`}>
            
            {/* Header: Logo & Capital Badge */}
            <div className="flex items-center justify-between pb-3.5 border-b border-stone-100 dark:border-stone-800">
              <PamirLogo size="sm" showText={true} />
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border shadow-2xs ${
                isDarkVariant 
                  ? 'bg-amber-950/40 text-amber-400 border-amber-800/60' 
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                PKR 80,000 Capital Allocated
              </span>
            </div>

            {/* Inner Product Tile */}
            <div className={`p-4 rounded-2xl space-y-3.5 border shadow-inner ${
              isDarkVariant 
                ? 'bg-[#1e1a14] border-stone-800' 
                : 'bg-[#FAF8F5] border-stone-200/80'
            }`}>
              
              {/* Row 1: Badges & Title */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* HS Code */}
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border shadow-2xs ${
                      isDarkVariant 
                        ? 'bg-stone-900 text-stone-300 border-stone-700' 
                        : 'bg-white text-stone-700 border-stone-200'
                    }`}>
                      HS 8518.30
                    </span>

                    {/* Verified FBR in Forest Green */}
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                      isDarkVariant 
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80' 
                        : 'bg-emerald-50 text-[#15803D] border-emerald-200'
                    }`}>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>VERIFIED FBR VALUATION</span>
                    </span>

                    {/* AI Engine Tag */}
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                      isDarkVariant
                        ? 'bg-amber-950/50 text-amber-300 border-amber-800/60'
                        : 'bg-amber-50 text-[#C2410C] border-amber-200'
                    }`}>
                      <Cpu className="w-3 h-3 text-amber-600" />
                      <span>Qwen-2.5 AI Validated</span>
                    </span>
                  </div>

                  {/* High Hierarchy Title */}
                  <h4 className="font-extrabold text-lg tracking-tight pt-1">
                    TWS Wireless Earbuds (ANC 35dB)
                  </h4>
                  <p className="text-xs font-medium text-[#6B5B4F] dark:text-stone-400">
                    Shenzhen Bochen Audio Co., Ltd · 50 Unit Trial Batch
                  </p>
                </div>

                {/* Package Icon Pill */}
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border shadow-xs ${
                  isDarkVariant 
                    ? 'bg-stone-900 border-stone-700 text-amber-400' 
                    : 'bg-white border-stone-200 text-orange-600'
                }`}>
                  <Package className="w-5 h-5" />
                </div>
              </div>

              {/* Row 2: Landed Cost Financial Metrics */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-stone-200/80 dark:border-stone-800">
                <div>
                  <span className="text-[10px] font-mono block font-bold text-stone-500 uppercase">
                    UNIT LANDED COST
                  </span>
                  <span className="text-base font-black font-mono text-[#C2410C] dark:text-orange-400">
                    Rs 505 <span className="text-xs font-bold text-stone-500">/ pc</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono block font-bold text-stone-500 uppercase">
                    CIF KARACHI (TOTAL)
                  </span>
                  <span className="text-base font-black font-mono">
                    Rs 25,276
                  </span>
                </div>
              </div>

              {/* Row 3: Expanded Logistics & Cargo Telemetry (Fix #5) */}
              <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-stone-200/60 dark:border-stone-800/80 text-xs">
                <div className="flex items-center gap-1.5 font-mono text-stone-600 dark:text-stone-400">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Lead Time: <strong className="text-stone-800 dark:text-stone-200">12-18 days</strong></span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-stone-600 dark:text-stone-400">
                  <Weight className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cargo Weight: <strong className="text-stone-800 dark:text-stone-200">7.5 kg (Air)</strong></span>
                </div>
              </div>

            </div>

            {/* Viability & Guarantee Footer */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#15803D] dark:text-emerald-400" />
                <span className="text-xs font-bold text-[#15803D] dark:text-emerald-400">
                  ✨ AI-Analyzed · 80/100 Viability · High Margin
                </span>
              </div>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border flex items-center gap-1 ${
                isDarkVariant 
                  ? 'bg-stone-900 border-stone-700 text-stone-300' 
                  : 'bg-[#FAF8F5] border-stone-200 text-stone-700'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Trade Assurance</span>
              </span>
            </div>

            {/* Action-Oriented CTA (Fix #2) */}
            <button
              type="button"
              className="w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer bg-[#EA580C] hover:bg-[#C2410C] text-white active:scale-[0.99]"
            >
              <span>START IMPORT JOURNEY</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>
        </div>

      </div>
    </div>
  );
};