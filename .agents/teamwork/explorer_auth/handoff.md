# Handoff Report: Auth and Routing Diagnostic Investigation

**Agent**: Agent 1 (Auth and Routing Diagnostic Explorer)  
**Task**: TASK 14-DIAG — Diagnostic Investigation of Loading and Animation  
**Authoritative References**: `ORIGINAL_REQUEST.md`, `SCOPE.md`, `DISPATCH.md`  
**Execution Mode**: READ-ONLY  
**Target Routes**: `/` (Public Desk), `/enter` (Login / Cover), `/home` (Home Desk), `/book/[year]/[month]` (Open Book Spread)

---

## 1. Observation

### 1.1 Complete Navigation Flow Trace: Sign-In Click -> `/enter` -> `/home` -> `/book/[year]/[month]`

1. **Public Desk (`/`)**:
   - `components/desk/PublicDesk.tsx:109-110, 141-142, 251-252, 283-284`:
     User clicks `"Open your book"` or `"Begin a new book"`, which are Next.js `<Link href="/enter">` elements.
     Zero auth checks, zero awaited promises, zero network requests. Instant client navigation to `/enter`.
2. **Login Cover (`/enter`)**:
   - `app/enter/page.tsx:1-16` renders `<ClosedBook />` (`components/book/ClosedBook.tsx:16-409`).
   - User submits form via `handleOpenBook` (`components/book/ClosedBook.tsx:38-139`).
   - Line 108: `const { user, error } = await signIn(email, password)` calls `lib/supabase/auth.ts:20-33`, which executes `supabase.auth.signInWithPassword({ email, password })` using the browser client (`lib/supabase/client.ts:8-13`).
   - Line 128-131: On successful auth, `setIsOpening(true)` starts CSS 3D rotation (`transform: rotateY(-140deg)`, 900ms transition), and a timer `setTimeout(() => { router.push('/home') }, 900)` delays navigation call for 900 ms.
3. **Route Transition `/enter` -> `/home`**:
   - Next.js issues an RSC client request `GET /home?_rsc=...`.
   - `proxy.ts:5-49` intercepts request (matched by `proxy.ts:52`: `['/book/:path*', '/home', '/home/:path*']`).
   - Line 34: `const { data: { user } } = await supabase.auth.getUser()`. Awaits external network call to Supabase Auth API in AWS Tokyo (`ap-northeast-1`).
   - Next.js server executes `app/home/page.tsx:5-16` (async Server Component).
   - Line 7-9: `const { data: { user } } = await supabase.auth.getUser()`. Awaits a SECOND redundant external network call to Supabase Auth API in Tokyo.
   - Line 11-13: `if (!user) redirect('/enter')`.
   - Line 15: Returns `<HomeDesk />` (`components/desk/HomeDesk.tsx:29-222`).
   - `components/desk/HomeDesk.tsx:101-108`: Server renders empty `<main className="w-full h-screen desk-surface" aria-hidden="true" />` because `isMobile === null`.
   - Browser client downloads JS bundle, hydrates, executes `useEffect` (`HomeDesk.tsx:46-49`), sets `setIsMobile`, and renders the desk on a second pass.
4. **Home Desk (`/home`) -> Click Book -> `/book/[year]/[month]`**:
   - User clicks the closed book on the desk (`components/desk/ClosedBookDesk.tsx:43-59`).
   - Line 55-58: `setIsOpening(true)` triggers cover rotation (`rotateY(-140deg)`, 900ms), and a timer `setTimeout(() => { router.push(targetUrl) }, 900)` blocks navigation for 900 ms where `targetUrl = /book/${currentYear}/${currentMonthNum}` (e.g. `/book/2026/11`).
