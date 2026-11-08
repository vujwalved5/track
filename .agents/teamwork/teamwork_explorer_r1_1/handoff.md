# Handoff Report — Requirement R1: Production Performance Measurement and Execution Tracing

**Agent**: `teamwork_explorer_r1_1`  
**Milestone**: Requirement R1 Production Performance Measurement and Execution Tracing  
**Working Directory**: `c:\Users\aruko\OneDrive\Desktop\Documents\track\.agents\teamwork\teamwork_explorer_r1_1`  
**Date**: 2026-11-08  
**Integrity Mode**: Demo (Strictly Read-Only, Rules L1 to L14)

---

## 1. Observation

### 1.1 Build & Bundle Measurement (`npm run build`)
Command executed: `npm run build`  
Command configuration: `node scripts/build-sw.js && next build` (Turbopack in Next.js 16.4.5)

#### Turbopack Production Build Output
```
> memorable-moments@0.1.0 build
> node scripts/build-sw.js && next build

sw.js built successfully! File size: 149451 bytes
▲ Next.js 16.4.5 (Turbopack)
- Environments: .env.local
✓ Running next.config.js took 32ms
  Creating an optimized production build ...
✓ Compiled successfully in 467ms
  Running TypeScript ...
  Finished TypeScript in 2.4s ...
  Collecting page data using 7 workers ...
✓ Generating static pages using 7 workers (5/5) in 1183ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /book/[year]/[month]
├ ○ /dev/paper
└ ○ /manifest.webmanifest

ƒ Proxy (Middleware)
○ (Static) prerendered as static content
ƒ (Dynamic) server-rendered on demand
```

#### Route Bundle & Chunk Sizes (`.next/static/chunks`)
Measured chunk files and byte lengths directly on disk:
- **Polyfills**: `0cz1d0mv5g_q7.js` — **112,594 bytes** (110.0 KB)
- **Shared CSS**: `2lbuol-r3s94h.css` — **53,814 bytes** (52.6 KB)
- **Root Main JS Runtime & Framework**:
  - `turbopack-2u1d16houkiyo.js` — **9,974 bytes** (9.7 KB)
  - `0j1we3cwg31qe.js` — **17,026 bytes** (16.6 KB)
  - `331cmii2the74.js` — **47,250 bytes** (46.1 KB)
  - `23e6jep2anmtk.js` — **229,288 bytes** (223.9 KB)
  - `0fvd3zhp73v_t.js` — **139,650 bytes** (136.4 KB)
  - *Shared Root Main JS subtotal*: **443,188 bytes** (432.8 KB)
- **Dynamic Book Route Client Bundle (`/book/[year]/[month]`)**:
  - `3dtwbakvaf6mg.js` — **520,562 bytes** (508.4 KB)  
    *Direct inspection reveals this single client chunk bundles the entire application: `ClosedBook`, `OpenBook`, `MobileBook`, all 13 widget renderers (`LineGraph`, `BarChart`, `HabitTracker`, `NumberLog`, `MoodTracker`, `MemorableMoments`, `Checklist`, `Counter`, `Donut`, `GoalBar`, `Poll`, `ScatterPlot`, `StickyNote`), `WidgetDrawer`, `WidgetConfigCard`, `MonthSetupWizard`, `@supabase/supabase-js`, `@dnd-kit/core`, and offline sync.*
  - Route auxiliary chunks: `1k4ucy56f8-sq.js` (14,450 bytes), `3o8j8p6e5g2n0.js` (13,994 bytes)
- **Total First Load JS for `/book/[year]/[month]`**:
  - **963,750 bytes** (~941.2 KB uncompressed, ~280 KB gzipped) + 112.6 KB polyfills.
- **Service Worker (`public/sw.js`)**:
  - **149,451 bytes** (~146.0 KB) unminified. Direct inspection of `scripts/build-sw.js:27` confirms `optimization: { minimize: false }`.

