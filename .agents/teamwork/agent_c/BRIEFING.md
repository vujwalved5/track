# BRIEFING — 2026-11-08T15:55:00Z

## Mission
Implement Agent C optimizations (Fix 5, 6, 9, 11, 12): PlacementOverlay rect caching & discrete 22px resize, WidgetWrapper React.memo & translate3d, Scatter & Bar chart geometry/wobble useMemo, and partitioned entriesVersion store.

## 🔒 My Identity
- Archetype: Agent C (Widgets and Store Specialist)
- Roles: implementer, qa, specialist
- Working directory: c:\Users\aruko\OneDrive\Desktop\Documents\track\.agents\teamwork\agent_c\
- Original parent: d182f0bb-01fa-45ed-9815-336f98e5e38b
- Milestone: Phase 2 (Agent C)

## 🔒 Key Constraints
- Must work on branch `optimise`
- One clean git commit upon completion
- STRICT FILE OWNERSHIP (only edit/create allowed files):
  - `components/book/WidgetWrapper.tsx`
  - `components/book/PlacementOverlay.tsx`
  - Scatter plot widget file (`components/widgets/ScatterPlotWidget.tsx` or `components/widgets/scatter-plot/ScatterPlotWidget.tsx`)
  - Bar chart widget file (`components/widgets/BarChartWidget.tsx` or `components/widgets/bar-chart/BarChartWidget.tsx`)
  - `store/entriesVersion.ts`
  - `lib/offlineSync.ts`
  - `PLAN_C.md` (at project root)
  - Files in `.agents/teamwork/agent_c/`
- Locked Decisions L1 to L14:
  - L1 Book, not website
  - L2 Next.js App Router + TypeScript + Tailwind + Supabase
  - L3 Allowed packages ONLY: zod, zustand, @dnd-kit/core, serwist. No other packages.
  - L4 Charts are custom hand-drawn-look SVG. No chart library.
  - L5 Fonts: Kalam, Cormorant Garamond.
  - L6 Palette only: desk #211b16, paper #f4eddc, ink #1c2433, red pen #b3261e, highlighter #ffd84a, oxblood #702028, gold #d8b45a, kraft #b9895a, orange #ff5a1f.
  - L7 Paper: dotted, squared, lined, blank. 22px grid, 1.4px dots.
  - L8 Desktop >=768px two-page spread; mobile one page; same data.
  - L9 Every month starts with Month Setup wizard.
  - L10 Widgets snap to 22px grid.
  - L11 Login required, RLS.
  - L12 Custom CSS 3D page turn.
  - L13 No emoji. Hand-drawn SVG icons.
  - L14 No extra features, redesigns, renames, or dependencies unless asked.
- DO NOT CHEAT: All implementations genuine, real state, real behavior.

## Current Parent
- Conversation ID: d182f0bb-01fa-45ed-9815-336f98e5e38b
- Updated: 2026-11-08T15:53:48Z

## Task Summary
- **What to build**:
  1. Cache bounding rect on pointer enter/down in `PlacementOverlay` (stop calling `getBoundingClientRect()` on pointer move).
  2. Resize previews in discrete 22px steps only, with NO CSS scale transforms.
  3. `WidgetWrapper`: Wrap in `React.memo` (custom comparison on `id`, `x`, `y`, `w`, `h`, arrange flag, `config`). Remove `@dnd-kit/utilities`, use inline `translate3d`.
  4. Scatter & Bar charts: Move wobble and geometry into `useMemo`, ensuring deterministic jitter and identical drawings.
  5. Partition entriesVersion counter by widget ID in `store/entriesVersion.ts` and update `lib/offlineSync.ts` / subscribers.
- **Success criteria**:
  - `npm run build` succeeds cleanly with 0 errors.
  - One clean git commit on `optimise`.
  - Comprehensive handoff.md in `.agents/teamwork/agent_c/`.
  - Notification sent to orchestrator.

## Key Decisions Made
- [TBD]

## Artifact Index
- `PLAN_C.md` — Project root plan
- `.agents/teamwork/agent_c/DISPATCH.md` — Dispatch log
- `.agents/teamwork/agent_c/BRIEFING.md` — Agent briefing
- `.agents/teamwork/agent_c/progress.md` — Progress tracking
- `.agents/teamwork/agent_c/handoff.md` — Final handoff report

## Change Tracker
- **Files modified**: None yet
- **Build status**: Untested
- **Pending issues**: None

## Quality Status
- **Build/test result**: Untested
- **Lint status**: 0
- **Tests added/modified**: 0

## Loaded Skills
- None
