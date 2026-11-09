# Forensic Audit Report: Task 1 (Speed, Infrastructure & Data Flow)

**Auditor**: Forensic Integrity Auditor (Task 1 Stream)  
**Target**: Task 1: Speed, Infrastructure & Data Flow  
**Target Repository**: `c:\Users\aruko\OneDrive\Desktop\Documents\track`  
**Integrity Mode**: Demo Mode (per `ORIGINAL_REQUEST.md:80`)  
**Audit Scope**: Strict Read-Only Verification of Implementation and Done When Criteria  
**Build Status**: `npm run build` exited with code 0  

---

## 1. Observation

### O1. `vercel.json` Region Configuration
- **File**: `vercel.json:1-4`
- **Verbatim Content**:
  ```json
  1: {
  2:   "regions": ["hnd1"]
  3: }
  ```
- **Finding**: Configured strictly with Tokyo edge function region `"hnd1"`. Matches target specification.

---

### O2. Auth Execution Flow & Downstream Page Logic
- **`proxy.ts:1-54`**:
  - Auth invocation at line 34:
    ```ts
    31:   // Use getUser() (not getSession()) per Condition 1 and Supabase security guidelines
    32:   const {
    33:     data: { user },
    34:   } = await supabase.auth.getUser()
    35: 
    36:   if (!user) {
    37:     const url = request.nextUrl.clone()
    38:     url.pathname = '/enter'
    39:     const redirectResponse = NextResponse.redirect(url)
    40:     // Add Cache-Control: no-store per Condition 2
    41:     redirectResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    42:     return redirectResponse
    43:   }
    44: 
    45:   // Set Cache-Control: no-store on book spread and desk responses per Condition 2
    46:   supabaseResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    47: 
    48:   return supabaseResponse
    ```
  - `proxy.ts` performs exactly 1 `supabase.auth.getUser()` network call for protected routes matching `['/book/:path*', '/home', '/home/:path*']` (`line 52`).
  - **Header Forwarding Observation**: `proxy.ts` sets `Cache-Control` on `supabaseResponse`, but does **NOT** forward any `x-user-id` header to downstream requests.
- **`app/home/page.tsx:1-6`**:
  ```tsx
  1: import { HomeDesk } from '@/components/desk'
  2: 
  3: export default function HomePage() {
  4:   return <HomeDesk />
  5: }
  ```
  - Executes **0** `supabase.auth.getUser()` calls.
- **`app/book/[year]/[month]/page.tsx:69-115`**:
  ```tsx
  69:   const supabase = await createClient()
  70: 
  71:   try {
  72:     // Run all independent queries in parallel via Promise.all (Condition 1 / Task 14-2).
  73:     // Embed entries directly into widgets to eliminate the secondary waterfall query.
  74:     // Auth & tenant isolation are strictly enforced by Supabase RLS policies (L11).
  75:     const currentBookQuery = supabase
  76:       .from('books')
  77:       .select(`
  78:         id,
  79:         months (
  80:           id,
  81:           month,
  82:           setup_done,
  83:           paper_left,
  84:           paper_right,
  85:           setup_config,
  86:           widgets (
  87:             id, month_id, page, type, x, y, w, h, config, z, created_at,
  88:             entries (*)
  89:           )
  90:         )
  91:       `)
  92:       .eq('year', year)
  93:       .eq('months.month', month)
  94:       .maybeSingle()
  ...
  110:     const [prevMonthData, currentBookRes, nextBookRes] = await Promise.all([
  111:       getPreviousMonthData(year, month),
  112:       currentBookQuery,
  113:       nextBookQuery,
  114:     ])
  ```
  - Executes **0** `supabase.auth.getUser()` calls (the duplicate `getUser()` call was removed; authentication and tenant isolation rely on Postgres RLS session cookies).
  - Books, months, widgets, and entries queries are **completely combined** into a single nested relational query (`line 75-91`, embedding `entries (*)`), and executed concurrently in `Promise.all` (`line 110-114`).
- **Call Count Summary**: Exactly 1 `supabase.auth.getUser()` network call occurs per protected request (1 in `proxy.ts`, 0 in `page.tsx`).

---

