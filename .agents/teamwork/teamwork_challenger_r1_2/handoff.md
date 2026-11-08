# Adversarial Review & Empirical Challenge Report

**Review Target**: `c:\Users\aruko\OneDrive\Desktop\Documents\track\OPTIMISATION_PLAN.md`  
**Reviewer**: `teamwork_challenger_r1_2` (Roles: `critic`, `specialist`)  
**Verdict**: **CHALLENGE** (Requires specific implementation corrections before execution)  
**Overall Risk Assessment**: **HIGH** (Multiple race conditions, visual pop risks, and test checklist impossibilities detected)

---

## 1. Observation

Direct code and documentation observations gathered from the repository:

### Observation 1.1: Package Constraints (Rule L3)
- In `package.json:11-21`, declared dependencies are:
  ```json
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@supabase/ssr": "^0.12.7",
    "@supabase/supabase-js": "^2.119.0",
    "next": "^16.4.5",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "serwist": "^9.5.13",
    "zod": "^3.23.8",
    "zustand": "^5.0.2"
  }
  ```
- In `OPTIMISATION_PLAN.md:41-403`, all 12 proposed fixes rely exclusively on Next.js native features (`next/dynamic`, `next/font`, `useRouter.prefetch`), React primitives (`useOptimistic`, `useMemo`, `React.memo`), vanilla Postgres/Supabase SQL migrations, CSS properties, and allowed packages (`zustand`, `@dnd-kit/core`, `serwist`).
- In `OPTIMISATION_PLAN.md:493`, external data-fetching libraries (`TanStack Query`, `SWR`, `Radix`) are explicitly prohibited and listed under "Ideas (Not Built)".
- In `components/widgets/WidgetWrapper.tsx:20`, an existing undeclared transitive import `import { CSS } from '@dnd-kit/utilities'` was identified. Fix 12 correctly schedules its removal and replacement with an inline template string.

### Observation 1.2: Fix 1 Server Data Fetching & Auth Logic
- `OPTIMISATION_PLAN.md:48-63` proposes:
  ```typescript
  const [userRes, prevMonthData] = await Promise.all([
    supabase.auth.getUser(),
    getPreviousMonthData(year, month),
  ])
  ```
  with bullet 4: *"Deduplicate `supabase.auth.getUser()` in `setupActions.ts` by passing down the authenticated user context."*
- In `components/setup/setupActions.ts:37-50`:
  ```typescript
  export async function getPreviousMonthData(year: number, month: number): Promise<PreviousMonthData> {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { exists: false }
    // ...
  }
  ```
  `getPreviousMonthData` currently internally calls `supabase.auth.getUser()`. If called in `Promise.all` alongside `supabase.auth.getUser()`, it cannot receive the authenticated `user` context.
- In `OPTIMISATION_PLAN.md:56-62`, the proposed relational query is:
  ```typescript
  const { data: book } = await supabase
    .from('books')
    .select('id, months!inner(id, setup_done, paper_left, paper_right, setup_config, widgets(*))')
    .eq('user_id', user.id)
    .eq('year', year)
    .eq('months.month', month)
    .maybeSingle()
  ```
- In `app/book/[year]/[month]/page.tsx:59-75`, un-setup months (e.g. December 2026 `/book/2026/12`) do NOT have a pre-existing row in the `months` table (*"Missing rows are NOT created here"*).
- In `app/book/[year]/[month]/page.tsx:87`, widget rows are explicitly ordered: `.order('created_at', { ascending: true })`.

### Observation 1.3: Fix 3 Optimistic Widget Placement & ID Swap
- `OPTIMISATION_PLAN.md:115-134` proposes:
  ```typescript
  const tempId = crypto.randomUUID()
  const optimisticWidget: WidgetData = { id: tempId, ... }
  setWidgets((prev) => [...prev, optimisticWidget])
  setIsArrangeMode(true)
  // ... Await createWidget in background, swap tempId with persisted DB ID
  ```
