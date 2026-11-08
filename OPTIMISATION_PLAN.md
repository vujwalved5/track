# Authoritative Optimisation Plan: "Memorable Moments"

**Document Status**: Authoritative Roadmap  
**Target Environments**: Desktop (`>= 768px`, 1440×900) & Mobile (`< 768px`, 390×844)  
**Strict Compliance**: Locked Decisions L1 to L14 (GEMINI.md) & Approved Packages L3 (`zod`, `zustand`, `@dnd-kit/core`, `serwist`)  
**Base Measurements**: Production Build (`npm run build`), Supabase Backend (`ap-northeast-1`), Seeded Nov 2026 (`/book/2026/11`) & Dec 2026 (`/book/2026/12`)

---

## 1. Findings Table

The table below compiles every item investigated under Requirements R1 and R2 across Data, Rendering, Animation & Paint, Arrange Mode, and Other categories. All metrics reflect traced code paths, live production bundle analyses, and live Supabase measurements. Any metric that cannot be directly traced or measured in the environment is explicitly designated **unmeasured**.

| # | Investigated Item & Category | Status | Exact Location (`file:line`) | Measured Impact | Direct Code / Runtime Evidence & Trace |
|---|---|---|---|---|---|
| **D1** | **Month data fetching waterfalls**<br>*(Data)* | **Found** | `app/book/[year]/[month]/page.tsx:46-129`<br>`components/setup/setupActions.ts:42-85`<br>`components/widgets/entryHelpers.ts:37-97` | **High**<br>(3,290 ms server waterfall + 1,131 ms client waterfall) | **Server Waterfall**: 8 sequential round trips executed one after another (`1_getUser_page`: 447 ms, `2_getUser_prevMonth`: 346 ms redundant, `3_prevBook`: 333 ms, `4_prevMonth`: 682 ms, `5_prevWidgetsCount`: 477 ms, `6_curBook`: 538 ms redundant, `7_curMonth`: 237 ms, `8_curWidgets`: 230 ms). Total server processing: **3,290 ms** before streaming HTML.<br>**Client Waterfall**: Entries are omitted from SSR. On mount, child widgets issue separate HTTP server actions (`number-log`: 564 ms, `habit-tracker`: 350 ms, `bar-chart`: 217 ms = **1,131 ms**). |
| **D2** | **Absence of adjacent month prefetching**<br>*(Data)* | **Found** | `components/book/OpenBook.tsx:384-413`<br>`components/book/OpenBook.tsx:441-448`<br>`components/book/MobileBook.tsx:131-155, 362-434` | **High**<br>(Unbuffered delay on every turn) | `router.prefetch` is **never called** (0 occurrences in entire codebase). Navigation folios (`OpenBook.tsx:509, 543`), folded corners (`OpenBook.tsx:562`), and month tabs (`OpenBook.tsx:1001`) use HTML `<button>` elements with `router.push` wrapped in `setTimeout(..., 600)`. Next.js viewport prefetching never triggers; every turn incurs a cold server request. |
| **D3** | **Widget placement waiting for Supabase responses without optimistic updates**<br>*(Data)* | **Found** | `components/book/OpenBook.tsx:200-230`<br>`components/widgets/PlacementOverlay.tsx:94-118`<br>`components/widgets/widgetActions.ts:249-352` | **High**<br>(1,018 ms blocking freeze) | In `OpenBook.tsx:213-220`, `await createWidget(...)` blocks state updates. `setWidgets`, closing the drawer, and switching to arrange mode wait for 2 sequential Supabase queries (sibling bounds check: 442 ms + insert: 576 ms = **1,018 ms**). The yellow placement overlay remains frozen during this window with **0 ms optimistic feedback**. |
| **D4** | **Un-debounced saves during dragging/keystrokes**<br>*(Data)* | **Not Found** | `components/widgets/PageWidgetLayer.tsx:80-154, 157-195`<br>`components/widgets/free-note/FreeNoteWidget.tsx:112-119`<br>`components/widgets/number-log/NumberLogWidget.tsx:107-132`<br>`components/widgets/WidgetConfigCard.tsx:290-348` | **None / Low**<br>(Bottleneck absent) | Dragging saves exclusively on `handleDragEnd` (`PageWidgetLayer.tsx:138`). Resizing persists exclusively on `handleResizeEnd` (`PageWidgetLayer.tsx:179`). Text inputs mutate local React state on change and persist to Supabase strictly on `onBlur` or `Enter`. Config cards persist strictly on form `handleSubmit`. |
| **D5** | **Supabase project region distance & latency**<br>*(Data)* | **Found** | `.env.local:1`<br>Project: `gzozoqqvyojpdrdajjkg` | **High**<br>(~260 ms warm RTT / 1,810 ms cold RTT) | Verified via Supabase MCP `get_project`: project is hosted in AWS Tokyo (`ap-northeast-1`). Measured TCP RTT from active client environment (India) is **208 ms – 298 ms** (avg ~260 ms). Cold TLS handshake is **1,810 ms**. Live Auth `signInWithPassword` takes **1,959 ms**. Physical latency floor multiplies the penalty of sequential waterfalls. |
| **D6** | **Missing database indexes on `month_id`, `widget_id`, and `book_id`**<br>*(Data)* | **Found** (`month_id`)<br>**Partially Found** (`widget_id`, `book_id`) | `supabase/migrations/0001_initial_schema.sql:91-103`<br>`supabase/migrations/0001_initial_schema.sql:33-89, 152-209` | **Medium-High**<br>(Table scans on `widgets`) | Live `pg_indexes` query confirms: `widgets` table has **ZERO secondary indexes** on `month_id` (foreign keys do not index automatically in Postgres). Every `SELECT * FROM widgets WHERE month_id = $1` and RLS policy evaluation forces a sequential table scan. `book_id` is indexed via compound unique key `(book_id, month)` in `months`. `widget_id` is indexed via compound unique key `(widget_id, day)` in `entries`. |
| **R1** | **Full-spread re-renders on single widget updates**<br>*(Rendering)* | **Found** | `components/book/OpenBook.tsx:82, 146-159`<br>`components/widgets/PageWidgetLayer.tsx:49-59`<br>`components/widgets/WidgetWrapper.tsx:49-59`<br>`store/entriesVersion.ts:21-24` | **High**<br>(Entire desktop spread re-renders; 5–7 passes) | `widgets` state is elevated to root `OpenBook`. Moving, resizing, or updating any single widget triggers `setWidgets`, generating fresh `leftWidgets` and `rightWidgets` arrays. `PageWidgetLayer`, `WidgetWrapper`, and child widgets lack `React.memo`. Furthermore, `useEntriesVersionStore` is an unpartitioned global counter (`version: 0`); saving an entry in one widget bumps `version` and causes all chart widgets across both pages to re-render. |
| **R2** | **Simultaneous rendering of all spread widgets including SVG charts**<br>*(Rendering)* | **Found** | `components/widgets/PageWidgetLayer.tsx:233-247`<br>`components/widgets/bar-chart/BarChartWidget.tsx:182-257`<br>`components/widgets/line-graph/LineGraphWidget.tsx:185-230`<br>`components/widgets/donut/DonutWidget.tsx:261-285` | **Medium**<br>(All SVGs recomputed per render) | Both left and right page layers mount all widgets simultaneously. Chart widgets render complex custom SVGs (hatching patterns, wobbly bezier paths, multi-segment donut arcs) which re-execute and re-allocate virtual DOM nodes on every spread re-render. |
| **R3** | **Chart jitter/wobble and data series recalculation on render**<br>*(Rendering)* | **Found** | `components/widgets/scatter-plot/ScatterPlotWidget.tsx:213-232`<br>`components/widgets/charts/chartUtils.ts:84-102`<br>`components/widgets/bar-chart/BarChartWidget.tsx:209-257` | **Medium**<br>(Trigonometric jitter & bar geometry in JSX) | In `ScatterPlotWidget.tsx:220`, `wobbleCircle(...)` runs inline inside the JSX `.map()` render loop without `useMemo` (26 trig jitter calculations per point across 31 potential days). In `BarChartWidget.tsx:209-257`, bar height/width, coordinate math, and hatching geometry are calculated inline on every render pass. Long tasks duration: **unmeasured**. |
| **R4** | **Heavy client components candidate for lazy loading**<br>*(Rendering)* | **Found** (Wizard, Drawer, Config)<br>**Not Found** (Print) | `components/setup/MonthSetupWizard.tsx`<br>`components/widgets/WidgetDrawer.tsx`<br>`components/widgets/WidgetConfigCard.tsx`<br>`components/book/OpenBook.tsx:6, 10, 11, 1046` | **High**<br>(520.6 KB main chunk; >940 KB total client JS) | `MonthSetupWizard.tsx` (854 lines, 35 KB), `WidgetDrawer.tsx` (233 lines + entire `registry.ts` with 14 widgets), and `WidgetConfigCard.tsx` (586 lines) are statically imported into `OpenBook.tsx`. Turbopack packs them into a single 520,562-byte client chunk (`3dtwbakvaf6mg.js`), delaying FCP/TTI. Print code is **Not Found** as a JS bottleneck (uses native `window.print()` and CSS `@media print`). |
| **A1** | **Page turn animations modifying layout-triggering properties**<br>*(Animation & Paint)* | **Not Found** | `app/globals.css:26-42, 104-110`<br>`components/book/OpenBook.tsx:705-741, 777-813` | **None**<br>(Compositor-only transforms) | `@keyframes pageFlipForward` and `@keyframes pageFlipBackward` exclusively mutate `transform: rotateY(...)`. Shadow overlays animate `opacity`. Neither `width`, `height`, `top`, nor `left` are animated during turns. |
| **A2** | **Expensive effects during page turns**<br>*(Animation & Paint)* | **Found** | `app/globals.css:104-126`<br>`components/paper/Paper.tsx:45-72, 93-97`<br>`components/book/OpenBook.tsx:579, 662, 705-741, 984, 1065` | **High**<br>(Compositor rasterization jank) | Missing `will-change: transform` and `will-change: opacity` across `.animate-page-flip-*`. 4 `<Paper>` instances render simultaneously during turns (Base Left, Base Right, Leaf Front, Leaf Back), each generating 2 layers of 2x2px repeating linear gradient grain plus radial dots. Heavy box shadows and drop-shadow filters on spine, ribbons, and casing run without GPU layer promotion hints (`transform-gpu`). Animation frame rate: **unmeasured**. |
| **A3** | **Late-loading fonts causing layout shifts (CLS) or blank text**<br>*(Animation & Paint)* | **Found** | `app/layout.tsx:6-18, 51`<br>`tailwind.config.ts:25-28`<br>`components/book/ClosedBook.tsx:224-388` | **Medium**<br>(Cover font loaded on all routes + cursive CLS) | `Cormorant_Garamond` loads 5 weights (`300`, `400`, `500`, `600`, `700`) globally in `RootLayout`, but is only used by `ClosedBook.tsx` (the cover). Every book route incurs redundant font downloads. `Kalam` uses `display: 'swap'` with unadjusted system `cursive` fallback in Tailwind, causing glyph reflow and CLS upon font swap. |
| **M1** | **`@dnd-kit` state updates on every pointer move across all widgets**<br>*(Arrange Mode)* | **Found** | `components/widgets/WidgetWrapper.tsx:83-95, 331-347`<br>`components/widgets/PageWidgetLayer.tsx:231-248` | **High**<br>(Active widget presentation tree re-renders per frame) | `useDraggable` dispatches `transform` updates on every pointer move frame. Because `WidgetWrapper` is unmemoized and wraps `<RenderComponent>`, dragging an active chart forces the entire presentation tree and its underlying SVG coordinate paths to re-render on every mouse movement tick. |
| **M2** | **Repetitive snapping/overlap calculations over entire widget list**<br>*(Arrange Mode)* | **Found** | `components/widgets/WidgetWrapper.tsx:227-234`<br>`components/widgets/PlacementOverlay.tsx:67-78`<br>`components/widgets/PageWidgetLayer.tsx:241` | **Medium**<br>(O(N) collision loops per raw mouse event) | During resize `pointermove`, `otherWidgets.some(hasOverlap)` loops through all siblings on raw mouse events. In `PlacementOverlay.tsx:67-78`, `findFittingSizeAt` runs an iterative shrinking loop testing `hasOverlap` against all widgets on every cursor hover position. `PageWidgetLayer` allocates a fresh array via `.filter()` per child on every render. |
| **M3** | **Repeated DOM measurement during drag/resize**<br>*(Arrange Mode)* | **Found** | `components/widgets/PlacementOverlay.tsx:80-92`<br>`components/widgets/WidgetWrapper.tsx:274-277, 294-297` | **High**<br>(Synchronous layout thrashing) | In `PlacementOverlay.tsx:82`, `e.currentTarget.getBoundingClientRect()` is called synchronously on **every single `pointermove` event**, forcing synchronous layout reflows. During resize, `WidgetWrapper` mutates inline layout styles (`left`, `top`, `width`, `height`) on every snapped grid tick rather than using CSS `transform` preview. |
| **O1** | **Service worker or cache settings causing stale/slow loads**<br>*(Other)* | **Found** | `app/sw.ts:32-57`<br>`scripts/build-sw.js:26-28`<br>`public/sw.js` | **Medium**<br>(3s timeout conflict & 149.5 KB unminified worker) | `/book/*` dynamic routes use `NetworkFirst` with `networkTimeoutSeconds: 3` and a 30-day cache. Because the live server waterfall takes **3,290 ms**, cold navigations trigger the 3-second timeout, causing the service worker to serve stale HTML or fallback prematurely. Immutable static chunks (`/_next/static/*`) use `StaleWhileRevalidate`, triggering redundant HTTP checks. `public/sw.js` is unminified (**149,451 bytes**) due to `minimize: false` in `scripts/build-sw.js:27`. |
| **O2** | **Repeatedly inlined SVGs vs large images**<br>*(Other)* | **Found** (SVGs)<br>**Not Found** (Images) | `components/widgets/*`<br>`components/book/OpenBook.tsx:480, 919`<br>`components/widgets/shared/DayStepper.tsx:80, 113` | **Low**<br>(58 inlined SVGs duplicated across components) | Exactly 58 inline `<svg>` blocks exist across TSX files (DayStepper arrows, delete icons, brass handles) duplicating path XML without shared symbols. Zero large raster images exist (pure CSS paper textures, icons total ~30 KB). |
| **O3** | **Console warnings / hydration errors & SSR bottleneck**<br>*(Other)* | **Not Found** (Console errors)<br>**Found** (2-pass SSR) | `components/book/OpenBook.tsx:107, 589-596`<br>`npm run build` | **High**<br>(Empty-desk 2-pass SSR blocks immediate paint) | Zero runtime console errors or hydration warnings. However, `isDesktop === null` initial state gates SSR rendering, causing the server to return an empty desk `<div>`. The client must hydrate, execute `useEffect`, evaluate `matchMedia`, and render the entire book from scratch on a second pass, severely degrading FCP and LCP. |
| **O4** | **Unnecessary dependencies vs Rule L3**<br>*(Other)* | **Found** | `package.json:11-21`<br>`store/entriesVersion.ts:14`<br>`components/widgets/WidgetWrapper.tsx:20` | **Low**<br>(Monolithic counter store + undeclared phantom dependency) | `zustand: "^5.0.2"` is actively imported in `store/entriesVersion.ts:14` and subscribed to across 8 files (`lib/offlineSync.ts`, `BarChartWidget.tsx`, `DonutWidget.tsx`, `entryHelpers.ts`, `GoalBarWidget.tsx`, `LineGraphWidget.tsx`, `ScatterPlotWidget.tsx`). While permitted by Rule L3, `useEntriesVersionStore` is an unpartitioned monolithic counter that invalidates all charts spread-wide (Finding R1). In `WidgetWrapper.tsx:20`, `@dnd-kit/utilities` is imported as an undeclared transitive phantom dependency solely for `CSS.Translate.toString(transform)`. |

