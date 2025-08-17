'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function HomePage() {
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
                <button onClick={signOut} className="btn btn-ghost">Sign out</button>
              ) : (
                <button onClick={signInWithGitHub} className="btn btn-ghost">Sign in with GitHub</button>
              )
            ) : (
              <span className="badge">Guest mode</span>
            )}
          </div>
          <h1 className="hero-title">GameNight Scheduler</h1>
          <p className="hero-sub">The perfect way to coordinate board game nights with friends. Find the best time and games everyone wants to play!</p>
          <a className="btn btn-primary" href="/create">Start Planning</a>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-sub">Simple, fun, and designed for board game enthusiasts</p>
          <div className="how-cards">
            <div className="card">
              <div className="card-header">🎯 Pick Games</div>
              <div className="small">Search BoardGameGeek and add one or more games for your night.</div>
            </div>
            <div className="card">
              <div className="card-header">🗓️ Set Dates & Times</div>
              <div className="small">Add a few options so everyone can choose what works.</div>
            </div>
            <div className="card">
              <div className="card-header">📤 Share & Vote</div>
              <div className="small">Share a public link. Friends can vote without creating an account.</div>
            </div>
          </div>
        </div>
      </section>

      <main className="container grid">
        <div className="flex-between">
          <h2>Your Event Series</h2>
          <a href="/create" className="btn btn-primary">New Event Series</a>
        </div>

        {series.length === 0 ? (
          <p className="small">No event series yet. Click "New Event Series" to start.</p>
        ) : (
          <ul className="list">
            {series.map((s: any) => (
              <li key={s.id} className="item">
                <div className="item-head">
                  <div>
                    <div style={{fontWeight:700}}>{s.title || 'Board game night'}</div>
                    <div className="small">{new Date(s.createdAt).toLocaleString()}</div>
                  </div>
                  <a href={`/s/${s.slug}`} className="btn">Open</a>
                </div>
                {s.games?.length ? (
                  <div className="kv">
                    {s.games.slice(0, 5).map((g: any) => (
                      <span key={g.id} className="pill">{g.name}</span>
                    ))}
                    {s.games.length > 5 && <span className="pill">+{s.games.length - 5} more</span>}
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
