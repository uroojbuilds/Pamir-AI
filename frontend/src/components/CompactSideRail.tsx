import React from 'react';
import { 
  Layers, 
  Send, 
  FileSpreadsheet, 
  History, 
  Grid3X3,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { ActiveNavTab } from '../types';
import { PamirLogo } from './PamirLogo';

interface CompactSideRailProps {
  activeTab: ActiveNavTab;
  onTabChange: (tab: ActiveNavTab) => void;
  productCount: number;
}

export const CompactSideRail: React.FC<CompactSideRailProps> = ({
  activeTab,
  onTabChange,
  productCount,
}) => {
  const navItems: { id: ActiveNavTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'sourcing',
      label: 'Trade Command Canvas',
      icon: <Layers className="w-4 h-4" />,
    },
    {
      id: 'rfqs',
      label: 'Supplier RFQ Engine',
      icon: <Send className="w-4 h-4" />,
    },
    {
      id: 'tariff',
      label: 'FBR Tariff Explorer',
      icon: <FileSpreadsheet className="w-4 h-4" />,
    },
    {
      id: 'catalog',
      label: 'China Lots Directory',
      icon: <Grid3X3 className="w-4 h-4" />,
    },
    {
      id: 'audit',
      label: 'System Audit Trail',
      icon: <History className="w-4 h-4" />,
    },
  ];

  return (
    <aside 
      id="saas-desktop-side-rail"
      className="w-full h-full min-h-screen bg-white dark:bg-stone-800 border-r border-stone-200/90 p-5 flex flex-col justify-between shrink-0 select-none text-stone-900 dark:text-stone-100"
    >
      <div>
        {/* Workspace Brand Box */}
        <div className="p-4 mb-6 bg-[#FAF8F5] dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-2xs">
          <PamirLogo size="sm" showText={true} />
          <div className="mt-3 pt-2.5 border-t border-stone-200 dark:border-stone-700 flex items-center justify-between">
            <span className="text-[10px] text-[#6B5B4F] font-mono font-bold truncate">
              CPEC Corridor ID #569236
            </span>
            <span className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse shrink-0 ml-1.5" />
          </div>
        </div>

        {/* Primary Navigation Links */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-[#6B5B4F] px-3 py-1 mb-1">
            Command Modules
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`
                  w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-bold text-xs transition-all duration-150 cursor-pointer
                  ${isActive 
                    ? 'bg-amber-50 text-[#C2410C] border border-amber-200/90 shadow-2xs' 
                    : 'text-stone-700 dark:text-stone-300 hover:bg-[#FAF8F5] dark:bg-stone-900 hover:text-stone-950 dark:text-stone-50 border border-transparent'}
                `}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className={isActive ? 'text-[#EA580C]' : 'text-stone-400 dark:text-stone-500'}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>

                {item.id === 'catalog' && (
                  <span className="ml-2 text-[10px] font-mono bg-white dark:bg-stone-800 text-[#C2410C] font-black px-2 py-0.5 rounded-md border border-stone-200 dark:border-stone-700">
                    {productCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SBP Baseline Reference Widget */}
      <div className="mt-8 pt-4 border-t border-stone-200 dark:border-stone-700">
        <div className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs space-y-1.5 shadow-2xs">
          <div className="flex items-center justify-between font-mono text-[10px] text-[#6B5B4F] font-bold">
            <span>SBP VALUATION BASELINE</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-stone-600 dark:text-stone-400 text-xs font-semibold">USD / PKR</span>
            <span className="font-mono font-black text-stone-900 dark:text-stone-100 text-sm">Rs 279.30</span>
          </div>
          <div className="flex items-baseline justify-between pt-1 border-t border-stone-200 dark:border-stone-700 text-[11px]">
            <span className="text-stone-600 dark:text-stone-400 font-semibold">USD / CNY</span>
            <span className="font-mono font-bold text-[#C2410C]">¥ 6.72</span>
          </div>
        </div>
      </div>
    </aside>
  );
};