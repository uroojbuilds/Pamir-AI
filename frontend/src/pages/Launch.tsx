import { useEffect, useState, type ReactNode } from 'react';
import { importGuidanceService, launchKitService, marketingService } from '../services';
import { generateWanxCopywriting } from '../utils/wanxCopywriter';
import { useAsync } from '../lib/useAsync';
import { ProductImage } from '../components/ProductImage';
import { fmtPKR } from '../lib/format';
import { useApp, type View } from '../state/AppContext';
import { AppShell } from '../components/Shell';
import { A, KV, Spinner, Tag, copyText } from '../components/ui';

const LAUNCH_TABS: [View, string][] = [['mkt', 'Marketing Studio'], ['kit', 'Launch Kit'], ['guide', 'Import Guidance']];

function Locked({ on, title }: { on: View; title: string }) {
  const { pid, go } = useApp();
  return (
    <AppShell on={on}>
      <h1>{title}</h1>
      <div className="card" style={{ marginTop: 18, textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 40 }}>🔒</div>
        <h3>Analyze a product first</h3>
        <p className="sub">Launch tools are built for a specific product. Complete Overview, Cost Analysis, Viability and Suppliers &amp; RFQ first.</p>
        <button className="btn" type="button" onClick={() => go(pid ? 'prod' : 'disc')}>{pid ? 'Continue analysis' : 'Start a project'}</button>
      </div>
    </AppShell>
  );
}

function LaunchLayout({ on, title, children }: { on: View; title: string; children: ReactNode }) {
  const { unlocked, product, go } = useApp();
  if (!unlocked || !product) return <Locked on={on} title={title} />;
  return (
    <AppShell on={on}>
      <div className="tabs">
        {LAUNCH_TABS.map((a) => <A key={a[0]} className={a[0] === on ? 'on' : ''} onClick={() => go(a[0])}>{a[1]}</A>)}
      </div>
      <h1>{title}</h1>
      <p className="sub">For: <ProductImage product={product} size={28} /> {product.product_name}</p>
      {children}
    </AppShell>
  );
}

const ErrorCard = ({ msg, retry }: { msg: string; retry: () => void }) => (
  <div className="card">
    <div className="err">{msg}</div>
    <p className="mut small" style={{ marginBottom: 10 }}>This tool needs the Pamir backend. Check that it is running and try again.</p>
    <button className="btn o sm" type="button" onClick={retry}>Retry</button>
  </div>
);

const LANGS: [string, string][] = [['english', 'English'], ['urdu', 'اردو'], ['roman_urdu', 'Roman Urdu']];

export function Marketing() {
  const { product, toast, record } = useApp();
  const [lang, setLang] = useState('english');
  const { data, error, loading, reload } = useAsync(async () => {
    if (!product) throw new Error('No product selected');
    try {
      const d = await marketingService.getMarketingCopy({ productId: product.product_id, language: lang });
      return { desc: d.product_description, cap: d.social_media_caption, source: d.source as string };
    } catch (e) {
      if (lang !== 'english') throw e;
      const l = generateWanxCopywriting(product); // offline template, English only
      return { desc: l.product_description, cap: l.social_media_caption, source: 'offline template' };
    }
  }, `${product?.product_id}|${lang}`);

  const copy = (t: string, what: string) => {
    copyText(t, toast);
    if (product) record(`REC-${product.product_id}`, 'export_action', 'none', `MARKETING_${what}_COPIED`, 'EXPORT_EXECUTED');
  };
  return (
    <LaunchLayout on="mkt" title="Marketing Studio">
      <div className="chips" style={{ marginTop: 0, marginBottom: 18 }}>
        {LANGS.map((l) => (
          <button key={l[0]} type="button" className={`chip${lang === l[0] ? ' on' : ''}`} onClick={() => setLang(l[0])}>{l[1]}</button>
        ))}
      </div>
      {loading && <p><Spinner /> Writing your copy…</p>}
      {error && <ErrorCard msg={error} retry={reload} />}
      {data && !loading && (
        <div className="row">
          <div className="card">
            <b>Product description</b>
            <div className="pre" style={{ marginTop: 10 }} dir={lang === 'urdu' ? 'rtl' : 'ltr'}>{data.desc}</div>
            <button className="btn sm o" type="button" style={{ marginTop: 10 }} onClick={() => copy(data.desc, 'DESCRIPTION')}>Copy</button>
          </div>
          <div className="card">
            <b>Social media caption</b>
            <div className="pre" style={{ marginTop: 10 }} dir={lang === 'urdu' ? 'rtl' : 'ltr'}>{data.cap}</div>
            <button className="btn sm o" type="button" style={{ marginTop: 10 }} onClick={() => copy(data.cap, 'CAPTION')}>Copy</button>
          </div>
        </div>
      )}
      {data && <p className="mut small" style={{ marginTop: 12 }}>Source: {data.source === 'fallback' ? 'Pamir template (no image/AI service configured)' : data.source}. Review and edit before posting.</p>}
    </LaunchLayout>
  );
}

