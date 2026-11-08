# Scope: Full Optimisation of Memorable Moments

## Architecture & System Overview
- Product: "Memorable Moments" book-like digital journal
- Strict adherence to Locked Decisions L1 to L14 (GEMINI.md)
- Work on branch: `optimise`
- Phased execution:
  - Phase 1 (Parallel): Agent A (Data: Fix 1 & Fix 4) + Agent B (Infra: Fix 2, 10, 8, 7 CSS)
  - Phase 2: Agent C (Widgets & Store: Overheads, Memo, Geometry) — after Agent A
  - Phase 3: Agent D (OpenBook Owner: Fix 3, Dynamic Imports, Prefetching) — after Agent A & C
  - Phase 4: Agent E (Verifier: Independent Audit, Checklist & PROJECT_STATE.md update)

## Feature & Task Inventory
| Phase | Agent | Role | Fixes / Tasks | Files Owned | Status |
|---|---|---|---|---|---|
| 1 | Agent A | teamwork_worker | Fix 1 (waterfall elimination, relational query, initialEntries) & Fix 4 (widgets_month_id index) | `app/book/[year]/[month]/page.tsx`, `components/setup/setupActions.ts`, widgets fetching on mount, `entryHelpers.ts`, `supabase/migrations/0002_add_widgets_month_id_index.sql` | PENDING |
| 1 | Agent B | teamwork_worker | Fix 2 (SW 5s timeout, CacheFirst static, minimize: true), Fix 10 (single book tree), Fix 8 (Cormorant on cover only, Kalam fallback metrics), Fix 7 CSS (will-change transform/opacity) | `app/sw.ts`, `scripts/build-sw.js`, `app/layout.tsx`, `ClosedBook.tsx` (cover), `app/globals.css` | PENDING |
| 2 | Agent C | teamwork_worker | Fix 5 (PlacementOverlay rect caching), Fix 6 (discrete 22px resize), Fix 9 (WidgetWrapper React.memo, translate3d), Fix 11 (Scatter/Bar useMemo wobble), Fix 12 (entriesVersion partition) | `components/book/WidgetWrapper.tsx`, `components/book/PlacementOverlay.tsx`, `components/widgets/ScatterPlotWidget.tsx`, `components/widgets/BarChartWidget.tsx`, `store/entriesVersion.ts`, `lib/offlineSync.ts` | PENDING |
| 3 | Agent D | teamwork_worker | Fix 3 (optimistic widget place + rollback red pen), dynamic imports (MonthSetupWizard, WidgetDrawer, WidgetConfigCard), prefetching, transform-gpu on turning leaf, single tree mount placeholder, useCallback stability, initialEntries wiring | `components/book/OpenBook.tsx`, `components/book/MobileBook.tsx`, `createWidget` action | PENDING |
| 4 | Agent E | teamwork_worker | Independent Audit against L1-L14 & OPTIMISATION_PLAN §4, manual test checklist, before/after numbers, update PROJECT_STATE.md | None (read-only audit + update `PROJECT_STATE.md`) | PENDING |

## Interface Contracts & Handoffs
- **Agent A -> Agent D**: Agent A must write `HANDOFF.md` at project root with exact `initialEntries` type and prop signature passed to `OpenBook` / `MobileBook` / widgets.
- **Agent C -> Agent D**: `WidgetWrapper` memoization requires stable callback props from `OpenBook` (`useCallback`).
- **All Agents**: Strict file ownership isolation. No agent touches another's owned files. Each agent writes `PLAN_<agent>.md` then builds immediately. One git commit per task.
