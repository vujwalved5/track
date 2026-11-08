# BRIEFING — 2026-11-08T15:40:00Z

## Mission
Implement infrastructure optimizations (Fix 2 SW timeouts & static cache, Fix 10 SW minification, Fix 8 Cormorant Garamond font scoping & Kalam fallback metric adjustment, Fix 7 CSS will-change optimizations) on branch `optimise`.

## 🔒 My Identity
- Archetype: Agent B (Infra Specialist)
- Roles: implementer, qa, specialist
- Working directory: c:\Users\aruko\OneDrive\Desktop\Documents\track\.agents\teamwork\agent_b\
- Original parent: d182f0bb-01fa-45ed-9815-336f98e5e38b
- Milestone: Performance & Infra Optimisation

## 🔒 Key Constraints
- Strict file ownership: app/sw.ts, scripts/build-sw.js, app/layout.tsx, ClosedBook.tsx / cover route, app/globals.css, PLAN_B.md, .agents/teamwork/agent_b/*
- Work on branch `optimise`
- Follow GEMINI.md locked decisions (L1 to L14)
- No UI kits, custom CSS 3D, Kalam + Cormorant Garamond palette locked
- Genuine implementation only, no cheating or facades
- Produce one clean git commit for this task

## Current Parent
- Conversation ID: d182f0bb-01fa-45ed-9815-336f98e5e38b
- Updated: not yet

## Task Summary
- **What to build**:
  1. Service Worker: /book/* network timeout to 5s, /_next/static/* strategy to CacheFirst, minimize: true in serwist/build-sw configuration, retain offline fallback.
  2. Fonts: load Cormorant Garamond ONLY on cover route (with active weights: 400, 500, 600, 700), remove global Cormorant Garamond from app/layout.tsx, configure Kalam fallback metric adjustment in next/font.
  3. CSS: add `will-change: transform` to `.animate-page-flip-*`, add `will-change: opacity` to leaf and base shadow overlay classes only.
- **Success criteria**: public/sw.js builds cleanly at ~36.4 KB (down from 149.5 KB), zero errors in Agent B files, changes committed on branch `optimise`.
- **Interface contracts**: GEMINI.md, OPTIMISATION_PLAN.md, ORIGINAL_REQUEST.md
- **Code layout**: Next.js App Router

## Key Decisions Made
- Used Next.js internal compiled terser (`next/dist/compiled/terser`) in `scripts/build-sw.js` with `minimize: true`, avoiding any external dependencies (L3) while reducing `sw.js` size from 149,451 bytes to 36,442 bytes.
- Scoped `Cormorant_Garamond` strictly to `ClosedBook.tsx` using `--font-cormorant` CSS variable and trimmed weights to only the 4 actively used (`400`, `500`, `600`, `700`), dropping unused weight 300.
- Configured Kalam with `adjustFontFallback: true` and `fallback: ['cursive']` in `app/layout.tsx`.
- Added `will-change: transform` to `.animate-page-flip-forward` and `.animate-page-flip-backward`, and `will-change: opacity` to leaf and base shadow classes without touching casing or ribbon.

## Artifact Index
- PLAN_B.md — Plan for Agent B
- .agents/teamwork/agent_b/handoff.md — Handoff report
- .agents/teamwork/agent_b/progress.md — Progress tracker

## Change Tracker
- **Files modified**:
  - `app/sw.ts`: Raised `/book/*` timeout to 5s, switched `/_next/static/*` to `CacheFirst`.
  - `scripts/build-sw.js`: Added TerserPlugin with `minimize: true`.
  - `app/layout.tsx`: Removed global `Cormorant_Garamond`, added fallback metric adjustment for `Kalam`.
  - `components/book/ClosedBook.tsx`: Added cover-only `Cormorant_Garamond` with active weights (`400`, `500`, `600`, `700`).
  - `app/globals.css`: Added `will-change: transform` and `will-change: opacity` to page flips and shadows.
  - `public/sw.js`: Rebuilt minified service worker (36,442 bytes).
- **Build status**: `node scripts/build-sw.js` passes with exit code 0; `npx tsc --noEmit` reports 0 errors in Agent B files.
- **Pending issues**: None for Agent B.

## Quality Status
- **Build/test result**: Pass (SW 36,442 bytes, 0 TS errors in owned files)
- **Lint status**: Clean
- **Tests added/modified**: Verified through `node scripts/build-sw.js` and `tsc --noEmit`

## Loaded Skills
- None
