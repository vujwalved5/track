# Scope: Performance Audit & Optimisation Plan

## Architecture & System Overview
- Memorable Moments: Next.js App Router digital journal
- Desktop: 2-page spread (>=768px), Mobile: 1 page
- Supabase: Auth + Postgres + RLS
- Strict constraints: L1 to L14; zero packages outside L3 (zod, zustand, @dnd-kit/core, serwist)
- Output target: Single file `OPTIMISATION_PLAN.md` at project root with 5 mandatory sections.

## Feature Inventory & Investigation Topics
| # | Category | Topic | Owner | Status |
|---|----------|-------|-------|--------|
| 1 | R1 Tracing | Production build (`npm run build`, `npm start`), route bundle sizes, page turn trace (/book/2026/11) | Explorer 1 | DONE |
| 2 | R1 Tracing | Widget placement trace (/book/2026/12), drag & resize Arrange mode trace | Explorer 1 | DONE |
| 3 | R2 Data | Waterfalls, missing prefetching, missing optimistic updates, un-debounced saves | Explorer 2 | DONE |
| 4 | R2 Data | Supabase project region distance, missing DB indexes (month_id, widget_id, book_id) | Explorer 2 | DONE |
| 5 | R2 Rendering | Full-spread re-renders, Zustand selectors, SVG charts recomputing, heavy client components | Explorer 2 | DONE |
| 6 | R2 Animation | CSS properties modified (width/height/top/left vs transform/opacity), expensive effects, font loading | Explorer 3 | DONE |
| 7 | R2 Arrange | @dnd-kit state updates per pointer move, snapping/overlap calculations, repeated DOM measurements | Explorer 3 | DONE |
| 8 | R2 Other | Service worker/cache settings, repeated inlined SVGs/images, console warnings/hydration errors | Explorer 3 | DONE |
| 9 | R3 Plan | Synthesize all findings into OPTIMISATION_PLAN.md (5 sections) | Worker | DONE |
| 10 | R4 Audit | Verify read-only integrity, clean December 2026 test widgets, untouched November data | Auditor | DONE |
