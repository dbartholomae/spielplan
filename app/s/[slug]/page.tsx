'use client';

import { useEffect, useMemo, useState } from 'react';

type Series = {
  id: string;
  slug: string;
  title?: string;
  games: { id: string; name: string; thumbnail?: string }[];
  timeslots: { id: string; startsAt: string; endsAt?: string }[];
};

type Vote = {
  id: string;
  voterName?: string;
  voterKey: string;
  selectedGameIds: string[];
  selectedTimeslotIds: string[];
};

function formatIso(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

export default function PublicSeriesPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [series, setSeries] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const voterKey = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const key = localStorage.getItem('voterKey') ?? (() => {
      const k = crypto.randomUUID();
      localStorage.setItem('voterKey', k);
      return k;
    })();
    return key;
  }, []);

  const [voterName, setVoterName] = useState<string>('');
  const [gameSel, setGameSel] = useState<Record<string, boolean>>({});
  const [slotSel, setSlotSel] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/series/${slug}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setSeries(data);
      } catch (e: any) {
        setError('Series not found');
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  async function submit() {
    if (!series) return;
    setSubmitting(true);
    setError(null);
    try {
      const selectedGameIds = Object.entries(gameSel).filter(([, v]) => v).map(([k]) => k);
      const selectedTimeslotIds = Object.entries(slotSel).filter(([, v]) => v).map(([k]) => k);
      const res = await fetch(`/api/series/${slug}/vote`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ voterKey, voterName, selectedGameIds, selectedTimeslotIds })
      });
      if (!res.ok) throw new Error(await res.text());
      alert('Your availability was saved. Thank you!');
    } catch (e: any) {
      setError('Failed to submit your choices');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <main className="container">Loading…</main>;
  if (error) return <main className="container" style={{ color: 'crimson' }}>{error}</main>;
  if (!series) return null;

  return (
    <main className="container grid">
      <div className="flex" style={{gap:8, alignItems:'center'}}>
        <a href="/" className="btn">← Back</a>
        <h1 style={{margin:'0 0 0 .5rem'}}>{series.title || 'Board game night'}</h1>
      </div>
      <p className="small">Pick the games you want to play and the timeslots you can join.</p>

      <section className="card">
        <h2 style={{ marginTop: 0 }}>Games</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {series.games.map(g => {
            const checked = gameSel[g.id] ?? false;
            return (
              <label key={g.id} className="badge" style={{padding:'8px 10px', cursor:'pointer', background: checked ? 'var(--primary)' : 'var(--surface-muted)', color: checked ? '#fff' : 'inherit'}}>
                <input type="checkbox" checked={checked} onChange={e => setGameSel(prev => ({ ...prev, [g.id]: e.target.checked }))} />
                {g.thumbnail ? <img src={g.thumbnail} alt="thumb" width={32} height={32} style={{ borderRadius: 6, border: '1px solid #333', marginLeft:6, marginRight:6 }} /> : null}
                <span>{g.name}</span>
              </label>
            );
          })}
        </div>
      </section>

      <section className="card">
        <h2 style={{ marginTop: 0 }}>Timeslots</h2>
        <ul className="list">
          {series.timeslots.map(t => {
            const checked = slotSel[t.id] ?? false;
            return (
              <li key={t.id} className="item" style={{padding:'8px 12px'}}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={checked} onChange={e => setSlotSel(prev => ({ ...prev, [t.id]: e.target.checked }))} />
                  <span>{formatIso(t.startsAt)}{t.endsAt ? ` - ${new Date(t.endsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="flex" style={{gap:12, alignItems:'center'}}>
        <input value={voterName} onChange={e => setVoterName(e.target.value)} placeholder="Your name (optional)" className="input" />
        <button disabled={submitting} onClick={submit} className="btn btn-primary">{submitting ? 'Saving…' : 'Save my availability'}</button>
      </div>

      <div className="card">
        Share this link: <code className="badge" style={{marginLeft:8}}>{typeof window !== 'undefined' ? window.location.href : ''}</code>
      </div>
    </main>
  );
}
