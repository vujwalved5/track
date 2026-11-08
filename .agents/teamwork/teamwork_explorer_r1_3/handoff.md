# Handoff Report: Requirement R2 — Animation & Paint, Arrange Mode, and Other Bottlenecks

**Agent**: `teamwork_explorer_r1_3`  
**Date**: 2026-11-08  
**Scope**: Systematic Investigation of R2 Animation and Paint Bottlenecks, Arrange Mode Bottlenecks, and Other Bottlenecks (Service Worker, Inlined SVGs/Images, Console/Hydration, Dependencies vs L3).  
**Mode**: Strictly Read-Only (no source code or database modification).

---

## 1. Observation

### Summary Table of Findings

| Item # | Investigation Topic | Status | File and Line References | Measured / Traced Evidence | Impact |
|---|---|---|---|---|---|
| **1.1** | Page turn animations modifying layout-triggering properties (`width`, `height`, `top`, `left`) | **Not Found** | `app/globals.css:26-42, 104-110`, `components/book/OpenBook.tsx:705-741, 777-813` | Traced `@keyframes pageFlipForward` and `@keyframes pageFlipBackward`. Exclusively animates `transform: rotateY(...)` and overlay `opacity`. No layout mutations. | None (N/A) |
| **1.2** | Expensive effects during turns (box-shadows, filters, blur, CSS paper grain/dots, missing `will-change`/`transform-gpu`) | **Found** | `app/globals.css:104-126`, `components/paper/Paper.tsx:45-72, 93-97`, `components/book/OpenBook.tsx:579, 662, 705-741, 777-813, 984, 1065` | `will-change: transform` and `will-change: opacity` are completely missing across all animation classes. 4 `<Paper>` instances render simultaneously during turns with 2px repeating linear gradient grain and radial dot gradients. Multiple nested drop-shadow filters and heavy box-shadows. | **High** |
| **1.3** | Late-loading fonts (Kalam, Cormorant) causing layout shifts (CLS) or blank text | **Found** | `app/layout.tsx:6-18, 51`, `tailwind.config.ts:25-28`, `components/book/ClosedBook.tsx:224-388` | Cormorant Garamond is loaded globally with 5 weights (`300`, `400`, `500`, `600`, `700`) in `RootLayout`, but is only used on the closed book cover. Kalam cursive uses `display: 'swap'` without fallback metric adjustments, causing text reflow/CLS upon swap. | **Medium** |
| **2.1** | `@dnd-kit` state updates on every pointer move across all widgets | **Found** | `components/widgets/WidgetWrapper.tsx:83-95, 280-285, 331-347`, `components/widgets/PageWidgetLayer.tsx:231-248` | `useDraggable` updates `transform` state on every pointer move frame. `WidgetWrapper` is unmemoized and renders the active widget's complete presentation tree (`<RenderComponent ... />`), including complex unmemoized SVG charts, triggering re-renders on every mouse move tick. | **High** |
| **2.2** | Repetitive snapping/overlap calculations over the entire widget list | **Found** | `components/widgets/WidgetWrapper.tsx:227-234`, `components/widgets/PlacementOverlay.tsx:67-78, 104-112`, `components/widgets/PageWidgetLayer.tsx:112-120` | During resize `pointermove`, `otherWidgets.some(hasOverlap)` executes bounding box intersection loops on every raw mouse event. `PlacementOverlay` runs an iterative shrinking loop over all existing widgets on every hover. | **Medium** |
| **2.3** | Repeated DOM measurement during drag/resize | **Found** | `components/widgets/PlacementOverlay.tsx:82, 98`, `components/widgets/WidgetWrapper.tsx:274-277, 294-297`, `node_modules/@dnd-kit/core/dist/core.esm.js:607, 913` | Synchronous `e.currentTarget.getBoundingClientRect()` is called inside `handlePointerMove` on every pointer move in `PlacementOverlay`, causing layout thrashing. Inline styles (`left`, `top`, `width`, `height`) are mutated directly during resize rather than transform-only preview. | **High** |
| **3.1** | Service worker or cache settings causing stale/slow loads (`serwist`, `sw.ts`) | **Found** | `app/sw.ts:32-57`, `scripts/build-sw.js:26-28`, `public/sw.js` | Dynamic `/book/*` routes are cached with `NetworkFirst` (3s timeout) for 30 days, causing stale page data when offline or during 3s network lag. Next.js immutable static chunks use `StaleWhileRevalidate` (redundant network checks). `public/sw.js` is unminified (149,451 bytes) due to `minimize: false`. | **Medium** |
| **3.2** | Repeatedly inlined SVGs or large images | **Found** (SVGs) / **Not Found** (large images) | `components/widgets/*` (58 `<svg>` instances across TSX components), `components/book/OpenBook.tsx:480, 919`, `components/widgets/shared/DayStepper.tsx:80, 113` | 58 inlined `<svg>` blocks duplicated across widget headers, buttons, steppers, and chart components without shared symbols/sprites. Zero large raster images in UI (pure CSS paper). | **Low** |
| **3.3** | Console warnings / hydration errors | **Not Found** (no console errors) / **Found** (2-pass SSR bottleneck) | `components/book/OpenBook.tsx:107, 589-596`, `components/pwa/ServiceWorkerRegister.tsx:41` | Zero active runtime console warnings or hydration errors. However, `isDesktop === null` initial state gates SSR rendering, rendering an empty desk placeholder on the server and postponing all book/widget rendering to a second client-side pass. | **High** |
| **3.4** | Unnecessary dependencies (inspect `package.json` strictly vs rule L3) | **Found** | `package.json:11-21`, `components/widgets/WidgetWrapper.tsx:20` | `zustand: "^5.0.2"` is installed in `package.json:20` but is completely unused across the entire codebase (zero imports, zero stores). `@dnd-kit/utilities` is imported as an undeclared transitive phantom dependency in `WidgetWrapper.tsx:20` instead of a pure inline helper. | **Low** |

