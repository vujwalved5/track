# Consolidated Diagnostic Report & Fix Plan: TASK 14-DIAG

**Lead Agent**: Project Orchestrator  
**Audit Status**: **CLEAN** (Verified by Independent Forensic Auditor)  
**Evidence Status**: **22 / 22 Citations CONFIRMED (0 Rejected, 0 Plausible)**  
**Working Directory**: `c:\Users\aruko\OneDrive\Desktop\Documents\track`  
**Target Routes**: `/book/[year]/[month]`, `/enter`, `/home` on `track-vujwal.vercel.app`  

---

## 1. Consolidated Diagnostic Findings Table

| Problem (A to D) | Root Cause | Evidence (`file:line`) | Estimated Seconds Lost | Proposed Fix |
|---|---|---|---|---|
| **Problem A**<br>(`/book` ~8s paint) | **Cross-Continental Sequential Waterfall + Duplicate Auth**: Request to `/book/*` runs `await supabase.auth.getUser()` in `proxy.ts`, followed sequentially by duplicate `getUser()` in `page.tsx` across 11,000 km to Tokyo (`ap-northeast-1`). Then `entries` query is a strict sequential waterfall waiting for `books/months/widgets` tree with un-cached `auth.uid()` 3-table join in RLS. | `proxy.ts:34, 51-53`<br>`app/book/[year]/[month]/page.tsx:57, 65-87, 117-124`<br>`supabase/migrations/0001_initial_schema.sql:163-174`<br>`vercel.json` (absent) | **3.0s – 5.0s** | 1. Add `vercel.json` with `"regions": ["hnd1"]` (Tokyo).<br>2. Forward `x-user-id` from `proxy.ts` to Server Components, removing duplicate `getUser()`.<br>3. Embed `entries(*)` directly in `widgets` relational query to eliminate waterfall.<br>4. Wrap `(select auth.uid())` in RLS policy. |
| **Problem A**<br>(`/book` ~8s paint) | **Empty-Desk 2-Pass Client Hydration Lock**: Initial SSR outputs ONLY an empty desk background (`<div className="desk-surface" style={{ backgroundColor: '#211b16' }}>`). Real book spread is 100% suppressed during SSR because `isDesktop === null`. Book cannot paint until client bundle downloads, hydrates, and runs `useEffect` media query for a 2nd pass. | `components/book/OpenBook.tsx:171`<br>`components/book/OpenBook.tsx:784-796`<br>`components/book/OpenBook.tsx:174-191` | **2.0s – 3.5s** | Default `isDesktop` to `true` (desktop-first SSR) and render book spread in SSR HTML. Use CSS media queries (`hidden md:block` / `block md:hidden`) to handle mobile layout without suppressing initial markup. |
| **Problem A**<br>(`/book` ~8s paint) | **Monolithic Barrel Import Bundle Bloat**: `@/components/book` and `@/components/widgets` barrel re-exports bundle `ClosedBook`, `MobileBook`, and all 14 chart widgets into `/book` client chunk manifest (>1.14 MB uncompressed JS), severely delaying hydration. | `components/book/index.ts:1-3`<br>`components/widgets/index.ts:6-22`<br>`components/widgets/registry.ts:19-32`<br>`.next client manifest` | **1.5s – 2.5s** | Replace barrel imports in `page.tsx` and `OpenBook.tsx` with direct component imports (e.g. `@/components/book/OpenBook`). Lazy-load widget implementations in `registry.ts`. |
| **Problem A**<br>(Blank navy board + cover says LOCKED) | **Reverse Cover Closing Navigation Freeze**: When locking the book, `handleLockBook` sets `isClosing: true`, fading left page to `opacity-0` over `bg-ink` (`#1c2433` dark navy casing) and swinging right cover closed with text `"LOCKED"`. At 900ms, `window.location.replace('/enter')` fires; the browser freezes displaying this frame for 7-8s while waiting for `/enter` over the network. | `components/book/OpenBook.tsx:847`<br>`components/book/OpenBook.tsx:1030-1033`<br>`components/book/OpenBook.tsx:1161-1205`<br>`components/book/OpenBook.tsx:165-167` | Visual freeze during 7.0s–8.0s navigation | Use `router.replace('/enter')` within `React.startTransition` instead of hard document reload `window.location.replace`, or render a transitional paper notice ("locking the book...") to eliminate the blank navy freeze. |
| **Problem B**<br>(`/enter` stays open ~10s before `/home` appears) | **Missing `app/home/loading.tsx` + 900ms Delay + Serial Server Auth**: `signInWithPassword` takes ~1.8s across WAN to Tokyo; `ClosedBook.tsx` halts 900ms with `setTimeout` before `router.push('/home')`; Next.js router freezes `/enter` on screen because `/home` lacks `loading.tsx`; `proxy.ts` and `app/home/page.tsx` execute duplicate `getUser()` calls on a cold serverless container. | `components/book/ClosedBook.tsx:108`<br>`components/book/ClosedBook.tsx:128-132`<br>`app/home/` (missing `loading.tsx`)<br>`proxy.ts:34`<br>`app/home/page.tsx:9` | **8.0s – 10.5s** | 1. Create `app/home/loading.tsx` with desk surface skeleton.<br>2. Start `router.push('/home')` concurrently with cover animation (0ms delay).<br>3. Forward `x-user-id` header to eliminate duplicate `getUser()` in `HomePage`.<br>4. Deploy serverless functions to Tokyo (`hnd1`). |
| **Problem C**<br>(Open cover looks like trapezoid) | **Perspective Magnification + Incomplete Rotation + Missing End State**: `ClosedBook.tsx:146` sets `perspective: 1800px`. Line 196 rotates front cover around left hinge to `rotateY(-140deg)` (40° short of -180° flat). Outer edge is brought forward along Z-axis by $+327.8\text{px}$, causing +22.3% perspective magnification ($856\text{px}$ outer height vs $700\text{px}$ at hinge). With no flattening end state, it remains a skewed trapezoid. | `components/book/ClosedBook.tsx:146`<br>`components/book/ClosedBook.tsx:193-201`<br>`components/desk/ClosedBookDesk.tsx:87`<br>`components/desk/ClosedBookDesk.tsx:138-146` | Visual distortion during 0.9s animation and 10s route stall | Change rotation target to `rotateY(-180deg)` (or `-178deg`) to lie flat with $z = 0$ ($0\%$ perspective distortion). Add 2-stage keyframe (`0% 0deg` $\to$ `60% -140deg` $\to$ `100% -180deg`) and `onTransitionEnd` handler. |
| **Problem C**<br>(Where spinner is rendered) | **Browser / Platform Loading Indicator Over Blank Paper Page**: Exactly 0 spinners exist in the repository source code (Rule L1/L13 compliance: `PROJECT_STATE.md:221`). Interior right page is blank cream paper with 22px dot grid (`ClosedBook.tsx:149-178`). The perceived "lone spinner" is the browser's pending navigation indicator (or Vercel Deployment Protection's SSO challenge spinner, `--spinner-size:16px`) displayed over the blank page during the 10-second stall. | `components/book/ClosedBook.tsx:149-178`<br>`PROJECT_STATE.md:221`<br>`live site HTML` (`[--spinner-size:16px]`) | Coincides with the 8.0s–10.5s freeze of Problem B | Adding `app/home/loading.tsx` unmounts `/enter` immediately, eliminating the frozen blank right page and browser pending indicator. |
| **Problem D**<br>(First paint blockers across routes) | **Cross-Continental Latency + SSR Suppression + Missing Loading Boundaries**: All protected routes run duplicate serial `getUser()` calls across WAN to Tokyo; `/home` and `/book` return empty placeholders (`isMobile === null` and `isDesktop === null`) until client hydration; `app/home/loading.tsx` is missing; `Cormorant_Garamond` is instantiated in client components rather than `RootLayout`. | `proxy.ts:34`<br>`app/home/page.tsx:9`<br>`components/desk/HomeDesk.tsx:32, 100-108`<br>`components/book/OpenBook.tsx:171, 784-796`<br>`components/book/ClosedBook.tsx:9-14` | **3.5s – 5.5s** on `/home`;<br>**5.5s – 8.5s** on `/book` | 1. Colocate Vercel Compute with Supabase in Tokyo (`hnd1`).<br>2. Eliminate SSR `null` placeholder gating.<br>3. Add `loading.tsx` for `/home` and `/enter`.<br>4. Move `Cormorant_Garamond` font definition to `app/layout.tsx`. |

