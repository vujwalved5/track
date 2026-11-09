# Task 1 Audit Instructions

## Target
Perform a strict read-only audit of Task 1: Speed, Infrastructure & Data Flow.
Working Directory: .agents/teamwork/auditor_task1/
Original Request: .agents/teamwork/ORIGINAL_REQUEST.md

## Scope & Target Files to Audit
1. `vercel.json`:
   - Check if configured with `regions: ["hnd1"]`.
   - Provide exact file:line and content.
2. `proxy.ts`:
   - Check if forwarding `x-user-id` header or bypassing duplicate auth.
   - Trace how auth is performed and what headers are set on requests.
   - Cite exact file:line.
3. `app/home/page.tsx` & `app/book/[year]/[month]/page.tsx`:
   - Check if reading `x-user-id` to skip redundant `getUser()`.
   - Check if books and entries queries are combined or parallelized.
   - Verify if exactly 1 `supabase.auth.getUser()` network call occurs per protected request across proxy and pages.
   - Cite exact file:line.
4. `supabase/migrations/0003_optimize_rls_policies.sql`:
   - Check if `(select auth.uid())` is wrapped in policies.
   - Verify policy definitions and query execution plan impact.
   - Cite exact file:line.
5. `components/book/OpenBook.tsx` & `components/desk/HomeDesk.tsx`:
   - Check if `isDesktop` defaults to `true` for SSR.
   - Check if empty-desk hydration lock is eliminated.
   - Check if initial SSR HTML of `/book/[year]/[month]` contains `<Paper>` markup and textures (not empty `#211b16` div).
   - Cite exact file:line.
6. `components/book/index.ts` & `components/widgets/index.ts`:
   - Check barrel export splitting and whether components are cleanly imported or split to prevent heavy bundle bloat.
   - Analyze client JS bundle size reduction for `/book` against the >=35% drop target.
   - Cite exact file:line.

## Mandatory Deliverable
Write your comprehensive audit findings to `.agents/teamwork/auditor_task1/handoff.md` and send a summary message back to orchestrator.
Mark each Done When criterion as PASS, FAIL, or PARTIAL with exact file:line citations and code snippets:
- [ ] vercel.json is verified to contain regions: ["hnd1"].
- [ ] Code logic in proxy.ts, app/home/page.tsx, and app/book/[year]/[month]/page.tsx is verified to execute exactly 1 supabase.auth.getUser() network call per protected request.
- [ ] Initial SSR HTML of /book/[year]/[month] is verified to contain <Paper> markup and textures (not empty #211b16 div).
- [ ] Client JS bundle size for /book is inspected and analyzed against the >=35% drop target.

IMPORTANT: Strictly read-only. Do not edit, create, or delete any source code or repo files!


## 2026-11-09T15:06:49Z
Read .agents/teamwork/auditor_task1/DISPATCH.md and .agents/teamwork/ORIGINAL_REQUEST.md. Your working directory is .agents/teamwork/auditor_task1/. Perform a strict read-only forensic audit of Task 1: Speed, Infrastructure & Data Flow.
Target files to inspect:
- vercel.json (check if configured with regions: ["hnd1"])
- proxy.ts (check if forwarding x-user-id header or bypassing duplicate auth)
- app/home/page.tsx & app/book/[year]/[month]/page.tsx (check if reading x-user-id to skip redundant getUser(); combined books and entries queries)
- supabase/migrations/0003_optimize_rls_policies.sql (check if (select auth.uid()) is wrapped in policies)
- components/book/OpenBook.tsx & components/desk/HomeDesk.tsx (default isDesktop to true for SSR; eliminate empty-desk hydration lock)
- components/book/index.ts & components/widgets/index.ts (barrel export splitting)

Evaluate all Done When criteria and mark each PASS, FAIL, or PARTIAL:
- vercel.json contains regions: ["hnd1"]
- Code logic in proxy.ts, app/home/page.tsx, and app/book/[year]/[month]/page.tsx executes exactly 1 supabase.auth.getUser() network call per protected request
- Initial SSR HTML of /book/[year]/[month] contains <Paper> markup and textures (not empty #211b16 div)
- Client JS bundle size for /book inspected and analyzed against >=35% drop target

Include exact file:line citations and code snippets for all items.
Write your report to .agents/teamwork/auditor_task1/handoff.md and call send_message back to orchestrator.
Do NOT modify any files in the codebase!
