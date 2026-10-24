import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { AuditLogEntry, ExchangeRatesData, ProductItem, TradeParameters, TradePayload } from '../types';
import { PRODUCTS_CATALOG } from '../data/tradeData';
import { computeTradeMetrics, DEFAULT_USD_TO_CNY_RATE, DEFAULT_USD_TO_PKR_RATE } from '../utils/calculator';
import { ApiError, apiClient } from '../services/apiClient';
import { auditService, authService, catalogService, exchangeRateService, landedCostService, businessAnalysisService } from '../services';
import { TABS, type ProductTab } from '../lib/content';

export type View =
  | 'land' | 'login' | 'signup'
  | 'dash' | 'disc' | 'list' | 'prod' | 'mkt' | 'kit' | 'guide'
  | 'calc' | 'fx' | 'tariff' | 'audit' | 'faq' | 'contact' | 'about';

const PUBLIC_VIEWS: View[] = ['land', 'login', 'signup'];
const USER_KEY = 'pamirai_user_v1';
const SESSION_KEY = 'pamirai_session_v1';

export interface User { email: string; name: string }
export interface RatesState {
  interbank: number; openMarket: number; cny: number;
  updated: string; note?: string; fromBackend: boolean; loading: boolean;
}
interface Toast { id: number; text: string }
type Seen = Record<string, Partial<Record<ProductTab, true>>>;

interface Ctx {
  view: View; tab: ProductTab; user: User | null;
  catalog: ProductItem[]; catalogLoading: boolean;
  pid: string | null; product: ProductItem | null;
  q: string; budget: number; cat: string; quantity: number;
  rates: RatesState;
  payload: TradePayload | null; payloadLoading: boolean; payloadFromBackend: boolean;
  seen: Seen; unlocked: boolean; analysisCount: number;
  auditLogs: AuditLogEntry[]; toasts: Toast[];
  go: (v: View, patch?: { tab?: ProductTab; pid?: string | null }) => void;
  jump: (id: string) => void;
  toast: (text: string) => void;
  setQ: (q: string) => void;
  setBudget: (n: number) => void;
  setCat: (c: string) => void;
  setQuantity: (n: number) => void;
  commitParam: (field: 'capital' | 'quantity' | 'category', value?: string | number) => void;
  selectProduct: (id: string) => void;
  markSeen: (tab: ProductTab) => void;
  signIn: (email: string, password: string, mode: 'login' | 'signup', name?: string) => Promise<void>;
  signOut: () => void;
  refreshRates: () => Promise<void>;
  refreshAudit: () => void;
  record: (recordId: string, field: string, prev: string | number, next: string | number, action?: AuditLogEntry['action_type']) => void;
}

const AppCtx = createContext<Ctx | null>(null);
export const useApp = (): Ctx => {
  const c = useContext(AppCtx);
  if (!c) throw new Error('useApp must be used inside <AppProvider>');
  return c;
};

