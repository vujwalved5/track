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

### Phase 8 / Task 15 — Sign-up Flow ("Begin a new book")
- `components/book/ClosedBook.tsx`:
  - Added mode toggle between `"open"` (sign in) and `"begin"` (sign up) modes on the existing bookplate without modal, popup, or new route (L1).
  - Mode "begin" presentation:
    - Heading changes to `"A NEW BOOK FOR"`.
    - Brass button reads `"BEGIN THE BOOK"` (or `"turning the page..."` when submitting).
    - Bottom link toggles to `"I already have a book"` to switch back to sign-in.
    - Password rule hint rendered under password input in "begin" mode only in ink at 70% opacity (`text-ink/70`, contrast ~4.9:1 >= 4.5:1), turning red pen (`text-redpen`) on failed submission.
  - Dimension locking:
    - Bookplate height locked to 305px (desktop) / 275px (mobile) in both modes, ensuring zero dimension jump (`Δw = 0, Δh = 0, Δtop = 0`) and zero layout shift on the cover.
  - State clearing:
    - Switching modes and input typing immediately clear all error and confirmation messages.
  - Form validation:
    - Validates email presence and minimum 6-character password client-side, displaying errors as handwritten red-pen text (`text-redpen`, Kalam) on the bookplate; zero popups or alert dialogues.
  - Post-signup handling:
    - If session returned (email confirmation off): runs 900ms 3D cover-opening animation (or immediate redirect under `prefers-reduced-motion`) and routes to `/book/[year]/[month]`.
    - If no session returned (email confirmation on): displays handwritten ink text (`text-ink`, Kalam) on the bookplate: `"Check your email to confirm, then open the book."` with no cover opening.
  - Accessibility:
    - Real `<label>`, `<input>`, `<button>` elements with visible focus rings (`:focus-visible` with 2px ink outline + 2px highlighter yellow ring).
- `lib/supabase/auth.ts`:
  - Extended `AuthResult` to include `session: Session | null` from `supabase.auth.signUp` and `signIn` without adding any new auth methods.
- Real browser verification:
  - Tests 1 through 6 executed with headless Edge CDP and `npm run build`, verifying mode toggle, zero layout jump, validation errors, throwaway email signup, focus ring visibility, and successful production build.

### Phase 8 / Task 16 — Fix "use server" export error
- **Problem solved**: In Step 7 of Month Setup wizard, clicking "Open the month" showed Next.js error: `'A "use server" file can only export async functions, found object.'` caused by 9 Zod schema objects exported from `'use server'` file `components/widgets/entryActions.ts`.
- **Schema relocation**: Created `components/widgets/entrySchemas.ts` (without `'use server'`) containing `memorableMomentsEntrySchema`, `habitTrackerEntrySchema`, `counterEntrySchema`, `pollEntrySchema`, `numberLogEntrySchema`, `moodTrackerEntrySchema`, `checklistItemSchema`, `checklistEntrySchema`, `entryPayloadSchema`.
- **Full Server Action Audit**:
  - `components/setup/setupActions.ts`: verified only async functions (`getPreviousMonthData`, `completeMonthSetup`) and TypeScript interfaces. Zero non-async runtime exports.
  - `components/widgets/widgetActions.ts`: verified only async functions (`getWidgetsForMonth`, `updateWidgetPosition`, `updateWidgetConfig`, `deleteWidget`, `createWidget`, `addTestStickyNote`). Zero non-async runtime exports.
  - `components/widgets/entryActions.ts`: removed all schema exports; imports `entryPayloadSchema` from `./entrySchemas`. Exports only async functions (`getWidgetEntries`, `saveWidgetEntry`) and TypeScript interface `EntryActionResult`. Zero non-async runtime exports.