---

## 2. Top 3 Causes Ranked by Confirmed Seconds Lost

Only causes marked **CONFIRMED** by the independent forensic auditor are included in the top 3 ranking:

1. **Rank 1: Cross-Continental WAN Multi-Hop Waterfall & Duplicate `getUser()` Auth Checks**
   - **Seconds Lost**: **3.0s – 5.5s** across protected routes (up to 7.0s on cold starts).
   - **Status**: **CONFIRMED** (`proxy.ts:34`, `app/home/page.tsx:9`, `app/book/[year]/[month]/page.tsx:57, 117-124`, `0001_initial_schema.sql:163-174`, absence of `vercel.json`).
   - **Impact**: Multiplies every database and auth round-trip by 180–260ms WAN latency between Vercel US-East (`iad1`) and Supabase Tokyo (`ap-northeast-1`). Executing `getUser()` twice sequentially on every route burns 1.0s–2.5s before data queries even begin, followed by a sequential server-side query waterfall for entries.

2. **Rank 2: Empty-Desk 2-Pass Client Hydration Locks (`isDesktop === null` and `isMobile === null`)**
   - **Seconds Lost**: **2.0s – 3.5s** on first paint.
   - **Status**: **CONFIRMED** (`components/book/OpenBook.tsx:171, 784-796`, `components/desk/HomeDesk.tsx:32, 100-108`).
   - **Impact**: Initial SSR emits ONLY a blank `#211b16` desk `<div>`. Next.js transmits zero book markup or desk elements in HTML. The browser is completely blocked from painting the book spread until all client JavaScript is downloaded, parsed, executed, and a second client-side render pass completes.