### O3. RLS Migration & Policy Optimization
- **File**: `supabase/migrations/0003_optimize_rls_and_indexes.sql:1-171`
- **Foreign Key Indexes Added (`lines 15-18`)**:
  ```sql
  15: CREATE INDEX IF NOT EXISTS idx_books_user_id ON public.books (user_id);
  16: CREATE INDEX IF NOT EXISTS idx_months_book_id ON public.months (book_id);
  17: CREATE INDEX IF NOT EXISTS idx_widgets_month_id ON public.widgets (month_id);
  18: CREATE INDEX IF NOT EXISTS idx_entries_widget_id ON public.entries (widget_id);
  ```
- **Scalar Subquery Wrapping (`(SELECT auth.uid())`)**:
  - `books` policies (`lines 23, 27, 31, 35`): `USING (user_id = (SELECT auth.uid()))`
  - `months` policies (`lines 44, 54, 64, 74`): `AND books.user_id = (SELECT auth.uid())`
  - `widgets` policies (`lines 86, 97, 108, 119`): `AND books.user_id = (SELECT auth.uid())`
  - `entries` policies (`lines 132, 144, 156, 168`): `AND books.user_id = (SELECT auth.uid())`
- **Finding**: All 16 policies wrap `auth.uid()` in `(SELECT auth.uid())`, caching the evaluated UID per query rather than re-evaluating row-by-row in Postgres.

---

### O4. SSR Markup & Empty-Desk Hydration Lock
- **`components/book/OpenBook.tsx:171, 784-796`**:
  ```tsx
  171:   // Viewport detection (Correction 7: exactly ONE tree, null avoids hydration mismatch)
  172:   const [isDesktop, setIsDesktop] = useState<boolean | null>(null)
  ...
  784:   // Neutral desk-coloured placeholder until matchMedia is known (avoid hydration mismatch, Correction 7)
  785:   if (isDesktop === null) {
  786:     return (
  787:       <div
  788:         className="w-screen h-screen min-h-screen desk-surface"
  789:         style={{
  790:           backgroundColor: '#211b16',
  791:           contain: 'paint layout',
  792:         }}
  793:         aria-hidden="true"
  794:       />
  795:     )
  796:   }
  ```
- **`components/desk/HomeDesk.tsx:32, 100-108`**:
  ```tsx
  32:   const [isMobile, setIsMobile] = useState<boolean | null>(null)
  ...
  100:   // Hydration safeguard placeholder with desk background
  101:   if (isMobile === null) {
  102:     return (
  103:       <main
  104:         className="w-full h-screen desk-surface"
  105:         aria-hidden="true"
  106:       />
  107:     )
  108:   }
  ```
- **Finding**:
  - `isDesktop` was **NOT** defaulted to `true` for SSR. It remains initialized to `null`.
  - During Next.js Server-Side Rendering (SSR), `isDesktop === null` evaluates to `true`.
  - Next.js renders and sends an **empty `#211b16` desk div** (`<div className="w-screen h-screen min-h-screen desk-surface" style="background-color: #211b16; contain: paint layout;" aria-hidden="true" />`).
  - The initial SSR HTML contains **zero `<Paper>` markup, zero textures, zero pages, and zero book elements**.
  - The empty-desk hydration lock is **still active in production**.

---

### O5. Barrel Export Splitting & Client JS Bundle Size
- **`components/book/index.ts:1-4`**:
  ```ts
  1: export { ClosedBook } from './ClosedBook'
  2: export { OpenBook, MONTHS } from './OpenBook'
  3: export { MobileBook, sortWidgetsForMobile } from './MobileBook'
  ```
  - Has NOT been split. `ClosedBook` and `MobileBook` are bundled together.
  - In `app/book/[year]/[month]/page.tsx:1`: `import { OpenBook, MONTHS } from '@/components/book'` continues importing through the barrel file.
- **`components/widgets/index.ts:1-22`**:
  ```ts
  6: export * from './types'
  7: export * from './registry'
  8: export * from './WidgetWrapper'
  9: export * from './PageWidgetLayer'
  10: export * from './WidgetConfigCard'
  11: export * from './WidgetDrawer'
  12: export * from './PlacementOverlay'
  ...
  ```
  - Has NOT been split. It continues re-exporting `registry` (which statically imports all 14 widget types), `WidgetConfigCard`, and `WidgetDrawer`.
  - In `components/book/OpenBook.tsx:9-18`: imports from `@/components/widgets` pull the full widget registry into the client bundle graph.