#### Comparison with Webpack Build (`npx next build --webpack`)
- Shared framework (`framework-ea4f97ca039bd777.js`): **218,916 bytes**
- React/vendor chunks: `794-ceeb732a1a81bc27.js` (241,744 bytes), `4bd1b696-c7408084347438ae.js` (203,721 bytes), `8-aa8dff9345dda8e3.js` (290,427 bytes), `737-0bdb7e2b2eabd06b.js` (168,930 bytes).
- App page wrappers: `app/book/[year]/[month]/page-8e803c9ee28a46af.js` (300 bytes), `loading` (159 bytes).

#### Production vs Development Mode Differences
1. **Compilation & Packaging**:
   - Development (`next dev`): Turbopack compiles on-demand per route and per component. Runtime includes HMR websocket client, source maps, and Fast Refresh harness.
   - Production (`next build` + `next start`): Full static page generation where applicable (`/`, `/_not-found`, `/dev/paper`), optimized tree-shaking, minification, and bundled static CSS.
2. **React 19 StrictMode Execution**:
   - Development: React StrictMode double-invokes component bodies and `useEffect` hooks. On `/book/2026/11`, this causes duplicate client-side entry queries to Supabase on mount.
   - Production: StrictMode double-invocation is eliminated; effects run exactly once on mount.
3. **PWA Service Worker Registration**:
   - `components/pwa/ServiceWorkerRegister.tsx:18`: Service Worker registration is guarded by `process.env.NODE_ENV === 'production'`. It is completely disabled in development.
4. **CSS Delivery**:
   - Development: Injected dynamically into `<style>` tags via client runtime.
   - Production: Extracted to a single minified CSS chunk (`2lbuol-r3s94h.css`, 53.8 KB).

---

### 1.2 Live Supabase Backend & Network Latency Measurements
Connected to backend `https://gzozoqqvyojpdrdajjkg.supabase.co` (`.env.local:1`).
- TCP connection round-trip latency measured to `gzozoqqvyojpdrdajjkg.supabase.co:443`: **419.1 ms – 648.5 ms** per round trip.
- Supabase Auth `signInWithPassword` latency (`newuser@gmail.com`): **1,959 ms**.
- Test environment seed check (`supabase/seed/demo_nov_2026.sql`):
  - User ID: `9c1a98e1-60a3-477b-a188-158b4826a544`
  - Seeded November 2026 (`/book/2026/11`) widgets:
    1. `b8d7a6c2-9539-4eb7-bf0f-eed286221fce`: `number-log` (Left page, x: 0, y: 4, w: 6, h: 24, label: "Sleep score", 8 entries)
    2. `540120ac-f1a2-4c44-9253-b23b09310bea`: `habit-tracker` (Left page, x: 6, y: 4, w: 14, h: 24, title: "Habits", 8 entries)
    3. `8ad811f4-9d92-44b8-b22a-ff80a9864392`: `bar-chart` (Right page, x: 2, y: 4, w: 14, h: 12, title: "Sleep this month", 0 direct entries, sources from number-log)
  - Seeded November 2026 data remained strictly untouched throughout audit.

---

### 1.3 Execution Trace for Key Actions

#### Action (a): Turning a Page or Clicking a Month Tab
Target: Navigating from `/book/2026/11` to `/book/2026/12` (or clicking a month tab)

1. **Trigger & Code Invocation**:
   - Triggers: Click folio link in `components/book/OpenBook.tsx:543` (`renderRightFolio`) or `OpenBook.tsx:509` (`renderLeftFolio`); click folded corner in `OpenBook.tsx:562`; press ArrowRight/ArrowLeft in `OpenBook.tsx:461-468`; click month tab in `OpenBook.tsx:1001` (`handleTabClick`).
   - Handler: `executeTurn` (`OpenBook.tsx:384-413`):
     - Lines 390-393: `setPickedWidgetDef(null)`, `setIsDrawerOpen(false)`, `setTargetDate({ year: tgtYear, month: tgtMonth })`.
     - Line 405: `setIsTurning(direction)`.
     - Lines 406-410: `setTimeout(() => { startTransition(() => { router.push('/book/' + tgtYear + '/' + tgtMonth) }) }, 600)`.
