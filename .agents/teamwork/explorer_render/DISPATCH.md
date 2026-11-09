# Task Assignment: Agent 4 (RENDER AND BUNDLE)

## Role & Scope
You are Agent 4 (Render and Bundle Diagnostic Explorer).
Your mission is to perform a comprehensive, read-only diagnostic investigation of first paint blockers, fonts, bundle sizes, client components, and Suspense boundaries across `/book/[year]/[month]`, `/enter`, and `/home`.

## Authoritative References
- Original Request: `c:\Users\aruko\OneDrive\Desktop\Documents\track\.agents\teamwork\ORIGINAL_REQUEST.md` (MUST read first)
- Scope Document: `c:\Users\aruko\OneDrive\Desktop\Documents\track\.agents\teamwork\orchestrator\SCOPE.md`

## Specific Requirements
1. Identify all factors blocking first paint on `/book/[year]/[month]`, `/enter`, and `/home`:
   - Blocking web fonts (`next/font` configuration, external stylesheets, FOUT/FOIT).
   - Large unoptimized images or SVGs.
   - Heavy client component trees and bundle overhead.
2. Check for missing `loading.tsx` or `<Suspense>` boundaries:
   - Does `/book/[year]/[month]` have a `loading.tsx`?
   - Does the root or route layout stream shell HTML or block until all promises resolve?
3. Find anything that forces `/book/[year]/[month]` to render fully on the client before painting:
   - Look for `"use client"` at page level.
   - Client-side checks like `typeof window !== 'undefined'`, `useEffect` guards, or `mounted` state guards where the component renders a blank/fallback container until hydration.
   - Left page showing "blank navy board, cover says LOCKED, nothing else painted" — what renders this blank navy board and "LOCKED"?
4. For Problems A and D:
   - Problem A: Why does `/book/[year]/[month]` take ~8 seconds to paint?
   - Problem D: What blocks the first paint on each route?
5. Provide exact `file:line` citations for every finding.
6. Provide estimated seconds lost for each identified rendering bottleneck.
7. Propose concrete, minimal fixes for each identified issue.

## Strict Constraints
- READ-ONLY. DO NOT edit, create, or delete any source code files. Write ONLY to your working directory `.agents/teamwork/explorer_render/`.
- Do NOT run commands that write outside the project folder, deploy, commit, or change env vars/database.
- Provide structured report in `handoff.md` in your working directory.

## 2026-11-09T11:33:15Z
[Message] timestamp=2026-11-09T11:33:15Z sender=df6f5e88-93d9-4942-a902-225353c55e9a priority=MESSAGE_PRIORITY_HIGH
Mission: Look for blocking fonts, large images, heavy client components, missing loading.tsx or Suspense boundaries, and anything forcing /book/[year]/[month] to render fully on client before painting (left page blank navy board, cover says LOCKED).
Identify file:line evidence for Problem A and D.
Estimated seconds lost for each issue, and proposed fixes.
Write your complete structured findings and handoff report to: c:\Users\aruko\OneDrive\Desktop\Documents\track\.agents\teamwork\explorer_render\handoff.md
Update your progress in: c:\Users\aruko\OneDrive\Desktop\Documents\track\.agents\teamwork\explorer_render\progress.md
When done, message the orchestrator (conversation ID: df6f5e88-93d9-4942-a902-225353c55e9a) to report completion.
STRICT CONSTRAINT: READ-ONLY. DO NOT edit or create any source code files.