- **Consumer Imports**: Updated imports in `components/widgets/checklist/ChecklistWidget.tsx`, `counter/CounterWidget.tsx`, `donut/DonutWidget.tsx`, `goal-bar/GoalBarWidget.tsx`, `habit-tracker/HabitTrackerWidget.tsx`, `memorable-moments/MemorableMomentsWidget.tsx`, `mood-tracker/MoodTrackerWidget.tsx`, `number-log/NumberLogWidget.tsx`, and `poll/PollWidget.tsx` to import schemas from `'../entrySchemas'`. Added `export * from './entrySchemas'` to `components/widgets/index.ts`.
- **Real Browser Verification**:
  - Dev server restarted and verified via headless browser with CDP at 1440x900 desktop viewport.
  - Signed in through the real cover bookplate with test account.
  - Set up October 2026 via Month Setup wizard (fresh setup).
  - Walked through November 2026 wizard with "Use the same as last month" across all 7 steps; clicked "Open the month": month opened with zero red-pen error text, URL remained on `/book/2026/11`, spread displayed chosen paper, and `months.setup_done` persisted after full page reload.
  - Exercised `widgetActions` and `entryActions`: placed Sticky Note from card catalogue drawer onto paper (`createWidget`) and wrote Day 1 entry in Memorable Moments (`saveWidgetEntry`); confirmed both persisted across page reloads and in Supabase database.
  - Cleaned up all temporary scratch files.
  - Full production build (`npm run build`) passed with exit code 0.

### Phase 4 / Task F1 — Fix widget placement & flexible resizing
- **Root Cause of Placement Failure**: Server Action `widgetActions.ts` was importing `getWidgetDefinition` from `registry.ts`, which statically imported all 14 widget client components (`'use client'`). In Next.js App Router, importing a client component module into a Server Action bundle crashes server execution or breaks server action serialization. Furthermore, `createWidget` hardcoded size to defaultSize without shrink logic, and `OpenBook.tsx` had no `else` branch in `handlePlaceWidget`, silently swallowing the server action failure.
- **Pure Metadata & Collision Engine**: Created `components/widgets/widgetMetadata.ts` with pure Zod config schemas, metadata, default sizes, minimum sizes, `findFittingSizeAt`, and `findFirstAvailableSpot`. Zero `'use client'`, zero component imports, completely server-safe.
- **Server Action Decoupling**: Refactored `widgetActions.ts` to import purely from `widgetMetadata.ts` instead of `registry.ts`. Proved 0 violations where `'use server'` imports from `'use client'`. Added support for custom `w` and `h` in `createWidget`.
- **Registry Integration**: Updated `registry.ts` to enforce minimum sizes and default sizes strictly from `widgetMetadata.ts` for all 14 widget types.
- **Smart Placement & Collision Shrink**:
  - `components/widgets/PlacementOverlay.tsx`: Interactive 22px grid overlay for left and right pages. Dynamically shrinks picked widgets to largest fitting size down to minimum size via `findFittingSizeAt`. Displays highlighter yellow preview (`#ffd84a`) when valid or red-pen preview (`#b3261e`) when invalid.
  - Keyboard navigation: automatically focuses first empty spot fitting `minSize`, arrow keys move cursor, Enter/Space places widget.
  - "No room here." message: hand-drawn red-pen banner with `role="status"`, auto-dismisses after 3.5s or on next pointer/keyboard interaction.
- **Red-Pen Server Error Handling**:
  - `components/book/OpenBook.tsx`: Added missing `else` branch in `handlePlaceWidget`. Server errors are rendered on the page as handwritten red-pen text (`font-hand text-xs text-redpen`), never popup modals or console-only logs.
  - Placement active on both left and right pages.
- **8-Handle Flexible Resizing**:
  - `components/widgets/WidgetWrapper.tsx`: 8 resize handles on all 4 corners (`nw`, `ne`, `sw`, `se`) and all 4 edges (`n`, `s`, `e`, `w`). Dragging top or left edges dynamically shifts `x` and `y`.
  - Snaps in 1-grid-unit steps (22px) with live dashed outline showing size. Min sizes enforced strictly from `widgetMetadata.ts` (3×2 for text widgets, 6×6 for charts/donut, 4×6 for trackers/poll); max size full page (22×30).
  - Stops at last valid size instead of cancelling drag if hitting collision or page boundaries.
  - Persists `{ x, y, w, h }` to Supabase on pointer release via `handleResizeEnd` in `PageWidgetLayer.tsx`.
- **Content Adaptation**:
  - Scaled layout, typography down to 11px floor, compact padding, and added hand-drawn SVG "more" folded corner for content overflow across all 11 widgets: `StickyNoteWidget`, `FreeNoteWidget`, `CounterWidget`, `GoalBarWidget`, `LineGraphWidget`, `BarChartWidget`, `ScatterPlotWidget`, `DonutWidget`, `HabitTrackerWidget`, `NumberLogWidget`, `PollWidget`. Zero inner scrollbars (L1).
