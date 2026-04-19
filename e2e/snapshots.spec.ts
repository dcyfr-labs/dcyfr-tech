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
      // colorScheme lock — pre-migration hardcoded palette was effectively
      // dark-only; baselines preserved against dark-mode render. See
      // openspec/changes/dcyfr-palette-class-migration spec §2.2.
      await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);
      await expect(page).toHaveScreenshot(`${route.name}-${vp.name}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.05,
        animations: 'disabled',
      });
    });
  }
}