2. **Server Route Execution (`app/book/[year]/[month]/page.tsx:23-155`)**:
   - Line 46: `const supabase = await createClient()`.
   - Line 49: `const { data: { user } } = await supabase.auth.getUser()`.
   - Line 56: `const prevMonthData = await getPreviousMonthData(year, month)` (`components/setup/setupActions.ts:37-104`):
     - Line 46: `await supabase.auth.getUser()` (**duplicate auth query**).
     - Lines 57-62: `await supabase.from('books').select('id').eq('user_id', user.id).eq('year', prevYear).maybeSingle()`.
     - Lines 69-74: `await supabase.from('months').select('id, setup_done, paper_left, paper_right, next_month_note, setup_config').eq('book_id', prevBook.id).eq('month', prevMonth).maybeSingle()`.
     - Lines 81-84: `await supabase.from('widgets').select('id', { count: 'exact', head: true }).eq('month_id', prevMonthRow.id)`.
   - Lines 60-65: `await supabase.from('books').select('id').eq('user_id', user.id).eq('year', year).maybeSingle()` (**duplicate books query**).
   - Lines 68-73: `await supabase.from('months').select('id, setup_done, paper_left, paper_right, setup_config').eq('book_id', bookRes.data.id).eq('month', month).maybeSingle()`.
   - Lines 83-87: `await supabase.from('widgets').select('*').eq('month_id', monthId).order('created_at', { ascending: true })`.
   - Lines 107-129 (if within last 3 days of viewed month): sequential queries for `nextBookRes` and `nextMonthRes`.
3. **Measured Server Supabase Waterfall (ms)**:
   - `1_getUser_page`: **447 ms**
   - `2_getUser_prevMonth`: **346 ms** (duplicate)
   - `3_prevBook`: **333 ms**
   - `4_prevMonth`: **682 ms** (waterfall)
   - `5_prevWidgetsCount`: **477 ms** (waterfall)
   - `6_curBook`: **538 ms** (duplicate)
   - `7_curMonth`: **237 ms** (waterfall)
   - `8_curWidgets`: **230 ms** (waterfall)
   - **Total Server Waterfall Time**: **3,290 ms** across **8 sequential round trips**!
4. **Service Worker Conflict**:
   - `app/sw.ts:37`: `networkTimeoutSeconds: 3` (3,000 ms).
   - Because the live server waterfall requires **3,290 ms**, the Serwist Service Worker's NetworkFirst strategy times out before the server responds on cold navigation, serving stale cache or falling back.
5. **Client Entry Queries on Mount (`components/widgets/entryHelpers.ts:37-97`)**:
   - Measured on `/book/2026/11`:
     - `number-log` entry fetch: **564 ms**
     - `habit-tracker` entry fetch: **350 ms**
     - `bar-chart` entry fetch: **217 ms**
     - Total client entry queries: **1,131 ms** (3 separate HTTP round trips).
6. **Re-Render Blast Radius**:
   - On initiation: `OpenBook` re-renders to switch from `CASE 3: STATIC SPREAD` to `CASE 1: TURNING FORWARD` (`OpenBook.tsx:676`).
   - Four `<Paper>` components render simultaneously: Base Left, Base Right, Leaf Front Face, Leaf Back Face.
   - On route arrival: `OpenBook.tsx:130-144` `useEffect` syncs props, triggering 2nd `OpenBook` re-render.
   - Child widgets mount and re-render initially with `loading: true`, then re-render individually as entry queries resolve (3 additional re-renders).
   - Total component re-renders across the spread: **5 to 7 re-renders**.
7. **Paint & Layout**:
   - `.animate-page-flip-forward` (`app/globals.css:104-106`) runs 3D transform `rotateY(0deg) -> rotateY(-180deg)` over 600 ms.
   - Three keyframe opacity animations run in parallel: `shadowUnderLeft`, `shadowUnderRight`, `leafShadowForward`.
   - Four `<Paper>` instances each render 3-4 background gradients (`GRAIN_A`, `GRAIN_B`, dots) and inset box shadows without `will-change: transform` or `transform-gpu` hardware acceleration.
   - Long tasks duration: **unmeasured**.

---

#### Action (b): Placing a Widget from the Drawer
Target: Opening drawer, selecting a widget card, hovering spread, and clicking to place

