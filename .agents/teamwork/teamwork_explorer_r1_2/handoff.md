# Performance Audit Handoff Report: Data & Rendering Bottlenecks (R2)

**Author**: Explorer R1-2 (`teamwork_explorer_r1_2`)  
**Mission**: Requirement R2: Data Bottlenecks and Rendering Bottlenecks in "Memorable Moments"  
**Date**: 2026-11-08  
**Scope**: Read-only systematic investigation of all items under R2 Data & Rendering categories  

---

## 1. Observation

### 1.1 Data Bottlenecks

#### Item D1: Month data fetching waterfalls (book -> month -> widgets -> entries; single query vs parallel)
- **Status**: **Found**
- **Location**:
  - `app/book/[year]/[month]/page.tsx:46-129`
  - `components/setup/setupActions.ts:42-85` (`getPreviousMonthData`)
  - `components/widgets/habit-tracker/HabitTrackerWidget.tsx:98-116`
  - `components/widgets/memorable-moments/MemorableMomentsWidget.tsx:97-116`
  - `components/widgets/number-log/NumberLogWidget.tsx:80-98`
  - `components/widgets/checklist/ChecklistWidget.tsx:132-150`
  - `components/widgets/bar-chart/BarChartWidget.tsx:97-119`
  - `components/widgets/line-graph/LineGraphWidget.tsx:105-127`
  - `components/widgets/donut/DonutWidget.tsx:97-115`
  - `components/widgets/scatter-plot/ScatterPlotWidget.tsx:100-124`
