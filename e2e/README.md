# e2e/ — Playwright tests

## Files

- `snapshots.spec.ts` — visual regression baseline per [`openspec/changes/dcyfr-skeleton-sites-scaffolding/spec.md#51-screenshot-baseline`](../../../../openspec/changes/dcyfr-skeleton-sites-scaffolding/spec.md) and [`docs/dcyfr-workspace/polish-loop.md`](../../../../docs/dcyfr-workspace/polish-loop.md).
- `snapshots.spec.ts-snapshots/` — committed baseline PNGs (generated on first run).

## One-time setup

Playwright browsers aren't installed by `npm install` — separate download:

```bash
npx playwright install chromium
```

Only chromium — cross-browser visual diffs produce pixel noise without signal.

## First-time baseline capture

```bash
# Against production
BASE_URL=https://dcyfr.tech npm run test:snapshots:update

# Or against a Vercel preview
BASE_URL=https://dcyfr-tech-<hash>.vercel.app npm run test:snapshots:update
```

Commit the resulting PNGs.

## Regular runs

```bash
npm run test:snapshots
```

Fails if diff > 5% (`maxDiffPixelRatio: 0.05`).

## Intentional-change refresh

1. Merge design change to main
2. Vercel deploys preview
3. `BASE_URL=<preview-url> npm run test:snapshots:update` locally
4. Commit refreshed PNGs alongside or after the design change
5. Subsequent runs diff against the new baseline

## Coverage

- **Routes:** `/` (home) + `/articles` (index) — editorial surface
- **Viewports:** desktop `1440×900`, mobile `375×812`
- **Motion:** `prefers-reduced-motion: reduce` + `animations: 'disabled'`

## Related

- [Polish loop architecture](../../../../docs/dcyfr-workspace/polish-loop.md)
- [`nexus/scout-prompts/dcyfr-tech.md`](../../../../nexus/scout-prompts/dcyfr-tech.md) — scout context that reads these baselines
