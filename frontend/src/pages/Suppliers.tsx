import { useCallback, useEffect, useState } from 'react';
import { rfqService, supplierService, type BackendSupplierMatch, type RfqDraftResponse } from '../services';
import type { SupplierProfile } from '../utils/supplierHelper';
import { fmtPKR, fmtUSD, statusKind, statusLabel } from '../lib/format';
import { useApp } from '../state/AppContext';
import { A, Spinner, Tag, copyText } from '../components/ui';
import { ProductImage } from '../components/ProductImage';

const INCOTERMS = ['FOB', 'EXW', 'CIF'] as const;
const PORTS = ['Karachi', 'Port Qasim', 'Lahore (dry port)', 'Islamabad'];

function zhText(r: NonNullable<RfqDraftResponse['raw']>, incoterm: string, port: string) {
  const price = r.reference_unit_price_usd != null ? `$${r.reference_unit_price_usd}` : '暂无';
  return [
    '报价请求 (RFQ)', '',
    `编号：${r.rfq_id}`, `产品：${r.product_name}`, `供应商：${r.supplier_name}`,
    `数量：${r.requested_quantity} 件${r.meets_moq ? '' : '（低于起订量）'}`,
    `参考单价：${price}`,
    r.target_price_usd != null ? `目标价格：$${r.target_price_usd}` : '',
    `贸易条款：${incoterm} · 目的地：${port}，巴基斯坦`, '有效期：30天', '',
    '尊敬的供应商：', '我们有意采购该产品，请提供最优价格、最小起订量、交期、样品政策及质保信息。', '',
    ...r.supplier_questions.map((q, i) => `${i + 1}. ${q}`), '', '此致', 'Pamir AI',
  ].filter((l, i, a) => l !== '' || a[i - 1] !== '').join('\n');
}

function SupplierCards() {
  const { product, budget, cat, selectProduct } = useApp();
  const [profile, setProfile] = useState<SupplierProfile | null>(null);
  const [matches, setMatches] = useState<BackendSupplierMatch[] | null>(null);
  const [matchErr, setMatchErr] = useState(false);

  useEffect(() => {
    if (!product) return;
    let off = false;
    setProfile(null); setMatches(null); setMatchErr(false);
    supplierService.getSupplierProfile(product).then((p) => { if (!off) setProfile(p); });
    supplierService.getSupplierMatches({ capital: budget, category: cat })
      .then((m) => { if (!off) setMatches(m.filter((x) => x.product_id !== product.product_id).slice(0, 2)); })
      .catch(() => { if (!off) setMatchErr(true); });
    return () => { off = true; };
  }, [product, budget, cat]);

  if (!product) return null;
  const ta = profile?.trade_assurance ?? product.trade_assurance;
  return (
    <div className="g3">
      <div className="card">
        <div className="ic">🏭</div>
        <b>{product.supplier_name}</b>
        <p className="sub" style={{ margin: '4px 0' }}>China · {product.supplier_id}</p>
        <Tag kind={statusKind(product.data_status)}>{statusLabel(product.data_status)}</Tag>{' '}
        <Tag kind={ta ? undefined : 'w'}>{ta == null ? 'Trade Assurance unknown' : ta ? 'Trade Assurance' : 'No Trade Assurance'}</Tag>
        <p className="mut small" style={{ marginTop: 10 }}>Source: {product.source} · {product.source_date}</p>
        {!profile ? <p style={{ marginTop: 8 }}><Spinner /></p> : (
          <div style={{ marginTop: 8 }}>
            {profile.marketplace_links.slice(0, 3).map((l) => (
              <div key={l.url}><a href={l.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--or)', fontSize: 13 }}>{l.name} ↗</a></div>
            ))}
          </div>
        )}
      </div>
      {(matches ?? []).map((m) => (
        <div className="card" key={m.product_id}>
          <ProductImage product={m} height={120} />
          <b style={{ fontSize: 14 }}>{m.product_name}</b>
          <p className="sub" style={{ margin: '4px 0', fontSize: 13 }}>{m.supplier_name.length > 50 ? m.supplier_name.slice(0, 47) + '…' : m.supplier_name}</p>
          <p style={{ fontSize: 13, margin: '4px 0' }}>{fmtPKR(m.unit_price_pkr)} / unit · MOQ {m.moq} · est. {fmtPKR(m.estimated_total_pkr)}</p>
          <Tag kind={statusKind(m.data_status)}>{statusLabel(m.data_status)}</Tag>{' '}
          <Tag kind="n">Match {m.match_score}</Tag>
          <div style={{ marginTop: 10 }}><button className="btn sm o" type="button" onClick={() => selectProduct(m.product_id)}>Analyze this lot →</button></div>
        </div>
      ))}
      {matches === null && !matchErr && <div className="card mut"><Spinner /> Finding other lots within your budget…</div>}
      {matchErr && <div className="card mut small">Other matches are unavailable while the backend is offline.</div>}
    </div>
  );
}