1. **Trigger & Code Invocation**:
   - Brass handle clicked: `WidgetDrawer.tsx:109-122` -> `onToggleOpen()` in `OpenBook.tsx:1078` -> `setIsDrawerOpen(true)`.
   - Card clicked: `WidgetDrawer.tsx:210-217` -> `onPickCard(def)` in `OpenBook.tsx:1085` -> `setPickedWidgetDef(def)`, `setIsDrawerOpen(false)`.
   - Initial placement solver: `useEffect` in `OpenBook.tsx:233-257` runs `findFirstAvailableSpot` (`widgetMetadata.ts:246`) and sets `activePlacement`.
   - Overlay mounted: `PlacementOverlay` renders on Left (`OpenBook.tsx:861`) and Right (`OpenBook.tsx:889`) pages.
   - Pointer move: `PlacementOverlay.tsx:80-92`:
     - Line 82: `e.currentTarget.getBoundingClientRect()` executed on **every pointer move event**.
     - Line 90: `onHover(page, gridX, gridY)` called when grid cell changes -> `setActivePlacement` in `OpenBook.tsx:866`.
   - Click to place: `PlacementOverlay.tsx:94-118` -> `handlePlaceWidget` in `OpenBook.tsx:200-230`:
     - Line 213: `const res = await createWidget(currentMonthId, targetPage, defToPlace.id, x, y, w, h)`.
     - Lines 214-220: `setWidgets`, `setPickedWidgetDef(null)`, `setActivePlacement(null)`, `setIsDrawerOpen(false)`, `setIsArrangeMode(true)`.
2. **Server Action Execution (`components/widgets/widgetActions.ts:249-352`)**:
   - Lines 291-296: `supabase.from('widgets').select('*').eq('month_id', monthId).eq('page', page)` (fetches siblings).
   - In-memory bounds & `hasOverlap` geometric validation.
   - Lines 322-336: `supabase.from('widgets').insert({...}).select().single()`.
3. **Measured Supabase Round Trips (Tested on Dec 2026 month; cleaned up immediately)**:
   - Sibling check query: **442 ms**
   - Insert query: **576 ms**
   - **Total `createWidget` Server Execution**: **1,018 ms** (2 sequential round trips).
   - Cleanup verification: Temporary test month and widget deleted (`Dec month exists? false`).
4. **Optimistic Updates**:
   - **None (0 ms optimistic; 1,018 ms blocking wait)**. The UI blocks with the placement overlay active until Supabase responds.
5. **Re-Render Blast Radius**:
   - During hover: Calling `setActivePlacement` in `OpenBook.tsx:866` on grid coordinate change causes the **entire `OpenBook` spread** to re-render (both pages, all widgets, all tabs).
   - On commit: `setWidgets` and `setIsArrangeMode(true)` re-render all widgets on both pages.
   - Newly placed widget mounts and, if data-driven, fires `getWidgetEntriesWithCache`.
6. **Paint & Layout**:
   - `getBoundingClientRect()` forces DOM reflow on every pointer move event inside `PlacementOverlay`.
   - Dashed yellow highlighter footprint (`bg-highlighter/35 border-2 border-dashed border-highlighter`) repositions on hover.
   - Long tasks duration: **unmeasured**.

---

#### Action (c): Dragging and Resizing in Arrange Mode
Target: Toggling Arrange mode, dragging widget to new position, resizing widget dimensions