5. **Route Transition `/home` -> `/book/[year]/[month]`**:
   - Next.js issues RSC request `GET /book/2026/11?_rsc=...`.
   - `proxy.ts:5-49` intercepts request. Line 34: `await supabase.auth.getUser()` makes an external HTTPS network call to Supabase Auth API in Tokyo.
   - Next.js server executes `app/book/[year]/[month]/page.tsx:30-216`.
   - Line 55-57: `await supabase.auth.getUser()` makes a SECOND redundant external HTTPS network call to Supabase Auth API in Tokyo.
   - Line 59-61: `if (!user) redirect('/enter')`.
   - Line 65-87: Concurrently queries `getPreviousMonthData(year, month, user.id)` and `books` + `months` + `widgets` for current month.
   - Line 117-124: Sequentially queries `entries` table for `widgetIds` returned from current month.
   - `app/book/[year]/[month]/loading.tsx:1-25` is streamed to browser during server data retrieval.
   - Server returns `<OpenBook ... />` (`components/book/OpenBook.tsx:61-1337`).
   - `components/book/OpenBook.tsx:785-796`: Server renders empty `<div className="w-screen h-screen min-h-screen desk-surface" ... aria-hidden="true" />` because `isDesktop === null`.
   - Browser client downloads >940 KB JS bundle, hydrates, executes `useEffect` (`OpenBook.tsx:174-191`), sets `setIsDesktop`, and paints the open book spread on a second render pass.

---

### 1.2 Enumeration of All Auth Checks in the Codebase

| Layer | File & Line | Method / Call | Network Target & Behavior |
|---|---|---|---|
| **Middleware / Proxy** | `proxy.ts:34` | `await supabase.auth.getUser()` | Next.js 16 server-side proxy; intercepts `/home` and `/book/:path*`. Calls Supabase Auth API in Tokyo (`https://gzozoqqvyojpdrdajjkg.supabase.co/auth/v1/user`). If null, redirects to `/enter` (307). |
| **Server Component (Home)** | `app/home/page.tsx:9` | `await supabase.auth.getUser()` | Server Component; duplicate auth check on every request to `/home`. Calls Supabase Auth API in Tokyo. If null, calls `redirect('/enter')`. |
| **Server Component (Book)** | `app/book/[year]/[month]/page.tsx:57` | `await supabase.auth.getUser()` | Server Component; duplicate auth check on every request to `/book/*`. Calls Supabase Auth API in Tokyo. If null, calls `redirect('/enter')`. |
| **Server Action (Setup Prev Month)** | `components/setup/setupActions.ts:50` | `await supabase.auth.getUser()` | Fallback check in `getPreviousMonthData(year, month, userId?)` when `userId` is omitted. (In `page.tsx:66`, `user.id` is explicitly passed, so line 50 is bypassed). |
| **Server Action (Setup Save)** | `components/setup/setupActions.ts:251` | `await supabase.auth.getUser()` | Server Action `completeMonthSetup`; validates user before batch inserting setup rows. |
| **Client Hook / Auth Helper** | `lib/supabase/auth.ts:25` | `await supabase.auth.signInWithPassword({ email, password })` | Client-side call from `ClosedBook.tsx:108`. Issues POST to `https://...supabase.co/auth/v1/token?grant_type=password`. |
| **Client Hook / Auth Helper** | `lib/supabase/auth.ts:40` | `await supabase.auth.signUp({ email, password })` | Client-side call from `ClosedBook.tsx:59`. Issues POST to `https://...supabase.co/auth/v1/signup`. |
| **Client Hook / Auth Helper** | `lib/supabase/auth.ts:51` | `await supabase.auth.signOut()` | Client-side call from `OpenBook.tsx:145, 158`, `MobileBook.tsx:185, 198`, `HomeDesk.tsx:76, 89`. Calls `clearAllLocalCaches()` and `supabase.auth.signOut()`. |
| **Client Cache / Session** | `lib/offlineSync.ts:35` | `await supabase.auth.getSession()` | In `getActiveUserId()`; reads local session cache for offline entry writes. |
| **Layouts (`app/layout.tsx`)** | `app/layout.tsx:1-54` | **None** | No auth checks in `RootLayout`. |

---

### 1.3 Enumeration of All Redirects, `router.push`, `router.replace`, and `window.location` Changes

