# AGENTS.md - dcyfr-tech

## What this is

Research and technical publishing hub: articles, whitepapers, client-side search and an RSS feed. Production URL is https://dcyfr.tech (package name `dcyfr-tech-blog`, dev port 3307). It is one of seven sibling sites built from the `dcyfr-site-scaffold` contract, so layout, tooling and CI match the other `dcyfr-*` site repos. Article content is machine-synced from the Nexus knowledge system, so publishing happens upstream.

## Stack

- Next.js `^16.4.3` (App Router) with React `^19.0.0`, TypeScript `^5`
- Tailwind CSS `^4.3.3` through `@tailwindcss/postcss`; there is no Tailwind config file
- shadcn (`new-york` style) with the `@dcyfr-labs` registry (`https://registry.dcyfr.ai/r/{name}.json`, see `components.json`)
- `@sentry/nextjs` `^10`, `@vercel/analytics`, `@vercel/speed-insights`, `next-themes`
- Playwright `^1.58.2`; ESLint `^9` flat config (`eslint.config.mjs`)

## Directory map

- `app/` : `/`, `/articles`, `/articles/[slug]`, `/whitepapers`, `/search`, `/rss.xml`, `/privacy`; `robots.ts`, `sitemap.ts`, `indexnow.txt`, `.well-known/security.txt`, icons, OG image, theme CSS files
- `components/` : `ArticleCard`, `MarkdownRenderer`
- `components/chrome/` : shared nav, footer, theme provider and toggle (registry-owned)
- `components/ui/` : `button`, `sheet`, `dcyfr-alert`, `dcyfr-badge`, `dcyfr-button`, `dcyfr-card`, `dcyfr-input`, `dcyfr-separator`, `dcyfr-skeleton`
- `data/articles.json` : synced content, overwritten by the export (do not hand-edit)
- `data/whitepapers.json` : read by `/whitepapers`; an empty array at the time of writing, and the export script does not write it
- `scripts/export-nexus-content.mjs` : the content export; `scripts/check-theme-wiring.mjs` : theme wiring check
- `hooks/` : `use-dropdown`, `use-media-query`; `lib/` : `types.ts`, `utils.ts`
- `e2e/` : Playwright specs (`contrast`, `snapshots`) and their README
- `eslint-local-rules/` : the five local ESLint rules
- `proxy.ts` : apex to `www` redirect (Next 16 middleware)

## Content pipeline

- `.github/workflows/export-nexus.yml` runs every Monday at 06:00 UTC and opens a PR scoped to `data/articles.json`. On failure it opens a single deduplicated tracking issue.
- `npm run export:content` runs `scripts/export-nexus-content.mjs` locally. It accepts `--nexus-root <path>` and `--dry-run`. It reads the `polaris`, `patterns` and `context` directories.
- TLP policy in the script: `RED` and `AMBER` are skipped, `GREEN` is exported only with `publish: true` frontmatter, `WHITE` is exported automatically.

## Scripts

- `dev` and `start` run `next dev --port 3307` and `next start --port 3307`. `build` runs `next build`, `lint` runs `eslint .`, `typecheck` runs `tsc --noEmit`.
- `export:content` runs `node scripts/export-nexus-content.mjs`.
- `test:e2e` runs every Playwright spec in `e2e/`; `test:e2e:ui` opens Playwright UI mode.
- `test:contrast` and `test:snapshots` run one spec each (`e2e/contrast.spec.ts`, `e2e/snapshots.spec.ts`) on chromium. `test:snapshots:update` and `test:snapshots:rebaseline` add `--update-snapshots` and `--update-snapshots=all`.
- `check:theme-wiring` runs `node scripts/check-theme-wiring.mjs`.

## Environment variables

There is no `.env.example`. These are the names the code reads; all are optional locally.

- `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN` (falls back to `NEXT_PUBLIC_SENTRY_DSN`)
- `SENTRY_ORG`, `SENTRY_PROJECT` (build-time source maps; default to `dcyfr-labs` and `dcyfr-tech`)
- `INDEXNOW_KEY` : served at `/indexnow.txt`; the route returns 404 when it is unset
- `VERCEL_ENV`, `NEXT_PUBLIC_VERCEL_ENV`, `NEXT_RUNTIME`, `CI` : set by the platform or CI
- `BASE_URL`, `VERCEL_AUTOMATION_BYPASS_SECRET` : Playwright only

## Testing

- Playwright has no `webServer` block. `playwright.config.ts` reads `BASE_URL` and falls back to the production site, so start the app yourself and set `BASE_URL=http://localhost:3307` to test local changes.
- There is no smoke spec. `contrast.spec.ts` covers `/`, `/articles` and one article page. `snapshots.spec.ts` covers `/` and `/articles` with a 5% `maxDiffPixelRatio`.
- Mobile snapshot baselines must be generated on x86 CI. Use the `visual-regression.yml` dispatch with `update_baselines` instead of a local run.
- There is no unit-test runner.

## CI

- `ci.yml`: `typecheck`, `lint` and `build` matrix on Node 20.
- `design-tokens.yml`: palette and primitive-color guards, identity-clobber and theme-wiring checks.
- `visual-regression.yml`: runs on Vercel preview `deployment_status` or dispatch (`base_url`, `update_baselines`); contrast spec, then snapshots (Node 22).
- `export-nexus.yml`: the weekly content sync described above.
- `codeql.yml`, `semgrep.yml`: weekly (Monday 09:00 UTC), PRs and pushes to `main`; Semgrep needs `SEMGREP_APP_TOKEN`. The Dependabot auto-merge workflows handle dependency PRs.

The GitHub API reports no ruleset and no branch protection for this repo, so GitHub requires no checks here. The sibling repos require `lint`, `typecheck` and `build`.

## Design system rules

- Colors, spacing, radii and type come from CSS variables and the vendored `app/dcyfr-theme-*.css` and `app/dcyfr-chrome.css` files. `app/layout.tsx` sets `data-identity="slate"` on `<html>`, and `npm run check:theme-wiring` verifies that wiring.
- ESLint errors: `no-hardcoded-colors`, `no-deprecated-design-tokens`, `no-legacy-dcyfr-palette`. `no-hardcoded-spacing` and `no-hardcoded-typography` are `off` in `eslint.config.mjs`.
- Add primitives with the shadcn CLI and the `@dcyfr-labs` registry instead of writing parallel copies.

## Conventions and gotchas

- `components/chrome/` is owned by the registry bundle. Update it by re-running the registry add command instead of editing the files.
- `proxy.ts` redirects `dcyfr.tech` to `www.dcyfr.tech` with a 308 and security headers. It stays inert while the Vercel project-level apex redirect exists. `metadataBase` is the apex URL.
- `app/sitemap.ts` emits `/whitepapers/<slug>` URLs for every entry in `data/whitepapers.json`, but there is no `app/whitepapers/[slug]` route. Adding whitepaper data without adding that route produces sitemap links that return 404.
- `/search` filters `data/articles.json` in the browser over title, description, category, tags and content.
- Keep editorial content changes separate from infrastructure changes, and preserve the export assumptions when touching `scripts/` or the article shape in `lib/types.ts`.