- **Client JS Bundle Size Measurement (from production build output)**:
  - Command: `npm run build` -> Exit code 0.
  - Manifest (`.next/server/app/book/[year]/[month]/page_client-reference-manifest.js`):
    - Page-specific chunks:
      - `0p5bp19mah4yc.js`: 263,964 bytes (264.0 KB)
      - `28wik33mup1rh.js`: 144,377 bytes (144.4 KB)
      - `2pd4lvycfms7y.js`: 94,692 bytes (94.7 KB)
      - `1k5vrplqhnjwz.js`: 48,304 bytes (48.3 KB)
      - `1krxdzlzb_d22.js`: 34,430 bytes (34.4 KB)
      - `1k4ucy56f8-sq.js`: 14,450 bytes (14.5 KB)
      - `3189lhmf6qhu9.js`: 416 bytes (0.4 KB)
      Subtotal: 600,633 bytes (~600.6 KB).
    - Shared root chunks:
      - `23e6jep2anmtk.js`: 229,288 bytes (229.3 KB)
      - `196ky5ibi4b54.js`: 137,144 bytes (137.1 KB)
      - `3jua5gvtt1jpt.js`: 32,405 bytes (32.4 KB)
      - `1wnov70f88xjy.js`: 29,127 bytes (29.1 KB)
      - `turbopack-2u1d16houkiyo.js`: 9,974 bytes (10.0 KB)
      - `310vm2bl3xxpt.js`: 5,364 bytes (5.4 KB)
      Subtotal: 443,302 bytes (~443.3 KB).
    - Polyfill chunk:
      - `0cz1d0mv5g_q7.js`: 112,594 bytes (112.6 KB).
    - **Total Client JS Loaded for `/book/[year]/[month]`**: **1,156,529 bytes (~1.15 MB uncompressed)**.
  - **Comparison with Baseline**:
    - Pre-optimization baseline reported in `explorer_render/handoff.md:208`: ~1,140 KB (~1.14 MB).
    - Current client bundle size: ~1,156 KB (~1.15 MB).
    - Bundle reduction: **0% drop** (failed the >=35% drop target).

---

## 2. Logic Chain

1. **vercel.json Verification**:
   - `vercel.json` exists on disk and declares `"regions": ["hnd1"]`. Vercel serverless executions for API and SSR run in the Tokyo region, colocated with Supabase Tokyo. Criterion is met.
2. **Auth & Data Flow Verification**:
   - Protected routes pass through `proxy.ts`, which runs `supabase.auth.getUser()` once.
   - Downstream server component `app/book/[year]/[month]/page.tsx` executes 0 `getUser()` calls, querying `books` with embedded `months -> widgets -> entries (*)` in a single query via `Promise.all`.
   - Therefore, exactly 1 `getUser()` network call is executed per protected request.
   - Note: While the target was met, the planned mechanism of passing `x-user-id` was bypassed; instead, the page relies purely on RLS session cookie resolution.
3. **RLS Policy Optimization Verification**:
   - `supabase/migrations/0003_optimize_rls_and_indexes.sql` updates all 16 policies on `books`, `months`, `widgets`, and `entries` to use `(SELECT auth.uid())` and adds 4 foreign key indexes.
   - This ensures `auth.uid()` evaluates once per query rather than per row. Criterion is met.
4. **SSR Markup Verification**:
   - In `OpenBook.tsx:171`, `isDesktop` is initialized as `useState<boolean | null>(null)`.
   - In Next.js SSR, `isDesktop` is `null`. Lines 784-796 immediately return the desk placeholder `<div className="w-screen h-screen min-h-screen desk-surface" style={{ backgroundColor: '#211b16' }} />`.
   - The `<Paper>` component and spread markup are located after line 798 and are only rendered when `isDesktop === true`.
   - Because `isDesktop` is never set during SSR, the HTML response sent over the wire contains zero `<Paper>` markup and zero textures.
   - Criterion is NOT met.
5. **Bundle Size & Barrel Splitting Verification**:
   - `components/book/index.ts` and `components/widgets/index.ts` still export all sub-components, definitions, and registry items.
   - Pages and components continue importing directly from these barrel exports.
   - The compiled client JS bundle remains ~1.15 MB uncompressed, virtually identical to the 1.14 MB baseline recorded prior to fixes.
   - The >=35% reduction target was NOT achieved. Criterion is NOT met.

