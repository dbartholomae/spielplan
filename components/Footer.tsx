"use client";

import { useI18n } from "../lib/i18n";
// Import image from assets so Next bundles it
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import bggLogo from "../assets/powered-by-bgg.webp";

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer style={{ marginTop: 40, padding: "16px 0", borderTop: "1px solid var(--border, #222)" }}>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <nav style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a href="/privacy" style={{ textDecoration: 'underline' }}>{t('footer.privacy')}</a>
          <a href="/imprint" style={{ textDecoration: 'underline' }}>{t('footer.imprint')}</a>
        </nav>
        <a href="https://boardgamegeek.com" target="_blank" rel="noreferrer" title="Powered by BoardGameGeek">
          <img src={(bggLogo as any).src ?? (bggLogo as any)} alt="Powered by BoardGameGeek" width={240} height={48} style={{ height: 48, width: "auto", opacity: 0.9 }} />
        </a>
      </div>
    </footer>
  );
}
