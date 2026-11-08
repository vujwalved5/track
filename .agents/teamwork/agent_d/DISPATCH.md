## 2026-11-08T16:08:25Z

You are Agent D (OpenBook Owner) for the "Memorable Moments" digital journal optimization.
Your working directory is: c:\Users\aruko\OneDrive\Desktop\Documents\track\.agents\teamwork\agent_d\
Your parent is orchestrator: d182f0bb-01fa-45ed-9815-336f98e5e38b

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MANDATORY: Read the authoritative request at:
c:\Users\aruko\OneDrive\Desktop\Documents\track\.agents\teamwork\ORIGINAL_REQUEST.md
Also read GEMINI.md (locked decisions L1 to L14), PROJECT_STATE.md, OPTIMISATION_PLAN.md, and HANDOFF.md (at project root, created by Agent A) before starting work.

CRITICAL GIT REQUIREMENT:
- You must work on branch `optimise`.
- When all your work is complete, produce ONE clean git commit for your task: `git add <your files>` and commit with descriptive message.

STRICT FILE OWNERSHIP (You are the ONLY agent permitted to edit OpenBook.tsx and MobileBook.tsx):
- `components/book/OpenBook.tsx`
- `components/book/MobileBook.tsx`
- `createWidget` action file (wherever it lives, e.g. `components/widgets/widgetActions.ts` or `app/actions/widget.ts` or `lib/widgetActions.ts` — inspect file location)
- `PLAN_D.md` (at project root)
- Files in your working directory `.agents/teamwork/agent_d/`
DO NOT edit any other files!

TASK REQUIREMENTS (Fix 3, Dynamic Imports, Prefetching, Single Tree Mount, useCallback Stability, InitialEntries):
1. Prefetching:
   - In `OpenBook.tsx` (and `MobileBook.tsx`), prefetch previous and next month routes in a `useEffect` via `router.prefetch(...)`.
   - Also prefetch on month-tab pointer-down and hover.
   - Keep 600ms page turn animation and `router.push` timing unchanged (L12).
2. Optimistic Widget Placement (Fix 3):
   - In `handlePlaceWidget`: generate `id = crypto.randomUUID()`.
   - Run client-side bounds and overlap check; insert widget into state optimistically.
   - Close placement overlay and drawer immediately; enter Arrange mode immediately so widget is draggable on next frame.
   - Call `createWidget` in the background with the same id (`createWidget` must accept an optional `id?: string` parameter; if provided, uses that id instead of generating new one).
   - On server/placement failure: roll back the optimistic widget and display a handwritten red-pen message on the page (in `#b3261e` font Kalam, e.g. positioned inline on the page; NEVER a toast, popup, banner, or alert per L1).
3. Dynamic Imports (Code Splitting):
   - Replace static imports of `MonthSetupWizard`, `WidgetDrawer`, and `WidgetConfigCard` with `next/dynamic` and `{ ssr: false }`.
   - Ensure zero layout jump (use proper null or skeleton fallback matching the component size).
4. Leaf Container GPU acceleration:
   - Add `transform-gpu` class to the turning leaf container ONLY (not the book casing, cover, or ribbon).
5. Single Tree Mount (Fix 10):
   - Keep exactly ONE tree mounted. When `isDesktop === null` (SSR / initial hydration before media query resolves), render a placeholder styled with background `#211b16`, full viewport size (`w-screen h-screen min-h-screen`), and `contain: paint layout` so desktop and mobile trees do not mount simultaneously, eliminating duplicate hydration and layout shifts.
6. Callback Stability:
   - Keep callbacks stable with `useCallback` so Agent C's `WidgetWrapper` `React.memo` works effectively without unnecessary re-renders.
7. Prop Plumbing (`initialEntries`):
   - Wire up `initialEntries` from Agent A's `HANDOFF.md` through `OpenBook.tsx` and `MobileBook.tsx` down to page widget layers and widgets.
8. Write your plan to `PLAN_D.md` in the project root first, then build immediately. Do not stop for GO approvals unless something conflicts with L1-L14 or code no longer matches plan line numbers. Place any unrequested ideas under "Ideas (not built)".
9. Run `npm run build` to verify there are zero build/TypeScript errors.
10. Commit your changes to git on branch `optimise`.
11. Write your completion report to `c:\Users\aruko\OneDrive\Desktop\Documents\track\.agents\teamwork\agent_d\handoff.md`.
12. Send a message to orchestrator (`d182f0bb-01fa-45ed-9815-336f98e5e38b`) when finished!
