import type { Metadata } from 'next';
import './global.css';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '../components/ThemeProvider';
import { getMetadataBase } from '../lib/seo-server';

const siteDescription =
  'A modern learning management system with live physics classes, recordings, and expert instructors — OnlinePHYSICS by Pasindu Serasinghe.';

const metadataBase = getMetadataBase();

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: 'Pasindu Serasinghe - OnlinePHYSICS',
    template: '%s | OnlinePHYSICS',
  },
  description: siteDescription,
  applicationName: 'OnlinePHYSICS',
  authors: [{ name: 'Pasindu Serasinghe', url: metadataBase.toString() }],
  keywords: [
    'physics',
    'online classes',
    'Sri Lanka',
    'A/L physics',
    'live classes',
    'LMS',
    'OnlinePHYSICS',
    'Pasindu Serasinghe',
  ],
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
  openGraph: {
    type: 'website',
    locale: 'en_LK',
    url: '/',
    siteName: 'OnlinePHYSICS',
    title: 'Pasindu Serasinghe - OnlinePHYSICS',
    description: siteDescription,
    images: [{ url: '/icon.svg', type: 'image/svg+xml', alt: 'OnlinePHYSICS' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pasindu Serasinghe - OnlinePHYSICS',
    description: siteDescription,
  },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--surface)',
                color: 'var(--text-1)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-md)',
                fontSize: '14px',
                fontWeight: '500',
              },
              success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
