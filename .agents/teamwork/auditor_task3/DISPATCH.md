# Task 3 Audit Instructions

## Target
Perform a strict read-only audit of Task 3: Cover-to-Book Transition & Loading UI.
Working Directory: .agents/teamwork/auditor_task3/
Original Request: .agents/teamwork/ORIGINAL_REQUEST.md

## Scope & Target Files to Audit
1. `app/home/loading.tsx`:
   - Check if desk skeleton with handwritten "turning the page..." is present and authentic.
   - Verify markup, font classes, and styling (no generic SaaS spinners).
   - Cite exact file:line.
2. `app/enter/loading.tsx`:
   - Check if closed-book skeleton is present and authentic.
   - Verify markup and styling.
   - Cite exact file:line.
3. `components/book/ClosedBook.tsx`:
   - Check if navigation is wrapped in `React.startTransition`.
   - Verify unmounting behavior and transition initiation.
   - Cite exact file:line.
4. `components/book/OpenBook.tsx`:
   - Check if `window.location.replace` was replaced with `router.replace('/enter')`.
   - Check how locking the book behaves: does it transition smoothly without frozen blank navy board?
   - Check if left page `opacity-0` flash is prevented.
   - Cite exact file:line.
5. `app/layout.tsx`:
   - Check if `Cormorant_Garamond` is preloaded in `<head>` to prevent FOIT (Flash of Invisible Text).
   - Verify font loading and CSS variables.
   - Cite exact file:line.

## Mandatory Deliverable
Write your comprehensive audit findings to `.agents/teamwork/auditor_task3/handoff.md` and send a summary message back to orchestrator.
Mark each Done When criterion as PASS, FAIL, or PARTIAL with exact file:line citations and code snippets:
- [ ] Sign-in on /enter is verified to unmount /enter immediately and display app/home/loading.tsx without 10-second freeze.
- [ ] Zero spinners during navigation; authentic handwritten "turning the page..." is verified.
- [ ] Locking the book is verified to transition smoothly without frozen blank navy board.

IMPORTANT: Strictly read-only. Do not edit, create, or delete any source code or repo files!


## 2026-11-09T15:07:02Z
Read .agents/teamwork/auditor_task3/DISPATCH.md and .agents/teamwork/ORIGINAL_REQUEST.md. Your working directory is .agents/teamwork/auditor_task3/. Perform a strict read-only forensic audit of Task 3: Cover-to-Book Transition & Loading UI.
Target files to inspect:
- app/home/loading.tsx (desk skeleton with handwritten "turning the page...")
- app/enter/loading.tsx (closed-book skeleton)
- components/book/ClosedBook.tsx (wrap navigation in React.startTransition; immediate unmount of /enter)
- components/book/OpenBook.tsx (replace window.location.replace with router.replace('/enter'); prevent left page opacity-0 flash; locking transition)
- app/layout.tsx (preload Cormorant_Garamond in <head> to prevent FOIT)

Evaluate all Done When criteria and mark each PASS, FAIL, or PARTIAL:
- Sign-in on /enter is verified to unmount /enter immediately and display app/home/loading.tsx without 10-second freeze
- Zero spinners during navigation; authentic handwritten "turning the page..." is verified
- Locking the book is verified to transition smoothly without frozen blank navy board

Include exact file:line citations and code snippets for all items.
Write your report to .agents/teamwork/auditor_task3/handoff.md and call send_message back to orchestrator.
Do NOT modify any files in the codebase!
