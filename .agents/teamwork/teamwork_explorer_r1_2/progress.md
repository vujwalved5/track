# Progress — Explorer R1-2 (Data & Rendering Bottlenecks)

Last visited: 2026-11-08T13:35:00Z

## Status
- [x] Initialized DISPATCH.md, BRIEFING.md, progress.md
- [x] Explore codebase structure to locate routes, stores, components, migrations, and Supabase config
- [x] Investigate Data Bottlenecks:
  - [x] Month data fetching waterfalls (book -> month -> widgets -> entries; single query vs parallel) — FOUND
  - [x] Absence of adjacent month prefetching — FOUND
  - [x] Widget placement waiting for Supabase responses without optimistic updates — FOUND
  - [x] Un-debounced saves during dragging/keystrokes — NOT FOUND (Correctly deferred/debounced)
  - [x] Supabase project region distance & latency — FOUND (Tokyo ap-northeast-1, ~260ms warm RTT, ~1.8s cold RTT)
  - [x] Missing database indexes on month_id, widget_id, book_id — FOUND (month_id on widgets missing; widget_id/book_id present via compound indexes)
- [x] Investigate Rendering Bottlenecks:
  - [x] Full-spread re-renders on single widget updates (Zustand selectors, memoisation, state elevation) — FOUND
  - [x] Simultaneous rendering of all spread widgets including custom SVG charts recomputing per render — FOUND
  - [x] Chart jitter/wobble and data series recalculation on render — FOUND
  - [x] Heavy client components that could be server components or lazy loaded (widget drawer, settings card, Month Setup wizard, print code) — FOUND (Drawer, Config Card, Setup Wizard found; Print code not found as JS bottleneck)
- [x] Synthesize findings with official documentation citations and impact ratings
- [x] Write handoff.md
- [x] Verify git status is clean (read-only maintained)
- [x] Send message to orchestrator