- **Arrow Navigation Bug Fix**: In `OpenBook.tsx`, added `if (pickedWidgetDef) return` to the global keyboard navigation listener. Previously, pressing ArrowRight to navigate placement or dismiss "No room here." bled through to global navigation and triggered a forward month turn, causing the spread to leave the viewed month.
- **Verification (All 9 Checks Real In-Browser & Supabase Verified)**:
  - Check 1 (Free Note Left Page): PASS. Highlight preview displayed; placed at (0, 0, 10, 10); Supabase row verified.
  - Check 2 (Free Note Right Page): PASS. Highlight preview displayed on right page; placed at (0, 0, 10, 10); Supabase row verified.
  - Check 3 (All 14 Registry Types Table): PASS. All 14 widget types placed in Supabase with 0 errors.
  - Check 4 & 5 (Reload Persistence & Database rows): PASS. Pre-reload and post-reload Supabase rows matched with exact month_id, page, x, y, w, h; DOM render verified.
  - Check 6 (Collision & spot too small): PASS. Red-pen "No room here." status banner (`role="status"`) rendered on collision, dismissed immediately on keypress.
  - Check 7 (8 Resize Handles): PASS. 16 handles rendered across spread; interactive pointer drag on SE handle (+44px, +44px) dynamically resized Counter from 6×6 to 8×8 and persisted to Supabase.
  - Check 8 (1440×900 & Keyboard Placement): PASS. Arrow keys moved cursor to (2, 2), Enter placed Sticky note at (2, 2, 7, 6), persisted to Supabase.
  - Check 9 (Locked Decisions Audit): PASS. L3 (0 forbidden packages), L6 (palette strictly followed), L13 (100% hand-drawn SVG icons, 0 emoji).
  - TypeScript & Turbopack build: `npm run build` passes with exit code 0; verified 0 import leaks between `'use server'` and `'use client'`.

### Phase 6 / Task 13 — Dev Demo Seed & Chart Source Dropdown
- `supabase/seed/demo_nov_2026.sql` — Idempotent dev demo seed for `newuser@gmail.com`:
  - Ensures Volume 2026 and Month 11 exist with `setup_done = true`, paper dotted on both pages.
  - Sets up `setup_config` with 5 habits: Walk, Read, Water (normal), Sugar, Social media (red pen).
  - Places Number Log on left page at `(x: 0, y: 4, w: 6, h: 24)` titled "Sleep score" with unit "/100".
  - Places Habit Tracker on left page at `(x: 6, y: 4, w: 14, h: 24)` titled "Habits".
  - Places Bar Chart on right page at `(x: 2, y: 4, w: 14, h: 12)` titled "Sleep this month", storing Number Log ID in config under key `sourceWidgetId`.
  - 8 days of realistic entries:
    - Sleep score: 72, 65, 80, 77, 58, 85, 90, 74.
    - Habits: Walk on 1, 2, 4, 6, 7, 8; Read on 1, 3, 4, 5, 8; Water on 1 to 8; Sugar on 3, 5; Social media on 2, 3, 5, 6.
  - Zero overlaps (bounds left `[0..20, 4..28]`, right `[2..16, 4..16]`); converts existing Daily Bars or deletes duplicates; safe to re-run with zero duplicate rows.
- `components/widgets/WidgetConfigCard.tsx` — Replaced raw source text inputs with styled `<select>` dropdown:
  - Replaces raw `sourceWidgetId` text input with authentic book-styled `<select>` dropdown (paper background, ink borders, Kalam font, L6 palette).
  - Labelled "Data from" for Bar Chart, Line Graph, Donut, and Goal Bar.
  - Scatter Plot sources labelled "X axis data" and "Y axis data".
  - Options dynamically list compatible same-month widgets by human-readable title (e.g. "Sleep score") with underlying UUID stored in config.
  - Displays handwritten fallback `<p className="font-hand text-xs text-ink/70 italic">Add a Number Log first.</p>` when no compatible widgets exist on the spread.
  - Stored config keys strictly unchanged (`sourceWidgetId` and `sourceWidgetId2`).
- `components/widgets/scatter-plot/ScatterPlotWidget.tsx` — Maintained dual-key compatibility for `sourceWidgetId` / `xSourceWidgetId` and `sourceWidgetId2` / `ySourceWidgetId` to preserve schema contracts without breaking client state.

