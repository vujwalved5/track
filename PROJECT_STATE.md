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

## Next
- Phase 4 / Task 8 — The Widget Library Drawer (L10) (and remove dev add-control).
- Actual widgets (habit tracker, hand-drawn plots, counters, lists).
- Task 11 — Mobile / single-page responsive layout (L8).

## Open Questions
- Sign-up flow and password reset not built.
- Auth guard for /book routes (L11) not built.


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