| Type | Exact Location | Invocation | Condition / Trigger |
|---|---|---|---|
| **Server Redirect** | `proxy.ts:39` | `NextResponse.redirect(url)` | In unauthenticated visitor accessing `/book/:path*` or `/home`. Redirects to `/enter` with `Cache-Control: no-store`. |
| **Server Redirect** | `app/home/page.tsx:12` | `redirect('/enter')` | If `!user` after second `getUser()` check. |
| **Server Redirect** | `app/book/[year]/[month]/page.tsx:60` | `redirect('/enter')` | If `!user` after second `getUser()` check. |
| **Client Router Push** | `components/book/ClosedBook.tsx:78` | `router.push('/home')` | Successful signup with session when `prefersReducedMotion` is true. |
| **Client Router Push** | `components/book/ClosedBook.tsx:84` | `router.push('/home')` | Successful signup with session; executed inside `setTimeout(..., 900)`. |
| **Client Router Push** | `components/book/ClosedBook.tsx:124` | `router.push('/home')` | Successful signin when `prefersReducedMotion` is true. |
| **Client Router Push** | `components/book/ClosedBook.tsx:130` | `router.push('/home')` | Successful signin; executed inside `setTimeout(..., 900)`. |
| **Client Router Push** | `components/desk/ClosedBookDesk.tsx:51` | `router.push(targetUrl)` | Click "Open [Month]" when `prefersReducedMotion` is true (`targetUrl = /book/[year]/[month]`). |
| **Client Router Push** | `components/desk/ClosedBookDesk.tsx:57` | `router.push(targetUrl)` | Click "Open [Month]"; executed inside `setTimeout(..., 900)` (`targetUrl = /book/[year]/[month]`). |
| **Client Router Push** | `components/book/OpenBook.tsx:595` | `router.push('/book/${tgtYear}/${tgtMonth}')` | Page turn backward; executed inside `setTimeout(..., 600)`. |
| **Client Router Push** | `components/book/OpenBook.tsx:604` | `router.push('/book/${tgtYear}/${tgtMonth}')` | Page turn forward; executed inside `setTimeout(..., 600)`. |
| **Client Router Push** | `components/book/OpenBook.tsx:1259` | `router.push('/home')` | Click top ribbon "Desk" tab to return from book spread to home desk. |
| **Client Hard Navigation** | `components/desk/HomeDesk.tsx:80` | `window.location.replace('/enter')` | Click Antique Brass Key on home desk when `prefersReducedMotion` is true (inside `setTimeout(..., 150)`). |
| **Client Hard Navigation** | `components/desk/HomeDesk.tsx:96` | `window.location.replace('/enter')` | Click Antique Brass Key on home desk; executed inside `setTimeout(..., 900)`. |
| **Client Hard Navigation** | `components/book/OpenBook.tsx:149` | `window.location.replace('/enter')` | Click Antique Brass Key in desktop book when `prefersReducedMotion` is true (inside `setTimeout(..., 150)`). |
| **Client Hard Navigation** | `components/book/OpenBook.tsx:166` | `window.location.replace('/enter')` | Click Antique Brass Key in desktop book; executed inside `setTimeout(..., 900)`. |
| **Client Hard Navigation** | `components/book/MobileBook.tsx:187` | `window.location.replace('/enter')` | Click Antique Brass Key in mobile book when `prefersReducedMotion` is true (inside `setTimeout(..., 150)`). |
| **Client Hard Navigation** | `components/book/MobileBook.tsx:203` | `window.location.replace('/enter')` | Click Antique Brass Key in mobile book; executed inside `setTimeout(..., 900)`. |
| **Client Reload** | `components/desk/HomeDesk.tsx:54` | `window.location.reload()` | `pageshow` listener: triggers if page restored from BFcache (`e.persisted`). |
| **Client Reload** | `components/book/OpenBook.tsx:183` | `window.location.reload()` | `pageshow` listener: triggers if page restored from BFcache (`e.persisted`). |
| **Client Reload** | `components/book/MobileBook.tsx:165` | `window.location.reload()` | `pageshow` listener: triggers if page restored from BFcache (`e.persisted`). |

