# Overnight Performance Report — Memorable Moments

- **Branch**: `perf/overnight-2026-11-25`
- **Base commit**: `0eef2ab7` (`main` untouched; nothing pushed)
- **Final commit (code)**: `d2f05f16` (T3)
- **Scope note**: User instruction update: `"finish till task 3 and report"` (T1–T3 completed and verified; T4 skipped)
- **Final build / typecheck / lint (T3 state `d2f05f16`)**:
  - `npx tsc --noEmit`: exit code `0` (0 errors)
  - `npm run lint` (`tsc --noEmit`): exit code `0` (0 errors)
  - `npm run build` (`node scripts/build-sw.js && next build`, Next.js 16.4.5 Turbopack): exit code `0` (`sw.js` = `36,904 B`)

---

## Final Bundle Size Summary

Measured from production `.next/server/app/<route>/page/build-manifest.json` (`polyfillFiles` + `rootMainFiles`) and `.next/server/app/<route>/page_client-reference-manifest.js` (`clientModules` + `entryJSFiles`), gzipped via Node `zlib.gzipSync`:
- **Shared `rootMainFiles` + `polyfillFiles` (7 files)**:
  - Before: `555,911 B` (`542.9 KB`) raw / `171,521 B` (`167.5 KB`) gz
  - After: `555,911 B` (`542.9 KB`) raw / `171,399 B` (`167.4 KB`) gz (`0 B` raw / `-122 B` gz)

| route | JS before | JS after | change |
|---|---|---|---|
| `/login` (route-specific) | `596,096 B` (`582.1 KB`) raw / `156,007 B` (`152.4 KB`) gz (6 chunks) | `298,451 B` (`291.5 KB`) raw / `80,144 B` (`78.3 KB`) gz (3 chunks) | `-297,645 B` (`-290.7 KB`, `-49.9%`) raw / `-75,863 B` (`-74.1 KB`, `-48.6%`) gz (`-3` chunks) |
| `/login` (total initial) | `1,152,007 B` (`1,125.0 KB`) raw / `327,528 B` (`319.9 KB`) gz (13 chunks) | `854,362 B` (`834.3 KB`) raw / `251,543 B` (`245.6 KB`) gz (10 chunks) | `-297,645 B` (`-290.7 KB`, `-25.8%`) raw / `-75,985 B` (`-74.2 KB`, `-23.2%`) gz (`-3` chunks) |
| `/home` (route-specific) | `329,017 B` (`321.3 KB`) raw / `88,581 B` (`86.5 KB`) gz (4 chunks) | `328,452 B` (`320.8 KB`) raw / `88,275 B` (`86.2 KB`) gz (3 chunks) | `-565 B` (`-0.6 KB`, `-0.2%`) raw / `-306 B` (`-0.3 KB`, `-0.3%`) gz (`-1` chunk) |
| `/home` (total initial) | `884,928 B` (`864.2 KB`) raw / `260,102 B` (`254.0 KB`) gz (11 chunks) | `884,363 B` (`863.6 KB`) raw / `259,674 B` (`253.6 KB`) gz (10 chunks) | `-565 B` (`-0.6 KB`, `-0.1%`) raw / `-428 B` (`-0.4 KB`, `-0.2%`) gz (`-1` chunk) |
| `/book/[year]/[month]` (route-specific) | `615,622 B` (`601.2 KB`) raw / `160,138 B` (`156.4 KB`) gz (7 chunks) | `533,708 B` (`521.2 KB`) raw / `138,205 B` (`135.0 KB`) gz (5 chunks) | `-81,914 B` (`-80.0 KB`, `-13.3%`) raw / `-21,933 B` (`-21.4 KB`, `-13.7%`) gz (`-2` chunks) |
| `/book/[year]/[month]` (total initial) | `1,171,533 B` (`1,144.1 KB`) raw / `331,659 B` (`323.9 KB`) gz (14 chunks) | `1,089,619 B` (`1,064.1 KB`) raw / `309,604 B` (`302.3 KB`) gz (12 chunks) | `-81,914 B` (`-80.0 KB`, `-7.0%`) raw / `-22,055 B` (`-21.5 KB`, `-6.6%`) gz (`-2` chunks) |

### Top 5 Largest Chunks in `.next/static/chunks/`