export function SuppliersTab() {
  const { product, quantity, toast, record, go } = useApp();
  const [qty, setQty] = useState(quantity);
  const [term, setTerm] = useState<(typeof INCOTERMS)[number]>('FOB');
  const [port, setPort] = useState(PORTS[0]);
  const [target, setTarget] = useState('');
  const [notes, setNotes] = useState('');
  const [lang, setLang] = useState<'EN' | 'ZH'>('EN');
  const [busy, setBusy] = useState(false);
  const [rfq, setRfq] = useState<RfqDraftResponse | null>(null);

  const generate = useCallback(async () => {
    if (!product) return;
    setBusy(true);
    const r = await rfqService.generateRfq({
      productId: product.product_id, productName: product.product_name, supplierName: product.supplier_name,
      quantity: Math.max(1, qty || 1), targetPriceUsd: target ? +target : undefined,
      incoterm: term, destinationPort: port, customNotes: notes.trim() || undefined,
    });
    setRfq(r);
    setBusy(false);
  }, [product, qty, target, term, port, notes]);

  // first draft as soon as the tab opens / the product changes
  useEffect(() => { setQty(quantity); }, [product?.product_id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { generate(); }, [product?.product_id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!product) return null;
  const text = !rfq ? '' : lang === 'ZH' && rfq.raw
    ? zhText(rfq.raw, term, port)
    : `${rfq.generatedText}\n\nRequested delivery terms: ${term} · destination ${port}, Pakistan`;

  return (
    <>
      <SupplierCards />
      <br />
      <div className="row">
        <div className="card">
          <h3>Generate RFQ</h3>
          <br />
          <label htmlFor="rq">Quantity</label>
          <input id="rq" type="number" min={1} value={qty || ''} onChange={(e) => setQty(+e.target.value)} />
          <label htmlFor="rt">Delivery terms</label>
          <select id="rt" value={term} onChange={(e) => setTerm(e.target.value as typeof term)}>
            {INCOTERMS.map((t) => <option key={t}>{t}</option>)}
          </select>
          <label htmlFor="rp">Destination</label>
          <select id="rp" value={port} onChange={(e) => setPort(e.target.value)}>
            {PORTS.map((t) => <option key={t}>{t}</option>)}
          </select>
          <label htmlFor="rg">Target unit price (USD, optional)</label>
          <input id="rg" type="number" min={0} step="0.01" value={target} placeholder={product.supplier_price != null ? String(product.supplier_price) : ''} onChange={(e) => setTarget(e.target.value)} />
          <label htmlFor="rn">Notes (optional)</label>
          <textarea id="rn" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          <button className="btn" type="button" onClick={generate} disabled={busy}>{busy ? <Spinner /> : 'Generate RFQ'}</button>
        </div>
        <div className="card">
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
            <button className={`btn sm ${lang === 'EN' ? '' : 'o'}`} type="button" onClick={() => setLang('EN')}>English</button>
            <button className={`btn sm ${lang === 'ZH' ? '' : 'o'}`} type="button" onClick={() => setLang('ZH')}>中文</button>
            <span style={{ flex: 1 }} />
            <button className="btn sm o" type="button" disabled={!text} onClick={() => {
              copyText(text, toast);
              record(`REC-${product.product_id}`, 'rfq_copied', 'none', rfq?.rfqId ?? 'draft', 'EXPORT_EXECUTED');
            }}>Copy RFQ</button>
          </div>
          <div className="pre" aria-live="polite">{busy && !text ? 'Generating…' : text}</div>
          {lang === 'ZH' && rfq && !rfq.raw && <div className="warn">The Chinese version needs the backend; showing the offline draft.</div>}
          {rfq?.raw && rfq.raw.reference_unit_price_usd != null && (
            <p className="mut small" style={{ marginTop: 8 }}>
              Reference price {fmtUSD(rfq.raw.reference_unit_price_usd)} · {rfq.raw.price_source}. You send the RFQ yourself; Pamir does not contact suppliers.
            </p>
          )}
          <p className="mut small" style={{ marginTop: 6 }}>Need to change the lot? <A onClick={() => go('list')} style={{ color: 'var(--or)' }}>Back to products</A></p>
        </div>
      </div>
    </>
  );
}
