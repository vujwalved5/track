# Overnight Performance Tasks (Branch: `perf/overnight-2026-11-25`)

Base commit: `0eef2ab7` (branched off `main`; `main` untouched)

## Baseline Measurements

### Build, Typecheck, and Lint
- `npm run build` (`node scripts/build-sw.js && next build`, Next.js 16.4.5 Turbopack): exit code `0` (`sw.js` = `36,904 B`)
- `npx tsc --noEmit`: exit code `0` (0 errors, 0 warnings)
- `npm run lint` (`tsc --noEmit`): exit code `0` (0 errors, 0 warnings)

### Per-Route Client JS (Production `.next` Manifests)
Measured from `.next/server/app/<route>/page/build-manifest.json` (`polyfillFiles` + `rootMainFiles`) and `.next/server/app/<route>/page_client-reference-manifest.js` (`clientModules` + `entryJSFiles`), normalized against `.next/`, gzipped via Node `zlib.gzipSync(buf)`:
- Shared `rootMainFiles` + `polyfillFiles` (7 files): `555,911 B` (`542.9 KB`) raw / `171,521 B` (`167.5 KB`) gz

| Route | Route-specific JS (raw) | Route-specific JS (gzip) | Total initial JS (raw) | Total initial JS (gzip) | Chunks (route-specific / total) |
|---|---|---|---|---|---|
| `/login` | `596,096 B` (`582.1 KB`) | `156,007 B` (`152.4 KB`) | `1,152,007 B` (`1,125.0 KB`) | `327,528 B` (`319.9 KB`) | 6 / 13 |
| `/home` | `329,017 B` (`321.3 KB`) | `88,581 B` (`86.5 KB`) | `884,928 B` (`864.2 KB`) | `260,102 B` (`254.0 KB`) | 4 / 11 |
| `/book/[year]/[month]` | `615,622 B` (`601.2 KB`) | `160,138 B` (`156.4 KB`) | `1,171,533 B` (`1,144.1 KB`) | `331,659 B` (`323.9 KB`) | 7 / 14 |

### Top 5 Largest JS Chunks in `.next/static/chunks/` (24 JS files total)
1. `3batmfs7cfp0_.js` — `265,095 B` (`258.9 KB`) raw / `69,845 B` (`68.2 KB`) gz
2. `2u3wlrixsna5x.js` — `229,048 B` (`223.7 KB`) raw / `71,686 B` (`70.0 KB`) gz
3. `3e74daruhfslf.js` — `153,929 B` (`150.3 KB`) raw / `34,941 B` (`34.1 KB`) gz
4. `2-ghsjoyw8und.js` — `137,159 B` (`133.9 KB`) raw / `36,772 B` (`35.9 KB`) gz
5. `0cz1d0mv5g_q7.js` — `112,594 B` (`110.0 KB`) raw / `39,627 B` (`38.7 KB`) gz

### Headless Chrome Read-Only Baseline (`npm run start`)
- Test account: `newuser@gmail.com` (from local docs; password never logged)
- Routes checked: `/login`, `/home`, `/book/2026/11`, `/book/2026/12` (unconfigured month, `setup_done = false`, Month Setup wizard visible, read-only)
- Console errors: `0`
- Page exceptions: `0`
- Failed network requests: `0`
- HTTP >= 400 responses: `0`
- Observed `/rest/v1/widgets` client query on `/book/2026/11`: `1` (`GET .../rest/v1/widgets?select=config%2Ctype&id=eq.4e1b7d45-82ae-4772-b29c-f82a8344cba0`)

---

## Task Checklist

### [x] T1 — Break barrel-export leaks (`@/components/book`, `@/components/widgets`, `@/components/desk`) (Audit P1)
- **Status**: `done`
- **Before numbers**:
  - `/login`: route `596,096 B` (`582.1 KB`) raw / `156,007 B` (`152.4 KB`) gz; total `1,152,007 B` (`1,125.0 KB`) raw / `327,528 B` (`319.9 KB`) gz
  - `/home`: route `329,017 B` (`321.3 KB`) raw / `88,581 B` (`86.5 KB`) gz; total `884,928 B` (`864.2 KB`) raw / `260,102 B` (`254.0 KB`) gz
  - `/book/[year]/[month]`: route `615,622 B` (`601.2 KB`) raw / `160,138 B` (`156.4 KB`) gz; total `1,171,533 B` (`1,144.1 KB`) raw / `331,659 B` (`323.9 KB`) gz
  - Top 5 chunks: `3batmfs7cfp0_.js` (`258.9 KB`), `2u3wlrixsna5x.js` (`223.7 KB`), `3e74daruhfslf.js` (`150.3 KB`), `2-ghsjoyw8und.js` (`133.9 KB`), `0cz1d0mv5g_q7.js` (`110.0 KB`)
