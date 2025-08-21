export function getBaseUrl(): string {
  // Browser: use current origin
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  // Prefer explicit site URL if provided
  const envSite = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (envSite) {
    return envSite.replace(/\/$/, '');
  }
  // Vercel provides VERCEL_URL like "spielplan.vercel.app"
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    const protocol = vercelUrl.startsWith('http') ? '' : 'https://';
    return `${protocol}${vercelUrl}`.replace(/\/$/, '');
  }
  // Fallback to localhost
  const port = process.env.PORT || '3000';
  return `http://localhost:${port}`;
}
