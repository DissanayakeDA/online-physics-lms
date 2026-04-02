/**
 * Server-only helpers for metadata, sitemap, and OG URLs.
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://yourdomain.com).
 */
export function getMetadataBase(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const trimmed = raw.replace(/\/$/, '');
  return new URL(`${trimmed}/`);
}

export function getBackendOrigin(): string {
  return (
    process.env.BACKEND_PROXY_URL ||
    process.env.BACKEND_URL ||
    'http://127.0.0.1:3001'
  ).replace(/\/$/, '');
}

export function getClassesListApiUrl(): string {
  return `${getBackendOrigin()}/api/classes`;
}

export function getClassDetailApiUrl(id: string): string {
  return `${getBackendOrigin()}/api/classes/${encodeURIComponent(id)}`;
}
