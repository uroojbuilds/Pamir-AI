import { useState, type FormEvent } from 'react';
import { useApp } from '../state/AppContext';
import { A, Logo, Spinner } from '../components/ui';

export function Auth({ signup }: { signup: boolean }) {
  const { go, signIn, toast } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) { setError('Email and password are both required.'); return; }
    if (signup && password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setBusy(true);
    try {
      await signIn(email.trim(), password, signup ? 'signup' : 'login', name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <div className="l">
        <Logo light onClick={() => go('land')} />
        <h2>Your AI partner for smarter business decisions.</h2>
        <ul>
          <li>📊 Market Insights</li>
          <li>🧮 Cost Calculator</li>
          <li>🤝 Supplier Network</li>
        </ul>
      </div>
      <div className="r">
        <form className="f" onSubmit={submit} noValidate>
          <div className="tabs">
            <A className={signup ? '' : 'on'} onClick={() => go('login')}>Login</A>
            <A className={signup ? 'on' : ''} onClick={() => go('signup')}>Sign Up</A>
          </div>
          <h2>{signup ? 'Create your account' : 'Welcome back'}</h2>
          <br />
          {error && <div className="err" role="alert">{error}</div>}
          {signup && (<>
            <label htmlFor="an">Full name</label>
            <input id="an" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </>)}
          <label htmlFor="ae">Email</label>
          <input id="ae" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <label htmlFor="ap">Password</label>
          <input id="ap" type="password" autoComplete={signup ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
          <button className="btn" type="submit" style={{ width: '100%' }} disabled={busy}>
            {busy ? <Spinner /> : signup ? 'Create account' : 'Sign In'}
          </button>
          <p style={{ textAlign: 'center', margin: '14px 0', fontSize: 12, color: 'var(--mut)' }}>or continue with</p>
          <div className="row" style={{ gap: 10 }}>
            <button className="btn o" type="button" onClick={() => toast('Google sign-in is not available yet')}>Google</button>
            <button className="btn o" type="button" onClick={() => toast('GitHub sign-in is not available yet')}>GitHub</button>
          </div>
          <p style={{ textAlign: 'center', marginTop: 14 }}>
            <A onClick={() => go('land')} style={{ color: 'var(--or)' }}>← Back to site</A>
          </p>
        </form>
      </div>
    </div>
  );
}