- In `components/widgets/widgetActions.ts:249-337`, `createWidget` does not accept a client-provided `id`; it performs:
  ```typescript
  const { data: inserted } = await supabase.from('widgets').insert({ ... }).select().single()
  ```
  Postgres generates a new random UUID via `default gen_random_uuid()` (`supabase/migrations/0001_initial_schema.sql:92`).
- In `components/widgets/WidgetWrapper.tsx:18-28`, `useDraggable({ id: widget.id })` binds draggable identity directly to `widget.id`.
- In `components/widgets/PageWidgetLayer.tsx:138-142`, moving or resizing immediately calls `updateWidgetPosition(widgetId, ...)` or `deleteWidget(widgetId)`.

### Observation 1.4: Fix 6 Arrange Mode Resizing via CSS `scale`
- `OPTIMISATION_PLAN.md:203` proposes:
  *"4. During live resizing, preview resizing using GPU-accelerated CSS transforms (`translate3d` and `scale`) or inline CSS variables rather than directly mutating `left/top/width/height` layout properties."*
- In `components/widgets/WidgetWrapper.tsx:290-308`, widgets contain handwriting text (`font-hand` Kalam), SVG chart axes, hatched bars, and dotted grids snapping to 22px grid units (`GRID_PX = 22`).

### Observation 1.5: Fix 7 Disabling Background Shadows During Turn
- `OPTIMISATION_PLAN.md:224` proposes:
  *"4. During active turning state (`isTurning !== null`), temporarily disable expensive non-composited filters on background elements (such as ribbon drop-shadow filter and casing multi-layer shadows)."*
- In `components/book/OpenBook.tsx:579, 1065`, casing shadows and swallowtail red ribbon filters (`drop-shadow(...)`) are part of the core book realism defined in Rule L1.

### Observation 1.6: Fix 8 SSR 2-Pass Bypass vs Correction 7
- `OPTIMISATION_PLAN.md:241-243` proposes:
  *"1. In `components/book/OpenBook.tsx:107, 589-596`, eliminate the `isDesktop === null` blocking gate... 2. Render the desktop 2-page spread by default on SSR, wrapped in standard responsive Tailwind utility classes (`hidden md:flex` for desktop spread, `flex md:hidden` for mobile single page)..."*
- In `PROJECT_STATE.md:175`:
  *"- Viewport Switch (Correction 7): `OpenBook.tsx` renders exactly ONE tree determined by `matchMedia('(min-width: 768px)')`, rendering a neutral desk-coloured placeholder during initial hydration to prevent mismatch. Unsaved state is retained across viewport resizes."*
- `components/book/MobileBook.tsx:79-435` and `OpenBook.tsx` contain separate `@dnd-kit` contexts, widget layers, and setup flows.

### Observation 1.7: Section 5 Manual Test Checklist Feasibility on Mobile
- `OPTIMISATION_PLAN.md:461-483` defines:
  - Test Step 3: *"Widget Placement from Drawer (3 Widgets Placed)... Verified on: Desktop 1440×900 ([ ] Pass [ ] Fail) | Mobile 390×844 ([ ] Pass [ ] Fail)"*
  - Test Step 4: *"Widget Dragging & Resizing in Arrange Mode (1 Widget Dragged & Resized)... Verified on: Desktop 1440×900 ([ ] Pass [ ] Fail) | Mobile 390×844 ([ ] Pass [ ] Fail)"*
- In `components/book/MobileBook.tsx:1-439`, there are ZERO occurrences of `WidgetDrawer`, `isArrangeMode`, `PlacementOverlay`, or widget drag/resize handles.
- In `PROJECT_STATE.md:368`, under `## Next`:
  *"- Task 11 (Batch B) — Mobile Arrange mode (long-press on top ribbon, move up/down), WidgetDrawer placement on mobile, ClosedBook at 390px, MonthSetupWizard at 390px, and audit of remaining widgets' mobile render."*

---

## 2. Logic Chain

