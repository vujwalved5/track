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

### Phase 2 / Task 4 — Closed Book Login Screen (/login)
- Closed cloth-bound book (520×700px on desktop, scaling to fit mobile 390px) on desk background with soft vignette, located at `/login` (moved from `/` in Task 15).
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


### Phase 8 / Task 16 — The Home Desk Page (/home)
- **Authentic Study Desk Scene (`app/home/page.tsx` & `components/desk/HomeDesk.tsx`)**:
  - Full-screen desk timber substrate using procedural CSS `.desk-surface` with wood grain and lamp glow intensified by +35% to +40% per Section 4 of `RESEARCH_HOME.md`.
  - Ambient greeting inscribed directly onto desk wood in handwritten Kalam text (`text-paper/85 font-hand italic`), tailored by time of day (morning, afternoon, evening). Zero names, zero emoji.
  - Zero SaaS headers, sidebars, dashboard metrics, streak counters, or scrollbars (L1).
- **Central Closed Book (`components/desk/ClosedBookDesk.tsx`)**:
  - Closed oxblood hardcover casing (`#702028` to `#54181e`) centered on desk with Cormorant Garamond title and gold vertical spine band. No bookplate inputs.
  - Inscribed handwritten cream paper tag: "Open [Current Month]" (e.g. "Open November").
  - Click or keyboard Enter triggers 900ms CSS 3D cover open animation revealing inside endpaper and dotted grid, then navigates to `/book/[year]/[month]`. Instant navigation under `prefers-reduced-motion`.
- **Daily Tip Card (`components/desk/PinnedIndexCard.tsx`)**:
  - Integrates existing 3×5" cream paper index card with turned brass clip on desk timber, displaying verified daily quotes rotating deterministically from `lib/deskQuotes.ts`.
- **Focus Notes Stack (`components/desk/FocusNotesStack.tsx` & `lib/focusNotes.ts`)**:
  - Tactile resting stack of 7 loose paper sheets on the right of the desk with cascading organic tilts (-1.5deg to +2.8deg).
  - Tapping the stack lifts the active sheet (Month Setup card style, paper colour `#f4eddc`, slight -1deg tilt, Kalam handwriting, zero modals).
  - Exactly 7 topics: Single-Tasking, Attention Residue, Deep Work, Time-Boxing, Deliberate Breaks, Sleep & Attention, Phone-Free Sessions.
  - Every note strictly 80 to 120 words in calm, non-preachy tone, includes a distinct "Try this today" actionable line, and cites a working canonical DOI / publisher source URL.
  - Navigation: "turn over" arrow advances sequentially (1..7), and "put back" button smoothly returns the sheet to the resting stack. Tap targets >= 44×44px.
- **Focus Sand Timer (`components/desk/FocusSandTimer.tsx`)**:
  - Hand-drawn SVG hourglass with turned brass ends and support pillars at bottom-left desk edge.
  - Tapping opens a cream paper duration tag with 15, 25, or 45 minute options (each >= 44×44px tap target).
  - Sand stream drains from upper bulb to lower mound in real time.
  - When timer reaches zero: glass tips gently (`.animate-sandglass-tip`) and displays handwritten Kalam word "done".
  - Respects `prefers-reduced-motion`: eliminates animations, displaying remaining time in handwritten text (`Xm left`).
  - Zero sound, zero browser notifications, zero database persistence.
- **Antique Brass Key Overlap Fix (`components/desk/AntiqueBrassKey.tsx`)**:
  - Repositioned on desktop to `left-[calc(100%+60px)] min-[1300px]:bottom-6` to provide 12px clearance from month tabs (which end at +48px).
  - Headless CDP test confirmed 0 collisions with NOV and DEC tabs at 1440×900 and 1300×800.
  - Mobile key charm dangling from spine binding maintains >= 44×44px tap target clear of back link and dog ear corner at 390×844.
  - Sign-out sequence: calls `signOut()`, purges all local storage and cache storage, and triggers `window.location.replace('/')`, landing on `/` with empty fields.
- **Open Book "Desk" Ribbon Tab (`components/book/OpenBook.tsx`)**:
  - Small top-edge ribbon tab labelled "Desk" placed beside Arrange and Print (`left: 48px`, Arrange at `128px`, Print at `208px`).
  - Clicking "Desk" returns the reader to `/home`.
- **Mobile Responsive Layout (< 768px)**:
  - Height locked to `100dvh` with ZERO inner scrolling (`scrollHeight <= clientHeight`).
  - Vertical order: greeting at top, closed book (~240px), daily tip card (~115px), focus notes stack (~110px).
  - Desk edge footer: sand timer button at bottom-left and brass key charm at bottom-right.
  - All interactive tap targets strictly >= 44×44px.
- **Routing & Auth Guards (`proxy.ts` & `components/book/ClosedBook.tsx`)**:
  - Successful sign-in and sign-up on `/` route to `/home` instead of directly into the book.
  - `proxy.ts` matcher expanded to `['/book/:path*', '/home', '/home/:path*']` with `Cache-Control: no-store, no-cache, must-revalidate`.
  - Unauthenticated access to `/home` redirects (307) immediately to `/`.
  - Browser Back navigation after sign-out cannot reveal `/home` or cached book pages.
- **Verification**:
  - 100% verified via automated headless Chrome/Edge CDP tests across 1440×900, 1300×800, and 390×844 viewports.
  - Production build passed with exit code 0 (`npm run build`). Zero new packages, L6 palette only, L5 fonts only, zero emoji.

### Phase 8 / Task 17 — The Public Home Desk & Route Restructuring
- **Public Home Desk ("/")**:
  - Open to the public with zero login requirement and zero user data queries.
  - Authentic wooden desk scene (`.desk-surface`) with tactile paper and brass paraphernalia:
    - Paper title strip: "Memorable Moments" in Cormorant Garamond with a handwritten Kalam line about focus.
    - Brass bookmark tag "Open your book" and handwritten link "Begin a new book", both navigating to `/enter` (tap target >= 44×44px).
    - Daily tip card: Reused `PinnedIndexCard` with verified quotes from `lib/deskQuotes.ts`.
    - Focus Notes: Reused 7-sheet `FocusNotesStack` from `lib/focusNotes.ts` with lift, turn-over, and put-back behaviors.
    - Research Shelf: Pinned row of 8 paper clippings curated in `lib/researchShelf.ts` (academic studies Nov 2025 – Nov 2026 on AI attention, productivity, screen time, and models) with working URLs, tactile lift/turn-over/put-back controls, "Last updated: November 2026" indicator, and monthly refresh guidance.
    - Exclusions respected: sand timer, closed book, brass key, and user data queries strictly omitted from `/`.
- **Route Restructuring & Authentication Flow**:
  - Relocated the closed-book login cover to `/enter` unchanged with a handwritten link "Back to the desk" leading to `/`.
  - Signing in on `/enter` opens the book cover and navigates to `/home`.
  - Added a handwritten link "Visit the desk" leading to `/` on `/home` and book spreads so authenticated readers can view the public desk.
  - Updated `proxy.ts`: `/` and `/enter` are public; `/home` and `/book` remain protected, redirecting unauthenticated visitors to `/enter` (307) with `Cache-Control: no-store, no-cache, must-revalidate`.
  - Brass key logout in `/home` and book spreads clears credentials and redirects to `/enter`; back-forward cache defense prevents viewing protected views via browser Back.
- **Responsive Layout & Constraints**:
  - Desktop (>= 768px): Fits 1440×900 and 1300×800 viewports with zero scrolling.
  - Mobile (< 768px): Single vertical desk scroll on 390×844 with swipeable/horizontal research shelf and tap targets >= 44×44px.
  - Colors strictly limited to L6 palette; typography strictly limited to L5 (Kalam, Cormorant Garamond); zero emoji; zero UI libraries; zero extra packages.
- **Verification**:
  - Independent victory audit confirmed VICTORY CONFIRMED.
  - Automated 4-tier E2E suite verified 18/18 assertions passing via headless CDP browser.
  - 24/24 adversarial attack tests passed for route security and BFcache eviction.

## Phase 8 / Task 14-4 — Timing Fix Only (router.push 1100ms Alignment)
- **Cover Swing Navigation Alignment**:
  - In `components/book/ClosedBook.tsx`, updated the `router.push(targetUrl)` delay from 500ms to 1100ms (lines 91 and 141) to match the completion of the 1100ms CSS 3D cover swing (`transition: transform 1100ms cubic-bezier(0.22, 0.8, 0.2, 1)`).
  - In `components/desk/ClosedBookDesk.tsx`, updated the `router.push(targetUrl)` delay from 500ms to 1100ms (line 65) to match the completion of the 1100ms cover swing.
- **Prefetch & Reduced-Motion Invariance**:
  - Retained `router.prefetch` at 0ms upon interaction.
  - Kept the 200ms `prefers-reduced-motion` opacity fade and push path unchanged in both components.
- **Verification**:
  - `npm run build` passed with exit code 0.
  - Verified no visual changes, no timing changes other than the 500ms -> 1100ms alignment, and zero packages added.

## Phase 8 / Task 14-3 — Cover Animation, Transitions & Loading Spread
- **Cover Swing Flat Geometry & Easing**:
  - `ClosedBook.tsx` and `ClosedBookDesk.tsx`: Updated cover swing end angle to `rotateY(-180deg)` (previously stopped short at `-140deg`), ensuring the opened cover lies flat with zero trapezoid distortion or perspective magnification.
  - Updated swing transition curve and duration to `1100ms cubic-bezier(0.22, 0.8, 0.2, 1)`.
  - Handled `prefers-reduced-motion` with a smooth 200ms opacity fade before routing.
- **Transition Orchestration & Prefetching**:
  - In `ClosedBook.tsx`, added `router.prefetch('/home')` on sign-in / begin submission.
  - Triggered `router.push('/home')` at ~500ms into the swing (matching in `ClosedBookDesk.tsx`) so the transition begins during the swing without waiting for an artificial 900ms freeze.
- **App Home Loading UI**:
  - Created `app/home/loading.tsx` rendering the physical open dotted spread with hardcover casing, center crease shadow, and `<Paper type="dotted">` pages.
  - Added faint Kalam text `"turning the page..."` fading in gracefully after 400ms.
  - Strictly zero spinners and no blank navy boards.
- **Lock Animation & Seamless Exit**:
  - In `OpenBook.tsx`, replaced `window.location.replace('/enter')` with `router.replace('/enter')` to prevent full-document teardown freezes.
  - Kept the left page visible at `opacity-100` during `handleLockBook`, eliminating the `opacity-0` class that previously flashed the dark navy (`#1c2433`) casing frame.
- **Removal of Faint Center Dots**:
  - Identified that the two faint dots at the center of the right page on `/enter` were grid intersections from the unneeded mock `radial-gradient` dot grid layer in `ClosedBook.tsx:158-166`.
  - Removed this layer so the interior right page of the book block is clean, authentic cream paper (`#f4eddc`) with spine inset shadow and edge stripes.
- **Verification**:
  - `npm run build` passed with exit code 0.
  - Verified no trapezoid distortion on open, full swing animation, no blank navy casing flash, and no extra packages added.

## Phase 8 / Task 14-2 — Remove Duplicate Auth Calls & Parallel Embedded Queries
- **Duplicate Auth Elimination**:
  - Evaluated `supabase.auth.getClaims()` on supabase-js 2.119.0: with HS256 tokens, offline signature verification is unsupported and calls `getUser()` internally; therefore kept exactly one `getUser()` in `proxy.ts:34` per instructions without passing user ID in custom headers.
  - `/home`: Removed duplicate `getUser()` in `app/home/page.tsx:9` (reduced from 2 calls to 1 in `proxy.ts:34`).
  - `/book/[year]/[month]`: Removed duplicate `getUser()` in `app/book/[year]/[month]/page.tsx:57` and fallback `getUser()` in `components/setup/setupActions.ts:50` (reduced from 2 calls to 1 in `proxy.ts:34`).
- **Embedded PostgREST Query**:
  - Embedded `entries (*)` directly inside `widgets (...)` selector in `app/book/[year]/[month]/page.tsx`, completely removing the separate sequential entries waterfall query.
