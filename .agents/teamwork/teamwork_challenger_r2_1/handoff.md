# Verification & Adversarial Challenge Report: `OPTIMISATION_PLAN.md` (Round 2)

**Evaluator**: `teamwork_challenger_r2_1` (Critic & Specialist)  
**Parent**: Orchestrator (`d7847ee1-8027-4cb5-b1ca-7aa7a2e95f75`)  
**Target File**: `c:\Users\aruko\OneDrive\Desktop\Documents\track\OPTIMISATION_PLAN.md`  
**Verdict**: **APPROVE**  
**Overall Risk Assessment**: **LOW**

---

## 1. Observation

Direct observations from source inspection, schema inspection, and live build execution:

### Observation 1.1: Factual Accuracy of Finding O4 & Fix 12 (`zustand` and `@dnd-kit/utilities`)
- `package.json:20` defines: `"zustand": "^5.0.2"`.
- Locked Decision L3 in `GEMINI.md:12` explicitly states: `Extra packages allowed ONLY: zod, zustand, @dnd-kit/core, serwist. No UI kit (no shadcn, MUI, Chakra).`
- `store/entriesVersion.ts:14` contains: `import { create } from 'zustand'`. Lines 11-12 of the same file cite: `- Strictly zustand (L3 — already approved package)`.
- `components/widgets/WidgetWrapper.tsx:20` contains: `import { CSS } from '@dnd-kit/utilities'`.
- `package.json:11-21` confirms that `@dnd-kit/utilities` is **not** an installed dependency; it is an undeclared transitive phantom dependency.
- In `OPTIMISATION_PLAN.md`:
  - Line 35 (Finding O4) explicitly identifies: "`zustand: "^5.0.2"` is actively imported in `store/entriesVersion.ts:14` and subscribed to across 8 files... While permitted by Rule L3, `useEntriesVersionStore` is an unpartitioned monolithic counter... In `WidgetWrapper.tsx:20`, `@dnd-kit/utilities` is imported as an undeclared transitive phantom dependency solely for `CSS.Translate.toString(transform)`."
  - Lines 371-389 (Fix 12) & Lines 453-454 (Task 7): explicitly state to retain `zustand` in `package.json`, and remove only `@dnd-kit/utilities` by inlining `translate3d(...)`.

### Observation 1.2: Citation Accuracy of Finding D2 (`MobileBook.tsx`)
- In `components/book/MobileBook.tsx:131-155`: `handleTurnBack` and `handleTurnNext` invoke `onTurnMonth(prevYear, prevMonth, 'backward', 'last')` and `onTurnMonth(nextYear, nextMonth, 'forward', 'first')` without prefetching.
- In `components/book/MobileBook.tsx:362-434`: contains the bottom back button (lines 362-369), dog-ear folded corner button (lines 377-399), and month index tabs (lines 404-434).
- In `OPTIMISATION_PLAN.md:17` and `119`: the citation for `MobileBook.tsx` is verbatim `components/book/MobileBook.tsx:131-155, 362-434`.

### Observation 1.3: Architecture & Edge Cases in Fix 1 & Task 1
- `app/book/[year]/[month]/page.tsx:47-53` establishes the authentication gate before data fetching.
- `app/book/[year]/[month]/page.tsx:87` sorts widgets ascending by `created_at`: `.order('created_at', { ascending: true })`.
- In `OPTIMISATION_PLAN.md:48-83` and Line 405 (Task 1):
  - Auth check is awaited first (`await supabase.auth.getUser()`, `if (!user) redirect('/')`).
  - Concurrent fetching via `Promise.all([ getPreviousMonthData(year, month, user.id), getCurrentMonthData(year, month, user.id) ])`.
  - A relational query without `months!inner` is specified; fallback defaults (`setup_done = false`, `paper_left = 'dotted'`, `paper_right = 'dotted'`, `setup_config = {}`, `initialWidgets = []`) cleanly handle un-setup months (e.g. `/book/2026/12`) without null book errors, launching the Month Setup Wizard per Rule L9.
  - Widget sorting ascending by `created_at` (`created_at ASC`) is explicitly mandated before left/right page partitioning to preserve stacking order and z-index.

### Observation 1.4: Optimistic Client UUID Insertion in Fix 3 & Task 3
- `supabase/migrations/0001_initial_schema.sql:92` defines `id uuid primary key default gen_random_uuid()`.
- In `OPTIMISATION_PLAN.md:135-184` and Line 421 (Task 3):
  - Client generates permanent UUID (`const widgetId = crypto.randomUUID()`) and appends to state synchronously (< 16 ms).
  - `createWidget(..., id?: string)` passes `id` directly into the Postgres insert statement.
  - Temporary client-side IDs (`temp-...`) and ID-swap race conditions (404 / PGRST116 on rapid post-placement drag/resize/delete) are completely eliminated.