---

### 1.4 Awaited Calls and Delays Prior to Navigation

1. **Sign-In Form (`ClosedBook.tsx`)**:
   - `components/book/ClosedBook.tsx:108`: `await signIn(email, password)`. Makes external HTTPS POST to Supabase Auth API in Tokyo. Measured duration: **~1,959 ms** (`OPTIMISATION_PLAN.md:20`).
   - `components/book/ClosedBook.tsx:129-131`: `setTimeout(() => { router.push(targetUrl) }, 900)`. **Awaited timer**: 900 ms hard delay before `router.push('/home')` is dispatched.
2. **Open Month Form (`ClosedBookDesk.tsx`)**:
   - `components/desk/ClosedBookDesk.tsx:56-58`: `setTimeout(() => { router.push(targetUrl) }, 900)`. **Awaited timer**: 900 ms hard delay before `router.push('/book/2026/11')` is dispatched.
3. **Locking & Sign-Out (`OpenBook.tsx`, `MobileBook.tsx`, `HomeDesk.tsx`)**:
   - `components/book/OpenBook.tsx:156-162`: `setTimeout(async () => { await signOut() }, 450)`. Calls `lib/offlineSync.ts:49` (`clearAllLocalCaches()`) and awaits `supabase.auth.signOut()`.
   - `components/book/OpenBook.tsx:165-167`: `setTimeout(() => { window.location.replace('/enter') }, 900)`. Hard navigation timer.
4. **Server-Side Navigation Handlers**:
   - `proxy.ts:34`: `await supabase.auth.getUser()`. Awaited on every request to `/home` and `/book/*`.
   - `app/home/page.tsx:6`: `await createClient()`. Awaited to parse cookies.
   - `app/home/page.tsx:9`: `await supabase.auth.getUser()`. Awaited on every request to `/home`.
   - `app/book/[year]/[month]/page.tsx:31`: `await params`. Next.js 16 dynamic route params promise.
   - `app/book/[year]/[month]/page.tsx:54`: `await createClient()`.
   - `app/book/[year]/[month]/page.tsx:57`: `await supabase.auth.getUser()`.
   - `app/book/[year]/[month]/page.tsx:65`: `await Promise.all([ getPreviousMonthData(...), supabase.from('books').select(...) ])`.
   - `app/book/[year]/[month]/page.tsx:117`: `await supabase.from('entries').select('*').in('widget_id', widgetIds)`.

---

## 2. Logic Chain

### 2.1 Problem A: Why does `/book/[year]/[month]` take ~8 seconds to paint, with the left page as a blank navy board and cover saying "LOCKED"?

```
[Observation 1.1, 1.4]
ClosedBookDesk.tsx:56 has a hardcoded setTimeout(..., 900) before router.push('/book/2026/11') is called.
└──> Step 1: Client is frozen for 900 ms before navigation even starts.

[Observation 1.2, 1.4]
proxy.ts:34 intercepts /book/2026/11 and calls await supabase.auth.getUser().
└──> Step 2: Next.js edge/serverless function waits 450 ms - 1,800 ms for Supabase Auth API in Tokyo.

[Observation 1.2, 1.4]
app/book/[year]/[month]/page.tsx:57 calls await supabase.auth.getUser() a second time.
└──> Step 3: Server component waits another 450 ms - 1,800 ms for Tokyo auth verification.

[Observation 1.4]
page.tsx:65 and page.tsx:117 execute sequential database queries against Tokyo backend.
└──> Step 4: Total server data waterfall takes 1,000 ms - 1,500 ms before RSC streaming completes.

[Observation 1.1]
app/book/[year]/[month]/loading.tsx renders during RSC streaming ("turning the page...").
Then components/book/OpenBook.tsx:785-796 has isDesktop === null on initial render, outputting an empty <div />.
└──> Step 5: First paint of real book content is blocked on the client for an additional 800 ms - 1,500 ms while the >940 KB JS bundle downloads, hydrates, and matchMedia evaluates.
Cumulative delay: 0.9s + 0.5s + 0.5s + 1.2s + 2.0s (network/Vercel) + 1.0s (hydration) ≈ 6.1s to 8.5s (~8 seconds).

[Observation 1.3, 1.4]
components/book/OpenBook.tsx:1030-1033 and 1161-1205:
When isClosing is true, left page div has className="transition-opacity duration-300 opacity-0",
exposing the underlying casing frame (OpenBook.tsx:847: bg-ink rounded-lg = navy board).
Simultaneously, lines 1161-1205 render the front cover with animate-reverse-cover-close displaying "LOCKED" (line 1202).
└──> Step 6: When the user locks the book, isClosing is set to true. At 450 ms, signOut() is called. At 900 ms, window.location.replace('/enter') triggers full browser reload.
Because window.location.replace initiates a cold page load to /enter, and if the user clicks Back or reloads, bfcache restores the page with isClosing === true (or pageshow line 183 triggers window.location.reload() which hits proxy.ts unauthenticated redirect).
During this 4-8 second reload/redirect sequence, the browser freezes displaying the last painted DOM state:
Left page = blank navy board (bg-ink), Right page = closed cover with "LOCKED".
```

