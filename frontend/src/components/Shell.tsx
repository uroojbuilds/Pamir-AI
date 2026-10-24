import { useState, type ReactNode } from 'react';
import { TABS } from '../lib/content';
import { ProductImage } from './ProductImage';
import { fmtPKR, initials } from '../lib/format';
import { useApp, type View } from '../state/AppContext';
import { A, Logo, Tag } from './ui';
import { AppFooter } from './Footers';

function Sidebar({ on }: { on: View }) {
  const { go, product, tab, seen, pid, unlocked, user, signOut } = useApp();
  const done = (t: string) => !!(pid && (seen[pid] as Record<string, true> | undefined)?.[t]);
  const L = (v: View, text: string, cls = '') => (
    <A className={`${v === on ? 'on' : ''} ${cls}`.trim()} onClick={() => go(v)}>{text}</A>
  );
  const lock = unlocked ? '' : 'lock';
  return (
    <div className="side">
      <Logo onClick={() => go('dash')} />
      <div className="scr">
        {L('dash', '🏠 Dashboard')}
        <div className="grp">1 · DISCOVER</div>
        {L('disc', 'Budget & Category')}
        {L('list', 'Products')}
        {product && (
          <>
            <div className="grp">MY PRODUCT · <ProductImage product={product} size={22} /></div>
            {TABS.map((t) => (
              <A key={t} className={`sub2 ${on === 'prod' && tab === t ? 'on' : ''}`} onClick={() => go('prod', { tab: t })}>
                {done(t) ? '✓' : '○'} {t}
              </A>
            ))}
          </>
        )}
        <div className="grp">LAUNCH {unlocked ? '' : '🔒'}</div>
        {L('mkt', 'Marketing Studio', lock)}
        {L('kit', 'Launch Kit', lock)}
        {L('guide', 'Import Guidance', lock)}
        <div className="grp">TOOLS</div>
        {L('calc', 'Import Cost Calculator')}
        {L('tariff', 'FBR Tariff Lookup')}
        {L('fx', 'Currency Converter')}
        {L('audit', 'Audit Trail')}
        <div className="grp">HELP</div>
        {L('faq', 'FAQ')}
        {L('contact', 'Contact')}
        {L('about', 'About')}
      </div>
      <A onClick={signOut}>↩ Log out</A>
      <div style={{ padding: '8px 12px', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis' }} title={user?.email}>
        {user?.name} <Tag kind="w">Free</Tag>
      </div>
    </div>
  );
}

function FxPopover() {
  const { rates } = useApp();
  const [usd, setUsd] = useState('100');
  return (
    <div className="card fxp on" id="fxp">
      <label htmlFor="fxu">USD</label>
      <input id="fxu" type="number" min={0} value={usd} onChange={(e) => setUsd(e.target.value)} />
      <b style={{ color: 'var(--or)', fontSize: 20 }}>{fmtPKR((+usd || 0) * rates.interbank)}</b>
      <div className="mut small" style={{ marginTop: 6 }}>1 USD = {rates.interbank} PKR · {rates.updated}</div>
    </div>
  );
}

export function AppShell({ on, children }: { on: View; children: ReactNode }) {
  const { q, setQ, go, toast, user } = useApp();
  const [fx, setFx] = useState(false);
  return (
    <div className="app">
      <Sidebar on={on} />
      <div className="main" style={{ position: 'relative' }}>
        <div className="top">
          <input placeholder="Search products…" aria-label="Search products" value={q}
                 onChange={(e) => setQ(e.target.value)}
                 onKeyDown={(e) => { if (e.key === 'Enter') go('list'); }} />
          <button className="btn o sm" type="button" onClick={() => setFx((v) => !v)}>💱 USD→PKR</button>
          <button className="btn o sm" type="button" aria-label="Notifications" onClick={() => toast('No new notifications')}>🔔</button>
          <b title={user?.email} style={{ background: 'var(--or)', color: '#fff', borderRadius: 99, width: 34, height: 34, display: 'grid', placeItems: 'center', flex: 'none' }}>
            {initials(user?.name || 'U')}
          </b>
        </div>
        {fx && <FxPopover />}
        {children}
        <AppFooter />
      </div>
    </div>
  );
}
