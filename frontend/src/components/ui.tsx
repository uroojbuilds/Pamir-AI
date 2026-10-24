import type { CSSProperties, MouseEvent, ReactNode } from 'react';
import { IcGitHub, IcLinkedIn, IcMail } from '../lib/icons';
import { GITHUB_URL, SUPPORT_EMAIL } from '../lib/content';

/** Anchor styled by the demo CSS but wired to in-app navigation (no page reload). */
export function A({ onClick, className, style, children, title }: {
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  className?: string; style?: CSSProperties; children: ReactNode; title?: string;
}) {
  return (
    <a href="#" className={className} style={style} title={title}
       onClick={(e) => { e.preventDefault(); onClick?.(e); }}>
      {children}
    </a>
  );
}

export function LogoMark({ fill }: { fill: string }) {
  return (
    <svg width="22" height="16" viewBox="0 0 100 70" aria-hidden="true">
      <path d="M0 70L35 10l18 28 12-18 35 50z" fill={fill} />
      <path d="M0 70Q50 20 100 70" stroke="#EA580C" strokeWidth="7" fill="none" />
    </svg>
  );
}

export function Logo({ light, onClick }: { light?: boolean; onClick?: () => void }) {
  return (
    <div className="logo" onClick={onClick} style={{ cursor: onClick ? 'pointer' : undefined, color: light ? '#fff' : undefined }}>
      <i><LogoMark fill={light ? '#fff' : '#1E293B'} /></i>
      <span>PAMIR <b>AI</b></span>
    </div>
  );
}

export function Tag({ kind, children }: { kind?: 'w' | 'n' | 'b'; children: ReactNode }) {
  return <span className={`tag${kind ? ' ' + kind : ''}`}>{children}</span>;
}

export function Spinner() {
  return <span className="spin" role="status" aria-label="Loading" />;
}

export function Socials() {
  return (
    <div className="soc">
      <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn"><IcLinkedIn /></a>
      <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub"><IcGitHub /></a>
      <a href={`mailto:${SUPPORT_EMAIL}`} aria-label="Email" title="Email"><IcMail /></a>
    </div>
  );
}

export function Toasts({ items }: { items: { id: number; text: string }[] }) {
  return (
    <>
      {items.map((t, i) => (
        <div key={t.id} className="toast" role="status" style={{ bottom: 20 + i * 56 }}>{t.text}</div>
      ))}
    </>
  );
}

/** Two-column label/value table used all over the analysis tabs. */
export function KV({ rows, total }: { rows: [ReactNode, ReactNode][]; total?: [ReactNode, ReactNode] }) {
  return (
    <table>
      <tbody>
        {rows.map((r, i) => (<tr key={i}><td>{r[0]}</td><td>{r[1]}</td></tr>))}
        {total && <tr className="t"><td>{total[0]}</td><td>{total[1]}</td></tr>}
      </tbody>
    </table>
  );
}

export function PageHead({ title, sub, children }: { title: string; sub?: ReactNode; children?: ReactNode }) {
  return (
    <>
      <h1>{title}</h1>
      {sub && <p className="sub" style={{ marginTop: 6 }}>{sub}</p>}
      {children}
    </>
  );
}

export function copyText(text: string, onDone: (m: string) => void) {
  const ok = () => onDone('Copied');
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(ok, () => onDone('Copy failed'));
  else onDone('Copy not supported in this browser');
}
