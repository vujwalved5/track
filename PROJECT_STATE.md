# PROJECT_STATE.md — Memorable Moments

## Finished

### Phase 1 / Task 1 — Scaffold
- Next.js 16 App Router + TypeScript + Tailwind project.
- Folder layout: `/app`, `/components/book|paper|widgets|setup`, `/lib/supabase`, `/store`, `/types`, `/supabase/migrations`.
- `/lib/tokens.ts` — 9 locked palette colours + 22 px grid unit.
- `tailwind.config.ts` — named Tailwind colours, font variables, `spacing.grid`.
- `app/layout.tsx` — Kalam + Cormorant Garamond via `next/font`.
- `app/page.tsx` — full-screen desk-coloured div only.

### Phase 1 / Task 2 — Database schema + auth plumbing
- **Migration applied** to Supabase project `track` (`gzozoqqvyojpdrdajjkg`).
- Tables created with RLS enabled: `books`, `months`, `widgets`, `entries`.
- 16 RLS policies confirmed in `pg_policies` (SELECT / INSERT / UPDATE / DELETE per table).
- Ownership chain: `entries → widgets → months → books → user_id = auth.uid()`.
- `/lib/supabase/client.ts` — browser `createBrowserClient`.
- `/lib/supabase/server.ts` — server `createServerClient` (cookies via `next/headers`).
- `/lib/supabase/auth.ts` — `signIn`, `signUp`, `signOut` (email + password).
- `/types/db.ts` — TypeScript types matching all columns (Row / Insert / Update).
- `.env.local` — real Supabase URL + anon key wired.
- `@supabase/supabase-js` + `@supabase/ssr` added to dependencies.

### Phase 2 / Task 3 — Paper component
- `components/paper/Paper.tsx` — `<Paper type side>` Server Component.
- Four CSS-only textures: dotted (radial-gradient 1.4 px dot, 35% ink opacity), squared (linear-gradient grid 22% opacity), lined (horizontal only), blank.
- Grain via two crossed `repeating-linear-gradient` hatches at 0.016 opacity — no images.
- Spine inset shadow: left page → right edge, right page → left edge.
- Fixed 484 × 660 px (22 cols × 30 rows × 22 px grid).
- `components/paper/index.ts` — barrel export.
- `app/dev/paper/page.tsx` — dev-only preview at `/dev/paper`.

### Phase 2 / Task 4 — Closed Book Login Screen
- Closed cloth-bound book (520×700px on desktop, scaling to fit mobile 390px) on desk background with soft vignette.
- Oxblood cover (`#702028` to `#54181e` oxbloodDark) with dark spine band, gold vertical line, rounded right corners, and visible cream page edges on right.
- Gold foil inset double border; Cormorant Garamond title: "VOLUME — YEAR", "MEMORABLE MOMENTS", "a year, kept by hand".
- Glued cream bookplate (`#f4eddc`) with "THIS BOOK BELONGS TO", semantic `<label>`/`<input>` for email and password with dotted-underline style.
- Brass button ("OPEN THE BOOK") using only `gold #d8b45a` and `kraft #b9895a`.
- Gold ribbon hanging from bottom with classic V-notch.
- Small inert placeholder links: "Forgot the key?" and "Begin a new book".
- Integrated `signIn` from `lib/supabase/auth.ts`: wrong password displays handwritten red-pen message (`#b3261e`, Kalam) directly on bookplate; no popups or modals.
- Successful sign-in triggers 900ms CSS 3D cover open animation revealing inside endpaper and dotted page, then routes to `/book/[year]/[month]` with unpadded month. Respects `prefers-reduced-motion`.
- Added derived `oxbloodDark` token (`#54181e`) in `lib/tokens.ts` and `tailwind.config.ts`.

### Phase 2 / Task 5 — Open Book Spread with Navigation
- Desktop open book spread at route `/book/[year]/[month]`.
- Two `<Paper>` pages (484×660px each) framed inside an `ink #1c2433` hardcover casing with a center spine crease and shadow.
- Center spine features a hanging red ribbon bookmark (`redpen #b3261e`) with a classic swallowtail V-notch.
- 12 month index tabs (JAN–DEC) on the right edge of the book: active month wider in `redpen #b3261e` with `paper #f4eddc` text, inactive tabs in soft paper tints (`bg-paper/90`) with `ink #1c2433` text.
- Folios at page bottom: `p. {2 * month}` with handwritten link to previous month on left page; `p. {2 * month + 1}` with handwritten link to next month on right page.
- Folded dog-ear page corner at bottom right of right page.
- Keyboard navigation (Left / Right arrow keys), corner click, and month tab clicks all trigger custom 600ms CSS 3D page turn with dynamic moving shadow (or a quick 180ms fade if `prefers-reduced-motion` is active), landing smoothly on the target month spread. Year boundaries (Dec $\leftrightarrow$ Jan) handled seamlessly.
- Handwritten month title in Kalam with hand-drawn SVG underline at the top left of the left page. Empty page bodies (no widgets or SaaS chrome).
- Paper type read from Supabase server client (`paper_left`, `paper_right`), falling back to `'dotted'`.
- Zero scrollbars at 1440×900 desktop viewport. Strictly L6 palette.

