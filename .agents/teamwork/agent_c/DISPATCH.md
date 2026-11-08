## 2026-11-08T15:53:48Z

You are Agent C (Widgets and Store Specialist) for the "Memorable Moments" digital journal optimization.
Your working directory is: c:\Users\aruko\OneDrive\Desktop\Documents\track\.agents\teamwork\agent_c\
Your parent is orchestrator: d182f0bb-01fa-45ed-9815-336f98e5e38b

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MANDATORY: Read the authoritative request at:
c:\Users\aruko\OneDrive\Desktop\Documents\track\.agents\teamwork\ORIGINAL_REQUEST.md
Also read GEMINI.md (locked decisions L1 to L14), PROJECT_STATE.md, and OPTIMISATION_PLAN.md before starting work.

CRITICAL GIT REQUIREMENT:
- You must work on branch `optimise`.
- When all your work is complete, produce ONE clean git commit for your task: `git add <your files>` and commit with descriptive message.

STRICT FILE OWNERSHIP (You may ONLY edit or create these files — DO NOT touch any other files):
- `components/book/WidgetWrapper.tsx`
- `components/book/PlacementOverlay.tsx`
- Scatter plot widget file (`components/widgets/ScatterPlotWidget.tsx` or `components/widgets/scatter-plot/ScatterPlotWidget.tsx` — inspect file location)
- Bar chart widget file (`components/widgets/BarChartWidget.tsx` or `components/widgets/bar-chart/BarChartWidget.tsx` — inspect file location)
- `store/entriesVersion.ts`
- `lib/offlineSync.ts`
- `PLAN_C.md` (at project root)
- Files in your working directory `.agents/teamwork/agent_c/`

TASK REQUIREMENTS (Fix 5, Fix 6, Fix 9, Fix 11, Fix 12):
1. In `components/book/PlacementOverlay.tsx`:
   - Cache bounding rect on pointer enter or down in `PlacementOverlay` and STOP invoking `getBoundingClientRect()` in `pointer-move`.
2. Resize previews:
   - Resize previews in discrete 22px steps only, with NO CSS scale transforms.
3. In `components/book/WidgetWrapper.tsx`:
   - Wrap `WidgetWrapper` in `React.memo`, comparing `id`, `x`, `y`, `w`, `h`, arrange flag, and `config`.
   - Remove `@dnd-kit/utilities` import and use inline `translate3d` style (`transform ? \`translate3d(${transform.x}px, ${transform.y}px, 0)\` : undefined`).
4. In Scatter and Bar chart widgets (`ScatterPlotWidget.tsx`, `BarChartWidget.tsx`):
   - Move Scatter and Bar chart wobble and geometry into `useMemo`, ensuring deterministic jitter and identical drawings.
   - Hand-drawn aesthetic must remain identical without recalculating wobble on re-renders.
5. In `store/entriesVersion.ts` & `lib/offlineSync.ts`:
   - Partition entries version counter by widget ID and subscribe each consumer only to its own sources (so modifying one widget's entry does not cause all widgets to re-render; only that widget and subscribing charts update).
6. Write your plan to `PLAN_C.md` in the project root first, then build immediately. Do not stop for GO approvals unless something conflicts with L1-L14 or code no longer matches plan line numbers. Place any unrequested ideas under "Ideas (not built)".
7. Run `npm run build` to verify there are zero build/TypeScript errors.
8. Commit your changes to git on branch `optimise`.
9. Write your completion report to `c:\Users\aruko\OneDrive\Desktop\Documents\track\.agents\teamwork\agent_c\handoff.md`.
10. Send a message to orchestrator (`d182f0bb-01fa-45ed-9815-336f98e5e38b`) when finished!
