# Scope: Diagnostic Investigation of Loading and Animation (TASK 14-DIAG)

## Overview
Perform parallel read-only investigation across four defined streams to diagnose slow loading (~8s on /book/[year]/[month], ~10s on /enter -> /home), clumsy 3D animation (trapezoid distortion, lone spinner), and first paint blockers on track-vujwal.vercel.app.

## Diagnostic Streams
1. **Agent 1: Auth & Routing**:
   - Trace sign-in click -> /enter -> /home -> /book/[year]/[month].
   - Enumerate all auth checks (middleware, layout, page, client), redirects, router.push/replace, awaited promises prior to navigation.
2. **Agent 2: Data & Supabase**:
   - Catalog all Supabase queries on target routes.
   - Server vs client classification, dependencies, sequential vs parallel execution.
   - Waterfalls, queries in useEffect, repeated getUser calls, missing indexes, post-mount fetches.
   - Vercel region configuration check.
3. **Agent 3: Animation & CSS/Spinner**:
   - Cover-open animation, page turn, loading UI.
   - All timers, transitionend/animationend listeners, setTimeout, awaited promises.
   - Cause of trapezoid distortion on left page (rotateY, skew, perspective, missing end state).
   - Location and render condition of the spinner.
4. **Agent 4: Render & Bundle**:
   - Blocking fonts, large images, heavy client components.
   - Missing loading.tsx / Suspense boundaries.
   - Factors forcing /book/[year]/[month] to render fully on client before painting.

## Output Deliverables
- Individual Explorer handoff reports with exact file:line citations.
- Deployed site timing measurements for public pages (track-vujwal.vercel.app) & manual network tab steps for authenticated routes.
- Independent auditor verification of every cited file:line (CONFIRMED / PLAUSIBLE / REJECTED).
- Consolidated diagnostic table (Problem, Root cause, Evidence, Estimated seconds lost, Proposed fix).
- Top 3 confirmed causes ranked by seconds lost.
- Modular fix plan with checkable "Done when" criteria.
- Update to PROJECT_STATE.md.
