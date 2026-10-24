import { useEffect, useMemo } from 'react';
import { TABS, type ProductTab } from '../lib/content';
import { ProductGallery, ProductImage } from '../components/ProductImage';
import { fmtDate, fmtPKR, fmtUSD, statusKind, statusLabel } from '../lib/format';
import { fitsBudget, moqCostPkr } from '../lib/product';
import { CATEGORY_HISTORICAL_DATA, getScaledHistoricalVariance } from '../data/historicalTrends';
import { getCustomsTariffForProduct } from '../utils/calculator';
import { generateTradeDossierPdf } from '../utils/pdfGenerator';
import { useApp } from '../state/AppContext';
import { AppShell } from '../components/Shell';
import { A, KV, Spinner, Tag, copyText } from '../components/ui';
import { SuppliersTab } from './Suppliers';
import { Products } from './Discover';
import type { TradePayload } from '../types';

function scoreLabel(s: number) {
  return s >= 75 ? 'Good potential' : s >= 50 ? 'Moderate' : 'Needs verification';
}

function useBenchmark(payload: TradePayload | null) {
  return useMemo(() => {
    if (!payload) return null;
    const unit = payload.calculations.unit_landed_cost_pkr;
    const trend = getScaledHistoricalVariance(payload.category, unit);
    const last = trend.historical_data[trend.historical_data.length - 1];
    return { trend, last, hasBenchmark: !!CATEGORY_HISTORICAL_DATA[payload.category] };
  }, [payload]);
}

function Overview({ payload }: { payload: TradePayload }) {
  const { product, rates } = useApp();
  const bm = useBenchmark(payload);
  if (!product || !bm) return null;
  const tariff = getCustomsTariffForProduct(product);
  const margin = bm.last.margin_percentage;
  return (
    <div className="g3">
      <div className="card">
        <h3>Product Details</h3>
        <ProductGallery key={product.product_id} product={product} />
        <KV rows={[
          ['Category', product.sub_category ? `${product.category} · ${product.sub_category}` : product.category],
          ['PCT/HS Code', tariff.pct_code],
          ['Origin', 'China'],
          ['MOQ', product.moq ? `${product.moq} pcs` : '—'],
          ['Unit weight', product.weight_kg ? `${product.weight_kg} kg` : 'Not in dataset'],
          ['FOB price', fmtUSD(product.supplier_price)],
          ['Trade Assurance', product.trade_assurance == null ? 'Unknown' : product.trade_assurance ? 'Yes' : 'No'],
          ...(product.rating ? [['Supplier rating', `${product.rating}/5${product.review_count ? ` · ${product.review_count} reviews` : ''}`] as [string, string]] : []),
        ]} />
        <p className="mut small" style={{ marginTop: 8 }}>Source: {product.source} · {product.source_date}</p>
      </div>
      <div className="card" style={{ textAlign: 'center' }}>
        <h3>Key Metrics</h3>
        <div style={{ fontSize: 52, fontWeight: 800, color: 'var(--or)' }}>
          {payload.viability_score}<small style={{ fontSize: 18, color: 'var(--mut)' }}>/100</small>
        </div>
        <Tag kind={payload.viability_score >= 75 ? undefined : 'w'}>{scoreLabel(payload.viability_score)}</Tag>{' '}
        <Tag kind={statusKind(payload.data_confidence)}>{statusLabel(payload.data_confidence)} data</Tag>
        <p className="sub" style={{ fontSize: 13, margin: '10px 0 0' }}>{payload.risk_summary}</p>
      </div>
      <div className="card">
        <h3>Est. Profit Margin</h3>
        {bm.hasBenchmark ? (
          <>
            <div style={{ fontSize: 34, fontWeight: 800 }}>{margin}%</div>
            <div className="bar"><i style={{ width: `${Math.max(0, Math.min(100, margin))}%` }} /></div>
            <p className="sub" style={{ fontSize: 13, marginTop: 10 }}>
              Category benchmark: local wholesale ~{fmtPKR(bm.last.market_price)} vs landed {fmtPKR(bm.last.landed_cost)} per unit.
              <br /><Tag kind="w">Estimate</Tag> not a quote for this exact product.
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: 34, fontWeight: 800 }}>—</div>
            <p className="sub" style={{ fontSize: 13, marginTop: 10 }}>
              No local wholesale benchmark for {product.category} yet, so no margin is shown. Compare the landed cost per unit ({fmtPKR(payload.calculations.unit_landed_cost_pkr)}) with real resale prices in your market.
            </p>
          </>
        )}
        <p className="mut small">1 USD = Rs {rates.interbank}</p>
      </div>
    </div>
  );
}