### Phase 3 / Task 6 — Month Setup Wizard
- `components/setup/MonthSetupWizard.tsx`: 7-step loose paper card tucked into the book (520×590px, slight -1° tilt, paper colour `#f4eddc`, Kalam handwriting, zero inner scrolling).
- Exactly 7 sequential sheets:
  1. Start: "Use the same as last month" (copies prior month paper, widgets, and habit names) or "Set up fresh" (with fallback to "No earlier month yet").
  2. Paper: independent Left & Right paper choices (`dotted` preselected, `squared`, `lined`, `blank`) with hand-drawn mini SVG previews.
  3. Intentions: shows previous month's `next_month_note` for reading + handwritten text input for current month.
  4. Habits: 12 habits in a 2-column layout with hand-drawn SVG checkboxes to toggle Normal vs. Red-pen indulgence (`#b3261e`).
  5. Numbers to track: hand-drawn SVG tick boxes for Weight, Sleep score, Mood, plus up to 3 custom named trackers.
  6. Pages: starting layout selection ("Journal" vs. "Empty"), strictly saving choice to `setup_config` without generating widget rows.
  7. Review: summary card, handwritten red-pen error handling if save fails, and gold "Open the month" button.
- Unset months always show the wizard; cannot be dismissed by Esc, clicking outside, or arrow keys.
- Gentle handwritten prompt ("Set up [Next Month]?") appears on spread during the last 3 days of viewed month when next month's `setup_done = false`.
- Server Action `completeMonthSetup` in `components/setup/setupActions.ts` ensures `books` and `months` rows are created on the final step only, copies widget rows from prior month if selected, and sets `setup_done = true`.
- Zero dependencies added; strictly L1–L14 compliant.

### Phase 4 / Task 7 — The Widget Engine
- `components/widgets/registry.ts` — Type-safe central registry for widgets storing type id, display name, default size (grid units), minimum size, Zod config schema, desktop render component, mobile render component, and hand-drawn SVG icon.
- `components/widgets/sticky-note/StickyNoteWidget.tsx` — Test "Sticky note" widget (text-only Zod schema, Kalam handwriting, hand-drawn SVG icon, registered desktop and mobile components).
- `components/widgets/types.ts` — 22px grid units (22 cols × 30 rows = 484 × 660 px), geometric collision math (`hasOverlap`), bounds checking (`isWithinBounds`), and position solver.
- `components/widgets/WidgetWrapper.tsx` — Positioned strictly on 22px grid (`x, y, w, h`); dragged via `@dnd-kit/core`; resized via plain pointer events on bottom-right corner handle; red-pen hand-drawn SVG cross-out button; settings trigger button.
- `components/widgets/PageWidgetLayer.tsx` — Page container managing DnD sensors, real-time collision detection, boundary clamping, and red-pen error messages reverting to last valid position on save failure.
- `components/widgets/WidgetConfigCard.tsx` — Tucked loose paper card (Task 6 style, no modals or dark overlays) dynamically supporting string, number, boolean, and enum schemas.
- `components/widgets/widgetActions.ts` — Server Actions for CRUD operations (`widgets` table) enforcing bounds, minSize, and zero-overlap before committing writes.
- `components/book/OpenBook.tsx` — Authentic book ribbon tab at top edge to toggle Arrange mode (hidden while month is unset); static spread renders left and right widget layers.
- Dev add control: added dev-only control labelled `dev: add sticky note` rendered during development. **Note: Remove dev add-control in Task 8.**
- Confirmed foreign key cascade: deleting a widget cascades to its entries rows (`ON DELETE CASCADE` verified in migration `0001_initial_schema.sql`).

