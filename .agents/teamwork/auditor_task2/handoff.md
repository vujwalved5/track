# Forensic Audit Report: Task 2 — Closed-Book 3D Animation & Geometry

**Auditor Archetype**: Forensic Auditor  
**Integrity Mode**: Demo (per `ORIGINAL_REQUEST.md:80`)  
**Scope**: Verification of Task 2 implementation across `components/book/ClosedBook.tsx`, `components/desk/ClosedBookDesk.tsx`, and `app/globals.css`.  
**Overall Verdict**: **PARTIALLY COMPLIANT** (4 PASS, 1 PARTIAL) — No integrity violations or fabricated mocks detected; however, navigation dispatch concurrency is only partially met due to an artificial 500ms `setTimeout` remaining in place of 0ms immediate concurrent dispatch.

---

## 1. Observation

### Observation 1: Cover Rotation Target & Flat Geometry
#### `components/book/ClosedBook.tsx`
- **Line 162**: Perspective container sets `perspective: '1800px'` and dimensions `sm:w-[520px] sm:h-[700px]`:
  ```tsx
  <div
    className="relative w-[min(520px,calc(100vw-32px))] h-[min(700px,calc((100vw-32px)*700/520))] aspect-[520/700] sm:aspect-auto sm:w-[520px] sm:h-[700px]"
    style={{ perspective: '1800px' }}
  >
  ```
- **Lines 205-215**: Hinged front cover rotates around `left center` to `rotateY(-180deg)`:
  ```tsx
  {/* 3D Hinged Front Cover */}
  <div
    className="absolute inset-y-0 left-0 w-[calc(100%-8px)] sm:w-[calc(100%-10px)] rounded-r-2xl sm:rounded-r-3xl z-20 motion-reduce:transition-none motion-reduce:transform-none"
    style={{
      transformOrigin: 'left center',
      transformStyle: 'preserve-3d',
      transform: isOpening ? 'rotateY(-180deg)' : 'rotateY(0deg)',
      transition: 'transform 1100ms cubic-bezier(0.22, 0.8, 0.2, 1)',
      boxShadow: isOpening
        ? '-12px 14px 35px rgba(0, 0, 0, 0.7)'
        : '8px 12px 28px rgba(0, 0, 0, 0.55)',
    }}
  >
  ```
- **Lines 369-376**: Inside facing endpaper rotated `rotateY(180deg)` with `backfaceVisibility: 'hidden'`:
  ```tsx
  {/* Inside facing endpaper of front cover when swung open */}
  <div
    className="absolute inset-0 rounded-l-2xl sm:rounded-l-3xl bg-paper overflow-hidden pointer-events-none"
    style={{
      transform: 'rotateY(180deg)',
      backfaceVisibility: 'hidden',
      boxShadow: 'inset -24px 0 28px -10px rgba(28, 36, 51, 0.25)',
    }}
    aria-hidden="true"
  >
  ```

#### `components/desk/ClosedBookDesk.tsx`
- **Lines 93-98**: Perspective container sets `perspective: '1800px'`:
  ```tsx
  className={`relative group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlighter focus-visible:ring-offset-4 focus-visible:ring-offset-desk rounded-r-2xl transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99] text-left p-0 border-0 bg-transparent ${
    isMobile
      ? 'w-[180px] h-[240px]'
      : 'w-[360px] h-[480px] lg:w-[400px] lg:h-[530px]'
  }`}
  style={{ perspective: '1800px' }}
  ```
- **Lines 144-155**: Hinged front cover rotates around `left center` to `rotateY(-180deg)`:
  ```tsx
  {/* 3D Hinged Front Cover */}
  <div
    className="absolute inset-y-0 left-0 w-[calc(100%-6px)] rounded-r-2xl z-20 motion-reduce:transition-none motion-reduce:transform-none"
    style={{
      transformOrigin: 'left center',
      transformStyle: 'preserve-3d',
      transform: isOpening ? 'rotateY(-180deg)' : 'rotateY(0deg)',
      transition: 'transform 1100ms cubic-bezier(0.22, 0.8, 0.2, 1)',
      boxShadow: isOpening
        ? '-12px 14px 35px rgba(0, 0, 0, 0.7)'
        : '8px 12px 28px rgba(0, 0, 0, 0.55)',
    }}
  >
  ```