---

## 2. Fix List in Priority Order

Every recommended fix strictly adheres to Locked Decisions L1 to L14 and requires ZERO packages outside Rule L3 (`zod`, `zustand`, `@dnd-kit/core`, `serwist`). Every external recommendation cites its official documentation reference.

### Fix 1: Eliminate Server Waterfalls via Authenticated Parallel Joins & Safe Month Defaults
- **Priority**: 1 (Critical)
- **Category**: Data & Latency
- **What Changes**:
  1. In `app/book/[year]/[month]/page.tsx`, structure the authentication and data retrieval sequence correctly:
     Authenticate first via `await supabase.auth.getUser()`; if `!user`, immediately `redirect('/')`.
     Once the user is verified, run previous month data fetching and current month data fetching concurrently in `Promise.all` using `user.id`:
     ```typescript
     const { data: { user } } = await supabase.auth.getUser()
     if (!user) redirect('/')

     const [prevMonthData, currentMonthData] = await Promise.all([
       getPreviousMonthData(year, month, user.id),
       getCurrentMonthData(year, month, user.id),
     ])
     ```
  2. Replace the 3-step sequential query waterfall (`books` -> `months` -> `widgets`) with a safe relational query. Do NOT use `months!inner`, which returns `book: null` if a row does not yet exist in `months` (such as on an un-setup month like `/book/2026/12`). Instead, use a left join or query `months` safely with fallback defaults:
     ```typescript
     const { data: book } = await supabase
       .from('books')
       .select(`
         id,
         months (
           id,
           month,
           setup_done,
           paper_left,
           paper_right,
           setup_config,
           widgets (
             id, month_id, page, type, x, y, w, h, config, z, created_at
           )
         )
       `)
       .eq('user_id', user.id)
       .eq('year', year)
       .eq('months.month', month)
       .maybeSingle()
     ```
     If `book` exists but `book.months` is empty or missing, safely default `setupDone = false`, `paperLeft = 'dotted'`, `paperRight = 'dotted'`, `setupConfig = {}`, and `initialWidgets = []`, guaranteeing that the Month Setup Wizard launches cleanly per Rule L9 without throwing null book errors.
  3. Guarantee `created_at ASC` sorting on widgets: sort returned child widgets ascending by `created_at` (`widgets.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())` or via PostgREST embedded ordering `widgets(*, order=created_at.asc)`) before partitioning into `leftWidgets` and `rightWidgets` to preserve exact widget z-index and placement stacking order.
  4. Batch initial widget entries in a single server query (`supabase.from('entries').select('*').in('widget_id', widgetIds)`) and pass to `OpenBook` as `initialEntries`, completely eliminating client-side sequential HTTP server actions.
  5. Deduplicate `supabase.auth.getUser()` in `setupActions.ts` by accepting `userId: string` in `getPreviousMonthData(year, month, userId)` instead of issuing a redundant network round-trip.
