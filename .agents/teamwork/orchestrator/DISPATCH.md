## 2026-11-08T13:18:23Z
Conduct a read-only performance audit and create an optimisation plan for page turns, month changes, widget placement, and arrange mode in the "Memorable Moments" digital journal app, strictly adhering to rules L1 to L14 with no code modifications.

Working directory: c:\Users\aruko\OneDrive\Desktop\Documents\track
Integrity mode: demo
The team must NOT: estimate or guess performance numbers without tracing the actual code path and bundle measurements; reference external performance advice without citing the specific official documentation page.

## Verification Resources
- Test account: `newuser@gmail.com` (password: `new123`).
- Target environments: Seeded November data on `/book/2026/11`; empty month December 2026 (`/book/2026/12`) for widget placement tests.
- Live Supabase backend is reachable: measure against the production build (`npm run build`, then `npm start`).

## Requirements

### R1. Production Performance Measurement and Execution Tracing
Run the application in production mode (`npm run build`, then `npm start`) rather than development mode, noting the difference. Measure live against the reachable Supabase backend using the test account `newuser@gmail.com` on `/book/2026/11` for page turns and `/book/2026/12` for widget placement (clean up test widgets afterwards; do not modify seeded November data). Trace the full execution path in code for three key actions: (a) turning a page or clicking a month tab, (b) placing a widget from the drawer, and (c) dragging and resizing in Arrange mode. For each action, determine what code runs, what data is fetched from Supabase, what re-renders, and what the browser paints. Report concrete numbers where measurable (network round trips, Supabase queries per turn, re-render counts, bundle size per route, long tasks); mark any number that cannot be traced or measured explicitly as "unmeasured" rather than guessing.

### R2. Systematic Investigation of Potential Bottlenecks
Investigate and report each specified potential cause with file and line references, marking each as "found" or "not found":
- Data: Month data fetching waterfalls (book -> month -> widgets -> entries; single query vs parallel), absence of adjacent month prefetching, widget placement waiting for Supabase responses without optimistic updates, un-debounced saves during dragging/keystrokes, Supabase project region distance, and missing database indexes on `month_id`, `widget_id`, and `book_id`.
- Rendering: Full-spread re-renders on single widget updates (Zustand selectors, memoisation, state elevation), simultaneous rendering of all spread widgets including SVG charts recomputing per render, chart jitter/wobble and data series recalculation on render, and heavy client components that could be server components or lazy loaded (widget drawer, settings card, Month Setup wizard, print code).
- Animation and Paint: Page turn animations modifying layout-triggering properties (width, height, top, left) instead of transform and opacity, expensive effects during turns (box-shadows, filters, blur, CSS paper grain/dotted gradients repainting every frame, missing `will-change` or `transform-gpu`, excessive layering), and late-loading fonts (Kalam, Cormorant) causing layout shifts or blank text.
- Arrange Mode: `@dnd-kit` state updates on every pointer move across all widgets, repetitive snapping/overlap calculations over the entire widget list, and repeated DOM measurement.
- Other: Service worker or cache settings causing stale/slow loads, repeatedly inlined SVGs or large images, console warnings/hydration errors, and unnecessary dependencies.
Review official Next.js, React, and Supabase performance documentation for relevant recommendations and cite the specific official documentation page for any outside advice. Propose no recommendations requiring packages outside L3.

### R3. Optimisation Plan Document Generation
Synthesise all findings into a single file `OPTIMISATION_PLAN.md` (the only file you may create) in the project root containing exactly five sections:
1. Findings table: issue, location (`file:line`), measured impact (high / medium / low, with numbers where known), and evidence.
2. Fix list in priority order: for each fix, detail what changes, affected files, expected gain, risk of visual change, and test method.
3. Grouped tasks: group fixes into small tasks of 1 to 3 related fixes each, structured as individual task prompts ordered so the highest-impact wins for page turns and widget placement come first.
4. "Must not change" list: explicit confirmation that appearance, layout, colours, fonts, and behaviour remain strictly compliant with L1 to L14.
5. Before/after manual test checklist: specific test steps to run manually (turn 10 pages, click 5 month tabs, place 3 widgets, drag one widget) at both 1440x900 and 390x844 viewports.

### R4. Constraints and Non-Modification Boundaries
The task is strictly read-only: the only file you may create is `OPTIMISATION_PLAN.md`. Do not edit any existing application files, install any packages, alter the database schema or seeded November data, add features, redesign components, or implement code fixes. If testing widget placement on December 2026, remove any created test widgets afterwards so the database state remains clean. Place any unrequested ideas under an "Ideas (not built)" section.

## Acceptance Criteria

### Documentation and Completeness
- [ ] `OPTIMISATION_PLAN.md` is the only created file and contains all five required sections.
- [ ] Every investigated item from the likely causes list in R2 appears in the findings table with a verified `file:line` reference or an explicit "not found" status.
- [ ] Any metric or number that cannot be traced or measured is explicitly marked as "unmeasured".
- [ ] Every citation of outside performance advice references the specific official documentation URL/page.
- [ ] Grouped fix tasks contain 1 to 3 related fixes each, formatted as standalone task prompts ordered by highest impact first.
- [ ] All recommended fixes strictly comply with rules L1 to L14 and require zero packages outside L3.

### Codebase and Database Integrity
- [ ] No application source files, styles, configurations, or dependencies are modified (`git status` confirms only `OPTIMISATION_PLAN.md` is untracked/added).
- [ ] No database schema changes are made, seeded November data is untouched, and any temporary test widgets from December 2026 testing are removed.
- [ ] The final deviation report states "None".


## 2026-11-08T15:08:32Z
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
