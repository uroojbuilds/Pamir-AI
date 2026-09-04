import React, { useState, useEffect, useCallback } from 'react';
import {
  TradeParameters,
  TradePayload,
  PresetLotMacro,
  ActiveNavTab,
  AuditLogEntry,
  ExchangeRatesData
} from './types';
import { PRESET_LOT_MACROS, PRODUCTS_CATALOG } from './data/tradeData';
import {
  computeTradeMetrics,
  getProductById,
  DEFAULT_USD_TO_PKR_RATE,
  DEFAULT_USD_TO_CNY_RATE
} from './utils/calculator';
import { exchangeRateService, auditService, landedCostService, businessAnalysisService } from './services';
import { CinematicHeroSection } from './components/CinematicHeroSection';
import { CurrencyTickersBar } from './components/CurrencyTickersBar';
import { CompactSideRail } from './components/CompactSideRail';
import { MultiStepSourcingFunnel } from './components/MultiStepSourcingFunnel';
import { DesktopBentoGrid } from './components/DesktopBentoGrid';
import { RfqView } from './components/RfqView';
import { TariffRulesView } from './components/TariffRulesView';
import { AuditTrailView } from './components/AuditTrailView';
import { CatalogView } from './components/CatalogView';
import { CargoReportModal } from './components/CargoReportModal';
import { Toast } from './components/Toast';
import { LoginPage } from './components/LoginPage';
import { authService } from './services/authService';