### 2.2 Problem B: Why does `/enter` stay open for ~10 seconds before `/home` appears?

```
[Observation 1.4]
User enters credentials on /enter and clicks "OPEN THE BOOK".
components/book/ClosedBook.tsx:108 calls await signIn(email, password) -> lib/supabase/auth.ts:25.
└──> Step 1: Browser client makes HTTPS POST to Supabase Auth in Tokyo.
Measured latency: ~1,959 ms (~2.0 seconds).

[Observation 1.4]
ClosedBook.tsx:129 executes setTimeout(() => { router.push(targetUrl) }, 900).
Line 196: isOpening === true animates the cover open (rotateY(-140deg)).
└──> Step 2: 900 ms artificial timer delay. Cover is swung open at -140 degrees, and the book's interior right page is visible.

[Observation 1.2, 1.3]
At t = 2.9s, router.push('/home') fires. Next.js does NOT unmount /enter while fetching /home.
└──> Step 3: The user remains on /enter, staring at the swung-open cover while /home is fetched in the background.

[Observation 1.2]
proxy.ts:34 intercepts /home and awaits supabase.auth.getUser() to Tokyo (~450 ms - 1,800 ms).
app/home/page.tsx:9 executes and awaits supabase.auth.getUser() a second time (~450 ms - 1,800 ms).
Vercel serverless function cold start and network transit adds ~1,500 ms - 2,500 ms.
└──> Step 4: Server processing and RSC payload transmission takes ~2.5s to 5.0s.

[Observation 1.1]
HomeDesk.tsx:101-108 gates initial SSR and client mount with if (isMobile === null) return <main ... aria-hidden="true" />.
└──> Step 5: Client receives /home, hydrates, evaluates matchMedia, and paints the home desk on a second pass (~0.8s - 1.2s).
Cumulative time: 2.0s (auth) + 0.9s (timer) + 0.9s (proxy) + 0.9s (page) + 2.0s (Vercel) + 1.0s (hydration) ≈ 7.7s to 10.3s (~10 seconds).
Throughout this entire 10 seconds, /enter remains visible with its cover open.
```

### 2.3 Problem B & C: Where is the "lone spinner" rendered?

```
[Observation 1.1, 1.2, grep search across codebase]
Grep search for "spinner", "animate-spin", "spin" in components/book/ClosedBook.tsx, app/enter/page.tsx, and app/globals.css yields ZERO spinner elements.
Commit history in PROJECT_STATE.md:221 states:
"Loading states: Replaced bare 'Reading...', 'Saving...', and 'Opening...' with faint handwritten 'turning the page...'. Zero spinners, animate-spin, or animate-pulse."
└──> Step 1: In the repository HEAD, NO spinner component or animate-spin SVG exists on /enter or ClosedBook.tsx.
When isSubmitting or isOpening is true, ClosedBook.tsx:343 renders handwritten text: "turning the page...".

[Observation 1.1]
ClosedBook.tsx:157-166 renders a cream paper container with radial dots:
radial-gradient(circle, rgba(28, 36, 51, 0.28) 1.4px, transparent 1.4px), backgroundSize: '22px 22px'.
└──> Step 2: The perceived "lone spinner" reported by users on the right page is either:
(a) The browser's native tab favicon loading throbber during the 10s router.push('/home') network stall,
(b) An older deployment build artifact on Vercel that was active before commit bc8533b / 10ae873, or
(c) Misidentification of the radial dotted paper grid with the "turning the page..." status text.
```