---

## 3. Caveats

1. **Build Tooling Environment**: Next.js 16.4.5 with Turbopack was used for compilation. Build output does not print route-by-route gzip sizes to stdout; measurements were derived empirically from `.next/server/.../page_client-reference-manifest.js` and filesystem chunk inspection.
2. **Read-Only Constraint**: No codebase files were edited or created.
3. **`x-user-id` Architectural Deviation**: The user request and fix plan anticipated forwarding `x-user-id` from proxy to pages. While `x-user-id` was not forwarded, the functional requirement (executing exactly 1 `getUser()` call) was satisfied because the page does not make any auth call.

---

## 4. Conclusion & Done When Criteria Evaluation

| Done When Criterion | Status | Code Evidence (`file:line`) | Analysis Summary |
|---|:---:|---|---|
| `vercel.json` is verified to contain `regions: ["hnd1"]` | **PASS** | `vercel.json:1-3` | Contains `"regions": ["hnd1"]`. |
| Code logic in `proxy.ts`, `app/home/page.tsx`, and `app/book/[year]/[month]/page.tsx` executes exactly 1 `supabase.auth.getUser()` network call per protected request | **PASS** | `proxy.ts:34`<br>`app/home/page.tsx:3-5`<br>`app/book/[year]/[month]/page.tsx:69-115` | Exactly 1 `getUser()` call in `proxy.ts`; 0 in `page.tsx`. Relational queries combined into 1 nested query via `Promise.all`. (`x-user-id` header was not forwarded, but 1 call constraint is satisfied). |
| Initial SSR HTML of `/book/[year]/[month]` is verified to contain `<Paper>` markup and textures (not empty `#211b16` div) | **FAIL** | `components/book/OpenBook.tsx:171, 784-796`<br>`components/desk/HomeDesk.tsx:32, 100-108` | `isDesktop` initializes to `null`; SSR renders an empty `#211b16` div. `<Paper>` markup is completely absent from initial SSR HTML. |
| Client JS bundle size for `/book` is inspected and analyzed against the >=35% drop target | **FAIL** | `components/book/index.ts:1-4`<br>`components/widgets/index.ts:1-22`<br>`.next/server/.../page_client-reference-manifest.js:2` | Barrel exports were not split. Total client JS is ~1.15 MB (0% drop from ~1.14 MB baseline); >=35% reduction failed. |
| `npm run build` is executed and verified to succeed with exit code 0 | **PASS** | Terminal Task 52 execution output | Build succeeded with exit code 0; TypeScript and Turbopack passed cleanly. |

**Overall Task 1 Verdict**: **PARTIAL / INTEGRITY FINDING**  
While infrastructure (`vercel.json`), RLS migration, and single `getUser()` execution were implemented, the SSR hydration unlock and barrel export splitting were **NOT** implemented, leaving the empty-desk delay and 1.15 MB client bundle bloat unresolved.

---

## 5. Verification Method

### How to Independently Reproduce Findings:

1. **Verify `vercel.json`**:
   ```powershell
   Get-Content vercel.json
   ```
   *Expected*: `{"regions": ["hnd1"]}`.

2. **Verify Single `getUser()` and Query Combination**:
   ```powershell
   Select-String -Path proxy.ts, app/home/page.tsx, "app/book/[year]/[month]/page.tsx" -Pattern "getUser\(\)"
   ```
   *Expected*: Exactly 1 match in `proxy.ts:34`; 0 matches in pages.

3. **Verify SSR Empty `#211b16` Div**:
   Inspect `components/book/OpenBook.tsx` lines 171 and 784-796:
   ```powershell
   Get-Content components/book/OpenBook.tsx | Select-Object -Index 170, 783..795
   ```
   *Expected*: Line 171 shows `useState<boolean | null>(null)`; line 785 shows `if (isDesktop === null) return <div ... backgroundColor: '#211b16' ... />`.

4. **Verify Bundle Size & Barrel Exports**:
   ```powershell
   Get-Content components/book/index.ts
   Get-Content components/widgets/index.ts
   Get-ChildItem .next/static/chunks/*.js | Measure-Object -Property Length -Sum
   ```
   *Expected*: Barrel files remain monolithic; client chunk sum exceeds 1,100,000 bytes.
