'use client';

import { useEffect, useMemo, useState } from 'react';
import GameAutocomplete, { type GameItem } from '../../components/GameAutocomplete';
import TimeslotPicker, { type Timeslot as TimeslotInput } from '../../components/TimeslotPicker';
import { supabase } from '../../lib/supabaseClient';

function formatIso(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

export default function CreateSeriesPage() {
  const [games, setGames] = useState<GameItem[]>([]);
  const [timeslots, setTimeslots] = useState<TimeslotInput[]>([]);
  const [title, setTitle] = useState('Board game night');
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
        setUserId(session?.user?.id);
        unsub = supabase.auth.onAuthStateChange((_event, session) => {
          setUserId(session?.user?.id);
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
      const res = await fetch('/api/series', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ownerId: effectiveOwner, title, games, timeslots })
      });
      if (!res.ok) throw new Error(await res.text());
      const series = await res.json();
      window.location.href = `/s/${series.slug}`;
    } catch (e: any) {
      setError('Failed to create event series');
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="container grid">
      <div className="flex" style={{gap:8, alignItems:'center'}}>
        <a href="/" className="btn">← Back to Dashboard</a>
        <h1 style={{margin:'0 0 0 .5rem'}}>Create New Event Series</h1>
      </div>

      <div className="stepper">
        <div className={`step ${step===1?'active':''}`}>
          <div className="dot">1</div>
          <div className="small">Details</div>
        </div>
        <div className={`step ${step===2?'active':''}`}>
          <div className="dot">2</div>
          <div className="small">Games</div>
        </div>
        <div className={`step ${step===3?'active':''}`}>
          <div className="dot">3</div>
          <div className="small">Times</div>
        </div>
      </div>

      {step === 1 && (
        <section className="card">
          <h2 style={{marginTop:0}}>Event Details</h2>
          <div className="group">
            <label className="small">Event Title</label>
            <input className="input" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="e.g., Weekly Board Game Night" />
          </div>
          <div style={{marginTop:16}}>
            <button className="btn btn-primary" onClick={()=>setStep(2)}>Next: Select Games</button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="card">
          <h2 style={{marginTop:0}}>Select Board Games</h2>
          <GameAutocomplete onAdd={addGame} />
          {!!games.length && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:12, marginTop:12 }}>
              {games.map(g => (
                <div key={g.id} className="badge" style={{padding:'6px 10px'}}> 
                  {g.thumbnail ? <img src={g.thumbnail} alt="thumb" width={24} height={24} style={{ borderRadius:6, border:'1px solid #333', marginRight:6 }} /> : null}
                  <span>{g.name}</span>
                  <button onClick={()=>removeGame(g.id)} className="btn" style={{marginLeft:8,padding:'0 8px'}}>✕</button>
                </div>
              ))}
            </div>
          )}
          <div style={{display:'flex',justifyContent:'space-between',marginTop:16}}>
            <button className="btn" onClick={()=>setStep(1)}>Previous</button>
            <button className="btn btn-primary" onClick={()=>setStep(3)}>Next: Set Times</button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="card">
          <h2 style={{marginTop:0}}>Select Dates & Times</h2>
          <TimeslotPicker onAdd={addTimeslot} />
          {!!timeslots.length && (
            <ul className="list" style={{marginTop:12}}>
              {timeslots.map(t => (
                <li key={t.id} className="item" style={{padding:'8px 12px'}}>
                  <div className="flex-between">
                    <span>{formatIso(t.startsAt)}{t.endsAt ? ` - ${new Date(t.endsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}</span>
                    <button onClick={()=>removeTimeslot(t.id)} className="btn">Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {error && <div style={{ color: 'crimson', marginTop:12 }}>{error}</div>}
          <div style={{display:'flex',justifyContent:'space-between',marginTop:16}}>
            <button className="btn" onClick={()=>setStep(2)}>Previous</button>
            <button disabled={creating || games.length===0 || timeslots.length===0} onClick={createSeries} className="btn btn-primary">{creating? 'Creating…' : 'Create Event Series'}</button>
          </div>
        </section>
      )}
    </main>
  );
}
