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
