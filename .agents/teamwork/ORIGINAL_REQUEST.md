# Original User Request

## Approved Task Prompt — 2026-11-09T11:25:50Z

Run these four agents in PARALLEL, all read-only, to diagnose slow loading and clumsy animation on track-vujwal.vercel.app (/book/[year]/[month], /enter, /home), then have the lead agent merge the reports into a consolidated findings table and fix plan.

Working directory: c:\Users\aruko\OneDrive\Desktop\Documents\track
Integrity mode: development
The team must NOT: edit, create, or delete any file except PROJECT_STATE.md; run any command that writes outside the project folder, deploys, commits, or changes env vars or the database; fix anything, redesign anything, add packages, or start the fix plan.

## Requirements

### R1. Parallel Diagnostic Investigation of Four Problem Areas
Run four agents in PARALLEL, all read-only, each providing evidence as file and line number:
- Problem A: Why does /book/[year]/[month] take about 8 seconds to paint? (Left page is a blank navy board, cover says "LOCKED", nothing else painted).
- Problem B: Why does /enter stay open for about 10 seconds before /home appears? (Cover swings open and stays with a lone spinner on the right page).
- Problem C: Why does the open cover look like a trapezoid, and why is the spinner there? (Analyze rotateY, skew, perspective, missing end state, and where the spinner is rendered).
- Problem D: What blocks the first paint on each route?

The four investigative streams:
- Agent 1, AUTH AND ROUTING: Trace sign-in click -> /enter -> /home -> /book/[year]/[month]. List every place auth is checked (middleware, layout, page, client), every redirect, every router.push or router.replace, and anything awaited before navigation.
- Agent 2, DATA: List every Supabase query on those routes. For each: server or client side, what it depends on, and whether it runs sequentially or in parallel. Flag waterfalls, queries inside useEffect, repeated getUser calls, missing indexes, and anything that fetches widgets or entries after mount. Report any Vercel region config found in the repo.
- Agent 3, ANIMATION: Find the cover-open animation, the page turn and the loading UI. List every timer, transitionend or animationend wait, setTimeout, and awaited promise that the animation depends on. Identify what makes the left page a trapezoid (rotateY, skew, perspective, missing end state) and where the spinner is rendered.
- Agent 4, RENDER AND BUNDLE: Look for blocking fonts, large images, heavy client components, missing loading.tsx or Suspense boundaries, and anything that forces /book/[year]/[month] to render fully on the client before painting.

### R2. Timing Measurements
- For timings, do NOT use local npm run build / npm start as the main measurement. Local timings will not show the Vercel to Supabase delay.
- Measure public pages directly on the deployed site (track-vujwal.vercel.app) using browser automation.
- For authenticated routes (/enter -> /home -> /book), provide exact steps to read timings in the browser Network tab (specifying which requests to look at and which columns).

### R3. Consolidated Diagnostic Report & Fix Plan
The lead agent merges the four reports into ONE table:
| Problem (A to D) | Root cause | Evidence (file:line) | Estimated seconds lost | Proposed fix |

The lead agent must finish with:
(a) The top 3 causes ranked by seconds lost (only CONFIRMED causes may be ranked in the top 3).
(b) A fix plan split into separate tasks (speed, closed-book animation, cover-to-book transition), each small enough to run as one prompt, with files to touch and a "Done when" list.
(c) Any assumptions made.
(d) Deviation report: "None" or details.
(e) Update PROJECT_STATE.md with the diagnostic summary, status, and next steps.

### R4. Read-Only Scope and Execution Constraints
- THIS TASK IS READ-ONLY. DO NOT EDIT, CREATE OR DELETE ANY FILE EXCEPT PROJECT_STATE.md.
- Do not run any command that writes outside the project folder, deploys, commits, or changes env vars or the database.
- DO NOT fix anything, redesign anything, add packages, or start the fix plan until the user types GO.

## Acceptance Criteria

### Diagnostic Coverage & Code Evidence
- [ ] Root causes for Problems A, B, C, and D are identified with specific file:line citations in the repository.
- [ ] Agent 1 report covers every auth check (middleware, layout, page, client), redirect, router navigation, and awaited call between sign-in click, /enter, /home, and /book/[year]/[month].
- [ ] Agent 2 report details every Supabase query on the target routes, classifying server vs client, sequential vs parallel, waterfalls, useEffect queries, repeated getUser calls, post-mount fetches, and any Vercel region configuration.
- [ ] Agent 3 report catalogs all timers, animation/transition waits, setTimeouts, awaited promises, identifies the CSS cause of the trapezoid distortion, and pinpoints where the spinner is rendered.
- [ ] Agent 4 report analyzes blocking fonts, images, client components, missing loading.tsx / Suspense boundaries, and client-side paint blocks.

### Performance Measurement
- [ ] Local build/start timings are NOT used as the main measurement.
- [ ] Public page timings are measured against the deployed site (track-vujwal.vercel.app).
- [ ] Exact manual browser Network tab measurement steps (which requests to inspect and which columns to check) are documented for authenticated routes.

