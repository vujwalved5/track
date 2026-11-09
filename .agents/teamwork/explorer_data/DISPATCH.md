# Task Assignment: Agent 2 (DATA & SUPABASE)

## Role & Scope
You are Agent 2 (Data and Supabase Diagnostic Explorer).
Your mission is to perform a comprehensive, read-only diagnostic investigation of all data fetching and Supabase queries across `/enter`, `/home`, and `/book/[year]/[month]`.

## Authoritative References
- Original Request: `c:\Users\aruko\OneDrive\Desktop\Documents\track\.agents\teamwork\ORIGINAL_REQUEST.md` (MUST read first)
- Scope Document: `c:\Users\aruko\OneDrive\Desktop\Documents\track\.agents\teamwork\orchestrator\SCOPE.md`

## Specific Requirements
1. Catalog every Supabase query across `/enter`, `/home`, and `/book/[year]/[month]`.
2. For each query:
   - Is it server-side or client-side?
   - What data/parameters does it depend on?
   - Does it run sequentially or in parallel?
3. Flag critical performance issues:
   - Waterfalls (query A must finish before query B starts)
   - Queries inside `useEffect` or client-side lifecycle hooks
   - Repeated `getUser` or `getSession` calls across layers
   - Missing database indexes or inefficient queries
   - Queries fetching widgets, entries, or setup state after initial mount
4. Check and report any Vercel region configuration in the repo (e.g. `vercel.json`, route segment config `export const preferredRegion = ...`, or absence thereof causing US-East vs DB region cross-continental latency).
5. For Problems A, B, C, D:
   - Problem A: Why does `/book/[year]/[month]` take ~8s to paint?
   - Problem B: Why does `/enter` stay open for ~10s before `/home` appears?
   - Problem D: What blocks first paint?
   Quantify estimated seconds lost due to data fetching waterfalls and latency.
6. Provide exact `file:line` citations for every finding.
7. Provide estimated seconds lost for each identified issue.
8. Propose concrete, minimal fixes for each identified issue.

## Strict Constraints
- READ-ONLY. DO NOT edit, create, or delete any source code files. Write ONLY to your working directory `.agents/teamwork/explorer_data/`.
- Do NOT run commands that write outside the project folder, deploy, commit, or change env vars/database.
- Provide structured report in `handoff.md` in your working directory.


## 2026-11-09T11:32:36Z
You are Agent 2 (Data and Supabase Diagnostic Explorer).
Your working directory is: c:\Users\aruko\OneDrive\Desktop\Documents\track\.agents\teamwork\explorer_data\
Read your task assignment at: c:\Users\aruko\OneDrive\Desktop\Documents\track\.agents\teamwork\explorer_data\DISPATCH.md
MANDATORY: Read the authoritative user request at: c:\Users\aruko\OneDrive\Desktop\Documents\track\.agents\teamwork\ORIGINAL_REQUEST.md before starting work.
Also read the scope document at: c:\Users\aruko\OneDrive\Desktop\Documents\track\.agents\teamwork\orchestrator\SCOPE.md

Mission: List every Supabase query on /enter, /home, /book/[year]/[month]. For each: server or client side, what it depends on, sequential vs parallel. Flag waterfalls, queries in useEffect, repeated getUser calls, missing indexes, post-mount fetches. Report any Vercel region config found in repo.
Identify file:line evidence for Problem A, B, and D.
Estimated seconds lost for each issue, and proposed fixes.
Write your complete structured findings and handoff report to: c:\Users\aruko\OneDrive\Desktop\Documents\track\.agents\teamwork\explorer_data\handoff.md
Update your progress in: c:\Users\aruko\OneDrive\Desktop\Documents\track\.agents\teamwork\explorer_data\progress.md
When done, message the orchestrator (conversation ID: df6f5e88-93d9-4942-a902-225353c55e9a) to report completion.
STRICT CONSTRAINT: READ-ONLY. DO NOT edit or create any source code files.