- **Lines 247-254**: Inside facing endpaper rotated `rotateY(180deg)` with `backfaceVisibility: 'hidden'`:
  ```tsx
  {/* Inside facing endpaper of front cover when swung open */}
  <div
    className="absolute inset-0 rounded-l-2xl bg-paper overflow-hidden pointer-events-none"
    style={{
      transform: 'rotateY(180deg)',
      backfaceVisibility: 'hidden',
      boxShadow: 'inset -24px 0 28px -10px rgba(28, 36, 51, 0.25)',
    }}
    aria-hidden="true"
  >
  ```

---

### Observation 2: Zero Trapezoid Skew
- In both `components/book/ClosedBook.tsx` (line 210) and `components/desk/ClosedBookDesk.tsx` (line 149), the opening rotation targets `rotateY(-180deg)`.
- Grep search for `skew` across `components/` returned 0 matches:
  `grep_search(Query: "skew", SearchPath: "components")` -> `No results found`.
- In 3D geometry, when a planar element is rotated around a vertical axis by $-180^\circ$ from an initial position of $0^\circ$ at $z = 0$, every point $(x, y, 0)$ is transformed to $(-x, y, 0)$. Because the $z$-displacement is $z = 0$ along the entire surface, no perspective distortion occurs. The scale factor is $S = \frac{d}{d - z} = \frac{1800}{1800 - 0} = 1.0$.

---

### Observation 3: Navigation Dispatch Concurrency & `setTimeout`
#### `components/book/ClosedBook.tsx`
- **Lines 57-58 & 111-112**: Viewport prefetch is called immediately upon form submit:
  ```tsx
  setIsSubmitting(true)
  router.prefetch('/home')
  ```
- **Lines 79-91** (sign-up flow):
  ```tsx
  setIsOpening(true)
  if (prefersReducedMotion) {
    setIsReducedMotion(true)
    setTimeout(() => {
      router.push(targetUrl)
    }, 200)
    return
  }

  // Start router.push ~500ms into the swing
  setTimeout(() => {
    router.push(targetUrl)
  }, 500)
  ```
- **Lines 130-142** (sign-in flow):
  ```tsx
  setIsOpening(true)
  if (prefersReducedMotion) {
    setIsReducedMotion(true)
    setTimeout(() => {
      router.push(targetUrl)
    }, 200)
    return
  }

  // Start router.push ~500ms into the swing
  setTimeout(() => {
    router.push(targetUrl)
  }, 500)
  ```

#### `components/desk/ClosedBookDesk.tsx`
- **Lines 47-65**:
  ```tsx
  router.prefetch(targetUrl)

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  setIsOpening(true)
  if (prefersReducedMotion) {
    setIsReducedMotion(true)
    setTimeout(() => {
      router.push(targetUrl)
    }, 200)
    return
  }

  // Start router.push ~500ms into the swing
  setTimeout(() => {
    router.push(targetUrl)
  }, 500)
  ```
- **Grep for `startTransition`**:
  `grep_search(Query: "startTransition", SearchPath: "components/book/ClosedBook.tsx")` -> `No results found`.
  `grep_search(Query: "startTransition", SearchPath: "components/desk/ClosedBookDesk.tsx")` -> `No results found`.

---

### Observation 4: Reduced Motion Compliance
#### `components/book/ClosedBook.tsx` & `components/desk/ClosedBookDesk.tsx`
- JavaScript detection:
  `window.matchMedia('(prefers-reduced-motion: reduce)').matches` checks the user OS setting.
- If reduced motion is requested:
  `isReducedMotion` state is set to `true`, `isOpening` triggers a 200ms opacity fade (`opacity-0 transition-opacity duration-200`), and `router.push` is called after 200ms.
- CSS Tailwind directive:
  Both components feature `motion-reduce:transition-none motion-reduce:transform-none` on the 3D cover container (`ClosedBook.tsx:206`, `ClosedBookDesk.tsx:145`).

#### `app/globals.css`
- **Lines 194-231**: Global reduced-motion media query disables animations and resets transition durations:
  ```css
  /* ── prefers-reduced-motion: disable all book animations ── */
  @media (prefers-reduced-motion: reduce) {
    .animate-page-flip-forward,
    .animate-page-flip-backward,
    .animate-shadow-under-left,
    .animate-shadow-under-right,
    .animate-leaf-shadow-forward,
    .animate-leaf-shadow-backward,
    .animate-reverse-cover-close,
    .animate-sandglass-tip,
    .animate-note-lift {
      animation: none !important;
      opacity: 1 !important;
      transform: none !important;
    }

    .animate-sheet-slide-in {
      animation: none;
      opacity: 1;
      transform: none;
    }

    .drawer-slide {
      transition: none;
    }

    *,
    *::before,
    *::after {
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      scroll-behavior: auto !important;
    }
  }
  ```

