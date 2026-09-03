import React from 'react';
import { 
  X, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  ShieldCheck, 
  CheckCircle2,
  Calendar,
  Building2
} from 'lucide-react';
import { TradePayload, TradeParameters } from '../types';
import { getProductById } from '../utils/calculator';

interface CargoReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: TradePayload;
  parameters: TradeParameters;
  onExportPdf: () => void;
}

export const CargoReportModal: React.FC<CargoReportModalProps> = ({
  isOpen,
  onClose,
  payload,
  parameters,
  onExportPdf,
}) => {
  if (!isOpen) return null;

  const currentProduct = getProductById(parameters.product_id || payload.product_id);
  const calc = payload.calculations;
  const docId = `CARGO-REP-${currentProduct.product_id}-20260901`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs select-none">
      <div 
        id="cargo-feasibility-dossier"
        className="bg-white dark:bg-stone-800 border border-stone-200/90 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]"
      >
        {/* Top Action Header Bar */}
        <div className="bg-[#1E293B] text-white px-6 py-4 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-4 h-4 text-[#EA580C]" />
            <span className="font-mono text-xs font-bold tracking-tight">
              Cargo Import Feasibility Dossier
            </span>
            <span className="font-mono text-[10px] text-stone-400 dark:text-stone-500 hidden sm:inline">
              [{docId}]
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onExportPdf}
              className="px-3.5 py-1.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 dark:text-stone-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Paper Body */}
        <div className="p-8 space-y-6 overflow-y-auto bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-sans">
          
          {/* Document Masthead */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-700">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight font-mono text-stone-950 dark:text-stone-50">
                  PAMIR.AI
                </h1>
                <span className="text-[#EA580C] font-black text-xl font-mono">//</span>
                <span className="text-xl font-extrabold tracking-tight text-stone-800 dark:text-stone-200 font-mono">
                  TRADE DOSSIER
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-mono mt-0.5">
                Pakistan-China Cross-Border Sourcing & Landed Cost Planning Estimate
              </p>
            </div>

            <div className="text-right text-[11px] font-mono text-stone-500 dark:text-stone-400">
              <div className="font-bold text-stone-900 dark:text-stone-100">DOC: {docId}</div>
              <div>9/2/2026, 4:37:56 AM</div>
              <div className="text-[#C2410C] font-bold">Planning Model: SBP / FBR Reference</div>
            </div>
          </div>

          {/* 4 Metric Summary Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#FAF8F5] dark:bg-stone-900 border border-stone-200 dark:border-stone-700 font-mono text-xs">
            <div>
              <span className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase block">Product SKU</span>
              <span className="text-sm font-extrabold text-stone-900 dark:text-stone-100">{currentProduct.product_id}</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase block">Lot Quantity</span>
              <span className="text-sm font-extrabold text-stone-900 dark:text-stone-100">{parameters.quantity || currentProduct.moq || 50} Units</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase block">FBR Tariff PCT</span>
              <span className="text-sm font-black text-[#EA580C]">{calc.duty_rate_percent || 20}% Duty</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase block">Viability Index</span>
              <span className="text-sm font-black text-[#15803D]">{payload.viability_score || 80} / 100</span>
            </div>
          </div>

          {/* Commodity Details */}
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 block mb-1">
              Commodity Description
            </span>
            <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
              {currentProduct.product_name}
            </h2>
          </div>

          {/* Landed Cost Breakdown Table */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 block">
              Estimated Landed Cost Breakdown
            </span>

            <div className="border border-stone-200 dark:border-stone-700 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-[#FAF8F5] dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 font-bold uppercase text-[11px]">
                    <th className="py-3 px-4">Cost Component</th>
                    <th className="py-3 px-4">Basis / Calculation Model</th>
                    <th className="py-3 px-4 text-right">Amount (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800 dark:text-stone-200">
                  <tr>
                    <td className="py-3 px-4 font-bold text-stone-900 dark:text-stone-100">Factory Product Cost (FOB)</td>
                    <td className="py-3 px-4 text-stone-500 dark:text-stone-400">
                      {parameters.quantity || 50} pcs @ USD {(currentProduct.supplier_price || 1.30).toFixed(2)} FOB
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-stone-900 dark:text-stone-100">
                      Rs {calc.product_cost_pkr.toLocaleString()}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-bold text-stone-900 dark:text-stone-100">Air Freight Cargo (Karachi Hub)</td>
                    <td className="py-3 px-4 text-stone-500 dark:text-stone-400">
                      {calc.weight_used_kg} kg @ $5.00/kg (Air Freight)
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-stone-900 dark:text-stone-100">
                      Rs {calc.shipping_cost_pkr.toLocaleString()}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-bold text-stone-900 dark:text-stone-100">FBR Customs Duty Surcharge</td>
                    <td className="py-3 px-4 text-stone-500 dark:text-stone-400">
                      {calc.duty_rate_percent}% on CIF valuation base (Rs {(calc.product_cost_pkr + calc.shipping_cost_pkr).toLocaleString()})
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-[#EA580C]">
                      Rs {calc.customs_cost_pkr.toLocaleString()}
                    </td>
                  </tr>

                  <tr className="bg-[#FAF8F5] dark:bg-stone-900 font-black border-t border-stone-200 dark:border-stone-700">
                    <td className="py-3.5 px-4 text-stone-900 dark:text-stone-100 uppercase">TOTAL ESTIMATED LANDED COST</td>
                    <td className="py-3.5 px-4 text-stone-500 dark:text-stone-400 font-medium">
                      Per Unit: Rs {calc.unit_landed_cost_pkr.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right text-base text-[#15803D]">
                      Rs {calc.total_landed_cost_pkr.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Feasibility Analysis Summary */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-stone-900 border border-stone-200 dark:border-stone-700 space-y-1.5 font-sans">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
              Procurement Feasibility Analysis Summary
            </span>
            <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
              Trade cost estimate for {currentProduct.product_name} (SKU: {currentProduct.product_id}) models an indicative factory FOB unit cost of ${(currentProduct.supplier_price ?? 0).toFixed(2)} and an estimated FBR customs tariff rate of {calc.duty_rate_percent}% under PCT code. For an estimated lot volume of {parameters.quantity || 50} units (gross weight {calc.weight_used_kg} kg via Air Freight at $5.00/kg), the projected CIF landed cost to Karachi is Rs {calc.total_landed_cost_pkr.toLocaleString()}, yielding an estimated unit landed cost of Rs {calc.unit_landed_cost_pkr.toLocaleString()}.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};