import React from 'react';
import { 
  Building2, 
  Layers, 
  History, 
  Sparkles, 
  RotateCcw, 
  ShieldCheck, 
  Activity,
  Globe2,
  Lock
} from 'lucide-react';

interface SystemStatusHeaderProps {
  onOpenAuditLog: () => void;
  onResetToDock: () => void;
  auditCount: number;
  activeProductId: string;
}

export const SystemStatusHeader: React.FC<SystemStatusHeaderProps> = ({
  onOpenAuditLog,
  onResetToDock,
  auditCount,
  activeProductId,
}) => {
  return (
    <header 
      id="saas-system-status-header"
      className="bg-white dark:bg-stone-800 border-b border-slate-200/80 px-6 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs"
    >
      {/* Brand & Connection Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-sm">
            P<span className="text-blue-400">AI</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900 tracking-tight">
                PamirAI Trade Intelligence
              </span>
              <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                FastAPI Synchronized
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Global SaaS System Status & Actions */}
      <div className="flex items-center gap-3 text-xs">
        {/* Active SKU Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 font-mono">
          <span className="text-slate-400 text-[11px]">ACTIVE LOT:</span>
          <span className="font-bold text-blue-700">{activeProductId}</span>
        </div>

        {/* Audit Log Trigger Button */}
        <button
          onClick={onOpenAuditLog}
          className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 font-semibold transition-colors cursor-pointer"
        >
          <History className="w-3.5 h-3.5 text-slate-500" />
          <span>Audit Log</span>
          <span className="bg-slate-200 text-slate-800 font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold">
            {auditCount}
          </span>
        </button>

        {/* Return to Parameter Dock */}
        <button
          onClick={onResetToDock}
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-lg font-bold transition-all shadow-2xs cursor-pointer"
        >
          <RotateCcw className="w-3 h-3 text-blue-400" />
          <span>Edit Parameters</span>
        </button>
      </div>
    </header>
  );
};