export function LaunchKit() {
  const { product, quantity } = useApp();
  const { data, error, loading, reload } = useAsync(
    () => launchKitService.getLaunchKit({ productId: product!.product_id, quantity }),
    `${product?.product_id}|${quantity}`,
  );
  const storeKey = `pamirai_kit_${product?.product_id}`;
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  useEffect(() => {
    try { setChecked(JSON.parse(localStorage.getItem(storeKey) || '{}')); } catch { setChecked({}); }
  }, [storeKey]);
  const toggle = (item: string) => {
    const next = { ...checked, [item]: !checked[item] };
    setChecked(next);
    try { localStorage.setItem(storeKey, JSON.stringify(next)); } catch { /* ignore */ }
  };
  return (
    <LaunchLayout on="kit" title="Launch Kit">
      {loading && <p><Spinner /> Building your launch kit…</p>}
      {error && <ErrorCard msg={error} retry={reload} />}
      {data && (
        <div className="row">
          <div className="card">
            <h3>Cost summary · {data.quantity} units</h3>
            <KV rows={[
              ['Product cost', fmtPKR(data.cost_summary.product_cost_pkr)],
              ['Shipping', fmtPKR(data.cost_summary.shipping_cost_pkr)],
              [`Import duty (${data.cost_summary.duty_rate_percent}%)`, fmtPKR(data.cost_summary.customs_cost_pkr)],
            ]} total={['Total landed', fmtPKR(data.cost_summary.total_landed_cost_pkr)]} />
            <p className="mut small" style={{ marginTop: 8 }}>Viability {data.viability_score}/100 · supplier {data.supplier_name}</p>
            <br />
            <h3>Product description</h3>
            <div className="pre" style={{ marginTop: 10 }}>{data.marketing.description}</div>
          </div>
          <div className="card">
            <h3>Launch checklist</h3>
            <br />
            {data.import_checklist.map((t) => (
              <label key={t} className="lbl"><input type="checkbox" checked={!!checked[t]} onChange={() => toggle(t)} />{t}</label>
            ))}
            <p className="mut small">{Object.values(checked).filter(Boolean).length} of {data.import_checklist.length} done · saved on this device</p>
          </div>
        </div>
      )}
    </LaunchLayout>
  );
}

export function Guidance() {
  const { product } = useApp();
  const { data, error, loading, reload } = useAsync(
    () => importGuidanceService.getImportGuidance({ productId: product!.product_id }),
    String(product?.product_id),
  );
  const list = (title: string, items: { item: string; note?: string; data_status: string }[]) => items.length > 0 && (
    <div className="card" style={{ marginBottom: 16 }}>
      <h3>{title}</h3>
      {items.map((x, i) => (
        <div className="li" key={i}>
          <span className="step">{i + 1}.</span> {x.item} <Tag kind={x.data_status === 'verified' ? undefined : 'n'}>{x.data_status}</Tag>
          {x.note && <div className="mut small">{x.note}</div>}
        </div>
      ))}
    </div>
  );
  return (
    <LaunchLayout on="guide" title="Import Guidance">
      {loading && <p><Spinner /> Loading guidance…</p>}
      {error && <ErrorCard msg={error} retry={reload} />}
      {data && (
        <>
          {list('Before ordering', data.before_ordering)}
          <div className="card" style={{ marginBottom: 16 }}>
            <h3>Customs</h3>
            <KV rows={[
              ['PCT code', data.customs.pct_code ?? 'Not classified'],
              ['Duty rate', data.customs.duty_rate_percent != null ? `${data.customs.duty_rate_percent}%` : 'Unknown'],
              ['Source', data.customs.source ? `${data.customs.source}${data.customs.source_date ? ' · ' + data.customs.source_date : ''}` : '—'],
            ]} />
            {data.customs.classification_note && <div className="note">{data.customs.classification_note}</div>}
          </div>
          {list('Documentation', data.documentation)}
          {list('Supplier checks', data.supplier_checks)}
          {data.warnings.map((w) => <div className="warn" key={w}>{w}</div>)}
          <div className="note">{data.disclaimer}</div>
        </>
      )}
    </LaunchLayout>
  );
}
