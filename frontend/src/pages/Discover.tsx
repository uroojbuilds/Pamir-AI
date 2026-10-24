import { CATEGORY_ICONS } from '../lib/content';
import { ProductImage } from '../components/ProductImage';
import { fmtPKR, fmtUSD, statusKind, statusLabel } from '../lib/format';
import { fitsBudget, moqCostPkr, priceUsd } from '../lib/product';
import { useApp } from '../state/AppContext';
import { AppShell } from '../components/Shell';
import { A, Spinner, Tag } from '../components/ui';

export function Discover() {
  const { budget, setBudget, cat, setCat, catalog, commitParam, go } = useApp();
  const live = Array.from(new Set(catalog.map((p) => p.category)));
  const count = (c: string) => catalog.filter((p) => p.category === c).length;
  return (
    <AppShell on="disc">
      <div className="pf"><i className="c" /><i /></div>
      <h1>Step 1 · Budget &amp; Category</h1>
      <p className="sub">Start from what you can spend, not from what to import.</p>
      <div className="card">
        <label htmlFor="bd">Your budget (PKR)</label>
        <input id="bd" type="number" min={0} step={1000} value={budget || ''}
               onChange={(e) => setBudget(+e.target.value)} onBlur={() => commitParam('capital')} />
        <div className="chips">
          {[50000, 150000, 300000, 500000].map((b) => (
            <button type="button" key={b} className="chip" onClick={() => { setBudget(b); commitParam('capital', b); }}>
              Rs {b.toLocaleString('en-US')}
            </button>
          ))}
        </div>
      </div>
      <br />
      <h3>Category</h3>
      <br />
      <div className="g4">
        {live.map((c) => (
          <A key={c} className={`card cat ${cat === c ? 'on' : ''}`} onClick={() => { setCat(c); commitParam('category', c); }}>
            <div className="ic" style={{ margin: '0 auto 10px' }}>{CATEGORY_ICONS[c] ?? '📦'}</div>
            <b>{c}</b><br /><small>{count(c)} products</small>
          </A>
        ))}
      </div>
      <div className="nx"><span /><button className="btn" type="button" onClick={() => go('list')}>Show products →</button></div>
    </AppShell>
  );
}

export function Products() {
  const { budget, cat, q, catalog, catalogLoading, rates, selectProduct, go } = useApp();
  const list = catalog.filter((p) => p.category === cat && p.product_name.toLowerCase().includes(q.toLowerCase()));
  return (
    <AppShell on="list">
      <div className="pf"><i className="d" /><i className="c" /></div>
      <h1>Step 2 · Products</h1>
      <p className="sub">
        {cat} · budget {fmtPKR(budget)} · <A onClick={() => go('disc')} style={{ color: 'var(--or)' }}>change</A>{' '}
        {catalogLoading && <Spinner />}
      </p>
      <div className="g3">
        {list.map((p) => {
          const ok = fitsBudget(p, budget, rates);
          const cost = moqCostPkr(p, rates);
          return (
            <div className="card" key={p.product_id} style={ok ? undefined : { opacity: 0.65 }}>
              <ProductImage product={p} />
              <b style={{ fontSize: 14 }}>{p.product_name}</b>
              <p className="sub" style={{ margin: '4px 0', fontSize: 13 }}>
                {fmtUSD(priceUsd(p, rates))} FOB · MOQ {p.moq ?? '—'}
              </p>
              <Tag kind={statusKind(p.data_status)}>{statusLabel(p.data_status)}</Tag>{' '}
              <Tag kind={ok ? undefined : 'w'}>{p.supplier_price == null ? 'No price data' : cost == null ? 'MOQ unknown' : ok ? 'Within budget' : 'Over budget'}</Tag>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <small>{cost == null ? 'MOQ cost unavailable' : `MOQ cost ${fmtPKR(cost)}`}</small>
                <button className="btn sm" type="button" onClick={() => selectProduct(p.product_id)}>Analyze →</button>
              </div>
            </div>
          );
        })}
      </div>
      {list.length === 0 && <p>No products match.</p>}
    </AppShell>
  );
}