export default function App() {
  const [currentView, setCurrentView] = useState<'hero' | 'app'>('hero');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => authService.isAuthenticated());
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('sourcing');
  const [activePresetId, setActivePresetId] = useState<string | null>('lot_p001');

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  const [exchangeRates, setExchangeRates] = useState<ExchangeRatesData>({
    USD_PKR_INTERBANK: DEFAULT_USD_TO_PKR_RATE,
    USD_PKR_OPEN_MARKET: 278.50,
    USD_CNY: DEFAULT_USD_TO_CNY_RATE,
    last_updated: 'Initial SBP Baseline'
  });
  const [isRefreshingRates, setIsRefreshingRates] = useState<boolean>(false);
  const [lastRatesUpdated, setLastRatesUpdated] = useState<string>('');

  const [parameters, setParameters] = useState<TradeParameters>({
    capital: 25000,
    category: 'Electronics',
    product_id: 'P001',
    product_name: 'TWS Wireless Earbuds (Bluetooth 5.3, basic ANC)',
    quantity: 50,
    target_currency: 'PKR',
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isCargoModalOpen, setIsCargoModalOpen] = useState<boolean>(false);

  useEffect(() => {
    auditService.getAuditLogs().then(setAuditLogs);
  }, []);

  const handleLaunchOpportunity = () => {
    setCurrentView('app');
    setActiveTab('sourcing');
    window.scrollTo(0, 0);
  };

  const handleTabChange = (tab: ActiveNavTab) => {
    setActiveTab(tab);
    window.scrollTo(0, 0);
  };

  const fetchExchangeRates = useCallback(async (isManual: boolean = false) => {
    if (isManual) setIsRefreshingRates(true);
    try {
      const data = await exchangeRateService.getExchangeRates();
      if (data && data.rates) {
        setExchangeRates({
          USD_PKR_INTERBANK: data.rates.USD_PKR_INTERBANK || DEFAULT_USD_TO_PKR_RATE,
          USD_PKR_OPEN_MARKET: data.rates.USD_PKR_OPEN_MARKET || 278.50,
          USD_CNY: data.rates.USD_CNY || DEFAULT_USD_TO_CNY_RATE,
          last_updated: data.last_updated
        });
        const timeStr = data.last_updated || new Date().toLocaleTimeString();
        setLastRatesUpdated(`Synced at ${timeStr}`);
        if (isManual) {
          showToast(`✅ Forex rates synchronized (USD/PKR: Rs ${data.rates.USD_PKR_INTERBANK})`);
        }
      }
    } catch (err) {
      console.warn('Exchange rate service fallback to local default:', err);
    } finally {
      if (isManual) setIsRefreshingRates(false);
    }
  }, []);

  useEffect(() => {
    fetchExchangeRates(false);
    const interval = setInterval(() => {
      fetchExchangeRates(false);
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchExchangeRates]);

  // Payload is seeded synchronously from the local calculator (unchanged
  // behavior - canvas never shows a blank/loading state), then replaced with
  // the real backend's /api/landed-cost + /api/business-analysis result once
  // it resolves. A short debounce avoids firing a request on every keystroke
  // while capital/quantity are being typed. On any backend failure the local
  // calculator result already in state is kept (same as before this change).
  const [payload, setPayload] = useState<TradePayload>(() => computeTradeMetrics(parameters, exchangeRates));

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        const [landed, analysis] = await Promise.all([
          landedCostService.getLandedCost({
            productId: parameters.product_id,
            quantity: parameters.quantity,
            targetCurrency: parameters.target_currency,
          }),
          businessAnalysisService.getBusinessAnalysis({ productId: parameters.product_id }),
        ]);
        if (cancelled) return;

        const product = getProductById(parameters.product_id);
        // shipping_method/shipping_rate_usd are UI display fields the backend
        // doesn't echo back directly (it applies the Air rate internally) -
        // sourced from the same local SHIPPING_METHODS dataset the backend's
        // own Data/shipping.json mirrors, not fabricated.
        const localFallback = computeTradeMetrics(parameters, exchangeRates);
        const quantity = Math.max(1, Math.round(parameters.quantity || 1));
        const aiExplanation = analysis.ai_explanation ?? localFallback.ai_explanation;

        setPayload({
          capital: parameters.capital,
          category: parameters.category,
          product_id: landed.product_id,
          product_name: product.product_name,
          product_cost_pkr: landed.product_cost,
          shipping_cost_pkr: landed.shipping_cost,
          duty_rate_percent: landed.duty_rate_percent,
          customs_cost_pkr: landed.customs_cost,
          total_landed_cost_pkr: landed.total_landed_cost,
          viability_score: analysis.viability_score,
          data_confidence: analysis.data_confidence,
          risk_summary: analysis.risk_summary,
          ai_explanation: aiExplanation,
          calculations: {
            product_cost_pkr: landed.product_cost,
            shipping_cost_pkr: landed.shipping_cost,
            duty_rate_percent: landed.duty_rate_percent,
            customs_cost_pkr: landed.customs_cost,
            total_landed_cost_pkr: landed.total_landed_cost,
            unit_landed_cost_pkr: Number((landed.total_landed_cost / quantity).toFixed(2)),
            shipping_method: localFallback.calculations.shipping_method,
            shipping_rate_usd: localFallback.calculations.shipping_rate_usd,
            weight_used_kg: landed.weight_used_kg,
            duty_rate_source: landed.duty_rate_source,
            exchange_rate_used: landed.exchange_rate,
            exchange_rate_status: landed.exchange_rate_status,
          },
          analysis: {
            viability_score: analysis.viability_score,
            data_confidence: analysis.data_confidence,
            trade_assurance_status: analysis.trade_assurance_status,
            moq_level: analysis.moq_level,
            risk_summary: analysis.risk_summary,
            qwen_status: analysis.qwen_status,
            ai_explanation: aiExplanation,
          },
        });
      } catch (err) {
        console.warn('[App] Trade metrics backend unreachable, using local calculator fallback:', err);
        if (!cancelled) setPayload(computeTradeMetrics(parameters, exchangeRates));
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [parameters, exchangeRates]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  const handleParametersChange = (
    newParams: Partial<TradeParameters>,
    autoTriggerTab: boolean = false
  ) => {
    const prevParams = { ...parameters };
    const merged = { ...parameters, ...newParams };

    if (newParams.product_id && newParams.product_id !== prevParams.product_id) {
      const prod = getProductById(newParams.product_id);
      merged.product_name = prod.product_name;
      merged.category = prod.category;
      if (!newParams.quantity && prod.moq) {
        merged.quantity = prod.moq;
      }
    }

    setParameters(merged);

    const recordId = `REC-${merged.product_id}`;
    if (newParams.capital !== undefined && newParams.capital !== prevParams.capital) {
      auditService.recordTransition(recordId, 'capital', prevParams.capital, newParams.capital, 'MANUAL_OVERRIDE');
    }
    if (newParams.quantity !== undefined && newParams.quantity !== prevParams.quantity) {
      auditService.recordTransition(recordId, 'quantity', prevParams.quantity, newParams.quantity, 'MANUAL_OVERRIDE');
    }
    if (newParams.product_id !== undefined && newParams.product_id !== prevParams.product_id) {
      auditService.recordTransition(recordId, 'product_id', prevParams.product_id, newParams.product_id, 'MANUAL_OVERRIDE');
    }
    if (newParams.category !== undefined && newParams.category !== prevParams.category) {
      auditService.recordTransition(recordId, 'category', prevParams.category, newParams.category, 'MANUAL_OVERRIDE');
    }

    auditService.getAuditLogs().then(setAuditLogs);

    if (autoTriggerTab) {
      setActiveTab('sourcing');
      window.scrollTo(0, 0);
    }
  };

  const handleCopyText = () => {
    const summary = `
========================================
PAMIR.AI TRADE COMMAND DOSSIER
========================================
Product: ${payload.product_name} (ID: ${payload.product_id})
Category: ${payload.category}
Lot Quantity: ${parameters.quantity} units
Allocated Capital: Rs ${payload.capital.toLocaleString()} PKR

FINANCIAL BREAKDOWN:
- Product Cost: Rs ${payload.product_cost_pkr.toLocaleString()} PKR
- Shipping Freight: Rs ${payload.shipping_cost_pkr.toLocaleString()} PKR (Air @ $5/kg)
- FBR Customs Surcharge: Rs ${payload.customs_cost_pkr.toLocaleString()} PKR (${payload.duty_rate_percent}% Duty)
- TOTAL LANDED COST: Rs ${payload.total_landed_cost_pkr.toLocaleString()} PKR
- Unit Landed Cost: Rs ${payload.calculations.unit_landed_cost_pkr.toLocaleString()} PKR

AI VIABILITY ASSESSMENT:
- Viability Score: ${payload.viability_score}/100 (${payload.data_confidence.toUpperCase()} confidence)
- Risk Summary: ${payload.risk_summary}
- Recommendation: ${payload.analysis.ai_explanation.recommendation}

State Bank of Pakistan Exchange Rate: Rs 279.30 / USD
========================================
`.trim();

    navigator.clipboard.writeText(summary);
    setIsCopied(true);
    showToast("📋 Trade payload summary copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2500);

    auditService.recordTransition(`REC-${payload.product_id}`, 'export_action', 'none', 'CLIPBOARD_COPY', 'EXPORT_EXECUTED');
    auditService.getAuditLogs().then(setAuditLogs);
  };

  const handleExportPdf = () => {
    setIsCargoModalOpen(true);
    auditService.recordTransition(`REC-${payload.product_id}`, 'export_action', 'none', 'PDF_REPORT_OPENED', 'EXPORT_EXECUTED');
    auditService.getAuditLogs().then(setAuditLogs);
  };

  const handleClearLogs = async () => {
    await auditService.clearLogs();
    const updated = await auditService.getAuditLogs();
    setAuditLogs(updated);
    showToast("Audit trail reset to initial baseline.");
  };

  // View 0: Login / Signup Gate
  if (!isAuthenticated) {
    return <LoginPage onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  // View 1: Fullscreen Launchpad
  if (currentView === 'hero') {
    return (
      <div className="w-full min-h-screen bg-[#FAF8F3] text-stone-900 flex flex-col font-sans selection:bg-[#EA580C] selection:text-white">
        <CinematicHeroSection onFindOpportunity={handleLaunchOpportunity} />
      </div>
    );
  }

  // View 2: App Studio Terminal
  return (
    <div className="w-full min-h-screen bg-[#FAF8F3] dark:bg-[#1A1612] text-stone-900 dark:text-[#FAF8F3] flex font-sans selection:bg-[#EA580C] selection:text-white transition-colors duration-200">
      
      {/* Permanent Side Rail */}
      <aside className="w-64 shrink-0 min-h-screen sticky top-0 h-screen z-30 border-r border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1A1612] flex flex-col justify-between transition-colors duration-200">
        <div className="flex-1 flex flex-col">
          <div className="p-3 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1A1612]">
            <button
              type="button"
              onClick={() => {
                setCurrentView('hero');
                window.scrollTo(0, 0);
              }}
              className="w-full py-1.5 px-3 rounded-lg bg-[#FAF8F5] dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-[11px] font-mono text-[#C2410C] dark:text-[#FB923C] border border-stone-200 dark:border-stone-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer font-bold shadow-2xs"
            >
              <span>← Back to Launchpad</span>
            </button>
            <button
              type="button"
              onClick={() => {
                authService.logout();
                setIsAuthenticated(false);
                setCurrentView('hero');
              }}
              className="w-full mt-2 py-1.5 px-3 rounded-lg bg-white dark:bg-transparent hover:bg-stone-100 dark:hover:bg-stone-800 text-[11px] font-mono text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer font-bold"
            >
              <span>Log Out</span>
            </button>
          </div>

          <CompactSideRail
            activeTab={activeTab}
            onTabChange={handleTabChange}
            productCount={PRODUCTS_CATALOG.length}
          />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 bg-[#FAF8F3] dark:bg-[#1A1612] transition-colors duration-200">
        
        {/* Top Currency Tickers Bar */}
        <header className="sticky top-0 z-20 bg-white dark:bg-[#1A1612] border-b border-stone-200 dark:border-stone-800 shadow-2xs">
          <CurrencyTickersBar
            onOpenAuditLog={() => handleTabChange('audit')}
            auditCount={auditLogs.length}
            rates={exchangeRates}
            isRefreshing={isRefreshingRates}
            onRefresh={() => fetchExchangeRates(true)}
            lastUpdated={lastRatesUpdated}
          />
        </header>

        {/* Tab Canvas Area */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full bg-[#FAF8F3] dark:bg-[#1A1612] transition-colors duration-200">
          {activeTab === 'sourcing' && (
            <div id="sourcing-funnel">
              <MultiStepSourcingFunnel
                payload={payload}
                parameters={parameters}
                onParametersChange={handleParametersChange}
                onExportPdf={handleExportPdf}
                onCopyAllText={handleCopyText}
                isCopied={isCopied}
              />
            </div>
          )}

          {activeTab === 'rfqs' && (
            <RfqView
              parameters={parameters}
              onApplyProduct={(pid) => handleParametersChange({ product_id: pid })}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'tariff' && <TariffRulesView />}

          {activeTab === 'catalog' && (
            <CatalogView
              activeProductId={parameters.product_id}
              onSelectProduct={(pid) => {
                handleParametersChange({ product_id: pid }, true);
                showToast(`Loaded ${pid} onto command canvas`);
              }}
              onOpenRfq={(pid) => {
                handleParametersChange({ product_id: pid }, true);
                setActiveTab('rfqs');
                window.scrollTo(0, 0);
                showToast(`Opened RFQ outreach for ${pid}`);
              }}
            />
          )}

          {activeTab === 'audit' && (
            <AuditTrailView
              logs={auditLogs}
              onClearLogs={handleClearLogs}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Cargo Report Modal */}
      <CargoReportModal
        isOpen={isCargoModalOpen}
        onClose={() => setIsCargoModalOpen(false)}
        payload={payload}
        parameters={parameters}
        onExportPdf={handleExportPdf}
      />

      {/* Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}