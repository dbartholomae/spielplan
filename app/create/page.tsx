'use client';

import { useEffect, useMemo, useState } from 'react';
import GameAutocomplete, { type GameItem } from '../../components/GameAutocomplete';
import TimeslotPicker, { type Timeslot as TimeslotInput } from '../../components/TimeslotPicker';
import { supabase } from '../../lib/supabaseClient';
import { useI18n } from '../../lib/i18n';

function formatIso(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

export default function CreateSeriesPage() {
  const { t } = useI18n();
  const [games, setGames] = useState<GameItem[]>([]);
  const [timeslots, setTimeslots] = useState<TimeslotInput[]>([]);
  const [title, setTitle] = useState(t('public.titleFallback'));
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<string | undefined>(undefined);

  function addGame(g: GameItem) {
    setGames(prev => prev.some(p => p.id === g.id) ? prev : [...prev, g]);
  }
  function removeGame(id: string) {
    setGames(prev => prev.filter(p => p.id !== id));
  }

  function addTimeslot(t: TimeslotInput) {
    setTimeslots(prev => [...prev, t]);
  }
  function removeTimeslot(id: string) {
    setTimeslots(prev => prev.filter(p => p.id !== id));
  }

  const ownerKey = useMemo(() => {
    // Guest owner key stored in localStorage. If signed in, we will prefer Supabase user id.
    if (typeof window === 'undefined') return '';
    const key = localStorage.getItem('ownerKey') ?? (() => {
      const k = crypto.randomUUID();
      localStorage.setItem('ownerKey', k);
      return k;
    })();
    return key;
  }, []);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    (async () => {
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        const uid = session?.user?.id;
        setUserId(uid);
        if (!uid) {
          // Redirect to home if not logged in (Supabase enabled)
          window.location.replace('/');
        }
        unsub = supabase.auth.onAuthStateChange((_event, session) => {
          const uid2 = session?.user?.id;
          setUserId(uid2);
          if (!uid2) {
            window.location.replace('/');
          }
        }).data.subscription.unsubscribe;
      }
    })();
    return () => { if (unsub) unsub(); };
  }, []);

  const effectiveOwner = userId ?? ownerKey;

  async function createSeries() {
    setCreating(true);
    setError(null);
    try {
      // Include Supabase auth token if available so the API can authenticate the user
      let authHeader: Record<string, string> = {};
      try {
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          const token = session?.access_token;
          if (token) authHeader = { Authorization: `Bearer ${token}` };
        }
      } catch {}
      const res = await fetch('/api/series', {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...authHeader },
        body: JSON.stringify({ ownerId: effectiveOwner, title, games, timeslots })
      });
      if (!res.ok) throw new Error(await res.text());
      const series = await res.json();
      window.location.href = `/s/${series.slug}`;
    } catch (e: any) {
      setError(t('create.createError'));
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="container grid">
      <div className="flex" style={{gap:8, alignItems:'center', justifyContent:'space-between'}}>
        <div className="flex" style={{gap:8, alignItems:'center'}}>
          <a href="/" className="btn">{t('nav.back')}</a>
          <h1 style={{margin:'0 0 0 .5rem'}}>{t('create.title')}</h1>
        </div>
        {!userId && supabase ? (
          <a href="/login" className="btn">{t('auth.signInWithEmail')}</a>
        ) : null}
      </div>

      <div className="stepper">
        <div className={`step ${step===1?'active':''}`}>
          <div className="dot">1</div>
          <div className="small">{t('create.details')}</div>
        </div>
        <div className={`step ${step===2?'active':''}`}>
          <div className="dot">2</div>
          <div className="small">{t('create.games')}</div>
        </div>
        <div className={`step ${step===3?'active':''}`}>
          <div className="dot">3</div>
          <div className="small">{t('create.times')}</div>
        </div>
      </div>

      {step === 1 && (
        <section className="card">
          <h2 style={{marginTop:0}}>{t('create.eventDetails')}</h2>
          <div className="group">
            <label className="small">{t('create.eventTitleLabel')}</label>
            <input className="input" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder={t('create.eventTitlePlaceholder')} />
          </div>
          <div style={{marginTop:16}}>
            <button className="btn btn-primary" onClick={()=>setStep(2)}>{t('create.nextSelectGames')}</button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="card">
          <h2 style={{marginTop:0}}>{t('create.selectGamesTitle')}</h2>
          {!!games.length && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:12, marginTop:12 }}>
              {games.map(g => (
                <div key={g.id} className="badge" style={{padding:'6px 10px'}}> 
                  {g.thumbnail ? <img src={g.thumbnail} alt="thumb" width={24} height={24} style={{ borderRadius:6, border:'1px solid #333', marginRight:6 }} /> : null}
                  <span>{g.name}</span>
                  <button onClick={()=>removeGame(g.id)} className="btn" style={{marginLeft:8,padding:'0 8px'}} aria-label={t('create.remove')}>✕</button>
                </div>
              ))}
            </div>
          )}
          <GameAutocomplete onAdd={addGame} />
          <div style={{display:'flex',justifyContent:'space-between',marginTop:16}}>
            <button className="btn" onClick={()=>setStep(1)}>{t('create.previous')}</button>
            <button className="btn btn-primary" onClick={()=>setStep(3)}>{t('create.nextSetTimes')}</button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="card">
          <h2 style={{marginTop:0}}>{t('create.selectTimesTitle')}</h2>
          <TimeslotPicker onAdd={addTimeslot} />
          {!!timeslots.length && (
            <ul className="list" style={{marginTop:12}}>
              {timeslots.map(slot => (
                <li key={slot.id} className="item" style={{padding:'8px 12px'}}>
                  <div className="flex-between">
                    <span>{formatIso(slot.startsAt)}{slot.endsAt ? ` - ${new Date(slot.endsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}</span>
                    <button onClick={()=>removeTimeslot(slot.id)} className="btn">{t('create.remove')}</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {error && <div style={{ color: 'crimson', marginTop:12 }}>{error}</div>
          }
          <div style={{display:'flex',justifyContent:'space-between',marginTop:16}}>
            <button className="btn" onClick={()=>setStep(2)}>{t('create.previous')}</button>
            <button disabled={creating || games.length===0 || timeslots.length===0} onClick={createSeries} className="btn btn-primary">{creating? '⏳ '+t('create.creating') : t('create.createSeries')}</button>
          </div>
        </section>
      )}
    </main>
  );
}
