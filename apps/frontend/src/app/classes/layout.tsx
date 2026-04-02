import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse classes',
  description:
    'Explore live physics classes, recorded lessons, and structured courses. Filter by level, price, and subject.',
  alternates: {
    canonical: '/classes',
  },
  openGraph: {
    title: 'Browse classes | OnlinePHYSICS',
    description:
      'Explore live physics classes, recorded lessons, and structured courses.',
    url: '/classes',
  },
};

export default function ClassesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
