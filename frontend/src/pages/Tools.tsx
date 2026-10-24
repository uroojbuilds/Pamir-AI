import { useMemo, useState } from 'react';
import { CUSTOMS_TARIFFS, SHIPPING_METHODS } from '../data/tradeData';
import { fmtPKR, fmtUSD, statusKind, statusLabel } from '../lib/format';
import { useApp } from '../state/AppContext';
import { AppShell } from '../components/Shell';
import { KV, Spinner, Tag } from '../components/ui';

export function Calculator() {
  const { catalog, rates, product } = useApp();
  const air = SHIPPING_METHODS.find((s) => s.shipping_method === 'Air') ?? SHIPPING_METHODS[0];
  const [price, setPrice] = useState('5');
  const [weight, setWeight] = useState('0.3');
  const [duty, setDuty] = useState('20');
  const [qty, setQty] = useState('1');

  const load = (id: string) => {
    const p = catalog.find((x) => x.product_id === id);
    if (!p) return;
    setPrice(String(p.supplier_price ?? ''));
    setWeight(String(p.weight_kg ?? ''));
    setQty(String(p.moq ?? 1));
  };

  const c = useMemo(() => {
    const n = Math.max(1, Math.round(+qty || 1));
    const p = (+price || 0) * n;
    const f = (+weight || 0) * n * air.estimated_cost;
    const d = (p + f) * ((+duty || 0) / 100);
    return { n, p, f, d, t: p + f + d };
  }, [price, weight, duty, qty, air.estimated_cost]);

  return (
    <AppShell on="calc">
      <h1>Import Cost Calculator</h1>
      <p className="sub">Quick check for any product. Same formula as the analysis: FOB + air freight, duty on the CIF value.</p>
      <div className="row">
        <div className="card">
          <label htmlFor="cl">Load a product (optional)</label>
          <select id="cl" defaultValue={product?.product_id ?? ''} onChange={(e) => load(e.target.value)}>
            <option value="">Custom values</option>
            {catalog.map((p) => <option key={p.product_id} value={p.product_id}>{p.product_id} · {p.product_name.slice(0, 48)}</option>)}
          </select>
          <label htmlFor="cp">Unit price (USD)</label>
          <input id="cp" type="number" min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
          <label htmlFor="cw">Unit weight (kg)</label>
          <input id="cw" type="number" min={0} step="0.01" value={weight} onChange={(e) => setWeight(e.target.value)} />
          <label htmlFor="cq">Quantity</label>
          <input id="cq" type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} />
          <label htmlFor="cd">Duty %</label>
          <input id="cd" type="number" min={0} step="0.5" value={duty} onChange={(e) => setDuty(e.target.value)} />
        </div>
        <div className="card">
          <h3>Cost Breakdown · {c.n} units</h3>
          <KV rows={[
            ['Product', `${fmtUSD(c.p)} · ${fmtPKR(c.p * rates.interbank)}`],
            [`Air freight ($${air.estimated_cost}/kg)`, `${fmtUSD(c.f)} · ${fmtPKR(c.f * rates.interbank)}`],
            ['Duty', `${fmtUSD(c.d)} · ${fmtPKR(c.d * rates.interbank)}`],
            ['Per unit', fmtPKR((c.t / c.n) * rates.interbank)],
          ]} total={['Total', `${fmtUSD(c.t)} · ${fmtPKR(c.t * rates.interbank)}`]} />
          <div className="note">Rate: Rs {rates.interbank}/USD ({rates.updated}). Freight: {air.source_date}. Estimate only; confirm with your clearing agent.</div>
        </div>
      </div>
    </AppShell>
  );
}

export function Converter() {
  const { rates, refreshRates, toast } = useApp();
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState<'USD' | 'PKR' | 'CNY'>('USD');
  const perUsd = { USD: 1, PKR: rates.interbank, CNY: rates.cny };
  const usd = (+amount || 0) / perUsd[from];
  const out: ('USD' | 'PKR' | 'CNY')[] = ['USD', 'PKR', 'CNY'];
  const fmt = (cur: string, v: number) => (cur === 'PKR' ? fmtPKR(v) : `${cur === 'USD' ? '$' : '¥'}${v.toLocaleString('en-US', { maximumFractionDigits: 2 })}`);
  return (
    <AppShell on="fx">
      <h1>Currency Converter</h1>
      <p className="sub">USD, PKR and CNY reference rates: live reference when available, otherwise the SBP interbank snapshot in our dataset.</p>
      <div className="row">
        <div className="card">
          <label htmlFor="fa">Amount</label>
          <input id="fa" type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} />
          <label htmlFor="ff">Currency</label>
          <select id="ff" value={from} onChange={(e) => setFrom(e.target.value as typeof from)}>
            {out.map((c) => <option key={c}>{c}</option>)}
          </select>
          {out.filter((c) => c !== from).map((c) => (
            <div key={c} style={{ fontSize: 28, fontWeight: 800, color: 'var(--or)' }}>{fmt(c, usd * perUsd[c])}</div>
          ))}
        </div>
        <div className="card">
          <h3>Rates</h3>
          <KV rows={[
            ['USD → PKR (interbank)', <>Rs {rates.interbank} <Tag>Verified</Tag></>],
            ['USD → PKR (open market)', <>Rs {rates.openMarket} <Tag kind="w">Curated</Tag></>],
            ['USD → CNY', <>¥{rates.cny} <Tag kind="n">Estimated</Tag></>],
          ]} />
          <p className="mut small" style={{ margin: '10px 0' }}>As of {rates.updated}. {rates.fromBackend ? 'From the Pamir backend.' : 'Reference baseline (backend not reachable).'}</p>
          <button className="btn o sm" type="button" disabled={rates.loading} onClick={() => refreshRates().then(() => toast('Rates refreshed'))}>
            {rates.loading ? <Spinner /> : 'Refresh rates'}
          </button>
          {rates.note && <div className="note">{rates.note}</div>}
        </div>
      </div>
    </AppShell>
  );
}

export function Tariff() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const cats = ['All', ...Array.from(new Set(CUSTOMS_TARIFFS.map((t) => t.category)))];
  const rows = CUSTOMS_TARIFFS.filter((t) =>
    (cat === 'All' || t.category === cat) &&
    `${t.pct_code} ${t.description} ${t.category}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <AppShell on="tariff">
      <h1>FBR Tariff Lookup</h1>
      <p className="sub">Pakistan Customs Tariff (PCT) lines used by the cost engine. Search by code, product or category.</p>
      <div className="card">
        <label htmlFor="tq">Search</label>
        <input id="tq" placeholder="e.g. 8518 or earphones" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="chips" style={{ marginTop: 0 }}>
          {cats.map((c) => <button key={c} type="button" className={`chip${c === cat ? ' on' : ''}`} onClick={() => setCat(c)}>{c}</button>)}
        </div>
      </div>
      <br />
      <div className="card scroll">
        <table className="wide">
          <thead><tr><th>PCT code</th><th>Description</th><th>Category</th><th>Duty</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.pct_code + t.description.slice(0, 12)}>
                <td><b>{t.pct_code}</b></td>
                <td>{t.description}<div className="mut small">{t.source} · {t.source_date}</div></td>
                <td>{t.category}</td>
                <td><b>{t.duty_rate}%</b></td>
                <td><Tag kind={statusKind(t.data_status)}>{statusLabel(t.data_status)}</Tag></td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="mut" style={{ padding: 12 }}>No tariff lines match.</p>}
      </div>
      <div className="note">Rates are estimates and may vary by specification and origin. Confirm with FBR / WeBOC or your clearing agent.</div>
    </AppShell>
  );
}
