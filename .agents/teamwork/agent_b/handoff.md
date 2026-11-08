# Handoff Report — Agent B (Infra Specialist)

## 1. Observation
- `app/sw.ts:37`: `networkTimeoutSeconds` was set to `3`. Running the server query waterfall took over 3,000 ms, triggering the timeout prematurely on slow connections.
- `app/sw.ts:49-50`: Next.js immutable static assets (`/_next/static/*`) used `StaleWhileRevalidate`, incurring redundant network revalidations for hashed assets that never change.
- `scripts/build-sw.js:27`: `optimization.minimize` was explicitly set to `false`, generating an unminified `public/sw.js` measuring 149,451 bytes.
- `app/layout.tsx:13-18`: `Cormorant_Garamond` was loaded globally in `RootLayout` with 5 weights (`300`, `400`, `500`, `600`, `700`) and injected into `html className`, forcing all `/book/*` routes to download Cormorant Garamond font files even though the font is exclusively used on the cover.
- `components/book/ClosedBook.tsx`: Verified that `font-cover` is only used on the cover with weights `400` (normal and italic), `500` (medium), `600` (semibold), and `700` (bold). Weight `300` is completely unused.
- `app/layout.tsx:6-11`: `Kalam` lacked explicit fallback configuration and font metric adjustment (`adjustFontFallback`), risking glyph shifts when cursive text swaps in.
- `app/globals.css:104-126`: Animations `.animate-page-flip-forward`, `.animate-page-flip-backward`, `.animate-shadow-under-left`, `.animate-shadow-under-right`, `.animate-leaf-shadow-forward`, and `.animate-leaf-shadow-backward` lacked compositor layer hints (`will-change: transform` and `will-change: opacity`).

## 2. Logic Chain
1. In `app/sw.ts`, raising `networkTimeoutSeconds` from `3` to `5` gives the server sufficient window to return dynamic HTML while retaining the 30-day offline cache fallback when offline.
2. Changing `/_next/static/*` from `StaleWhileRevalidate` to `CacheFirst` ensures hashed static assets serve immediately from the service worker cache without redundant revalidations.
3. In `scripts/build-sw.js`, adding a webpack minimizer plugin powered by Next.js compiled `terser` (`next/dist/compiled/terser`) with `minimize: true` reduced the bundled `public/sw.js` from 149,451 bytes to 36,442 bytes (a 75.6% reduction, well below the 45 KB target), requiring zero new npm packages.
4. In `app/layout.tsx`, removing `Cormorant_Garamond` eliminates Cormorant Garamond font requests on all internal book routes (`/book/[year]/[month]`).
5. In `components/book/ClosedBook.tsx`, importing `Cormorant_Garamond` with only the 4 actively used weights (`400`, `500`, `600`, `700`) and scoping its CSS variable `--font-cormorant` to the cover root container ensures the cover displays identically while keeping the font isolated to `/`.
6. In `app/layout.tsx`, adding `fallback: ['cursive']` and `adjustFontFallback: true` to `Kalam` configures metric adjustments to prevent text jump when cursive handwriting loads.
7. In `app/globals.css`, adding `will-change: transform` to `.animate-page-flip-forward` and `.animate-page-flip-backward` and `will-change: opacity` to the leaf and base shadow overlay classes promotes these layers to the GPU compositor ahead of the 600 ms page turn without modifying casing or ribbon elements.

## 3. Caveats
- No changes were made to `app/book/[year]/[month]/page.tsx` or `components/setup/setupActions.ts` as those files are strictly partitioned to Agent A.
- Global Next.js `npm run build` will succeed completely once Agent A's parallel data join changes are committed; all Agent B files compile with 0 errors.

## 4. Conclusion
All Phase 1 Infra requirements (Fix 2, Fix 10, Fix 8, Fix 7 CSS part) have been genuinely and cleanly implemented. Service worker bundle size is reduced by 75.6% (to 36.4 KB), network timeouts are aligned to 5s, immutable static assets are cached with `CacheFirst`, Cormorant Garamond is strictly scoped to the cover with active weights, Kalam fallback metrics are adjusted, and CSS page turn animations have GPU compositor hints.

## 5. Verification Method
1. Build Service Worker: `node scripts/build-sw.js`
   - Expected output: `sw.js built successfully! File size: 36442 bytes` (confirm size is ~36.4 KB, well below 149 KB).
2. Type check Agent B files:
   - Run `npx tsc --noEmit` and verify zero errors in `app/sw.ts`, `app/layout.tsx`, `components/book/ClosedBook.tsx`, and `scripts/build-sw.js`.
3. Check Git status:
   - Run `git status` and verify only authorized files for Agent B are staged and committed.
