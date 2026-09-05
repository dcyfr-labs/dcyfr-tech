import { test, expect } from '@playwright/test';

/**
 * Visual regression baseline per
 * openspec/changes/dcyfr-skeleton-sites-scaffolding/spec.md#51-screenshot-baseline
 *
 * First-run flow: `npm run test:snapshots:update` captures baselines. Commit the PNGs.
 * Subsequent preview deploys diff against them; >5% pixel change fails.
 *
 * dcyfr.tech is editorial — reading-first. Two views covered:
 * - `/` home (latest articles + featured)
 * - `/articles` full index
 *
 * Both captured at desktop (1440×900) and mobile (375×812). Motion paused.
 */

const VIEWPORTS = [
  { width: 1440, height: 900, name: 'desktop' },
  { width: 375, height: 812, name: 'mobile' },
] as const;

const ROUTES = [
  { path: '/', name: 'home' },
  { path: '/articles', name: 'articles-index' },
] as const;

for (const route of ROUTES) {
  for (const vp of VIEWPORTS) {
    test(`${route.name} @ ${vp.name}`, async ({ page }) => {
      // Light, deliberately: ThemeProvider sets defaultTheme="light", so
      // that is what a first-time visitor gets and what these baselines
      // must show.
      //
      // This used to pass `colorScheme: 'dark'` with a comment claiming the
      // baselines were "preserved against dark-mode render". They never
      // were. next-themes only consults prefers-color-scheme when the
      // resolved theme is "system"; with an explicit defaultTheme and no
      // stored choice it resolves "light" and never adds `.dark`. The
      // emulation changed nothing, so the assertion read as dark coverage
      // while capturing light. Dark is now covered for real in
      // contrast.spec.ts, which drives the theme the way the app does.
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      // The fixed wait is a floor for hydration and layout, not the font
      // gate. Geist is self-hosted through next/font/local and swaps in
      // whenever the woff2 lands, so the capture waits on the face itself.
      // Geist Mono ships adjustFontFallback: false, so its text has no
      // size-adjusted fallback and shifts once on load.
      await page.waitForTimeout(1500);
      await page.evaluate(() => document.fonts.ready);
      await expect(page).toHaveScreenshot(`${route.name}-${vp.name}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.05,
        animations: 'disabled',
      });
    });
  }
}