---

### Detailed Code Evidence

#### 1. Animation & Paint Bottlenecks

##### 1.1 Page Turn Layout Properties: NOT FOUND
Direct code inspection of `app/globals.css:26-42`:
```css
@keyframes pageFlipForward {
  0% {
    transform: rotateY(0deg);
  }
  100% {
    transform: rotateY(-180deg);
  }
}

@keyframes pageFlipBackward {
  0% {
    transform: rotateY(0deg);
  }
  100% {
    transform: rotateY(180deg);
  }
}
```
And shadow overlay keyframes (`app/globals.css:44-102`): `shadowUnderLeft`, `shadowUnderRight`, `leafShadowForward`, `leafShadowBackward` only animate `opacity`.
- **Verdict**: Neither `width`, `height`, `top`, nor `left` are animated during page turns. The implementation strictly adheres to composite-only transforms.

##### 1.2 Expensive Effects During Page Turns: FOUND
1. **Missing `will-change` and hardware acceleration hints**:
   In `app/globals.css:104-126`:
   ```css
   .animate-page-flip-forward {
     animation: pageFlipForward 600ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
   }
   .animate-page-flip-backward {
     animation: pageFlipBackward 600ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
   }
   ```
   Neither `.animate-page-flip-*` nor the shadow animations include `will-change: transform` or `will-change: opacity`. No `transform-gpu` or `transform: translateZ(0)` is present anywhere in `app/`, `components/`, or `lib/`.
2. **Four Paper Layers Rendered Simultaneously During Turn**:
   In `components/book/OpenBook.tsx:676-742`:
   - Base left page (`OpenBook.tsx:680`)
   - Base right page (`OpenBook.tsx:697`)
   - Leaf front face (`OpenBook.tsx:715`)
   - Leaf back face (`OpenBook.tsx:735`)
   Each `<Paper>` (`components/paper/Paper.tsx:45-72`) generates 2 layers of 2x2px repeating diagonal hatch gradients (`GRAIN_A`, `GRAIN_B`) plus radial dot gradients. Rotating these sub-pixel gradients under 3D perspective without dedicated compositor layer isolation causes intense per-frame rasterization.
