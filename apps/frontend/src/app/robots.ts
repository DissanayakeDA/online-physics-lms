import type { MetadataRoute } from 'next';
import { getMetadataBase } from '../lib/seo-server';

export default function robots(): MetadataRoute.Robots {
  const base = getMetadataBase();
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard', '/admin', '/auth/'],
      },
    ],
    sitemap: new URL('sitemap.xml', base).toString(),
  };
}
