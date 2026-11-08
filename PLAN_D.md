# PLAN_D.md — Agent D (OpenBook Owner) Optimization Plan

Restatement of Task:
1. **Prefetching**:
   - In `OpenBook.tsx` and `MobileBook.tsx`, prefetch previous and next month routes in a `useEffect` via `router.prefetch(...)`.
   - Also prefetch on month-tab pointer-down and hover.
   - Keep 600ms page turn animation and `router.push` timing unchanged (L12).
2. **Optimistic Widget Placement (Fix 3)**:
   - In `handlePlaceWidget`: generate `id = crypto.randomUUID()`.
   - Run client-side bounds and overlap check; insert widget into state optimistically.
   - Close placement overlay and drawer immediately; enter Arrange mode immediately so widget is draggable on next frame.
   - Call `createWidget` in the background with the same id (`createWidget` accepts optional `id?: string` parameter).
   - On server/placement failure: roll back the optimistic widget and display a handwritten red-pen message on the page (in `#b3261e` font Kalam, inline on the page; NEVER a toast, popup, banner, or alert per L1).
3. **Dynamic Imports (Code Splitting)**:
   - Replace static imports of `MonthSetupWizard`, `WidgetDrawer`, and `WidgetConfigCard` with `next/dynamic` and `{ ssr: false }`.
   - Ensure zero layout jump using proper null fallback matching component positioning.
4. **Leaf Container GPU Acceleration**:
   - Add `transform-gpu` class to the turning leaf container ONLY (not the book casing, cover, or ribbon).
5. **Single Tree Mount (Fix 10)**:
   - Keep exactly ONE tree mounted. When `isDesktop === null`, render a placeholder styled with background `#211b16`, full viewport size (`w-screen h-screen min-h-screen`), and `contain: paint layout`.
6. **Callback Stability**:
   - Keep callbacks stable with `useCallback` (`handleOpenConfig`, `handleCloseConfig`, drawer toggles, overlay hover) so Agent C's `WidgetWrapper` `React.memo` works effectively without unnecessary re-renders.
7. **Prop Plumbing (`initialEntries`)**:
   - Wire up `initialEntries` from Agent A's `HANDOFF.md` through `OpenBook.tsx` and `MobileBook.tsx` down to widgets.
8. **Verification & Clean Git Commit**:
   - Build verification via `npm run build` (0 TypeScript / Turbopack errors).
   - Produce one clean git commit on branch `optimise`.

## Files to Edit
1. `components/widgets/widgetActions.ts` — Update `createWidget` to accept optional `id?: string` parameter and use it in Postgres insert.
2. `components/book/OpenBook.tsx` — Implement prefetching, optimistic widget placement with rollback and inline red-pen error, dynamic code splitting with `next/dynamic`, `transform-gpu` on flipping leaves, single-tree placeholder styling, callback stabilization with `useCallback`, and prop plumbing.
3. `components/book/MobileBook.tsx` — Implement prefetching, dynamic import for `MonthSetupWizard`, and `initialEntries` prop plumbing.
4. `PLAN_D.md` — This plan file.
5. `.agents/teamwork/agent_d/*` — BRIEFING.md, progress.md, handoff.md.

## Uncertainties / Clarifications
- None. Requirements strictly conform to Locked Decisions L1 to L14 and specifications in HANDOFF.md and OPTIMISATION_PLAN.md.

## Ideas (not built)
- Speculative prefetching of next-to-adjacent months (e.g. month + 2) during long idle periods.
- Pointer gesture velocity detection for turning leaves.