- **Affected Files**:
  - `app/book/[year]/[month]/page.tsx:46-129`
  - `components/setup/setupActions.ts:37-85`
  - `components/book/OpenBook.tsx:82-95`
  - `components/widgets/entryHelpers.ts:37-97`
- **Expected Gain**: Eliminates 6 sequential round trips on the server and N round trips on client mount. Server waterfall drops from **3,290 ms to < 500 ms**; client entry waterfall drops from **1,131 ms to 0 ms**. Total navigation time reduced by **~3.9 seconds**.
- **Risk of Visual Change**: None. Transports identical database records to existing components.
- **Test Method**: Inspect server execution timer on `/book/2026/11` and un-setup month `/book/2026/12`. Verify RSC streaming begins in < 500 ms. Confirm all 3 seeded widgets render with their 16 entries on initial HTML without secondary client entry fetching spinners on `/book/2026/11`, and confirm Month Setup Wizard mounts cleanly on `/book/2026/12`.
- **Official Documentation**:
  - Next.js Parallel Data Fetching: [https://nextjs.org/docs/app/building-your-application/data-fetching/patterns#parallel-data-fetching](https://nextjs.org/docs/app/building-your-application/data-fetching/patterns#parallel-data-fetching)
  - Supabase Joins and Nested Tables: [https://supabase.com/docs/guides/database/joins-and-nested-tables](https://supabase.com/docs/guides/database/joins-and-nested-tables)

---

### Fix 2: Implement Adjacent Month Prefetching & Pointerdown Tab Prefetch
- **Priority**: 2 (Critical)
- **Category**: Page Turn Latency
- **What Changes**:
  1. In `components/book/OpenBook.tsx` and `components/book/MobileBook.tsx`, add an idle `useEffect` that calls `router.prefetch` for adjacent months (`month - 1` and `month + 1`):
     ```typescript
     useEffect(() => {
       const prev = getPrevDate(year, month)
       const next = getNextDate(year, month)
       router.prefetch(`/book/${prev.year}/${prev.month}`)
       router.prefetch(`/book/${next.year}/${next.month}`)
     }, [year, month, router])
     ```
  2. Add `onPointerDown` and `onMouseEnter` prefetch triggers to month edge tabs (`OpenBook.tsx:1001`):
     ```typescript
     onPointerDown={() => router.prefetch(`/book/${year}/${tabMonth}`)}
     ```
- **Affected Files**:
  - `components/book/OpenBook.tsx:384-413, 1001-1015`
  - `components/book/MobileBook.tsx:131-155, 362-434`
- **Expected Gain**: Adjacent month RSC payloads are warmed in the client router cache during the 600 ms turn animation. Page transitions appear instantaneous upon animation completion.
- **Risk of Visual Change**: None. Purely warms the router cache in background idle time.
- **Test Method**: Navigate to `/book/2026/11`. Inspect browser Network tab to verify `/book/2026/10` and `/book/2026/12` RSC chunks are fetched with `Priority: Low`. Click folded corner or folios; verify instant page swap at 600 ms mark.
- **Official Documentation**:
  - Next.js `useRouter.prefetch`: [https://nextjs.org/docs/app/api-reference/functions/use-router#userouter](https://nextjs.org/docs/app/api-reference/functions/use-router#userouter)
  - Next.js Linking and Navigating: [https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating#2-prefetching](https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating#2-prefetching)

---

### Fix 3: Instant Optimistic Widget Placement via Client-Generated Permanent UUID
- **Priority**: 3 (High)
- **Category**: Widget Placement Latency
- **What Changes**:
  1. In `OpenBook.tsx:handlePlaceWidget`, generate a permanent UUID (`const widgetId = crypto.randomUUID()`), construct the `WidgetData` record with `id: widgetId`, and synchronously append it to `widgets` state, dismiss the placement overlay, close the drawer, and activate arrange mode in the immediate screen refresh frame (< 16 ms):
     ```typescript
     const widgetId = crypto.randomUUID()
     const optimisticWidget: WidgetData = {
       id: widgetId,
       month_id: currentMonthId,
       page: targetPage,
       type: defToPlace.id,
       x, y,
       w: w ?? defToPlace.defaultSize.w,
       h: h ?? defToPlace.defaultSize.h,
       config: {},
       z: 0,
       created_at: new Date().toISOString(),
     }
     setWidgets((prev) => [...prev, optimisticWidget])
     setPickedWidgetDef(null)
     setActivePlacement(null)
     setIsDrawerOpen(false)
     setIsArrangeMode(true)
     ```
  2. Update `createWidget` in `components/widgets/widgetActions.ts` to accept `id: widgetId` directly and include it in the Postgres insert statement:
     ```typescript
     export async function createWidget(
       monthId: string,
       page: PageSide,
       type: string,
       x: number,
       y: number,
       w?: number,
       h?: number,
       id?: string,
     ): Promise<ActionResult<WidgetData>> {
       // ...
       const { data: inserted, error: insertError } = await supabase
         .from('widgets')
         .insert({
           id: id ?? crypto.randomUUID(),
           month_id: monthId,
           page,
           type,
           x,
           y,
           w: candidateW,
           h: candidateH,
         })
         .select()
         .single()
     ```
     Because the Postgres schema defines `id uuid primary key default gen_random_uuid()` (`supabase/migrations/0001_initial_schema.sql:92`), supplying `id` explicitly causes Postgres to accept the client-generated UUID as the permanent database primary key.
  3. This completely eliminates temporary ID swapping, avoiding 404/PGRST116 race conditions if the user immediately drags, resizes, or deletes the widget while the background network insertion is in flight. It also prevents `@dnd-kit` identity churn or dropped pointer capture.
  4. If the background `createWidget` promise fails, cleanly rollback `widgets` state by removing `widgetId` from the array and display an error notification banner.
- **Affected Files**:
  - `components/book/OpenBook.tsx:200-230`
  - `components/widgets/widgetActions.ts:249-337`
  - `components/book/OpenBook.tsx:311-337`
- **Expected Gain**: Widget placement response time drops from **1,018 ms blocking wait to < 16 ms** instant tactile placement on the dotted paper grid, with zero race conditions on immediate post-placement manipulation.
- **Risk of Visual Change**: None. The placed widget footprint and appearance are identical, appearing instantly rather than after a network delay.
- **Test Method**: Open catalogue drawer on December 2026 (`/book/2026/12`). Pick any widget. Click on paper. Verify widget mounts into arrange mode on the very next screen refresh frame (< 16 ms). Immediately drag the newly placed widget within 100 ms; confirm position persists cleanly with zero 404 or missing widget errors.
- **Official Documentation**:
  - React Optimistic UI: [https://react.dev/reference/react/useOptimistic](https://react.dev/reference/react/useOptimistic)

---

### Fix 4: Add Missing Foreign Key Database Index on `widgets(month_id)`
- **Priority**: 4 (High)
- **Category**: Database Architecture
- **What Changes**:
  1. Create a migration file `supabase/migrations/0002_add_widgets_month_id_index.sql`:
     ```sql
     CREATE INDEX IF NOT EXISTS idx_widgets_month_id ON public.widgets (month_id);
     ```
  2. Applies B-tree indexing to `widgets.month_id`, matching existing indexes on `months(book_id, month)` and `entries(widget_id, day)`.
- **Affected Files**:
  - `supabase/migrations/0002_add_widgets_month_id_index.sql` (new migration)
- **Expected Gain**: Replaces $O(N)$ sequential table scans on `widgets` with $O(\log N)$ B-tree index lookups on all month views, widget placement sibling checks, and RLS existence queries.
- **Risk of Visual Change**: None. Purely internal database optimization.
- **Test Method**: Query `pg_indexes` on Supabase to verify `idx_widgets_month_id` exists. Run `EXPLAIN ANALYZE SELECT * FROM widgets WHERE month_id = '...'` to confirm index scan execution.
- **Official Documentation**:
  - Supabase Database Indexes: [https://supabase.com/docs/guides/database/postgres/indexes](https://supabase.com/docs/guides/database/postgres/indexes)

---

### Fix 5: Code Splitting & Dynamic Imports for Modal & Drawer Components
- **Priority**: 5 (High)
- **Category**: Client Bundle Size & Initial Load
- **What Changes**:
  1. Replace static imports of `MonthSetupWizard`, `WidgetDrawer`, and `WidgetConfigCard` in `OpenBook.tsx` with `next/dynamic`:
     ```typescript
     import dynamic from 'next/dynamic'
     const MonthSetupWizard = dynamic(
       () => import('@/components/setup/MonthSetupWizard').then((m) => m.MonthSetupWizard),
       { ssr: false }
     )
     const WidgetDrawer = dynamic(
       () => import('@/components/widgets/WidgetDrawer').then((m) => m.WidgetDrawer),
       { ssr: false }
     )
     const WidgetConfigCard = dynamic(
       () => import('@/components/widgets/WidgetConfigCard').then((m) => m.WidgetConfigCard),
       { ssr: false }
     )
     ```
  2. Components and the heavy 14-widget registry are split into separate async on-demand chunks.
- **Affected Files**:
  - `components/book/OpenBook.tsx:6, 10, 11`
- **Expected Gain**: Drops main route client chunk (`3dtwbakvaf6mg.js`) from **520.6 KB to ~260 KB** (a ~50% reduction). Reduces initial parse/compile time on main thread.
- **Risk of Visual Change**: None. Drawer and Config card render identically when toggled open.
- **Test Method**: Run `npm run build`. Inspect `.next/static/chunks` to verify main route chunk size is reduced to < 270 KB and separate async chunks are generated for setup wizard, drawer, and config card.
- **Official Documentation**:
  - Next.js Lazy Loading: [https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)

---

### Fix 6: Eliminate Layout Thrashing & Pointer Move Overhead in Arrange Mode
- **Priority**: 6 (High)
- **Category**: Arrange Mode Responsiveness
- **What Changes**:
  1. In `components/widgets/PlacementOverlay.tsx:80-92`, cache the overlay bounding client rect on `pointerenter`/`pointerdown` instead of calling `e.currentTarget.getBoundingClientRect()` inside `handlePointerMove`.
  2. In `components/widgets/WidgetWrapper.tsx:49`, wrap `WidgetWrapper` in `React.memo` with a custom comparison function checking `id`, `x`, `y`, `w`, `h`, `isArrangeMode`, and `config`.
  3. Wrap child widget presentation components (`BarChartDesktop`, `DonutDesktop`, etc.) in `React.memo`.
  4. During live resizing, do NOT apply CSS `scale` transforms, which stretch handwritten Kalam glyphs, distort SVG stroke widths (1.4px dots, wobbly axes, hatching lines), and desynchronize inner elements from the 22px dotted grid (violating Rules L1, L4, L5, L7, L10). Instead, preview resizing strictly using discrete 22px grid steps (`GRID_PX = 22`) via snapped `liveW`/`liveH` or by previewing only the outer dashed bounding box (`border-dashed border-ink/40`) while keeping the inner widget component static until pointer release.
- **Affected Files**:
  - `components/widgets/PlacementOverlay.tsx:80-92`
  - `components/widgets/WidgetWrapper.tsx:49-65, 274-298`
  - `components/widgets/PageWidgetLayer.tsx:49-59, 233-247`
- **Expected Gain**: Completely eliminates synchronous layout thrashing during placement cursor movements. Prevents active and inactive widgets from re-rendering their entire SVG presentation trees on every mouse move frame.
- **Risk of Visual Change**: None. Snapping footprint and resize handles remain pixel-exact to 22px grid rules.
- **Test Method**: Open Arrange mode on `/book/2026/11`. Move mouse rapidly across page with placement card active. Verify zero layout reflow warnings and fluid 60fps cursor tracking.
- **Official Documentation**:
  - Web.dev Avoid Layout Thrashing: [https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing](https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing)
  - React Memoization: [https://react.dev/reference/react/memo](https://react.dev/reference/react/memo)

---

### Fix 7: Hardware Acceleration Hints & Texture Layer Compositing for 3D Page Turns
- **Priority**: 7 (High)
- **Category**: Animation & Paint
- **What Changes**:
  1. In `app/globals.css:104-126`, add `will-change: transform; transform: translateZ(0);` to `.animate-page-flip-forward` and `.animate-page-flip-backward`.
  2. Add `will-change: opacity` to shadow overlay animation classes (`.animate-leaf-shadow-*`, `.animate-shadow-under-*`).
  3. In `components/book/OpenBook.tsx:705-741`, apply `transform-gpu` to the turning leaf container (`leafRef`).
  4. Do NOT dynamically disable or toggle casing shadows or ribbon drop-shadow filters during turns, which causes an abrupt visual pop/flicker at frame 0 and frame 600 ms, violating Rule L1. Instead, apply permanent GPU compositor layer promotion (`transform: translateZ(0)`, `transform-gpu`, and `will-change: transform`) to the casing container (`OpenBook.tsx:579`) and ribbon bookmark (`OpenBook.tsx:1065`). This prompts the browser compositor to cache the rasterized casing and ribbon drop-shadows in dedicated GPU texture tiles, eliminating per-frame software rasterization during turns without any visual compromise.
- **Affected Files**:
  - `app/globals.css:104-126`
  - `components/book/OpenBook.tsx:676-742, 1065`
- **Expected Gain**: Promotes turning leaf and shadow layers to dedicated GPU compositor layers before the 600 ms animation begins, eliminating per-frame rasterization of the 2x2px repeating diagonal grain and radial dots.
- **Risk of Visual Change**: None. The 3D flip animation curve, timing, shadows, and textures remain identical.
- **Test Method**: Trigger 10 forward and backward page turns on desktop and mobile. Inspect browser rendering in Performance panel to confirm zero paint/layout events during the 600 ms transform window.
- **Official Documentation**:
  - Web.dev Stick to Compositor-Only Properties: [https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count](https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count)
  - MDN `will-change`: [https://developer.mozilla.org/en-US/docs/Web/CSS/will-change](https://developer.mozilla.org/en-US/docs/Web/CSS/will-change)

---

### Fix 8: Optimize Desk Placeholder Paint & Preserve Correction 7 Single-Tree Invariant
- **Priority**: 8 (Medium-High)
- **Category**: Rendering & Core Web Vitals
- **What Changes**:
  1. Respect the locked **Correction 7** invariant in `PROJECT_STATE.md:175`. Do NOT mount duplicate desktop and mobile trees simultaneously in HTML (`hidden md:flex` / `flex md:hidden`), as this mounts duplicate `@dnd-kit` drag sensors, duplicate widget instances, duplicate audio elements, and triggers React 19 hydration mismatch warnings on mobile devices.
  2. Maintain the single responsive tree determined by `matchMedia('(min-width: 768px)')`.
  3. Optimize the initial desk placeholder `<div>` rendered during hydration (`isDesktop === null` in `components/book/OpenBook.tsx:589-596`): apply inline desk background color `#211b16`, fixed viewport bounds (`w-full min-h-screen`), and CSS containment (`contain: paint layout`) so the initial server paint is instantaneous (< 16 ms) without layout thrashing.
  4. Ensure `useEffect` runs synchronously on mount to evaluate `window.matchMedia('(min-width: 768px)')` and mount the appropriate single tree (`OpenBook` on desktop >= 768px, `MobileBook` on mobile < 768px) in the very first client paint tick, with non-blocking hydration and retained state across viewport resizes.
- **Affected Files**:
  - `components/book/OpenBook.tsx:107, 589-596`
- **Expected Gain**: Preserves clean single-tree DOM architecture, prevents sensor collisions and hydration warnings, and eliminates visual flash on desk container paint.
- **Risk of Visual Change**: None. Strictly conforms with locked Correction 7 invariant.
- **Test Method**: Inspect DOM in browser React DevTools. Verify exactly one book tree mounts (`OpenBook` on desktop >= 768px, `MobileBook` on mobile < 768px). Confirm zero hydration mismatch errors in console.
- **Official Documentation**:
  - React Hydration Architecture: [https://react.dev/reference/react-dom/client/hydrateRoot#handling-different-client-and-server-content](https://react.dev/reference/react-dom/client/hydrateRoot#handling-different-client-and-server-content)

---

### Fix 9: Font Optimization & Fallback Metric Overrides
- **Priority**: 9 (Medium)
- **Category**: Network & Layout Shifts (CLS)
- **What Changes**:
  1. In `app/layout.tsx:13-18`, remove global loading of `Cormorant_Garamond` (5 weights) from `RootLayout`. Move it directly to `app/page.tsx` or `components/book/ClosedBook.tsx` where the cover is rendered.
  2. In `app/layout.tsx:6-12` and `tailwind.config.ts:25-28`, configure font metric overrides (`adjustFontFallback`) on `Kalam` to match system fallback cursive metrics, preventing text jumps when the handwriting font swaps in.
- **Affected Files**:
  - `app/layout.tsx:6-18, 51`
  - `tailwind.config.ts:25-28`
  - `components/book/ClosedBook.tsx:224-388`
- **Expected Gain**: Saves 5 font file requests on all `/book/*` routes. Eliminates Cumulative Layout Shift (CLS) on initial text rendering.
- **Risk of Visual Change**: None. Cover retains Cormorant Garamond; notebook pages retain Kalam handwriting.
- **Test Method**: Inspect Network tab on `/book/2026/11` to confirm zero Cormorant Garamond font requests. Observe text rendering with slow network throttling; verify zero layout jump when Kalam swaps.
- **Official Documentation**:
  - Next.js Font Optimization: [https://nextjs.org/docs/app/building-your-application/optimizing/fonts](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
  - Web.dev Font Best Practices: [https://web.dev/articles/font-best-practices](https://web.dev/articles/font-best-practices)

---

### Fix 10: Service Worker Caching & Build Minification
- **Priority**: 10 (Medium)
- **Category**: PWA & Offline Caching
- **What Changes**:
  1. In `app/sw.ts:32-45`, increase `networkTimeoutSeconds` for dynamic book routes from 3 seconds to 5 seconds (or adjust to `CacheFirst` once adjacent month prefetching is active).
  2. In `app/sw.ts:48-57`, switch immutable Next.js static chunks (`/_next/static/*`) from `StaleWhileRevalidate` to `CacheFirst`.
  3. In `scripts/build-sw.js:27`, change `optimization: { minimize: false }` to `minimize: true`.
- **Affected Files**:
  - `app/sw.ts:32-57`
  - `scripts/build-sw.js:26-28`
- **Expected Gain**: Prevents service worker from timing out and serving stale data during network delays. Reduces `public/sw.js` bundle size from **149,451 bytes (~150 KB) to ~45 KB**. Eliminates redundant HTTP checks on immutable Next.js static assets.
- **Risk of Visual Change**: None.
- **Test Method**: Run `npm run build`. Verify output `sw.js` file size is ~45 KB. Verify service worker caches static assets with `CacheFirst`.
- **Official Documentation**:
  - Web.dev Offline Cookbook: [https://web.dev/articles/offline-cookbook](https://web.dev/articles/offline-cookbook)
  - Next.js Caching: [https://nextjs.org/docs/app/building-your-application/caching](https://nextjs.org/docs/app/building-your-application/caching)

---

### Fix 11: SVG Chart Trigonometric Memoization & Partitioned Zustand Store
- **Priority**: 11 (Medium)
- **Category**: Rendering Efficiency
- **What Changes**:
  1. In `ScatterPlotWidget.tsx:213-232`, wrap dot coordinate math and `wobbleCircle` path generation inside `useMemo` keyed by the dataset and plot dimensions:
     ```typescript
     const renderedDots = useMemo(() => {
       return matchedPoints.map((pt, i) => ({
         day: pt.day,
         d: wobbleCircle(computeCx(pt.x), computeCy(pt.y), 2.8, seed + i * 7),
       }))
     }, [matchedPoints, minX, maxX, minY, maxY, plotW, plotH, seed])
     ```
  2. In `BarChartWidget.tsx:209-257`, wrap daily bar heights, positions, and hatching lines inside `useMemo`.
  3. In `store/entriesVersion.ts:21-24`, partition the entries store by `widgetId` (`Record<string, number>`) so bumping entry versions only invalidates charts subscribed to that specific source widget.
- **Affected Files**:
  - `components/widgets/scatter-plot/ScatterPlotWidget.tsx:213-232`
  - `components/widgets/bar-chart/BarChartWidget.tsx:209-257`
  - `store/entriesVersion.ts:21-24`
- **Expected Gain**: Eliminates hundreds of redundant trigonometric calculations (`Math.sin`, `Math.cos`) per render pass. Prevents spread-wide chart re-renders when saving entries in unrelated widgets.
- **Risk of Visual Change**: None. Hand-drawn wobbly paths and bar geometry remain visually identical.
- **Test Method**: Edit an entry in Number Log on `/book/2026/11`. Using React DevTools Profiler, confirm that only the sleep score Number Log and dependent Bar Chart re-render; Habit Tracker and other widgets do not re-render.
- **Official Documentation**:
  - React `useMemo`: [https://react.dev/reference/react/useMemo](https://react.dev/reference/react/useMemo)

---

### Fix 12: Dependency Cleanup & Phantom Import Replacement
- **Priority**: 12 (Low)
- **Category**: Dependency Hygiene & L3 Rule Compliance
- **What Changes**:
  1. In `components/widgets/WidgetWrapper.tsx:20`, remove the undeclared phantom import `import { CSS } from '@dnd-kit/utilities'`. Replace with an inline translation template string:
     ```typescript
     const dndStyle = transform
       ? {
           transform: `translate3d(${Math.round(transform.x)}px, ${Math.round(transform.y)}px, 0)`,
           zIndex: 50,
         }
       : undefined
     ```
  2. Retain `zustand` in `package.json`. `zustand` is explicitly permitted by Locked Decision L3, is actively imported in `store/entriesVersion.ts:14`, and is required for the partitioned widget reactive store in Fix 11. Do NOT delete `zustand` from `package.json`.
- **Affected Files**:
  - `components/widgets/WidgetWrapper.tsx:20, 280-285`
- **Expected Gain**: Eliminates undeclared transitive dependency reliance on `@dnd-kit/utilities`, preventing build breakage if `@dnd-kit/core` changes its internal packaging or hoisting rules, while preserving `zustand` for state partitioning.
- **Risk of Visual Change**: None.
- **Test Method**: Run `npm run build` and verify TypeScript compilation passes cleanly without `@dnd-kit/utilities`.
- **Official Documentation**:
  - `@dnd-kit/core` Draggable Documentation: [https://docs.dndkit.com/api-documentation/draggable](https://docs.dndkit.com/api-documentation/draggable)

---

## 3. Grouped Tasks

The 12 fixes are organized into 7 focused, standalone tasks containing 1 to 3 related fixes each. They are strictly sequenced so the highest-impact wins for page turns and widget placement come first.

---

### Task 1: Server Data Consolidation & Relational Joins (Highest Page Turn Win)
- **Fixes Included**: Fix 1 (Server Waterfall & Entries Prefetch) + Fix 4 (Database Index on `widgets(month_id)`)
- **Objective**: Eliminate the 3.3-second server waterfall and the missing index table scan on every month load.
- **Standalone Task Prompt**:
  > In `app/book/[year]/[month]/page.tsx` and `components/setup/setupActions.ts`, implement authenticated parallel fetching: await `supabase.auth.getUser()` first and guard with `redirect('/')` if unauthenticated. Then run `Promise.all([ getPreviousMonthData(year, month, user.id), getCurrentMonthData(year, month, user.id) ])`. In the database query, use a safe relational query without `!inner` join, defaulting `setup_done = false` and `widgets = []` if the month is uninitialized so the Month Setup Wizard launches cleanly per Rule L9. Sort widgets ascending by `created_at` (`created_at ASC`) to guarantee exact z-index/stacking order. Batch fetch widget entries in one server query and pass as `initialEntries`. Add a migration for `CREATE INDEX idx_widgets_month_id ON widgets(month_id)`. Maintain strict compliance with rules L1 to L14; zero visual or schema-breaking changes.

---

### Task 2: Page Turn Prefetching & Service Worker Timeout Alignment
- **Fixes Included**: Fix 2 (Adjacent Month Prefetching) + Fix 10 (Service Worker Route Caching & Minification)
- **Objective**: Ensure adjacent month payloads are warm in the Next.js router cache before the turn animation completes, and prevent service worker timeout aborts.
- **Standalone Task Prompt**:
  > In `components/book/OpenBook.tsx` and `components/book/MobileBook.tsx`, implement idle prefetching (`router.prefetch`) for adjacent months (`month - 1` and `month + 1`) and month tab hover/pointerdown. In `app/sw.ts`, adjust dynamic book route timeout to 5s, switch static chunks to `CacheFirst`, and enable `minimize: true` in `scripts/build-sw.js`. Ensure 3D turn animations transition immediately into warm cache.

---

### Task 3: Instant Tactile Widget Placement & Placement Overlay Caching
- **Fixes Included**: Fix 3 (Optimistic Widget Placement via Permanent UUID) + Fix 6 (PlacementOverlay Caching & Discrete Grid Resize)
- **Objective**: Provide instantaneous (< 16 ms) tactile feedback when stamping a widget onto dotted paper, eliminate 404 race conditions during immediate interactions, and eliminate synchronous layout thrashing.
- **Standalone Task Prompt**:
  > In `components/book/OpenBook.tsx:handlePlaceWidget`, implement optimistic widget placement by generating a permanent client UUID (`const widgetId = crypto.randomUUID()`), synchronously appending the widget to `widgets` state, dismissing placement overlays, closing the drawer, and activating arrange mode on the immediate refresh frame (< 16 ms). Update `createWidget` in `components/widgets/widgetActions.ts` to accept and persist this UUID directly as the row primary key in Postgres, eliminating temporary ID swapping and avoiding 404 race conditions during immediate drag/resize/delete actions. In `components/widgets/PlacementOverlay.tsx`, cache the overlay bounding rect on enter/down to eliminate layout thrashing. In arrange mode resizing, preview dimensions strictly using discrete 22px grid steps (`liveW`/`liveH`) or bounding box preview, never using CSS `scale` transforms.

---

### Task 4: Client Bundle Code Splitting via Dynamic Imports
- **Fixes Included**: Fix 5 (Dynamic Imports for Setup Wizard, Drawer, and Config Card)
- **Objective**: Cut the main route JavaScript client bundle in half (from 520 KB to ~260 KB) by splitting modal and drawer components.
- **Standalone Task Prompt**:
  > In `components/book/OpenBook.tsx`, dynamically import `MonthSetupWizard`, `WidgetDrawer`, and `WidgetConfigCard` using Next.js `next/dynamic` with `{ ssr: false }`. Verify that the main client chunk drops from ~520 KB to under 270 KB in `npm run build` while preserving instant drawer and config interactions when triggered.

---

### Task 5: 3D Page Turn Hardware Acceleration & Texture Compositing
- **Fixes Included**: Fix 7 (GPU Layer Promotion for 3D Page Turn & Shadows)
- **Objective**: Prevent frame drops and rasterization jank during the 600 ms CSS 3D page flip across the 4 paper texture layers without visual flicker.
- **Standalone Task Prompt**:
  > In `app/globals.css` and `components/book/OpenBook.tsx`, add `will-change: transform; transform: translateZ(0);` and `transform-gpu` to `.animate-page-flip-*` and the turning leaf element. Add `will-change: opacity` to leaf and base shadows. Apply permanent GPU layer promotion (`transform: translateZ(0)`, `transform-gpu`, `will-change: transform`) to the background casing container and ribbon bookmark elements. Do NOT dynamically disable or toggle shadows during page turns, preventing visual flicker or popping while eliminating software rasterization jank across the 4 paper texture layers.

---

### Task 6: Preserve Single-Tree Responsive Architecture & Scoped Font Loading
- **Fixes Included**: Fix 8 (Preserve Correction 7 Single-Tree Invariant & Desk Paint) + Fix 9 (Cover-Only Cormorant Garamond & Kalam Metric Overrides)
- **Objective**: Preserve single-tree DOM layout without duplicate `@dnd-kit` sensors or hydration mismatch, optimize initial desk paint, and eliminate redundant font downloads and layout shifts.
- **Standalone Task Prompt**:
  > Strictly preserve the locked Correction 7 invariant in `PROJECT_STATE.md:175`: do NOT mount duplicate desktop and mobile component trees in HTML (`hidden md:flex` / `flex md:hidden`), preventing duplicate `@dnd-kit` sensors, audio conflicts, and mobile hydration mismatches. Maintain the single responsive tree gated by `matchMedia('(min-width: 768px)')`. In `components/book/OpenBook.tsx`, optimize the hydration desk placeholder `<div>` with inline `#211b16` styling, viewport bounds, and CSS containment for an instantaneous first paint. In `app/layout.tsx`, scope `Cormorant_Garamond` exclusively to the cover (`ClosedBook.tsx`), and configure font metric overrides on `Kalam` to prevent Cumulative Layout Shift (CLS) on font swap.

---

### Task 7: Arrange Mode Re-render Isolation & Dependency Hygiene
- **Fixes Included**: Fix 11 (Chart Jitter Memoization & Store Partitioning) + Fix 12 (Replace Phantom `@dnd-kit/utilities` Import)
- **Objective**: Prevent full-spread re-renders and trigonometric re-calculations during arrange mode interactions and entry edits, while ensuring strict dependency hygiene.
- **Standalone Task Prompt**:
  > Wrap `WidgetWrapper` and desktop widget renderers in `React.memo`. In `ScatterPlotWidget.tsx` and `BarChartWidget.tsx`, wrap `wobbleCircle` and bar coordinate calculations in `useMemo`. Retain `zustand` as explicitly permitted by Rule L3 and partition `store/entriesVersion.ts` by widget ID so entry edits only invalidate subscribed charts. In `WidgetWrapper.tsx`, remove the undeclared `@dnd-kit/utilities` phantom import and replace it with an inline `translate3d` template string. Verify zero packages outside Rule L3.

---

## 4. "Must Not Change" List

All proposed optimizations are internal architectural, data-flow, and execution enhancements. The following aspects of "Memorable Moments" are strictly locked and **MUST NOT CHANGE**:

1. **Book, Not Website (L1)**: No navigation bars, headers, footers, sidebars, dashboard metric cards, SaaS modal dialogs, or scrolling containers inside any page. Navigation remains strictly via the fabric bookmark ribbon, paper month edge tabs, dog-eared folded corners, and folio page turns.
2. **Tech Stack Boundaries (L2, L3)**: Strictly Next.js App Router, TypeScript, Tailwind CSS, and Supabase (Auth + Postgres + RLS). Allowed packages strictly limited to `zod`, `zustand`, `@dnd-kit/core`, and `serwist`. Zero UI component libraries (no shadcn, MUI, Chakra, Radix).
3. **Hand-Drawn Look SVG Charts (L4)**: All graphs (LineGraph, BarChart, ScatterPlot, Donut, GoalBar) must retain custom hand-drawn SVG rendering with subtle wobbly paths, diagonal hatching, and hand-lettered labels. Zero third-party chart libraries.
4. **Strict Typography (L5)**: Only `Kalam` for all interior handwriting, labels, and numbers; only `Cormorant Garamond` for the closed book cover title and debossed spine. Zero other fonts.
5. **Exact Master Palette (L6)**: Only the 9 locked hex colors:
   - Desk background: `#211b16`
   - Paper surface: `#f4eddc`
   - Ink text/strokes: `#1c2433`
   - Red pen accents: `#b3261e`
   - Yellow highlighter: `#ffd84a`
   - Oxblood leather: `#702028`
   - Brass/gold hardware: `#d8b45a`
   - Kraft cardboard: `#b9895a`
   - Orange ribbon/tabs: `#ff5a1f`
6. **Paper Texture & Grid Geometry (L7)**: Dotted paper default (22px grid with 1.4px dots), squared, lined, and blank options. Repeating sub-pixel diagonal paper grain textures must remain visually identical.
7. **Two-Page Desktop / Single-Page Mobile (L8)**: Desktop (`>= 768px`) displays the tactile two-page open notebook spread side by side; mobile (`< 768px`) displays a single page with identical data and edge navigation.
8. **Month Setup Wizard (L9)**: Every fresh month must begin with the uncompleted setup wizard state. The 4-step setup flow remains unchanged.
9. **Grid Snapping Placement (L10)**: All widgets must be placed exclusively via the Card Catalogue Drawer and snap strictly to the 22px grid.
10. **Row Level Security (L11)**: Supabase RLS policies and user data isolation must remain completely intact. Users never access another reader's book.
11. **Custom CSS 3D Page Turn (L12)**: The 3D flip animation must retain its 600 ms duration, cubic-bezier timing curve, realistic page curvature perspective, and dynamic leaf/base shadow overlays. Zero flip-book libraries.
12. **Hand-Drawn SVG Iconography (L13)**: No emojis anywhere in the interface. All icons (weather, mood, arrows, brass pull, book ribbon) remain custom hand-drawn SVG strokes.
13. **Scope Discipline (L14)**: No unrequested features, redesigns, component renames, or new package dependencies.

---

## 5. Before/After Manual Test Checklist

Execute these exact manual verification steps in production mode (`npm run build && npm start`) on both **Desktop (1440×900)** and **Mobile (390×844)** viewports using test account `newuser@gmail.com`:

### Test Step 1: Sequential Page Turns (10 Page Turns)
- **Action**: From `/book/2026/11`, turn 10 pages forward and backward using folios, folded corners, and keyboard arrow keys (`ArrowRight`, `ArrowLeft`).
- **Before Optimization (Baseline)**:
  - 8-query sequential server waterfall takes **3,290 ms** on each new month transition.
  - 600 ms 3D turn animation completes, followed by a noticeable blank stall or fallback while the server compiles RSC payload.
  - Service worker 3-second timeout triggers intermittently during network lag.
  - Four concurrent `<Paper>` layers cause frame rasterization drops during 3D transform.
- **After Optimization (Target)**:
  - Adjacent month RSC payload is pre-warmed via `router.prefetch` during the 600 ms turn animation.
  - Page turns transition seamlessly at the 600 ms mark with zero post-turn stall.
  - GPU compositor layer promotion (`will-change: transform`, `transform-gpu`) delivers fluid 60fps animation without frame drops.
  - Verified on: Desktop 1440×900 (`[ ] Pass [ ] Fail`) | Mobile 390×844 (`[ ] Pass [ ] Fail`).

### Test Step 2: Month Tab Navigation (5 Month Tabs)
- **Action**: Click 5 distinct month edge tabs (e.g. October, November, December, January, February).
- **Before Optimization (Baseline)**:
  - Uncached month request triggers full 3.3s server waterfall + 1.1s client entry queries.
  - Entire screen re-renders across 5–7 passes.
- **After Optimization (Target)**:
  - Tab `onPointerDown`/`onMouseEnter` triggers prefetch; server response is consolidated into a single nested join query (< 500 ms).
  - Page loads with all widget entries pre-populated in initial server payload.
  - Verified on: Desktop 1440×900 (`[ ] Pass [ ] Fail`) | Mobile 390×844 (`[ ] Pass [ ] Fail`).

### Test Step 3: Widget Placement from Drawer (3 Widgets Placed)
- **Scope Note**: **Desktop (1440×900) Only** for interactive placement. Card Catalogue Drawer and interactive placement handles are currently exclusive to Desktop; Mobile Drawer and Mobile Placement are scheduled for Phase 6 (`PROJECT_STATE.md:368`). For Mobile (390×844), perform responsive read-only verification of placed widgets.
- **Action**: On December 2026 (`/book/2026/12`), open the card catalogue drawer on Desktop, select 3 different widgets (e.g. Habit Tracker, Number Log, Sticky Note), hover over dotted paper, and click to place. On Mobile, verify placed widgets render cleanly in read-only sequential page flow. (Clean up test widgets afterwards).
- **Before Optimization (Baseline)**:
  - Clicking on paper triggers synchronous wait for 2 sequential Supabase queries (**1,018 ms** delay).
  - UI freezes with placement overlay stuck on screen for over 1 second.
  - Moving cursor with placement card triggers synchronous `getBoundingClientRect()` layout thrashing on every frame.
- **After Optimization (Target)**:
  - Clicking paper stamps the widget optimistically in **< 16 ms** on the very next frame with permanent client UUID.
  - Placement overlay closes instantly; arrange mode activates smoothly without temporary ID race condition.
  - Overlay bounding rect is cached on enter/down, providing 60fps cursor hover tracking without layout thrashing.
  - Verified on Desktop 1440×900: Interactive Drawer Placement (`[ ] Pass [ ] Fail`)
  - Verified on Mobile 390×844: Responsive Read-Only Sequential Render (`[ ] Pass [ ] Fail`)

### Test Step 4: Widget Dragging & Resizing in Arrange Mode (1 Widget Dragged & Resized)
- **Scope Note**: **Desktop (1440×900) Only** for interactive dragging and resizing. Arrange mode handles and `@dnd-kit` drag interactions are currently exclusive to Desktop; Mobile Arrange mode is scheduled for Phase 6 (`PROJECT_STATE.md:368`). For Mobile (390×844), perform single-page navigation and read-only boundary verification.
- **Action**: On Desktop, enter Arrange mode, drag a widget across the 22px grid and resize its dimensions using edge/corner handles. On Mobile, verify page swipe/corner turns work smoothly without drag handles interfering.
- **Before Optimization (Baseline)**:
  - `@dnd-kit` updates trigger unmemoized re-renders of the active widget's entire presentation tree (including all SVG paths) on every mouse move frame.
  - Resizing directly mutates `left/top/width/height` styles, forcing synchronous browser reflow per frame.
  - Bounding box collision loops test all widgets on raw mouse events.
- **After Optimization (Target)**:
  - `WidgetWrapper` and widget components wrapped in `React.memo` isolate re-renders.
  - Resizing previews smoothly using discrete 22px grid steps (`GRID_PX = 22`) or bounding box preview (no CSS `scale` distortion).
  - Dragging drops cleanly with optimistic position updates and zero temporary ID swap latency.
  - Verified on Desktop 1440×900: Arrange Drag & Discrete Grid Resize (`[ ] Pass [ ] Fail`)
  - Verified on Mobile 390×844: Read-Only Boundary & Single-Page Navigation (`[ ] Pass [ ] Fail`)

---

### Ideas (Not Built)
The following ideas were analyzed during the audit but are **intentionally not recommended for implementation** to preserve strict compliance with locked rules L1 to L14:

1. **Supabase Edge Functions / Geographically Distributed Query Proxy**: Placing an edge proxy closer to the user to mitigate Tokyo latency was considered, but rejected because client-side prefetching and nested PostgREST joins solve the waterfall within existing Next.js server infrastructure without external cloud infrastructure.
2. **WebGL / Canvas Paper Texture Rendering**: Replacing CSS gradient grain with a WebGL canvas shader was considered, but rejected as a violation of Rule L14 and L3 (unnecessary architectural overhaul when CSS GPU layer promotion provides 60fps).
3. **SVG Sprite Sheet Generation Pipeline**: Merging all 58 inline SVG icons into an external SVG sprite sheet was considered, but rejected because inlined SVGs allow direct Tailwind stroke/fill manipulation with negligible bundle impact compared to client code splitting.
4. **Third-Party State / Data-Fetching Libraries (TanStack Query, SWR, Radix)**: Strictly prohibited by Rule L3. All data synchronization and optimistic updates must remain in native React 19 and Next.js App Router patterns.