- **Before** (24 JS files total):
  1. `3batmfs7cfp0_.js` — `265,095 B` (`258.9 KB`) raw / `69,845 B` (`68.2 KB`) gz
  2. `2u3wlrixsna5x.js` — `229,048 B` (`223.7 KB`) raw / `71,686 B` (`70.0 KB`) gz
  3. `3e74daruhfslf.js` — `153,929 B` (`150.3 KB`) raw / `34,941 B` (`34.1 KB`) gz
  4. `2-ghsjoyw8und.js` — `137,159 B` (`133.9 KB`) raw / `36,772 B` (`35.9 KB`) gz
  5. `0cz1d0mv5g_q7.js` — `112,594 B` (`110.0 KB`) raw / `39,627 B` (`38.7 KB`) gz
- **After** (21 JS files total, `-3` chunks):
  1. `3batmfs7cfp0_.js` — `265,095 B` (`258.9 KB`) raw / `69,845 B` (`68.2 KB`) gz (unchanged)
  2. `2u3wlrixsna5x.js` — `229,048 B` (`223.7 KB`) raw / `71,686 B` (`70.0 KB`) gz (unchanged)
  3. `40ohfs9sg2ivp.js` — `153,441 B` (`149.8 KB`) raw / `34,249 B` (`33.4 KB`) gz (down `-488 B` raw / `-692 B` gz vs `3e74daruhfslf.js`)
  4. `1dm5v-i2bhyil.js` — `131,802 B` (`128.7 KB`) raw / `35,643 B` (`34.8 KB`) gz (down `-5,357 B` raw / `-1,129 B` gz vs `2-ghsjoyw8und.js`)
  5. `0cz1d0mv5g_q7.js` — `112,594 B` (`110.0 KB`) raw / `39,627 B` (`38.7 KB`) gz (unchanged)

---

## Task Table

| Task | Status | Commit | Before | After | Verification |
|---|---|---|---|---|---|
| **T1** — Break barrel-export leaks (`@/components/book`, `@/components/widgets`, `@/components/desk`, `@/components/setup`) | `done` | `5f668023` | `/login` `1,125.0 KB` raw (`319.9 KB` gz) incl. `OpenBook`, `MobileBook`, widgets, `@dnd-kit`; `/book` `1,144.1 KB` raw (`323.9 KB` gz) incl. `ClosedBookDesk` | `/login` `834.3 KB` raw (`245.6 KB` gz, `-290.7 KB` / `-74.2 KB` gz); `/home` `863.6 KB` raw (`253.6 KB` gz); `/book` `1,064.3 KB` raw (`302.4 KB` gz, `-79.8 KB` / `-21.5 KB` gz) | `PASS` — `tsc`, `lint`, `build` exit 0; `/login` chunks exclude book/widgets/`@dnd-kit`; `/book` excludes `ClosedBookDesk`; read-only headless Chrome check 0 console/network errors; Auditor CLEAN, Reviewer APPROVE |
| **T2** — Remove `LineGraphDesktop` `/rest/v1/widgets` query & gate `getPreviousMonthData()` on `!setup_done` | `done` | `d8b42ad9` | `/book/2026/11` fires client `GET /rest/v1/widgets?select=config%2Ctype&id=...` on mount/turn; `BookMonthPage` calls `getPreviousMonthData()` unconditionally even when `setup_done = true`; `/book` `1,064.3 KB` raw (`302.4 KB` gz) | `0` client `/rest/v1/widgets` requests on mount & page turns; `BookMonthPage` skips `getPreviousMonthData()` when `setup_done = true`; `/book` `1,064.2 KB` raw (`302.4 KB` gz, `-79 B` / `-60 B` gz) | `PASS` — `tsc`, `lint`, `build` exit 0; `0` `/rest/v1/widgets` requests; `LineGraph` source unit `"hrs"` preserved; `/book/2026/12` (`setup_done = false`) wizard prefill preserved with 0 DB writes; 0 console/network errors; Auditor CLEAN, Reviewer APPROVE |
| **T3** — Move `setInitialEntries` out of `OpenBook` render & localize placement hover to `PlacementOverlay` | `done` | `d2f05f16` | `OpenBook` invokes `setInitialEntries` synchronously in render and holds `activePlacement` hover state; `/book` `1,064.2 KB` raw (`302.4 KB` gz) | `setInitialEntries` runs once on mount/month change in `useEffect`; hover cursor state localized inside `PlacementOverlay`; `/book` `1,064.1 KB` raw (`302.3 KB` gz, `-165 B` / `-6 B` gz) | `PASS` — `tsc`, `lint`, `build` exit 0; entries reload cleanly across page turns; `LineGraph` unit `"hrs"` preserved; `PlacementOverlay` pointer hover/leave, keyboard placement, and `Escape` verified with 0 console/network/DB-write errors; Auditor CLEAN, Reviewer APPROVE |
| **T4** — Chart `entriesVersion` selectors (`s.versions[sourceWidgetId]`), `React.memo` on charts + `Paper`, and prop stabilization | `skipped` | `none` | `LineGraphDesktop`, `DonutDesktop`, `GoalBarDesktop` subscribe to `s.version` without `React.memo`; `Paper` unmemoized | `N/A (skipped)` | Skipped per user instruction update: `"finish till task 3 and report"` |

