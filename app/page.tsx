'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useI18n } from '../lib/i18n';

export default function HomePage() {
  const { t } = useI18n();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [series, setSeries] = useState<any[]>([]);
  const [seriesLoading, setSeriesLoading] = useState<boolean>(false);
  const [seriesError, setSeriesError] = useState<string | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  // Inline magic link login state (when supabase enabled and signed out)
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const ownerKey = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const key = localStorage.getItem('ownerKey') ?? (() => {
      const k = crypto.randomUUID();
      localStorage.setItem('ownerKey', k);
      return k;
    })();
    return key;
  }, []);

  const effectiveOwner = userId ?? ownerKey;

  useEffect(() => {
    let unsub: (() => void) | undefined;
    (async () => {
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        setUserId(session?.user?.id);
        unsub = supabase.auth.onAuthStateChange((_event, session) => {
          setUserId(session?.user?.id);
        }).data.subscription.unsubscribe;
      }
    })();
    return () => { if (unsub) unsub(); };
  }, []);

  useEffect(() => {
    (async () => {
      // Only load the personal list when the user is logged in
      if (!userId) return;
      setSeriesLoading(true);
      setSeriesError(null);
      let authHeader: Record<string, string> = {};
      try {
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          const token = session?.access_token;
          if (token) authHeader = { Authorization: `Bearer ${token}` };
        }
      } catch {}
      try {
        const res = await fetch(`/api/series?ownerId=${encodeURIComponent(effectiveOwner)}`, { headers: { ...authHeader } });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setSeries(data.items ?? []);
      } catch (e: any) {
        setSeriesError(t('home.loadError'));
        setSeries([]);
      } finally {
        setSeriesLoading(false);
      }
    })();
  }, [userId, effectiveOwner]);

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  async function sendMagicLink() {
    if (!supabase || !email.trim()) return;
    setSending(true);
    setInfo(null);
    setErr(null);
    try {
      const redirectTo = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : undefined;
      const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: redirectTo } as any });
      if (error) throw error;
      setInfo(t('auth.magicLinkSent'));
    } catch (e: any) {
      setErr(e?.message || 'Failed to send magic link');
    } finally {
      setSending(false);
    }
  }

  async function deleteSeries(slug: string) {
    if (!slug) return;
    const confirmed = window.confirm(t('home.deleteConfirm'));
    if (!confirmed) return;
    setDeleteError(null);
    setDeletingSlug(slug);
    try {
      let authHeader: Record<string, string> = {};
      let url = `/api/series/${encodeURIComponent(slug)}`;
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (token) authHeader = { Authorization: `Bearer ${token}` };
      } else if (effectiveOwner) {
        // In guest mode, include ownerId so the API can validate ownership
        url += `?ownerId=${encodeURIComponent(effectiveOwner)}`;
      }
      const res = await fetch(url, { method: 'DELETE', headers: { ...authHeader } });
      if (!res.ok && res.status !== 204) {
        const text = await res.text();
        throw new Error(text || 'Delete failed');
      }
      // Update UI
      setSeries(prev => prev.filter(s => s.slug !== slug));
    } catch (e) {
      setDeleteError(t('home.deleteError'));
    } finally {
      setDeletingSlug(null);
    }
  }


  return (
    <>
      <div className="hero">
        <div className="container hero-inner">
          <div style={{display:'flex',justifyContent:'flex-end', gap: 8}}>
            {userId ? (
                <button onClick={signOut} className="btn btn-ghost">{t('auth.signOut')}</button>
              ) : supabase ? null : (
                <span className="badge">{t('auth.guestMode')}</span>
              )}
          </div>
          <h1 className="hero-title">{t('app.title')}</h1>
          <p className="hero-sub">{t('app.subtitle')}</p>
          {userId ? (
            <a className="btn btn-primary" href="/create">{t('app.startPlanning')}</a>
          ) : (supabase ? (
            <section className="card" style={{ maxWidth: 520, margin: '12px auto 0' }}>
              <label className="small" style={{ display: 'block', textAlign: "left", margin: "4px" }}>Email</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder')}
                  className="input"
                  style={{ maxWidth: 280 }}
                />
                <button onClick={sendMagicLink} disabled={sending || !email.trim()} className="btn btn-primary">
                  {t('auth.sendMagicLink')}
                </button>
              </div>
              {info && <div className="small" style={{ color: 'var(--muted)', marginTop: 8 }}>{info}</div>}
              {err && <div className="small" style={{ color: 'crimson', marginTop: 8 }}>{err}</div>}
            </section>
          ) : (
            <a className="btn btn-primary" href="/create">{t('app.startPlanning')}</a>
          ))}
        </div>
      </div>

      <section className="section">
        <div className="container">
          <h2 className="section-title">{t('home.howItWorks')}</h2>
          <p className="section-sub">{t('home.simple')}</p>
          <div className="how-cards">
            <div className="card">
              <div className="card-header">{t('home.pickGames')}</div>
              <div className="small">{t('home.pickGamesHelp')}</div>
            </div>
            <div className="card">
              <div className="card-header">{t('home.setDates')}</div>
              <div className="small">{t('home.setDatesHelp')}</div>
            </div>
            <div className="card">
              <div className="card-header">{t('home.shareVote')}</div>
              <div className="small">{t('home.shareVoteHelp')}</div>
            </div>
          </div>
        </div>
      </section>

      {userId ? (
      <main className="container grid">
        <div className="flex-between">
          <h2>{t('series.yourEvents')}</h2>
          <a href="/create" className="btn btn-primary">{t('series.new')}</a>
        </div>

        {seriesLoading ? (
          <p className="small">⏳ {t('public.loading')}</p>
        ) : seriesError ? (
          <p className="small" style={{ color: 'crimson' }}>{seriesError}</p>
        ) : series.length === 0 ? (
          <p className="small">{t('series.none')}</p>
        ) : (
          <>
            {deleteError && <div className="card" style={{ color: 'crimson', marginBottom: 12 }}>{deleteError}</div>}
            <ul className="list">
              {series.map((s: any) => (
                <li key={s.id} className="item">
                  <div className="item-head">
                    <div>
                      <div style={{fontWeight:700}}>{s.title || t('public.titleFallback')}</div>
                      <div className="small">{new Date(s.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="flex" style={{gap:8}}>
                      <a href={`/s/${s.slug}`} className="btn">{t('series.open')}</a>
                      <button disabled={deletingSlug===s.slug} onClick={() => deleteSeries(s.slug)} className="btn btn-ghost" style={{color:'crimson'}}>{deletingSlug===s.slug ? '⏳ '+t('public.loading') : t('series.delete')}</button>
                    </div>
                  </div>
                  {s.games?.length ? (
                    <div className="kv">
                      {s.games.slice(0, 5).map((g: any) => (
                        <span key={g.id} className="pill">{g.name}</span>
                      ))}
                      {s.games.length > 5 && <span className="pill">+{s.games.length - 5} {t('series.more')}</span>}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
      ) : null}
    </>
  );
}
