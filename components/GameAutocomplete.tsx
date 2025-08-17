'use client';

import { useEffect, useMemo, useState } from 'react';

export type GameItem = { id: string; name: string; thumbnail?: string };

export default function GameAutocomplete({ onAdd }: { onAdd: (game: GameItem) => void }) {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<GameItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!q.trim()) { setItems([]); setError(null); return; }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/bgg-search?q=${encodeURIComponent(q.trim())}`);
        const data = await res.json();
        setItems(data.items ?? []);
      } catch (e: any) {
        setError('Search failed');
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div style={{ width: '100%', maxWidth: 600 }}>
      <label style={{ display: 'block', marginBottom: 8 }}>Search board games</label>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Type to search..."
        style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, border: '2px solid #333', outline: 'none' }}
      />
      {loading && <div style={{ marginTop: 8 }}>Searching...</div>}
      {error && <div style={{ marginTop: 8, color: 'crimson' }}>{error}</div>}
      {!!items.length && (
        <ul style={{ listStyle: 'none', padding: 0, marginTop: 8, border: '2px dashed #333', borderRadius: 8 }}>
          {items.map((g) => (
            <li key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 8, borderBottom: '1px dotted #999' }}>
              {g.thumbnail ? (
                <img src={g.thumbnail} alt="thumb" width={48} height={48} style={{ borderRadius: 6, border: '2px solid #333' }} />
              ) : (
                <div style={{ width: 48, height: 48, borderRadius: 6, border: '2px solid #333', background: '#faf7e5' }} />
              )}
              <div style={{ flex: 1 }}>{g.name}</div>
              <button
                type="button"
                onClick={() => onAdd(g)}
                style={{ background: '#ffd447', border: '2px solid #333', borderRadius: 8, padding: '4px 10px', cursor: 'pointer' }}
              >Add</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
