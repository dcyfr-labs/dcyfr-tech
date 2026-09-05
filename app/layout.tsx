import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeProvider } from '@/components/chrome/theme-provider';
import { SiteHeader, type HeaderNavItem } from '@/components/chrome/site-header';
import { SiteFooter, type FooterLink } from '@/components/chrome/site-footer';
import type { ChromeNavSection } from '@/components/chrome/nav-utils';
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
    dcyfr<span className="text-accent-600">.tech</span>
  </span>
);

// The v1 link list minus the `external` flag: v2 nav items carry no such flag,
// so dcyfr.io opens in the same tab. There was no `href="/"` entry to drop —
// the logo has always carried home on this site.
const NAV: HeaderNavItem[] = [
  { href: '/articles', label: 'Articles' },
  { href: '/whitepapers', label: 'Whitepapers' },
  { href: '/search', label: 'Search' },
  { href: 'https://dcyfr.io', label: 'dcyfr.io' },
];

// The drawer is the only place every link is reachable below `md`: the header
// link row and the footer link row are both `hidden md:flex`.
//
// Content and Ecosystem are the v1 footer's two columns. The v1 Ecosystem
// column already held exactly the external links, so it becomes the Ecosystem
// section rather than being copied alongside a second one (the shape the
// dcyfr-io pilot hit with its Products column). Search is added to Content: it
// is a header link that appears in no v1 footer column, so the drawer is the
// only surface that can carry it below `md`. Legal is the v1 legal row, which
// the one-line v2 footer keeps on desktop and drops below `md`.
//
// No item may carry `icon`. This file is a Server Component and SiteHeader is
// 'use client', so an ElementType cannot cross the boundary.
const SECTIONS: ChromeNavSection[] = [
  {
    id: 'content',
    label: 'Content',
    items: [
      { href: '/articles', label: 'Articles' },
      { href: '/whitepapers', label: 'Whitepapers' },
      { href: '/search', label: 'Search' },
      { href: '/rss.xml', label: 'RSS' },
    ],
  },
  {
    id: 'ecosystem',
    label: 'Ecosystem',
    items: [
      { href: 'https://dcyfr.io', label: 'dcyfr.io' },
      { href: 'https://dcyfr.codes', label: 'dcyfr.codes' },
      { href: 'https://dcyfr.app', label: 'dcyfr.app' },
    ],
  },
  {
    id: 'legal',
    label: 'Legal',
    items: [
      { href: '/privacy', label: 'Privacy' },
      { href: 'https://dcyfr.ai/terms', label: 'Terms' },
      { href: 'https://dcyfr.ai/security', label: 'Security' },
    ],
  },
];

// Flat, per Decision 5: the internal column links plus the three legal links,
// on one line beside the copyright. The v1 Ecosystem column's three external
// links live in the drawer above; dcyfr.io also stays in the header row, so
// dcyfr.codes and dcyfr.app are the two links this row gives up on desktop.
const FOOTER: FooterLink[] = [
  { href: '/articles', label: 'Articles' },
  { href: '/whitepapers', label: 'Whitepapers' },
  { href: '/rss.xml', label: 'RSS' },
  { href: '/privacy', label: 'Privacy' },
  { href: 'https://dcyfr.ai/terms', label: 'Terms' },
  { href: 'https://dcyfr.ai/security', label: 'Security' },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // data-identity selects the theme package; the .theme-dcyfr-tech class is
    // kept so the dcyfr-site-scaffold identity-class check still has a subject
    // and re-branding later is a one-value swap rather than a re-wire.
    //
    // Both stay on <html>. The engine's dark selector is the compound
    // [data-identity="slate"].dark, so a stamp that slipped to <body> would
    // still render, silently without the dark scheme.
    <html
      lang="en"
      suppressHydrationWarning
      data-identity="slate"
      className={`theme-dcyfr-tech ${inter.variable}`}
    >
      <body className="flex min-h-dvh flex-col">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {/* focus:z-50 clears the fixed header, which is z-40. */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
          >
            Skip to content
          </a>
          <SiteHeader
            logo={DcyfrTechLogo}
            logoAriaLabel="dcyfr.tech home"
            links={NAV}
            mobileNavSections={SECTIONS}
          />
          {/* pt-18 clears the fixed h-18 header. The skip link's target id was
              on a <div> PageShell wrapped around {children}; it moves here. */}
          <main id="main-content" className="flex-1 pt-18">
            {children}
          </main>
          <SiteFooter brand="DCYFR" links={FOOTER} />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