- **After numbers**:
  - `/login`: route `298,451 B` (`291.5 KB`) raw / `80,144 B` (`78.3 KB`) gz; total `854,362 B` (`834.3 KB`) raw / `251,543 B` (`245.6 KB`) gz (`-290.7 KB` raw / `-74.2 KB` gz)
  - `/home`: route `328,452 B` (`320.8 KB`) raw / `88,275 B` (`86.2 KB`) gz; total `884,363 B` (`863.6 KB`) raw / `259,674 B` (`253.6 KB`) gz (`-0.6 KB` raw / `-0.4 KB` gz)
  - `/book/[year]/[month]`: route `533,952 B` (`521.4 KB`) raw / `138,271 B` (`135.0 KB`) gz; total `1,089,863 B` (`1,064.3 KB`) raw / `309,670 B` (`302.4 KB`) gz (`-79.8 KB` raw / `-21.5 KB` gz)
  - Top 5 chunks: `3batmfs7cfp0_.js` (`258.9 KB` raw / `68.2 KB` gz), `2u3wlrixsna5x.js` (`223.7 KB` raw / `70.0 KB` gz), `00057jwvw141i.js` (`150.1 KB` raw / `33.6 KB` gz), `1dm5v-i2bhyil.js` (`128.7 KB` raw / `34.8 KB` gz), `0cz1d0mv5g_q7.js` (`110.0 KB` raw / `38.7 KB` gz)
- **Verification result**: `PASS (tsc --noEmit 0, lint 0, build 0; /login excludes OpenBook/MobileBook/widgets/@dnd-kit; /book excludes ClosedBookDesk; headless Chrome read-only check 0 console errors, 0 failed requests; Auditor CLEAN, Reviewer APPROVE)`
- **Commit hash**: `5f668023`

### [x] T2 — Remove `LineGraphDesktop` client query to `/rest/v1/widgets` & gate `getPreviousMonthData()` on `!setup_done` (Audit P2 / P7)
- **Status**: `done`
- **Before numbers**:
  - `/login`: route `298,451 B` (`291.5 KB`) raw / `80,144 B` (`78.3 KB`) gz; total `854,362 B` (`834.3 KB`) raw / `251,543 B` (`245.6 KB`) gz
  - `/home`: route `328,452 B` (`320.8 KB`) raw / `88,275 B` (`86.2 KB`) gz; total `884,363 B` (`863.6 KB`) raw / `259,674 B` (`253.6 KB`) gz
  - `/book/[year]/[month]`: route `533,952 B` (`521.4 KB`) raw / `138,271 B` (`135.0 KB`) gz; total `1,089,863 B` (`1,064.3 KB`) raw / `309,670 B` (`302.4 KB`) gz
  - Top 5 chunks: `3batmfs7cfp0_.js` (`258.9 KB` raw / `68.2 KB` gz), `2u3wlrixsna5x.js` (`223.7 KB` raw / `70.0 KB` gz), `00057jwvw141i.js` (`150.1 KB` raw / `33.6 KB` gz), `1dm5v-i2bhyil.js` (`128.7 KB` raw / `34.8 KB` gz), `0cz1d0mv5g_q7.js` (`110.0 KB` raw / `38.7 KB` gz)
  - Baseline `/book/2026/11` fires 1 client `GET /rest/v1/widgets?select=config%2Ctype&id=...` request on mount; `BookMonthPage` calls `getPreviousMonthData()` unconditionally even when `setup_done = true`
- **After numbers**:
  - `/login`: route `298,451 B` (`291.5 KB`) raw / `80,144 B` (`78.3 KB`) gz; total `854,362 B` (`834.3 KB`) raw / `251,543 B` (`245.6 KB`) gz (`0 B` vs T1)
  - `/home`: route `328,452 B` (`320.8 KB`) raw / `88,275 B` (`86.2 KB`) gz; total `884,363 B` (`863.6 KB`) raw / `259,674 B` (`253.6 KB`) gz (`0 B` vs T1)
  - `/book/[year]/[month]`: route `533,873 B` (`521.4 KB`) raw / `138,211 B` (`135.0 KB`) gz; total `1,089,784 B` (`1,064.2 KB`) raw / `309,610 B` (`302.4 KB`) gz (`-79 B` raw / `-60 B` gz vs T1)
  - Top 5 chunks: `3batmfs7cfp0_.js` (`258.9 KB` raw / `68.2 KB` gz), `2u3wlrixsna5x.js` (`223.7 KB` raw / `70.0 KB` gz), `40ohfs9sg2ivp.js` (`149.8 KB` raw / `33.4 KB` gz), `1dm5v-i2bhyil.js` (`128.7 KB` raw / `34.8 KB` gz), `0cz1d0mv5g_q7.js` (`110.0 KB` raw / `38.7 KB` gz)
  - Network: `0` `/rest/v1/widgets` requests on `/book/2026/11` mount & page turns; `BookMonthPage` skips `getPreviousMonthData()` when `setup_done = true`