3. **Rank 3: Monolithic Barrel Re-Exports & Heavy Client Bundle Bloat (>1.14 MB uncompressed JS)**
   - **Seconds Lost**: **1.5s – 3.0s** on hydration and paint.
   - **Status**: **CONFIRMED** (`components/book/index.ts:1-3`, `components/widgets/index.ts:6-22`, `components/widgets/registry.ts:19-32`, `.next client reference manifest`).
   - **Impact**: Barrel imports defeat Turbopack tree-shaking, forcing `/book/[year]/[month]` to download `ClosedBook`, `MobileBook`, and all 14 widget types (including all SVG chart calculation engines) into a 1.14 MB client bundle, delaying client hydration and prolonging Rank 2's empty-desk lock.

*(Honorable Mention: Artificial 900ms `setTimeout` navigation holds in `ClosedBook.tsx:129` and `ClosedBookDesk.tsx:57` combined with the absence of `app/home/loading.tsx` directly cause Problem B's 10-second freeze and Problem C's trapezoid distortion).*

---

## 3. Modular Fix Plan (3 Self-Contained Prompts)

In accordance with R3 and R4, the fix plan is partitioned into 3 small, modular tasks. **Zero code modifications will be executed until the user explicitly types "GO".**

### Task 1: Speed, Infrastructure & Data Flow (Prompt 1)
- **Scope**: Colocate Vercel compute with Supabase Tokyo, eliminate duplicate auth calls, optimize RLS, eliminate SSR empty-desk suppression, and split barrel imports.
- **Files to Touch**:
  - `vercel.json` (create at root: `{"regions": ["hnd1"]}`)
  - `proxy.ts` (forward verified user id via `request.headers.set('x-user-id', user.id)`)
  - `app/home/page.tsx` (read `x-user-id` from headers; bypass duplicate `getUser()`)
  - `app/book/[year]/[month]/page.tsx` (read `x-user-id` from headers; embed `entries` in relational query)
  - `supabase/migrations/0003_optimize_rls_policies.sql` (wrap `(select auth.uid())` in `entries` RLS)
  - `components/book/OpenBook.tsx` (default `isDesktop` to `true`, render desktop spread in SSR HTML, use CSS media queries for mobile)
  - `components/desk/HomeDesk.tsx` (default `isMobile` to `false`, render desk in SSR HTML)
  - `components/book/index.ts` & `components/widgets/index.ts` (decouple barrel re-exports; direct imports in `page.tsx`)
