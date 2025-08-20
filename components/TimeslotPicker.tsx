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

// Month coloring helpers
function monthHue(month: number): number {
  // 12 distinct hues across the circle
  return (month * 30) % 360;
}
function hsl(h: number, s: number, l: number): string {
  return `hsl(${h}, ${s}%, ${l}%)`;
}
function monthBackground(month: number, weekend: boolean): string {
  const h = monthHue(month);
  // Use lighter background for weekdays, darker for weekends
  const l = weekend ? 74 : 86; // lightness
  return hsl(h, 70, l);
}
function monthBorder(month: number): string {
  const h = monthHue(month);
  return hsl(h, 70, 35);
}
function monthSelectedBackground(month: number, weekend: boolean): string {
  const h = monthHue(month);
  // Selected should be noticeably darker than base background
  const l = weekend ? 62 : 76; // darker than 74/86
  return hsl(h, 75, l);
}

export default function TimeslotPicker({ onAdd }: { onAdd: (t: Timeslot) => void }) {
  const [date, setDate] = useState<string>('');
  const [start, setStart] = useState<string>('19:00');
  const [end, setEnd] = useState<string>('22:00');
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const { weekDays, todayYMD } = useMemo(() => {
    // Compute Monday of the current week (Mon-Sun), using local time.
    const now = new Date();
    const todayYMDLocal = toYMD(now);
    // In JS getDay(): 0=Sun,1=Mon,...6=Sat. Convert so Monday=0.
    const dowMondayZero = (now.getDay() + 6) % 7; // 0..6
    const monday = new Date(now);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(now.getDate() - dowMondayZero);
    const days: { ymd: string; date: Date }[] = [];
    // Show current week + next 7 weeks (total 8 weeks = 56 days)
    for (let i = 0; i < 56; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push({ ymd: toYMD(d), date: d });
    }
    return { weekDays: days, todayYMD: todayYMDLocal };
  }, []);

  function toggle(ymd: string, disabled?: boolean) {
    if (disabled) return;
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
      <div className="small">Pick a date in the next 7 weeks (Mon–Sun), then choose a time range and click "Add Timeslots".</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: 8 }}>
        {weekDays.map(({ ymd, date: d }) => {
          const isSel = selected[ymd] ?? false;
          const isPast = ymd < todayYMD; // string compare works for YYYY-MM-DD
          const month = d.getMonth();
          const weekend = d.getDay() === 0 || d.getDay() === 6; // Sun or Sat
          const bgBase = monthBackground(month, weekend);
          const bg = isSel ? monthSelectedBackground(month, weekend) : bgBase;
          const color = '#111';
          const borderColor = isSel ? monthBorder(month) : '#222';
          const borderWidth = isSel ? 3 : 2;
          const opacity = isPast ? 0.5 : 1;
          const cursor = isPast ? 'not-allowed' as const : 'pointer' as const;
          return (
            <button
              key={ymd}
              type="button"
              onClick={() => toggle(ymd, isPast)}
              className="btn"
              aria-pressed={isSel}
              style={{
                padding: '8px 10px',
                borderRadius: 12,
                background: bg,
                color,
                borderColor,
                borderWidth,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                position: 'relative',
                opacity,
                cursor
              }}
              title={isPast ? `${ymd} (past)` : ymd}
              disabled={isPast}
            >
              {isSel && (
                <span aria-hidden="true" style={{ position: 'absolute', top: 6, right: 6, background: '#111', color: '#fff', borderRadius: 999, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, boxShadow: '0 1px 0 rgba(0,0,0,.2)' }}>✓</span>
              )}
              <span style={{ fontWeight: 700 }}>{d.toLocaleDateString(undefined, { weekday: 'short' })}</span>
              <span className="small" style={{ color: 'var(--muted)' }}>{d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <label className="small">Or pick a single date</label><br />
          <input type="date" value={date} onChange={e => setDate(e.target.value)} min={todayYMD} className="input" style={{ maxWidth: 200 }} />
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