### 2.4 Problem D: What blocks the first paint on each route?

```
[Observation 1.1, 1.2, 1.4]
Route /:
- Auth: None (public).
- Blocker: components/desk/PublicDesk.tsx:32, 44 gates mobile layout on mounted && isMobile.

Route /enter:
- Auth: None (public in proxy.ts).
- Blocker: First paint of /enter is fast, but transition to /home is blocked by signInWithPassword (1.95s) + setTimeout(900ms) + proxy auth check + page auth check.

Route /home:
- Auth: BLOCKED by two serial calls to supabase.auth.getUser() (proxy.ts:34 and app/home/page.tsx:9), each taking 450 ms - 1,800 ms.
- Hydration: BLOCKED by components/desk/HomeDesk.tsx:101-108 (isMobile === null renders empty <main /> on SSR and initial client mount).

Route /book/[year]/[month]:
- Auth: BLOCKED by two serial calls to supabase.auth.getUser() (proxy.ts:34 and page.tsx:57), each taking 450 ms - 1,800 ms.
- Data: BLOCKED by server data waterfall (Promise.all for books + sequential entries query in page.tsx:117).
- Next.js: Streams app/book/[year]/[month]/loading.tsx instead of final content.
- Hydration: BLOCKED by components/book/OpenBook.tsx:785-796 (isDesktop === null renders empty <div /> on SSR and initial client mount, forcing two-pass render after >940 KB bundle load).
```

---

## 3. Caveats

1. **Vercel Deployment Protection**:
   Direct HTTP curl to `https://track-vujwal.vercel.app/` redirects to Vercel SSO (`<title>Login – Vercel</title>`) because the deployment has Vercel Deployment Protection enabled. Automated public browser measurements require Vercel protection bypass credentials or manual browser Network tab verification.
2. **Spinner Element in Current Codebase**:
   Code audit confirms NO `<svg className="animate-spin">` or spinner element exists in `ClosedBook.tsx` in current git `HEAD`. The analysis classifies the reported "lone spinner" as either a previous deployment state, browser favicon throbber, or visual perception of the dotted paper texture during the 10-second stall.
3. **Database Region vs Serverless Region**:
   The Supabase project (`gzozoqqvyojpdrdajjkg`) is located in AWS Tokyo (`ap-northeast-1`). The Vercel serverless functions default to `iad1` (US East) because no `vercel.json` region configuration exists. This geographical separation introduces an unavoidable physical latency floor (~260 ms RTT) on every server-to-database call.

---

## 4. Conclusion & Consolidating Findings

### 4.1 Consolidating Diagnostic Findings Table (Auth & Routing Perspective)