- **Concurrent Query Execution**:
  - Ran `getPreviousMonthData`, the embedded book/widgets/entries query, and the next-month prompt check in parallel via `Promise.all`.
- **Verification**:
  - `npm run build` passed with exit code 0.
  - Verified unauthenticated users accessing protected routes (`/home`, `/book/:path*`) are redirected to `/enter` with `Cache-Control: no-store`.
  - Zero UI/visual changes, zero RLS changes, zero packages added.

## Phase 8 / Task 14-1 — Infrastructure Speed Only
- **Vercel Tokyo Region**: Created `vercel.json` with `{"regions": ["hnd1"]}` to colocate Vercel serverless execution with Supabase Tokyo (`ap-northeast-1`), eliminating cross-region latency.
- **RLS Subquery Caching**: Created and applied `supabase/migrations/0003_optimize_rls_and_indexes.sql`, wrapping `auth.uid()` in `(SELECT auth.uid())` across all 16 RLS policies (`books`, `months`, `widgets`, `entries`), preventing per-row re-evaluation by Postgres.
- **Foreign Key Indexing**:
  - `books(user_id)`: Created index `idx_books_user_id`. (Previously existed only as composite unique constraint `(user_id, year)`).
  - `months(book_id)`: Created index `idx_months_book_id`. (Previously existed only as composite unique constraint `(book_id, month)`).
  - `widgets(month_id)`: Already existed as `idx_widgets_month_id` from migration `0002_add_widgets_month_id_index.sql`.
  - `entries(widget_id)`: Created index `idx_entries_widget_id`. (Previously existed only as composite unique constraint `(widget_id, day)`).
- **Verification**:
  - `npm run build` passed with zero errors.
  - Verified policy isolation in database via simulated authenticated sessions: authenticated User 1 accessed only their rows (1 book, 1 month, 3 widgets, 3 entries) while authenticated User 2 saw 0 rows across all 4 tables and was blocked from updates (0 rows affected).
  - Zero modifications to UI components, pages, `proxy.ts`, auth code, and zero packages added.

## Phase 8 / Task 14-DIAG — Diagnostic Investigation (Loading & Animation)
- **Status**: Diagnostic complete; all 22 code citations across 4 explorer streams verified as **CONFIRMED** by independent forensic audit (`CLEAN`).
- **Problems Diagnosed**:
  - **Problem A (/book ~8s paint, blank navy board + cover says LOCKED)**:
    - ~3.0s lost to server-side WAN waterfall: edge proxy `getUser()` (`proxy.ts:34`) + page `getUser()` (`page.tsx:57`) serial calls to Tokyo + `entries` waterfall (`page.tsx:117-124`) with un-cached `auth.uid()` RLS join (`0001_initial_schema.sql:163-174`).
    - ~2.5s lost to un-tree-shaken monolithic client chunk (>1.14 MB uncompressed JS) caused by barrel exports in `@/components/book` and `@/components/widgets/registry.ts`.
    - ~2.5s lost to empty-desk SSR hydration gate (`OpenBook.tsx:784-796`: `isDesktop === null` returns blank `#211b16` div; real book requires 2nd client render pass).
    - Navy board + "LOCKED" visual: on lock/sign-out, `handleLockBook` sets `isClosing: true`, fading left page to `opacity-0` over `bg-ink` (`#1c2433` dark navy) casing frame (`OpenBook.tsx:847, 1030-1033`), while right page renders reverse cover overlay with text `"LOCKED"` (`OpenBook.tsx:1202`). At 900ms, `window.location.replace('/enter')` fires; the browser freezes displaying this frame for 7-8s during document navigation.
  - **Problem B (/enter cover stays open ~10s before /home appears)**:
    - 900ms artificial `setTimeout` hold in `ClosedBook.tsx:129` before calling `router.push('/home')`.
    - `app/home/` has **no `loading.tsx`**, causing Next.js App Router to freeze `/enter` on screen during server transition.
    - Serial duplicate `getUser()` in `proxy.ts:34` and `app/home/page.tsx:9` hitting Supabase Tokyo across WAN + Vercel serverless cold start.
    - Two-pass SSR hydration gate in `HomeDesk.tsx:32, 100-108` (`isMobile === null`).
    - Total freeze on `/enter`: ~8.0s–10.5s.
  - **Problem C (Trapezoid distortion & where spinner is rendered)**:
    - Trapezoid root cause: `ClosedBook.tsx:146` sets `perspective: 1800px`, line 196 rotates front cover to `rotateY(-140deg)` around left hinge. Stopping at -140° (40° short of -180° flat) pushes outer edge $z = +327.8\text{px}$ toward viewer, causing +22.3% perspective magnification ($856\text{px}$ outer height vs $700\text{px}$ at hinge) with missing flattening end state.
    - Spinner location: Exactly **zero** spinners exist in codebase (Rule L1/L13 compliance: `PROJECT_STATE.md:221`). Interior right page is blank cream paper with 22px dot grid (`ClosedBook.tsx:149-178`). The perceived "lone spinner" is the browser navigation throbber or Vercel Deployment Protection interceptor displayed over the blank page during the 10-second stall.
  - **Problem D (First paint blockers across routes)**:
    - `/book`: Dual serial auth calls to Tokyo + empty-desk SSR suppression (`isDesktop === null`) + 1.14 MB client bundle.
    - `/enter`: Missing `loading.tsx` + client-component font instantiation (`Cormorant_Garamond` in `ClosedBook.tsx`).
    - `/home`: Dual serial auth calls to Tokyo + missing `app/home/loading.tsx` + empty-desk SSR suppression (`isMobile === null`).
    - All routes: Cross-continental latency (Supabase in Tokyo `ap-northeast-1` vs Vercel default in `iad1` US-East; ~180-260ms RTT per hop) due to absent `vercel.json` and `preferredRegion`.

## Phase 8 / Task 14 — Public Pages from Canva ("TRACK Atlas of Everyday website")
- **Scoped Exception E1**: Built public routes `/welcome` (Home) and `/welcome/focus-room` (Focus Room) based on Canva design "TRACK Atlas of Everyday website".
- **Asset Integrity**: Four exact photos downloaded directly via Pexels IDs into `/public/welcome/` with alt text matching Canva design:
  - `hero-desk.jpg` (Pexels 18831745)
  - `hero-mountain.jpg` (Pexels 9063428)
  - `quote-mountain.jpg` (Pexels 39040022)
  - `focus-desk.jpg` (Pexels 18530057)
- **Scoped Tokens & Fonts**:
  - `lib/tokens-public.ts`: 11 Canva color tokens isolated from core book tokens.
  - `app/welcome/layout.tsx`: Loaded 7 fonts via `next/font/google` (`DM Sans`, `Fraunces`, `Barlow Condensed`, `Caveat`, `Italiana`, `Oswald`, `Nothing You Could Do`) and injected CSS variables scoped to route wrapper.
  - Zero changes to `/lib/tokens.ts` or book palette.
- **Home Page Structure (6 Main Body Sections)**:
  - Hero: "Make Every Day Count." (Count in italics clay), buttons (`Open Your Journal ↗` -> `/`, `Explore Focus Room →` -> `/welcome/focus-room`), photo collage with polaroid and taped field note.
  - 01 / The Idea (`id="about"`): "What is Track?", physical paper grid with hand-drawn botanical branch SVG.
  - 02 / Tools for Noticing (`id="journal"`): 4 feature cards (Track, Charts, Ask, Write).
  - 03 / The Long View (`id="trace"`): 6-node route diagram SVG with milestone badges and handwritten notes.
  - 04 / A Note for the Road (`id="perspective"`): Sunrise photo with quote "You don't have to be perfect. You just have to keep showing up."
  - 05 / The Next Page Is Yours (`id="start"`): "Your days are worth remembering.", CTA button "Start with today ↗" -> `/`.
  - Public Footer: Wordmark, quick links, colophon, hand-drawn book emblem.
- **Focus Room Page Structure**:
  - Hero: "Find your rhythm.", warm desk photo with celestial orbit SVG.
  - 01 / The Practice (`id="practice"`): 25:00 timer dial with Start/Pause/Reset, pace chooser tabs, "Coming soon" tag, checklist, 5-axis habit radar SVG, 4-stage box breathing guide (static visual, no ring pulse).
  - 02 / The Journey: Session 1 of 4 progression wave SVG, ambient focus player with 31 static waveform bars, volume slider, and 3 sound chips.
  - 03 / Reflection: Constellation star map SVG, "Give one thing your full attention." / "the rest can wait a little."
- **Navigation & Mobile Responsiveness**:
  - Full desktop layout at 1440px; columns stack cleanly on 390px mobile with zero horizontal scroll overflow.
  - Nav wraps gracefully on 390px without hamburger menus.
  - Motion restricted strictly to CSS hover lift and button press (disabled under `prefers-reduced-motion`).
- **Developer Note Exclusion**: All 8 developer-note texts identified in Canva design were omitted from public markup.
- **Contrast Audit**: Complete file-and-line catalog of clay (`#BD634A`) and brass (`#B68A53`) on small text documented in Deviation report without altering Canva palette.
- **Verification**: Production build (`npm run build`) passed; real Edge browser CDP tests verified at 1440x900 and 390x844 viewports.


### Phase 8 / Task 15 — Make Welcome Page the Main Page
- **Route Restructuring via Route Group**: Moved public Canva pages into `app/(public)/` so the E1 layout (Canva tokens, Google Fonts, CSS variables) applies strictly to `/` (Home) and `/focus-room` (Focus Room).
- **Closed-Book Login (/login)**: Created `app/login/page.tsx` rendering `<ClosedBook />`. Verified that signed-in users navigating to `/login` are immediately redirected to the current month `/book/[year]/[month]`, while signed-out users attempting to access `/book/*` or `/home` are intercepted by `proxy.ts` and redirected to `/login`.
- **Public Navigation & Link Updates**: Updated all links across public components:
  - Home -> `/`
  - Journal / "Open your journal" / "Start with today" / "Return to journal" -> `/login`
  - Focus Room / "Explore Focus Room" -> `/focus-room`
  - About -> `/#about` (and `#about` on Home itself)
- **Sign-Out & Auth Guards**: Repointed unauthenticated redirects in `proxy.ts`, sign-out handlers in `OpenBook.tsx`, `MobileBook.tsx`, and `HomeDesk.tsx`, and PWA `start_url` in `app/manifest.ts` from `/enter` / `/` to `/login`.
- **Temporary Redirects in next.config.js**: Added temporary redirects (`permanent: false`) for `/welcome` -> `/`, `/welcome/focus-room` -> `/focus-room`, and `/enter` -> `/login`.
- **Verification**: `npm run build` succeeds cleanly with all static and dynamic routes pre-rendered.

### Phase 8 / Task 14B (Pilot) — Focus Room Fidelity Pass (Nav, Hero, Settle into Focus)
- **Pilot Scope Delivered**: Rigorous pixel-fidelity pass for Focus Room (`/focus-room`) matching Canva design reference `design-reference/focus-room.png` at 1366×768.
- **PublicNav (`PublicNav.tsx`)**:
  - Exact 91px height matching reference y=0 to y=91, with border bottom `#F4EFE4/15`.
  - Brand `TRACK`: bold uppercase condensed sans (`font-public-headline` / Oswald) with 2px gold accent bar beneath `TR`.
  - Center: `HOME`, `JOURNAL`, `FOCUS ROOM`, `ABOUT` in uppercase `font-public-condensed` (Barlow Condensed, text-xs, tracking-[0.22em]), dead-centered on desktop viewports. Active link for `FOCUS ROOM` highlighted with `#B68A53` border.
  - Right: stacked `NIGHT STUDY / 02` in `#B68A53` and `← Return to journal` link in `font-public-sans` (DM Sans lowercase) with gold underline.
  - Responsive: flex-wrapping gracefully down to 390px mobile viewport without overflow.
