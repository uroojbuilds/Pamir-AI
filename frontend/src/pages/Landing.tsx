import { useMemo } from 'react';
import { PRODUCTS_CATALOG } from '../data/tradeData';
import { computeTradeMetrics } from '../utils/calculator';
import { FEATURES, HOW_STEPS } from '../lib/content';
import { fmtPKR, fmtUSD } from '../lib/format';
import { useApp } from '../state/AppContext';
import { A, Logo } from '../components/ui';
import { AboutBlock, ContactBlock, FaqBlock } from '../components/Sections';
import { SiteFooter } from '../components/Footers';

export function Landing() {
  const { go, jump, rates } = useApp();
  // The hero card shows a real analysis of the first catalog product, computed by the same engine the app uses.
  const demo = useMemo(() => {
    const p = PRODUCTS_CATALOG[0];
    const qty = p.moq ?? 50;
    const m = computeTradeMetrics(
      { capital: 150000, category: p.category, product_id: p.product_id, product_name: p.product_name, quantity: qty, target_currency: 'PKR' },
      { USD_PKR_INTERBANK: rates.interbank, USD_PKR_OPEN_MARKET: rates.openMarket, USD_CNY: rates.cny },
    );
    const unitPkr = m.calculations.unit_landed_cost_pkr;
    return { p, m, unitPkr, units: Math.floor(150000 / unitPkr) };
  }, [rates.interbank, rates.openMarket, rates.cny]);

  return (
    <>
      <div className="nav">
        <Logo onClick={() => jump('top')} />
        <span className="sp" />
        <A className="l" onClick={() => jump('top')}>Home</A>
        <A className="l" onClick={() => jump('feat')}>Features</A>
        <A className="l" onClick={() => jump('how')}>How It Works</A>
        <A className="l" onClick={() => jump('about')}>About</A>
        <A className="l" onClick={() => jump('faq')}>FAQ</A>
        <A className="l" onClick={() => jump('contact')}>Contact</A>
        <A className="l" onClick={() => go('login')}><b>Login</b></A>
        <button className="btn" type="button" onClick={() => go('signup')}>Get Started</button>
      </div>

      <div className="hero" id="top">
        <div>
          <span className="tag w">AI Trade Launchpad for Pakistan</span>
          <h1 style={{ marginTop: 14 }}>Discover profitable business opportunities in <em>Pakistan</em> with the power of AI</h1>
          <p>From China imports to local markets: data-driven insights, landed cost estimates and step-by-step guidance to start and grow your business.</p>
          <button className="btn" type="button" style={{ padding: '14px 26px' }} onClick={() => go('signup')}>Get Started</button>{' '}
          <button className="btn o" type="button" style={{ padding: '14px 26px' }} onClick={() => jump('how')}>See how it works</button>
        </div>
        <div className="mock">
          <div style={{ opacity: 0.7, fontSize: 13 }}>{demo.p.product_name} · Sample analysis</div>
          <div className="big">{demo.m.viability_score}/100</div>
          <div style={{ color: '#86efac', fontWeight: 700 }}>
            {demo.m.viability_score >= 75 ? 'Good potential' : demo.m.viability_score >= 50 ? 'Moderate potential' : 'Needs verification'}
          </div>
          <div className="r"><span>Landed cost / unit</span><b>{fmtPKR(demo.unitPkr)} · {fmtUSD(demo.unitPkr / rates.interbank)}</b></div>
          <div className="r"><span>Duty (FBR tariff)</span><b>{demo.m.duty_rate_percent}%</b></div>
          <div className="r"><span>Rs 150,000 buys</span><b>~{demo.units} units</b></div>
        </div>
      </div>

      <div className="sec" id="how">
        <h2>How It Works</h2>
        <p className="sub">From idea to import in 4 simple steps.</p>
        <div className="g4">
          {HOW_STEPS.map((s, i) => (
            <div className="card" key={s[1]}>
              <div className="ic">{s[0]}</div>
              <span className="step">Step {i + 1}</span>
              <h3>{s[1]}</h3>
              <p className="sub" style={{ margin: '6px 0 0', fontSize: 14 }}>{s[2]}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="sec dark" id="feat">
        <h2>Everything in one workflow</h2>
        <p className="sub">Replace scattered spreadsheets and chats.</p>
        <div className="g3">
          {FEATURES.map((f) => (
            <div className="card" key={f[1]} style={{ background: '#252019', borderColor: '#3a322a' }}>
              <div className="ic" style={{ background: '#3a2a1e' }}>{f[0]}</div>
              <h3>{f[1]}</h3>
            </div>
          ))}
        </div>
      </div>

      <div className="sec" id="about"><h2>About Pamir AI</h2><br /><AboutBlock /></div>
      <div className="sec" id="faq" style={{ paddingTop: 0 }}><h2>Frequently Asked Questions</h2><br /><FaqBlock /></div>
      <div className="sec" id="contact" style={{ background: '#fff' }}><h2>Get in Touch</h2><br /><ContactBlock /></div>
      <SiteFooter />
    </>
  );
}