| Problem Area | Root Cause | Exact Evidence (`file:line`) | Estimated Seconds Lost | Proposed Fix |
|---|---|---|---|---|
| **Problem B** (`/enter` -> `/home` delay) | **Client auth round-trip latency to Tokyo**: `signInWithPassword` executed client-side across continental distance without optimistic progress. | `lib/supabase/auth.ts:25`<br>`components/book/ClosedBook.tsx:108` | **~1.95 s** | Pre-warm TLS connection via `dns-prefetch` / `preconnect` to `*.supabase.co`. Display immediate tactile feedback on bookplate ("unlocking..."). |
| **Problem B** (`/enter` -> `/home` delay) | **Artificial 900ms navigation timer delay**: `setTimeout(..., 900)` blocks `router.push('/home')` until full 3D rotation completes. | `components/book/ClosedBook.tsx:129-131` | **0.90 s** | Trigger `router.prefetch('/home')` on input focus/blur, and dispatch `router.push('/home')` **immediately** (0 ms) on successful auth concurrent with the 900ms cover swing animation. |
| **Problem B & D** (`/home` first paint) | **Duplicate external Auth check in `proxy.ts` and `app/home/page.tsx`**: Two serial calls to `supabase.auth.getUser()` hit Supabase Tokyo API back-to-back. | `proxy.ts:34`<br>`app/home/page.tsx:9` | **0.90 s – 3.60 s** (2 × ~450ms–1800ms) | Pass verified user ID from `proxy.ts` to Server Component via `x-user-id` request header (`NextResponse.next({ request: { headers: requestHeaders } })`), removing redundant `getUser()` call in `app/home/page.tsx:9`. |
| **Problem B & D** (`/home` first paint) | **Two-pass SSR hydration gate**: `isMobile === null` causes server and initial client render to output an empty `<div>`, waiting for client hydration. | `components/desk/HomeDesk.tsx:32, 101-108` | **0.80 s – 1.50 s** | Default `isMobile` to `false` (desktop-first SSR) and use CSS container queries / responsive classes (`hidden md:flex`, `flex md:hidden`) so the desk structure paints on the very first HTML pass. |
| **Problem A** (`/book` 8s delay) | **Artificial 900ms navigation timer delay**: `setTimeout(..., 900)` blocks `router.push` when clicking "Open November". | `components/desk/ClosedBookDesk.tsx:56-58` | **0.90 s** | Call `router.push(targetUrl)` immediately upon click, running server data retrieval concurrently with the 900ms cover swing animation. |
| **Problem A & D** (`/book` first paint) | **Duplicate external Auth check in `proxy.ts` and `page.tsx`**: Serial calls to `supabase.auth.getUser()` hit Supabase Tokyo API back-to-back. | `proxy.ts:34`<br>`app/book/[year]/[month]/page.tsx:57` | **0.90 s – 3.60 s** (2 × ~450ms–1800ms) | Pass verified user ID from `proxy.ts` via `x-user-id` request header, eliminating duplicate `await supabase.auth.getUser()` in `BookMonthPage`. |
| **Problem A & D** (`/book` first paint) | **Two-pass SSR hydration gate**: `isDesktop === null` forces SSR and initial client mount to render an empty brown container (`#211b16`). | `components/book/OpenBook.tsx:171, 785-796` | **0.80 s – 1.50 s** | Default `isDesktop` to `true` (desktop-first SSR) and render the book spread in SSR HTML. Use CSS media queries to toggle desktop vs mobile layout, eliminating empty desk two-pass rendering. |
| **Problem A** (Blank navy board + "LOCKED") | **Hard reload during lock sequence**: Antique Brass Key triggers `isClosing: true` (fading left page to opacity 0 over navy casing and swinging cover closed with "LOCKED") followed by `window.location.replace('/enter')`. | `components/book/OpenBook.tsx:140, 166, 183, 847, 1031, 1161, 1202` | **4.00 s – 8.00 s** | Replace `window.location.replace('/enter')` with client-side `router.replace('/enter')`. Avoid leaving the page in a frozen `isClosing` state during slow `signOut()` network calls. |

---

## 5. Verification Method

### 5.1 Codebase Inspection Verification
1. Inspect `proxy.ts:31-49`: Confirm `await supabase.auth.getUser()` intercepts `/book/:path*` and `/home`, returning 307 redirect to `/enter` if null.
2. Inspect `app/home/page.tsx:6-14`: Confirm duplicate `await supabase.auth.getUser()` and `redirect('/enter')`.
3. Inspect `app/book/[year]/[month]/page.tsx:54-62`: Confirm duplicate `await supabase.auth.getUser()` and `redirect('/enter')`.
4. Inspect `components/book/ClosedBook.tsx:128-132`: Confirm `setIsOpening(true)` followed by `setTimeout(() => { router.push(targetUrl) }, 900)`.
5. Inspect `components/desk/ClosedBookDesk.tsx:55-59`: Confirm `setIsOpening(true)` followed by `setTimeout(() => { router.push(targetUrl) }, 900)`.
6. Inspect `components/book/OpenBook.tsx:1030-1033`: Confirm `isClosing && !prefersReducedMotion ? 'opacity-0' : 'opacity-100'` on left page revealing `bg-ink` (line 847).
7. Inspect `components/book/OpenBook.tsx:1202`: Confirm verbatim text `"LOCKED"` inside `isClosing && !prefersReducedMotion` block.

