# Original User Request

## Initial Request — 2026-11-08T15:07:05Z

You are the LEAD ORCHESTRATOR. Run the whole optimisation of Memorable Moments in one go using multiple parallel agents, with maximum speed and minimal approval stops, strictly adhering to GEMINI.md (locked decisions L1 to L14), PROJECT_STATE.md, and OPTIMISATION_PLAN.md with specified corrections.

Working directory: c:\Users\aruko\OneDrive\Desktop\Documents\track
Integrity mode: demo
The team must NOT: copy code from existing open-source projects for core logic; use pre-built libraries or frameworks for core functionality.

## Verification Resources
- Build verification: `npm run build` executed after each phase.
- Manual test checklist: Test procedures detailed in Section 5 of `OPTIMISATION_PLAN.md`.
- Verifier audit: Codebase and rule compliance audit performed by Agent E against L1 to L14 and Section 4 of `OPTIMISATION_PLAN.md`.

## Requirements

### R1. Orchestration, Global Constraints, and Phased Execution
- Work on branch `optimise`. Produce one git commit per task upon completion.
- No visual change anywhere. Palette (L6), fonts (L5), 22px grid (L7, L10), 600ms page turn (L12), and layouts stay identical.
- No new packages (only zod, zustand, @dnd-kit/core, serwist). No renamed files, no new features, no schema or RLS changes.
- The Month Setup wizard has 7 steps (section 4 of the plan stating 4 steps is incorrect); do not alter the wizard flow.
- If anything conflicts with L1 to L14 or plan line numbers no longer match code, that agent stops and asks one question; otherwise, do not stop for GO approvals. Write each agent's plan to `PLAN_<agent>.md`, then build immediately.
- Place unrequested ideas under "Ideas (not built)".
- File ownership is strictly partitioned (no agent edits another agent's files).
- Phasing: Phase 1 (parallel: Agent A and Agent B) -> Phase 2 (Agent C, after A finishes) -> Phase 3 (Agent D, after A and C finish) -> Phase 4 (Agent E, verifier). After each phase, execute `npm run build` and resolve any errors before proceeding.

### R2. Agent A (Data) - Fix 1 and Fix 4
- File ownership: `app/book/[year]/[month]/page.tsx`, `components/setup/setupActions.ts`, widgets that fetch entries on mount, `entryHelpers.ts`, `supabase/migrations/0002_add_widgets_month_id_index.sql`.
- Call `getUser()` once and redirect to `/` if there is no authenticated user. Run previous-month and current-month fetches in `Promise.all` using `user.id`.
- Use ONE nested relational query for books, months, and widgets (no `!inner`). An unset month defaults to `setup_done=false`, dotted/dotted paper, and no widgets, ensuring the 7-step wizard launches.
- Sort widgets by `created_at` ascending. Fetch all entries in ONE `.in('widget_id', widgetIds)` query and pass down as `initialEntries`. Widgets use initial data and no longer fetch on mount, while continuing to update after edits.
- Create database index migration `0002_add_widgets_month_id_index.sql` for `idx_widgets_month_id`.
- Hand exact `initialEntries` prop plumbing signature to Agent D via `HANDOFF.md` before Agent D starts.

### R3. Agent B (Infra) - Fix 2 (Service Worker), Fix 10, Fix 8 (Fonts), Fix 7 (CSS part)
- File ownership: `app/sw.ts`, `scripts/build-sw.js`, `app/layout.tsx`, `ClosedBook.tsx` (or route rendering the cover), `app/globals.css`.
- Service worker: Raise `/book/*` network timeout to 5s, switch `/_next/static/*` to `CacheFirst`, and set `minimize: true`. Retain the offline fallback (the timeout bump is a stopgap).
- Fonts: Load Cormorant Garamond only on the cover route with only the weights actively used. Configure Kalam fallback metric adjustment through `next/font`.
- CSS & Performance: Add `will-change: transform` to `.animate-page-flip-*` and `will-change: opacity` to the leaf and base shadow overlay classes only (not the casing or ribbon).

### R4. Agent C (Widgets and Store) - Overheads, Memo, and Geometry
- File ownership: `WidgetWrapper.tsx`, `PlacementOverlay.tsx`, `ScatterPlotWidget.tsx`, `BarChartWidget.tsx`, `store/entriesVersion.ts`, `lib/offlineSync.ts`.
- Runs AFTER Agent A completes.
- Cache bounding rect on pointer enter or down in `PlacementOverlay` and stop invoking `getBoundingClientRect()` in `pointer-move`.
- Resize previews in discrete 22px steps only, with no CSS scale transforms.
- Wrap `WidgetWrapper` in `React.memo`, comparing `id`, `x`, `y`, `w`, `h`, arrange flag, and `config`. Remove `@dnd-kit/utilities` import and use inline `translate3d` style.
- Move Scatter and Bar chart wobble and geometry into `useMemo`, ensuring deterministic jitter and identical drawings.
- Partition entries version counter by widget ID and subscribe each consumer only to its own sources.

### R5. Agent D (OpenBook Owner) - Fix 3, Dynamic Imports, and Prefetching
- File ownership: `OpenBook.tsx`, `MobileBook.tsx`, and `createWidget` action (wherever it lives). The ONLY agent permitted to edit `OpenBook.tsx` and `MobileBook.tsx`.
- Runs AFTER Agent A and Agent C complete.
- Prefetch previous and next month routes in an effect, and prefetch on month-tab pointer-down and hover. Keep 600ms animation and `router.push` timing unchanged.
- `handlePlaceWidget`: generate `crypto.randomUUID()`, insert into state optimistically after client-side overlap and bounds check (server check remains safety net), close overlay and drawer, enter Arrange mode, then call `createWidget` in background with the same id (`createWidget` accepts optional id). On server/placement failure, roll back and display a handwritten red-pen message on the page (never a popup or banner per L1).
- Replace static imports of `MonthSetupWizard`, `WidgetDrawer`, and `WidgetConfigCard` with `next/dynamic` and `{ ssr: false }`, with no layout jump.
- Add `transform-gpu` to turning leaf container only (not casing or ribbon).
- Keep exactly ONE tree mounted. Style the `isDesktop === null` placeholder with `#211b16`, full viewport size, and `contain: paint layout`.
- Keep callbacks stable with `useCallback` so Agent C's memo works. Wire up `initialEntries` from Agent A's `HANDOFF.md`.

### R6. Agent E (Verifier) - Independent Audit and Final Reporting
- Changes no code. Audits entire project against L1 to L14 and Section 4 of `OPTIMISATION_PLAN.md` (colours outside L6, fonts outside L5, emoji, new packages, scrollbars inside pages).
- Walks through Section 5 manual checklist in code and specifies manual test instructions.
- Produces final orchestrator output table for Fixes 1 to 12 (status, evidence with file and line), before/after numbers (server time, main chunk size, sw.js size), manual test checklist, and updates `PROJECT_STATE.md`.

## Acceptance Criteria

### Performance and Code Verification
- [ ] `/book/2026/11` renders all widgets and entries on initial render with zero secondary entry requests on mount.
- [ ] `/book/2026/12` (unset month) reliably opens the 7-step Month Setup wizard.
- [ ] Widget stacking order is strictly preserved.
- [ ] `pg_indexes` contains `idx_widgets_month_id`.
- [ ] Network tab confirms prefetch for adjacent months; forward page turns execute without stalling.
- [ ] `public/sw.js` is significantly smaller than 149 KB, and current month opens offline.
- [ ] Placed widgets render on the next frame, are immediately draggable, roll back with an on-page handwritten red-pen message on forced failure, and persist across page refresh.
- [ ] Main bundle chunk size is well below 520 KB, with distinct async chunks for the wizard, widget drawer, and config card.
- [ ] Page turns remain visually identical, show zero paint events during transform, and reduced-motion retains fast fade.
- [ ] `/book/2026/11` issues zero Cormorant Garamond font requests; cover at `/` remains visually identical; exactly one book tree mounts at 1440px and 390px viewports with zero hydration warnings or Kalam text jump.
- [ ] Modifying a Number Log entry re-renders only that widget and subscribing charts; dragging a chart does not re-render other widgets; chart visuals remain identical.
- [ ] `@dnd-kit/utilities` import is removed; zero packages added outside L3 allowed list (`zod`, `zustand`, `@dnd-kit/core`, `serwist`).
- [ ] `npm run build` succeeds cleanly after each phase.
- [ ] Final orchestration report includes Fix 1-12 table, before/after metrics, manual test checklist, and updated `PROJECT_STATE.md`.