### Observation 1.5: Avoidance of CSS `scale` Distortion in Fix 6 & Task 3
- In `OPTIMISATION_PLAN.md:254` and Line 422:
  - Explicit prohibition of CSS `scale` transforms, which stretch handwritten Kalam glyphs, distort SVG stroke widths (1.4px dots, wobbly axes, hatching lines), and desynchronize from the 22px grid (Rules L1, L4, L5, L7, L10).
  - Sizing is restricted to discrete 22px grid steps (`liveW`/`liveH`) or bounding box preview (`border-dashed border-ink/40`).

### Observation 1.6: Shadow Flicker Prevention in Fix 7 & Task 5
- In `OPTIMISATION_PLAN.md:274-275` and Line 437:
  - Explicit prohibition of dynamic toggling or disabling of shadows during page turns (avoiding visual popping at frame 0 and frame 600 ms).
  - Use of permanent GPU compositor layer promotion (`transform: translateZ(0)`, `transform-gpu`, and `will-change: transform`) on the casing container (`OpenBook.tsx:579`) and ribbon bookmark (`OpenBook.tsx:1065`), caching textures in dedicated GPU tiles.

### Observation 1.7: Preservation of Correction 7 Single-Tree Invariant in Fix 8 & Task 6
- `PROJECT_STATE.md:175` locks Correction 7: `OpenBook.tsx` renders exactly ONE tree determined by `matchMedia("(min-width: 768px)")`, rendering a neutral desk-coloured placeholder during initial hydration to prevent mismatch.
- In `OPTIMISATION_PLAN.md:291-295` and Line 444-446:
  - Explicit prohibition of duplicate simultaneous desktop and mobile HTML trees (`hidden md:flex` / `flex md:hidden`), avoiding duplicate `@dnd-kit` drag sensors, duplicate widget instances, duplicate audio elements, and React 19 hydration mismatches.
  - Optimization of the initial desk placeholder `<div>` with inline `#211b16` styling, viewport bounds, and CSS containment (`contain: paint layout`) for instantaneous (< 16 ms) first paint.

### Observation 1.8: Scope Realism in Section 5 (Manual Test Checklist)
- `PROJECT_STATE.md:368` states: `Task 11 (Batch B) — Mobile Arrange mode (long-press on top ribbon, move up/down), WidgetDrawer placement on mobile, ClosedBook at 390px, MonthSetupWizard at 390px...`
- In `OPTIMISATION_PLAN.md:514, 524-525, 528, 538-539`:
  - Test Step 3 (Widget Placement) and Test Step 4 (Arrange Mode Dragging/Resizing) explicitly scope interactive placement and dragging/resizing to **Desktop (1440×900) Only**.
  - Mobile (390×844) is explicitly designated for responsive read-only sequential page flow and boundary verification.

### Observation 1.9: Production Build Execution
- Command: `npm run build`
- Exit Code: `0`
- Verbatim Output:
  ```
  > memorable-moments@0.1.0 build
  > node scripts/build-sw.js && next build

  sw.js built successfully! File size: 149451 bytes
  ▲ Next.js 16.4.5 (Turbopack)
  - Environments: .env.local
  ✓ Running next.config.js took 33ms

    Creating an optimized production build ...
  ✓ Compiled successfully in 468ms
    Running TypeScript ...
    Finished TypeScript in 2.2s ...
    Collecting page data using 7 workers ...
    Generating static pages using 7 workers (0/5) ...
    Generating static pages using 7 workers (1/5) 
    Generating static pages using 7 workers (2/5) 
    Generating static pages using 7 workers (3/5) 
  ✓ Generating static pages using 7 workers (5/5) in 1122ms
    Finalizing page optimization ...

  Route (app)
  ┌ ○ /
  ├ ○ /_not-found
  ├ ƒ /book/[year]/[month]
  ├ ○ /dev/paper
  └ ○ /manifest.webmanifest
  ```
- Untracked files verified via `git status`: only `OPTIMISATION_PLAN.md` and `.agents/`. Zero application files modified.

---

## 2. Logic Chain

1. **Factual Accuracy**:
   - `zustand` is installed in `package.json`, permitted by Rule L3, and actively consumed in `store/entriesVersion.ts:14`. Conversely, `@dnd-kit/utilities` is imported in `WidgetWrapper.tsx:20` but absent from `package.json`. Therefore, retaining `zustand` and eliminating only `@dnd-kit/utilities` in Finding O4 and Fix 12 is factually and architecturally exact.
   - `MobileBook.tsx` lines 131-155 implement `handleTurnBack`/`handleTurnNext` and lines 362-434 implement the navigation buttons/tabs. Neither calls `router.prefetch`. Therefore, the citations `MobileBook.tsx:131-155, 362-434` in Finding D2 and Fix 2 are exact.