1. **Rule L3 Package Audit**:
   - Every fix in Section 2 and task in Section 3 relies exclusively on native Next.js, React, Supabase, and approved packages (`zod`, `zustand`, `@dnd-kit/core`, `serwist`).
   - Third-party UI kits, chart libraries, and external query engines (TanStack Query, SWR) are completely absent and explicitly forbidden in Section 4.
   - **Verdict on L3**: PASS.

2. **Fix 1 Server Waterfall Contradiction & Bug**:
   - `OPTIMISATION_PLAN.md` simultaneously claims to execute `supabase.auth.getUser()` and `getPreviousMonthData()` in parallel via `Promise.all`, while also claiming to *"Deduplicate `supabase.auth.getUser()` in `setupActions.ts` by passing down the authenticated user context"*.
   - If `getPreviousMonthData` is invoked in `Promise.all` before `getUser()` resolves, it cannot receive `user.id`. It must therefore either duplicate the 447 ms auth network request to Tokyo, or fail.
   - Furthermore, using `months!inner` in `books.select('..., months!inner(...))'` causes the entire query to return `null` if the viewed month has not been set up yet (such as empty month `/book/2026/12`). The server code in `page.tsx` will fail to detect existing books for the year.
   - Lastly, PostgREST embedded `widgets(*)` does not guarantee `created_at` ascending order, risking widget z-index and placement stacking bugs.

3. **Fix 3 Optimistic ID Race Condition**:
   - Fix 3 immediately activates Arrange mode (`setIsArrangeMode(true)`) with a temporary client ID (`tempId`) while `createWidget` runs asynchronously in the background.
   - If the user moves, resizes, or deletes the widget before `createWidget` returns (~1,000 ms), the application fires `updateWidgetPosition(tempId, ...)` or `deleteWidget(tempId)`.
   - Because `tempId` does not exist in Postgres, the server action fails with a 404/PGRST116 error, triggering an error banner and reverting valid user action.
   - If `createWidget` succeeds later, replacing `tempId` with the database ID while the user is actively dragging triggers `@dnd-kit/core` draggable unmount/remount, dropping active pointer capture.
   - If the user deletes the widget while in-flight, `deleteWidget` fails, and when `createWidget` finishes, an orphaned zombie widget is created in Supabase.

4. **Fix 6 CSS `scale` Resize Distortion**:
   - Previewing widget resizing via CSS `transform: scale(sx, sy)` stretches handwritten Kalam glyphs and non-uniformly scales SVG strokes (e.g. 1.4px dots, wobbly axes, hatching lines).
   - This breaks the book-like aesthetic (Rule L1) and violates 22px grid snapping (Rule L7, L10) during resize interactions.

5. **Fix 7 Visual Flicker on Page Turn**:
   - Dynamically disabling box shadows and drop-shadow filters on `isTurning !== null` causes an abrupt visual disappearance of shadows at frame 0 and an abrupt visual pop back on at 600 ms.
   - This violates Rule L1 and contradicts the plan's claim that visual styling remains 100% identical.

6. **Fix 8 Single-Tree Architecture Collision (Correction 7)**:
   - Rendering both `OpenBook` and `MobileBook` simultaneously via CSS (`hidden md:flex` / `flex md:hidden`) mounts duplicate `@dnd-kit` drag sensors, duplicate widget instances, and duplicate event listeners, directly violating **Correction 7** in `PROJECT_STATE.md:175`.
   - Conversely, rendering only Desktop on SSR causes a fatal React 19 hydration mismatch on mobile viewports (390×844).

7. **Section 5 Test Feasibility on Mobile**:
   - The checklist instructs testers to place 3 widgets from the drawer and drag/resize 1 widget in Arrange mode on **Mobile (390×844)**.
   - Because Mobile WidgetDrawer and Mobile Arrange mode have not yet been implemented (`PROJECT_STATE.md:368`), executing Test Steps 3 and 4 on mobile is physically impossible.

---

## 3. Detailed Challenges & Concrete Mitigations

