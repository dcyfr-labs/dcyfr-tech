# dcyfr-tech

Research hub, whitepapers, and technical deep-dives for the DCYFR ecosystem, live at **[dcyfr.tech](https://dcyfr.tech)**.

`dcyfr.tech` is a Next.js 16 / React 19 research and technical publishing hub: articles, whitepapers, full-text search, and an RSS feed. **Article content is machine-synced, not hand-edited** — an automated pipeline exports it from the Nexus knowledge system (see below), so publishing happens upstream, not in this repo. It is part of the dcyfr-labs site family alongside [dcyfr-io](https://github.com/dcyfr-labs/dcyfr-io), [dcyfr-app](https://github.com/dcyfr-labs/dcyfr-app), [dcyfr-bot](https://github.com/dcyfr-labs/dcyfr-bot), [dcyfr-build](https://github.com/dcyfr-labs/dcyfr-build), [dcyfr-codes](https://github.com/dcyfr-labs/dcyfr-codes), and [dcyfr-work](https://github.com/dcyfr-labs/dcyfr-work).

## Content pipeline

- `export-nexus.yml` runs the sync in CI, opening PRs scoped to `data/articles.json` via GitHub App tokens.
- `npm run export:content` (`scripts/export-nexus-content.mjs`) performs the Nexus → `data/articles.json` export.
- Do not hand-edit `data/articles.json`; changes will be overwritten by the next sync.

## Stack

- Next.js 16 (App Router) / React 19 / Tailwind CSS
- shadcn primitives from the `@dcyfr-labs` registry (`registry.dcyfr.ai`); registry chrome v2 (`@dcyfr-labs/dcyfr-chrome-v2`) in `components/chrome/`, with its hooks in `hooks/` and its utility classes in `app/dcyfr-chrome.css`
- Sentry instrumentation (client, server, and edge configs)
- Playwright for e2e and visual-regression snapshots ([`e2e/`](e2e/README.md))

## Development

```sh
npm install
npm run dev        # http://localhost:3302
```

> **Port collision:** dev port **3302** is also claimed by [dcyfr-io](https://github.com/dcyfr-labs/dcyfr-io) — you cannot run both dev servers simultaneously without overriding one (`npm run dev -- --port <other>`).

| Command | What it does |
|---|---|
| `npm run dev` / `npm run start` | Dev / production server on port **3302** |
| `npm run build` | Production build |
| `npm run lint` / `npm run typecheck` | ESLint / `tsc --noEmit` |
| `npm run export:content` | Re-run the Nexus content export locally |
| `npm run test:e2e` (`:ui`) | Playwright e2e suite |
| `npm run test:snapshots` (`:update`) | Visual-regression snapshots (chromium) |

## Routes

- `/` — research hub landing page
- `/articles`, `/articles/[slug]` — article index and detail pages
- `/whitepapers` — whitepaper library
- `/search` — full-text search
- `/rss.xml` — RSS feed

## Environment variables

No runtime secrets. `SENTRY_ORG` / `SENTRY_PROJECT` are used at build time for Sentry source-map upload. The content-export auth in CI is handled by GitHub App tokens configured in `export-nexus.yml`, not local env vars.

## Design-token & scaffold contract

This site follows the `dcyfr-site-scaffold` contract: colors, spacing, radii, and typography resolve via CSS variables — no hardcoded design tokens. Local ESLint rules in `eslint-local-rules/` enforce this and the `design-tokens.yml` workflow gates every PR. From the workspace root, `npm run audit:sites` checks scaffold compliance across the site family.

## CI

- `ci.yml` — lint, typecheck, build
- `export-nexus.yml` — automated content sync from Nexus (PRs scoped to `data/articles.json`)
- `codeql.yml` / `semgrep.yml` — static security analysis
- `design-tokens.yml` — design-token + scaffold gate
- `visual-regression.yml` — Playwright snapshots
- `dependabot-auto-merge.yml` — dependency hygiene

## Deployment

Deployed on Vercel from `main`, with hardened security headers via `vercel.json`.

## Further docs

- [`AGENTS.md`](AGENTS.md) — agent conventions and project structure
- [`e2e/README.md`](e2e/README.md) — test suite notes

The chrome components are registry-owned and carry no site-local README: read
them at `@dcyfr-labs/dcyfr-chrome-v2` in `dcyfr-labs/dcyfr-labs-registry`, and
re-run the add command to take an update rather than editing them here.