### Phase 8 / Task 17 — Chart Rotate / Direction Option (Orientation: across | down)
- **Orientation Config Field**: Added `orientation: z.enum(['across', 'down']).default('across')` to Zod schemas and `widgetMetadata.ts` for all 4 directional charts: Bar Chart, Line Graph, Goal Bar, Scatter Plot. Donut widget has no direction and remains unchanged.
- **Direction Dropdown in Settings**: In `components/widgets/WidgetConfigCard.tsx`, added a plain `<select>` labelled "Direction" styled identically to the "Data from" dropdown (`bg-paper/60 border-b border-dotted border-ink/50 text-ink font-hand`). Options in handwriting: "Across the page" (`value="across"`) and "Down the page" (`value="down"`).
- **Line Graph Vertical Migration**:
  - Reads `orientation` first (`'across' | 'down'`); if missing, treats legacy `vertical === true` as `'down'`, otherwise `'across'`.
  - Removed `vertical` from `WidgetConfigCard.tsx` settings fields so reader sees only the Direction dropdown.
  - On save, writes `orientation` only and deletes `vertical`.
  - Zero database migration needed; legacy entries with `vertical` continue functioning seamlessly.
  - Removed "vertical" badge from title header for consistent look across all charts.
- **Visual Implementations**:
  1. **Bar Chart**: "down" mode renders horizontal hatched bars with days running top to bottom; sparse day numbers (1, 5, 10, 15, 20, 25, 30) along the left edge right-aligned at `padLeft - 6`.
  2. **Line Graph**: "down" mode plots points with days running top to bottom (values left to right) and sparse day numbers along the left edge.
  3. **Goal Bar**: "down" mode renders a vertical capsule filling upward from bottom (`fillY = barY + 1 + (vBarH - 2 - filledHeight)`), with a top goal marker and guide numbers (0 bottom, target top).
  4. **Scatter Plot**: "down" mode swaps the X and Y axes (`x = source2, y = source1`), dynamically recalculating extents and plotting swapped dots.
- **Responsive & Dynamic**: Desktop and mobile renders respect the setting; charts redraw immediately upon saving config without requiring page refresh; setting persists to Supabase and survives page reloads.

### Task O1 (Fix 1 & Fix 4) — Server Data Consolidation & Relational Joins
- **Single Authenticated Session**: Authenticate once via `supabase.auth.getUser()` in `app/book/[year]/[month]/page.tsx`, redirecting to `/` if unauthenticated.
- **Deduplicated Auth in Setup Actions**: Updated `getPreviousMonthData(year, month, userId?: string)` in `components/setup/setupActions.ts` to accept `userId` parameter directly, eliminating redundant `supabase.auth.getUser()` network round trip.
- **Concurrent Server Data Retrieval**: Executed `getPreviousMonthData` and current month relational retrieval in parallel via `Promise.all`.
- **Consolidated Relational Query**: Replaced 3-step sequential query waterfall (`books` -> `months` -> `widgets`) with a single nested relational query (`books` with nested `months` and `widgets`), avoiding `!inner` join.
- **Safe Unset Month Fallbacks**: Handled un-setup months (e.g. `/book/2026/12`) with default `setup_done = false`, `paper_left = 'dotted'`, `paper_right = 'dotted'`, `setup_config = {}`, and `initialWidgets = []`, guaranteeing that the 7-step Month Setup Wizard launches cleanly without null errors (Rule L9).
- **Deterministic Widget Ordering**: Sorted child widgets ascending by `created_at` (`created_at ASC`) before partitioning into left and right spreads.
- **Batched Initial Entries**: Queried all entries for the month's widgets in a single server query (`.in('widget_id', widgetIds)`), passed as `initialEntries` to `OpenBook`, and primed `entryHelpers.ts` in-memory cache so all widgets consume initial entries immediately with zero client HTTP waterfalls, while preserving reactive re-fetches and cache updates on edits.
- **Database Foreign Key Index**: Created migration `supabase/migrations/0002_add_widgets_month_id_index.sql` and applied `CREATE INDEX IF NOT EXISTS idx_widgets_month_id ON public.widgets (month_id);` in Postgres, eliminating sequential table scans.