### [Critical] Challenge 1: Fix 1 Server Auth Contradiction & Unauthenticated DB Execution
- **Assumption Challenged**: That `auth.getUser()` and `getPreviousMonthData()` can be parallelized in `Promise.all` while simultaneously deduplicating auth by passing down the authenticated user.
- **Attack Scenario**: If `Promise.all` is executed as written, an unauthenticated user hitting `/book/2026/11` triggers database reads for previous month data before redirecting to `/`. If `getPreviousMonthData` is called without user context, it issues a redundant `auth.getUser()` network round trip to Tokyo (~350 ms).
- **Blast Radius**: Unauthenticated DB execution; failure to eliminate the auth waterfall penalty.
- **Mitigation**: Await `supabase.auth.getUser()` first. If `!user`, immediately `redirect('/')`. Then execute `getPreviousMonthData(year, month, user.id)` and the current month query in parallel via `Promise.all`:
  ```typescript
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const [prevMonthData, currentMonthData] = await Promise.all([
    getPreviousMonthData(year, month, user.id),
    getCurrentMonthData(year, month, user.id),
  ])
  ```

---

### [High] Challenge 2: Fix 1 PostgREST `months!inner` Join Breaks Un-Setup Months
- **Assumption Challenged**: That `books.select('id, months!inner(...)')` cleanly retrieves month setup and widgets.
- **Attack Scenario**: When a user navigates to a new, unset month (e.g. `/book/2026/12`), no row exists in `months`. Because `months!inner` is specified, the entire query returns `book: null`. The server cannot determine whether the book exists, breaking wizard initialization and gentle prompt evaluation (`page.tsx:107-129`). Furthermore, `widgets(*)` returns unordered rows, breaking the explicit `order('created_at', { ascending: true })` contract.
- **Blast Radius**: Empty/new months fail to load or corrupt setup state; widget stacking order becomes non-deterministic.
- **Mitigation**: Use a left join or query `months` directly with embedded ordered widgets (`widgets(*, order=created_at.asc)`). Sort widgets explicitly on the client before rendering.

---

### [Critical] Challenge 3: Fix 3 Optimistic UUID Swap Race Condition in Arrange Mode
- **Assumption Challenged**: That an optimistic widget can be created with a temporary client UUID and safely swapped with the server ID in the background while Arrange mode is active.
- **Attack Scenario**: A user stamps a widget on the paper grid. It appears instantly and arrange mode is entered. The user immediately drags, resizes, or taps delete on the widget. The action fires `updateWidgetPosition(tempId, ...)` or `deleteWidget(tempId)` against Supabase. Because `tempId` does not exist in the database, the server action rejects with an error. If the user deletes the widget, an orphaned row is inserted when `createWidget` completes.
- **Blast Radius**: Failed drag/resize saves, corrupted arrange state, dropped pointer capture in `@dnd-kit`, and orphaned database widgets.
- **Mitigation**: Update `createWidget` in `widgetActions.ts` to accept an optional `id` parameter:
  ```typescript
  export async function createWidget(id: string, monthId: string, ...) {
    await supabase.from('widgets').insert({ id, monthId, ... })
  }
  ```
  Because Postgres schema allows client-supplied UUIDs (`id uuid primary key default gen_random_uuid()`), the client-generated UUID **becomes the permanent database ID**. There is zero ID swapping, zero `@dnd-kit` identity mutation, and zero race conditions on subsequent updates.

---

### [Medium] Challenge 4: Fix 6 CSS `scale` Resize Preview Distorts Aesthetic (L1, L7, L10)
- **Assumption Challenged**: That CSS `scale` is suitable for previewing widget resizing in arrange mode.
- **Attack Scenario**: When a user resizes a chart or note, CSS `scale(sx, sy)` stretches handwriting text, distorts SVG stroke widths, and desynchronizes inner elements from the 22px dotted paper grid.
- **Blast Radius**: Degraded visual realism; violation of Rules L1, L4, L5, and L7.
- **Mitigation**: Do NOT apply CSS `scale` to widget contents. Keep resizing snapped to discrete 22px grid steps (`GRID_PX`) via `liveW` and `liveH`, or preview only the dashed outer bounding box (`border-dashed border-ink/40`) using CSS dimensions while keeping the widget component static until drop.