### Phase 4 / Task 8 — The Widget Library
- `components/widgets/WidgetDrawer.tsx` — Wooden card-catalogue drawer sliding out from the bottom edge of the desk under the book; toggled by a small brass cup handle (gold/kraft); four card-stock tabbed dividers ("Track", "Charts", "Ask", "Write") always visible with no placeholder text; paper index cards dynamically populated from registry displaying only the hand-drawn SVG icon and handwritten name in Kalam font.
- `components/widgets/PlacementOverlay.tsx` — Interactive placement overlay for Left and Right paper pages active only when a card is held; renders 22px grid-snapped footprint in highlighter yellow (`#ffd84a`) when valid or red pen (`#b3261e`) when invalid/overlapping using `isValidPlacement()`; on click, places the widget, commits to Supabase, closes the drawer, and enters Arrange mode.
- Cancel interactions: holding a card is cancelled by `Escape`, tapping the handle, or turning pages; placement overlay unmounts completely so book navigation is never blocked.
- Removed the temporary dev add-control from `PageWidgetLayer.tsx`.
- Drawer is hidden while month setup is pending (`!isSetupDone`).
- Palette strictly L6 (`desk`, `kraft`, `oxblood`, `gold`, `paper`, `ink`), zero new hex codes, zero scrollbars at 1440×900.

### Phase 5 / Task 10b — Apply Starting Layout from Month Setup

- `components/setup/setupActions.ts` — `completeMonthSetup` applies the starting layout chosen in Month Setup:
  - **Layout "Empty"**: creates zero widgets.
  - **Layout "Journal"**: generates and inserts starting widgets in a single batch before setting `setup_done = true`:
    - **Memorable Moments** (`memorable-moments`, `22×18`) placed at `(x: 0, y: 0)` on the left page.
    - **Habit Tracker** (`habit-tracker`, `14×24`) placed at `(x: 0, y: 0)` on the right page with habit names sourced strictly from `setup_config.habits`.
    - **Sleep Score Number Log** (`number-log`, `6×24`, label: "Sleep Score") placed at `(x: 14, y: 0)` on the right page when sleep score is toggled on in `setup_config`.
    - **Line Graph** (`line-graph`, `w: 14`) placed at `(x: 0, y: 18)` on the left page reading from the sleep score Number Log via `sourceWidgetId`. Height is `h: 8` if Mood Tracker is enabled, `h: 12` if disabled (both above `8×8` minSize).
    - **Mood Tracker** (`mood-tracker`, `22×4`) placed at `(x: 0, y: 26)` on the left page when mood is toggled on in `setup_config`.
    - If sleep score is disabled and weight is enabled: Weight Number Log (`6×24`) placed at `(x: 14, y: 0)` on the right page.
  - **Omitted Trackers Note**: Weight and custom Number Logs are omitted from the Journal layout when no space remains; consider a layout change later.
  - **Server-Side Validation**: All candidate widgets run through `validateStartingWidgets()` (bounds within `22×30`, registry `minSize`, and pairwise zero-overlap check) before committing to database.
  - **Execution Order & Failure Handling**: Starting widgets created FIRST, then `setup_done = true`. If either step fails, user stays on the sheet with a red-pen error message, `setup_done` remains false, and the "Open the month" button is disabled during submission. Re-running after a partial failure never duplicates widgets.
  - **Single Batch Insert & Immediate UI Display**: All starting widgets are inserted in one Supabase batch call and returned through `MonthSetupWizard.tsx` to `OpenBook.tsx`, which updates `widgets` state and calls `router.refresh()` so widgets appear immediately without a page refresh.
  - **Idempotent**: Verifies `widgetCount > 0` before insertion; never runs on a month that already has widgets, and reloading the page never duplicates widgets.

### Phase 5 / Task 10 (Batch B) — Donut, Goal Bar, Checklist, Free Note

- **Widget 10: Donut** (`donut`, Group `Charts`, `10×10`, min `8×8`): Source is Poll or Habit Tracker. Calculates share of poll options across the month or habit completion shares using palette colors (`oxblood`, `kraft`, `gold`, `ink`, `redpen`) and hand-drawn SVG arc segments with deterministic jitter. Central count display and handwritten legend. Live updates via `entriesVersionStore`.
- **Widget 11: Goal Bar** (`goal-bar`, Group `Ask`, `14×4`, min `8×3`): Source is Counter (total sum) or Number Log (sum of readings). Hand-drawn progress capsule with pen-stroke diagonal hatching pattern, live target tracking, and red-pen completion marker.
- **Widget 12: Checklist** (`checklist`, Group `Ask`, `10×10`, min `6×6`): Stored in `entries` at `day = 1` as `{ items: [{ text, ticked, crossed }] }`. Hand-drawn SVG tick boxes, red-pen cross-out action, and bottom blank line to write new items.
- **Widget 13: Free Note** (`free-note`, Group `Write`, `10×10`, min `6×6`): Paper mode (`lined` with 22px grid rules or `blank`). Text stored in widget config and committed on blur. Dynamic font shrinking down to 12px floor; beyond that, overflow is hidden and a hand-drawn folded "more" corner appears. Zero inner scrolling.
- Registered in `registry.ts`. All `<select>` elements in `WidgetConfigCard.tsx` replaced with accessible handwritten radio list.