function readUser(): User | null {
  if (!authService.isAuthenticated()) return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) return JSON.parse(raw) as User;
  } catch { /* ignore */ }
  return null;
}
function readSession(): { pid: string | null; budget: number; cat: string; quantity: number; seen: Seen } {
  const d = { pid: null, budget: 150000, cat: 'Electronics', quantity: 1, seen: {} as Seen };
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) return { ...d, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return d;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(readSession, []);
  const [user, setUser] = useState<User | null>(readUser);
  const [view, setView] = useState<View>(() => (readUser() ? 'dash' : 'land'));
  const [tab, setTab] = useState<ProductTab>('Overview');
  const [catalog, setCatalog] = useState<ProductItem[]>(PRODUCTS_CATALOG);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [pid, setPid] = useState<string | null>(initial.pid);
  const [q, setQ] = useState('');
  const [budget, setBudgetState] = useState<number>(initial.budget);
  const [cat, setCatState] = useState<string>(initial.cat);
  const [quantity, setQuantityState] = useState<number>(initial.quantity);
  const [seen, setSeen] = useState<Seen>(initial.seen);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [rates, setRates] = useState<RatesState>({
    interbank: DEFAULT_USD_TO_PKR_RATE, openMarket: 278.5, cny: DEFAULT_USD_TO_CNY_RATE,
    updated: 'Reference baseline', fromBackend: false, loading: false,
  });

  const toastId = useRef(0);
  const toast = useCallback((text: string) => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  // ---- persistence of the working session ----
  useEffect(() => {
    try { localStorage.setItem(SESSION_KEY, JSON.stringify({ pid, budget, cat, quantity, seen })); } catch { /* ignore */ }
  }, [pid, budget, cat, quantity, seen]);

  // ---- catalog + audit trail ----
  useEffect(() => {
    let off = false;
    catalogService.getCatalog().then((c) => { if (!off) { setCatalog(c); setCatalogLoading(false); } });
    return () => { off = true; };
  }, []);
  const refreshAudit = useCallback(() => { auditService.getAuditLogs().then(setAuditLogs); }, []);
  useEffect(() => { if (user) refreshAudit(); }, [user, refreshAudit]);

  const record = useCallback<Ctx['record']>((recordId, field, prev, next, action = 'MANUAL_OVERRIDE') => {
    auditService.recordTransition(recordId, field, prev, next, action).then(refreshAudit);
  }, [refreshAudit]);

  // ---- exchange rates (dataset snapshot, public endpoint) ----
  const refreshRates = useCallback(async () => {
    setRates((r) => ({ ...r, loading: true }));
    const d = await exchangeRateService.getExchangeRates();
    setRates({
      interbank: d.rates.USD_PKR_INTERBANK || DEFAULT_USD_TO_PKR_RATE,
      openMarket: d.rates.USD_PKR_OPEN_MARKET || 278.5,
      cny: d.rates.USD_CNY || DEFAULT_USD_TO_CNY_RATE,
      updated: d.last_updated || 'n/a',
      note: d.note,
      fromBackend: !!d.sources,
      loading: false,
    });
  }, []);
  useEffect(() => { refreshRates(); }, [refreshRates]);

  // ---- navigation ----
  const go = useCallback<Ctx['go']>((v, patch = {}) => {
    if (patch.tab) setTab(patch.tab);
    if (patch.pid !== undefined) setPid(patch.pid);
    setView(!PUBLIC_VIEWS.includes(v) && !authService.isAuthenticated() ? 'login' : v);
    window.scrollTo(0, 0);
  }, []);

  const jump = useCallback((id: string) => {
    const run = () => (id === 'top'
      ? window.scrollTo({ top: 0, behavior: 'smooth' })
      : document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }));
    if (view !== 'land') { setView('land'); setTimeout(run, 60); } else run();
  }, [view]);

  // ---- auth ----
  const signIn = useCallback<Ctx['signIn']>(async (email, password, mode, name) => {
    const res = mode === 'login' ? await authService.login(email, password) : await authService.signup(email, password);
    const display = (name || '').trim() || res.email.split('@')[0];
    const u = { email: res.email, name: display };
    try { localStorage.setItem(USER_KEY, JSON.stringify(u)); } catch { /* ignore */ }
    setUser(u);
    setView('dash');
    window.scrollTo(0, 0);
  }, []);
  const signOut = useCallback(() => {
    authService.logout();
    try { localStorage.removeItem(USER_KEY); } catch { /* ignore */ }
    setUser(null);
    setView('land');
    window.scrollTo(0, 0);
  }, []);

  // ---- parameters (each change is written to the audit trail) ----
  const product = useMemo(() => catalog.find((p) => p.product_id === pid) ?? null, [catalog, pid]);

  const setBudget = useCallback((n: number) => setBudgetState(Number.isFinite(n) ? Math.max(0, n) : 0), []);
  const setCat = useCallback((c: string) => setCatState(c), []);
  const setQuantity = useCallback((n: number) => setQuantityState(Math.max(1, Math.round(Number.isFinite(n) ? n : 1))), []);

  // Audit entries are written when an edit is committed (blur / chip click / Enter), not on every keystroke.
  const nowRef = useRef({ capital: budget, quantity, category: cat });
  nowRef.current = { capital: budget, quantity, category: cat };
  const committed = useRef({ capital: budget, quantity, category: cat });
  const commitParam = useCallback<Ctx['commitParam']>((field, value) => {
    const before = committed.current[field];
    const after = value ?? nowRef.current[field];
    if (pid && before !== after) record(`REC-${pid}`, field, before, after);
    committed.current = { ...committed.current, [field]: after } as typeof committed.current;
  }, [pid, record]);

  const selectProduct = useCallback((id: string) => {
    const p = catalog.find((x) => x.product_id === id);
    if (!p) return;
    if (pid !== id) record(`REC-${id}`, 'product_id', pid ?? 'none', id);
    setPid(id);
    const q0 = p.moq && p.moq > 0 ? p.moq : 1;
    setQuantityState(q0);
    committed.current = { ...committed.current, quantity: q0 };
    setTab('Overview');
    setView('prod');
    window.scrollTo(0, 0);
  }, [catalog, pid, record]);

  // ---- progress through the analysis tabs ----
  const markSeen = useCallback((t: ProductTab) => {
    if (!pid) return;
    setSeen((s) => (s[pid]?.[t] ? s : { ...s, [pid]: { ...s[pid], [t]: true } }));
  }, [pid]);
  const unlocked = !!pid && TABS.slice(0, 4).every((t) => seen[pid]?.[t]);
  const analysisCount = Object.values(seen).filter((s) => Object.keys(s).length > 0).length;

  // ---- trade payload: local calculator seeds it instantly, backend result replaces it ----
  const params: TradeParameters | null = useMemo(() => (product ? {
    capital: budget, category: product.category, product_id: product.product_id,
    product_name: product.product_name, quantity, target_currency: 'PKR',
  } : null), [product, budget, quantity]);

  const [payload, setPayload] = useState<TradePayload | null>(null);
  const [payloadLoading, setPayloadLoading] = useState(false);
  const [payloadFromBackend, setPayloadFromBackend] = useState(false);

  useEffect(() => {
    if (!params || !user) { setPayload(null); return; }
    const local = computeTradeMetrics(params, {
      USD_PKR_INTERBANK: rates.interbank, USD_PKR_OPEN_MARKET: rates.openMarket, USD_CNY: rates.cny,
    } as ExchangeRatesData);
    setPayload(local);
    setPayloadFromBackend(false);
    setPayloadLoading(true);
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const [landed, analysis] = await Promise.all([
          landedCostService.getLandedCost({ productId: params.product_id, quantity: params.quantity, targetCurrency: 'PKR' }),
          businessAnalysisService.getBusinessAnalysis({ productId: params.product_id }),
        ]);
        if (cancelled) return;
        const ai = analysis.ai_explanation ?? local.ai_explanation;
        const qty = Math.max(1, Math.round(params.quantity));
        setPayload({
          capital: params.capital, category: params.category, product_id: landed.product_id, product_name: params.product_name,
          product_cost_pkr: landed.product_cost, shipping_cost_pkr: landed.shipping_cost,
          duty_rate_percent: landed.duty_rate_percent, customs_cost_pkr: landed.customs_cost,
          total_landed_cost_pkr: landed.total_landed_cost,
          viability_score: analysis.viability_score, data_confidence: analysis.data_confidence,
          risk_summary: analysis.risk_summary, ai_explanation: ai,
          calculations: {
            product_cost_pkr: landed.product_cost, shipping_cost_pkr: landed.shipping_cost,
            duty_rate_percent: landed.duty_rate_percent, customs_cost_pkr: landed.customs_cost,
            total_landed_cost_pkr: landed.total_landed_cost,
            unit_landed_cost_pkr: Number((landed.total_landed_cost / qty).toFixed(2)),
            shipping_method: local.calculations.shipping_method, shipping_rate_usd: local.calculations.shipping_rate_usd,
            weight_used_kg: landed.weight_used_kg, duty_rate_source: landed.duty_rate_source,
            exchange_rate_used: landed.exchange_rate, exchange_rate_status: landed.exchange_rate_status,
          },
          analysis: {
            viability_score: analysis.viability_score, data_confidence: analysis.data_confidence,
            trade_assurance_status: analysis.trade_assurance_status, moq_level: analysis.moq_level,
            risk_summary: analysis.risk_summary, qwen_status: analysis.qwen_status, ai_explanation: ai,
          },
        });
        setPayloadFromBackend(true);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          apiClient.setAuthToken(null);
          try { localStorage.removeItem(USER_KEY); } catch { /* ignore */ }
          setUser(null); setView('login');
          toast('Your session expired. Please sign in again.');
        }
      } finally {
        if (!cancelled) setPayloadLoading(false);
      }
    }, 350);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [params, user, rates.interbank, rates.openMarket, rates.cny, toast]);

  const value: Ctx = {
    view, tab, user, catalog, catalogLoading, pid, product, q, budget, cat, quantity, rates,
    payload, payloadLoading, payloadFromBackend, seen, unlocked, analysisCount, auditLogs, toasts,
    go, jump, toast, setQ, setBudget, setCat, setQuantity, commitParam, selectProduct, markSeen,
    signIn, signOut, refreshRates, refreshAudit, record,
  };
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