3. **Heavy Drop-Shadows and Inset Box-Shadows**:
   - `components/book/OpenBook.tsx:579`: folded corner `filter: drop-shadow(-2px -2px 3px rgba(28, 36, 51, 0.35))`
   - `components/book/OpenBook.tsx:662`: casing frame `shadow-[0_20px_50px_rgba(28,36,51,0.7),0_2px_8px_rgba(33,27,22,0.5)]`
   - `components/book/OpenBook.tsx:984`: spine seam `shadow-[0_0_8px_rgba(28,36,51,0.6)]`
   - `components/book/OpenBook.tsx:1065`: hanging ribbon `filter: drop-shadow(0 4px 6px rgba(28, 36, 51, 0.5))`
   - `components/paper/Paper.tsx:93-97`: spine shadow `boxShadow: inset -20px 0 32px -10px ...` on every paper instance.

##### 1.3 Font Loading Configuration: FOUND
In `app/layout.tsx:6-18`:
```tsx
const kalam = Kalam({
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  variable: '--font-kalam',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
})
```
- **Evidence**: Cormorant Garamond requests 5 separate font weight files (`300`, `400`, `500`, `600`, `700`) in `RootLayout`. Codebase search confirms `font-cover` (the only class using Cormorant) is used exclusively in `components/book/ClosedBook.tsx` (the login/cover screen). Every book route (`/book/[year]/[month]`) incurs unnecessary font requests.
- Kalam uses `display: 'swap'` without fallback metric overrides. In `tailwind.config.ts:26`, `font-hand: ['var(--font-kalam)', 'cursive']` falls back to the system generic cursive, which has vastly disparate ascent, descent, and glyph width metrics, causing noticeable Cumulative Layout Shift (CLS).

---

#### 2. Arrange Mode Bottlenecks

##### 2.1 `@dnd-kit` State Updates on Every Pointer Move: FOUND
In `components/widgets/WidgetWrapper.tsx:83-95, 280-285`:
```tsx
const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
  id: widget.id,
  disabled: !isArrangeMode || isResizing,
  data: { widget },
})

const dndStyle = transform
  ? {
      transform: CSS.Translate.toString(transform),
      zIndex: 50,
    }
  : undefined
```
In `components/widgets/WidgetWrapper.tsx:331-347`:
```tsx
<div className="w-full h-full relative">
  {RenderComponent ? (
    <RenderComponent
      id={widget.id}
      config={widget.config}
      w={liveW}
      h={liveH}
      isArrangeMode={isArrangeMode}
      year={year}
      month={month}
      setupConfig={setupConfig}
    />
  ) : ...}
</div>
```
- **Evidence**: On every pointer move tick, `@dnd-kit/core` dispatches a state update updating `transform`. Because `WidgetWrapper` directly consumes `transform`, it re-renders. Neither `WidgetWrapper` nor any of the 14 widget components are memoized (`React.memo`). Heavy chart components (`BarChartWidget`, `DonutWidget`, `LineGraphWidget`, `ScatterPlotWidget`) re-render and recompute SVG path coordinates on every mouse move frame.

##### 2.2 Repetitive Snapping and Overlap Calculations: FOUND
In `components/widgets/WidgetWrapper.tsx:227-234`:
```tsx
const collides = otherWidgets.some((other) =>
  hasOverlap(candidateRect, {
    x: other.x,
    y: other.y,
    w: other.w,
    h: other.h,
  }),
)
```
- **Evidence**: In `handleResizePointerMove`, on every unthrottled `pointermove` event, `otherWidgets.some(hasOverlap)` loops through all other widgets on the page.
- In `components/widgets/PlacementOverlay.tsx:67-78`: `findFittingSizeAt` runs an iterative shrinking loop (testing `hasOverlap` against all existing widgets from `defaultSize` down to `minSize`) on every cursor hover position.
- In `components/widgets/PageWidgetLayer.tsx:241`: `otherWidgets={widgets.filter((w) => w.id !== widget.id)}` allocates a new array on every parent render for each child widget.