---

### Observation 5: Easing Curves in `app/globals.css` vs Components
- The cover opening transition curve `transition: 'transform 1100ms cubic-bezier(0.22, 0.8, 0.2, 1)'` is declared as an inline style on the elements in `ClosedBook.tsx:211` and `ClosedBookDesk.tsx:150`, rather than as a class inside `app/globals.css`.
- `app/globals.css` defines the reverse cover close animation at lines 140-154:
  ```css
  @keyframes reverseCoverClose {
    0% {
      transform: rotateY(-140deg);
    }
    100% {
      transform: rotateY(0deg);
    }
  }

  .animate-reverse-cover-close {
    animation: reverseCoverClose 900ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
    transform-origin: left center;
    transform-style: preserve-3d;
    will-change: transform;
  }
  ```
  *(Note: `animate-reverse-cover-close` is used during book lock in `OpenBook.tsx:1163` and `MobileBook.tsx:502`, not during the cover opening swing).*

---

### Observation 6: Production Build Verification
- Command executed: `npm run build`
- Result: **Exit code 0**
- Output trace:
  ```
  > node scripts/build-sw.js && next build
  sw.js built successfully! File size: 36442 bytes
  ▲ Next.js 16.4.5 (Turbopack)
  ✓ Compiled successfully in 720ms
  Finished TypeScript in 2.9s ...
  ✓ Generating static pages using 8 workers (6/6) in 1440ms
  Finalizing page optimization ...
  Route (app)
  ┌ ○ /
  ├ ○ /_not-found
  ├ ƒ /book/[year]/[month]
  ├ ○ /enter
  ├ ○ /home
  └ ○ /manifest.webmanifest
  ```

---

## 2. Logic Chain

1. **Cover Rotation Flatness**:
   - In `ClosedBook.tsx:210` and `ClosedBookDesk.tsx:149`, the end-state transform is explicitly `rotateY(-180deg)`.
   - The left hinge is the origin (`transformOrigin: 'left center'`).
   - For an angle $\theta = -180^\circ$, $\sin(-180^\circ) = 0$ and $\cos(-180^\circ) = -1$.
   - The outer edge $z$-coordinate is $z = -w \cdot \sin(-180^\circ) = 0$.
   - Because $z = 0$, perspective scale $S = \frac{1800}{1800 - 0} = 1.0$.
   - Therefore, the height at the outer edge is $700\text{px} \times 1.0 = 700\text{px}$, perfectly matching the hinge height with zero magnification.
   - Criterion 1 is supported: **PASS**.

2. **Trapezoid Skew Elimination**:
   - The prior trapezoid distortion occurred because the cover stopped at $\theta = -140^\circ$, which left the edge at $z = +327.8\text{px}$, creating a $+22.3\%$ perspective magnification ($856\text{px}$ vs $700\text{px}$).
   - With $\theta = -180^\circ$, the edge rests at $z = 0$, coplanar with the desk/spine.
   - No skew transforms exist in CSS or JSX.
   - Criterion 2 is supported: **PASS**.

3. **Navigation Dispatch Concurrency**:
   - The original issue was an artificial 900ms `setTimeout` hold before calling `router.push('/home')`.
   - The team eliminated the 900ms delay and added `router.prefetch`.
   - However, instead of dispatching concurrently with cover animation (0ms delay / immediate dispatch alongside `setIsOpening(true)` or via `React.startTransition`), the implementation explicitly inserts a new `setTimeout` of **500ms** (`// Start router.push ~500ms into the swing`) in `ClosedBook.tsx` (lines 89, 140) and `ClosedBookDesk.tsx` (line 63).
   - In addition, under reduced motion, navigation is delayed by 200ms (`setTimeout(..., 200)`).
   - Therefore, while the artificial 900ms delay was eliminated, the requirement "Navigation is verified to dispatch concurrently with cover animation (0ms delay)" is **not fully satisfied**; it is delayed by 500ms.
   - Criterion 3 is supported: **PARTIAL**.

