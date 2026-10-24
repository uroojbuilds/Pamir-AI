import { ProductImage } from '../components/ProductImage';
import { fmtPKR } from '../lib/format';
import { fitsBudget } from '../lib/product';
import { TABS } from '../lib/content';
import { useApp } from '../state/AppContext';
import { AppShell } from '../components/Shell';
import { A } from '../components/ui';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

export function Dashboard() {
  const { user, catalog, budget, rates, analysisCount, auditLogs, product, pid, seen, go } = useApp();
  const stepsDone = pid ? Object.keys(seen[pid] ?? {}).length : 0;
  const withinBudget = catalog.filter((p) => fitsBudget(p, budget, rates)).length;
  const kpis: [string, string | number][] = [
    ['Products in catalog', catalog.length],
    [`Within ${fmtPKR(budget)}`, withinBudget],
    ['Analyses started', analysisCount],
    ['Audit entries', auditLogs.length],
  ];
  const journey: [string, string, () => void][] = [
    ['1', 'Budget & Category', () => go('disc')],
    ['2', 'Choose a Product', () => go('list')],
    ['3', 'Analyze (cost → viability → suppliers)', () => go(product ? 'prod' : 'list')],
    ['4', 'Launch (marketing, kit, guidance)', () => go('mkt')],
  ];
  return (
    <AppShell on="dash">
      <h1>{greeting()}, {user?.name}</h1>
      <p className="sub">Here's your business snapshot.</p>
      <div className="g4">
        {kpis.map((k) => (
          <div className="card kpi" key={k[0]}><span>{k[0]}</span><b>{k[1]}</b></div>
        ))}
      </div>
      <div className="hero-ban">
        <h2>{product ? <>Continue: <ProductImage product={product} size={34} /> {product.product_name}</> : 'Start your first import project'}</h2>
        <p style={{ margin: '8px 0 14px', color: '#e7ddd2' }}>
          {product ? `${stepsDone} of ${TABS.length} analysis steps viewed.` : 'Set your budget, choose a category and pick a product to analyze.'}
        </p>
        <button className="btn" type="button" onClick={() => go(product ? 'prod' : 'disc')}>
          {product ? 'Continue analysis' : 'Start a project'}
        </button>
      </div>
      <h3>Your journey</h3>
      <br />
      <div className="g4">
        {journey.map((q) => (
          <A key={q[0]} onClick={q[2]} style={{ display: 'block' }}>
            <div className="card lift"><span className="step">Step {q[0]}</span><br /><b>{q[1]}</b></div>
          </A>
        ))}
      </div>
    </AppShell>
  );
}
