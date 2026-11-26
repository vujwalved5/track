# F4 Chart Re-render Fix — Report

**Branch**: `perf/f4-chart-rerenders` (branched from `perf/overnight-2026-11-25`, not pushed)

## Changes Applied
- Wrapped `LineGraphDesktop` ([LineGraphWidget.tsx](components/widgets/line-graph/LineGraphWidget.tsx)), `DonutDesktop` ([DonutWidget.tsx](components/widgets/donut/DonutWidget.tsx)), `GoalBarDesktop` ([GoalBarWidget.tsx](components/widgets/goal-bar/GoalBarWidget.tsx)), and `Paper` ([Paper.tsx](components/paper/Paper.tsx)) in `React.memo`.
- Switched `LineGraphDesktop`, `DonutDesktop`, and `GoalBarDesktop` store subscriptions from `s.version` to `sourceWidgetId ? s.versions[sourceWidgetId] ?? 0 : 0`.
- Stabilised `otherWidgets` (memoised `Map<string, WidgetData[]>` + `EMPTY_WIDGETS` fallback) and `setupConfig` (`EMPTY_SETUP_CONFIG` fallback) in [PageWidgetLayer.tsx](components/widgets/PageWidgetLayer.tsx).
- Left the other 9 widgets unmemoised.

## Before vs. After (Production Build, Headless Chrome, Read-Only Account)

### 1. Render Counts (Desktop `1440×900`, `/book/2026/11`)
| Scenario | Component | Before | After |
| --- | --- | --- | --- |
| Page turn (`/book/2026/11` → `/book/2026/10`) | `LineGraphDesktop` | 2 | 1 |
| Page turn (`/book/2026/11` → `/book/2026/10`) | `GoalBarDesktop` | 2 | 1 |
| Page turn (`/book/2026/11` → `/book/2026/10`) | `Paper` | 8 | 8 |
| Unrelated `bump('unrelated-widget-id-999')` | `LineGraphDesktop` / `GoalBarDesktop` / `DonutDesktop` | 0 / 0 / 0 | 0 / 0 / 0 |
| Global `bump()` | `LineGraphDesktop` / `GoalBarDesktop` | 2 / 2 | 0 / 0 |
| Related source `bump('4e1b7d45-82ae-4772-b29c-f82a8344cba0')` | `LineGraphDesktop` / `GoalBarDesktop` | 0 / 0 (broken) | 2 / 2 (live update) |

### 2. Mobile Page-Turn Performance (`390×844`, `4×` CPU Throttling)
| Metric | Before | After |
| --- | --- | --- |
| Frames captured | 91 | 92 |
| Avg / p95 / Max frame time | 16.7 ms / 16.8 ms / 16.8 ms | 16.7 ms / 16.7 ms / 16.8 ms |
| Frames > 16.7 ms | 5 | 3 |
| Frames > 50 ms | 0 | 0 |
| Long tasks > 50 ms | 0 (`[]`) | 0 (`[]`) |

### 3. Checks & Bundle
- `npm run lint` (`tsc --noEmit`): pass (0 errors).
- `npm run build` (`node scripts/build-sw.js && next build`): pass.
- `rootMainFiles` for `/book/[year]/[month]` (`build-manifest.json`): `443,317 B` raw (`131,772 B` gz) before and after (`0 B` delta).
- Temporary render counters and `%TEMP%` verification script/profile removed; `rg` confirmed zero counter code remains.
