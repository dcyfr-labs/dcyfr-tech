import { test, expect } from '@playwright/test';

/**
 * Text-contrast gate, both colour schemes.
 *
 * This exists because the screenshot gate cannot catch invisible text. The
 * committed `articles-index-desktop.png` baseline was captured on 2026-04-18,
 * a day before the theme-blind sweep, with the page `<h1>` and all three card
 * titles rendering white-on-white. Every run since has diffed against it and
 * passed: the missing headings are 3,346 pixels, a ratio of 0.01, against a
 * `maxDiffPixelRatio` of 0.05. Four invisible headings fit inside the
 * tolerance five times over, so the visual gate certified the bug for four
 * months rather than catching it.
 *
 * Pixels are the wrong instrument for this. Contrast is the right one, and it
 * needs no baseline, so it cannot go stale the way that PNG did.
 *
 * Dark is driven through localStorage rather than `emulateMedia`, because
 * next-themes only consults `prefers-color-scheme` when the resolved theme is
 * "system". With `defaultTheme="light"` and no stored choice it resolves
 * "light" and never adds `.dark`, so media emulation silently does nothing.
 * Setting the key the provider itself reads is the app's own path.
 */

const ROUTES = [
  '/',
  '/articles',
  '/articles/context-window-budget-management',
] as const;

const THEMES = ['light', 'dark'] as const;

/**
 * The dcyfr.tech identity accent (`--accent: 38 92% 50%`, editorial gold) is
 * knowingly below AA as text on the light ground — 2.13:1 on the nav logo,
 * 1.90:1 on category badges. It is left alone here on purpose: it is the
 * brand pair, and resolving the brand-versus-interaction split for `--accent`
 * belongs to the engine adoption (dcyfr-satellite-engine-adoption Task 4),
 * which then empties this identity block entirely. Delete this exemption when
 * that lands — if the accent is still failing afterwards, that is a real
 * regression and this gate should say so.
 */
const IDENTITY_ACCENT_RGB = [245, 159, 10] as const;

/**
 * Floor for "the page actually rendered". The thinnest of these routes
 * measures ~40 text elements; well under that means a shell with no content,
 * which would pass the contrast assertion vacuously.
 */
const MIN_TEXT_ELEMENTS = 20;

/** Serialized into the page; keep it dependency-free. */
function collectFailures(accent: readonly number[]) {
  const parse = (c: string) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(',').map((s) => parseFloat(s.trim()));
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  type C = { r: number; g: number; b: number; a: number };
  const over = (f: C, b: C): C => ({
    r: f.r * f.a + b.r * (1 - f.a),
    g: f.g * f.a + b.g * (1 - f.a),
    b: f.b * f.a + b.b * (1 - f.a),
    a: 1,
  });

  // Walk ancestors for the first opaque background and composite the
  // translucent layers back down onto it. Reading document.body's own
  // background is not enough: it is frequently rgba(0,0,0,0), which composites
  // every element over black and reports passing text as failing.
  const groundOf = (el: Element): C => {
    const stack: C[] = [];
    let n: Element | null = el;
    while (n && n.nodeType === 1) {
      const bg = parse(getComputedStyle(n).backgroundColor);
      if (bg && bg.a > 0) {
        stack.push(bg);
        if (bg.a >= 1) break;
      }
      n = n.parentElement;
    }
    let g: C =
      stack.length && stack[stack.length - 1].a >= 1
        ? stack.pop()!
        : { r: 255, g: 255, b: 255, a: 1 };
    for (let i = stack.length - 1; i >= 0; i--) g = over(stack[i], g);
    return g;
  };

  const lum = (c: C) => {
    const f = (v: number) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const ratio = (a: C, b: C) => {
    const l1 = lum(a);
    const l2 = lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };

  const out: { text: string; cls: string; ratio: number; need: number }[] = [];
  let measured = 0;
  document.querySelectorAll('*').forEach((el) => {
    const text = Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3)
      .map((n) => (n.textContent ?? '').trim())
      .join(' ')
      .trim();
    if (!text) return;

    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none' || parseFloat(s.opacity) === 0) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const fg = parse(s.color);
    if (!fg) return;
    if (fg.r === accent[0] && fg.g === accent[1] && fg.b === accent[2]) return;

    const ground = groundOf(el);
    const contrast = ratio(over(fg, ground), ground);
    measured++;

    const size = parseFloat(s.fontSize);
    const bold = parseInt(s.fontWeight, 10) >= 700;
    const need = size >= 24 || (size >= 18.66 && bold) ? 3 : 4.5;

    if (contrast < need) {
      out.push({
        text: text.slice(0, 60),
        cls: el.className.toString().slice(0, 90),
        ratio: Math.round(contrast * 100) / 100,
        need,
      });
    }
  });
  return { measured, failures: out };
}

for (const theme of THEMES) {
  for (const route of ROUTES) {
    test(`contrast: ${route} @ ${theme}`, async ({ page }) => {
      await page.addInitScript((t) => {
        try {
          window.localStorage.setItem('theme', t);
        } catch {
          /* storage unavailable — the assertion below catches the wrong theme */
        }
      }, theme);

      await page.goto(route, { waitUntil: 'load' });
      await page.waitForFunction(
        (t) => document.documentElement.classList.contains(t),
        theme,
        { timeout: 5000 },
      );
      // The heading this gate exists for is rendered from article markdown,
      // which is not on the page at domcontentloaded. Wait for the content
      // itself, or the walk below inspects a shell and reports nothing.
      await page.locator('h1').first().waitFor({ state: 'visible', timeout: 5000 });

      const { measured, failures } = await page.evaluate(collectFailures, IDENTITY_ACCENT_RGB);

      // A gate that measures nothing passes everything. That is precisely how
      // the screenshot baseline came to certify invisible headings, so this
      // one states its own floor rather than trusting an empty result.
      expect(
        measured,
        `Only ${measured} text elements measured on ${route} — the page did not render, so a clean result here means nothing.`,
      ).toBeGreaterThan(MIN_TEXT_ELEMENTS);

      expect(
        failures,
        `Text below WCAG AA in ${theme} mode on ${route} (${measured} elements measured):\n` +
          failures.map((f) => `  ${f.ratio}:1 (needs ${f.need}) "${f.text}" [${f.cls}]`).join('\n'),
      ).toEqual([]);
    });
  }
}