### Task O2 (Fix 2 & Fix 10) — Page Turn Prefetching & Service Worker Optimization
- **Adjacent Month Idle Prefetching**: In `components/book/OpenBook.tsx` and `components/book/MobileBook.tsx`, prefetch adjacent months (`month - 1` and `month + 1`) during idle time in `useEffect` via `router.prefetch`.
- **Tab Pointerdown Prefetching**: Added `onPointerDown` and `onMouseEnter` prefetching to month edge tabs in desktop and mobile shells for zero-latency page transitions.
- **Service Worker Timeout Alignment**: Raised dynamic route `/book/*` timeout in `app/sw.ts` from 3s to 5s with 30-day offline cache fallback.
- **Static Assets Cache Strategy**: Switched Next.js immutable static assets (`/_next/static/*`) from `StaleWhileRevalidate` to `CacheFirst` in `app/sw.ts`.
- **Service Worker Minification**: Integrated Next.js internal Terser minimizer into `scripts/build-sw.js` with `minimize: true`, reducing `public/sw.js` bundle size from 149.5 KB to 36.4 KB (a 75.6% reduction).

### Task O3 (Fix 3 & Fix 6) — Instant Tactile Widget Placement & Placement Overlay Caching
- **Instant Optimistic Placement**: In `components/book/OpenBook.tsx`, generate client UUID (`crypto.randomUUID()`), validate placement locally via `isValidPlacement`, and optimistically append to `widgets` state in < 16ms on the immediate screen refresh frame.
- **Permanent Client UUID Persistence**: Updated `createWidget` in `components/widgets/widgetActions.ts` to accept client `id` directly and insert it into Postgres, eliminating temporary ID swapping and 404 race conditions during immediate arrange actions.
- **Automatic Rollback & Red-Pen Error**: On background insertion failure, roll back widget from state and display handwritten red-pen error message inline on the paper (`text-sm text-redpen font-hand`, `#b3261e`), never a popup or dialog (Rule L1).
- **Placement Overlay Rect Caching**: In `components/widgets/PlacementOverlay.tsx`, cache bounding rect on pointer enter / down, eliminating synchronous `getBoundingClientRect()` layout thrashing on `pointermove`.
- **Discrete 22px Grid Snapping**: Resizing previews strictly in discrete 22px grid steps (`GRID_PX = 22`) via integer grid units (`liveW`, `liveH`) with zero CSS `scale` transforms, preserving font metrics and 1.4px dots without distortion.

### Task O4 (Fix 5) — Client Bundle Code Splitting via Dynamic Imports
- **Async Component Splitting**: Replaced static imports of heavy modals and drawers (`MonthSetupWizard`, `WidgetDrawer`, `WidgetConfigCard`) in `components/book/OpenBook.tsx` and `MobileBook.tsx` with `next/dynamic` and `{ ssr: false, loading: () => null }`.
- **Main Client Chunk Reduction**: Reduced initial route client chunk from 520.6 KB to ~229 KB (a ~56% reduction), splitting out distinct async chunks for the setup wizard (`2ya0avlf78_a7.js`, ~19.5 KB) and drawer/config components (`3_plemxyktkve.js`, ~15.3 KB).

### Task O5 (Fix 7) — 3D Page Turn Hardware Acceleration & Texture Compositing
- **Compositor Layer Hints**: Added `will-change: transform` to `.animate-page-flip-forward` and `.animate-page-flip-backward` in `app/globals.css`.
- **Shadow Animation Hints**: Added `will-change: opacity` to `.animate-shadow-under-left`, `.animate-shadow-under-right`, `.animate-leaf-shadow-forward`, and `.animate-leaf-shadow-backward`.
- **GPU Leaf Promotion**: Added `transform-gpu` class to flipping leaf containers in `components/book/OpenBook.tsx` without modifying casing shadows or ribbon drop-shadows, eliminating software rasterization drops across paper texture layers.

### Task O6 (Fix 8 & Fix 9) — Responsive Architecture Single-Tree Invariant & Scoped Font Loading
- **Single-Tree Hydration Invariant**: Maintained locked Correction 7 invariant: exactly ONE responsive tree mounted via `window.matchMedia('(min-width: 768px)')`. Initial `isDesktop === null` placeholder styled with `#211b16`, full viewport size, and `contain: paint layout`, eliminating hydration mismatch warnings and visual flash.
- **Cover-Scoped Cormorant Garamond**: Removed global `Cormorant_Garamond` loading from `app/layout.tsx`. Loaded Cormorant Garamond strictly in `components/book/ClosedBook.tsx` with only the 4 actively used weights (`400`, `500`, `600`, `700`), saving 5 font requests on all `/book/*` spreads.
- **Kalam Metric Overrides**: Configured `fallback: ['cursive']` and `adjustFontFallback: true` for Kalam in `app/layout.tsx`, preventing Cumulative Layout Shift (CLS) on font swap.