- **Verification result**: `PASS (tsc --noEmit 0, lint 0, build 0; bundle <= T1; 0 /rest/v1/widgets requests on mount/page turn; LineGraph source unit "hrs" preserved; /book/2026/12 wizard prefill "Use the same as last month" preserved with 0 DB writes; 0 console/network errors; Auditor CLEAN, Reviewer APPROVE)`
- **Commit hash**: `d8b42ad9`

### [x] T3 — Move `setInitialEntries` out of `OpenBook` render & localize placement hover state to `PlacementOverlay` (Audit P3)
- **Status**: `done`
- **Before numbers**:
  - `/login`: route `298,451 B` (`291.5 KB`) raw / `80,144 B` (`78.3 KB`) gz; total `854,362 B` (`834.3 KB`) raw / `251,543 B` (`245.6 KB`) gz
  - `/home`: route `328,452 B` (`320.8 KB`) raw / `88,275 B` (`86.2 KB`) gz; total `884,363 B` (`863.6 KB`) raw / `259,674 B` (`253.6 KB`) gz
  - `/book/[year]/[month]`: route `533,873 B` (`521.4 KB`) raw / `138,211 B` (`135.0 KB`) gz; total `1,089,784 B` (`1,064.2 KB`) raw / `309,610 B` (`302.4 KB`) gz
  - Top 5 chunks: `3batmfs7cfp0_.js` (`258.9 KB` raw / `68.2 KB` gz), `2u3wlrixsna5x.js` (`223.7 KB` raw / `70.0 KB` gz), `40ohfs9sg2ivp.js` (`149.8 KB` raw / `33.4 KB` gz), `1dm5v-i2bhyil.js` (`128.7 KB` raw / `34.8 KB` gz), `0cz1d0mv5g_q7.js` (`110.0 KB` raw / `38.7 KB` gz)
  - `OpenBook` calls `setInitialEntries` synchronously during render and holds `activePlacement` hover state
- **After numbers**:
  - `/login`: route `298,451 B` (`291.5 KB`) raw / `80,144 B` (`78.3 KB`) gz; total `854,362 B` (`834.3 KB`) raw / `251,543 B` (`245.6 KB`) gz (`0 B` vs T2)
  - `/home`: route `328,452 B` (`320.8 KB`) raw / `88,275 B` (`86.2 KB`) gz; total `884,363 B` (`863.6 KB`) raw / `259,674 B` (`253.6 KB`) gz (`0 B` vs T2)
  - `/book/[year]/[month]`: route `533,708 B` (`521.2 KB`) raw / `138,205 B` (`135.0 KB`) gz; total `1,089,619 B` (`1,064.1 KB`) raw / `309,604 B` (`302.3 KB`) gz (`-165 B` raw / `-6 B` gz vs T2)
  - Top 5 chunks: `3batmfs7cfp0_.js` (`258.9 KB` raw / `68.2 KB` gz), `2u3wlrixsna5x.js` (`223.7 KB` raw / `70.0 KB` gz), `40ohfs9sg2ivp.js` (`149.8 KB` raw / `33.4 KB` gz), `1dm5v-i2bhyil.js` (`128.7 KB` raw / `34.8 KB` gz), `0cz1d0mv5g_q7.js` (`110.0 KB` raw / `38.7 KB` gz)
- **Verification result**: `PASS (tsc --noEmit 0, lint 0, build 0; bundle <= T2; headless Chrome read-only check verified entries reload cleanly across page turns, LineGraph unit "hrs" preserved, PlacementOverlay hover/leave/keyboard handoff/Escape clean with 0 console/network/DB-write errors; Auditor CLEAN, Reviewer APPROVE)`
- **Commit hash**: `d2f05f16`

### [-] T4 — Fix chart `entriesVersion` selectors (`s.versions[sourceWidgetId]`), wrap charts + `Paper` in `React.memo`, and stabilize props (Audit P4)
- **Status**: `skipped`
- **Before numbers**:
  - Reference T3 after numbers (`LineGraphDesktop`, `DonutDesktop`, `GoalBarDesktop` subscribe to `s.version` without `React.memo`; `Paper` unmemoized)
- **After numbers**: `N/A (skipped)`
- **Verification result**: `Skipped — User instruction update: "finish till task 3 and report"`
- **Commit hash**: `none`
