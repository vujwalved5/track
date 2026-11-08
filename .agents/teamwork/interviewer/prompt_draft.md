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