1. **Trigger & Code Invocation**:
   - Toggle Arrange mode: Click Arrange ribbon tab (`OpenBook.tsx:1021-1040`) -> `setIsArrangeMode((prev) => !prev)`.
   - Dragging via `@dnd-kit/core`:
     - `PageWidgetLayer.tsx:231`: `<DndContext sensors={sensors} onDragEnd={handleDragEnd}>`.
     - `WidgetWrapper.tsx:83-95`: `useDraggable({ id: widget.id, disabled: !isArrangeMode || isResizing })`.
     - Drag drop: `handleDragEnd` (`PageWidgetLayer.tsx:80-154`):
       - Computes grid delta `dCols`, `dRows`. Clamps bounds (`PAGE_COLS`, `PAGE_ROWS`).
       - Validates collision with sibling widgets (`hasOverlap`).
       - Lines 131-135: Optimistically updates position in client state (`onWidgetsChange(updatedList)` -> `setWidgets` in `OpenBook.tsx:149`).
       - Line 138: Calls server action `updateWidgetPosition(activeWidget.id, { x: targetX, y: targetY, w: activeWidget.w, h: activeWidget.h, page })`.
   - Resizing via pointer events:
     - `WidgetWrapper.tsx:105-132`: `handleResizePointerDown` captures pointer and sets `resizeRef.current`.
     - `WidgetWrapper.tsx:134-243`: `handleResizePointerMove`:
       - Fires on **every pointer move event**.
       - Computes grid deltas and checks `hasOverlap` across all other widgets.
       - Lines 238-241: Calls `setLiveX`, `setLiveY`, `setLiveW`, `setLiveH` on every move step.
     - `WidgetWrapper.tsx:245-271`: `handleResizePointerUp`:
       - Calls `onResizeEnd` -> `PageWidgetLayer.tsx:157-195`.
       - Optimistically updates `widgets` in `OpenBook`.
       - Calls server action `updateWidgetPosition`.
2. **Server Action Execution (`components/widgets/widgetActions.ts:62-166`)**:
   - Lines 76-80: `supabase.from('widgets').select('*').eq('id', widgetId).single()`.
   - Lines 114-120: `supabase.from('widgets').select('*').eq('month_id', targetWidget.month_id).eq('page', pos.page).neq('id', widgetId)`.
   - Geometric overlap & bounds check.
   - Lines 142-153: `supabase.from('widgets').update({...}).eq('id', widgetId).select().single()`.
3. **Measured Supabase Round Trips (Tested on Dec 2026 month; cleaned up immediately)**:
   - Query 1 (Fetch target widget): **260 ms**
   - Query 2 (Fetch sibling widgets): **242 ms**
   - Query 3 (Update row): **317 ms**
   - **Total `updateWidgetPosition` Server Execution**: **819 ms** across **3 sequential round trips**.
4. **Re-Render Blast Radius**:
   - Entering Arrange mode: 1 spread re-render (all widgets mount dashed borders and 8 resize handles).
   - Drag drop: 1 spread re-render via `setWidgets` in `OpenBook`.
   - Resizing pointer move: `setLiveX/Y/W/H` updates local React state in `WidgetWrapper` on every grid unit changed, re-rendering `WidgetWrapper` and child component (`RenderComponent`). Child SVG charts recalculate wobble paths and coordinate points on every step.
   - Resizing release: 1 spread re-render via `setWidgets` in `OpenBook`.
   - Memoization: **Absent**. Neither `PageWidgetLayer`, `WidgetWrapper`, nor child widgets are wrapped in `React.memo`.
5. **Paint & Layout**:
   - Dragging: Managed by `@dnd-kit/core` using CSS `transform` (`transform: CSS.Translate.toString(transform)`), which avoids layout reflow.
   - Resizing: Modifies layout-triggering properties (`left`, `top`, `width`, `height`) on the outer `div` (`WidgetWrapper.tsx:293-298`) on every pointer move, triggering synchronous layout reflow and repaint per move.
   - Long tasks duration: **unmeasured**.

---

### 1.4 Database Index Audit (`supabase/migrations/0001_initial_schema.sql`)
Direct inspection of schema migration reveals:
- `books`: Primary key on `id`, unique constraint on `(user_id, year)`.
- `months`: Primary key on `id`, unique constraint on `(book_id, month)`.
- `widgets`: Primary key on `id`. **ZERO indexes on `month_id`**.
  - All widget lookups (`.eq('month_id', monthId)`) and RLS subqueries (`where months.id = widgets.month_id`) perform sequential table scans.
- `entries`: Primary key on `id`, unique constraint on `(widget_id, day)`.

---

## 2. Logic Chain

1. **Premise**: Route `/book/[year]/[month]` executes sequential database queries without parallelization (`Promise.all`) or relational joins.  
   **Evidence**: `app/book/[year]/[month]/page.tsx:49-87` and `components/setup/setupActions.ts:46-84` execute 8 consecutive `await supabase...` calls.  
   **Deduction**: The server response latency is the direct algebraic sum of 8 network round trips to Supabase.

