import { GITHUB_URL } from '../lib/content';
import { useApp } from '../state/AppContext';
import { A, Logo, Socials } from './ui';

export function SiteFooter() {
  const { go, toast, jump } = useApp();
  const ph = () => toast('This page is not published yet');
  return (
    <footer className="ft">
      <div className="cols">
        <div className="brand">
          <Logo light onClick={() => jump('top')} />
          <p>AI-powered trade launchpad for first-time Pakistani entrepreneurs: discover, cost and evaluate China import opportunities based on your capital.</p>
          <Socials />
        </div>
        <div>
          <h4>Product</h4>
          <A onClick={() => jump('feat')}>Features</A>
          <A onClick={() => jump('how')}>How It Works</A>
          <A onClick={() => go('calc')}>Import Cost Calculator</A>
          <A onClick={() => go('tariff')}>FBR Tariff Lookup</A>
          <A onClick={() => go('fx')}>Currency Converter</A>
        </div>
        <div>
          <h4>Company</h4>
          <A onClick={() => jump('about')}>About</A>
          <A onClick={() => jump('faq')}>FAQ</A>
          <A onClick={() => jump('contact')}>Contact</A>
          <A onClick={() => go('login')}>Login</A>
        </div>
        <div>
          <h4>Support &amp; Legal</h4>
          <A onClick={() => jump('contact')}>Help &amp; Support</A>
          <A onClick={ph}>Privacy Policy</A>
          <A onClick={ph}>Terms of Service</A>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
      </div>
      <div className="bot">
        <span>© 2026 Pamir AI. All rights reserved.</span>
        <span>Every figure shows its source and date · Islamabad, Pakistan</span>
      </div>
    </footer>
  );
}

export function AppFooter() {
  const { go } = useApp();
  return (
    <div className="foot">
      <span>© 2026 Pamir AI</span>
      <span className="sp" />
      <A onClick={() => go('about')}>About</A>
      <A onClick={() => go('faq')}>FAQ</A>
      <A onClick={() => go('contact')}>Contact</A>
      <Socials />
    </div>
  );
}