### Phase 5 / Task 10 (Batch A) — Chart Utilities, Live-Update Plumbing, First Three Charts

- `store/entriesVersion.ts` — Zustand store tracking global `version: number` incremented after successful entry saves.
- `components/widgets/entryHelpers.ts` — `saveWidgetEntryAndBump` helper calling `saveWidgetEntry` server action and bumping `entriesVersion` store. Swapped into all 6 existing widgets.
- `components/widgets/charts/chartUtils.ts` — Deterministic LCG seeded jitter (`jitter`, `seedFromString`), hand-drawn cubic bezier SVG path generator (`wobblePath`, `wobbleCircle`), normalisation and data series resolution helpers. Zero `Math.random` or `Date`.
- `components/widgets/WidgetConfigCard.tsx` — Added `widgetSource` field type rendering a handwritten dropdown listing this month's compatible widgets on the spread (with label/unit/title), passing `allWidgets` from `OpenBook`.
- **Widget 7: Line Graph** (`line-graph`, Group `Charts`, `14×14`, min `8×8`): Custom ink SVG polyline with seeded wobbly paths, sparse handwritten day numbers (1, 5, 10, 15, 20, 25, 30), optional vertical orientation (days top-to-bottom), no software axes/gridlines/tooltips.
- **Widget 8: Bar Chart** (`bar-chart`, Group `Charts`, `14×12`, min `8×8`): 31 daily bars with diagonal pen stroke hatching pattern, sparse day numbers, live-updating.
- **Widget 9: Scatter Plot** (`scatter-plot`, Group `Charts`, `12×12`, min `8×8`): Two-source picker, plots only days where both sources have recorded values using wobbly hand-drawn SVG dots.
- Registered in `registry.ts`. Mobile components delegate to desktop.

### Phase 5 / Task 9 (Batch B) — Last Three Widgets

- **Widget 4: Poll** (`poll`, Group `Ask`, `10×8`, min `8×6`): Question + 2–5 configurable options. DayStepper selects the active day (today or day 1). Tap an option to record `{ selectedOption: string }` for that day. Month totals shown as hand-drawn SVG tally marks (4 vertical strokes + 1 diagonal slash per group of 5) — never bars.
- **Widget 5: Number Log** (`number-log`, Group `Track`, `6×24`, min `4×18`): 32px header (label + unit), 31 rows at 15.61px/row. Tap a row to enter a number inline; clearing removes the value. Saves `{ value: number | null }` per day.
- **Widget 6: Mood Tracker** (`mood-tracker`, Group `Track`, `22×4`, min `14×4`): Five unique hand-drawn SVG faces (1=very sad … 5=very happy, no emoji). Layout: 16px header+DayStepper | 36px face picker | 36px 31-day row (15.09px/face slot). Tap a face in the picker to record `{ mood: 1..5 }` for the active day; small faces in the monthly row reflect stored moods.
- Registered in `registry.ts`. Mobile placeholder components delegate to desktop (Task 11).