function CostTab({ payload }: { payload: TradePayload }) {
  const { product, quantity, setQuantity, commitParam, payloadLoading, payloadFromBackend, toast, record, budget } = useApp();
  if (!product) return null;
  const c = payload.calculations;
  const tariff = getCustomsTariffForProduct(product);
  const exportPdf = () => {
    const ok = generateTradeDossierPdf(payload, {
      capital: budget, category: product.category, product_id: product.product_id,
      product_name: product.product_name, quantity, target_currency: 'PKR',
    });
    toast(ok ? 'PDF dossier downloaded' : 'Could not create the PDF');
    if (ok) record(`REC-${product.product_id}`, 'export_action', 'none', 'PDF_REPORT_DOWNLOADED', 'EXPORT_EXECUTED');
  };
  const summary = () => [
    `PAMIR AI · LANDED COST SUMMARY`,
    `Product: ${payload.product_name} (${payload.product_id})`,
    `Quantity: ${quantity} units · Capital: ${fmtPKR(budget)}`,
    `Product cost: ${fmtPKR(payload.product_cost_pkr)}`,
    `Shipping (${c.shipping_method} @ $${c.shipping_rate_usd}/kg, ${c.weight_used_kg} kg): ${fmtPKR(payload.shipping_cost_pkr)}`,
    `Import duty (${payload.duty_rate_percent}%): ${fmtPKR(payload.customs_cost_pkr)}`,
    `TOTAL LANDED: ${fmtPKR(payload.total_landed_cost_pkr)} (${fmtPKR(c.unit_landed_cost_pkr)} / unit)`,
    `Viability: ${payload.viability_score}/100 · Rate: Rs ${c.exchange_rate_used}/USD`,
  ].join('\n');
  return (
    <>
      <div className="card" style={{ marginBottom: 18, display: 'flex', gap: 16, alignItems: 'end', flexWrap: 'wrap' }}>
        <div style={{ width: 180 }}>
          <label htmlFor="qty">Order quantity (units)</label>
          <input id="qty" type="number" min={1} style={{ marginBottom: 0 }} value={quantity}
                 onChange={(e) => setQuantity(+e.target.value)} onBlur={() => commitParam('quantity')} />
        </div>
        {product.supplier_price == null && (
          <div className="warn" style={{ flexBasis: '100%' }}>
            No supplier price is available for this product, so product cost is not included in these figures. Request a quotation from the supplier before relying on any total.
          </div>
        )}
        <div className="mut small" style={{ flex: 1, minWidth: 200 }}>
          MOQ {product.moq ?? '—'} units. {payloadLoading ? <><Spinner /> Checking with the Pamir engine…</> : payloadFromBackend ? 'Calculated by the Pamir backend.' : 'Calculated in your browser (backend not reachable).'}
        </div>
        <button className="btn o sm" type="button" onClick={() => copyText(summary(), toast)}>Copy summary</button>
        <button className="btn sm" type="button" onClick={exportPdf}>Download PDF</button>
      </div>
      <div className="row">
        <div className="card">
          <h3>Landed Cost Breakdown</h3>
          <KV rows={[
            ['Product cost (FOB)', fmtPKR(payload.product_cost_pkr)],
            [`Shipping · ${c.shipping_method} (${c.weight_used_kg} kg)`, fmtPKR(payload.shipping_cost_pkr)],
            [`Import duty (${payload.duty_rate_percent}% of CIF)`, fmtPKR(payload.customs_cost_pkr)],
            ['Per unit', fmtPKR(c.unit_landed_cost_pkr)],
          ]} total={['Total landed', `${fmtPKR(payload.total_landed_cost_pkr)} · ${fmtUSD(payload.total_landed_cost_pkr / c.exchange_rate_used)}`]} />
        </div>
        <div className="card">
          <h3>Tariff Details</h3>
          <KV rows={[
            ['HS / PCT code', tariff.pct_code],
            ['Duty rate', `${payload.duty_rate_percent}%`],
            ['Rate status', c.duty_rate_source === 'confirmed' ? 'Confirmed (FBR)' : 'Default fallback'],
            ['Exchange rate', `Rs ${c.exchange_rate_used} · ${statusLabel(c.exchange_rate_status)}`],
            ['Source', 'FBR Pakistan'],
          ]} />
          <div className="note">Rates are estimates and may vary by specification and origin. Confirm with your clearing agent.</div>
          {c.duty_rate_source !== 'confirmed' && <div className="warn">No confirmed tariff line for this product; a default duty rate was used.</div>}
        </div>
      </div>
    </>
  );
}