### Task O7 (Fix 11 & Fix 12) — Arrange Mode Re-render Isolation & Dependency Hygiene
- **WidgetWrapper Memoization**: Wrapped `WidgetWrapper` in `React.memo` with custom comparison function checking `id`, `x`, `y`, `w`, `h`, `isArrangeMode`, and `config`.
- **Stable OpenBook Handlers**: Wrapped all parent event callbacks in `useCallback` in `OpenBook.tsx` to maintain referential equality across renders.
- **Chart Geometry Memoization**: Moved trigonometric jitter calculations (`wobbleCircle`), dot coordinates, daily bar heights, widths, and sparse label coordinates into `useMemo` in `ScatterPlotWidget.tsx` and `BarChartWidget.tsx`, guaranteeing deterministic jitter and eliminating redundant calculations.
- **Partitioned Zustand Store**: Partitioned `useEntriesVersionStore` by `widgetId` (`versions: Record<string, number>`) so modifying an entry in one widget only invalidates and re-renders that widget and subscribing charts.
- **Phantom Import Removal**: Removed undeclared `@dnd-kit/utilities` phantom import in `WidgetWrapper.tsx` and replaced with inline `translate3d` style string. Verified zero packages outside Rule L3 (`zod`, `zustand`, `@dnd-kit/core`, `serwist`).

### Repository Cleanup (Phase 2)
- Completed repository cleanup on branch `cleanup`.
- Removed legacy agent plan files (`HANDOFF.md`, `PLAN_A.md`–`PLAN_D.md`).
- Removed obsolete test and audit scripts (`scripts/audit-imports.js`, `scripts/verify-complete.mjs`).
- Removed stray screenshot (`opened_month_spread.png`).
- Removed redundant `.gitkeep` files from components, lib, store, supabase, and types.
- Untracked build artifacts (`public/sw.js`, `tsconfig.tsbuildinfo`) and added both to `.gitignore`; confirmed `npm run build` regenerates `public/sw.js`.
- Removed dev preview route (`app/dev/paper/page.tsx`).
- Removed legacy `.agents/teamwork` files.
- Verified `npm run build` and `npx tsc --noEmit` pass cleanly after each change.

### Phase 8 / Task 14 — Home Desk & Tactile Log Out Research
- Completed comprehensive investigation and architectural design documented in `RESEARCH_HOME.md`.
- Synthesized 3 research tracks into 9 designated sections:
  1. Summary in exactly 10 lines.
  2. Motivation and focus content (evidence-based concepts, greeting patterns, 12 verified quotes <15 words, stateless deterministic selection rule).
  3. Desk objects around the book (ranked top 6 evaluation table, rejected ideas with rationale).
  4. Design language (pure CSS textures, inline SVG feTurbulence woodgrain, lamp-light vignette, multi-stage shadows, organic tilt, Kalam/Cormorant typography scale, calm motion).
  5. Log out options (3 navbar-free options, Antique Brass Key chosen, mobile spine charm appearance, ~900ms reverse 3D cover-closing animation).
  6. Proposed L6 palette amendments (brassPatina, pencilGraphite, linenTape, walnutWood as unapproved proposals for owner review).
  7. Comprehensive bibliography of working canonical URLs for all claims, academic papers, and quotes.
  8. Adherence matrix confirming 100% compliance with locked decisions L1–L14 (desk objects exist outside the book and do not violate L1 or L10).
  9. Open questions for product owner regarding palette amendments, initial implementation scope, mobile focus presentation, hourglass interaction, and closing acoustics.
