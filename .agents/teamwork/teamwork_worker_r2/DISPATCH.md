## 2026-11-08T13:56:38Z
You are teamwork_worker_r2.
Your working directory is: c:\Users\aruko\OneDrive\Desktop\Documents\track\.agents\teamwork\teamwork_worker_r2
Your parent is orchestrator: d7847ee1-8027-4cb5-b1ca-7aa7a2e95f75

MANDATORY FIRST STEP:
Read the authoritative user request at:
c:\Users\aruko\OneDrive\Desktop\Documents\track\.agents\teamwork\ORIGINAL_REQUEST.md

READ THE REVIEW & CHALLENGE REPORTS:
- Reviewer 1 report: c:\Users\aruko\OneDrive\Desktop\Documents\track\.agents\teamwork\teamwork_reviewer_r1_1\handoff.md
- Reviewer 2 report: c:\Users\aruko\OneDrive\Desktop\Documents\track\.agents\teamwork\teamwork_reviewer_r1_2\handoff.md
- Challenger 1 report: c:\Users\aruko\OneDrive\Desktop\Documents\track\.agents\teamwork\teamwork_challenger_r1_1\handoff.md
- Challenger 2 report: c:\Users\aruko\OneDrive\Desktop\Documents\track\.agents\teamwork\teamwork_challenger_r1_2\handoff.md
- Auditor report: c:\Users\aruko\OneDrive\Desktop\Documents\track\.agents\teamwork\teamwork_auditor_r1_1\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE WRITE OWNERSHIP:
You own exclusively:
`c:\Users\aruko\OneDrive\Desktop\Documents\track\OPTIMISATION_PLAN.md`
And metadata files in your working directory `c:\Users\aruko\OneDrive\Desktop\Documents\track\.agents\teamwork\teamwork_worker_r2\`.
You MUST NOT edit any application source files, styles, database data, or package configurations.

YOUR TASK:
Refine and update `c:\Users\aruko\OneDrive\Desktop\Documents\track\OPTIMISATION_PLAN.md` to incorporate the following 9 critical amendments identified during peer review and adversarial testing:

1. **Finding O4 (Table row O4)**:
   - Correct the inaccurate claim that `zustand` has 0 usages. It is actively imported in `store/entriesVersion.ts:14` and subscribed to across 8 files (`lib/offlineSync.ts`, `BarChartWidget.tsx`, `DonutWidget.tsx`, `entryHelpers.ts`, `GoalBarWidget.tsx`, `LineGraphWidget.tsx`, `ScatterPlotWidget.tsx`).
   - The true bottleneck is that `useEntriesVersionStore` is an unpartitioned monolithic counter that invalidates all charts spread-wide (as correctly identified in Finding R1).
2. **Fix 12 & Task 7 (Dependency Cleanup)**:
   - Remove the proposal to delete `zustand` from `package.json`. `zustand` is explicitly permitted by Rule L3 and needed for the partitioned store.
   - Refocus Fix 12 exclusively on removing the undeclared `@dnd-kit/utilities` phantom import in `WidgetWrapper.tsx:20` and replacing it with an inline translation template string `translate3d(${Math.round(transform.x)}px, ${Math.round(transform.y)}px, 0)`.
3. **Finding D2 (Line References)**:
   - Correct the `components/book/MobileBook.tsx` line reference from `320-335` to `131-155, 362-434` (pointing to `handleTurnBack`/`handleTurnNext` handlers and folio navigation buttons).
4. **Fix 1 & Task 1 (Auth Sequence & Relational Joins)**:
   - Structure the auth flow properly: await `supabase.auth.getUser()` first; if `!user`, `redirect('/')`. Then run `Promise.all([ getPreviousMonthData(year, month, user.id), getCurrentMonthData(year, month, user.id) ])`.
   - Ensure the query safely handles un-setup months (like `/book/2026/12`) without returning null book errors, defaulting `setup_done = false` so the Month Setup Wizard launches cleanly per Rule L9.
   - Guarantee `created_at ASC` sorting on widgets.
5. **Fix 3 & Task 3 (Optimistic Placement UUID Lifecycle)**:
   - Update `createWidget` to accept the client-generated UUID directly as the row `id`. Because Postgres schema uses `id uuid primary key default gen_random_uuid()`, the client UUID becomes the permanent DB ID. This eliminates temporary ID swapping, avoiding 404 race conditions if the user immediately drags/resizes/deletes the widget.
6. **Fix 6 & Task 3 (No CSS `scale` Distortion)**:
   - Remove the proposal to preview resizing via CSS `scale`, which would stretch Kalam handwriting text and SVG stroke geometry (violating Rules L1, L4, L5, L7). Resizing must preview using discrete 22px grid steps (`liveW`/`liveH`) or bounding box preview.
7. **Fix 7 & Task 5 (No Dynamic Shadow Disabling)**:
   - Remove the proposal to dynamically disable background casing/ribbon shadows during page turns (which causes an abrupt visual pop/flicker). Instead, use permanent GPU layer promotion (`transform: translateZ(0)`, `transform-gpu`, `will-change: transform`).
8. **Fix 8 & Task 6 (Preserve Correction 7 Single-Tree Invariant)**:
   - Respect the locked Correction 7 invariant in `PROJECT_STATE.md:175`. Do not mount duplicate desktop and mobile trees in HTML (which causes duplicate `@dnd-kit` sensors and mobile hydration mismatch). Keep the single responsive tree gated by `matchMedia`, and optimize the desk container paint.
9. **Section 5 (Checklist Scoping)**:
   - Restrict Test Step 3 (Widget Placement from Drawer) and Test Step 4 (Widget Dragging & Resizing in Arrange Mode) to `Desktop (1440×900) Only`, explicitly noting that Mobile Drawer and Mobile Arrange mode are scheduled for Phase 6 (`PROJECT_STATE.md:368`). For Mobile (390×844), specify responsive read-only verification of placed widgets and single-page navigation.

AFTER UPDATING:
1. Verify `git status` shows ONLY `OPTIMISATION_PLAN.md` untracked/added (no source files modified).
2. Run `npm run build` to confirm production build succeeds with exit code 0.
3. Write your handoff report to `c:\Users\aruko\OneDrive\Desktop\Documents\track\.agents\teamwork\teamwork_worker_r2\handoff.md`.
4. Send a message to parent orchestrator.