4. **prefers-reduced-motion**:
   - In `app/globals.css:194-231`, `@media (prefers-reduced-motion: reduce)` zeroes out all keyframe animations (`animation: none !important`) and sets `transition-duration: 0.01ms !important`.
   - In both `ClosedBook.tsx` and `ClosedBookDesk.tsx`, `motion-reduce:transition-none motion-reduce:transform-none` is applied to the 3D cover, and `window.matchMedia` bypasses the 3D rotation, substituting a smooth 200ms opacity fade.
   - Criterion 4 is supported: **PASS**.

5. **Build Status**:
   - `npm run build` executed synchronously through completion with exit code 0.
   - Criterion 5 is supported: **PASS**.

---

## 3. Caveats

- **Location of Easing Curve**: The prompt references `app/globals.css (smooth 2-stage cubic-bezier easing for cover swing)`. In the actual codebase, the cover swing curve (`cubic-bezier(0.22, 0.8, 0.2, 1)`) is implemented as an inline style on the elements in `ClosedBook.tsx:211` and `ClosedBookDesk.tsx:150`, while `app/globals.css:150` houses the reverse closing keyframe `reverseCoverClose` (`cubic-bezier(0.4, 0, 0.2, 1)`). Both curves function smoothly in their respective contexts.
- **500ms vs 0ms Intent**: The team introduced the 500ms delay intentionally so that the visual cover swing gets halfway through its 1100ms arc before Next.js page unmounting/transition takes over. While visually plausible, the explicit Done When specification mandated `0ms delay / artificial 900ms setTimeout eliminated`. Hence, it must strictly be marked PARTIAL.

---

## 4. Conclusion

The forensic audit of Task 2 confirms high-quality implementation of the 3D geometry and reduced motion support, with zero integrity violations or dummy facades. The trapezoid distortion is completely resolved by rotating to flat $-180^\circ$ ($S = 1.0$). 

The sole deviation from the Done When criteria is that `router.push` is delayed by 500ms rather than being dispatched at 0ms concurrently with the animation start.

### Done When Scorecard

| Criterion | Status | Evidence (`file:line`) | Notes |
|:---|:---:|:---|:---|
| **Cover rotation target is verified to rotate fully flat to -180deg (S = 1.0, height matches hinge at 700px)** | **PASS** | `components/book/ClosedBook.tsx:210`<br>`components/desk/ClosedBookDesk.tsx:149` | Both components target `rotateY(-180deg)`. At $-180^\circ$, $z = 0$, $S = 1.0$, height equals hinge height (700px on /enter, 480/530px on /home). |
| **Zero trapezoid skew is verified on both /enter and /home closed books** | **PASS** | `components/book/ClosedBook.tsx:205-215`<br>`components/desk/ClosedBookDesk.tsx:144-155` | 0 skew rules exist. Coplanar landing at $z = 0$ eliminates all perspective magnification distortion. |
| **Navigation is verified to dispatch concurrently with cover animation (0ms delay / artificial 900ms setTimeout eliminated)** | **PARTIAL** | `components/book/ClosedBook.tsx:89-91, 140-142`<br>`components/desk/ClosedBookDesk.tsx:62-65` | 900ms setTimeout was removed; `router.prefetch` fires at 0ms. However, `router.push` is artificially delayed by **500ms** (`setTimeout(..., 500)`) instead of 0ms concurrency. |
| **prefers-reduced-motion is verified to be strictly respected** | **PASS** | `app/globals.css:194-231`<br>`components/book/ClosedBook.tsx:75-86, 206`<br>`components/desk/ClosedBookDesk.tsx:49-60, 145` | Global `@media (prefers-reduced-motion: reduce)` resets all durations to 0.01ms; components use `motion-reduce:transition-none` and JS opacity fade fallback. |
| **npm run build is executed and verified to succeed with exit code 0** | **PASS** | Terminal execution | Clean build with zero TypeScript or Turbopack errors; exit code 0. |

---

## 5. Verification Method

To independently verify these findings:
1. **Verify rotation target**:
   ```bash
   grep -n "rotateY(-180deg)" components/book/ClosedBook.tsx components/desk/ClosedBookDesk.tsx
   ```
2. **Verify 500ms delay in place of 0ms**:
   ```bash
   grep -n -C 3 "setTimeout" components/book/ClosedBook.tsx components/desk/ClosedBookDesk.tsx
   ```
3. **Verify reduced motion CSS rules**:
   ```bash
   grep -n -A 35 "prefers-reduced-motion" app/globals.css
   ```
4. **Execute local build**:
   ```bash
   npm run build
   ```
