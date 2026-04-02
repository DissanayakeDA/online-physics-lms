import type { Metadata } from 'next';
import { getClassDetailApiUrl, getMetadataBase } from '../../../lib/seo-server';

type ClassDoc = {
  title?: string;
  description?: string;
  subject?: string;
  instructor?: string;
  thumbnail?: string;
};

async function fetchClassForMeta(id: string): Promise<ClassDoc | null> {
  try {
    const res = await fetch(getClassDetailApiUrl(id), {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return (await res.json()) as ClassDoc;
  } catch {
    return null;
  }
}

type LayoutParams = Promise<{ id: string }> | { id: string };

export async function generateMetadata(props: {
  params: LayoutParams;
}): Promise<Metadata> {
  const params = await Promise.resolve(props.params);
  const id = params.id;
  const cls = await fetchClassForMeta(id);
  const base = getMetadataBase();

  if (!cls?.title) {
    return {
      title: 'Class',
      alternates: { canonical: `/classes/${id}` },
    };
  }

  const rawDesc = (cls.description || '').replace(/\s+/g, ' ').trim();
  const description =
    rawDesc.length > 155 ? `${rawDesc.slice(0, 152)}…` : rawDesc ||
    `${cls.subject ?? 'Physics'} with ${cls.instructor ?? 'instructor'} — enroll on OnlinePHYSICS.`;

  const ogImages =
    cls.thumbnail && cls.thumbnail.length > 0
      ? [
          {
            url: new URL(
              `/uploads/${cls.thumbnail.replace(/^\/+/, '')}`,
              base,
            ).toString(),
            alt: cls.title,
          },
        ]
      : [{ url: '/icon.svg', alt: cls.title }];

  return {
    title: cls.title,
    description,
    alternates: { canonical: `/classes/${id}` },
    openGraph: {
      title: cls.title,
      description,
      url: `/classes/${id}`,
      type: 'website',
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: cls.title,
      description,
      images: ogImages.map((i) => i.url),
    },
  };
}

export default function ClassDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
