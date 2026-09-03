import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  Copy, 
  Check, 
  Download, 
  Search,
  DollarSign,
  Building2,
  ExternalLink,
  FileText,
  Share2
} from 'lucide-react';
import { TradePayload, TradeParameters, ProductItem, MarketingCopyPayload } from '../types';
import { PRODUCTS_CATALOG } from '../data/tradeData';
import { generateWanxCopywriting } from '../utils/wanxCopywriter';
import { getProductById } from '../utils/calculator';
import { marketingService, toMarketingCopyPayload } from '../services';
import { StatusBadge, DutySourceBadge } from './StatusBadge';
import { HistoricalVarianceChart } from './HistoricalVarianceChart';
import { PriceDistributionSpreadChart } from './PriceDistributionSpreadChart';
import { SupplierDossierModal } from './SupplierDossierModal';

interface MultiStepSourcingFunnelProps {
  payload: TradePayload;
  parameters: TradeParameters;
  onParametersChange: (newParams: Partial<TradeParameters>, autoTrigger?: boolean) => void;
  onExportPdf: () => void;
  onCopyAllText: () => void;
  isCopied: boolean;
}

export const MultiStepSourcingFunnel: React.FC<MultiStepSourcingFunnelProps> = ({
  payload,
  parameters,
  onParametersChange,
  onExportPdf,
  onCopyAllText,
  isCopied,
}) => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [marketingTab, setMarketingTab] = useState<'description' | 'caption'>('description');
  const [copiedMarketing, setCopiedMarketing] = useState<string | null>(null);
  const [tableSearch, setTableSearch] = useState<string>('');
  const [selectedSupplierItem, setSelectedSupplierItem] = useState<ProductItem | null>(null);

  const currentProduct = getProductById(parameters.product_id || payload.product_id);
  const calc = payload.calculations;

  // Marketing copy is seeded synchronously from the local wanxCopywriter (unchanged
  // behavior - Marketing Studio never shows a blank state). It is only replaced with
  // the backend's /api/marketing result when the backend confirms real Wanx-generated
  // content (wanx_status === "available"). When Wanx isn't configured, the backend's
  // own response is explicitly labeled source: "fallback" - its template text is
  // plainer than the local copy, so we keep the richer local copy on screen in that
  // case, and on any network/auth/error failure too (per rfqService.ts's pattern).
  const [marketingCopy, setMarketingCopy] = useState<MarketingCopyPayload>(() =>
    generateWanxCopywriting(currentProduct)
  );

  useEffect(() => {
    let cancelled = false;
    const product = getProductById(parameters.product_id || payload.product_id);

    marketingService
      .getMarketingCopy({ productId: product.product_id })
      .then((data) => {
        if (cancelled) return;
        if (data.wanx_status === 'available') {
          setMarketingCopy(toMarketingCopyPayload(data));
        } else {
          // Backend reachable but Wanx not configured/available - keep the
          // richer local copy rather than downgrading to the plain template.
          setMarketingCopy(generateWanxCopywriting(product));
        }
      })
      .catch((err) => {
        console.warn('[MultiStepSourcingFunnel] Marketing backend unreachable, using local wanxCopywriter fallback:', err);
        if (!cancelled) setMarketingCopy(generateWanxCopywriting(product));
      });

    return () => {
      cancelled = true;
    };
  }, [parameters.product_id, payload.product_id]);

  const matches = PRODUCTS_CATALOG.filter((item) => {
    const matchesCat = !parameters.category || item.category.toLowerCase() === parameters.category.toLowerCase();
    const matchesText = !tableSearch || 
      item.product_name.toLowerCase().includes(tableSearch.toLowerCase()) || 
      item.product_id.toLowerCase().includes(tableSearch.toLowerCase()) ||
      item.supplier_name.toLowerCase().includes(tableSearch.toLowerCase());
    return matchesCat && matchesText;
  });

  const handleCopyMarketingText = (type: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMarketing(type);
    setTimeout(() => setCopiedMarketing(null), 2000);
  };

  const handleSelectProductRow = (item: ProductItem) => {
    onParametersChange({
      product_id: item.product_id,
      product_name: item.product_name,
      category: item.category,
      quantity: item.moq || 10,
    });
    setActiveStep(3);
  };

  return (
    <div id="sourcing-funnel" className="w-full flex-1 p-6 md:p-8 transition-all duration-300 ease-in-out">
      {/* Wizard Step Progress Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-stone-200 dark:bg-stone-700 -translate-y-1/2 z-0" />
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-[#EA580C] -translate-y-1/2 z-0 transition-all duration-500 ease-out" 
            style={{ width: activeStep === 1 ? '0%' : activeStep === 2 ? '50%' : '100%' }}
          />

          <button
            type="button"
            onClick={() => setActiveStep(1)}
            className="relative z-10 flex items-center gap-2.5 bg-white dark:bg-stone-800 px-3 py-1.5 rounded-full border border-stone-200 dark:border-stone-700 cursor-pointer shadow-2xs hover:border-stone-300 dark:hover:border-stone-600 transition-all"
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
              activeStep >= 1 ? 'bg-[#EA580C] text-white' : 'bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400'
            }`}>
              1
            </div>
            <span className={`text-xs font-bold ${activeStep === 1 ? 'text-stone-900 dark:text-stone-100 font-extrabold' : 'text-stone-500 dark:text-stone-400'}`}>
              Stage 1: Budget & Category
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep(2)}
            className="relative z-10 flex items-center gap-2.5 bg-white dark:bg-stone-800 px-3 py-1.5 rounded-full border border-stone-200 dark:border-stone-700 cursor-pointer shadow-2xs hover:border-stone-300 dark:hover:border-stone-600 transition-all"
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
              activeStep >= 2 ? 'bg-[#EA580C] text-white' : 'bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400'
            }`}>
              2
            </div>
            <span className={`text-xs font-bold ${activeStep === 2 ? 'text-stone-900 dark:text-stone-100 font-extrabold' : 'text-stone-500 dark:text-stone-400'}`}>
              Stage 2: Alternative Lots Stream
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep(3)}
            className="relative z-10 flex items-center gap-2.5 bg-white dark:bg-stone-800 px-3 py-1.5 rounded-full border border-stone-200 dark:border-stone-700 cursor-pointer shadow-2xs hover:border-stone-300 dark:hover:border-stone-600 transition-all"
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
              activeStep === 3 ? 'bg-[#EA580C] text-white' : 'bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400'
            }`}>
              3
            </div>
            <span className={`text-xs font-bold ${activeStep === 3 ? 'text-stone-900 dark:text-stone-100 font-extrabold' : 'text-stone-500 dark:text-stone-400'}`}>
              Stage 3: Landed Cost & Viability
            </span>
          </button>
        </div>
      </div>

      {/* Stage 1: Budget & Parameters Launchpad */}
      {activeStep === 1 && (
        <div className="transition-all duration-300 ease-in-out max-w-xl mx-auto mt-12">
          <div 
            id="stage-1-launchpad-card"
            className="bg-white dark:bg-stone-800 p-8 rounded-2xl border border-stone-200/80 dark:border-stone-700 shadow-lg shadow-stone-100/50 dark:shadow-none"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-[#EA580C] dark:text-orange-400 border border-orange-100 dark:border-orange-900 flex items-center justify-center font-black">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
                  Import Opportunity Parameters
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Configure your target capital allocation and product niche to scan verified China factories.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Numeric Capital Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2">
                  Allocated Capital (PKR)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-500 dark:text-stone-400 font-bold font-mono text-sm select-none">
                    Rs.
                  </div>
                  <input
                    type="number"
                    step={5000}
                    min={0}
                    value={parameters.capital === 0 ? '' : parameters.capital}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                      onParametersChange({ capital: isNaN(val) ? 0 : val });
                    }}
                    placeholder="25,000"
                    className="w-full pl-14 pr-16 py-3 bg-[#FAF8F5] dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-base font-mono font-bold text-stone-900 dark:text-stone-100 placeholder:text-stone-400/50 dark:placeholder:text-stone-600 focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] focus:bg-white dark:focus:bg-stone-900 transition-all shadow-2xs"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-stone-500 dark:text-stone-400 font-mono text-xs font-bold select-none">
                    PKR
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 font-mono mt-1.5">
                  <span>Approx: ${((parameters.capital || 0) / 279.30).toFixed(2)} USD</span>
                  <span>SBP Interbank Rate: Rs 279.30</span>
                </div>
              </div>

              {/* Category Dropdown Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2">
                  Target Product Category
                </label>
                <select
                  value={parameters.category}
                  onChange={(e) => {
                    const newCategory = e.target.value;
                    const firstInCat = PRODUCTS_CATALOG.find(p => p.category.toLowerCase() === newCategory.toLowerCase());
                    onParametersChange({ 
                      category: newCategory,
                      ...(firstInCat ? { product_id: firstInCat.product_id, product_name: firstInCat.product_name, quantity: firstInCat.moq || 10 } : {})
                    });
                  }}
                  className="w-full px-4 py-3 bg-[#FAF8F5] dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#EA580C] focus:bg-white dark:focus:bg-stone-900 transition-all shadow-2xs cursor-pointer"
                >
                  <option value="Electronics">📱 Electronics (High Consumer Velocity)</option>
                  <option value="Machinery">⚙️ Machinery (Industrial & Prototyping)</option>
                  <option value="Apparel">👕 Apparel (Fashion, Streetwear & Textiles)</option>
                </select>
              </div>

              {/* Fast presets helper row */}
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 block mb-2">
                  Quick Budget Presets:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => onParametersChange({ capital: 25000, category: 'Electronics' })}
                    className="p-2 bg-[#FAF8F5] dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 transition-colors text-center cursor-pointer font-mono"
                  >
                    Rs. 25,000
                  </button>
                  <button
                    type="button"
                    onClick={() => onParametersChange({ capital: 50000, category: 'Electronics' })}
                    className="p-2 bg-[#FAF8F5] dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 transition-colors text-center cursor-pointer font-mono"
                  >
                    Rs. 50,000
                  </button>
                  <button
                    type="button"
                    onClick={() => onParametersChange({ capital: 120000, category: 'Apparel' })}
                    className="p-2 bg-[#FAF8F5] dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 transition-colors text-center cursor-pointer font-mono"
                  >
                    Rs. 120,000
                  </button>
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="w-full mt-4 bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white py-3.5 px-6 rounded-xl font-bold text-sm shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 hover:scale-[1.01]"
              >
                <span>Scan Wholesale Markets</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stage 2: Alternative Lots Stream Table */}
      {activeStep === 2 && (
        <div className="transition-all duration-300 ease-in-out max-w-6xl mx-auto space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-700">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className="flex items-center gap-1.5 text-xs font-bold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 px-3.5 py-2 rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Back to Budget Parameters</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter lots by title or supplier..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="pl-9 pr-4 py-1.5 text-xs bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:border-[#EA580C] w-64 shadow-2xs font-medium text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="text-xs font-mono text-stone-500 dark:text-stone-400 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-1.5 rounded-xl font-bold">
                Category: <span className="text-[#C2410C] dark:text-orange-400 uppercase">{parameters.category}</span> ({matches.length} matches)
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200/80 dark:border-stone-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF8F5] dark:bg-stone-900 border-b border-stone-200/80 dark:border-stone-700 text-[11px] font-mono uppercase text-stone-500 dark:text-stone-400 font-bold">
                    <th className="py-3.5 px-4">Lot ID</th>
                    <th className="py-3.5 px-4">Product Name & Verified Supplier</th>
                    <th className="py-3.5 px-4 text-center">Data Status</th>
                    <th className="py-3.5 px-4 text-right">Unit Price (FOB)</th>
                    <th className="py-3.5 px-4 text-right">Unit Price (PKR)</th>
                    <th className="py-3.5 px-4 text-center">MOQ</th>
                    <th className="py-3.5 px-4 text-right">Est. Batch Total (PKR)</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-700">
                  {matches.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-stone-400 dark:text-stone-500 font-medium">
                        No catalog items found matching the selected category.
                      </td>
                    </tr>
                  ) : (
                    matches.map((item) => {
                      const pricePkr = Math.round((item.supplier_price ?? 0) * 279.30);
                      const moq = item.moq || 1;
                      const estBatchTotal = pricePkr * moq;
                      const isSelected = item.product_id === parameters.product_id;

                      return (
                        <tr
                          key={item.product_id}
                          onClick={() => handleSelectProductRow(item)}
                          className={`
                            hover:bg-orange-50/50 dark:hover:bg-stone-700/50 transition-colors cursor-pointer group
                            ${isSelected ? 'bg-orange-50/80 dark:bg-orange-950/30 font-semibold' : ''}
                          `}
                        >
                          <td className="py-4 px-4 font-mono font-extrabold text-[#C2410C] dark:text-orange-400">
                            <span className="bg-orange-100/60 dark:bg-orange-950/50 px-2 py-0.5 rounded text-[11px]">
                              {item.product_id}
                            </span>
                          </td>

                          <td className="py-4 px-4 min-w-[240px] max-w-sm">
                            <div className="font-bold text-stone-900 dark:text-stone-100 group-hover:text-[#C2410C] dark:group-hover:text-orange-400 transition-colors text-xs break-words">
                              {item.product_name}
                            </div>
                            <div className="text-[11px] text-stone-600 dark:text-stone-400 mt-1 flex items-center justify-between gap-2">
                              <span className="font-medium text-stone-500 dark:text-stone-400 break-words">
                                🏭 {item.supplier_name}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSupplierItem(item);
                                }}
                                className="text-[#C2410C] dark:text-orange-400 hover:text-[#9A3412] font-bold shrink-0 inline-flex items-center gap-0.5 text-[10px] bg-orange-50 dark:bg-orange-950/50 hover:bg-orange-100 dark:hover:bg-orange-900/50 px-1.5 py-0.5 rounded border border-orange-200 dark:border-orange-800 cursor-pointer"
                              >
                                <span>Reach</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </td>

                          <td className="py-4 px-4 text-center">
                            <StatusBadge status={item.data_status} />
                          </td>

                          <td className="py-4 px-4 text-right font-mono text-stone-600 dark:text-stone-400 font-bold">
                            ${(item.supplier_price ?? 0).toFixed(2)} USD
                          </td>

                          <td className="py-4 px-4 text-right font-mono text-stone-900 dark:text-stone-100 font-extrabold">
                            Rs {pricePkr.toLocaleString()}
                          </td>

                          <td className="py-4 px-4 text-center font-mono text-stone-600 dark:text-stone-400">
                            {moq} units
                          </td>

                          <td className="py-4 px-4 text-right font-mono font-extrabold text-[#15803D] dark:text-emerald-400">
                            Rs {estBatchTotal.toLocaleString()}
                          </td>

                          <td className="py-4 px-4 text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectProductRow(item);
                              }}
                              className="bg-[#EA580C] hover:bg-[#C2410C] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1 group-hover:scale-105 cursor-pointer"
                            >
                              <span>Analyze</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Stage 3: Landed Cost, Viability & Studio Kit */}
      {activeStep === 3 && (
        <div className="transition-all duration-300 ease-in-out max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-700">
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="flex items-center gap-1.5 text-xs font-bold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 px-3.5 py-2 rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Back to Alternative Lots Stream</span>
            </button>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onCopyAllText}
                className="flex items-center gap-1.5 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-[#15803D]" /> : <Copy className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />}
                <span>{isCopied ? 'Payload Copied!' : 'Copy Summary'}</span>
              </button>

              <button
                type="button"
                onClick={onExportPdf}
                className="flex items-center gap-1.5 bg-[#EA580C] hover:bg-[#C2410C] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Dossier (PDF)</span>
              </button>
            </div>
          </div>

          {/* Lot Title Summary Bar */}
          <div className="bg-white dark:bg-stone-800 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-700 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-[#EA580C] dark:text-orange-400 border border-orange-100 dark:border-orange-900 flex items-center justify-center font-black font-mono text-sm shrink-0">
                {currentProduct.product_id}
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-stone-900 dark:text-stone-100 leading-snug">
                  {currentProduct.product_name}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mt-1">
                  <span>Category: <strong className="text-stone-700 dark:text-stone-300">{currentProduct.category}</strong></span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    Supplier: <strong className="text-stone-800 dark:text-stone-200">{currentProduct.supplier_name}</strong>
                    <button
                      type="button"
                      onClick={() => setSelectedSupplierItem(currentProduct)}
                      className="text-[#C2410C] dark:text-orange-400 hover:text-[#9A3412] font-bold inline-flex items-center gap-0.5 text-[10px] bg-orange-50 dark:bg-orange-950/50 hover:bg-orange-100 px-1.5 py-0.5 rounded border border-orange-200 dark:border-orange-800 cursor-pointer"
                      title="View Full Supplier Details & Marketplace Link"
                    >
                      <Building2 className="w-3 h-3" />
                      <span>Reach Supplier</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </span>
                  <span>•</span>
                  <StatusBadge status={currentProduct.data_status} />
                </div>
              </div>
            </div>

            {/* Volume Quick Control */}
            <div className="flex items-center gap-2 bg-[#FAF8F5] dark:bg-stone-900 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700">
              <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400">Order Quantity:</span>
              <button
                type="button"
                onClick={() => onParametersChange({ quantity: Math.max(1, (parameters.quantity || 1) - 10) })}
                className="w-6 h-6 rounded bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-mono font-bold text-xs border border-stone-200 dark:border-stone-700 flex items-center justify-center cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-700"
              >
                -
              </button>
              <span className="font-mono font-bold text-xs text-stone-900 dark:text-stone-100 px-1 min-w-[36px] text-center">
                {parameters.quantity} pcs
              </span>
              <button
                type="button"
                onClick={() => onParametersChange({ quantity: (parameters.quantity || 1) + 10 })}
                className="w-6 h-6 rounded bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-mono font-bold text-xs border border-stone-200 dark:border-stone-700 flex items-center justify-center cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-700"
              >
                +
              </button>
            </div>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card A: Landed Cost Suite */}
            <div 
              id="card-a-landed-cost-suite"
              className="bg-white dark:bg-stone-800 p-6 rounded-2xl border border-stone-200/80 dark:border-stone-700 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-100 dark:border-stone-700">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#EA580C]"></span>
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                      LANDED COST SUITE (CIF KARACHI)
                    </h4>
                  </div>
                  <DutySourceBadge source={payload.calculations.duty_rate_source} />
                </div>

                <div className="mb-4">
                  <span className="text-[11px] font-mono font-bold uppercase text-stone-400 dark:text-stone-500 block">
                    Total Landed Cost
                  </span>
                  <div className="text-2xl font-black font-mono text-stone-900 dark:text-stone-100 tracking-tight">
                    Rs {calc.total_landed_cost_pkr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs font-bold font-mono text-[#15803D] dark:text-emerald-400 mt-0.5">
                    Rs {calc.unit_landed_cost_pkr.toLocaleString()} per finished piece
                  </div>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-stone-100 dark:border-stone-700 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-orange-50/50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900">
                    <span className="text-stone-600 dark:text-stone-400 font-medium">1. Product Base:</span>
                    <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                      Rs {calc.product_cost_pkr.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900">
                    <span className="text-stone-600 dark:text-stone-400 font-medium">2. Shipping Freight (Air):</span>
                    <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                      Rs {calc.shipping_cost_pkr.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900">
                    <span className="text-stone-600 dark:text-stone-400 font-medium">3. Customs Duty ({calc.duty_rate_percent}%):</span>
                    <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                      Rs {calc.customs_cost_pkr.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-stone-400 dark:text-stone-500 font-mono pt-3 mt-3 border-t border-stone-100 dark:border-stone-700 text-center">
                Cargo Rate: $5.00/kg • Est Weight: {calc.weight_used_kg}kg
              </div>
            </div>

            {/* Card B: Viability Index Meter */}
            <div 
              id="card-b-viability-index-meter"
              className="bg-white dark:bg-stone-800 p-6 rounded-2xl border border-stone-200/80 dark:border-stone-700 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-100 dark:border-stone-700">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#15803D]"></span>
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                      VIABILITY INDEX METER
                    </h4>
                  </div>
                  <StatusBadge status={payload.data_confidence} />
                </div>

                <div className="flex items-center gap-4 mb-3">
                  <div className="text-center p-3 bg-[#FAF8F5] dark:bg-stone-900 rounded-xl border border-stone-200/80 dark:border-stone-700 shrink-0">
                    <div className="text-3xl font-black font-mono text-stone-900 dark:text-stone-100">
                      {payload.viability_score}
                    </div>
                    <div className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase font-mono">
                      / 100
                    </div>
                  </div>

                  <div className="flex-1">
                    <span className="text-[11px] font-mono font-bold uppercase text-stone-400 dark:text-stone-500 block mb-0.5">
                      Commercial Assessment
                    </span>
                    <p className="text-xs text-stone-700 dark:text-stone-300 font-medium leading-relaxed">
                      {payload.risk_summary}
                    </p>
                  </div>
                </div>

                <div className="w-full bg-stone-100 dark:bg-stone-700 h-2 rounded-full overflow-hidden mb-4">
                  <div 
                    style={{ width: `${payload.viability_score}%` }}
                    className={`h-full ${payload.viability_score >= 75 ? 'bg-[#15803D]' : payload.viability_score >= 50 ? 'bg-[#EA580C]' : 'bg-amber-500'}`}
                  />
                </div>

                <div className="bg-[#FAF8F5] dark:bg-stone-900 p-3 rounded-xl border border-stone-200/70 dark:border-stone-700 text-xs">
                  <span className="text-[10px] font-mono font-bold uppercase text-stone-500 dark:text-stone-400 block mb-1">
                    Procurement Directive
                  </span>
                  <p className="text-stone-800 dark:text-stone-200 leading-relaxed font-medium text-[11px]">
                    {payload.analysis.ai_explanation.recommendation}
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-stone-400 dark:text-stone-500 font-mono pt-3 mt-3 border-t border-stone-100 dark:border-stone-700 text-center">
                Confidence Rating: <strong className="text-stone-700 dark:text-stone-300 uppercase">{payload.analysis.ai_explanation.confidence}</strong>
              </div>
            </div>

            {/* Card C: Marketing Studio */}
            <div 
              id="card-c-marketing-studio"
              className="bg-white dark:bg-stone-800 p-6 rounded-2xl border border-stone-200/80 dark:border-stone-700 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-100 dark:border-stone-700">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#EA580C]"></span>
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                      MARKETING STUDIO
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyMarketingText(
                      marketingTab, 
                      marketingTab === 'description' ? marketingCopy.product_description : marketingCopy.social_media_caption
                    )}
                    className="text-xs font-bold text-[#EA580C] hover:text-[#C2410C] inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copiedMarketing === marketingTab ? <Check className="w-3 h-3 text-[#15803D]" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedMarketing === marketingTab ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="flex p-1 bg-stone-100 dark:bg-stone-900 rounded-xl mb-3">
                  <button
                    type="button"
                    onClick={() => setMarketingTab('description')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      marketingTab === 'description'
                        ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-2xs'
                        : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Product Description</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMarketingTab('caption')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      marketingTab === 'caption'
                        ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-2xs'
                        : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                    }`}
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Social Media Caption</span>
                  </button>
                </div>

                <div className="bg-[#FAF8F5] dark:bg-stone-900 rounded-xl p-3.5 border border-stone-200/80 dark:border-stone-700 h-[190px] overflow-y-auto">
                  {marketingTab === 'description' ? (
                    <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-normal">
                      {marketingCopy.product_description}
                    </p>
                  ) : (
                    <p className="font-mono text-[11px] text-stone-800 dark:text-stone-200 whitespace-pre-line leading-relaxed">
                      {marketingCopy.social_media_caption}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-[11px] text-stone-400 dark:text-stone-500 font-mono pt-3 mt-3 border-t border-stone-100 dark:border-stone-700 text-center">
                Wholesale E-Commerce Copy Generated
              </div>
            </div>
          </div>

          {/* Historical Variance Trend Line Graph */}
          <HistoricalVarianceChart
            category={parameters.category || currentProduct.category || 'Electronics'}
            unitLandedCostPkr={calc.unit_landed_cost_pkr || 1280}
            productName={currentProduct.product_name}
          />

          {/* Price Spread Distribution Section */}
          <PriceDistributionSpreadChart
            category={parameters.category || currentProduct.category || 'Electronics'}
            currentProduct={currentProduct}
            catalog={PRODUCTS_CATALOG}
          />
        </div>
      )}

      {/* Supplier & Product Reach Modal */}
      <SupplierDossierModal
        product={selectedSupplierItem}
        isOpen={Boolean(selectedSupplierItem)}
        onClose={() => setSelectedSupplierItem(null)}
        onSelectForCanvas={(pid) => {
          onParametersChange({ product_id: pid });
        }}
      />
    </div>
  );
};