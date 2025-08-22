'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useI18n } from '../../../lib/i18n';
import ParticipantList from '../../../components/ParticipantList';

type Series = {
  id: string;
  slug: string;
  title?: string;
  ownerId?: string;
  games: { id: string; name: string; thumbnail?: string }[];
  timeslots: { id: string; startsAt: string; endsAt?: string }[];
};

type Vote = {
  id: string;
  voterName?: string;
  voterKey: string;
  selectedGameIds: string[];
  selectedTimeslotIds: string[];
  createdAt: string;
};

function formatIso(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

export default function PublicSeriesPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { t } = useI18n();
  const [series, setSeries] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [votesLoading, setVotesLoading] = useState<boolean>(false);
  const [votesError, setVotesError] = useState<string | null>(null);
  const [highlightName, setHighlightName] = useState<string | null>(null);
  const [highlightedByCell, setHighlightedByCell] = useState<Set<string> | null>(null);
  const [selectedCellKey, setSelectedCellKey] = useState<string | null>(null);

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

  // Load series
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

  // Track auth user id (Supabase)
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

  const isOwner = !!(series?.ownerId && userId && series.ownerId === userId);

  // Load votes for owner view
  useEffect(() => {
    (async () => {
      if (!series || !isOwner) return;
      setVotesLoading(true);
      setVotesError(null);
      try {
        const res = await fetch(`/api/series/${slug}/vote`);
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setVotes(data.votes ?? []);
      } catch (e: any) {
        setVotesError('Failed to load votes.');
        setVotes([]);
      } finally {
        setVotesLoading(false);
      }
    })();
  }, [series, isOwner, slug]);

  async function submit() {
    if (!series) return;
    // Require a non-empty name
    if (!voterName || voterName.trim() === '') {
      alert(t('public.nameRequiredError'));
      return;
    }
    const name = voterName.trim();
    const selectedGameIds = Object.entries(gameSel).filter(([, v]) => v).map(([k]) => k);
    const selectedTimeslotIds = Object.entries(slotSel).filter(([, v]) => v).map(([k]) => k);
    if (selectedGameIds.length === 0 || selectedTimeslotIds.length === 0) {
      alert(t('public.selectionRequiredError'));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/series/${slug}/vote`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ voterKey, voterName: name, selectedGameIds, selectedTimeslotIds })
      });
      if (!res.ok) throw new Error(await res.text());
      alert(t('public.saveSuccess'));
    } catch (e: any) {
      alert(t('public.submitError'));
    } finally {
      setSubmitting(false);
    }
  }

  // Compute counts matrix for owner view
  const counts = useMemo(() => {
    const map = new Map<string, { count: number; names: string[] }>();
    if (!series) return map;
    for (const v of votes) {
      for (const gid of v.selectedGameIds) {
        for (const sid of v.selectedTimeslotIds) {
          const key = `${sid}|${gid}`;
          const entry = map.get(key) ?? { count: 0, names: [] };
          entry.count += 1;
          entry.names.push(v.voterName?.trim() || 'Anonymous');
          map.set(key, entry);
        }
      }
    }
    return map;
  }, [votes, series]);

  // Precompute highlighted cell keys for the selected participant
  const highlightedKeys = useMemo(() => {
    if (!highlightName) return null as Set<string> | null;
    const norm = (highlightName.trim() || 'Anonymous');
    const set = new Set<string>();
    for (const v of votes) {
      const vname = (v.voterName?.trim() || 'Anonymous');
      if (vname === norm) {
        for (const gid of v.selectedGameIds) {
          for (const sid of v.selectedTimeslotIds) {
            set.add(`${sid}|${gid}`);
          }
        }
      }
    }
    return set;
  }, [highlightName, votes]);

  // Heatmap intensity based on max count across all cells (owner view)
  const maxCount = useMemo(() => {
    let max = 0;
    counts.forEach(v => { if (v.count > max) max = v.count; });
    return max;
  }, [counts]);

  function heatBg(count: number): string | undefined {
    if (!maxCount || count <= 0) return undefined;
    // Use primary blue hue with alpha scaled by count ratio
    const ratio = Math.max(0, Math.min(1, count / maxCount));
    const alpha = 0.12 + 0.38 * ratio; // 0.12..0.5 range
    return `rgba(59,130,246,${alpha.toFixed(3)})`;
  }

  if (loading) return <main className="container">{t('public.loading')}</main>;
  if (error) return <main className="container" style={{ color: 'crimson' }}>{t('public.notFound')}</main>;
  if (!series) return null;

  // Owner dashboard view
  if (isOwner) {
    return (
      <main className="container grid">
        <div className="flex" style={{gap:8, alignItems:'center'}}>
          <a href="/" className="btn">{t('nav.back')}</a>
          <h1 style={{margin:'0 0 0 .5rem'}}>{series.title || t('public.titleFallback')}</h1>
        </div>
        <p className="small">{t('owner.instructions')}</p>

        <div className="card" style={{ overflowX: 'auto' }}>
          {votesLoading ? (
            <div className="small" style={{ padding: 12 }}>⏳ {t('public.loading')}</div>
          ) : votesError ? (
            <div className="small" style={{ padding: 12, color: 'crimson' }}>{t('owner.loadVotesError')}</div>
          ) : (
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px' }}>{t('owner.tableHeader')}</th>
                  {series.games.map(g => (
                    <th key={g.id} style={{ textAlign: 'left', padding: '8px' }}>{g.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {series.timeslots.map(t => (
                  <tr key={t.id}>
                    <td style={{ padding: '8px', whiteSpace: 'nowrap' }}>{formatIso(t.startsAt)}{t.endsAt ? ` - ${new Date(t.endsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}</td>
                    {series.games.map(g => {
                      const key = `${t.id}|${g.id}`;
                      const c = counts.get(key)?.count ?? 0;
                      const clickable = (counts.get(key)?.count ?? 0) > 0;
                      return (
                        <td key={g.id} style={{ padding: '8px', background: heatBg(c) }}>
                          <button
                            className="btn"
                            style={{ padding: '4px 8px', opacity: clickable ? 1 : 0.6, borderColor: ((selectedCellKey===key) || (highlightedKeys?.has(key))) ? '#f97316' : undefined }}
                            onClick={() => {
                              const entry = counts.get(key);
                              const names = new Set((entry?.names ?? []).map(n => (n?.trim() || 'Anonymous')));
                              // Clear participant-based cell highlighting when clicking a cell
                              setHighlightName(null);
                              setHighlightedByCell(names);
                              setSelectedCellKey(key);
                            }}
                          >
                            {c}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Participants list at the end */}
        <ParticipantList
          votes={votes}
          votesLoading={votesLoading}
          highlightName={highlightName}
          setHighlightName={setHighlightName}
          highlightedByCell={highlightedByCell}
          setHighlightedByCell={setHighlightedByCell}
          setSelectedCellKey={setSelectedCellKey}
        />
      </main>
    );
  }

  // Public participation view
  return (
    <main className="container grid">
      <div className="flex" style={{gap:8, alignItems:'center'}}>
        <a href="/" className="btn">{t('nav.back')}</a>
        <h1 style={{margin:'0 0 0 .5rem'}}>{series.title || t('public.titleFallback')}</h1>
      </div>
      <p className="small">{t('public.instructions')}</p>

      <section className="card">
        <h2 style={{ marginTop: 0 }}>{t('public.games')}</h2>
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
        <h2 style={{ marginTop: 0 }}>{t('public.timeslots')}</h2>
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
        <input value={voterName} onChange={e => setVoterName(e.target.value)} placeholder={t('public.namePlaceholderRequired')} required className="input" />
        <button disabled={submitting || !voterName || voterName.trim() === ''} onClick={submit} className="btn btn-primary">{submitting ? '⏳ '+t('public.saving') : t('public.saveAvailability')}</button>
      </div>

      <div className="card">
        {t('public.shareLink')} <code className="badge" style={{marginLeft:8}}>{typeof window !== 'undefined' ? window.location.href : ''}</code>
      </div>
    </main>
  );
}