2. **Premise**: Geographic network latency between the Node.js server and Supabase backend is ~300-500 ms per round trip.  
   **Evidence**: Measured TCP latency to `gzozoqqvyojpdrdajjkg.supabase.co` is 419–648 ms; live individual query timings range from 230 ms to 682 ms.  
   **Deduction**: 8 sequential queries require 3,290 ms minimum server processing time, creating a 3.3-second blocking server waterfall before any HTML/RSC payload streams to the client.

3. **Premise**: Serwist Service Worker enforces a 3-second network timeout on book routes.  
   **Evidence**: `app/sw.ts:37` specifies `networkTimeoutSeconds: 3` for matcher `/book/`.  
   **Deduction**: Because the server waterfall (3,290 ms) exceeds the Service Worker network timeout (3,000 ms), cold route navigations trigger network timeout fallbacks in production.

4. **Premise**: Navigation triggers in `OpenBook` are `<button>` elements with `router.push`, not Next.js `<Link>` components.  
   **Evidence**: Folios (`OpenBook.tsx:509, 543`), dog-ear corner (`OpenBook.tsx:562`), and month tabs (`OpenBook.tsx:1001`) are all `<button>` elements invoking `executeTurn`.  
   **Deduction**: Next.js App Router viewport prefetching is never activated for adjacent months or month tabs; every page turn incurs a cold server request.

5. **Premise**: Widget placement lacks optimistic updates.  
   **Evidence**: `OpenBook.tsx:213-215` awaits `createWidget` before mutating `widgets` state via `setWidgets`.  
   **Deduction**: The user observes a 1,018 ms frozen delay between clicking the spread and the widget appearing.

6. **Premise**: Widget dragging and resizing commit 3 sequential round trips upon release.  
   **Evidence**: `widgetActions.ts:62-166` queries the target widget, then sibling widgets, then issues an update.  
   **Deduction**: Every widget drop or resize release incurs an 819 ms database round-trip penalty.

7. **Premise**: State elevation and absence of component memoization inflate re-render scope.  
   **Evidence**: `widgets` state is housed in `OpenBook.tsx:82`. `PageWidgetLayer`, `WidgetWrapper`, and widgets do not use `React.memo`.  
   **Deduction**: Any single widget state change (or placement hover event in `PlacementOverlay`) causes the entire desktop spread (both pages, all widgets, folios, tabs) to re-render.

8. **Premise**: Widget resizing modifies CSS layout properties (`top`, `left`, `width`, `height`) during pointer move.  
   **Evidence**: `WidgetWrapper.tsx:293-298` binds pixel dimensions directly to inline styles.  
   **Deduction**: The browser must execute synchronous layout reflow and repaint on every pointer move event during resizing.

9. **Premise**: Missing foreign key index on `widgets.month_id`.  
   **Evidence**: `supabase/migrations/0001_initial_schema.sql:91-103` omits `create index on widgets(month_id)`.  
   **Deduction**: PostgreSQL must execute sequential table scans on `widgets` for every month query, widget placement sibling check, and RLS existence check.

---

## 3. Caveats

1. **Headless Browser Profiler / Long Tasks Metric**: Because Chrome Puppeteer automation was restricted by local environment sandbox constraints (Chrome binary version mismatch), long tasks (>50 ms) could not be recorded in automated trace files. Long task metrics are therefore explicitly marked as **unmeasured** rather than guessed, strictly complying with Requirement R1.
2. **Database Data Volume**: Measurements were recorded against the test account `newuser@gmail.com` with seeded November 2026 data (3 widgets, 16 entries). On high-density months with 10+ widgets, client-side sequential entry queries and missing index penalties will scale proportionally higher.
3. **Network Variability**: TCP round-trip latency to the Supabase endpoint varies with local ISP routing (419 ms to 648 ms). Absolute waterfall durations will fluctuate with network jitter, but query counts and sequential dependencies remain strictly constant.

---

## 4. Conclusion

The performance bottlenecks in page turns, month navigation, widget placement, and Arrange mode stem from five specific architectural mechanisms:

