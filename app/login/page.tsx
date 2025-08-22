"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useI18n } from '../../lib/i18n';

export default function LoginPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!supabase) return;
    let unsub: (() => void) | undefined;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id);
      unsub = supabase.auth.onAuthStateChange((_event, session) => {
        setUserId(session?.user?.id);
      }).data.subscription.unsubscribe;
    })();
    return () => { if (unsub) unsub(); };
  }, []);

  async function sendMagicLink() {
    if (!supabase || !email.trim()) return;
    setSending(true);
    setInfo(null);
    setErr(null);
    try {
      // Build redirect URL based on current environment/domain
      const { getBaseUrl } = await import('../../lib/url');
      const redirectTo = getBaseUrl();
      const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: redirectTo } });
      if (error) throw error;
      setInfo(t('auth.magicLinkSent'));
    } catch (e: any) {
      setErr(e?.message || 'Failed to send magic link');
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="container grid">
      <div className="flex" style={{gap:8, alignItems:'center'}}>
        <a href="/" className="btn">{t('nav.back')}</a>
        <h1 style={{margin:'0 0 0 .5rem'}}>{t('auth.signInWithEmail')}</h1>
      </div>

      {!supabase && (
        <div className="card" style={{ color: 'crimson' }}>
          Supabase is not configured. The app will run in guest mode.
        </div>
      )}

      {supabase && (
        <section className="card" style={{ maxWidth: 520 }}>
          {userId && (
            <div className="badge" style={{ marginBottom: 12 }}>You are signed in.</div>
          )}
          <form
            onSubmit={async (e) => { e.preventDefault(); await sendMagicLink(); }}
          >
            <label className="small" htmlFor="email">Email</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder')}
                className="input"
                style={{ maxWidth: 280 }}
                required
                autoComplete="email"
              />
              <button type="submit" disabled={sending || !email.trim()} className="btn btn-primary" aria-busy={sending}>
                {sending ? '⏳ ' + t('auth.sendMagicLink') : t('auth.sendMagicLink')}
              </button>
            </div>
          </form>
          {info && <div className="small" style={{ color: 'var(--muted)', marginTop: 8 }}>{info}</div>}
          {err && <div className="small" style={{ color: 'crimson', marginTop: 8 }}>{err}</div>}
        </section>
      )}
    </main>
  );
}
