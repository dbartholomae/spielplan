'use client';

import ParticipantList from './ParticipantList';
import type { Dispatch, SetStateAction } from 'react';

// Types are structural to avoid cross-file coupling
export type OwnerViewProps = {
  t: (key: string) => string;
  series: {
    id: string;
    slug: string;
    title?: string;
    games: { id: string; name: string; thumbnail?: string }[];
    timeslots: { id: string; startsAt: string; endsAt?: string }[];
  };
  votes: {
    id: string;
    voterName?: string;
    voterKey: string;
    selectedGameIds: string[];
    selectedTimeslotIds: string[];
    createdAt: string;
  }[];
  votesLoading: boolean;
  votesError: string | null;
  counts: Map<string, { count: number; names: string[] }>;
  highlightedKeys: Set<string> | null;
  selectedCellKey: string | null;
  highlightName: string | null;
  highlightedByCell: Set<string> | null;
  setHighlightName: Dispatch<SetStateAction<string | null>>;
  setHighlightedByCell: Dispatch<SetStateAction<Set<string> | null>>;
  setSelectedCellKey: Dispatch<SetStateAction<string | null>>;
  heatBg: (count: number) => string | undefined;
  formatIso: (iso?: string) => string;
};

export default function OwnerView(props: OwnerViewProps) {
  const {
    t,
    series,
    votes,
    votesLoading,
    votesError,
    counts,
    highlightedKeys,
    selectedCellKey,
    highlightName,
    highlightedByCell,
    setHighlightName,
    setHighlightedByCell,
    setSelectedCellKey,
    heatBg,
    formatIso,
  } = props;

  return (
    <main className="container grid">
      <div className="flex" style={{ gap: 8, alignItems: 'center' }}>
        <a href="/" className="btn">{t('nav.back')}</a>
        <h1 style={{ margin: '0 0 0 .5rem' }}>{series.title || t('public.titleFallback')}</h1>
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
              {series.timeslots.map(ts => (
                <tr key={ts.id}>
                  <td style={{ padding: '8px', whiteSpace: 'nowrap' }}>{formatIso(ts.startsAt)}{ts.endsAt ? ` - ${new Date(ts.endsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}</td>
                  {series.games.map(g => {
                    const key = `${ts.id}|${g.id}`;
                    const c = counts.get(key)?.count ?? 0;
                    const clickable = (counts.get(key)?.count ?? 0) > 0;
                    return (
                      <td key={g.id} style={{ padding: '8px', background: heatBg(c) }}>
                        <button
                          className="btn"
                          style={{ padding: '4px 8px', opacity: clickable ? 1 : 0.6, borderColor: ((selectedCellKey === key) || (highlightedKeys?.has(key))) ? '#f97316' : undefined }}
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