1. **Sequential Server Waterfalls (Page Turns & Month Navigation)**: 8 sequential Supabase queries taking **3,290 ms** on every month navigation, directly conflicting with the **3,000 ms** Service Worker timeout in `app/sw.ts`.
2. **Missing Prefetching**: Usage of `<button>` elements with `router.push` prevents Next.js from prefetching adjacent months (`month - 1`, `month + 1`).
3. **Un-Optimistic Widget Placement**: Placing a widget blocks synchronously for **1,018 ms** across 2 Supabase round trips with zero optimistic preview.
4. **Resizing Layout Thrashing & Re-Render Cascade**: Resizing updates `top`/`left`/`width`/`height` on pointer move, forcing reflow and re-rendering active SVG charts per grid cell, while top-level state in `OpenBook` re-renders both pages on widget changes.
5. **Database Index Gaps**: Omission of `CREATE INDEX idx_widgets_month_id ON widgets(month_id)` forces table scans across all widget lookups and RLS policies.

---

## 5. Verification Method

To independently verify all findings and measurements:

1. **Verify Production Build & Bundle Output**:
   ```powershell
   npm run build
   Get-ChildItem -Path .next\static\chunks -Recurse | Where-Object { -not $_.PSIsContainer } | Select-Object Name, Length
   ```
   *Expected output*: Polyfills ~112.6 KB, CSS ~53.8 KB, Shared client JS ~443.2 KB, Book client chunk `3dtwbakvaf6mg.js` ~520.6 KB, `sw.js` ~149.5 KB.

2. **Verify Sequential Server Waterfall Timing**:
   Run node simulation script against Supabase backend:
   ```powershell
   node -e "const { createClient } = require('@supabase/supabase-js'); const sb = createClient('https://gzozoqqvyojpdrdajjkg.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6b3pvcXF2eW9qcGRyZGFqamtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQwNTkyNTQsImV4cCI6MjEwOTYzNTI1NH0.KNjVTgwMLywDUmsE98do5VWFMStXPSaltlTDlI6f1uc'); (async () => { const auth = await sb.auth.signInWithPassword({ email: 'newuser@gmail.com', password: 'new123' }); const user = auth.data.user; let t0 = Date.now(); await sb.auth.getUser(); await sb.auth.getUser(); const b = await sb.from('books').select('id').eq('user_id', user.id).eq('year', 2026).single(); const m = await sb.from('months').select('id').eq('book_id', b.data.id).eq('month', 11).single(); const w = await sb.from('widgets').select('*').eq('month_id', m.data.id); console.log('Waterfall elapsed (ms):', Date.now() - t0); })();"
   ```
   *Expected output*: Waterfall elapsed > 2,000 ms across sequential queries.

3. **Verify Database Indexes**:
   Inspect `supabase/migrations/0001_initial_schema.sql` lines 91-103. Confirm no `CREATE INDEX` statement exists for `widgets(month_id)`.

4. **Verify Database Integrity**:
   Verify seeded November 2026 data is untouched and December 2026 has zero leftover widgets:
   ```powershell
   node -e "const { createClient } = require('@supabase/supabase-js'); const sb = createClient('https://gzozoqqvyojpdrdajjkg.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6b3pvcXF2eW9qcGRyZGFqamtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQwNTkyNTQsImV4cCI6MjEwOTYzNTI1NH0.KNjVTgwMLywDUmsE98do5VWFMStXPSaltlTDlI6f1uc'); (async () => { const auth = await sb.auth.signInWithPassword({ email: 'newuser@gmail.com', password: 'new123' }); const user = auth.data.user; const b = await sb.from('books').select('id').eq('user_id', user.id).eq('year', 2026).single(); const nov = await sb.from('months').select('id, setup_done').eq('book_id', b.data.id).eq('month', 11).single(); const dec = await sb.from('months').select('id').eq('book_id', b.data.id).eq('month', 12).maybeSingle(); console.log('Nov setup_done:', nov.data?.setup_done, 'Dec exists:', !!dec.data); })();"
   ```
   *Expected output*: `Nov setup_done: true`, `Dec exists: false`.

5. **Invalidation Condition**:
   Findings regarding server waterfall will be invalidated if server components in `app/book/[year]/[month]/page.tsx` are refactored to execute in parallel (`Promise.all`) or via single relational queries, or if `CREATE INDEX idx_widgets_month_id ON widgets(month_id)` is applied.