function ViabilityTab({ payload }: { payload: TradePayload }) {
  const { product, budget, rates, quantity } = useApp();
  const bm = useBenchmark(payload);
  if (!product || !bm) return null;
  const unit = payload.calculations.unit_landed_cost_pkr;
  const affordable = unit > 0 ? Math.floor(budget / unit) : 0;
  const mc = moqCostPkr(product, rates);
  const fits = fitsBudget(product, budget, rates);
  const profitUnit = bm.last.market_price - unit;
  const ai = payload.ai_explanation;
  const a = payload.analysis;
  return (
    <div className="row">
      <div className="card">
        <h3>Viability for {fmtPKR(budget)}</h3>
        <KV rows={[
          ['Min order cost (FOB)', fmtPKR(mc)],
          [`Total landed for ${quantity} units`, fmtPKR(payload.total_landed_cost_pkr)],
          ['Units affordable (landed)', affordable],
          ['Est. profit / unit (benchmark)', fmtPKR(profitUnit)],
          ['Est. total potential profit', fmtPKR(Math.max(0, affordable) * profitUnit)],
        ]} />
        <div className="note">{fits ? '✅ MOQ fits within your budget.' : '⚠️ MOQ exceeds your budget.'} Profit figures use a category benchmark, not a quote.</div>
        <div className="kv2" style={{ marginTop: 14 }}>
          <div>Viability score<b>{payload.viability_score}/100</b></div>
          <div>Data confidence<b>{statusLabel(a.data_confidence)}</b></div>
          <div>MOQ level<b>{a.moq_level}</b></div>
          <div>Trade Assurance<b>{a.trade_assurance_status == null ? 'Unknown' : a.trade_assurance_status ? 'Yes' : 'No'}</b></div>
        </div>
      </div>
      <div className="card">
        <h3>Analysis</h3>
        <p className="sub" style={{ fontSize: 14, margin: '6px 0 10px' }}>{ai.reasoning || payload.risk_summary}</p>
        {ai.strengths.length > 0 && <><b style={{ fontSize: 13 }}>Strengths</b>{ai.strengths.map((s) => <div className="li" key={s}>✅ {s}</div>)}</>}
        {ai.risks.length > 0 && <><b style={{ fontSize: 13 }}>Risks</b>{ai.risks.map((s) => <div className="li" key={s}>⚠️ {s}</div>)}</>}
        {ai.warnings.length > 0 && ai.warnings.map((s) => <div className="warn" key={s}>{s}</div>)}
        {ai.recommendation && <div className="note"><b>Recommendation:</b> {ai.recommendation}</div>}
        <p className="mut small" style={{ marginTop: 10 }}>
          Confidence: {String(ai.confidence)} · AI explanation {a.qwen_status === 'available' ? 'by Gemini' : 'generated from dataset rules'}
        </p>
      </div>
    </div>
  );
}

