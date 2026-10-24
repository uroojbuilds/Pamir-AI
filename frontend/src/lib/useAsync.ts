import { useCallback, useEffect, useRef, useState } from 'react';

/** Runs `fn` whenever `key` changes; ignores stale results. `reload()` re-runs it. */
export function useAsync<T>(fn: () => Promise<T>, key: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const run = useRef(0);

  const load = useCallback(() => {
    const id = ++run.current;
    setLoading(true); setError(null);
    fnRef.current()
      .then((d) => { if (id === run.current) { setData(d); setLoading(false); } })
      .catch((e: unknown) => { if (id === run.current) { setError(e instanceof Error ? e.message : 'Request failed'); setLoading(false); } });
  }, []);

  useEffect(() => { load(); return () => { run.current++; }; }, [key, load]);
  return { data, error, loading, reload: load };
}
