# Empirical Verification & Challenge Report: OPTIMISATION_PLAN.md

**Agent**: `teamwork_challenger_r1_1`  
**Parent / Caller**: `d7847ee1-8027-4cb5-b1ca-7aa7a2e95f75`  
**Date**: 2026-11-08T13:55:00Z  
**Verdict**: **CHALLENGE** (Corrections Required for 1 Critical Factual Hallucination / Contradiction and 1 Line Misalignment)

---

## Challenge Summary

**Overall risk assessment**: **MEDIUM-HIGH** (The optimization roadmap is overwhelmingly high quality and mathematically exact, but contains one critical internal contradiction/hallucination regarding `zustand` that would break the entire application if an implementation engineer acted on it, plus one misaligned line reference in `MobileBook.tsx`).

---

## Challenges

### [Critical] Challenge 1: Hallucinated Claim & Self-Contradiction Regarding `zustand` Usage (Finding O4 & Fix 12)

- **Assumption challenged**:
  In `OPTIMISATION_PLAN.md:35` (Finding O4) and `OPTIMISATION_PLAN.md:331` (Fix 12.2), the plan claims:
  > "`zustand: "^5.0.2"` is declared in `package.json:20` but has **0 imports or usages** across the entire project."
  > "2. Either wire up `zustand` to partition the entries version store (as in Fix 11), or remove it from `package.json` if kept purely in React state."

- **Attack scenario / Empirical Reality**:
  Empirical verification reveals that `zustand` is **actively imported and is the central reactivity backbone** of the application:
  1. `store/entriesVersion.ts:14`:
     ```typescript
     import { create } from 'zustand'

     interface EntriesVersionState {
       version: number
       bump: () => void
     }

     export const useEntriesVersionStore = create<EntriesVersionState>((set) => ({
       version: 0,
       bump: () => set((state) => ({ version: state.version + 1 })),
     }))
     ```
  2. `useEntriesVersionStore` is imported and used in **8 separate files**:
     - `store/entriesVersion.ts:21`
     - `lib/offlineSync.ts:15, 226`
     - `components/widgets/entryHelpers.ts:14, 114, 125, 132, 141`
     - `components/widgets/bar-chart/BarChartWidget.tsx:24, 90`
     - `components/widgets/donut/DonutWidget.tsx:23, 84`
     - `components/widgets/goal-bar/GoalBarWidget.tsx:24, 91`
     - `components/widgets/line-graph/LineGraphWidget.tsx:24, 98`
     - `components/widgets/scatter-plot/ScatterPlotWidget.tsx:24, 92`
  3. **Internal Self-Contradiction**:
     In `OPTIMISATION_PLAN.md:22` (Finding R1), the author *explicitly cited* this exact store:
     > "`store/entriesVersion.ts:21-24` ... Furthermore, `useEntriesVersionStore` is an unpartitioned global counter (`version: 0`); saving an entry in one widget bumps `version` and causes all chart widgets across both pages to re-render."
     Yet in Finding O4 (line 35) and Fix 12 (line 331), the author stated `zustand` has 0 usages and recommended considering removing it.

- **Blast radius**:
  If a builder acts on Fix 12 item 2 ("remove it from package.json"), compilation will immediately fail or charts will stop re-rendering upon entry saves, breaking Phase 5 reactive charts.

- **Mitigation**:
  Correct Finding O4 and Fix 12 in `OPTIMISATION_PLAN.md`: Clarify that `zustand` IS actively used by `useEntriesVersionStore` across all 5 chart widgets and entry helpers. Retain `zustand` as approved by Rule L3 and focus Fix 12 solely on removing the phantom `@dnd-kit/utilities` import in `WidgetWrapper.tsx:20`.

---

### [Low] Challenge 2: Misaligned Code Location Reference for Mobile Page Navigation (Finding D2)

- **Assumption challenged**:
  In `OPTIMISATION_PLAN.md:17` (Finding D2), the plan cites `components/book/MobileBook.tsx:320-335` as evidence for the absence of adjacent month prefetching.

- **Attack scenario / Empirical Reality**:
  Inspecting `components/book/MobileBook.tsx:320-335`:
  ```typescript
  320: if (!def) {
  321:   return (
  322:     <div className="flex-1 flex items-center justify-center font-hand text-xs text-ink/70">
  323:       Unknown widget
  324:     </div>
  325:   )
  326: }
  327: const MobileComp = def.mobileComponent || def.component
  328: return (
  329:   <div className="flex-1 flex flex-col overflow-hidden">
  330:     <MobileComp ... />
  331:   </div>
  332: )
  ```
  This is the widget renderer inside the mobile page container, NOT the month navigation or page turn handler.
  The actual month navigation mechanisms in `MobileBook.tsx` are:
  - `MobileBook.tsx:131-155`: `handleTurnBack` and `handleTurnNext` which invoke `onTurnMonth(..., 'backward'/'forward')`
  - `MobileBook.tsx:362-369`: The bottom-left "back" `<button>`
  - `MobileBook.tsx:377-399`: The bottom-right folded corner `<button>`
  - `MobileBook.tsx:408-434`: The right-edge month index tabs `<nav>`

