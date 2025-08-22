'use client';

export type PublicViewProps = {
  t: (key: string) => string;
  series: {
    id: string;
    slug: string;
    title?: string;
    games: { id: string; name: string; thumbnail?: string }[];
    timeslots: { id: string; startsAt: string; endsAt?: string }[];
  };
  gameSel: Record<string, boolean>;
  setGameSel: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
  slotSel: Record<string, boolean>;
  setSlotSel: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
  voterName: string;
  setVoterName: (name: string) => void;
  submitting: boolean;
  submit: () => void;
  formatIso: (iso?: string) => string;
};

export default function PublicView(props: PublicViewProps) {
  const {
    t,
    series,
    gameSel,
    setGameSel,
    slotSel,
    setSlotSel,
    voterName,
    setVoterName,
    submitting,
    submit,
    formatIso,
  } = props;

  return (
    <main className="container grid">
      <div className="flex" style={{ gap: 8, alignItems: 'center' }}>
        <a href="/" className="btn">{t('nav.back')}</a>
        <h1 style={{ margin: '0 0 0 .5rem' }}>{series.title || t('public.titleFallback')}</h1>
      </div>
      <p className="small">{t('public.instructions')}</p>

      <section className="card">
        <h2 style={{ marginTop: 0 }}>{t('public.games')}</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {series.games.map(g => {
            const checked = gameSel[g.id] ?? false;
            return (
              <label key={g.id} className="badge" style={{ padding: '8px 10px', cursor: 'pointer', background: checked ? 'var(--primary)' : 'var(--surface-muted)', color: checked ? '#fff' : 'inherit' }}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={e => setGameSel(prev => ({ ...prev, [g.id]: e.target.checked }))}
                />
                {g.thumbnail ? (
                  <img
                    src={g.thumbnail}
                    alt="thumb"
                    width={32}
                    height={32}
                    style={{ borderRadius: 6, border: '1px solid #333', marginLeft: 6, marginRight: 6 }}
                  />
                ) : null}
                <span>{g.name}</span>
              </label>
            );
          })}
        </div>
      </section>

      <section className="card">
        <h2 style={{ marginTop: 0 }}>{t('public.timeslots')}</h2>
        <ul className="list">
          {series.timeslots.map(ts => {
            const checked = slotSel[ts.id] ?? false;
            return (
              <li key={ts.id} className="item" style={{ padding: '8px 12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={e => setSlotSel(prev => ({ ...prev, [ts.id]: e.target.checked }))}
                  />
                  <span>
                    {formatIso(ts.startsAt)}
                    {ts.endsAt ? ` - ${new Date(ts.endsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="flex" style={{ gap: 12, alignItems: 'center' }}>
        <input
          value={voterName}
          onChange={e => setVoterName(e.target.value)}
          placeholder={t('public.namePlaceholderRequired')}
          required
          className="input"
        />
        <button
          disabled={submitting || !voterName || voterName.trim() === ''}
          onClick={submit}
          className="btn btn-primary"
        >
          {submitting ? '⏳ ' + t('public.saving') : t('public.saveAvailability')}
        </button>
      </div>

      <div className="card">
        {t('public.shareLink')} <code className="badge" style={{ marginLeft: 8 }}>{typeof window !== 'undefined' ? window.location.href : ''}</code>
      </div>
    </main>
  );
}
