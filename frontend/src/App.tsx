import { useApp } from './state/AppContext';
import { Toasts } from './components/ui';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Discover, Products } from './pages/Discover';
import { Product } from './pages/Product';
import { Guidance, LaunchKit, Marketing } from './pages/Launch';
import { Calculator, Converter, Tariff } from './pages/Tools';
import { Audit } from './pages/Audit';
import { AboutPage, ContactPage, FaqPage } from './pages/Help';

export default function App() {
  const { view, toasts } = useApp();
  const page = (() => {
    switch (view) {
      case 'land': return <Landing />;
      case 'login': return <Auth signup={false} />;
      case 'signup': return <Auth signup />;
      case 'dash': return <Dashboard />;
      case 'disc': return <Discover />;
      case 'list': return <Products />;
      case 'prod': return <Product />;
      case 'mkt': return <Marketing />;
      case 'kit': return <LaunchKit />;
      case 'guide': return <Guidance />;
      case 'calc': return <Calculator />;
      case 'fx': return <Converter />;
      case 'tariff': return <Tariff />;
      case 'audit': return <Audit />;
      case 'faq': return <FaqPage />;
      case 'contact': return <ContactPage />;
      case 'about': return <AboutPage />;
    }
  })();
  return (<>{page}<Toasts items={toasts} /></>);
}