- **Blast radius**:
  Low developer confusion during implementation of Task 2.

- **Mitigation**:
  Update the citation in Finding D2 from `components/book/MobileBook.tsx:320-335` to `components/book/MobileBook.tsx:131-155, 362-434`.

---

## 5-Component Verification Report

### 1. Observation

Direct empirical verification of all 11 required citations and measurements was performed:

| Target Item | Cited in Plan | Empirical Observation | Status |
|---|---|---|---|
| **Sequential Queries** | `app/book/[year]/[month]/page.tsx:46-129` | Lines 46-129 contain sequential queries: `auth.getUser()`, `getPreviousMonthData()`, `books.select('id')`, `months.select(...)`, `widgets.select('*')`, and prompt checks. | **VERIFIED ACCURATE** |
| **Duplicate Auth & Book Query** | `components/setup/setupActions.ts:42-85` | Lines 42-85 contain second `auth.getUser()`, previous year `books.select('id')`, `months.select(...)`, and `widgets.select(...)`. | **VERIFIED ACCURATE** |
| **Entry Waterfall** | `components/widgets/entryHelpers.ts:37-97` | Lines 37-97 define `getWidgetEntriesWithCache` which executes client-side `getWidgetEntries(widgetId)` on mount. | **VERIFIED ACCURATE** |
| **Blocking createWidget** | `components/book/OpenBook.tsx:200-230` | Lines 200-230 define `handlePlaceWidget`: `await createWidget(...)` runs before `setWidgets(...)`, `setIsDrawerOpen(false)`, and `setIsArrangeMode(true)`. | **VERIFIED ACCURATE** |
| **getBoundingClientRect on Move** | `components/widgets/PlacementOverlay.tsx:82` | Line 82 is verbatim: `const rect = e.currentTarget.getBoundingClientRect()` inside `handlePointerMove`. | **VERIFIED ACCURATE** |
| **pageFlip RotateY Only** | `app/globals.css:26-42` | Lines 26-42 define `@keyframes pageFlipForward` and `@keyframes pageFlipBackward` exclusively mutating `transform: rotateY(...)`. | **VERIFIED ACCURATE** |
| **Missing will-change** | `app/globals.css:104-126` | Lines 104-126 define `.animate-page-flip-*` and shadow classes; none contain `will-change`. | **VERIFIED ACCURATE** |
| **Font Weights & Swap** | `app/layout.tsx:6-18` | Lines 6-11 define `Kalam` (`display: 'swap'`); lines 13-18 define `Cormorant_Garamond` with 5 weights (`300, 400, 500, 600, 700`). | **VERIFIED ACCURATE** |
| **Cover-Only Cormorant** | `components/book/ClosedBook.tsx:224-388` | Grep across repo confirms `font-cover` is only used in `ClosedBook.tsx:224-388`. | **VERIFIED ACCURATE** |
| **SW Dynamic & Static Rules** | `app/sw.ts:32-57` | Lines 32-45: `/book/` dynamic routes use `NetworkFirst` with `networkTimeoutSeconds: 3`. Lines 48-57: static chunks use `StaleWhileRevalidate`. | **VERIFIED ACCURATE** |
| **SW Minification** | `scripts/build-sw.js:27` | Line 27 is verbatim: `minimize: false,`. | **VERIFIED ACCURATE** |
| **SW Bundle Size** | `public/sw.js` (claimed: 149,451 bytes) | File size command `(Get-Item public/sw.js).Length` returned **149451** bytes exactly. | **VERIFIED EXACT** |
| **Missing Index on widgets** | `supabase/migrations/0001_initial_schema.sql:91-103` | `widgets` table (lines 91-103) has primary key on `id`, but zero secondary index on `month_id`. Foreign key does not auto-index. | **VERIFIED ACCURATE** |
| **Rule L3 & Phantom Dependency** | `package.json:11-21`<br>`WidgetWrapper.tsx:20` | `package.json:11-21` lists allowed packages. `WidgetWrapper.tsx:20` imports `CSS` from undeclared `@dnd-kit/utilities`. | **VERIFIED ACCURATE** |
| **Zustand 0 Usages Claim** | `OPTIMISATION_PLAN.md:35, 331` | `store/entriesVersion.ts:14` imports `create` from `zustand`; used in 8 files. | **FACTUALLY FALSE (CHALLENGED)** |
| **MobileBook Prefetch Citation** | `components/book/MobileBook.tsx:320-335` | Lines 320-335 render `MobileComp`; turning logic is at lines 131-155, 362-434. | **MISALIGNED (CHALLENGED)** |
| **Inline SVGs Count** | Components & App (claimed: 58) | PowerShell search `(Get-ChildItem -Path components,app -Recurse -Filter *.tsx \| Select-String '<svg').Count` returned **58** exactly. | **VERIFIED EXACT** |
| **Build & Bundle Analysis** | Production Build (`npm run build`) | `npm run build` completed successfully. Main client chunk is `3dtwbakvaf6mg.js` with size **520,562 bytes** (claimed: 520,562 bytes / 520.6 KB). | **VERIFIED EXACT** |
| **SSR 2-Pass Gate** | `components/book/OpenBook.tsx:107, 589-596` | Lines 589-596 return empty `<div className="w-full min-h-screen bg-desk flex items-center justify-center" />` when `isDesktop === null`. | **VERIFIED ACCURATE** |
| **ScatterPlot Wobble Calculations** | `ScatterPlotWidget.tsx:213-232`<br>`chartUtils.ts:84-102` | `wobbleCircle` runs inline inside JSX `.map` at line 220, executing 26 jitter trig calculations per point. | **VERIFIED ACCURATE** |