### Phase 5 / Task 9 (Batch A) — Entries Plumbing + First Three Widgets
- `components/widgets/entryActions.ts` — Server actions (`getWidgetEntries`, `saveWidgetEntry`) with Zod schema validation (day 1..31, specific payload value shapes), RLS enforcement via `createClient()`, and red-pen error handling.
- `components/widgets/shared/DayStepper.tsx` — Approved shared day navigator using hand-drawn SVG prev/next arrows (no dropdowns or pickers) displaying "Day X". Defaults to today if viewed month matches current month, else day 1.
- Context plumbing: `year`, `month`, and `setupConfig` queried in `app/book/[year]/[month]/page.tsx` and threaded through `OpenBook` → `PageWidgetLayer` → `WidgetWrapper` → `WidgetRenderProps`.
- **Widget 1: Memorable Moments** (`memorable-moments`, Group `Track`, `22×18`, min `14×18`): Two columns (days 1–16 and 17–31) on 22px rules, tap to write Kalam text, ~500ms long-press toggles yellow highlighter (`#ffd84a`), line-end hand-drawn cross button toggles cross-out with SVG strike.
- **Widget 2: Habit Tracker** (`habit-tracker`, Group `Track`, `14×24`, min `8×18`): 31 daily rows (~14.58px/row) with rotated header names sourced strictly from `months.setup_config.habits` (empty table if unset; no invented habits). Red pen headers for `isRed` habits; tap cell draws hand-drawn SVG X (ink or red pen). Marks keyed by stable habit position (`"0"`, `"1"`).
- **Widget 3: Counter** (`counter`, Group `Track`, `6×6`, min `5×5`): Big handwritten Kalam number with hand-drawn `-` and `+` buttons, label, optional target, and optional `perDay` mode. In `perDay` mode, active day is adjusted via `DayStepper`. In non-`perDay` mode, total is stored at `day = 1`.
- Registered in `registry.ts` and barrel-exported in `index.ts`. Mobile placeholder components registered for each.

## Entries Table Value Shapes (L2, L11)
All widgets store daily values in `entries` table (`widget_id`, `day`, `value`):
1. **Memorable Moments** (`day` 1..31):
   `{ text: string, highlighted: boolean, crossedOut: boolean }`
2. **Habit Tracker** (`day` 1..31):
   `{ marks: Record<string, boolean> }` (keys are stable habit array index strings `"0"`, `"1"`, ...)
3. **Counter**:
   `{ count: number }`
   - `perDay = true`: stored at active day (1..31).
   - `perDay = false`: stored strictly at `day = 1`.
4. **Poll** (Batch B, `day` 1..31):
   `{ selectedOption: string }`
5. **Number Log** (Batch B, `day` 1..31):
   `{ value: number | null }`
6. **Mood Tracker** (Batch B, `day` 1..31):
   `{ mood: number }` (1..5)
7. **Checklist** (Task 10 Batch B, stored strictly at `day = 1`):
   `{ items: Array<{ text: string, ticked: boolean, crossed: boolean }> }`

## Pixel Size Reports (Default Sizes)
- **Habit Tracker** (`14×24` = 308×528px): 64px rotated header + 31 rows = **14.58px per row** (>= 14px threshold).
- **Number Log** (`6×24` = 132×528px): 32px header + 12px padding + 31 rows = **15.61px per row** (>= 14px threshold).
- **Mood Tracker** (`22×4` = 484×88px): 16px horizontal padding + 31 day slots = **15.09px width per day face slot** (>= 14px threshold).
- **Habit Tracker on Mobile (390×844)**:
  - Row height: **44.0px** (satisfies >= 44px tap target rule).
  - Cell width: **23.17px** with 12 habits, **46.33px** with 6 habits, **69.5px** with 4 habits (available grid width is 278px after 32px day column).
  - **Known Exception**: Habit Tracker cell widths below 44px on mobile are a documented, intentional exception to the 44px tap target rule due to columns sharing pocket notebook page width.

### Phase 6 / Task 11 (Batch A) — Mobile Layout Shell, Viewport Switch, and Tall Widgets
- **Mobile `z` column audit**: Confirmed `widgets.z` was completely unused (default 0, never queried for ordering or z-index). Now adopted as primary mobile sequence index: widgets order by `z ASC`, with tie-breakers: `page ('left' first) -> y -> x`.
- **Viewport Switch (Correction 7)**: `OpenBook.tsx` renders exactly ONE tree determined by `matchMedia("(min-width: 768px)")`, rendering a neutral desk-coloured placeholder during initial hydration to prevent mismatch. Unsaved state is retained across viewport resizes.
- **MobileBook Shell**:
  - Kraft `#b9895a` full background, single cream page (`#f4eddc`), dashed stitched binding line near left edge, hanging swallowtail red ribbon bookmark (`#b3261e`) at top edge.
  - Folded bottom-right dog-ear corner for "next" page (`48×48px` >= 44px).
  - Handwritten "back" text at bottom-left (`min-w-[44px] min-h-[44px]`).
  - Month tabs on right edge: all 12 tabs (JAN–DEC), each `46px` tall (>= 44px), active month in red pen with paper text, inactive in paper tint.
  - Touch gestures: horizontal swipe turning (swiping left turns forward, swiping right turns back) with horizontal distance threshold and vertical gesture rejection; suppressed during interaction with inputs or interactive controls.
  - Inter-month navigation: turning past month's last page turns to next month's first page; turning back from first page lands on previous month's last page. Unset months render `MonthSetupWizard`.