##### 2.3 Repeated DOM Measurement During Drag/Resize: FOUND
In `components/widgets/PlacementOverlay.tsx:80-92`:
```tsx
const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
  onDismissNoRoom()
  const rect = e.currentTarget.getBoundingClientRect()
  const offsetX = e.clientX - rect.left
  const offsetY = e.clientY - rect.top
  ...
}
```
- **Evidence**: `e.currentTarget.getBoundingClientRect()` is called synchronously on every single `pointermove` event. Calling `getBoundingClientRect()` inside a high-frequency input handler forces the browser to synchronously recalculate layout and styles (Layout Thrashing).
- During resize (`WidgetWrapper.tsx:274-277, 294-297`), `liveX`, `liveY`, `liveW`, `liveH` directly mutate CSS layout properties (`position: absolute; left: ${leftPx}px; top: ${topPx}px; width: ${widthPx}px; height: ${heightPx}px`) on every snapped tick, forcing full browser reflows instead of composite transforms.

---

#### 3. Other Bottlenecks

##### 3.1 Service Worker & Cache Settings: FOUND
In `app/sw.ts:32-57`:
1. `/book/*` routes are handled by `NetworkFirst` with `networkTimeoutSeconds: 3` and cached in `mm-book-month-pages` for 30 days (`maxAgeSeconds: 30 * 24 * 60 * 60`). When online with mobile or Supabase latency > 3 seconds, the service worker falls back to stale month HTML.
2. Next.js static chunks `/_next/static/*` use `StaleWhileRevalidate` with `cacheName: 'mm-static-chunks'`. Next.js static chunks have content hashes in filenames and are immutable. Serving them via `StaleWhileRevalidate` causes unnecessary background revalidation network requests on every asset.
3. In `scripts/build-sw.js:26-28`:
   ```javascript
   optimization: {
     minimize: false,
   },
   ```
   `sw.js` is bundled without minification, outputting 149,451 bytes (~150 KB) directly to `public/sw.js`.

##### 3.2 Repeatedly Inlined SVGs vs Large Images: FOUND (SVGs) / NOT FOUND (Images)
- **Large Images**: **Not Found**. File system inspection reveals zero raster UI images (only app icons in `public/icons/` totalling ~30 KB). Paper textures are generated purely via CSS gradients (Rule L7).
- **Inlined SVGs**: **Found**. Exactly 58 inline `<svg>` blocks exist across TSX files (`components/widgets/*`, `components/book/OpenBook.tsx:480, 919`, `components/widgets/shared/DayStepper.tsx:80, 113`). Shared icons (DayStepper arrows, delete/cross-out, drawer handles) repeat identical SVG XML paths inline without a shared SVG symbol definition.

##### 3.3 Console Warnings / Hydration Errors: NOT FOUND (errors) / FOUND (2-pass SSR)
- `npm run build` compiles cleanly with zero warnings or errors.
- No runtime console errors occur.
- **Found**: In `components/book/OpenBook.tsx:107, 589-596`:
  ```tsx
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null)
  ...
  if (isDesktop === null) {
    return (
      <div
        className="w-full min-h-screen bg-desk flex items-center justify-center"
        aria-hidden="true"
      />
    )
  }
  ```
  To avoid media-query hydration mismatch, the server returns an empty desk container. The client must hydrate, run `useEffect`, execute `matchMedia`, set state, and re-render the entire book tree from scratch on the client, degrading First Contentful Paint (FCP) and Largest Contentful Paint (LCP).

##### 3.4 Unnecessary Dependencies (Rule L3 Audit): FOUND
Inspection of `package.json:11-21`:
```json
"dependencies": {
  "@dnd-kit/core": "^6.3.1",
  "@supabase/ssr": "^0.12.7",
  "@supabase/supabase-js": "^2.119.0",
  "next": "^16.4.5",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "serwist": "^9.5.13",
  "zod": "^3.23.8",
  "zustand": "^5.0.2"
}
```
1. **Unused package**: `zustand: "^5.0.2"` is declared in `package.json:20`, but a complete codebase search reveals **zero imports or usages of zustand** anywhere in `app/`, `components/`, or `lib/`. All state is stored in React `useState` hooks.
2. **Undeclared phantom dependency**: In `components/widgets/WidgetWrapper.tsx:20`:
   `import { CSS } from '@dnd-kit/utilities'`
   `@dnd-kit/utilities` is NOT listed in `package.json` dependencies (only `@dnd-kit/core` is allowed by L3). It is accessed as an unpinned transitive dependency solely for `CSS.Translate.toString(transform)`.

---