---

## Skipped / Failed Details

- **T4 (`skipped`)**: Not executed per the follow-up user instruction `"finish till task 3 and report"`. No tasks failed during the run.

---

## Needs owner decision

1. **Scheduling T4 and remaining audit items (P5–P12)**: T4 was skipped per `"finish till task 3 and report"`, and P5–P12 from `Performance audit findings` were outside the T1–T4 scope. Decide whether to schedule T4 and P5–P12 in a follow-up pass.
2. **Pre-existing uncommitted edits in `PROJECT_STATE.md`**: Before this run started, `PROJECT_STATE.md` already had two uncommitted sections in the working tree: `Performance audit findings` and `Live Deployment Verification — Screen Recording Flow (Task 18)` (the latter includes a plaintext test credential). Both pre-existing edits were intentionally left unstaged and **not committed** on `perf/overnight-2026-11-25` (so only `"## Overnight performance run"` is committed, honoring R3 and keeping passwords out of committed history). Decide whether to redact the credential in the `Task 18` note and commit or discard those pre-existing `PROJECT_STATE.md` edits.
3. **`OpenBook` turning-leaf `PageWidgetLayer` props (Audit P5)**: During the 600ms 3D page turn, `OpenBook.tsx` renders turning-leaf `<PageWidgetLayer>` instances without `year`, `month`, or `setupConfig` props (note: `widgets` is now passed after T2 so `LineGraphDesktop` resolves `sourceWidget` locally without `/rest/v1/widgets`). Decide whether to align those turning-leaf props or refactor turning-leaf rendering under P5.

---

## Ideas (not built)

- **T4 (deferred)**: Update `LineGraphDesktop`, `DonutDesktop`, and `GoalBarDesktop` to subscribe to `s.versions[sourceWidgetId]` instead of `s.version`, and wrap them plus `Paper` in `React.memo` (along with stabilizing `otherWidgets`/callbacks in `PageWidgetLayer`).
- **P5**: Avoid unmounting the static spread and remounting 4 `<Paper>` + 2 `<PageWidgetLayer>` trees during the 600ms 3D page turn in `OpenBook.tsx`.
- **P6**: Dynamically split `@dnd-kit/core` and the full widget registry (`registry.ts`) so read-only `/book/[year]/[month]` (`!isArrangeMode`) and `MobileBook` do not load arrange-mode code upfront.
- **P7**: Trim redundant `supabase.auth.getUser()` network hops in `proxy.ts` / `app/login/page.tsx` and sequential `select('*')` queries in `setupActions.ts` / `widgetActions.ts`.
- **P8**: Add a single-flight lock + batched upsert to `drainOfflineQueue` (`lib/offlineSync.ts`), defer `mm_queue` serialization until debounce fires (`components/widgets/entryHelpers.ts`), and skip `onBlur` writes when text/checklist values are unchanged.
- **P9**: Flatten or optimize the 3-table RLS chain (`entries -> widgets -> months -> books`), drop duplicate single-column FK indexes, and reconcile `supabase_migrations` history.
- **P10**: Replace the render-blocking `@import` for `Instrument Serif` in `app/(public)/layout.tsx` (`0.0337` CLS on `/`), remove unused `Kalam` 300 and `Nothing_You_Could_Do`, deduplicate `Cormorant_Garamond`, and align `app/sw.ts` precache route (`/` vs `/login`).
- **P11 & P12**: Simplify `.desk-surface` `<feTurbulence>` / `Paper` CSS layers, add `app/login/loading.tsx`, and eliminate the two-pass `isDesktop === null` / `isMobile === null` hydration flash on `/home` and `/book`.

---

## Review & Undo Commands

- **Review commits and diff**:
  ```bash
  git log --oneline
  git diff main --stat
  ```
  *(For committed branch changes only, excluding pre-existing unstaged edits in `PROJECT_STATE.md`: `git diff main..HEAD --stat`.)*

- **Full undo (return to `main` and remove branch)**:
  ```bash
  git switch main
  git branch -D perf/overnight-2026-11-25
  ```
  *(Note: if pre-existing uncommitted edits remain in `PROJECT_STATE.md` in the working tree, `git stash push -- PROJECT_STATE.md` before `git switch main` or `git switch -m main`.)*
