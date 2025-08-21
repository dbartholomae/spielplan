'use client';

import { useI18n } from '../../lib/i18n';

export default function TermsPage() {
  const { t } = useI18n();
  return (
    <main className="container grid">
      <div className="flex" style={{gap:8, alignItems:'center'}}>
        <a href="/" className="btn">{t('nav.back')}</a>
        <h1 style={{margin:'0 0 0 .5rem'}}>{t('terms.title')}</h1>
      </div>
      <section className="card">
        <p>{t('terms.intro')}</p>
        <p>{t('terms.liability')}</p>
        <p>{t('terms.contact')}</p>
      </section>
    </main>
  );
}