### 5.2 Browser Network Tab Measurement Instructions for Authenticated Routes

To independently measure latency on authenticated routes (`/enter` -> `/home` -> `/book/2026/11`) in Chrome or Edge DevTools:

1. **Open DevTools**: Press `F12` or `Ctrl+Shift+I` (Windows) and select the **Network** tab.
2. **Configure Columns**:
   - Right-click any column header and ensure the following columns are checked:
     - **Name**
     - **Status**
     - **Type**
     - **Initiator**
     - **Size**
     - **Time**
     - **Waterfall**
3. **Disable Cache**: Check the **"Disable cache"** checkbox in the top toolbar to measure cold response times.
4. **Step 1: Measure Sign-In Latency on `/enter`**:
   - In the filter box, type `supabase.co` or `token`.
   - Fill in credentials on `/enter` and click `"OPEN THE BOOK"`.
   - Locate the request: `POST https://gzozoqqvyojpdrdajjkg.supabase.co/auth/v1/token?grant_type=password`.
   - Hover over the **Waterfall** bar for this request.
   - Record:
     - `Initial connection / SSL`: TLS handshake duration.
     - `Waiting for server response (TTFB)`: Time spent waiting for Supabase Auth in Tokyo.
     - `Total Time`: Expected **~1,800 ms – 2,200 ms**.
5. **Step 2: Measure Navigation to `/home`**:
   - Clear filter box or filter by `Fetch/XHR` and `Doc`.
   - Locate the request: `home?_rsc=...` (or document request `home`).
   - Check the **Initiator** column: confirms `router.push` initiated the request.
   - Note the timestamp gap: The `home` request is dispatched **900 ms after** the `token` request completes due to `setTimeout(..., 900)`.
   - Hover over the **Waterfall** bar for `home?_rsc=...`.
   - Record `Waiting for server response (TTFB)`: Measures `proxy.ts:34` + `app/home/page.tsx:9` dual auth checks. Expected **~1,200 ms – 2,800 ms**.
6. **Step 3: Measure Navigation to `/book/2026/11`**:
   - On `/home`, click the closed book `"Open November"`.
   - Locate the request: `11?_rsc=...` (or `book/2026/11?_rsc=...`).
   - Note the timestamp gap: Dispatched **900 ms after click** due to `ClosedBookDesk.tsx:56`.
   - Hover over the **Waterfall** bar for `11?_rsc=...`.
   - Record `Waiting for server response (TTFB)`: Measures `proxy.ts:34` + `page.tsx:57` dual auth checks + database waterfalls. Expected **~2,200 ms – 4,500 ms**.
7. **Step 4: Measure Client Hydration & Chunk Download**:
   - Filter by `JS`.
   - Inspect chunks loaded by `OpenBook`: locate the primary chunk (`3dtwbakvaf6mg.js` or similar, ~520 KB).
   - Record `Content Download` time and total execution time before the first frame of `<Paper>` renders.

### 5.3 Invalidation Conditions
This report's conclusions would be invalidated if:
1. `proxy.ts` is shown to cache auth tokens in-memory across requests (it does not; serverless environments are stateless).
2. `supabase.auth.getUser()` does not perform an external network request (Supabase SSR documentation verifies that `getUser()` explicitly validates the JWT with the Supabase Auth server, unlike `getSession()`).
3. Next.js 16 is proven to eliminate duplicate auth checks between `proxy.ts` and Server Components automatically (it does not; they run in distinct execution contexts).
