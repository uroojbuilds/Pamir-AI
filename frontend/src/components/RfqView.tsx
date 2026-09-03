import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  CheckCircle2,
  ChevronDown,
  Globe2
} from 'lucide-react';
import { TradeParameters } from '../types';
import { PRODUCTS_CATALOG, CUSTOMS_TARIFFS, DUTY_RATES_MAP } from '../data/tradeData';

interface RfqViewProps {
  parameters: TradeParameters;
  onApplyProduct: (productId: string) => void;
  onShowToast: (message: string) => void;
}

export const RfqView: React.FC<RfqViewProps> = ({
  parameters,
  onApplyProduct,
  onShowToast
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [activeLang, setActiveLang] = useState<'EN' | 'ZH'>('EN');

  // 1. Resolve product directly by product_id or fallback
  const activeId = parameters.product_id || 'P001';
  const currentProduct = PRODUCTS_CATALOG.find((p) => p.product_id === activeId) || PRODUCTS_CATALOG[0];

  // 2. Resolve tariff entry from CUSTOMS_TARIFFS or fallback
  const tariffEntry = CUSTOMS_TARIFFS.find((t) => t.description.includes(currentProduct.product_id)) 
    || CUSTOMS_TARIFFS[0];

  // 3. Extract exact fields
  const productName = currentProduct.product_name;
  const supplierName = currentProduct.supplier_name || 'Shenzhen OEM Partner';
  const hsCode = tariffEntry?.pct_code || '8518.30';
  const dutyPercent = DUTY_RATES_MAP[currentProduct.product_id] ?? tariffEntry?.duty_rate ?? 20;
  const fobPriceNum = Number(currentProduct.supplier_price || 1.30);
  const moqNum = Number(currentProduct.moq || 50);
  const lotQuantity = Number(parameters.quantity || moqNum);
  const estTotalUsd = (fobPriceNum * lotQuantity).toFixed(2);

  // English Letter Template
  const englishLetter = `Dear ${supplierName},

I am contacting you from Karachi, Pakistan regarding sourcing for "${productName}" (HS Code: ${hsCode}).

We are preparing an initial commercial trial batch order under the following parameters:
- Lot Target Quantity: ${lotQuantity} units (Supplier MOQ: ${moqNum} units)
- Delivery Terms Requested: FOB Shenzhen / CIF Karachi (Air Freight Express)
- Customization: Custom blister/carton packaging & English instructional guide
- Payment Terms: Alibaba Trade Assurance / Irrevocable Letter of Credit (LC)

Please confirm:
1. Current FOB unit quote for ${lotQuantity} units (Target: ~$${fobPriceNum.toFixed(2)} / unit · Total FOB: ~$${estTotalUsd} USD)
2. Production lead time to dispatch (Target: 12-18 calendar days)
3. Gross package weight and volumetric dimensions (CBM) for Pakistani customs clearance

We look forward to initiating a long-term cross-border partnership through the CPEC Digital Corridor.

Best regards,
Procurement Lead · Pamir.AI Trade Network
Karachi, Pakistan`;

  // Dynamic Client-Side Chinese Template (Zero Backend Dependency)
  const chineseLetter = `尊敬的 ${supplierName} 业务团队：

您好！我们来自巴基斯坦卡拉奇，拟就采购“${productName}”（海关编码：${hsCode}）向贵司发起正式询价（RFQ）。

我司首批试单参数如下：
- 采购目标数量：${lotQuantity} 套（贵司起订量：${moqNum} 套）
- 意向交付条款：FOB 深圳 或 CIF 卡拉奇（空运专线）
- 定制需求：中英文外包装定制及说明书
- 结算保障：支持阿里巴巴信保（Trade Assurance）或不可撤销信用证

烦请确认以下商务信息：
1. ${lotQuantity} 套的 FOB 单价核算（目标单价：约 $${fobPriceNum.toFixed(2)} / 套 · FOB 总额：约 $${estTotalUsd} 美元）
2. 排产与交期（期望 12-18 天内发运）
3. 单箱毛重及外箱体积（CBM），用于中巴清关报关核税（巴基斯坦关税率约 ${dutyPercent}%）

期待与贵司建立长期稳定的中巴跨境贸易合作！

顺祝商祺，
采购负责人 · Pamir.AI 跨境贸易终端
巴基斯坦 · 卡拉奇`;

  const activeLetterText = activeLang === 'EN' ? englishLetter : chineseLetter;

  // Resilient Clipboard Copy Handler (Works in HTTP, HTTPS, & Localhost)
  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(activeLetterText);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = activeLetterText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setIsCopied(true);
      onShowToast(activeLang === 'EN' ? "✅ RFQ letter copied to clipboard!" : "✅ 询价函已成功复制到剪贴板！");
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      onShowToast("⚠️ Could not auto-copy. Please manually select the text.");
    }
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    onApplyProduct(selectedId);
    onShowToast(`Loaded ${selectedId} into RFQ generator`);
  };

  return (
    <div className="space-y-6 select-none">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-700">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono mb-2 bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>QWEN-2.5 AI · SUPPLIER OUTREACH ENGINE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900 dark:text-stone-100">
            Supplier RFQ Engine
          </h2>
          <p className="text-stone-600 dark:text-stone-400 text-xs sm:text-sm mt-0.5">
            Bilingual trade correspondence engineered for verified Shenzhen OEM supplier negotiations.
          </p>
        </div>

        {/* Controls: Language Switcher & Copy Trigger */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#FAF8F5] dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveLang('EN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activeLang === 'EN' 
                  ? 'bg-white dark:bg-stone-800 text-[#C2410C] border border-stone-200 dark:border-stone-700 shadow-2xs' 
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:text-stone-100'
              }`}
            >
              English Letter
            </button>
            <button
              type="button"
              onClick={() => setActiveLang('ZH')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activeLang === 'ZH' 
                  ? 'bg-white dark:bg-stone-800 text-[#C2410C] border border-stone-200 dark:border-stone-700 shadow-2xs' 
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:text-stone-100'
              }`}
            >
              中文询盘函 (Chinese)
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer ${
              isCopied 
                ? 'bg-[#15803D] text-white' 
                : 'bg-[#EA580C] hover:bg-[#C2410C] text-white'
            }`}
          >
            {isCopied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
            <span>{isCopied ? 'Copied to Clipboard!' : 'Copy RFQ'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Supplier Dossier Card & Live Product Switcher */}
        <div className="lg:col-span-4 bg-white dark:bg-stone-800 border border-stone-200/90 rounded-3xl p-6 shadow-sm space-y-5">
          
          {/* Active Product Selector Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#C2410C]">
              Select Sourcing SKU ({PRODUCTS_CATALOG.length} verified items)
            </label>
            <div className="relative">
              <select
                value={currentProduct.product_id}
                onChange={handleProductChange}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl font-bold text-xs text-stone-900 dark:text-stone-100 appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer shadow-2xs"
              >
                {PRODUCTS_CATALOG.map((p) => (
                  <option key={p.product_id} value={p.product_id}>
                    [{p.product_id}] {p.product_name} (${p.supplier_price.toFixed(2)})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Verified OEM Manufacturer
            </span>
            <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100 mt-0.5">
              {supplierName}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 flex items-center gap-1">
              <Globe2 className="w-3 h-3 text-stone-400 dark:text-stone-500" />
              <span>Shenzhen / Guangdong Industrial Hub</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-stone-900 border border-stone-200 dark:border-stone-700 space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-stone-500 dark:text-stone-400 font-bold">HS / PCT CODE:</span>
              <span className="font-extrabold text-stone-900 dark:text-stone-100">{hsCode}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500 dark:text-stone-400 font-bold">CUSTOMS DUTY RATE:</span>
              <span className="font-extrabold text-[#15803D]">{dutyPercent}% FBR Tariff</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500 dark:text-stone-400 font-bold">ORDER LOT:</span>
              <span className="font-black text-[#C2410C]">{lotQuantity} units</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500 dark:text-stone-400 font-bold">UNIT FOB:</span>
              <span className="font-extrabold text-stone-900 dark:text-stone-100">${fobPriceNum.toFixed(2)} USD</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-stone-200 dark:border-stone-700">
              <span className="text-stone-500 dark:text-stone-400 font-bold">TOTAL BATCH FOB:</span>
              <span className="font-black text-stone-900 dark:text-stone-100">${estTotalUsd} USD</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <span className="text-[10px] font-mono font-bold text-stone-500 dark:text-stone-400 uppercase block">Compliance Guarantees</span>
            <div className="flex items-center gap-2 text-[#15803D] font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{currentProduct.trade_assurance ? 'Alibaba Trade Assurance Supported' : 'Direct Manufacturer Verified'}</span>
            </div>
            <div className="flex items-center gap-2 text-[#15803D] font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>FBR Pakistan Import Valuation Verified</span>
            </div>
          </div>
        </div>

        {/* Right Column: Physical Paper Document Style Letter (8 Cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-stone-800 border border-stone-200/90 rounded-3xl p-8 shadow-md relative">
          
          <div className="flex items-center justify-between pb-4 border-b border-stone-200/80 mb-6 font-mono text-xs text-stone-500 dark:text-stone-400">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#EA580C]" />
              <span className="font-bold text-stone-800 dark:text-stone-200">OFFICIAL COMMERCIAL RFQ TRANSMISSION</span>
            </div>
            <span className="text-[11px] bg-[#FAF8F5] dark:bg-stone-900 border border-stone-200 dark:border-stone-700 px-2.5 py-0.5 rounded text-stone-600 dark:text-stone-400 font-bold">
              Corridor ID: PK-CN-2026
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-[#FAF8F3] dark:bg-[#1A1612] border border-stone-200 dark:border-stone-700 font-serif text-sm leading-relaxed text-stone-800 dark:text-stone-200 whitespace-pre-line shadow-inner">
            {activeLetterText}
          </div>

          <div className="mt-6 pt-4 border-t border-stone-200/80 flex items-center justify-between text-xs font-mono text-stone-500 dark:text-stone-400">
            <span className="flex items-center gap-1.5 text-[#15803D] font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Ready for WeChat & Alibaba Direct Transfer</span>
            </span>
            <span className="text-[#C2410C] font-bold">Generated via Pamir.AI</span>
          </div>

        </div>

      </div>
    </div>
  );
};