### Deliverable Structure & Verification
- [ ] Consolidated diagnostic table is present with columns: Problem (A to D), Root cause, Evidence (file:line), Estimated seconds lost, Proposed fix.
- [ ] An independent auditor verifies each cited file:line in the repo and marks each root cause CONFIRMED (code evidence found), PLAUSIBLE (no direct evidence), or REJECTED (citation wrong).
- [ ] Top 3 causes ranked by seconds lost contain ONLY causes marked CONFIRMED.
- [ ] Fix plan is partitioned into separate tasks (speed, closed-book animation, cover-to-book transition), each with specific files to touch and checkable "Done when" criteria.
- [ ] Assumptions and deviation report ("None" or details) are provided.
- [ ] PROJECT_STATE.md is updated with the findings and status.

### Safety & Integrity Constraints
- [ ] No files in the codebase are created, edited, or deleted other than PROJECT_STATE.md.
- [ ] No commands write outside the project folder, deploy, commit, or change env vars or the database.
- [ ] No bug fixes, code modifications, redesigns, or package installations are executed.


## Approved Task Prompt — 2026-11-09T15:03:14Z

Use agents to check if the three tasks (Task 1: Speed, Infrastructure & Data Flow; Task 2: Closed-Book 3D Animation & Geometry; Task 3: Cover-to-Book Transition & Loading UI) have really been fixed. Perform a strict read-only verification / audit of whether the fixes were implemented correctly and completely against all target files and Done When criteria.

Working directory: c:\Users\aruko\OneDrive\Desktop\Documents\track
Integrity mode: demo
The team must NOT: modify or edit any codebase files (including PROJECT_STATE.md); self-certify criteria without citing concrete file:line evidence or verifying command output.

## Requirements

### R1. Verification of Task 1: Speed, Infrastructure & Data Flow
Audit whether Task 1 fixes were properly implemented across target files and check all Done When criteria:
- vercel.json (check if configured with regions: ["hnd1"])
- proxy.ts (check if forwarding x-user-id header or bypassing duplicate auth)
- app/home/page.tsx & app/book/[year]/[month]/page.tsx (check if reading x-user-id to skip redundant getUser(); combined books and entries queries)
- supabase/migrations/0003_optimize_rls_policies.sql (check if (select auth.uid()) is wrapped in policies)
- components/book/OpenBook.tsx & components/desk/HomeDesk.tsx (default isDesktop to true for SSR; eliminate empty-desk hydration lock)
- components/book/index.ts & components/widgets/index.ts (barrel export splitting)

### R2. Verification of Task 2: Closed-Book 3D Animation & Geometry
Audit whether Task 2 fixes were properly implemented across target files and check all Done When criteria:
- components/book/ClosedBook.tsx (check if rotation target changed to rotateY(-180deg) flat; eliminate artificial 900ms setTimeout)
- components/desk/ClosedBookDesk.tsx (check if rotation target changed to rotateY(-180deg) flat; eliminate 900ms setTimeout)
- app/globals.css (smooth 2-stage cubic-bezier easing for cover swing)

### R3. Verification of Task 3: Cover-to-Book Transition & Loading UI
Audit whether Task 3 fixes were properly implemented across target files and check all Done When criteria:
- app/home/loading.tsx (desk skeleton with handwritten "turning the page...")
- app/enter/loading.tsx (closed-book skeleton)
- components/book/ClosedBook.tsx (wrap navigation in React.startTransition)
- components/book/OpenBook.tsx (replace window.location.replace with router.replace('/enter'); prevent left page opacity-0 flash)
- app/layout.tsx (preload Cormorant_Garamond in <head> to prevent FOIT)

### R4. Verification Execution and Deliverable Format
- Execute local build and verification commands (`npm run build`, bundle inspection) in addition to static code inspection.
- The deliverable is a comprehensive verification audit report provided purely within the agent response.
- Do not create, edit, or delete any files in the workspace (including PROJECT_STATE.md); this run is strictly read-only.

## Acceptance Criteria

### Task 1 Done When Criteria
- [ ] vercel.json is verified to contain regions: ["hnd1"].
- [ ] Code logic in proxy.ts, app/home/page.tsx, and app/book/[year]/[month]/page.tsx is verified to execute exactly 1 supabase.auth.getUser() network call per protected request.
- [ ] Initial SSR HTML of /book/[year]/[month] is verified to contain <Paper> markup and textures (not empty #211b16 div).
- [ ] Client JS bundle size for /book is inspected and analyzed against the >=35% drop target.
- [ ] npm run build is executed and verified to succeed with exit code 0.

### Task 2 Done When Criteria
- [ ] Cover rotation target is verified to rotate fully flat to -180deg (S = 1.0, height matches hinge at 700px).
- [ ] Zero trapezoid skew is verified on both /enter and /home closed books.
- [ ] Navigation is verified to dispatch concurrently with cover animation (0ms delay / artificial 900ms setTimeout eliminated).
- [ ] prefers-reduced-motion is verified to be strictly respected.
- [ ] npm run build is executed and verified to succeed with exit code 0.

### Task 3 Done When Criteria
- [ ] Sign-in on /enter is verified to unmount /enter immediately and display app/home/loading.tsx without 10-second freeze.
- [ ] Zero spinners during navigation; authentic handwritten "turning the page..." is verified.
- [ ] Locking the book is verified to transition smoothly without frozen blank navy board.
- [ ] npm run build is executed and verified to succeed with exit code 0.

### Audit & Evidence Quality
- [ ] Every criterion is explicitly marked PASS, FAIL, or PARTIAL.
- [ ] Concrete file:line citations and current code snippets are provided for every evaluated item.
- [ ] Local npm run build output and status code are reported.
- [ ] Zero files in the repository are modified, created, or deleted (pure read-only report).
