import type { MetadataRoute } from 'next';
import { getClassesListApiUrl, getMetadataBase } from '../lib/seo-server';

type ClassSummary = { _id: string };

async function fetchClassIds(): Promise<ClassSummary[]> {
  try {
    const res = await fetch(getClassesListApiUrl(), {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as ClassSummary[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getMetadataBase();
  const classes = await fetchClassIds();

  const staticPaths = [
    { path: '', changeFrequency: 'weekly' as const, priority: 1 },
    { path: 'classes', changeFrequency: 'daily' as const, priority: 0.9 },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map(
    ({ path, changeFrequency, priority }) => ({
      url: new URL(path ? `${path}/` : '', base).toString(),
      lastModified: new Date(),
      changeFrequency,
      priority,
    }),
  );

  const classEntries: MetadataRoute.Sitemap = classes.map((c) => ({
    url: new URL(`classes/${c._id}/`, base).toString(),
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...classEntries];
}
