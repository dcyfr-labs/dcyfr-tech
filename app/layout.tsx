import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeProvider } from '@/components/theme-provider';
import { PageShell, SiteNav, SiteFooter } from '@/components/chrome';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  title: {
    default: 'DCYFR Research — Agent patterns, context engineering, and AI infrastructure',
    template: '%s | DCYFR Research',
  },
  description:
    'Deep dives into AI agent patterns, context engineering, delegation frameworks, and production-ready AI infrastructure from the DCYFR team.',
  openGraph: {
    type: 'website',
    siteName: 'DCYFR Research',
    url: 'https://dcyfr.tech',
  },
  metadataBase: new URL('https://dcyfr.tech'),
  alternates: {
    types: { 'application/rss+xml': '/rss.xml' },
  },
};

const DcyfrTechLogo = (
  <span className="text-lg font-semibold tracking-tight">
    dcyfr<span className="text-accent">.tech</span>
  </span>
);

const NAV_LINKS = [
  { href: '/articles', label: 'Articles' },
  { href: '/whitepapers', label: 'Whitepapers' },
  { href: '/search', label: 'Search' },
  { href: 'https://dcyfr.io', label: 'dcyfr.io', external: true },
];

const FOOTER_COLUMNS = [
  {
    title: 'Content',
    links: [
      { href: '/articles', label: 'Articles' },
      { href: '/whitepapers', label: 'Whitepapers' },
      { href: '/rss.xml', label: 'RSS' },
    ],
  },
  {
    title: 'Ecosystem',
    links: [
      { href: 'https://dcyfr.io', label: 'dcyfr.io', external: true },
      { href: 'https://dcyfr.codes', label: 'dcyfr.codes', external: true },
      { href: 'https://dcyfr.app', label: 'dcyfr.app', external: true },
    ],
  },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} theme-dcyfr-tech`}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:border focus:border-accent focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:text-foreground focus:outline-none"
          >
            Skip to main content
          </a>
          <PageShell
            nav={<SiteNav logo={DcyfrTechLogo} links={NAV_LINKS} />}
            footer={
              <SiteFooter
                brand={{
                  name: 'dcyfr.tech',
                  tagline: 'Research and technical writing from the DCYFR team.',
                }}
                columns={FOOTER_COLUMNS}
              />
            }
            padding="none"
            maxWidth="full"
          >
            <div id="main-content">{children}</div>
          </PageShell>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