---

### [Medium] Challenge 5: Fix 7 Disabling Background Shadows Causes Visible Pop (L1)
- **Assumption Challenged**: That disabling filters/shadows during page turns has zero visual risk.
- **Attack Scenario**: At the start of a 600 ms turn, casing shadows and ribbon drop shadows vanish instantly; at 600 ms, they snap back into view. The user sees a jarring flicker on the screen borders.
- **Blast Radius**: Obvious visual glitch and degradation of the tactile book aesthetic.
- **Mitigation**: Never toggle shadows off. Promote the casing and ribbon to dedicated GPU compositor layers permanently (`transform: translateZ(0)` or `will-change: transform`). The compositor will cache them in GPU texture memory without per-frame rasterization during turns.

---

### [High] Challenge 6: Fix 8 Dual-Tree SSR Conflicts with Locked Single-Tree (Correction 7)
- **Assumption Challenged**: That rendering both Desktop and Mobile trees with Tailwind `hidden md:flex` / `flex md:hidden` on SSR is safe.
- **Attack Scenario**: Mounting both trees creates duplicate `@dnd-kit` sensor listeners and duplicate widget layers. Mobile devices (390×844) are burdened with mounting, parsing, and running the heavy desktop layout and charts. If only Desktop is rendered on SSR, Mobile devices encounter a major React 19 hydration mismatch error.
- **Blast Radius**: Double memory/DOM overhead, sensor collisions, and hydration mismatch warnings.
- **Mitigation**: Preserve the **Correction 7** single-tree architecture (`matchMedia` gate with neutral desk placeholder). Optimize the placeholder for immediate paint and ensure hydration is non-blocking.

---

### [High] Challenge 7: Section 5 Manual Test Checklist Infeasibility on Mobile 390×844
- **Assumption Challenged**: That Test Steps 3 and 4 can be verified on Mobile (390×844).
- **Attack Scenario**: A tester attempts to open the Widget Drawer and drag/resize widgets on a mobile screen (390×844). Neither the brass drawer handle, the drawer component, nor Arrange mode exists in `MobileBook.tsx` (scheduled for Phase 6 / Task 11 Batch B in `PROJECT_STATE.md`). The test cannot be executed.
- **Blast Radius**: Confusion during QA, false test failures, and invalid release verification.
- **Mitigation**: In Section 5, explicitly restrict Test Step 3 and Test Step 4 to `Desktop (1440×900) Only`. Add a mobile-specific verification step to verify that widgets placed on Desktop render correctly in `MobileBook.tsx`'s sequential page format.

---

## 4. Stress Test Results Summary