- **Dynamic Pagination & Tall Widgets**:
  - `MemorableMomentsMobile`: 3-subpage pagination (Days 1–10, 11–20, 21–daysInMonth). Rows are `44px` tall; cross-out buttons are `44×44px`. Continuation pages show handwritten `(cont.)`.
  - `HabitTrackerMobile`: 3-subpage pagination (Days 1–10, 11–20, 21–daysInMonth). Rows are `44px` tall; columns share the available 278px page grid width. Continuation pages show handwritten `(cont.)`.
  - `NumberLogMobile`: 3-subpage pagination (Days 1–10, 11–20, 21–daysInMonth). Rows are `44px` tall with inline tappable edit input. Continuation pages show handwritten `(cont.)`.
  - Zero inner scrollbars at 390×844.

### Phase 6 / Task 12 (Batch A) — PWA Manifest, Icons, and Desktop Print
- **Manifest**: Created `app/manifest.ts` and `public/manifest.json` with name `"Memorable Moments"`, `short_name: "Memorable Moments"`, `start_url: "/"`, `display: "standalone"`, `background_color: "#211b16"`, `theme_color: "#211b16"`.
- **Icons**: Generated `public/icons/icon.svg` using only L6 colours (oxblood book `#702028`, gold border `#d8b45a`, desk background `#211b16`, red pen ribbon `#b3261e`). Generated `icon-192.png`, `icon-512.png`, and `apple-touch-icon.png` via existing `sharp` tooling already in `node_modules` with ZERO new dependencies.
- **Layout Integration**: Added `themeColor: "#211b16"` to viewport, manifest reference, icons, and Apple Web App meta to `app/layout.tsx`. No service worker registered in development or in Batch A.
- **Print Ribbon Tab (Correction 6)**: Placed a second ribbon tab labelled "Print" at the top edge of `OpenBook.tsx` (styled identically to the Arrange tab, hidden while a month is unset).
- **Print is Desktop-Only (Correction 4)**: Print ribbon tab is mounted strictly on desktop spread; hidden on mobile.
- **Print Stylesheet (Correction 5)**: Added `@media print` in `app/globals.css`:
  - `print-color-adjust: exact` and `-webkit-print-color-adjust: exact` ensuring paper cream background and dot grids print.
  - `@page { size: landscape; margin: 0; }`.
  - Book spread scaled via `transform: scale(0.92)` to fit on a single landscape sheet.
  - Hides desk background, dark casing frame, ribbons, month tabs, folded corner, drawer, steppers, cross-out buttons, arrange handles, and browser UI chrome.
- **Offline Scope Documented (Correction 3)**:
  - Only entry reads and writes work offline (local cache, pending saves queue, replay on `online` and app start; upserts are idempotent; stale items for deleted widgets dropped).
  - Moving, resizing, configuring, adding or removing widgets, and Month Setup require an active connection; attempting them offline displays handwritten red-pen text ("needs a connection") and commits nothing.

### Phase 6 / Task 12 (Batch B) — Serwist Service Worker, Offline Cache & Sync, Sign-Out Clearing
- **Serwist Service Worker**: `app/sw.ts` implements Serwist caching precaching the app shell, manifest, and icons, using `NetworkFirst` for month routes (`/book/*`), `StaleWhileRevalidate` for static Next.js assets, and `CacheFirst` for Google fonts and images.
- **Standalone Build Pipeline**: `scripts/build-sw.js` transpiles and bundles `app/sw.ts` directly into `public/sw.js` using Next.js internal compiler tooling. Next 16 continues using Turbopack for the main app build without switching to webpack, and zero packages beyond `serwist` were added.
- **Service Worker Registration**: `components/pwa/ServiceWorkerRegister.tsx` registers `/sw.js` in production viewports via native `navigator.serviceWorker.register` without `@serwist/window`; never registers in development.
- **Offline Entry Cache & Replay Queue**:
  - `lib/offlineSync.ts` manages user-scoped entry caching (`mm_entries_${userId}:${widgetId}`) and an offline queue of pending saves (`mm_queue_${userId}`).
  - Automatically replays pending operations upon the browser `online` event and on application startup. Upserts are idempotent; stale entries for deleted widgets are discarded.
  - `components/widgets/entryHelpers.ts` integrates `getWidgetEntriesWithCache` and `saveWidgetEntryAndBump`, allowing all 12 widgets to read and write entries transparently while offline.