- **Observed Code & Direct Tracing**:
  1. In `app/book/[year]/[month]/page.tsx:49-129`, queries execute sequentially:
     - Line 49: `const { data: { user } } = await supabase.auth.getUser()` (Network roundtrip #1)
     - Line 56: `const prevMonthData = await getPreviousMonthData(year, month)`
       Inside `setupActions.ts:46-85`:
       - Line 46: `await supabase.auth.getUser()` (Redundant roundtrip #2)
       - Line 57: `await supabase.from('books').select('id').eq('user_id', user.id).eq('year', prevYear).maybeSingle()` (Roundtrip #3)
       - Line 69: `await supabase.from('months').select('id, setup_done, paper_left, paper_right, next_month_note, setup_config').eq('book_id', prevBook.id).eq('month', prevMonth).maybeSingle()` (Roundtrip #4)
       - Line 81: `await supabase.from('widgets').select('id', { count: 'exact', head: true }).eq('month_id', prevMonthRow.id)` (Roundtrip #5)
     - Line 60: `await supabase.from('books').select('id').eq('user_id', user.id).eq('year', year).maybeSingle()` (Roundtrip #6)
     - Line 68: `await supabase.from('months').select('id, setup_done, paper_left, paper_right, setup_config').eq('book_id', bookRes.data.id).eq('month', month).maybeSingle()` (Roundtrip #7)
     - Line 83: `await supabase.from('widgets').select('*').eq('month_id', monthId).order('created_at', { ascending: true })` (Roundtrip #8)
     - Lines 107-129 (If last 3 days): queries `books` (#9) and `months` (#10) for next month prompt.
  2. Entries are NOT loaded on the server. Instead, upon client mount, each widget independently executes a `useEffect` calling `getWidgetEntriesWithCache(id)` (`entryHelpers.ts:65` -> `entryActions.ts:26`), triggering N separate HTTP POST server actions over the wire (one per placed widget).
- **Measured Impact**: **High**. 8–10 sequential roundtrips on server + N client roundtrips. At ~260 ms per roundtrip (see Item D5), server wait time alone is >2,000 ms before page streaming starts.

#### Item D2: Absence of adjacent month prefetching
- **Status**: **Found**
- **Location**:
  - `components/book/OpenBook.tsx:384-413` (`executeTurn`)
  - `components/book/OpenBook.tsx:441-448` (`handleTabClick`)
  - `components/book/MobileBook.tsx:320-335`
- **Observed Code & Direct Tracing**:
  1. `OpenBook.tsx:384-413` uses `router.push(`/book/${tgtYear}/${tgtMonth}`)` triggered inside a `setTimeout` (600ms for 3D turn, 180ms for reduced-motion fade).
  2. A codebase-wide search confirms `router.prefetch` is NEVER called (zero results across all `.ts` and `.tsx` files).
  3. Month tabs (`OpenBook.tsx:441`) and page click edges use HTML `<button>` elements that trigger `executeTurn`, bypassing Next.js default viewport `<Link>` prefetching.
  4. Consequently, Next.js only initiates the RSC fetch for the target month *after* the 600ms CSS animation timeout completes, resulting in a blank stall or delay after the page turn.
- **Measured Impact**: **High**. Unbuffered delay on every month transition.

#### Item D3: Widget placement waiting for Supabase responses without optimistic updates
- **Status**: **Found**
- **Location**:
  - `components/book/OpenBook.tsx:200-230` (`handlePlaceWidget`)
  - `components/book/OpenBook.tsx:311-337` (Keyboard Enter/Space placement trigger)
  - `components/widgets/PlacementOverlay.tsx:75-90`
- **Observed Code & Direct Tracing**:
  1. In `OpenBook.tsx:213-219`:
     ```typescript
     const res = await createWidget(currentMonthId, targetPage, defToPlace.id, x, y, w, h)
     if (res.success && res.data) {
       setWidgets((prev) => [...prev, res.data!])
       setPickedWidgetDef(null)
       setActivePlacement(null)
       setIsDrawerOpen(false)
       setIsArrangeMode(true)
     }
     ```
  2. `setWidgets`, `setPickedWidgetDef(null)`, and `setIsArrangeMode(true)` are deferred until `createWidget` completes over the network.
  3. The placement shadow and card-catalogue drawer remain visible and frozen during the roundtrip (~260–500ms).
- **Measured Impact**: **Medium to High**. Directly hampers the tactile "instant placement" feel required for the notebook experience.

#### Item D4: Un-debounced saves during dragging/keystrokes
- **Status**: **Not Found** (Saves are correctly debounced / deferred)
- **Location**:
  - `components/widgets/PageWidgetLayer.tsx:80-154` (`handleDragEnd`)
  - `components/widgets/PageWidgetLayer.tsx:157-195` (`handleResizeEnd`)
  - `components/widgets/free-note/FreeNoteWidget.tsx:112-119` (`handleBlur`)
  - `components/widgets/memorable-moments/MemorableMomentsWidget.tsx:149-168` (`handleTextBlur`)
  - `components/widgets/number-log/NumberLogWidget.tsx:107-132` (`commitEdit`)
  - `components/widgets/checklist/ChecklistWidget.tsx:185-201` (`handleItemBlur`)
  - `components/widgets/WidgetConfigCard.tsx:290-348` (`handleSubmit`)
- **Observed Code & Direct Tracing**:
  1. Dragging: `@dnd-kit/core` does NOT dispatch database updates during drag movement. Database persistence via `updateWidgetPosition` is strictly triggered once on `handleDragEnd` (`PageWidgetLayer.tsx:138`).
  2. Resizing: Pointer moves update local React state `liveW`/`liveH` in `WidgetWrapper.tsx:142-180`. Supabase persistence occurs exclusively on `onPointerUp` (`handleResizeEnd` in `PageWidgetLayer.tsx:179`).
  3. Keystrokes: All text inputs (`FreeNote`, `MemorableMoments`, `NumberLog`, `Checklist`) maintain local component state on `onChange`. Server actions (`saveWidgetEntryAndBump` or `updateWidgetConfig`) execute strictly on `onBlur` or `Enter`.
  4. Config card: Form inputs update local state; save occurs on `handleSubmit` ("Save card" button).
- **Measured Impact**: **Low / None** (Bottleneck absent).

#### Item D5: Supabase project region distance & connection latency
- **Status**: **Found**
- **Location**:
  - `.env.local:1`: `https://gzozoqqvyojpdrdajjkg.supabase.co`
  - Supabase Project ID: `gzozoqqvyojpdrdajjkg`
  - Supabase Project Region: `ap-northeast-1` (Tokyo, Japan)
- **Observed Data & Live Network Measurements**:
  1. Calling `supabase:get_project` via MCP confirmed project configuration:
     - `name`: "track"
     - `region`: "ap-northeast-1" (Tokyo, Japan)
     - `status`: "ACTIVE_HEALTHY"
  2. Client/local machine execution context is in India (UTC+05:30).
  3. Measured TCP connection latency from the active machine to `gzozoqqvyojpdrdajjkg.supabase.co:443`:
     - Connect 1 (cold DNS + TLS): **1,810 ms**
     - Connect 2: **566 ms**
     - Connect 3: **208 ms**
     - Connect 4: **266 ms**
     - Connect 5: **298 ms**
     - Warm TCP average RTT: **~260 ms**
     - Cold HTTPS Request RTT: **1,769 ms**
- **Measured Impact**: **High**. The ~260 ms physical roundtrip between India and Tokyo turns every sequential query into a quarter-second delay.

#### Item D6: Missing database indexes on `month_id`, `widget_id`, and `book_id`
- **Status**: **Found** (`month_id` missing on `widgets`) / **Partially Found** (`widget_id` and `book_id` indexed via compound keys)
- **Location**:
  - `supabase/migrations/0001_initial_schema.sql:91-150` (`widgets` table)
  - `supabase/migrations/0001_initial_schema.sql:33-89` (`months` table)
  - `supabase/migrations/0001_initial_schema.sql:152-209` (`entries` table)
- **Observed Database Schema & Live SQL Inspection**:
  1. Querying `pg_indexes` on the live database via Supabase MCP revealed:
     - `books`: `books_pkey (id)`, `books_user_id_year_key (user_id, year)`
     - `months`: `months_pkey (id)`, `months_book_id_month_key (book_id, month)`
     - `widgets`: `widgets_pkey (id)`
     - `entries`: `entries_pkey (id)`, `entries_widget_id_day_key (widget_id, day)`
  2. `widgets.month_id`: **CRITICAL MISSING INDEX**. Line 94 references `months(id)` without any secondary index. PostgreSQL does not automatically index foreign keys. Every month load queries `SELECT * FROM widgets WHERE month_id = $1` (`page.tsx:86`, `widgetActions.ts:42`), forcing a full sequential scan of the `widgets` table. In addition, RLS on widgets (`0001_initial_schema.sql:113`) and cascade deletes must scan `widgets`.
  3. `months.book_id`: Functional compound index exists (`months_book_id_month_key` on `(book_id, month)`). B-tree queries filtering by `book_id` use this index as the leading column.
  4. `entries.widget_id`: Functional compound index exists (`entries_widget_id_day_key` on `(widget_id, day)`). Single-column lookups by `widget_id` use this leading column.
- **Measured Impact**: **Medium to High**. Table scan on `widgets` compounds with growing user data and RLS evaluation.

---

### 1.2 Rendering Bottlenecks

#### Item R1: Full-spread re-renders on single widget updates (Zustand selectors, store subscriptions, React memoisation, state elevation)
- **Status**: **Found**
- **Location**:
  - `components/book/OpenBook.tsx:82` (`const [widgets, setWidgets] = useState<WidgetData[]>(initialWidgets)`)
  - `components/book/OpenBook.tsx:146-159`
  - `components/book/OpenBook.tsx:1020-1038`
  - `components/widgets/PageWidgetLayer.tsx:49-59`
  - `components/widgets/WidgetWrapper.tsx:49-59`
  - `store/entriesVersion.ts:21-24`
- **Observed Code & Direct Tracing**:
  1. State Elevation: Widget state is elevated to root `OpenBook` (`useState<WidgetData[]>` at line 82).
  2. When any single widget updates position or configuration, `setWidgets` executes, triggering a full re-render of `OpenBook`.
  3. Lines 146–147 regenerate `leftWidgets` and `rightWidgets` with fresh array references.
  4. `PageWidgetLayer` is NOT memoized with `React.memo`. Both left and right page layers re-render.
  5. `WidgetWrapper` is NOT memoized with `React.memo`. Every widget wrapper re-renders.
  6. Individual widget desktop implementations (`BarChartDesktop`, `LineGraphDesktop`, etc.) are NOT memoized with `React.memo`.
  7. Store Subscription: `useEntriesVersionStore` is a single monolithic counter (`version: 0`). When any entry is updated anywhere in the notebook, `bump()` increments `version`. All subscribed chart widgets (`BarChart`, `LineGraph`, `Donut`, `ScatterPlot`, `GoalBar`) re-render and re-fetch data simultaneously, regardless of whether their data changed.
- **Measured Impact**: **High**. Every single widget interaction ripples across the entire spread DOM tree.

#### Item R2: Simultaneous rendering of all spread widgets including custom SVG charts recomputing per render
- **Status**: **Found**
- **Location**:
  - `components/widgets/PageWidgetLayer.tsx:233-247`
  - `components/widgets/bar-chart/BarChartWidget.tsx:182-257`
  - `components/widgets/line-graph/LineGraphWidget.tsx:185-230`
  - `components/widgets/donut/DonutWidget.tsx:261-285`
  - `components/widgets/scatter-plot/ScatterPlotWidget.tsx:206-234`
- **Observed Code & Direct Tracing**:
  1. All placed widgets on both left and right spreads are mounted simultaneously without deferral.
  2. Each chart widget mounts complex custom SVG trees (defs, hatching patterns, wobbly bezier paths, multi-segment circles).
  3. Because parent components lack memoization, every interaction re-evaluates the entire virtual DOM tree of all SVG paths across both pages.
- **Measured Impact**: **Medium**. Scales with the number of widgets placed on a spread.

#### Item R3: Chart jitter/wobble and data series recalculation on render
- **Status**: **Found**
- **Location**:
  - `components/widgets/scatter-plot/ScatterPlotWidget.tsx:213-232`
  - `components/widgets/charts/chartUtils.ts:84-102` (`wobbleCircle`)
  - `components/widgets/bar-chart/BarChartWidget.tsx:209-257`
  - `components/widgets/line-graph/LineGraphWidget.tsx:153-172`
- **Observed Code & Direct Tracing**:
  1. In `ScatterPlotWidget.tsx:220`, `wobbleCircle(cx, cy, 2.8, seed + i * 7)` is called directly inside the JSX `.map()` render loop without `useMemo`. For 31 possible points, 26 trigonometric jitter calculations per point run unconditionally on every render pass.
  2. In `BarChartWidget.tsx:209-257`, bar height/width, positions (`bx`, `by`), and hatching geometry for all 31 days are calculated inline during JSX evaluation rather than in `useMemo`.
  3. In `LineGraphWidget.tsx`, although `pathD` uses `useMemo`, its dependencies (`points`, `series`) are invalidated whenever `entriesVersion` bumps, triggering recalculation of cubic bezier control points.
- **Measured Impact**: **Medium**. Adds unneeded script execution time on the main thread during render cycles.

#### Item R4: Heavy client components candidate for server components or lazy loading (widget drawer, settings card, Month Setup wizard, print code)
- **Status**: **Found** for Widget Drawer, Settings Card, and Month Setup Wizard; **Not Found** for Print Code
- **Location**:
  - `components/widgets/WidgetDrawer.tsx` (233 lines, pulls `registry.ts` with all 14 widgets)
  - `components/widgets/WidgetConfigCard.tsx` (586 lines)
  - `components/setup/MonthSetupWizard.tsx` (854 lines, 35 KB)
  - `components/book/OpenBook.tsx:6, 10, 11` (Static imports)
  - `components/book/OpenBook.tsx:1046` & `app/globals.css:185-285` (Print code)
- **Observed Code & Bundle Measurements**:
  1. `MonthSetupWizard.tsx` is an 854-line client component statically imported in `OpenBook.tsx:6`. Once a month is set up (`setup_done = true`), it is NEVER rendered, yet it is unconditionally bundled into the initial client chunk of every month view.
  2. `WidgetDrawer.tsx` is statically imported in `OpenBook.tsx:11`. It imports `registry.ts`, which statically imports all 14 widget implementations, including charts, tracker tables, schemas, and icons.
  3. `WidgetConfigCard.tsx` is a 586-line component statically imported in `OpenBook.tsx:10`, rendered only when a widget's settings are opened in arrange mode.
  4. Build analysis (`npm run build`) shows client chunks:
     - `3dtwbakvaf6mg.js`: **520 KB**
     - `23e6jep2anmtk.js`: **229 KB**
     - Total uncompressed JS bundle loaded upfront: **>1 MB**.
  5. Print Code: Verified in `OpenBook.tsx:1046` and `globals.css:185-285`. There is no heavy JS print library. It is a single button calling native `window.print()` and relying on CSS `@media print`. Thus, print code is NOT a client bundle bottleneck.
- **Measured Impact**: **High**. Statically importing modal/drawer components drastically inflates the initial bundle size and delays First Contentful Paint (FCP) and Time to Interactive (TTI).

---

## 2. Logic Chain

1. **Premise 1 (Geographic & Architectural Reality)**: The Supabase PostgreSQL database is deployed in `ap-northeast-1` (Tokyo, Japan), as confirmed by MCP `get_project`. The measured roundtrip latency from the application environment is ~260 ms warm (and ~1.8s cold).
2. **Deduction 1 (Waterfall Impact)**: In `page.tsx`, 8 sequential database queries are awaited one after another (`auth` -> `setupActions` [3 queries] -> `books` -> `months` -> `widgets` -> prompt checks). Because each query requires at least 260 ms of network travel, the server is blocked for $8 \times 260\text{ ms} \approx 2,080\text{ ms}$ before it can finish compiling the React Server Component payload. Once rendered, the client executes N additional HTTP server actions to fetch entries. Total data latency exceeds 2.5 seconds.
3. **Deduction 2 (Prefetching Absence)**: Because `router.prefetch` is absent and navigation elements are `<button>` tags rather than `<Link>` tags, Next.js does not begin the RSC request for adjacent months in advance. Users must sit through the 600 ms turn animation, followed by the full 2+ second server waterfall.
4. **Deduction 3 (Missing Index Consequence)**: In PostgreSQL, foreign keys do NOT create indexes automatically. In `0001_initial_schema.sql`, `widgets` has no index on `month_id`. Every single month load performs a full table sequential scan on `widgets`. This wastes database I/O and compounds as widgets accumulate.
5. **Deduction 4 (Client Re-render Cascades)**: Elevating all `widgets` state to `OpenBook` without wrapping `PageWidgetLayer`, `WidgetWrapper`, or the widget components in `React.memo` means any state modification (such as moving one widget, resizing, or updating config) forces React to re-render the entire desktop spread (both pages and all widgets).
6. **Deduction 5 (Global Store Coupling)**: `useEntriesVersionStore` is an unpartitioned integer counter. Bumping it on any entry save triggers a re-fetch and re-render across all chart components on the spread, even when the modified entry belongs to a completely different widget.
7. **Deduction 6 (Bundle Bloat via Static Imports)**: Static imports in `OpenBook.tsx` force `MonthSetupWizard` (854 lines), `WidgetDrawer` (233 lines + all 14 widgets), and `WidgetConfigCard` (586 lines) into the main route chunk, resulting in a 520 KB primary chunk, even though none of these three components are needed during standard reading of an established month spread.

---

## 3. Caveats

1. **Network Fluctuations**: Measured roundtrip latency (~208–298 ms warm, ~1,810 ms cold) reflects real-world internet routing between India and Tokyo. Exact latency may vary depending on local ISP peering, but the physical propagation speed of light through fiber optic cables guarantees a minimum latency floor of ~120–150 ms between these regions.
2. **Database Sizing in Demo Mode**: In the current test database with a small number of rows, sequential scans on `widgets` take under 5 ms of DB execution time. The missing index is a structural and architectural bottleneck that degrades linearly as row counts scale, but network transit time currently dominates overall response time.
3. **No External Packages Allowed (L3)**: All proposed remedies must rely exclusively on existing approved dependencies: `next`, `react`, `zod`, `zustand`, `@dnd-kit/core`, and `serwist`. No additional libraries (e.g. TanStack Query, SWR, Lodash, or Radix) may be introduced.
4. **Zero Code Modifications in Explorer Phase**: In strict compliance with R4 and locked rules L1 to L14, no application files or database rows were edited during this investigation.

---

## 4. Conclusion & Actionable Optimization Concepts

### Summary Classification Table

| # | Item | Status | Exact Location (`file:line`) | Impact | Measured Evidence |
|---|------|--------|------------------------------|--------|-------------------|
| D1 | Data Fetching Waterfall | **Found** | `app/book/[year]/[month]/page.tsx:46-129`<br>`components/setup/setupActions.ts:42-85` | **High** | 8–10 sequential server queries + N client entry requests; >2,000 ms wait |
| D2 | Missing Adjacent Month Prefetching | **Found** | `components/book/OpenBook.tsx:384-413` | **High** | 0 calls to `router.prefetch`; `button` tags used instead of `<Link>` |
| D3 | Widget Placement Lacks Optimistic Update | **Found** | `components/book/OpenBook.tsx:200-230` | **Medium-High** | `setWidgets` and drawer close await `createWidget` roundtrip (~260-500ms freeze) |
| D4 | Un-debounced Drag/Keystroke Saves | **Not Found** | `components/widgets/PageWidgetLayer.tsx:80,157`<br>`components/widgets/free-note/FreeNoteWidget.tsx:112` | **Low / None** | Saves strictly deferred to `handleDragEnd`, `handleResizeEnd`, and `onBlur`/`onSubmit` |
| D5 | Supabase Region Distance & Latency | **Found** | `.env.local:1`<br>Supabase Project: `gzozoqqvyojpdrdajjkg` | **High** | Tokyo `ap-northeast-1`; warm TCP RTT ~260 ms, cold RTT 1,810 ms |
| D6 | Missing DB Indexes (`month_id`, `widget_id`, `book_id`) | **Found** (`month_id`)<br>**Partially Found** (`widget_id`, `book_id`) | `supabase/migrations/0001_initial_schema.sql:94` | **Medium-High** | `widgets.month_id` has NO index (full table scan on every month load); others have compound indexes |
| R1 | Full-Spread Re-renders on Widget Update | **Found** | `components/book/OpenBook.tsx:82,146-159`<br>`store/entriesVersion.ts:21-24` | **High** | Root state elevation + 0 `React.memo` on wrappers + unpartitioned global store |
| R2 | Simultaneous Rendering of All Widgets/SVGs | **Found** | `components/widgets/PageWidgetLayer.tsx:233-247` | **Medium** | Both pages render all SVGs at once; re-evaluated on any parent state change |
| R3 | Chart Jitter & Data Series Recalculation | **Found** | `components/widgets/scatter-plot/ScatterPlotWidget.tsx:220`<br>`components/widgets/bar-chart/BarChartWidget.tsx:209` | **Medium** | `wobbleCircle` runs inside JSX map loop; bar layout unmemoized |
| R4 | Heavy Client Components Bundled Statically | **Found** (Drawer, Settings, Wizard)<br>**Not Found** (Print) | `components/setup/MonthSetupWizard.tsx`<br>`components/widgets/WidgetDrawer.tsx`<br>`components/widgets/WidgetConfigCard.tsx` | **High** | 854-line wizard + drawer + 586-line config card bundled in main chunk (520 KB chunk); print is native CSS |

---

### Actionable Optimization Proposals (Strictly Compliant with L1 to L14 & L3)

#### 1. Consolidate Data Fetching & Parallelize Queries
- **Change**: In `page.tsx`, execute the user authentication and previous month check in parallel via `Promise.all`:
  ```typescript
  const [userRes, prevMonthData] = await Promise.all([
    supabase.auth.getUser(),
    getPreviousMonthData(year, month),
  ])
  ```
- **Join Queries**: Replace the 3-step waterfall (`books` -> `months` -> `widgets`) with a single nested PostgREST query:
  ```typescript
  const { data: book } = await supabase
    .from('books')
    .select('id, months!inner(id, setup_done, paper_left, paper_right, setup_config, widgets(*))')
    .eq('user_id', user.id)
    .eq('year', year)
    .eq('months.month', month)
    .maybeSingle()
  ```
- **Server Prefetch for Entries**: Fetch initial entries for all widgets on the spread in a single query `supabase.from('entries').select('*').in('widget_id', widgetIds)` on the server and pass to `OpenBook` as `initialEntries`. This completely eliminates N client-side waterfall requests on page mount.
- **Official Documentation**:
  - Next.js Parallel Data Fetching: `https://nextjs.org/docs/app/building-your-application/data-fetching/patterns#parallel-data-fetching`
  - Supabase Joins and Nested Tables: `https://supabase.com/docs/guides/database/joins-and-nested-tables`

#### 2. Implement Adjacent Month Prefetching
- **Change**: In `components/book/OpenBook.tsx`, add an idle prefetch effect:
  ```typescript
  useEffect(() => {
    const prev = getPrevDate(year, month)
    const next = getNextDate(year, month)
    router.prefetch(`/book/${prev.year}/${prev.month}`)
    router.prefetch(`/book/${next.year}/${next.month}`)
  }, [year, month, getPrevDate, getNextDate, router])
  ```
- **Hover/Pointerdown Prefetch**: On month tab pointerdown or hover, immediately trigger `router.prefetch(`/book/${year}/${tabMonth}`)`.
- **Expected Gain**: Eliminates the 2.5s network lag on page turns; the RSC payload is already warm in the Next.js client router cache.
- **Official Documentation**:
  - Next.js `useRouter.prefetch`: `https://nextjs.org/docs/app/api-reference/functions/use-router#userouter`
  - Next.js Prefetching: `https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating#2-prefetching`

#### 3. Optimistic Widget Placement
- **Change**: In `OpenBook.tsx:handlePlaceWidget`, immediately add an optimistic widget instance to state and close the drawer:
  ```typescript
  const tempId = crypto.randomUUID()
  const optimisticWidget: WidgetData = {
    id: tempId,
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
  // Background commit with rollback on failure
  ```
- **Expected Gain**: Instant UI response (<16ms) on placement, eliminating the 260–500ms freeze.
- **Official Documentation**:
  - React `useOptimistic`: `https://react.dev/reference/react/useOptimistic`

#### 4. Add Database Index on `widgets(month_id)`
- **Change**: Create a migration adding the missing foreign key index:
  ```sql
  CREATE INDEX IF NOT EXISTS idx_widgets_month_id ON public.widgets (month_id);
  ```
- **Expected Gain**: Converts $O(N)$ sequential table scans on `widgets` to $O(\log N)$ B-tree index lookups on all month page visits, RLS policy evaluations, and cascade operations.
- **Official Documentation**:
  - Supabase Database Indexes: `https://supabase.com/docs/guides/database/postgres/indexes`

#### 5. React Memoization & Partitioned Zustand Subscriptions
- **Component Memoization**:
  - Wrap `PageWidgetLayer`, `WidgetWrapper`, and all 14 widget desktop components in `React.memo()`.
- **Scoped Store Subscriptions**:
  - Update `store/entriesVersion.ts` so that versioning is keyed by `widgetId`:
    ```typescript
    interface EntriesVersionState {
      versions: Record<string, number>
      bump: (widgetId?: string) => void
    }
    ```
  - In chart widgets, subscribe only to the relevant source widget:
    ```typescript
    const version = useEntriesVersionStore((s) => s.versions[sourceWidgetId] ?? 0)
    ```
- **Expected Gain**: Prevents spread-wide re-renders when saving entries in unrelated widgets; isolates drag/resize re-renders to the active widget.
- **Official Documentation**:
  - React `memo`: `https://react.dev/reference/react/memo`
  - Zustand Selectors: `https://zustand.docs.pmnd.rs/guides/auto-generating-selectors`

#### 6. Memoize SVG Computations in Charts
- **Scatter Plot**: In `ScatterPlotWidget.tsx`, wrap the generation of points and `wobbleCircle` paths in `useMemo`:
  ```typescript
  const renderedDots = useMemo(() => {
    return matchedPoints.map((pt, i) => {
      const xFrac = (pt.x - minX) / xRange
      const yFrac = (pt.y - minY) / yRange
      const cx = padLeft + xFrac * plotW
      const cy = padTop + plotH - yFrac * plotH
      return {
        day: pt.day,
        d: wobbleCircle(cx, cy, 2.8, seed + i * 7),
      }
    })
  }, [matchedPoints, minX, xRange, minY, yRange, padLeft, plotW, padTop, plotH, seed])
  ```
- **Bar Chart**: Memoize daily bar geometry calculations in `BarChartWidget.tsx`.
- **Official Documentation**:
  - React `useMemo`: `https://react.dev/reference/react/useMemo`

#### 7. Dynamic Imports / Code Splitting for Heavy Components
- **Month Setup Wizard**: In `OpenBook.tsx`, lazy-load `MonthSetupWizard`:
  ```typescript
  import dynamic from 'next/dynamic'
  const MonthSetupWizard = dynamic(
    () => import('@/components/setup/MonthSetupWizard').then((m) => m.MonthSetupWizard),
    { ssr: false }
  )
  ```
  Only rendered when `!isSetupDone`.
- **Widget Drawer & Config Card**: Dynamically import `WidgetDrawer` and `WidgetConfigCard` so they are excluded from the initial spread payload and fetched on demand when opened.
- **Expected Gain**: Shaves ~40–50% off the primary JavaScript client bundle (~200–300 KB reduction), significantly improving initial page load time.
- **Official Documentation**:
  - Next.js Lazy Loading / Dynamic Imports: `https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading`

---

## 5. Verification Method

To independently verify all findings and measurements:

1. **Verify Database Indexes**:
   Execute SQL query against live Supabase database:
   ```sql
   SELECT tablename, indexname, indexdef 
   FROM pg_indexes 
   WHERE schemaname = 'public' 
   ORDER BY tablename, indexname;
   ```
   *Expected Observation*: Confirms `widgets` has only `widgets_pkey`; index on `month_id` is absent.

2. **Verify Latency to Supabase Region**:
   Run TCP connectivity test from command line:
   ```bash
   node -e "const net = require('net'); for (let i = 0; i < 3; i++) { const t0 = Date.now(); const s = net.createConnection({ host: 'gzozoqqvyojpdrdajjkg.supabase.co', port: 443 }, () => { console.log('TCP RTT:', Date.now() - t0, 'ms'); s.end(); }); }"
   ```
   *Expected Observation*: Roundtrip times average ~200–300 ms warm, verifying high geographical distance to Tokyo (`ap-northeast-1`).

3. **Verify Waterfall in Server Code**:
   Inspect `app/book/[year]/[month]/page.tsx` lines 46–129 and `components/setup/setupActions.ts` lines 42–85 to trace sequential `await` calls.

4. **Verify Absence of Prefetching**:
   Search for `prefetch` across codebase:
   ```powershell
   Select-String -Path "app\**\*.tsx", "components\**\*.tsx" -Pattern "prefetch"
   ```
   *Expected Observation*: Zero occurrences found.

5. **Verify Bundle Size & Chunk Distribution**:
   Run production build:
   ```bash
   npm run build
   ```
   Check `.next/static/chunks` sizes:
   ```powershell
   Get-ChildItem .next\static\chunks -Filter "*.js" | Sort-Object Length -Descending | Select-Object Name, Length
   ```
   *Expected Observation*: Main client bundle contains chunks >500 KB due to static imports of `MonthSetupWizard`, `WidgetDrawer`, and widget registry.
