# BRIEFING — 2026-11-09T17:21:30Z

## Mission
Trace sign-in click -> /enter -> /home -> /book/[year]/[month], analyze all auth checks, redirects, and awaited navigation calls, and diagnose root causes for Problems A, B, and D with file:line evidence.

## 🔒 My Identity
- Archetype: explorer
- Roles: Auth and Routing Diagnostic Explorer
- Working directory: c:\Users\aruko\OneDrive\Desktop\Documents\track\.agents\teamwork\explorer_auth
- Original parent: df6f5e88-93d9-4942-a902-225353c55e9a
- Milestone: TASK 14-DIAG

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Do NOT edit or create any source code files
- Only write to .agents/teamwork/explorer_auth/
- Rely on file:line evidence for all findings

## Current Parent
- Conversation ID: df6f5e88-93d9-4942-a902-225353c55e9a
- Updated: not yet

## Investigation State
- **Explored paths**: `proxy.ts`, `app/page.tsx`, `app/enter/page.tsx`, `app/home/page.tsx`, `app/book/[year]/[month]/page.tsx`, `app/book/[year]/[month]/loading.tsx`, `app/layout.tsx`, `app/sw.ts`, `components/desk/PublicDesk.tsx`, `components/book/ClosedBook.tsx`, `components/desk/HomeDesk.tsx`, `components/desk/ClosedBookDesk.tsx`, `components/book/OpenBook.tsx`, `components/book/MobileBook.tsx`, `components/setup/setupActions.ts`, `lib/supabase/auth.ts`, `lib/supabase/server.ts`, `lib/supabase/client.ts`, `lib/offlineSync.ts`.
- **Key findings**:
  1. Duplicate external auth verification: `proxy.ts:34` calls `supabase.auth.getUser()`, and then `app/home/page.tsx:9` or `app/book/[year]/[month]/page.tsx:57` calls `supabase.auth.getUser()` a SECOND time (~450ms - 1800ms redundant penalty per route).
  2. Hardcoded artificial animation delay before navigation: `ClosedBook.tsx:129` awaits `setTimeout(..., 900)` before `router.push('/home')`; `ClosedBookDesk.tsx:56` awaits `setTimeout(..., 900)` before `router.push(targetUrl)` (900ms lost on each step).
  3. Client auth RTT: `signInWithPassword` in `lib/supabase/auth.ts:25` takes ~1,959ms from India to Tokyo.
  4. Two-pass hydration gates block first paint: `HomeDesk.tsx:101-108` (`isMobile === null`) and `OpenBook.tsx:785-796` (`isDesktop === null`) render empty `<div />` placeholders during SSR and initial client mount (~800ms - 1500ms).
  5. Problem A ("Left page is a blank navy board, cover says LOCKED"): `OpenBook.tsx:1030-1033` (left page `opacity-0` reveals `bg-ink` navy casing) and `OpenBook.tsx:1161-1205` (`animate-reverse-cover-close` with "LOCKED") during `isClosing: true`, which freezes while awaiting slow `signOut()` network call and `window.location.replace('/enter')` navigation reload.
  6. Problem B ("Why does /enter stay open for ~10s before /home appears"): Cumulative serial sum of client `signInWithPassword` (~2.0s) + artificial `setTimeout(900)` (0.9s) + proxy auth check (~0.5s - 1.8s) + page auth check (~0.5s - 1.8s) + Vercel cold transit (~1.5s - 2.5s) + client hydration and 2-pass paint (~1.0s) = ~6.5s to 10.2s.
  7. Problem B / C Spinner: Code audit confirms ZERO spinner in `ClosedBook.tsx` or `app/enter` (commit `PROJECT_STATE.md:221` removed all spinners; button says "turning the page...").
- **Unexplored areas**: None within the assigned auth and routing stream.

## Key Decisions Made
- Fully documented all 8 categories of findings with exact file:line evidence, estimated seconds lost, proposed fixes, and network tab measurement guide.

## Artifact Index
- `DISPATCH.md` — Task assignment and message history
- `BRIEFING.md` — Persistent working memory
- `progress.md` — Liveness heartbeat
- `handoff.md` — Authoritative 5-component handoff report