- **Privacy & Cache Cleansing on Sign-Out (Correction 2, L11)**:
  - `signOut()` in `lib/supabase/auth.ts` calls `clearAllLocalCaches()`.
  - Clears all `mm_*` keys from `localStorage`, deletes all CacheStorage caches, and signals the active Service Worker via a `CLEAR_CACHES` message.
- **Offline Non-Entry Safeguards (Correction 3)**:
  - Moving, resizing, and removing widgets in `PageWidgetLayer.tsx`, configuring in `WidgetConfigCard.tsx`, placing from drawer in `OpenBook.tsx`, and Month Setup submission in `MonthSetupWizard.tsx` check `navigator.onLine`. When offline, they display handwritten red-pen text (`"needs a connection"`) and change nothing.

### Phase 6 / Task 13 (Batch A) — Quality Pass: Palette, Symbols, Loading States, Reduced Motion, Contrast
- **Palette violations fixed**: Replaced `#fbf6e9` in `StickyNoteWidget.tsx` with `bg-paper` (`#f4eddc`). Confirmed zero black/white/gray Tailwind utility classes and zero off-palette colors in application styling.
- **Symbols audit**: Replaced `✕` (U+2715) character in `WidgetConfigCard.tsx` with a hand-drawn SVG icon. Confirmed zero emoji or non-hand-drawn symbol characters.
- **Loading states**: Replaced bare "Reading...", "Saving...", and "Opening..." with faint handwritten "turning the page...". Created `app/book/[year]/[month]/loading.tsx` rendering paper spread background with handwritten "turning the page...". Zero spinners, `animate-spin`, or `animate-pulse`.
- **prefers-reduced-motion**: Added global `@media (prefers-reduced-motion: reduce)` in `app/globals.css` disabling all 3D page flip keyframes, leaf shadows, sheet slide-in, and drawer animations. Verified JS timer gating in `ClosedBook.tsx` (cover swing) and `OpenBook.tsx` (page turn fade). Added `.drawer-slide` class in `WidgetDrawer.tsx`.
- **Contrast**: Full relative luminance calculation of every text/background pair. Raised all readable text below 4.5:1 (ink/60, ink/50, ink/40, ink/35) to minimum `text-ink/70` (4.9:1) across widgets, month setup, book folios, and mobile book. Fixed drawer tabs to satisfy contrast (desk on kraft = 4.63:1, paper on desk = 13.6:1). Tested and verified via Next.js production build (`npm run build`).

### Phase 6 / Task 13 (Batch B) — Quality Pass: Keyboard, Screen Readers, Measured Scrollbars
- **Focus Styles**: Global `:focus-visible` rule added to `app/globals.css` with 2px ink outline (`#1c2433`) + 2px highlighter yellow ring (`#ffd84a`), visible on paper, desk, and kraft. Removed competing `focus:outline-none` overrides from buttons in `HabitTrackerWidget.tsx`, `MobileBook.tsx`, `WidgetDrawer.tsx`, and `ChecklistWidget.tsx`.
- **Keyboard Navigation & Real Interactive Elements**:
  - Folded dog-ear corner in `OpenBook.tsx` converted from `role="button" div` to real `<button>`.
  - Option cards in `MonthSetupWizard.tsx` (Step 1 "Same as last" / "Fresh", Step 6 "Journal" / "Empty") converted to `<button>` with proper ARIA radio states.
  - Step 5 tracker rows (Weight, Sleep Score, Mood Rating) in `MonthSetupWizard.tsx` converted from clickable divs to accessible `<button type="button" role="checkbox">` elements.
  - `PlacementOverlay.tsx` received `onKeyDown` (Enter and Space) handler for keyboard widget placement.
  - Number Log row clicking in `NumberLogWidget.tsx` converted from clickable div rows to real `<button type="button">` with dynamic aria-labels (`Day X: value unit` / `unrecorded`).
  - Memorable Moments received keyboard highlight toggle shortcut (Alt+H) and dedicated highlight toggle buttons (with `>=44px` touch targets on mobile) alongside the cross-out buttons.
  - Hover-only cross-out and highlight controls configured with `group-focus-within:opacity-...` so they show on keyboard focus as well as hover.
  - Habit tracker daily cells and mood faces confirmed as real `<button>` elements.
  - **Known Gap**: Drag and resize in Arrange mode by keyboard is a KNOWN GAP (listed, not built).