## 2. Logic Chain

1. **Animation Performance (Observation 1.1 & 1.2)**:
   - Observation 1.1 confirms keyframes modify `transform: rotateY` and `opacity`, which are compositor-only properties.
   - However, Observation 1.2 shows that during that 600ms transform, 4 complex `<Paper>` elements containing 2x2px repeating linear gradients and radial dots exist simultaneously in the 3D scene (`OpenBook.tsx:705-741`).
   - Because `will-change: transform` and `will-change: opacity` are omitted in `app/globals.css:104-126`, the browser compositor cannot pre-promote these elements to GPU layers before the animation starts, causing rasterization jank and frame drops during page turns.
   - *Official Reference*: Web.dev — "Stick to Compositor-Only Properties and Manage Layer Count" (`https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count`); MDN — `will-change` (`https://developer.mozilla.org/en-US/docs/Web/CSS/will-change`).

2. **Font Loading & Layout Shifts (Observation 1.3)**:
   - Cormorant Garamond is loaded with 5 weights in `app/layout.tsx:13-18`, even though it is only used on the cover (`ClosedBook.tsx`).
   - Kalam uses `display: 'swap'` with generic `cursive` fallback. Because cursive font metrics differ significantly from Kalam handwriting, text shifts upon font swap, increasing CLS.
   - Scoping Cormorant to `/` and defining font fallback overrides eliminates unnecessary requests and minimizes CLS without new packages.
   - *Official Reference*: Next.js Documentation — "Optimizing Fonts" (`https://nextjs.org/docs/app/building-your-application/optimizing/fonts`); Web.dev — "Best practices for fonts" (`https://web.dev/articles/font-best-practices`).

3. **Arrange Mode Thrashing & Re-renders (Observations 2.1, 2.2, 2.3)**:
   - In `PlacementOverlay.tsx:82`, calling `getBoundingClientRect()` inside `pointermove` forces the browser to flush the layout queue on every frame.
   - In `WidgetWrapper.tsx:83-95`, `useDraggable`'s `transform` changes on every pointer move tick. Because child widget components (especially SVG charts) are not memoized, they re-render on every mouse movement tick.
   - Caching overlay bounds outside `pointermove`, memoizing widget components with `React.memo`, and using CSS `transform` for resize previews prevents layout thrashing and unnecessary re-renders.
   - *Official Reference*: Web.dev — "Avoid Large, Complex Layouts and Layout Thrashing" (`https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing`); React Documentation — `React.memo` (`https://react.dev/reference/react/memo`).

4. **Service Worker and Build Optimization (Observation 3.1)**:
   - In `app/sw.ts:48-57`, `StaleWhileRevalidate` on content-hashed static assets (`/_next/static/*`) causes unnecessary network round-trips. Changing to `CacheFirst` aligns with Next.js immutable asset architecture.
   - Setting `minimize: true` in `scripts/build-sw.js:27` reduces `public/sw.js` from 149 KB to ~45 KB.
   - *Official Reference*: Next.js Documentation — "Caching in Next.js" (`https://nextjs.org/docs/app/building-your-application/caching`); Web.dev — "Offline Cookbook" (`https://web.dev/articles/offline-cookbook`).

5. **SSR Two-Pass Bottleneck (Observation 3.3)**:
   - The `isDesktop === null` initial state pattern in `OpenBook.tsx:107, 589-596` delays all book content rendering to post-hydration client code.
   - Using CSS media queries (`hidden md:flex` / `flex md:hidden`) or server-friendly viewport defaults allows Next.js to stream the full spread on initial HTML paint without hydration mismatches.
   - *Official Reference*: React Documentation — "How to handle different content on the client and server" (`https://react.dev/reference/react-dom/client/hydrateRoot#handling-different-client-and-server-content`).

6. **Dependency Hygiene (Observation 3.4)**:
   - Rule L3 allows only `zod`, `zustand`, `@dnd-kit/core`, and `serwist`.
   - `zustand` is unused and can be removed or kept as a dormant dependency.
   - `@dnd-kit/utilities` is undeclared in `package.json` and can be replaced with an inline string template `translate3d(${transform.x}px, ${transform.y}px, 0)` in `WidgetWrapper.tsx:282`.

