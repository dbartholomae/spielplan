'use client';

import { useMemo, useState } from 'react';

export type Timeslot = { id: string; startsAt: string; endsAt?: string };

function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function dayLabel(d: Date): string {
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function TimeslotPicker({ onAdd }: { onAdd: (t: Timeslot) => void }) {
  const [date, setDate] = useState<string>('');
  const [start, setStart] = useState<string>('19:00');
  const [end, setEnd] = useState<string>('22:00');
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const upcomingDays = useMemo(() => {
    // Build a 3-week window starting today
    const days: { ymd: string; date: Date }[] = [];
    const base = new Date();
    for (let i = 0; i < 21; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      days.push({ ymd: toYMD(d), date: d });
    }
    return days;
  }, []);

  function toggle(ymd: string) {
    setSelected((prev) => ({ ...prev, [ymd]: !prev[ymd] }));
    setDate(''); // de-emphasize the single-date input when using multi-select
  }

  function clearSelection() {
    setSelected({});
  }

  function add() {
    const chosen = Object.entries(selected).filter(([, v]) => v).map(([k]) => k);
    const useDates = chosen.length > 0 ? chosen : (date ? [date] : []);
    if (useDates.length === 0) return;
    for (const ymd of useDates) {
      const startsAt = new Date(`${ymd}T${start}`).toISOString();
      const endsAt = end ? new Date(`${ymd}T${end}`).toISOString() : undefined;
      onAdd({ id: crypto.randomUUID(), startsAt, endsAt });
    }
    // keep selections so user can add another time range quickly, but clear single date input
    setDate('');
  }

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div className="small">Pick one or more dates, then choose a time range and click "Add Timeslots".</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: 8 }}>
        {upcomingDays.map(({ ymd, date: d }) => {
          const isSel = selected[ymd] ?? false;
          return (
            <button
              key={ymd}
              type="button"
              onClick={() => toggle(ymd)}
              className="btn"
              style={{
                padding: '8px 10px',
                borderRadius: 12,
                background: isSel ? 'var(--primary)' : 'var(--surface)',
                color: isSel ? '#fff' : 'inherit',
                borderColor: isSel ? '#c66000' : '#222',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start'
              }}
              title={ymd}
            >
              <span style={{ fontWeight: 700 }}>{d.toLocaleDateString(undefined, { weekday: 'short' })}</span>
              <span className="small" style={{ color: isSel ? 'rgba(255,255,255,.9)' : 'var(--muted)' }}>{d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <label className="small">Or pick a single date</label><br />
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input" style={{ maxWidth: 200 }} />
        </div>
        <div>
          <label className="small">Start</label><br />
          <input type="time" value={start} onChange={e => setStart(e.target.value)} className="input" style={{ maxWidth: 140 }} />
        </div>
        <div>
          <label className="small">End</label><br />
          <input type="time" value={end} onChange={e => setEnd(e.target.value)} className="input" style={{ maxWidth: 140 }} />
        </div>
        <button type="button" onClick={add} className="btn btn-primary">Add Timeslots</button>
        <button type="button" onClick={clearSelection} className="btn">Clear selection</button>
      </div>
    </div>
  );
}