- **Screen Reader Support**:
  - All 5 chart widgets (`BarChartWidget.tsx`, `LineGraphWidget.tsx`, `DonutWidget.tsx`, `GoalBarWidget.tsx`, `ScatterPlotWidget.tsx`) updated: removed `aria-hidden`, added `role="img"` and dynamic data-based `aria-label` summaries (e.g. `"Line graph of Sleep Score, 12 entries, latest 7"`).
  - Codebase audit: 100% of buttons without visible text have an explicit `aria-label` or `aria-labelledby`.
  - Every `<input>` throughout the app audit: day-based inputs name their day and state (e.g. `"Day 3: memorable moment (highlighted)"`, `"Day 3: Sleep Score"`); wizard inputs have clear labels (`"Habit 1 name"`, `"Custom number 1 name"`).
  - Confirmed `<html lang="en">` and metadata title `"Memorable Moments"` in `app/layout.tsx`.
- **Measured Scrollbars (No inner scrollbars)**:
  - Automated measurement with headless browser CDP at 1440x900 and 390x844:
    - Login Cover (`/`): 1440x900 (scroll 1440x900, 0 overflow); 390x844 (scroll 390x844, 0 overflow).
    - Month Setup Wizard: 1440x900 (scroll 1440x900, 0 overflow); sheet card client 518x588 vs scroll 518x588 (0 overflow across all 7 steps); 390x844 (scroll 390x844, 0 overflow).
    - Open Book Spread: 1440x900 (scroll 1440x900, 0 overflow); 390x844 (scroll 390x844, 0 overflow).
    - Drawer Open (1440x900): page scroll 1440x900 (0 overflow); card tray horizontal scroll 800px > 648px (allowed drawer tray horizontal scrolling works via touch & keyboard).
    - Zero widget content overflow beyond its bounding box.

### Phase 8 / Task 14 — L11 Route Guard
- `middleware.ts`: protects all `/book/*` routes using `@supabase/ssr` `createServerClient`.
  - Refreshes session cookies and checks user authentication with `supabase.auth.getUser()`.
  - Redirects unauthenticated visitors attempting to access `/book/*` to `/` with `Cache-Control: no-store, no-cache, must-revalidate`.
  - Matcher configured strictly to `['/book/:path*']` so it never touches `/`, `/_next`, `/sw.js`, `/manifest.webmanifest`, or static assets.
  - Adds `Cache-Control: no-store, no-cache, must-revalidate` to all book responses so browser history Back navigation after sign-out does not display cached spreads.
- `app/book/[year]/[month]/page.tsx`:
  - Enforces server-side authentication with `supabase.auth.getUser()`. If no authenticated user exists, immediately redirects to `/` before loading month setup or widget data.

## Next
- Task 11 (Batch B) — Mobile Arrange mode (long-press on top ribbon, move up/down), WidgetDrawer placement on mobile, ClosedBook at 390px, MonthSetupWizard at 390px, and audit of remaining widgets' mobile render.

## Open Questions
- Sign-up flow and password reset not built.
- UI currently has no sign-out control (user session can only be cleared programmatically / via dev console).

## Locked Decisions (L1–L14)

**L1** Book, not website: no navbar, sidebar, dashboard cards, SaaS modals, or scrolling inside a page. Navigation = ribbon, edge tabs, folded corner, page turns.

**L2** Next.js App Router + TypeScript + Tailwind + Supabase (auth + Postgres + RLS).

**L3** Extra packages allowed ONLY: zod, zustand, @dnd-kit/core, serwist. No UI kit (no shadcn, MUI, Chakra).

**L4** Charts are custom hand-drawn-look SVG. No chart library.

**L5** Fonts: Kalam (handwriting), Cormorant Garamond (cover). No others.

**L6** Palette only: desk #211b16, paper #f4eddc, ink #1c2433, red pen #b3261e, highlighter #ffd84a, oxblood #702028, gold #d8b45a, kraft #b9895a, orange #ff5a1f.

**L7** Paper: dotted (default), squared, lined, blank. 22px grid, 1.4px dots.

**L8** Desktop >=768px two-page spread; mobile one page; same data.

**L9** Every month starts with the Month Setup wizard.

**L10** Widgets are placed only via the Widget Library and snap to the 22px grid.

**L11** Login required; users see only their own data (RLS).

**L12** Custom CSS 3D page turn. No flip-book library.

**L13** No emoji. Hand-drawn SVG icons.

**L14** No extra features, redesigns, renames, or dependencies unless asked.