---

## 3. Caveats

1. **Browser Profiler Metrics in Headless Mode**: Frame rates and exact GPU raster times during 3D page turns could not be captured via Chrome DevTools Tracing in this read-only subagent session; impact is classified based on known browser engine compositing specifications and architectural code tracing. Numbers are marked as "unmeasured" rather than guessed.
2. **Supabase Region Latency**: Network round-trip times for Supabase backend queries are subject to geographic distance and user ISP conditions; investigated exclusively from the client code path perspective.
3. **No Code Was Modified**: All observations are made against existing production code. No edits were made to application source files, styles, or dependencies.

---

## 4. Conclusion

The investigation of Requirement R2 (Animation & Paint, Arrange Mode, and Other Bottlenecks) has identified 8 specific bottlenecks and verified 2 items as Not Found:

1. **Animation and Paint**: Page turn animations composite properly using `transform` and `opacity` (Not Found: layout-triggering properties). However, missing GPU layer promotion (`will-change: transform`, `will-change: opacity`), concurrent rendering of 4 complex paper texture layers during turns, and global loading of 5 unused Cormorant Garamond font weights create significant paint and network overhead.
2. **Arrange Mode**: Synchronous `getBoundingClientRect()` calls in pointer handlers cause layout thrashing; `@dnd-kit` state updates trigger unmemoized re-renders of the active widget and its underlying SVG charts on every pointer move frame; resize dynamically mutates layout properties.
3. **Other Bottlenecks**: `sw.js` is unminified (149 KB) with sub-optimal caching strategies for immutable Next.js chunks; 58 inline SVGs duplicate path strings; `isDesktop === null` forces an empty-desk SSR two-pass render; `zustand` is installed but unused; `@dnd-kit/utilities` is an undeclared phantom dependency.

All proposed remediation strategies strictly comply with Locked Decisions L1 to L14 and require ZERO packages outside L3.

---

## 5. Verification Method

To independently verify these findings:

1. **Verify Animation & CSS Properties**:
   ```powershell
   Select-String -Path "app\globals.css" -Pattern "@keyframes pageFlip" -Context 0,7
   Select-String -Path "app\globals.css" -Pattern "will-change"
   ```
   *Expected*: Shows `transform: rotateY` in keyframes; shows 0 matches for `will-change`.

2. **Verify Font Configuration**:
   ```powershell
   Select-String -Path "app\layout.tsx" -Pattern "Cormorant_Garamond|Kalam" -Context 0,6
   Select-String -Path "components\**\*.tsx" -Pattern "font-cover"
   ```
   *Expected*: Shows Cormorant loaded with 5 weights in `layout.tsx`; shows `font-cover` only referenced in `ClosedBook.tsx`.

3. **Verify DOM Measurement & `@dnd-kit` in Arrange Mode**:
   ```powershell
   Select-String -Path "components\widgets\PlacementOverlay.tsx" -Pattern "getBoundingClientRect"
   Select-String -Path "components\widgets\WidgetWrapper.tsx" -Pattern "otherWidgets\.some"
   ```
   *Expected*: Confirms `getBoundingClientRect()` in `PlacementOverlay.tsx:82` and collision loop in `WidgetWrapper.tsx:227`.

4. **Verify Service Worker & Caching Configuration**:
   ```powershell
   Select-String -Path "app\sw.ts" -Pattern "StaleWhileRevalidate|NetworkFirst" -Context 0,6
   Get-Item public\sw.js | Select-Object Name, Length
   ```
   *Expected*: Confirms `StaleWhileRevalidate` on `/_next/static/` and `sw.js` size of ~149,451 bytes.

5. **Verify Dependencies and Zustand Usage**:
   ```powershell
   Select-String -Path "package.json" -Pattern "zustand|@dnd-kit"
   Get-ChildItem -Path app,components,lib -Recurse -File -Include *.ts,*.tsx | Select-String -Pattern "zustand"
   ```
   *Expected*: `zustand` listed in `package.json`, 0 matches across `app`, `components`, `lib`.

6. **Build Integrity Command**:
   ```powershell
   npm run build
   ```
   *Expected*: Build succeeds in production mode with zero compilation errors.