| Scenario / Proposed Fix | Expected Behavior | Actual / Predicted Failure Mode | Status |
|---|---|---|---|
| **L3 Package Compliance** | Zero packages outside L3 | Confirmed 0 non-L3 packages; removes `@dnd-kit/utilities` | **PASS** |
| **Fix 1: Parallel Auth** | Deduplicate `auth.getUser()` in parallel | Contradiction: `getPreviousMonthData` needs `user.id`; unauthenticated requests hit DB | **FAIL (Mitigated)** |
| **Fix 1: Relational Join** | Consolidated 1-query fetch | `months!inner` returns `null` on un-setup months; unordered widgets | **FAIL (Mitigated)** |
| **Fix 2: Router Prefetch** | Smooth page transitions into warm cache | Correct Next.js `useRouter.prefetch` usage | **PASS** |
| **Fix 3: Optimistic Placement** | Instant widget stamping | Temporary UUID causes 404 race condition during immediate drag/resize | **FAIL (Mitigated)** |
| **Fix 4: DB Index on `widgets`** | $O(\log N)$ B-tree index lookup | Clean Postgres migration on foreign key | **PASS** |
| **Fix 5: Dynamic Imports** | Cut client chunk size by 50% | Clean Next.js `next/dynamic` splitting | **PASS** |
| **Fix 6: Resize via CSS `scale`** | Fast GPU resize preview | Visually distorts Kalam text, SVG axes, and 22px grid | **FAIL (Mitigated)** |
| **Fix 7: Disable Turn Shadows** | Eliminate rasterization during turns | Jarring shadow pop/flicker on casing and ribbon | **FAIL (Mitigated)** |
| **Fix 8: Dual-Tree SSR Bypass** | Instant SSR paint without 2-pass | Violates Correction 7 single-tree invariant; duplicate DnD contexts | **FAIL (Mitigated)** |
| **Fix 9: Scoped Cover Font** | Save 5 font requests on `/book/*` | Cormorant Garamond cleanly isolated to cover | **PASS** |
| **Fix 10: Service Worker Minify** | Reduce `sw.js` to 45 KB & fix timeout | Aligns Serwist caching rules with Next.js | **PASS** |
| **Fix 11: Jitter Memoization** | Eliminate per-render trig math | Wrapped in `useMemo` with deterministic seeds | **PASS** |
| **Fix 12: Dependency Cleanup** | Remove phantom `@dnd-kit/utilities` | Replaces with inline CSS template string | **PASS** |
| **Section 5: Mobile Placement** | Verify placement on 390×844 | Infeasible: Mobile drawer/arrange not implemented | **FAIL (Mitigated)** |

---

## 5. Caveats

- **Supabase Production Latency**: Measurements reflect the current host region in Tokyo (`ap-northeast-1`). Latency from different geographic regions will vary, but relational joins and prefetching remain universally beneficial.
- **Database Migrations**: The proposed migration for `idx_widgets_month_id` must be executed only when code changes are permitted, not during the read-only audit phase.

---

## 6. Conclusion & Actionable Verdict

**Final Verdict**: **CHALLENGE**

While `OPTIMISATION_PLAN.md` is an exceptionally comprehensive and well-structured plan that strictly complies with Rule L3 package boundaries, the plan cannot be approved in its current state due to the critical runtime bugs, race conditions, visual glitches, and test checklist impossibilities detailed above.

**Required Amendments to `OPTIMISATION_PLAN.md` Before Implementation**:
1. **Fix 1**: Refactor to authenticate once first, guard `redirect('/')`, and then run `Promise.all` for current and previous month data with `user.id`. Replace `months!inner` with a query structure that handles unset months safely and guarantees `created_at ASC` widget ordering.
2. **Fix 3**: Update `createWidget` to accept client-generated UUIDs directly as the primary key so no ID swapping occurs during live Arrange mode sessions.
3. **Fix 6**: Remove CSS `scale` previewing to protect Kalam handwriting and SVG chart geometry from stretching.
4. **Fix 7**: Remove the dynamic toggling/disabling of background shadows to prevent visual flicker; use permanent GPU layer promotion instead.
5. **Fix 8**: Reconcile SSR rendering with the locked **Correction 7** single-tree architecture to prevent duplicate `@dnd-kit` contexts or mobile hydration mismatches.
6. **Section 5**: Mark Test Steps 3 and 4 as `Desktop (1440×900) Only`, and specify read-only responsive verification for Mobile (390×844).

---

## 7. Verification Method

To independently verify the observations and challenges in this report:
1. **Verify L3 Package Restraint**: Inspect `package.json:11-21` and verify that no UI kit or forbidden package is added.
2. **Verify Mobile Feature Scope**: Search `components/book/MobileBook.tsx` for `WidgetDrawer` or `isArrangeMode` to confirm that widget placement and arrange mode do not exist on mobile.
3. **Verify Postgres Schema UUID Support**: Inspect `supabase/migrations/0001_initial_schema.sql:91-103` to confirm `widgets.id` is a UUID primary key accepting client-generated UUIDs.
4. **Verify Correction 7 Invariant**: Inspect `PROJECT_STATE.md:175` to confirm the locked single-tree `matchMedia` architecture decision.
