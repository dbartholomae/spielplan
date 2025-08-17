'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useI18n } from '../lib/i18n';

export default function HomePage() {
  const { t } = useI18n();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [series, setSeries] = useState<any[]>([]);

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
      if (!effectiveOwner) return;
      const res = await fetch(`/api/series?ownerId=${encodeURIComponent(effectiveOwner)}`);
      const data = await res.json();
      setSeries(data.items ?? []);
    })();
  }, [effectiveOwner]);

  async function signInWithGitHub() {
    if (!supabase) return alert('Supabase not configured. Using guest mode.');
    await supabase.auth.signInWithOAuth({ provider: 'github' });
  }
  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  return (
    <>
      <div className="hero">
        <div className="container hero-inner">
          <div style={{display:'flex',justifyContent:'flex-end'}}>
            {supabase ? (
              userId ? (
                <button onClick={signOut} className="btn btn-ghost">{t('auth.signOut')}</button>
              ) : (
                <button onClick={signInWithGitHub} className="btn btn-ghost">{t('auth.signInWithGitHub')}</button>
              )
            ) : (
              <span className="badge">{t('auth.guestMode')}</span>
            )}
          </div>
          <h1 className="hero-title">{t('app.title')}</h1>
          <p className="hero-sub">{t('app.subtitle')}</p>
          <a className="btn btn-primary" href="/create">{t('app.startPlanning')}</a>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <h2 className="section-title">{t('home.howItWorks')}</h2>
          <p className="section-sub">{t('home.simple')}</p>
          <div className="how-cards">
            <div className="card">
              <div className="card-header">{t('home.pickGames')}</div>
              <div className="small">Search BoardGameGeek and add one or more games for your night.</div>
            </div>
            <div className="card">
              <div className="card-header">{t('home.setDates')}</div>
              <div className="small">Add a few options so everyone can choose what works.</div>
            </div>
            <div className="card">
              <div className="card-header">{t('home.shareVote')}</div>
              <div className="small">Share a public link. Friends can vote without creating an account.</div>
            </div>
          </div>
        </div>
      </section>

      <main className="container grid">
        <div className="flex-between">
          <h2>{t('series.yourEvents')}</h2>
          <a href="/create" className="btn btn-primary">{t('series.new')}</a>
        </div>

        {series.length === 0 ? (
          <p className="small">{t('series.none')}</p>
        ) : (
          <ul className="list">
            {series.map((s: any) => (
              <li key={s.id} className="item">
                <div className="item-head">
                  <div>
                    <div style={{fontWeight:700}}>{s.title || t('public.titleFallback')}</div>
                    <div className="small">{new Date(s.createdAt).toLocaleString()}</div>
                  </div>
                  <a href={`/s/${s.slug}`} className="btn">{t('series.open')}</a>
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
        )}
      </main>
    </>
  );
}