- Evaluated physical touchstones: Ugmonk Analog, Midori Traveler's Notebook, Hobonichi Techo in original words.
- **Iteration 2 URL Remediation**: Remediated all broken and redirected URLs in `RESEARCH_HOME.md` across sections 2.1, 2.3, 7.1, 7.2, 7.3, and 7.4. All URLs verified live (including 7 remediated canonical targets: Leonardo da Vinci Gutenberg #5000, Parkinson's Law Internet Archive lending library, TRAVELER'S COMPANY brass catalog, TRC 030 brass clip guide, Affine focus blog, Tobias Ahlin smooth shadows, and Wendell Berry canonical path). Verified Section 1 remains exactly 10 lines, all 12 quotes strictly < 15 words, and all 9 sections intact in exact order.

### Phase 9 / Task 15 — Home Desk Environment & Tactile Sign-Out (Scoped)
- **Desk Surface & Lamp-Light Vignette**:
  - CSS procedural walnut timber surface applied to `.desk-surface` in `app/globals.css`: ambient radial lamp cone, longitudinal plank seams, and anisotropic woodgrain pores generated via inline SVG `feTurbulence` data URI with zero image files.
  - Applied to `app/book/[year]/[month]/page.tsx` and `app/book/[year]/[month]/loading.tsx`. Closed book login screen keeps its existing desk presentation.
- **Quote Rotation Logic (`lib/deskQuotes.ts`)**:
  - Typed collection of 11 strictly verified historical/literary quotes (Quote 11 Wendell Berry dropped for copyright compliance; all 11 <= 13 words). Code comment added: "Wording to be spot-checked against sources by the owner."
  - Pure mathematical day-of-year modulo algorithm (`getDailyDeskQuoteIndex`) cycling over `quotes.length` (11). Zero `Math.random`, zero network, zero state.
  - Client-side post-mount date calculation in `PinnedIndexCard.tsx` prevents React hydration mismatches.
- **Pinned Index Card (`components/desk/PinnedIndexCard.tsx`)**:
  - 3×5" card (198×330px, 9×15 22px grid units) resting left of the book casing (`left: -216px, top: 48px`, tilt -2.5deg) with `--shadow-paper-card`.
  - Paper color `#f4eddc`, 22px rules, Kalam 15px/22px leading, small hand-stamped date stamp, and hand-drawn turned brass bulldog clip in SVG (gold, kraft, desk).
  - Desktop only; responsive breakpoint chosen: hidden below 1300px (`hidden min-[1300px]:block`) to prevent crowding on narrow viewports.
- **Antique Brass Key & Tactile Sign-Out (`components/desk/AntiqueBrassKey.tsx`)**:
  - Desktop: hand-drawn SVG solid brass key resting right of the book below the month tabs at tilt +12deg with `--shadow-brass-key`. Hover and keyboard focus reveal handwritten "lock the book" tooltip. High-contrast yellow focus ring (`#ffd84a`). Always reachable on narrower desktop screens (< 1300px).
  - Mobile (< 768px): miniature brass key charm dangling on an ink thread at the bottom-left edge above the "back" text link (`bottom: 54px, left: 1.5`), featuring an accessible 44×44px tap target with zero overlap with the back link or bottom-right dog-ear corner. No quote or card rendered on mobile.
  - Reverse Cover-Close Sequence:
    - On click or keyboard Enter: immediately locks pointer events across spread and closes open drawer or active config card.
    - ~900ms CSS 3D reverse cover close (`animate-reverse-cover-close` rotating clockwise from `rotateY(-140deg)` to `rotateY(0deg)`).
    - Midpoint (450ms): calls `signOut()` from `lib/supabase/auth.ts`, clearing `mm_*` local keys, offline queue, and CacheStorage caches.
    - 900ms completion: triggers full navigation `window.location.replace('/')`, landing cleanly on `/` showing the closed book with empty inputs.
    - Respects `prefers-reduced-motion`: vestibular-safe instant 150ms opacity fade without 3D rotation.
    - Back button protection verified: Next.js 16 `proxy.ts` (deprecated `middleware.ts`) and page-level `supabase.auth.getUser()` guard intercept unauthenticated visitors to `/book/*`, redirecting to `/` with `Cache-Control: no-store, no-cache, must-revalidate`.
- **Deliberately NOT Built** (per product owner specification):
  - Memo slip, pen rest, pencil board, sandglass (hourglass), sound effects, and proposed palette additions.
- **Strict Adherence**: Zero new dependencies, strictly L6 palette (tints/shades of gold, kraft, desk), Kalam and Cormorant fonts only, zero emoji, all interactive controls keyboard accessible.

## Next
- All core features and Task 15 Home Desk Environment fully implemented and verified.
- Production build passing cleanly with exit code 0 (`npm run build`).

## Open Questions
- None. (The 5 open questions from Task 14 research were resolved by the owner for Task 15; password reset remains an intentional inert placeholder per original product design).

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
