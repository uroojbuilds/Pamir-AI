export const fmtPKR = (n: number | null | undefined) =>
  n == null || Number.isNaN(n) ? '—' : 'Rs ' + Math.round(n).toLocaleString('en-US');

export const fmtUSD = (n: number | null | undefined, d = 2) =>
  n == null || Number.isNaN(n) ? '—' : '$' + n.toFixed(d);

export const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
};

export const statusLabel = (s: string | null | undefined) =>
  s === 'verified' ? 'Verified' : s === 'curated' ? 'Curated' : s === 'estimated' ? 'Estimated'
  : s === 'live_reference' ? 'Live reference' : s === 'stale_reference' ? 'Stale reference' : 'Needs verification';

/** tag colour: green for verified, orange for the rest */
export const statusKind = (s: string | null | undefined): 'w' | undefined => (s === 'verified' ? undefined : 'w');

export const initials = (name: string) => (name.trim()[0] || 'U').toUpperCase();