2. **Server Architecture & Rule L9 Compliance**:
   - Awaiting `auth.getUser()` before launching queries prevents unauthenticated database queries and complies with RLS rules.
   - In Supabase PostgREST, a join with `!inner` on `months` would omit the book row entirely if no row exists in `months` for the given month. For un-setup months (such as `/book/2026/12`), this would return `book: null`. By avoiding `!inner` and providing fallback defaults (`setup_done = false`, `widgets = []`), the page cleanly renders and launches `MonthSetupWizard`, satisfying Locked Decision L9.
   - Sorting widgets by `created_at ASC` matches existing query behavior (`app/book/[year]/[month]/page.tsx:87`), guaranteeing that DOM stacking order and z-index are invariant across refactors.

3. **Concurrency & Optimistic ID Invariants**:
   - In Postgres, `default gen_random_uuid()` only applies when an explicit `id` is not supplied. Passing `crypto.randomUUID()` from the client sets the permanent primary key at insertion time.
   - Because the client and server share the permanent UUID from timestamp 0, subsequent drag (`handleDragEnd`), resize (`handleResizeEnd`), and delete actions can immediately fire without waiting for the server insertion to return, completely preventing 404/PGRST116 race conditions.

4. **Visual & Aesthetic Compliance (Rules L1, L4, L5, L7, L10, L12)**:
   - Resizing via discrete 22px steps avoids CSS `scale`, ensuring Kalam font metrics and SVG stroke widths (1.4px dots, wobbly lines) never warp or blur.
   - Permanent GPU promotion avoids visual shadow popping/flicker, preserving the tactile paper aesthetic.
   - Preserving Correction 7 avoids mounting duplicate HTML trees, preventing `@dnd-kit` sensor conflicts and React 19 hydration mismatches.

5. **Environmental & Build Veracity**:
   - The production build passes cleanly (`exit code 0`).
   - The generated service worker file size is measured at exactly `149,451 bytes`, directly confirming the audit finding in O1.

---

## 3. Caveats

- **Live Database Migrations**: `Fix 4` specifies adding a secondary database index (`CREATE INDEX idx_widgets_month_id ON widgets(month_id)`). Because the audit task is strictly read-only per Requirement R4, database schema migrations were not executed against the live remote Supabase instance during this audit.
- **Future Mobile Placement (Phase 6 Batch B)**: Mobile interactive placement and Mobile Arrange mode are deliberately omitted from interactive checklist steps in Section 5 because they are not yet implemented in the codebase (as documented in `PROJECT_STATE.md:368`).

---

## 4. Conclusion

`OPTIMISATION_PLAN.md` has successfully addressed and resolved all previous adversarial challenges, factual inconsistencies, and architectural edge cases:
1. `zustand` is correctly preserved in `package.json` under Rule L3, while the undeclared `@dnd-kit/utilities` phantom import is cleanly excised.
2. File and line citations across `MobileBook.tsx:131-155, 362-434` and `store/entriesVersion.ts:14` are 100% verified against the codebase.
3. Fix 1 and Task 1 safeguard authentication ordering, preserve `created_at ASC` sorting, and safely handle un-setup months (`setup_done = false`) without null errors, upholding Rule L9.
4. Fix 3 and Task 3 eliminate temporary ID swap race conditions by generating permanent client UUIDs accepted directly by Postgres.
5. Fix 6 and Task 3 protect visual fidelity against CSS `scale` distortion.
6. Fix 7 and Task 5 eliminate shadow flicker by relying on permanent GPU layer caching.
7. Fix 8 and Task 6 preserve the locked Correction 7 single-tree responsive invariant.
8. Section 5 accurately reflects Desktop-only interactive placement vs. Mobile read-only sequential rendering.
9. `npm run build` succeeds with clean exit code 0.

**Explicit Verdict**: **APPROVE**

---

## 5. Verification Method

To independently verify these findings:
1. Run `npm run build` from project root and confirm exit code `0` with Turbopack and Serwist compilation.
2. Inspect `package.json` line 20 and `store/entriesVersion.ts` line 14 to verify `zustand` presence and usage.
3. Inspect `components/widgets/WidgetWrapper.tsx` line 20 to verify the `@dnd-kit/utilities` import.
4. Inspect `components/book/MobileBook.tsx` lines 131-155 and 362-434 to confirm page turn handlers and folio/tab controls.
5. Inspect `supabase/migrations/0001_initial_schema.sql` line 92 to confirm `id uuid primary key default gen_random_uuid()`.
6. Inspect `PROJECT_STATE.md` lines 175 and 368 to confirm Correction 7 and Task 11 Batch B scope.