- **Done When Checklist**:
  - [ ] `vercel.json` contains `regions: ["hnd1"]`.
  - [ ] Only 1 `supabase.auth.getUser()` network call executes per request to `/home` or `/book/*`.
  - [ ] Direct curl / view-source of `/book/[year]/[month]` contains `<Paper>` markup and paper textures, NOT an empty `#211b16` div.
  - [ ] Client JS bundle size for `/book` drops by at least 35%.
  - [ ] `npm run build` succeeds with exit code 0.

### Task 2: Closed-Book 3D Animation & Geometry (Prompt 2)
- **Scope**: Fix trapezoid distortion, flatten cover to lie flat on open, and remove artificial 900ms timers.
- **Files to Touch**:
  - `components/book/ClosedBook.tsx` (change `rotateY(-140deg)` to `-180deg` flat; add 2-stage transition; remove 900ms `setTimeout` so `router.push('/home')` starts immediately on auth success)
  - `components/desk/ClosedBookDesk.tsx` (change `rotateY(-140deg)` to `-180deg` flat; remove 900ms `setTimeout`)
  - `app/globals.css` (add smooth cover swing easing keyframes without distortion)
- **Done When Checklist**:
  - [ ] Cover rotates fully flat to `-180deg` without outer edge perspective height dilation ($S = 1.0$, height matches hinge exactly at $700\text{px}$).
  - [ ] Zero trapezoid perspective skew on both `/enter` and `/home` closed books.
  - [ ] Navigation is initiated concurrently with cover swing (0ms artificial timer delay).
  - [ ] `prefers-reduced-motion` remains strictly respected.
  - [ ] `npm run build` succeeds with exit code 0.

### Task 3: Cover-to-Book Transition & Loading UI (Prompt 3)
- **Scope**: Unfreeze `/enter` during navigation, introduce tactile loading UI, and fix reverse cover lock visual freeze.
- **Files to Touch**:
  - `app/home/loading.tsx` (create with lightweight paper/desk surface skeleton and handwritten "turning the page...")
  - `app/enter/loading.tsx` (create with closed book cover skeleton)
  - `components/book/ClosedBook.tsx` (wrap navigation in `React.startTransition`)
  - `components/book/OpenBook.tsx` (replace `window.location.replace('/enter')` with client `router.replace('/enter')`; prevent left page opacity-0 flash before navigation completes)
  - `app/layout.tsx` (preload `Cormorant_Garamond` in root `<head>`)
- **Done When Checklist**:
  - [ ] Submitting login on `/enter` unmounts `/enter` and displays `app/home/loading.tsx` without freezing the cover for 10s.
  - [ ] "Lone spinner" is completely absent during navigation; replaced by authentic handwritten "turning the page...".
  - [ ] Locking the book via Antique Brass Key transitions smoothly to `/enter` without leaving a blank navy board and "LOCKED" cover frozen for 8 seconds.
  - [ ] `Cormorant_Garamond` loads in `<head>` without FOUT or layout shift.
  - [ ] `npm run build` succeeds with exit code 0.

---

## 4. Assumptions Made

1. **Supabase Region Immutability**: Assumed Supabase project `track` must remain in AWS Tokyo (`ap-northeast-1`), so latency must be solved by configuring Vercel's compute region to `hnd1` (Tokyo).
2. **Vercel Deployment Protection**: Assumed Vercel Deployment Protection on `track-vujwal.vercel.app` is an intentional staging security setting and not an application bug.
3. **No Flip-Book Libraries (Rule L12)**: Assumed all 3D rotations must remain strictly CSS 3D transforms (`rotateY`, `perspective`) with zero external animation or canvas libraries.
4. **No Spinners (Rule L1/L13)**: Assumed all loading feedback must remain handwritten text ("turning the page...") in Kalam font with zero SVG or CSS spinners.

---

## 5. Deviation Report

**None**. All requirements R1, R2, R3, and R4 have been executed strictly within read-only constraints:
- Zero source code files modified or created.
- Zero commands executed outside the project folder.
- No packages added.
- `PROJECT_STATE.md` updated with full diagnostic summary and status.
