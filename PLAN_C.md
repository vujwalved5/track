# PLAN_C.md — Agent C (Widgets and Store Specialist)

## Restatement of Task
1. Cache bounding client rect on pointer enter / down in `PlacementOverlay.tsx` and eliminate layout-thrashing calls to `getBoundingClientRect()` on `pointer-move`.
2. Ensure widget resizing in `WidgetWrapper.tsx` strictly uses discrete 22px grid steps (`GRID_PX = 22`) with zero CSS `scale` transforms.
3. Wrap `WidgetWrapper` in `React.memo` with a custom comparison function checking `id`, `x`, `y`, `w`, `h`, `isArrangeMode`, and `config`.
4. Remove the undeclared phantom `@dnd-kit/utilities` import in `WidgetWrapper.tsx` and replace it with inline `translate3d` style.
5. In `ScatterPlotWidget.tsx`, move dot coordinate geometry and `wobbleCircle` path generation into `useMemo` for deterministic jitter without recomputation on re-renders, and wrap `ScatterPlotDesktop` in `React.memo`.
6. In `BarChartWidget.tsx`, move daily bar coordinate geometry, heights, widths, and sparse label coordinates into `useMemo`, and wrap `BarChartDesktop` in `React.memo`.
7. In `store/entriesVersion.ts`, partition the store by `widgetId` (`versions: Record<string, number>`) so that modifying a widget's entry bumps only its own version.
8. In `lib/offlineSync.ts`, wire mutated widget IDs to `entriesVersionStore` on local cache updates and queue drains, and update chart consumers (`BarChartWidget.tsx`, `ScatterPlotWidget.tsx`) to subscribe only to their configured source widget IDs.

## Files to Edit or Create
- `PLAN_C.md` (this file)
- `components/widgets/PlacementOverlay.tsx`
- `components/widgets/WidgetWrapper.tsx`
- `components/widgets/scatter-plot/ScatterPlotWidget.tsx`
- `components/widgets/bar-chart/BarChartWidget.tsx`
- `store/entriesVersion.ts`
- `lib/offlineSync.ts`
- `.agents/teamwork/agent_c/progress.md`
- `.agents/teamwork/agent_c/handoff.md`
- `.agents/teamwork/agent_c/BRIEFING.md`

## Uncertainties / Clarifications
- None. Requirements align with OPTIMISATION_PLAN.md Fix 5, Fix 6, Fix 9, Fix 11, Fix 12 and Locked Decisions L1 to L14.

## Ideas (Not Built)
1. Web Worker for trigonometric jitter pre-computation: Not needed since `useMemo` with deterministic seeding computes in < 1 ms and retains reference identity across renders.
2. SVG path caching in indexedDB: Prohibited by L3/L14; React memory memoization is faster and lighter.
