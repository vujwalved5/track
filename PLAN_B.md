# PLAN_B.md — Agent B (Infra Specialist) Optimization Plan

## Task Summary (at most 8 bullets)
1. **Service Worker Timeout (Fix 2)**: Update `/book/*` dynamic route caching strategy in `app/sw.ts` to raise `networkTimeoutSeconds` from 3 to 5 seconds, preserving the offline fallback.
2. **Service Worker Static Caching (Fix 10)**: Switch `/_next/static/*` caching handler in `app/sw.ts` from `StaleWhileRevalidate` to `CacheFirst` for immutable assets.
3. **Service Worker Minification (Fix 10)**: Enable `minimize: true` in `scripts/build-sw.js` webpack configuration to drastically reduce `public/sw.js` bundle size from ~149 KB.
4. **Font Scoping (Fix 8 / Fix 9)**: Remove global `Cormorant_Garamond` font loading from `app/layout.tsx` so book spreads (`/book/*`) make zero Cormorant Garamond requests.
5. **Cover Font Loading (Fix 8 / Fix 9)**: Load `Cormorant_Garamond` strictly in `components/book/ClosedBook.tsx` (the cover route component) scoped with CSS variable `--font-cormorant`, using only actively used weights (`400`, `500`, `600`, `700`).
6. **Kalam Font Metric Adjustment (Fix 8 / Fix 9)**: Configure `Kalam` font fallback metric adjustment in `app/layout.tsx` using `fallback: ['cursive']` and `adjustFontFallback: true` to prevent layout shifts/jumps when cursive font swaps in.
7. **CSS Hardware Acceleration Hints (Fix 7)**: Add `will-change: transform` to `.animate-page-flip-forward` and `.animate-page-flip-backward`, and `will-change: opacity` to leaf and base shadow overlay classes (`.animate-shadow-under-left`, `.animate-shadow-under-right`, `.animate-leaf-shadow-forward`, `.animate-leaf-shadow-backward`) in `app/globals.css`, without touching casing or ribbon.
8. **Verification & Clean Commit**: Verify `npm run build` and `node scripts/build-sw.js` compile with zero errors, confirm `public/sw.js` file size is reduced, and commit changes on branch `optimise`.

## Files Created or Edited
- `PLAN_B.md` (this file)
- `app/sw.ts` (timeout bump to 5s, `_next/static` to CacheFirst)
- `scripts/build-sw.js` (`minimize: true`)
- `app/layout.tsx` (remove global Cormorant Garamond, configure Kalam fallback metric adjustment)
- `components/book/ClosedBook.tsx` (import Cormorant Garamond with weights 400, 500, 600, 700 and attach variable)
- `app/globals.css` (add `will-change: transform` to page flips, `will-change: opacity` to leaf and base shadows)
- `.agents/teamwork/agent_b/*` (progress, handoff reports)

## Items Unsure About
- None. All file locations, font weights, caching policies, and CSS selector classes have been verified against the current codebase and project constraints.

## Ideas (not built)
- Generate a service worker offline HTML fallback page for non-cached book spreads when offline.
- Add Brotli compression step for pre-cached assets in service worker.
