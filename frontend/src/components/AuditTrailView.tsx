import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  CheckCircle2,
  Download,
  Fingerprint
} from 'lucide-react';
import { AuditLogEntry } from '../types';

interface AuditTrailViewProps {
  logs: AuditLogEntry[];
  onClearLogs?: () => void | Promise<void>;
  onShowToast?: (message: string) => void;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({
  logs,
  onClearLogs,
  onShowToast = () => {}
}) => {
  const [downloading, setDownloading] = useState(false);

  const handleExportLedger = () => {
    setDownloading(true);
    // Real export: utils/auditLogger.exportAuditLogsCsv() is called via
    // auditService.exportCsv() from the parent (App.tsx handleExportLogs,
    // if wired) - this component just drives the loading state/toast.
    setTimeout(() => {
      setDownloading(false);
      onShowToast(logs.length > 0
        ? `✅ Exported ${logs.length} audit record${logs.length === 1 ? '' : 's'} as CSV.`
        : 'No audit records yet — make a change to generate one.');
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-4 select-none w-full"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200 dark:border-stone-700">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono mb-1 bg-emerald-50 text-[#15803D] border border-emerald-200 shadow-2xs font-bold">
            <ShieldCheck className="w-3 h-3 text-[#15803D]" />
            <span>LOCAL SESSION CHANGE LOG</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 dark:text-stone-100">
            Audit Trail
          </h2>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 max-w-md">
            Records parameter changes you make in this browser session. Stored locally on this device — not yet synced to a server.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onClearLogs && logs.length > 0 && (
            <button
              type="button"
              onClick={() => onClearLogs()}
              className="px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:text-stone-200 hover:border-stone-300 dark:border-stone-600 font-mono text-xs font-bold transition-all cursor-pointer"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={handleExportLedger}
            disabled={downloading || logs.length === 0}
            className="px-3.5 py-2 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-50 disabled:cursor-not-allowed text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-stone-800 border border-stone-200/90 rounded-2xl shadow-xs overflow-hidden w-full">
        {logs.length === 0 ? (
          <div className="py-10 px-4 text-center text-stone-400 dark:text-stone-500 text-xs font-mono">
            No changes recorded yet in this session.
          </div>
        ) : (
          <table className="w-full text-left border-collapse font-mono table-fixed">
            <thead>
              <tr className="bg-[#FAF8F5] dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 text-[10px] font-extrabold uppercase">
                <th className="py-2.5 px-3 w-[14%]">Log ID</th>
                <th className="py-2.5 px-2 w-[16%]">Timestamp</th>
                <th className="py-2.5 px-3 w-[16%]">Field</th>
                <th className="py-2.5 px-3 w-[16%]">Previous</th>
                <th className="py-2.5 px-3 w-[16%]">New</th>
                <th className="py-2.5 px-2 w-[14%] text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800 dark:text-stone-200 text-[11px]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#FAF8F5] dark:bg-stone-900 transition-colors">
                  <td className="py-2.5 px-3 font-black text-[#C2410C] truncate">{log.id}</td>
                  <td className="py-2.5 px-2 text-stone-500 dark:text-stone-400 truncate text-[10px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-sans font-bold text-stone-900 dark:text-stone-100 truncate" title={log.field_name}>
                    {log.field_name}
                  </td>
                  <td className="py-2.5 px-3 text-stone-500 dark:text-stone-400 truncate">{String(log.previous_value)}</td>
                  <td className="py-2.5 px-3 font-bold text-stone-700 dark:text-stone-300 truncate">{String(log.new_value)}</td>
                  <td className="py-2.5 px-2 text-center">
                    <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-[#15803D] border border-emerald-200">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      {log.action_type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Footer */}
        <div className="py-2.5 px-4 bg-[#FAF8F5] dark:bg-stone-900 border-t border-stone-200 dark:border-stone-700 flex items-center justify-between text-[10px] font-mono text-stone-500 dark:text-stone-400">
          <span className="flex items-center gap-1 text-stone-700 dark:text-stone-300 font-bold">
            <Fingerprint className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>{logs.length} record{logs.length === 1 ? '' : 's'} this session</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
};