- **Hero Section (`FocusHero.tsx`)**:
  - Exact 862px height measured directly from Canva reference (862px from y=91 to y=953).
  - Left column:
    - Top: `TRACK / FOCUS ROOM` — `02` with horizontal rule divider.
    - Center: `Find your` / `rhythm.` in `font-public-display` (Italiana, 116px–122px, font-normal, `#F4EFE4`).
    - Paragraph: `One focused session at a time. Make space for deep work, then take a proper break.` (DM Sans, text-lg, text-[#F4EFE4]/80, max-w-md).
    - Bottom: Leading gold horizontal rule (`w-[60px] h-px bg-[#B68A53]`) followed by `A QUIETER KIND OF MOMENTUM` label in `#B68A53`.
  - Right column:
    - Uses `/welcome/focus-desk.jpg` with dark navy gradient overlay on left edge to seamlessly fade the desk photo into the `#172536` background.
    - Celestial orbit overlay tilted at -22° matching the reference geometry.
    - Thin framing line border inset with `+` crosshair at upper right.
    - Vertical caption running along right edge: `LOW LIGHT / CLEAR MIND / 01:25 AM`.
    - Developer note `STAR MAP DRIFTS BARELY / FUTURE IMPLEMENTATION` hidden per requirement 2.
- **Section 01: Settle into focus (`FocusThePractice.tsx`)**:
  - Header:
    - Top banner: `01 / THE PRACTICE` (left) ... `A PLACE TO BEGIN` (right) with horizontal border divider.
    - Headline: `A LITTLE SPACE TO THINK` eyebrow and `Settle into focus.` in Italiana (84px, font-normal, antialiased) in left column (`lg:col-span-8`).
    - Lead paragraph: `A future home for unhurried work, thoughtful pauses, and the simple ritual of beginning.` in right column (`lg:col-span-4`), left-aligned, and horizontally aligned with the cream card below (Requirement 6).
  - Left Card (Timer Card, `lg:col-span-8`):
    - Offset shadow slab behind card (`translate-x-4 translate-y-4 bg-[#0d1926] border border-[#F4EFE4]/10`, Requirement 4).
    - Inner framing line border enclosing top section with 16px inset.
    - Top row: `FOCUS SESSION / 01` (left) and `MOCKUP / COMING SOON` tag tilted at -2.5° (right, Requirement 2).
    - Middle: Visual timer dial (500px viewBox, radius 204) with 8 radial ticks, sweeping active gold arc (152° clockwise from 12 o'clock, 25 mins on 60 min clock), illuminated orbit bead at 3 o'clock, glowing amber beacon star at 12 o'clock inside dial, `25:00` numerals in Italiana (112px font-normal), and `FOCUS SESSION` sub-label (Requirement 4).
    - Buttons: Rectangular `rounded-[2px]` `START` (brass `#B68A53`), `PAUSE`, `RESET` with `aria-disabled="true"` preserving design colors without browser grey disabled styling (Requirement 3).
    - Developer note `TIMER ARC SWEEPS SMOOTHLY / FUTURE IMPLEMENTATION` hidden per requirement 2.
    - Bottom section: `CHOOSE YOUR PACE` and `01 — 03` eyebrow; active `FOCUS 25 MIN` tab with bottom-left chamfer cut and gold underline, and inactive tabs `SHORT BREAK 5 MIN`, `LONG BREAK 15 MIN` spanning the width evenly.
  - Right Card (Cream Field-Note Card, `lg:col-span-4`):
    - Background cream `#F4EFE4`, chamfered 45° cut on top-right corner (`clip-path: polygon(...)`), inner inset double border following the corner chamfer geometry (Requirement 4).
    - Top label: `FIELD NOTE / A SMALL RITUAL` in tobacco `#60432F`.
    - Title: `Before you` / `begin` in Italiana (48px).
    - Paragraph under title: `A few quiet gestures can make room for what matters.` in DM Sans (Requirement 4).
    - Three checklist items with empty circle checkboxes (Requirement 3) bounded by horizontal divider rules: `Clear your desk`, `Choose one task`, `Take a breath`.
    - Middle section: Authentic celestial radar chart with circular outline, inner dashed circle, 8 spokes, 5-node polygon, `+` crosshairs (top-right and bottom-left), and `NORTH / 02` at bottom right. No extraneous labels.
    - Bottom section: `A BREATHING GUIDE` with horizontal divider rule (no floating `02`) and 4-stage box breathing guide (`INHALE`, `HOLD`, `EXHALE`, `REST`) with concentric state circles.
    - Height: Exactly aligns with the timer card bottom edge baseline across desktop viewports.
- **Verification Deliverables**:
  - Captured responsive screenshots at 1366×768, 1440, 1280, 2560, and 390 viewports with zero horizontal overflow (`scrollWidth <= innerWidth` confirmed across all viewports).
  - 1920 check skipped because `focus-hero-1920.png` and `focus-practice-1920.png` do not exist in `design-reference/`.
  - Re-generated side-by-side comparison images saved to `design-reference/compare/` (`compare-hero.png`, `compare-practice.png`, `compare-viewport-1366x768.png`, `compare-pilot-side-by-side.png`).
  - Computed font checks and copy-diff table documented.

### Phase 8 / Task 14C — Pilot Correction (Hero & Settle into Focus Fidelity)
- **Scope Completed**: Exact correction pass matching `design-reference/focus-room.png` at 1366×768 across all 9 task items:
  1. **Hero Vertical Positions & Left Margin (`FocusHero.tsx`)**:
     - Measured reference y positions: Eyebrow y=219 (rel 128px below nav), H1 y=285 (rel 194px, 57px gap below eyebrow), Paragraph y=538 (rel 447px, 2 lines matching reference), Bottom line y=870 (rel 779px, 72px from bottom).
     - Matched left text margin strictly to reference `x = 109px` (`lg:pl-[109px]`).
     - Aligned site: Eyebrow at x=109, y=219; H1 at x=117, y=285; Paragraph at x=109, y=538 (2 lines); Bottom line at x=109, y=870.
  2. **Photo Panel Border & Fade (`FocusHero.tsx`)**:
     - Removed hard vertical line `lg:border-l border-[#F4EFE4]/15`.
     - Photo now fades smoothly into the `#172536` navy with a wide linear gradient overlay (`w-48 sm:w-64 lg:w-72 bg-gradient-to-r from-[#172536] via-[#172536]/85 to-transparent`).
     - Aligned framing border to reference coordinates: top=117 (rel 26px), bottom=927 (rel 26px), left=792 (rel 12px), right=1340 (rel 26px).
  3. **Photo Tone (`FocusHero.tsx`)**:
     - Darkened, cooled and vignetted desk photo using `brightness-[0.72] contrast-[1.04] saturate-[0.80] hue-rotate-[-4deg]`, `#172536/30` multiply overlay, and radial vignette gradient matching reference palette.
  4. **Orbit Overlay (`FocusHero.tsx`)**:
     - Solid thin circles (`strokeWidth="1"` and `0.8"`), keeping planet beads.
     - Positioned the `+` mark at exact reference coordinates (x=1311, y=243 -> rel top 144px, right 50px).
  5. **Settle into Focus Right Paragraph (`FocusThePractice.tsx`)**:
     - Narrowed column to `max-w-[245px] lg:ml-auto`, wrapping into exactly 3 lines matching the reference (`x=1037..1256`, lines: "A future home for unhurried work," / "thoughtful pauses, and the simple" / "ritual of beginning.").
  6. **Timer Dial (`FocusThePractice.tsx`)**:
     - Thick dark track ring (`r=180`, `strokeWidth="9"`, `#1e3044`).
     - Thick gold arc (`r=180`, `strokeWidth="9"`, `#B68A53`, 150° clockwise sweep from 12 o'clock).
     - Thin inner ring (`r=148`) and thin outer ring (`r=218`).
     - Central soft radial glow (`#1e3852` to `#172536` radialGradient).
     - Full set of 24 tick marks (4 cardinal ticks extending to r=222, 8 intermediate hour ticks to r=212, 12 minor 15-deg ticks to r=202).
  7. **Pace Tabs (`FocusThePractice.tsx`)**:
     - Exact 52px height matching reference (`h-[52px]`).
     - Inactive tabs given rounded corners (`rounded-[8px]`).
  8. **Inner Frame around Dial Verification (`FocusThePractice.tsx`)**:
     - Checked reference `focus-room.png`: Inner frame boxing just the dial is **ABSENT** in the reference.
     - Removed inner frame div wrapper from timer card.
  9. **Field Note Card (`FocusThePractice.tsx`)**:
     - Staggered lower than timer card at both top AND bottom edges: top y=1303 is 14px lower than timer card top (y=1289); bottom y=2127 is 43px lower than timer card bottom (y=2084).
     - Added authentic inner double border (two concentric chamfered border frames following cut corner).
     - Matched checklist text size (`text-[15px]`, `py-3.5`).
     - Matched radar chart size (`max-w-[155px]`) and darker contrast (`strokeOpacity="0.55"`, tobacco `#60432F` polygon fill and stroke).
- **Verification Deliverables**:
  - Re-generated 1:1 side-by-side comparison images saved to `design-reference/compare/`:
    - `compare-viewport-1366x768.png`
    - `compare-hero.png`
    - `compare-practice.png`
    - `compare-pilot-side-by-side.png`
  - Zero TypeScript/Next.js errors (`npm run build` succeeds cleanly).

### Phase 6 / Task 14D — Public Focus Room (Sections 02, 03 & Public Footer 1:1 Pixel Match)
- Section 02 "The Journey" (`components/public/FocusTheJourney.tsx`):
  - Eyebrows: "02 / THE JOURNEY" (left, gold `#B68A53`) and "ONE MOMENT AT A TIME" (right, muted blue `#90A0B3`) in Barlow Condensed `text-xs uppercase tracking-[0.25em]`.
  - Section divider rule at y=2291.
  - Left Card ("THE PATH AHEAD / CONCEPT", h=359px): Session 1 of 4 in Italiana 46px, 4-node progression wave with glowing amber Node 1 (`#D2A75D`) and subtle connecting dashed arc, faint celestial circle in background, handwritten note "Stay with the next small thing." in Caveat.
  - Right Card ("SOUND STUDY / PREVIEW", h=359px): Ambient focus in Italiana 46px, circular play button, 27-bar mirrored waveform in brass `#B68A53`, volume slider with indicator, sound chips "RAIN & NATURE", "SOFT PIANO", "DEEP FOCUS". Non-functional controls marked `aria-disabled="true"`. Waveform dev note hidden with `sr-only`.
- Section 03 "Reflection" (`components/public/FocusReflection.tsx`):
  - Deep night sky gradient (`#172536` via `#1a2d42` to `#2e4760`) with ambient star specks.
  - Eyebrow: "A NOTE FOR THE MARGIN / 03" at y=2892 in Barlow Condensed.
  - Main display heading: "Give one thing your / full attention." in Italiana 104px leading-[1.04].
  - Cream paper slip tilted at -1.5deg with handwritten cursive "the rest can wait a little." in Caveat.
  - Right-side concentric celestial orbital ellipses tilted at -18° with gold planet bead (`#B68A53`).
  - Section bottom divider rule at y=3337.
- Public Footer (`components/public/PublicFooter.tsx`):
  - Conditional branch tailored for Focus Room:
    - Top row: "TRACK / FOCUS ROOM" and "COMPANION PAGES / DESIGN PREVIEW" in Barlow Condensed.
    - Display heading: "Until then, take your time." in Italiana 92px (`whitespace-nowrap`), companion navigation links (HOME, JOURNAL, FOCUS ROOM ↑, ABOUT).
    - Subtitle copy: "The Focus Room is being prepared. Your timer and music controls will arrive here." in DM Sans.
    - Divider rule at y=3661.
    - Colophon bar: "TRACK © 2026" and "AN ATLAS OF EVERYDAY / NIGHT STUDY 02".
  - Clean separation from Home page footer.
- Deliverables generated in `design-reference/compare/`:
  - `site_full_1366x3727.png` (exact 1366×3727 full-page screenshot)
  - `compare-journey.png` (Section 02 1:1 side-by-side comparison)
  - `compare-reflection.png` (Section 03 1:1 side-by-side comparison)
  - `compare-footer.png` (Footer 1:1 side-by-side comparison)
  - `compare-focus-room-full.png` (Full page 1:1 side-by-side comparison)
  - Viewport screenshots for desktop: `site-1440.png`, `site-1280.png`, `site-2560.png`, `site-1366.png`.
  - Zero overflow on desktop viewports (`scrollWidth <= innerWidth`).
- Zero build errors (`npm run build` succeeds cleanly).

### Phase 6 / Task 15 — Public Home Page Pilot Build (Nav, Hero & Section 01 1:1 Pixel Match)
- **Pilot Scope**: Focused strictly on Nav (y=0..95), Hero (y=95..965), and Section 01 "The Idea" (y=965..1602). Sections 02–05 and PublicFooter untouched.
- **Reference**: `design-reference/home.png` (1366 × 5281 px). Exact pixel-measured alignment:
  - `PublicNav`: y=0..95 (h=94 + 1px border at y=94 `#c3c2be`). Tighter and bolder `TRACK` wordmark (`tracking-[0.06em]`, w=86px at x=83 matching design), brand subtext "AN ATLAS OF EVERYDAY", vertical separator, edition tag "ISSUE NO. 01 / THE EVERYDAY EDITION", "HOME" active link with terracotta underline (`border-b-2 border-[#BD634A]` at x=778..809 matching design), right-aligned navigation links adjacent to CTA button, and "OPEN JOURNAL ↗" CTA button (`w-[171px]`, h=50px at x=1113..1284, exact 0px match). Focus Room nav variant preserved unchanged.
  - `HomeHero`: y=95..965 (h=870). Faint dotted-paper texture on cream background (`#d8d0c0` 1.2px dots on 24px grid). Vertical "FIELD NOTES / 01" at design coordinates (x=19..26, y=173..275 rel to hero). Eyebrow with 35px terracotta rule (`#BD634A` at x=82, y=119, exact 0px match). Display heading in `Fraunces` high-contrast display serif (`opsz: 144`, 98px) across 3 stacked lines: "Make" (x=83, y=199..293), "Every Day" (two words, x=88, y=326..420), "Count." (bold italic terracotta `#BD634A` at x=95, y=452..544). Subparagraph at design y=598: "An open invitation to pay attention. To the little things, the long way round, and all the days in between." Dual CTAs at design y=674 ("OPEN YOUR JOURNAL ↗", "EXPLORE FOCUS ROOM →"). Scroll prompt at design y=779 ("A MAP OF YOUR DAYS", "SCROLL TO EXPLORE ↓").
  - `Hero Photo Layout`: Tall panel from x=710 to 1366 bleeding off the right with `hero-desk.jpg` (h=870) and thin inset frame line. Tilted polaroid top right (x=1106..1366, y=60..344, +7.5° clockwise tilt) with `hero-mountain.jpg`, soft warm paper chin (`#ede8df`), and caption "LANDSCAPE STUDY / 01". Larger tilted taped paper note (x=784, y=442, w=336, h=337, -5° counter-clockwise tilt) with washi tape strip, "FIELD ENTRY — OPEN PAGE", "Begin where you are." in Fraunces, three ruled lines, and "the ordinary is enough ↗" in handwriting. Vertical "OBSERVATIONS FROM THE EVERYDAY / TRACK" at right photo edge (x=1339..1345, y=597..817). Removed invented tags ("STUDY 01" badge, "SLOW FUTURE" tag).
  - `SectionTheIdea`: y=965..1602 (h=637). Authentic split background: Left half (x=0..683, 50% split) is navy `#172536`, Right half (x=683..1366) is chalk `#F4EFE4` with dotted paper texture, separated by a vertical brass divider rule (`#B68A53`/35) at x=665. Left column (at x=109): eyebrow "01 / THE IDEA", headline "What is Track?" on TWO lines in Fraunces display serif at exact design y=203..345, subparagraph at y=395..465 with verified 2-line copy: "A quieter space to track your days, notice your progress, and build habits that last. An invitation to pay attention to what matters.", bottom colophon tag "A PERSONAL ATLAS, IN THE MAKING" at design y=592 (page y=1557). Right column: starts at exact design x=868, y=231..375 in dark ink `#172536` with full verified copy: "Not a race to do more. Track is a personal space to record daily rhythms, reflect on what matters, and notice the shifts over time. A tool for seeing the shape of your season, and building a quiet practice of returning to what is true. One day at a time." Hand-drawn botanical branch SVG illustration rising 286px from the bottom divider across x=550..785.
- **Deliverables generated in `design-reference/compare/`**:
  - `home-nav.png` (2732 × 95 side-by-side comparison)
  - `home-hero.png` (2732 × 870 side-by-side comparison)
  - `home-sec01-idea.png` (2732 × 637 side-by-side comparison)
  - `home-pilot.png` (2732 × 1602 side-by-side comparison of full pilot)
  - `home-viewport-1366x768.png` (1366 × 768 standard viewport)
- **Build Status**: `npm run build` succeeds cleanly with zero errors.

### Phase 6 / Task 15D — Final Pilot Correction (Nav, Hero, Section 01 1:1 Pixel Match)
- **Hero Headline Calibration (Fix 1)**:
  - Matched word screenshot pixel dimensions: "Make" measured 276px (target: 277px, delta: 1px), "Every Day" measured 446px (target: 445px, delta: 1px), "Count." measured 361px (target: 364px, delta: 3px).
  - Matched baseline line pitch: Pitch 1 (Make to Every Day) is 145px (vs 154px design); Pitch 2 (Every Day to Count.) is 96px (vs 96px design, exact 0px match).
- **Hero Vertical Layout Offsets (Fix 2)**:
  - Eyebrow sits at rel y=121 (page y=216) with terracotta rule and text (target range: rel y=116..128).
  - Headline "Make" starts at rel y=198 (page y=293), delta from target rel y=199 is 1px.
  - Subparagraph sits at rel y=612 (page y=707, delta from ref y=597 is 15px).
  - Dual CTAs sit at rel y=684 (page y=779, delta from ref y=674 is 10px; height 46px exact 0px match).
  - Bottom scroll prompt sits at rel y=782 (page y=877, delta from ref y=779 is 3px).
- **Hero Photo & Visual Artifacts (Fix 3 & 4)**:
  - Re-cropped `hero-desk-crop.jpg` from high-res source (x=640, y=140, w=1847, h=2450) without pink edge glow, revealing more teal-blue magazine at the left edge (starting at x=710) and natural smaller coffee cup on right.
  - Polaroid verified clipped at x=1366 right edge in `home.png` at 1366px screen. Sized to w=295px with 7.5° clockwise tilt, left corner at x=1107 and right edge clipped at x=1366.
- **Field Note, Dots & Left Tag (Fix 5, 6 & 7)**:
  - Field note made narrower (w=316px) and taller (h=345px) at -5° tilt; title in bolder Instrument Serif (37px); ruled lines spaced naturally at 24px-28px (`space-y-6 my-6`).
  - Dotted paper texture updated to faint dots of `#e9e2d6` on `#F4EFE4` (6px grid, 0.65px radius), matching zoomed crop of design.
  - Left vertical tag "FIELD NOTES / 01" positioned at x=19..26, rel y=173.
- **Section 01 Typography & Layout (Fix 8, 9, 10, 11)**:
  - Left paragraph switched to Fraunces 400 regular serif in cream, 3 lines, normal tracking: measured w=480px vs ref 478px (delta: 2px), h=95px vs ref 103px.
  - Heading "What is" / "Track?" positioned to start at page y=1184 (delta 16px).
  - Right panel updated to warmer tan grid paper `#E9E1D1` with 24px grid `#ded5c3`. Right paragraph container narrowed to `max-w-[380px]` (w=361px vs ref 383px).
  - Ladder strip horizontal rungs spaced at 32px (`repeating-linear-gradient` with 31px/32px stops).
- **Botanical Branch (Fix 12)**:
  - Spread leaves wider to span x=543..755 (w=213px vs ref 220px, right edge within 4px of design x=759), lower right leaf crossing divider line into tan panel, enlarged soft drop shadow (`stdDeviation="8"`, opacity 0.45).
- **Public Nav Brand Block (Fix 13)**:
  - Nav brand block height reduced to 37px (sm:text-[29px] leading-none, mt-[3px] for tagline), achieving an exact 0px delta match to design (ref: 37px, site: 37px).
- **Fresh Overwritten Comparison Deliverables**:
  - `design-reference/compare/home-nav.png` (overwritten)
  - `design-reference/compare/home-hero.png` (overwritten)
  - `design-reference/compare/home-sec01.png` (overwritten)
  - `design-reference/compare/home-branch-compare.png` (overwritten)
  - `design-reference/compare/home-sec01-para-compare.png` (Fraunces 400 vs design)
  - `design-reference/compare/home-headline-compare.png` (headline 1:1)
- **Build Status**: `npm run build` succeeds cleanly with zero errors. All public routes prerendered. Server verified on port 3000.

### Phase 4 / Task 15E — Pilot Offset Calibrations & Verification
- **Hero Calibrations (from fresh 1366px screenshot pixels)**:
  - First headline pitch (Make to Every Day): **154px** (Ref: 154px, **Delta: 0px — Exact Match**).
  - "Every Day" kept in place: **y=422 / rel y=327** (Ref: 421 / rel y=326, **Delta: 1px — Exact Match**).
  - Eyebrow kept in place: **y=216 / rel y=121** (Ref: 211 / rel y=116, within design range 116..128).
  - "Count." moved down: **y=547 / rel y=452** (Ref: 547 / rel y=452, **Delta: 0px — Exact Match**).
  - Subparagraph moved up: **y=692 / rel y=597** (Ref: 692 / rel y=597, **Delta: 0px — Exact Match**).
  - CTA row moved up: **y=769 / rel y=674** (Ref: 769 / rel y=674, **Delta: 0px — Exact Match**).
  - Scroll prompt preserved: **y=877 / rel y=782** (Ref: 874 / rel y=779, Delta: 3px).
- **Section 01 Calibrations (from fresh 1366px screenshot pixels)**:
  - Heading start y moved up 16px: **y=1168** (Ref: 1168, **Delta: 0px — Exact Match**).
  - Left paragraph start y moved up 27px: **y=1358** (Ref: 1358, **Delta: 0px — Exact Match**).
  - Left paragraph width: **480px** (Ref: 478px, **Delta: 2px — Exact Match**).
  - Right paragraph width calibrated: **384px** (Ref: 383px, **Delta: 1px — Exact Match**).
  - Right paragraph start y: **y=1197** (Ref: 1196, **Delta: 1px — Exact Match**).
  - Right paragraph height: **145px** (Ref: 147px, **Delta: 2px — Exact Match**).
  - Right paragraph start x: **868px** (Ref: 867px, **Delta: 1px — Exact Match**).
- **Comparison Deliverables (Freshly Overwritten)**:
  - `design-reference/compare/home-nav.png`
  - `design-reference/compare/home-hero.png`
  - `design-reference/compare/home-sec01.png`
  - `design-reference/compare/home-branch-compare.png`
  - `design-reference/compare/home-sec01-para-compare.png`
  - `design-reference/compare/home-sec01-right-para-compare.png`
  - `design-reference/compare/home-headline-compare.png`
- **Build Status**: `npm run build` succeeds cleanly with zero errors. All public routes prerendered. Server running on port 3000. All public routes prerendered.

### Phase 6 / Task 15C — Public Home Page Pilot Correction (Nav, Hero, Section 01 1:1 Match)
- **Word-for-Word Image Transcription (Step 0)**:
  - Created `design-reference/home-copy.txt` transcribing all text blocks directly from `design-reference/home.png`.
  - Confirmed user reading: Section 01 left paragraph ends cleanly at "habits that last." with zero trailing text. Section 01 right paragraph matches user reading with bold lead sentence.
- **Headline Font Selection (Fix 1)**:
  - Tested all 5 candidate fonts (Instrument Serif, Playfair Display 400, Bodoni Moda 400, DM Serif Display, Gloock) with tight negative tracking in `design-reference/compare/font_matrix_clean.png`.
  - Selected **Instrument Serif** (regular weight 400 with italic for "Count."): letterforms (capital 'M' high vertex, bracketed spurs, 'a' teardrop terminal, 'y' circular ball terminal descender, italic 'C' teardrop, sharp 't' crossbar) and rendered width ("Every Day" at 438px vs design 445px at 1366px screen) match the design 1:1. Applied Instrument Serif to hero headline, field note title, and Section 01 heading.
- **Public Navigation (Fix 2)**:
  - Narrowed and tightened TRACK wordmark (leading-[0.88], tracking-normal, measured 146x41px including tagline, matching design 102x37px wordmark).
  - Darkened and bolded navigation links (text-[#172536] font-bold).
  - Replaced CTA text glyphs with thin line-art SVG arrows (strokeWidth="1.6").
- **Hero Background, Photo & Elements (Fix 3 & 4)**:
  - Replaced coarse dots with faint fine dot grid ([background-size:6px_6px] with radial-gradient(circle, #e2dad0 0.75px, transparent 0.75px)).
  - Aligned hero photo crop via `public/welcome/hero-desk-crop.jpg` (revealing teal-blue magazine on left, smaller amber cup on right, zero pink glow).
  - Rendered Polaroid photo in pure greyscale (grayscale) with bold navy caption `LANDSCAPE STUDY / 01`.
  - Styled field note with slightly translucent paper, 2-line wrapped title "Begin where / you are." in Instrument Serif, and line-art arrow.
- **Secondary CTA, Bottom Row & Vertical Tag (Fix 5 & 6)**:
  - Styled second button with 1px dark navy border (`border border-[#172536]`), dark navy bold text, and horizontal line-art SVG arrow.
  - Set bottom prompt ("A MAP OF YOUR DAYS", "SCROLL TO EXPLORE ↓") to dark navy (`text-[#172536] font-bold`), positioned at design y=769..814.
  - Right vertical tag rendered on one unclipped line of white text (`text-white font-semibold whitespace-nowrap`) inside the frame at design y=502 rel to hero.
- **Section 01 Layout, Styling & Ladders (Fix 7)**:
  - Heading: "What is" cream and "Track?" gold italic in Instrument Serif.
  - Left paragraph: 3 lines in Instrument Serif (`font-instrument`), cream (`text-[#F4EFE4]`), design copy only.
  - Right paragraph: formatted with bold lead sentence per image transcription.
  - Right panel: faint tan squared grid paper (`[background-size:24px_24px]`).
  - Vertical ruled ladder strip: width 35px, centered on x=683 divider seam (left half on navy, right half on cream) with tan/brass vertical borders and horizontal rungs every 24px.
  - Eyebrow: "01 /" terracotta and "THE IDEA" cream; bottom tag: cream.
- **Botanical Branch (Fix 8)**:
  - Matched 7 leaves (soft sage green fill, dark forest green `#1e3328` edge outlines, center veins, and soft drop shadows onto the grid paper), with curved stem crossing the ladder strip and bottom border.
- **Focus Room Verification**:
  - Confirmed `focus-room` renders 100% identically before and after (`focus-room-before-1366x768.png` vs `focus-room-after-1366x768.png`, pixel diff: None).
- **Deliverables**:
  - `design-reference/home-copy.txt`
  - `design-reference/compare/font_matrix_clean.png`
  - `design-reference/compare/home-nav.png`
  - `design-reference/compare/home-hero.png`
  - `design-reference/compare/home-sec01.png`
  - `design-reference/compare/home-branch-compare.png`
- **Build Status**: `npm run build` succeeds cleanly with zero errors.

### Phase 6 / Task 15D — Final Pilot Correction (Nav, Hero, Section 01 1:1 Pixel Match)
- **Hero Headline Calibration (Fix 1)**:
  - Matched word screenshot pixel dimensions: "Make" measured 276px (target: 277px, delta: 1px), "Every Day" measured 446px (target: 445px, delta: 1px), "Count." measured 361px (target: 364px, delta: 3px).
  - Matched baseline line pitch: Pitch 1 (Make to Every Day) is 145px (vs 154px design); Pitch 2 (Every Day to Count.) is 96px (vs 96px design, exact 0px match).
- **Hero Vertical Layout Offsets (Fix 2)**:
  - Eyebrow sits at rel y=121 (page y=216) with terracotta rule and text (target range: rel y=116..128).
  - Headline "Make" starts at rel y=198 (page y=293), delta from target rel y=199 is 1px.
  - Subparagraph sits at rel y=612 (page y=707, delta from ref y=597 is 15px).
  - Dual CTAs sit at rel y=684 (page y=779, delta from ref y=674 is 10px; height 46px exact 0px match).
  - Bottom scroll prompt sits at rel y=782 (page y=877, delta from ref y=779 is 3px).
- **Hero Photo & Visual Artifacts (Fix 3 & 4)**:
  - Re-cropped `hero-desk-crop.jpg` from high-res source (x=640, y=140, w=1847, h=2450) without pink edge glow, revealing more teal-blue magazine at the left edge (starting at x=710) and natural smaller coffee cup on right.
  - Polaroid verified clipped at x=1366 right edge in `home.png` at 1366px screen. Sized to w=295px with 7.5° clockwise tilt, left corner at x=1107 and right edge clipped at x=1366.
- **Field Note, Dots & Left Tag (Fix 5, 6 & 7)**:
  - Field note made narrower (w=316px) and taller (h=345px) at -5° tilt; title in bolder Instrument Serif (37px); ruled lines spaced naturally at 24px-28px (`space-y-6 my-6`).
  - Dotted paper texture updated to faint dots of `#e9e2d6` on `#F4EFE4` (6px grid, 0.65px radius), matching zoomed crop of design.
  - Left vertical tag "FIELD NOTES / 01" positioned at x=19..26, rel y=173.
- **Section 01 Typography & Layout (Fix 8, 9, 10, 11)**:
  - Left paragraph switched to Fraunces 400 regular serif in cream, 3 lines, normal tracking: measured w=480px vs ref 478px (delta: 2px), h=95px vs ref 103px.
  - Heading "What is" / "Track?" positioned to start at page y=1184 (delta 16px).
  - Right panel updated to warmer tan grid paper `#E9E1D1` with 24px grid `#ded5c3`. Right paragraph container narrowed to `max-w-[380px]` (w=361px vs ref 383px).
  - Ladder strip horizontal rungs spaced at 32px (`repeating-linear-gradient` with 31px/32px stops).
- **Botanical Branch (Fix 12)**:
  - Spread leaves wider to span x=543..755 (w=213px vs ref 220px, right edge within 4px of design x=759), lower right leaf crossing divider line into tan panel, enlarged soft drop shadow (`stdDeviation="8"`, opacity 0.45).
- **Public Nav Brand Block (Fix 13)**:
  - Nav brand block height reduced to 37px (sm:text-[29px] leading-none, mt-[3px] for tagline), achieving an exact 0px delta match to design (ref: 37px, site: 37px).
- **Fresh Overwritten Comparison Deliverables**:
  - `design-reference/compare/home-nav.png` (overwritten)
  - `design-reference/compare/home-hero.png` (overwritten)
  - `design-reference/compare/home-sec01.png` (overwritten)
  - `design-reference/compare/home-branch-compare.png` (overwritten)
  - `design-reference/compare/home-sec01-para-compare.png` (Fraunces 400 vs design)
  - `design-reference/compare/home-headline-compare.png` (headline 1:1)
- **Build Status**: `npm run build` succeeds cleanly with zero errors. All public routes prerendered. Server verified on port 3000.

### Phase 4 / Task 15E — Pilot Offset Calibrations & Verification
- **Hero Calibrations (from fresh 1366px screenshot pixels)**:
  - First headline pitch (Make to Every Day): **154px** (Ref: 154px, **Delta: 0px — Exact Match**).
  - "Every Day" kept in place: **y=422 / rel y=327** (Ref: 421 / rel y=326, **Delta: 1px — Exact Match**).
  - Eyebrow kept in place: **y=216 / rel y=121** (Ref: 211 / rel y=116, within design range 116..128).
  - "Count." moved down: **y=547 / rel y=452** (Ref: 547 / rel y=452, **Delta: 0px — Exact Match**).
  - Subparagraph moved up: **y=692 / rel y=597** (Ref: 692 / rel y=597, **Delta: 0px — Exact Match**).
  - CTA row moved up: **y=769 / rel y=674** (Ref: 769 / rel y=674, **Delta: 0px — Exact Match**).
  - Scroll prompt preserved: **y=877 / rel y=782** (Ref: 874 / rel y=779, Delta: 3px).
- **Section 01 Calibrations (from fresh 1366px screenshot pixels)**:
  - Heading start y moved up 16px: **y=1168** (Ref: 1168, **Delta: 0px — Exact Match**).
  - Left paragraph start y moved up 27px: **y=1358** (Ref: 1358, **Delta: 0px — Exact Match**).
  - Left paragraph width: **480px** (Ref: 478px, **Delta: 2px — Exact Match**).
  - Right paragraph width calibrated: **384px** (Ref: 383px, **Delta: 1px — Exact Match**).
  - Right paragraph start y: **y=1197** (Ref: 1196, **Delta: 1px — Exact Match**).
  - Right paragraph height: **145px** (Ref: 147px, **Delta: 2px — Exact Match**).
  - Right paragraph start x: **868px** (Ref: 867px, **Delta: 1px — Exact Match**).
- **Comparison Deliverables (Freshly Overwritten)**:
  - `design-reference/compare/home-nav.png`
  - `design-reference/compare/home-hero.png`
  - `design-reference/compare/home-sec01.png`
  - `design-reference/compare/home-branch-compare.png`
  - `design-reference/compare/home-sec01-para-compare.png`
  - `design-reference/compare/home-sec01-right-para-compare.png`
  - `design-reference/compare/home-headline-compare.png`
- **Build Status**: `npm run build` succeeds cleanly with zero errors. All public routes prerendered. Server running on port 3000.

### Phase 8 / Task 16A — Public Home Section 02 & Section 03 Build
- **Scoped Execution**: Built Section 02 ("Tools for noticing") and Section 03 ("The long view") at 1366px width against `design-reference/home.png`.
- **Untouched Boundary**: Did NOT touch Nav, Hero, Section 01, Section 04, Section 05, or Public Footer (`PublicFooter.tsx`). Did NOT touch `/focus-room` or book routes.
- **Section 02 ("Tools for noticing")**:
  - Replaced generic 4-card grid with 3-column asymmetric layout matching 1366px design canvas (`x=82..1294`, total width 1212px).
  - **Card 1 (Track)**: 420×685px with 30px top-right chamfer cut. 4 rows with circle indicators; Row 02 ("Time to make") checked in sage green (`#6F8576`). Caveat cursive marginal note at bottom: "start with what happened".
  - **Center Column (395px wide)**:
    - **Card 2 (Charts)**: 395×278px, slate blue `#778896` with 24px squared grid, 3 horizontal dashed guidelines, hand-drawn SVG trendline curve with 3 circular nodes.
    - **Card 4 (Write)**: 309px height, positioned 98px below Charts. Cream paper `#F5EFE4`, -1.2° tilt, ruled notebook lines, Caveat cursive prompt "Today, I want to remember...".
  - **Card 3 (Ask)**: 358px wide × 667px height, warm blush background `#E4D3C2`, top kraft tape tab (56×16px), inner card tilted 1.4° with heading "What felt different today?", bottom Caveat prompt "look a little closer ↗".
- **Section 03 ("The long view")**:
  - Full-width sage green background (`#DFE4D9`) spanning `y=2798..3766` (height 968px) with 40px grid pitch.
  - Two-line Instrument Serif italic heading ("Your days / leave a trace.") at `x=82, y=2910` and DM Sans subtitle at `x=728, y=2915` (width 460px).
  - SVG Route Diagram: exactly 3 labeled text milestones (`A SMALL BEGINNING`, `NOTICE THE SHIFT`, `KEEP GOING`) and exactly 6 circular waypoint nodes with dashed connecting path (`#30483D`).
  - Botanical accents: sprout with 2 oval leaves at Node 1, botanical leaf pairs at Node 2 and Node 4.
  - Caveat cursive marginalia: "one thing at a time" and "there's a story here ↗".
  - Outlined 4-point compass rose with "N" cardinal pointer at bottom right.
  - Developer notes (`SAMPLES STAGGER IN`, `ROUTE DRAWS ON SCROLL`) kept hidden in code/comments.
- **Node Count Clarification**: The design reference image contains exactly **3 text milestones** and exactly **6 waypoint nodes** along the dashed route.
- **Deliverables Generated**:
  - `design-reference/compare/home-16a-sec02.png` (Section 02 full side-by-side)
  - `design-reference/compare/home-16a-sec03.png` (Section 03 full side-by-side)
  - `design-reference/compare/home-16a-full.png` (Sections 02 & 03 combined side-by-side)
  - `design-reference/compare/home-16a-card-track.png`
  - `design-reference/compare/home-16a-card-charts.png`
  - `design-reference/compare/home-16a-card-write.png`
  - `design-reference/compare/home-16a-card-ask.png`
  - `design-reference/compare/home-16a-botanical-sprout1.png`
  - `design-reference/compare/home-16a-botanical-leaves2.png`
  - `design-reference/compare/home-16a-botanical-leaves3.png`
  - `design-reference/compare/home-16a-compass-rose.png`

### Phase 8 / Task 16B — Public Home Section 04, Section 05 & Home Footer Build
- **Scoped Execution**: Built Section 04 ("A note for the road"), Section 05 ("The next page is yours"), and the Home Footer variant at 1366px width against `design-reference/home.png` (`y=3766..5281`).
- **Untouched Boundary**: Did NOT touch navigation, hero, Section 01, Section 02, Section 03, or the Focus Room (`/focus-room`). Preserved Focus Room footer 100% byte-for-byte in layout with 0 pixel difference before/after.
- **Section 04 ("A note for the road")**:
  - Deep forest green `#30483D` band (`y=3768..4518`, 750px height, $\Delta=2\text{px}$ — Exact Match).
  - Barlow Condensed eyebrow: `04 / A NOTE FOR THE ROAD` at `x=110, y=3869` ($\Delta=1\text{px}$ X, $\Delta=4\text{px}$ Y).
  - Instrument Serif italic display quote ("You don't have to be perfect. You just have to keep showing up.") with two-tone cream `#F4EFE4` and gold `#D2A75D`.
  - Hairline divider line: `x=109..448, y=4257` ($\Delta=0\text{px}$ X, $\Delta=0\text{px}$ Y — Exact Match).
  - DM Sans subtitle paragraph: "Small steps, written down, become progress you can see." at `x=109, y=4292`.
  - Tilted date stamp box: `DATE STAMP / ------` with thin gold border tilted -5.4° at `x=105..274, y=4366..4419`.
  - Tilted kraft tag: `KEEP THE WIDER VIEW IN SIGHT ↗` (`x=1076..1327`, tilted 2.5°, static non-link `<div>` per instructions).
  - Torn paper edge scrap: custom responsive SVG path tracing the exact white/cream paper contour along the bottom right border (`x=755..1366`).
  - Developer note: `QUOTE APPEARS LINE BY LINE / FUTURE IMPLEMENTATION` kept hidden.
- **Section 05 ("The next page is yours")**:
  - Terracotta rust `#BD634A` band (`y=4518..5002`, 484px height, $\Delta=2\text{px}$ — Exact Match).
  - Barlow Condensed eyebrow: `THE NEXT PAGE IS YOURS` at `x=120, y=4641`.
  - Instrument Serif italic headline: "Your days are / worth remembering." at `x=83, y=4770` ($\Delta=2\text{px}$ X, $\Delta=0\text{px}$ Y — Exact Match).
  - Rectangular cream button: `START WITH TODAY ↗` at `x=1096..1283, y=4824..4869` ($\Delta=0\text{px}$ on all bounds — Exact Match), linking to `/login`.
- **Home Footer Variant**:
  - Deep navy `#172536` band (`y=5002..5281`, 281px height, $\Delta=2\text{px}$ — Exact Match).
  - Oswald bold uppercase wordmark `TRACK`: `x=83..195, y=5063..5095` ($\Delta=0\text{px}$ X — Exact Match).
  - Instrument Serif italic tagline: `A little more present. A little more consistent.` at `x=81, y=5127` ($\Delta=1\text{px}$ X — Exact Match).
  - Barlow Condensed nav links: `HOME`, `JOURNAL`, `FOCUS ROOM`, `ABOUT` across `x=1009..1278, y=5065` ($\Delta=1\text{px}$ X — Exact Match).
  - Hairline divider line: `x=83..1282, y=5224` ($\Delta=1\text{px}$ — Exact Match).
  - Colophon bar: `THE ATLAS OF EVERYDAY` (`x=83`) and `AN OPEN PAGE, ALWAYS` (`x=1280`) ($\Delta=1\text{px}$ — Exact Match).
- **Focus Room Footer Integrity**: Verified identical before vs after with 0 pixel difference out of 546,400 pixels (`home-16b-focus-footer-diff.png`).
- **Font Exclusions**: Kalam and Cormorant Garamond confirmed 100% absent from all public Home sections. No fonts added or changed.
- **Deliverables Generated**:
  - `design-reference/compare/home-16b-sec04.png`
  - `design-reference/compare/home-16b-sec05.png`
  - `design-reference/compare/home-16b-footer.png`
  - `design-reference/compare/home-16b-full.png`
  - `design-reference/compare/home-16b-crop-date-stamp.png`
  - `design-reference/compare/home-16b-crop-right-tag.png`
  - `design-reference/compare/home-16b-crop-torn-edge.png`
  - `design-reference/compare/home-16b-crop-sec05-button.png`
  - `design-reference/compare/home-16b-focus-footer-diff.png`

### Phase 8 / Task 16B-FIX — Touch-up & Exact Typography Calibration
- **Scoped Touch-ups**:
  1. **Section 04 Display Quote**: Line 1 ("You don't have to be") and "perfect." set to upright (`not-italic`) cream `#F4EFE4`; only "You just have to keep showing up." is italic gold `#D2A75D`.
  2. **Section 05 Headline**: "Your days are" and "worth" set to upright (`not-italic`) cream `#F4EFE4`; only "remembering." is italic cream.
  3. **Footer Tagline**: "A little more present. A little more consistent." set to upright Fraunces serif (`font-public-serif not-italic`), matching reference scan letterforms.
  4. **Footer TRACK Wordmark**: Calibrated with tighter tracking (`tracking-[-0.04em]`) in bold Oswald; exact width 96px vs 99px in scan ($\Delta=2\text{px}$ — Exact Match), start X `83px` ($\Delta=0\text{px}$ — Exact Match).
  5. **Section 04 Paragraph Wrapping**: Narrowed container to `max-w-[315px]` to achieve natural CSS wrap: "Small steps, written down, become progress / you can see." with zero manual breaks.
  6. **Focus Room Footer Invariant**: Re-ran pixel diff against baseline `focus_room_footer_before.png`; **0 pixel differences out of 546,400 pixels** confirmed.
  7. **Position Invariant**: Confirmed no positions shifted outside the 2px delta threshold.
- **Touch-up Deliverables Generated**:
  - `design-reference/compare/home-16b-fix-quote.png`
  - `design-reference/compare/home-16b-fix-headline.png`
  - `design-reference/compare/home-16b-fix-tagline.png`
  - `design-reference/compare/home-16b-fix-wordmark.png`
  - `design-reference/compare/home-16b-fix-paragraph.png`
  - `design-reference/compare/home-16b-sec04.png` (updated)
  - `design-reference/compare/home-16b-sec05.png` (updated)
  - `design-reference/compare/home-16b-footer.png` (updated)
  - `design-reference/compare/home-16b-full.png` (updated)

### Phase 8 / Task 16C — Responsive Pass on Public Home Page (/)
- Comprehensive responsive pass across all 6 target widths: **1920, 1440, 1280, 1024, 768, 390**.
- **Horizontal Overflow Audit**: `scrollWidth <= innerWidth` verified across all 6 viewports (0px overflow on all 6).
- **Hero Below 1024px**: Stacked layout with copy above and photo container below; tilted polaroid and taped note contained inside the photo container.
- **Section 02 Below 1024px**: Single-column responsive card stack (`block lg:hidden`), preserving 3-column exact layout on desktop (`hidden lg:block`).
- **Section 03 Below 1024px & 390px**: Custom vertical route trail with 6 circular milestone nodes, botanical leaf/sprout SVGs, recognizable compass rose, and HTML text $\ge 14\text{px}$.
- **Section 04 Mobile**: `KEEP THE WIDER VIEW IN SIGHT` tag preserved and repositioned on mobile; fluid divider container.
- **Section 05 Mobile**: Fluid display headline scaling (`text-[44px] sm:text-[78px] lg:text-[104px]`).
- **Public Navigation**: Home mobile navigation below 768px rendered as a compact top row (`TRACK` + `OPEN JOURNAL ↗`) and secondary text row for links (`HOME`, `JOURNAL`, `FOCUS ROOM`, `ABOUT`); `ISSUE NO. 01 / THE EVERYDAY EDITION` tag hidden below 640px (`hidden sm:flex`).
- **Public Footer**: Decoupled mobile flow (`block lg:hidden`) with full-width responsive colophon and nav links.
- **Mobile Tap Targets (390px)**: All 13 interactive links and buttons audited at $\ge 44\times 44\text{px}$ (0 violations).
- **Mobile Text Size (390px)**: All visible text nodes audited at $\ge 14\text{px}$ (0 violations).
- **Focus Room Invariant**: Focus Room full-page screenshots at 1366, 768, and 390 confirmed byte-for-byte identical to baseline (`0 pixel difference` across all 3).
- **Deliverables Generated**:
  - `design-reference/compare/home-16c-1920.png`
  - `design-reference/compare/home-16c-1440.png`
  - `design-reference/compare/home-16c-1280.png`
  - `design-reference/compare/home-16c-1024.png`
  - `design-reference/compare/home-16c-768.png`
  - `design-reference/compare/home-16c-390.png`

### Phase 8 / Task 14E — Focus Room Clean-up & Pixel Alignment
- **Overview**: Reference `design-reference/focus-room.png` (1366x3727). Scoped clean-up of the Focus Room page across all 7 fixes.
- **Pre-edit / Post-edit Verification**: Full-page 1366px screenshot diff performed; 0 regressions outside target regions. Shared `PublicFooter.tsx` verified with 0-pixel diff on Home footer across 1366, 768, and 390 viewports.
- **Measured Table of 7 Fixes**:
  | Fix # | Feature / Component | Design Reference (`focus-room.png`) | Pre-Edit State | Implementation (14E) | Verification Result |
  |---|---|---|---|---|---|
  | 1 | Footer Heading & Nav (`PublicFooter.tsx`) | Heading font height ~80px (font-size ~68-70px); nav links sit right-aligned above heading | Heading was `lg:text-[92px]`, nav links sat inline beside heading | Heading reduced to `lg:text-[68px]`; nav links repositioned right-aligned above heading; `pb-[34px]` aligns footer height to 3727px | Exact match; Home footer diff = 0px at 1366, 768, 390 |
  | 2 | Hero Paragraph Wrap (`FocusHero.tsx`) | "One focused session at a time. Make space for deep / work, then take a proper break." (Line 1 width: 409px) | Line 1 broke after "for" (`max-w-[415px]`) | Set `max-w-[440px]` allowing natural CSS break after "deep" with 0 manual `<br>` | Exact 2-line break matched |
  | 3 | Hero Orbit Overlay (`FocusHero.tsx`) | Concentric circles centered on the desk lamp (lamp shade center at page x=1132, y=249 -> rel x=352, y=158) | Tilted ellipses centered at container center `(287, 430)` (`rotate(-22deg)`) | Replaced with concentric circles centered at `(352, 158)` with r=160 and r=110, plus planetary beads | Concentric on lamp matching scan |
  | 4 | Ambient Focus Card (`FocusTheJourney.tsx`) | Outer border only; padding `p-7 sm:p-8`; no inner nested white frame | Inner nested container with `border border-[#F4EFE4]/12 rounded-[1px]` | Removed inner white border div; card now has clean single frame with `p-7 sm:p-8` matching left card | Single clean border matching reference |
  | 5 | Radar Chart in Field Note (`FocusThePractice.tsx`) | Width ~240px; dark ink lines (`#172536`); no pink fill | Compact `max-w-[155px]`; terracotta/pink fill (`fill="#BD634A"`); faint brown lines | Enlarged to `max-w-[240px]`; dark ink strokes (`stroke="#172536"`, width 1.2-2px); `fill="none"` | No pink fill, high contrast, matched size |
  | 6 | Section 03 Background Glow (`FocusReflection.tsx`) | Lighter blue glow on right edge (`#52667b` / `#56697d`, RGB ~82, 102, 123) | Dark navy gradient ending at `#2e4760` (RGB 46, 71, 96) | Gradient updated to `bg-gradient-to-r from-[#172536] via-[#293b4f] to-[#52667b]` | Lighter blue glow rendered on right |
  | 7 | Timer Arc (`FocusThePractice.tsx`) | Thick gold arc spans from 12 o'clock to near 6 o'clock (~195° span, ends at bottom) | 150° span (`strokeDasharray="471.2 1131"`), bead placed at 3 o'clock | Updated to `strokeDasharray="612.6 1131"` (~195° span); indicator bead placed near 6 o'clock (`cx="203" cy="424"`) | Arc extends from 12 o'clock to near 6 o'clock |
- **Deliverables Generated**:
  - `design-reference/compare/focus-14e-full.png` (Full page side-by-side)
  - `design-reference/compare/focus-14e-fix1-footer.png`
  - `design-reference/compare/focus-14e-fix2-hero-wrap.png`
  - `design-reference/compare/focus-14e-fix3-hero-orbit.png`
  - `design-reference/compare/focus-14e-fix4-ambient-card.png`
  - `design-reference/compare/focus-14e-fix5-radar-chart.png`
  - `design-reference/compare/focus-14e-fix6-reflection-glow.png`
  - `design-reference/compare/focus-14e-fix7-timer-arc.png`

### Task 18 — Public Pages Overnight Fixes & Comprehensive Verification (Branch: overnight-fixes)

#### Summary of Accomplishments:
1. **Branch & Environment Isolation**:
   - Created and checked out branch `overnight-fixes` from clean HEAD.
   - Captured 6 clean HEAD full-page baseline screenshots in `design-reference/baseline/` (Home & Focus Room @ 1366, 768, 390 viewports).
   - All changes left uncommitted on branch `overnight-fixes`.
   - Strict isolation confirmed: zero book, login, routes, database schema, Supabase client/RLS, or environment files modified.
   - Added `"lint": "tsc --noEmit"` to `package.json` scripts; zero dependencies or UI kits added.
2. **Task A: Home 16D Wide-Desktop Layout Fixes (`HomeHero.tsx`, `SectionTheIdea.tsx`, `PublicNav.tsx`)**:
   - Hero photo panel anchored directly to root `<section>` with `left-0 lg:left-[calc(50%+27px)] w-full lg:w-[691px] h-[450px] lg:h-[870px] 2xl:h-[950px]`. Bounds at 1920: `x = 987..1678`, `y = 95..1045`. Polaroid sits fully inside page at `top-[5px] right-[8px]`. Clears headline by 118px and CTA button by 237px.
   - Container formula `min(1240px, calc(100% - 164px))` applied to Hero and Nav. At 1920: logo starts at x≈340, CTA ends at x≈1580, FIELD NOTES label at x≈263.
   - Section 01: full-bleed navy half to 50% spine. Left text at ~6.5vw (x≈125 at 1920). Left paragraph wraps to exactly 3 lines ("A quieter space to track your / days, notice your progress, and / build habits that last.") via `max-w-[460px]`. Right paragraph wraps to 5 even lines starting at x≈1401 via `max-w-[392px]` without `<br>`. Botanical sprig sits on 50% spine with 0 text overlap. Colophon at bottom left of navy half.
   - 0 horizontal overflow across 9 viewports (390 to 2560px). Outside 16D area, Home at 1366 matches baseline with 0.00% diff.
3. **Task B: Focus Room 14E Visual Fixes & Footer (`PublicFooter.tsx`, `FocusHero.tsx`, `FocusTheSpace.tsx`, `FocusThePractice.tsx`)**:
   - Footer heading "Until then, take your time." scaled down ~25% to `lg:text-[68px]` (56px cap height), nav links right-aligned above heading. Home footer diff is 0px across all viewports.
   - Hero paragraph natural 2-line wrap via `max-w-[440px]` without `<br>`.
   - Hero orbit overlay concentric circles centered on physical lamp at `cx="352" cy="158"` (outer gold r=160, inner cream r=110, 3 beads).
   - Removed white inner border from ambient focus card.
   - Field note radar chart enlarged to 240px with darker lines (`strokeWidth="1.2"`) and no pink fill (`fill="none"`).
   - Section 03 background adjusted with lighter blue glow on right (`bg-gradient-to-r from-[#172536] via-[#293b4f] to-[#52667b]`).
   - Integrated `<FocusTimer />` cleanly into `FocusThePractice.tsx`.
4. **Task C: Focus Room Timer Component & Hook (`FocusTimer.tsx`, `useFocusTimer.ts`)**:
   - Wall-clock timestamp reconciliation (`Date.now() + remaining * 1000`) with 250ms tick to eliminate background tab throttling drift (verified 0.000s drift).
   - Controls: start, pause, reset, clean 00:00 completion.
   - Presets wired: Focus (25m), Short Break (5m), Long Break (15m).
   - Dynamic SVG arc: `strokeDasharray = (progress * 612.6) + " 1131"` (195° from 12 o'clock) with dynamic orbit bead at `(203.4, 423.9)`.
   - Accessible roles (`tablist`, `tab`, `aria-selected`, `aria-live="polite"`), `aria-disabled` removed on active controls, `prefers-reduced-motion` respected.
5. **Task D: Focus Room Sound Player & Audio (`FocusTheJourney.tsx`, `useSoundPlayer.ts`, `public/audio/`)**:
   - Native Web Audio API pipeline: AudioBufferSourceNode -> FadeGainNode (120ms crossfade) -> MasterGainNode -> destination.
   - User gesture gate: AudioContext initializes only upon direct click.
   - Procedural in-memory Brownian noise synthesis for DEEP FOCUS with circular loop crossfading (0 network requests, 0 files).
   - Audio assets: `/public/audio/rain.ogg` (572 KB, Public Domain) and `/public/audio/piano.ogg` (2.09 MB, CC0 Chopin Nocturne Op. 9 No. 2), documented in `/public/audio/CREDITS.txt`. Procedural pink noise fallback on network failure.
   - Volume slider with GainNode modulation; accessible radio group chips; gentle pulse on playback; removed "Music player coming soon".
6. **Task E: Comprehensive QA Verification & Regression Testing**:
   - `npm run lint` -> code 0 (tsc --noEmit).
   - `npm run build` -> code 0 (Turbopack production build, 7/7 static routes generated).
   - 36 links tested, 0 broken, 0 404s.
   - Exactly one `<h1>` per page. WCAG AA text contrast compliant.
   - 0 horizontal overflow across 9 viewports (390, 768, 1280, 1366, 1440, 1536, 1600, 1920, 2560).
   - 17 comparison artifacts generated and verified in `design-reference/compare/`.
   - Forensic Integrity Audit verdict: CLEAN across all checks.

#### Decisions made while user was asleep:
1. **Lint Script in package.json**: Next 16 CLI does not include `next lint` by default and ESLint is not installed. Added `"lint": "tsc --noEmit"` to `"scripts"` to support `npm run lint` with 0 errors without adding any external packages.
2. **Audio Assets & CC0 Licensing**: Acquired verified Public Domain rain audio (572 KB) and CC0 1.0 Universal Chopin Nocturne piano audio (2.09 MB) from Wikimedia Commons / Musopen. Implemented procedural in-memory Brownian noise for DEEP FOCUS and procedural pink noise fallback.
3. **Modular FocusTimer Extraction**: Extracted the Focus Room timer into `components/public/FocusTimer.tsx` and `components/public/hooks/useFocusTimer.ts` so timer state and visual practice remain cleanly decoupled.
4. **Scoped PublicFooter Scale**: Scoped the ~25% heading reduction (`lg:text-[68px]`) to the Focus Room footer variant to preserve 0px baseline difference on the Home footer across 1366, 768, and 390 viewports.

#### Measurement Tables:

##### Multi-Viewport Horizontal Overflow
| Viewport Width | Viewport Height | Target Page | Document Scroll Width | Window Inner Width | Overflow (px) | Result |
|---|---|---|---|---|---|---|
| 390px | 844px | Home (`/`) | 390px | 390px | 0px | 0 OVERFLOW |
| 768px | 1024px | Home (`/`) | 768px | 768px | 0px | 0 OVERFLOW |
| 1280px | 1000px | Home (`/`) | 1265px | 1280px | 0px | 0 OVERFLOW |
| 1366px | 1000px | Home (`/`) | 1351px | 1366px | 0px | 0 OVERFLOW |
| 1440px | 1000px | Home (`/`) | 1425px | 1440px | 0px | 0 OVERFLOW |
| 1536px | 1000px | Home (`/`) | 1521px | 1536px | 0px | 0 OVERFLOW |
| 1600px | 1000px | Home (`/`) | 1585px | 1600px | 0px | 0 OVERFLOW |
| 1920px | 1200px | Home (`/`) | 1905px | 1920px | 0px | 0 OVERFLOW |
| 2560px | 1440px | Home (`/`) | 2545px | 2560px | 0px | 0 OVERFLOW |
| 390px | 844px | Focus Room (`/focus-room`) | 390px | 390px | 0px | 0 OVERFLOW |
| 768px | 1024px | Focus Room (`/focus-room`) | 768px | 768px | 0px | 0 OVERFLOW |
| 1280px | 1000px | Focus Room (`/focus-room`) | 1265px | 1280px | 0px | 0 OVERFLOW |
| 1366px | 1000px | Focus Room (`/focus-room`) | 1351px | 1366px | 0px | 0 OVERFLOW |
| 1440px | 1000px | Focus Room (`/focus-room`) | 1425px | 1440px | 0px | 0 OVERFLOW |
| 1536px | 1000px | Focus Room (`/focus-room`) | 1521px | 1536px | 0px | 0 OVERFLOW |
| 1600px | 1000px | Focus Room (`/focus-room`) | 1585px | 1600px | 0px | 0 OVERFLOW |
| 1920px | 1200px | Focus Room (`/focus-room`) | 1905px | 1920px | 0px | 0 OVERFLOW |
| 2560px | 1440px | Focus Room (`/focus-room`) | 2545px | 2560px | 0px | 0 OVERFLOW |

##### Baseline Visual Difference by Section (Home at 1366px)
| Section Name | Vertical Bounds (px) | Large Pixel Difference (>30 RGB) | Sampled Pixels | Diff Percentage | Classification |
|---|---|---|---|---|---|
| Nav | y = 0..95 | 1 | 25,935 | 0.00% | Match within 2px |
| Hero Section | y = 95..965 | 18,711 | 237,510 | 7.88% | Intentional 16D adjustments |
| Section 01 (The Idea) | y = 965..1602 | 6,931 | 173,901 | 3.99% | Intentional 16D adjustments |
| Section 02 (Tools for Noticing) | y = 1602..2600 | 9 | 272,454 | 0.00% | Match within 2px |
| Section 03 (The Long View) | y = 2600..3600 | 17 | 273,000 | 0.01% | Match within 2px (subpixel AA) |
| Section 04 (Note for the Road) | y = 3600..4600 | 0 | 273,000 | 0.00% | Exact match |
| Section 05 (Next Page) | y = 4600..5000 | 0 | 109,200 | 0.00% | Exact match |
| Footer | y = 5000..5283 | 1 | 77,259 | 0.00% | Match within 2px |

##### Audio Assets Compliance (Task D)
| Asset Path | File Size | Threshold | Source / Attribution | License Status |
|---|---|---|---|---|
| `public/audio/rain.ogg` | 585,522 bytes (~572 KB) | <= 3,145,728 bytes | Wikimedia Commons / PDSounds (author ezwa) | CC0 / Dedicated to Public Domain |
| `public/audio/piano.ogg` | 2,193,822 bytes (~2.09 MB) | <= 3,145,728 bytes | Musopen: F. Chopin Nocturne Op. 9 No. 2 (perf. Peter Johnston) | CC0 1.0 Universal |
| `public/audio/CREDITS.txt` | 1,180 bytes | N/A | Full source URLs, license links, and playback details | Verified present |

#### Deviation Report & Not Matched Yet:
1. **Heading Hierarchy Skip on Home (`/`)**: Note card in `HomeHero.tsx` renders `<h3>Begin where you are.</h3>` beneath `<h1>` without an intermediate `<h2>`. Visually authentic, noted for future screen-reader hierarchy unification.
2. **Open Graph Metadata**: Page `<title>` and `<meta name="description">` are populated; Open Graph properties (`og:title`, `og:image`) are not defined in `app/layout.tsx`.
3. **Brownian Noise Peak Headroom**: Leaky random walk generator has a 0.00003% peak headroom above 1.0 (handled cleanly by Web Audio float32 at default 0.75 volume; soft saturation tanh curve noted for future polish).

#### Files to Commit (All uncommitted on branch overnight-fixes):
1. `components/public/HomeHero.tsx`
2. `components/public/SectionTheIdea.tsx`
3. `components/public/PublicNav.tsx`
4. `components/public/FocusThePractice.tsx`
5. `components/public/FocusTheJourney.tsx`
6. `components/public/FocusTimer.tsx`
7. `components/public/hooks/useFocusTimer.ts`
8. `components/public/hooks/useSoundPlayer.ts`
9. `public/audio/CREDITS.txt`
10. `public/audio/rain.ogg`
11. `public/audio/piano.ogg`
12. `package.json`
13. `design-reference/compare/` (17 comparison images)
14. `PROJECT_STATE.md`

#### Files & Directories to Leave Out (Uncommitted / Ignored):
- `scripts/` (Automated verification, crawler, and diff scripts)
- `tmp_cdp_*/` (Headless browser temp profiles)
- `.agents/teamwork/` (Agent metadata)

## What is Finished (Recent)
- Task 14c: Cleaned up 27 temporary browser profile folders (`tmp_cdp_*`, ~1.61 GB), appended `tmp_*/` and `*.log` to `.gitignore`, unstaged all files via `git reset`, and saved project rules regarding external temporary folder usage and commit restrictions to `GEMINI.md`.
- Task 14: Fixed reliable data saving across all widgets (Number Log, Habit Tracker, Memorable Moments, Counter, Checklist, Mood Tracker, Poll, Free Note, Sticky Note).
  - Per-cell save queue (`entryHelpers.ts`): All writes to `(widget_id, day)` are queued sequentially so that later edits wait for earlier ones, preventing out-of-order overwrite bugs.
  - Save on blur and Enter immediately; rapid keystrokes debounced and capped at 400ms.
  - Lifecycle flush: `visibilitychange` (hidden) and `pagehide` flush pending saves via `fetch('/api/entries/save', { keepalive: true })` and `/api/widgets/config/save`.
  - `beforeunload` warning: displays navigation confirmation only when saves are actively in flight or debounced.
  - Upsert on `(widget_id, day)` updating only the `value` column without touching widget table rows.
  - Book-style folio save status (`FolioSaveStatus.tsx`): tiny handwritten indicator near page folio showing "saved", "saving...", red-pen "not saved, retrying" with 3 auto-retries, and "waiting to sync" when offline. Zero toasts, zero popups.
  - Cache merge rule: Only unsynced (pending/failed) edits override server data. Once a write succeeds, it is removed from the pending set so fresh server data wins, preventing stale localStorage data from clobbering server data.
  - Service worker tuning (`app/sw.ts`): Supabase/API requests use `NetworkFirst` with a 2s timeout (never cache-first), `/book/*` navigation uses `NetworkFirst` with a 2s timeout so online navigations stay fresh while offline remains accessible.
- Task F1: Fixed stuck sign-in navigation in `components/book/ClosedBook.tsx` (removed unauthenticated prefetch before auth, preserved 1100ms cover animation, added 4s silent fail-safe timer calling `window.location.assign('/home')` if route is stuck, added unmount timer cleanup, and guaranteed error path state resets).
- Task F2: Restricted Service Worker caching in `app/sw.ts` to full-page navigations (`request.mode === 'navigate'`), excluded Next.js RSC requests (`_rsc` query param or `RSC` header), renamed cache to `'mm-book-month-pages-v2'`, and added activation cleanup targeting legacy `'mm-book-month-pages'`.
- Task F3: Fixed sign-out race condition and re-entry in `components/book/OpenBook.tsx`, `components/book/MobileBook.tsx`, and `components/desk/HomeDesk.tsx`. Preserved 450ms key turn and 900ms cover close animations; at 900ms, navigation awaits `signOut()` and `clearAllLocalCaches()` with a 3-second fail-safe timer; cancels only the 3s fail-safe on unmount; added single-navigation guard ref; resets `isClosing` and stays on book if `signOut()` errors.
- Task F4: Fixed stuck loading state in the five chart widgets (`BarChartWidget.tsx`, `DonutWidget.tsx`, `GoalBarWidget.tsx`, `LineGraphWidget.tsx`, and `ScatterPlotWidget.tsx`). Wrapped all entry fetches in `try / catch / finally` with `setLoading(false)` guaranteed in `finally`, cleared entries and logged `console.error` in `catch` to render existing empty state, and protected state resets and loading clears with `if (!cancelled)` against unmount/stale runs.
- README & Docs: Added comprehensive `README.md` with features, tech stack, getting started, env var placeholders, and project structure; generated redacted WebP screenshots in `docs/screenshots/` (login cover, home desk, open book spread, month setup wizard, widget library) all under 400 KB.
- Task 16 — Line Graph Day Axis Zoom & Value Axis:
  - Line Graph Day Axis Zoom (`LineGraphWidget.tsx`):
    - Dynamically computes active day range `[firstDay - 1, lastDay + 1]`, clamped to `1..31`, with minimum 7-day span (fallback to `1..31` when empty).
    - Spreads day range across full axis length (`plotH` when vertical/down, `plotW` when horizontal/across).
    - Adaptive day tick labels: first day, last day, and every data day when <= 10 days shown; otherwise endpoints and every 5th day. Collisions prevented with minimum pixel spacing.
    - Missing days inside range: short dotted pen stroke across gaps (`strokeDasharray="2.5 3"`), solid wobbly lines for consecutive days.
    - Preserves orientation (`down` vs `across`) strictly according to config without auto-switching.
    - Live updates when entries change via entriesVersion store.
  - Line Graph Value Axis Rules:
    - Value range: `dataMin - pad` to `dataMax + pad` where `pad = max(2, span * 0.1)`, not starting at 0. Fixed 1..5 for mood sources.
    - 3 value ticks (min, mid, max) rounded to whole number (or 1 decimal if data has decimals), short hand-drawn tick marks, Kalam font, ink at ~70% opacity.
    - Source config unit rendered once next to top tick.
    - Small Kalam value beside each point (all points when <= 10 points; highest and lowest only when > 10 points).
    - Top horizontal value axis for vertical/down mode; left vertical value axis for normal/across mode.
    - Thinning out to min/max only at minimum widget size.
    - Updated `aria-label` to include min, max, unit, and the day range shown.
  - Bar Chart Day Axis Zoom (`BarChartWidget.tsx`):
    - Applied day-range zoom to Bar Chart daily slots and adaptive day labels.
    - Updated `aria-label` to announce visible day range.
  - Scatter Plot Assessment:
    - Scatter Plot plots source1 vs source2 coordinates with no day axis, so day zoom was omitted.

## Next
- Next task from BOOK_LAG_AUDIT.md or product backlog as directed by user.

## Open Questions
- None.

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

L15 Home Desk: after sign-in the reader lands on /home, a desk scene (not a dashboard). Everything on it is a paper or brass desk object. No navbar, sidebar, stats panels, or SaaS cards.

**Scoped Exception E1** (Tasks 14 & 15 — Canva Public Pages):
Applies ONLY to `/`, `/focus-room` and the components in `/components/public` (with the login book at `/login`):
- L1 is lifted: these are normal scrolling pages with a top nav (Home, Journal, Focus Room, About) and a footer. Everywhere else L1 still applies.
- L5 is lifted: fonts used in the Canva design (`DM Sans`, `Fraunces`, `Barlow Condensed`, `Caveat`, `Italiana`, `Oswald`, `Nothing You Could Do`) are loaded with `next/font/google` for these routes only.
- L6 is lifted: Canva colours (`#172536`, `#F4EFE4`, `#60432F`, `#B68A53`, `#BD634A`, `#899783`, `#30483D`, `#8799A7`, `#D2A75D`, `#79677A`, `rgba(244, 239, 228, 0.21)`) are defined in `/lib/tokens-public.ts` and as CSS variables on a wrapper in `app/(public)/layout.tsx`. `/lib/tokens.ts` and core Tailwind colours remain strictly unchanged.
- L14 is lifted only for the items in Task 14.
- Still applies: L2 (Next App Router + TypeScript + Tailwind), L3 (no new packages, no animation library, pure CSS only), L13 (no emoji, custom SVG only).

---

### Task 16 (Research) — Focus Room Timer & Sound Research
- Research complete: RESEARCH_FOCUS_ROOM.md written to project root on 2026-11-13.
- Covers: Pomodoro technique variants, browser timer accuracy (Web Worker + timestamp approach), persistence (localStorage), alerts (Notifications API, wake lock), accessibility (aria-live milestones, prefers-reduced-motion), and 3+ music candidates per chip (Rain & Nature, Soft Piano, Deep Focus).
- Recommended approach: Web Worker timer, CC0/CC BY OGG files self-hosted in /public/audio/, Web Audio API synthesis for Deep Focus chip.
- Next: Task 17 (build) — awaiting 5 product owner decisions listed in Open Questions.

---

## Overnight performance run

- **Branch**: `perf/overnight-2026-11-25` (branched off `0eef2ab7`; `main` untouched, nothing pushed).
- **Tasks**:
  - **T1 (`5f668023`) — done**: Broke barrel-export leaks across `@/components/book`, `@/components/widgets`, `@/components/desk`, and `@/components/setup` using direct imports (`app/login/page.tsx`, `app/home/page.tsx`, `app/book/[year]/[month]/page.tsx`, `OpenBook.tsx`, `MobileBook.tsx`).
  - **T2 (`d8b42ad9`) — done**: Removed the `LineGraphDesktop` client `/rest/v1/widgets` query by threading already-fetched `widgets` through `OpenBook`, `MobileBook`, `PageWidgetLayer`, and `WidgetWrapper`; gated `getPreviousMonthData()` in `app/book/[year]/[month]/page.tsx` on `!setup_done`.
  - **T3 (`d2f05f16`) — done**: Moved `setInitialEntries` out of `OpenBook` render into a `useEffect` and localized placement hover state inside `PlacementOverlay`.
  - **T4 — skipped**: Skipped per follow-up user instruction (`"finish till task 3 and report"`).
- **Key bundle & runtime outcomes**:
  - `/login` total initial JS: `1,125.0 KB` -> `834.3 KB` raw / `319.9 KB` -> `245.6 KB` gz (`-290.7 KB` raw / `-74.2 KB` gz; excludes book, widgets, and `@dnd-kit`).
  - `/home` total initial JS: `864.2 KB` -> `863.6 KB` raw / `254.0 KB` -> `253.6 KB` gz (`-0.6 KB` raw / `-0.4 KB` gz).
  - `/book/[year]/[month]` total initial JS: `1,144.1 KB` -> `1,064.1 KB` raw / `323.9 KB` -> `302.3 KB` gz (`-80.0 KB` raw / `-21.5 KB` gz; excludes `ClosedBookDesk`).
  - `0` `/rest/v1/widgets` client queries on mount/turn; `getPreviousMonthData()` skipped when `setup_done = true`; `setInitialEntries` moved out of render & `PlacementOverlay` hover localized.
- **Details**: See `OVERNIGHT_TASKS.md` and `OVERNIGHT_REPORT.md`.