function HistoryTab({ payload }: { payload: TradePayload }) {
  const { auditLogs, pid } = useApp();
  const bm = useBenchmark(payload);
  if (!bm) return null;
  const pts = bm.trend.historical_data;
  const all = pts.flatMap((p) => [p.landed_cost, p.market_price]);
  const lo = Math.min(...all) * 0.9, hi = Math.max(...all) * 1.05;
  const x = (i: number) => 40 + (i * 500) / Math.max(1, pts.length - 1);
  const y = (v: number) => 180 - ((v - lo) / (hi - lo || 1)) * 150;
  const line = (k: 'landed_cost' | 'market_price') => pts.map((p, i) => `${x(i)},${y(p[k])}`).join(' ');
  const logs = auditLogs.filter((l) => l.record_id === `REC-${pid}`).slice(0, 8);
  const last = pts[pts.length - 1];
  return (
    <>
      {!bm.hasBenchmark ? (
        <div className="card">
          <h3>Price Trends</h3>
          <p className="sub" style={{ fontSize: 13, margin: '10px 0 0' }}>No price-trend benchmark is available for {payload.category} yet, so no chart is shown rather than reusing another category's curve.</p>
        </div>
      ) : (
      <div className="card">
        <h3>Price Trends · {bm.trend.category} benchmark</h3>
        <svg viewBox="0 0 580 215" style={{ width: '100%' }} role="img" aria-label="Landed cost versus local wholesale price over time">
          <polyline fill="none" stroke="#15803D" strokeWidth="3" points={line('market_price')} />
          <polyline fill="none" stroke="#EA580C" strokeWidth="3" points={line('landed_cost')} />
          {pts.map((p, i) => <text key={p.period} x={x(i) - 16} y="204" fontSize="10" fill="#6B5B4F">{p.month}</text>)}
        </svg>
        <Tag>● Local wholesale {fmtPKR(last.market_price)}</Tag> <Tag kind="w">● Landed cost {fmtPKR(last.landed_cost)}</Tag>{' '}
        <Tag kind="n">{bm.trend.trend_direction} · {bm.trend.volatility_rating} volatility</Tag>
        <p className="sub" style={{ fontSize: 13, margin: '10px 0 0' }}>{bm.trend.summary}</p>
        <p className="mut small">Illustrative category benchmark scaled to this product's landed cost; not live market data.</p>
      </div>
      )}
      <br />
      <div className="card">
        <h3>Audit History</h3>
        {logs.length === 0 ? <p className="mut" style={{ marginTop: 8 }}>No changes recorded for this product yet.</p> : (
          <table><tbody>{logs.map((l) => (
            <tr key={l.id}><td>{l.field_name}: {String(l.previous_value)} → {String(l.new_value)}</td><td>{fmtDate(l.timestamp)}</td></tr>
          ))}</tbody></table>
        )}
      </div>
    </>
  );
}

export function Product() {
  const { product, tab, go, seen, pid, unlocked, payload, markSeen } = useApp();
  useEffect(() => { if (product) markSeen(tab); }, [product, tab, markSeen]);
  if (!product) return <Products />;

  const i = TABS.indexOf(tab);
  const done = (t: ProductTab) => !!(pid && seen[pid]?.[t]);
  const next = i < TABS.length - 1
    ? <button className="btn" type="button" onClick={() => go('prod', { tab: TABS[i + 1] })}>Next: {TABS[i + 1]} →</button>
    : <button className="btn" type="button" disabled={!unlocked} onClick={() => go('mkt')}>{unlocked ? 'Continue to Launch →' : 'Finish earlier steps to unlock Launch'}</button>;

  let body = <p><Spinner /> Loading analysis…</p>;
  if (tab === 'Suppliers & RFQ') body = <SuppliersTab />;
  else if (payload) {
    body = tab === 'Overview' ? <Overview payload={payload} />
      : tab === 'Cost Analysis' ? <CostTab payload={payload} />
      : tab === 'Viability' ? <ViabilityTab payload={payload} />
      : <HistoryTab payload={payload} />;
  }

  return (
    <AppShell on="prod">
      <A onClick={() => go('list')} style={{ color: 'var(--or)', fontSize: 13 }}>← Products</A>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', margin: '10px 0' }}>
        <ProductImage product={product} size={80} />
        <div>
          <h1 style={{ fontSize: 24 }}>{product.product_name}</h1>
          <Tag kind={statusKind(product.data_status)}>{statusLabel(product.data_status)}</Tag>{' '}
          <span className="mut small">{product.product_id} · {product.supplier_name.length > 60 ? product.supplier_name.slice(0, 57) + '…' : product.supplier_name}</span>
        </div>
      </div>
      <div className="pf">{TABS.map((t) => <i key={t} className={`${done(t) ? 'd' : ''} ${t === tab ? 'c' : ''}`} />)}</div>
      <div className="tabs">
        {TABS.map((t) => <A key={t} className={t === tab ? 'on' : ''} onClick={() => go('prod', { tab: t })}>{t}</A>)}
      </div>
      {body}
      <div className="nx">
        <button className="btn o" type="button" disabled={i === 0} onClick={() => go('prod', { tab: TABS[Math.max(0, i - 1)] })}>← Back</button>
        {next}
      </div>
    </AppShell>
  );
}