### 2. Logic Chain

1. **Step 1 (Empirical Code Inspection)**: We viewed every file and exact line range cited in `OPTIMISATION_PLAN.md` using native file viewing tools.
2. **Step 2 (Cross-Reference Discrepancy)**: We compared Finding O4 ("zustand has 0 imports or usages") against a repository-wide grep for `zustand`. This uncovered `store/entriesVersion.ts` importing `create` from `zustand` and exporting `useEntriesVersionStore`.
3. **Step 3 (Impact Assessment)**: We analyzed all references to `useEntriesVersionStore` and found 8 files subscribing to it for reactive chart invalidation. Removing `zustand` would cause runtime errors and break core features.
4. **Step 4 (Line Number Verification)**: We reviewed `MobileBook.tsx` lines 320-335 and identified that it references child widget mounting rather than the page turn buttons (`handleTurnBack`/`handleTurnNext` at lines 131-155 and buttons at lines 362-434).
5. **Step 5 (Build Verification)**: We ran `npm run build` and inspected the `.next/static/chunks` output. The build confirmed `3dtwbakvaf6mg.js` is 520,562 bytes, matching the plan's exact measurement.

### 3. Caveats

- Supabase project latency (~260 ms RTT to Tokyo) was confirmed via the project URL in `.env.local` and Tokyo region ID, but physical ping depends on the client's ISP routing.
- The 12-fix prioritization structure in `OPTIMISATION_PLAN.md` is sound and directly addresses the identified bottlenecks.

### 4. Conclusion

`OPTIMISATION_PLAN.md` is an exceptionally thorough, highly accurate performance audit with impressive empirical precision (520,562 byte chunk, 149,451 byte service worker, exactly 58 inline SVGs).
However, it cannot be approved as-is without issuing a **CHALLENGE** to correct two specific items:
1. **Fix Finding O4 and Fix 12 regarding `zustand`**: Retract the false claim that `zustand` has 0 usages; clarify that `zustand` is actively used in `store/entriesVersion.ts` across all charts; do NOT remove `zustand` from `package.json`.
2. **Update the citation in Finding D2**: Change `components/book/MobileBook.tsx:320-335` to `components/book/MobileBook.tsx:131-155, 362-434`.

Once these two corrections are made to `OPTIMISATION_PLAN.md`, the document is fully approved for implementation.

### 5. Verification Method

To independently verify these findings:
1. **Check Zustand usage**:
   ```powershell
   Get-ChildItem -Path store,components,lib -Recurse -Filter *.ts* | Select-String 'useEntriesVersionStore|zustand'
   ```
   *Expected*: Shows imports in `store/entriesVersion.ts`, `lib/offlineSync.ts`, `components/widgets/entryHelpers.ts`, and all 5 chart widgets.
2. **Check MobileBook navigation lines**:
   Inspect `components/book/MobileBook.tsx` lines 131-155 and lines 360-435.
3. **Check build chunk sizes**:
   ```powershell
   npm run build
   (Get-Item .next/static/chunks/3dtwbakvaf6mg.js).Length
   ```
   *Expected*: Returns `520562`.
4. **Check service worker size**:
   ```powershell
   (Get-Item public/sw.js).Length
   ```
   *Expected*: Returns `149451`.
