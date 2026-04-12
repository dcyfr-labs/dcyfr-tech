# AGENTS.md - dcyfr-tech

## Project Overview

`dcyfr.tech` is a Next.js 15 / React 19 research and technical publishing hub for the DCYFR ecosystem.

## Architecture

- App Router pages: `app/`
- Shared UI: `components/`
- Shared logic: `lib/`
- Content/export tooling: `scripts/`
- Static/content data: `data/`

## Commands

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run export:content
npm run test:e2e
```

## Working Rules

- Preserve publishing flows and any content-export assumptions when touching scripts or content structures.
- Keep editorial/content changes separate from infrastructure refactors when possible.
