## 2026-11-08T15:12:03Z
Sender: d182f0bb-01fa-45ed-9815-336f98e5e38b
Priority: MESSAGE_PRIORITY_HIGH

You are Agent A (Data Specialist) for the "Memorable Moments" digital journal optimization.
Your working directory is: c:\Users\aruko\OneDrive\Desktop\Documents\track\.agents\teamwork\agent_a\
Your parent is orchestrator: d182f0bb-01fa-45ed-9815-336f98e5e38b

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MANDATORY: Read the authoritative request at:
c:\Users\aruko\OneDrive\Desktop\Documents\track\.agents\teamwork\ORIGINAL_REQUEST.md
Also read GEMINI.md (locked decisions L1 to L14), PROJECT_STATE.md, and OPTIMISATION_PLAN.md before starting work.

CRITICAL GIT REQUIREMENT:
- You must work on branch `optimise`.
- As your very first action, run: `git checkout -B optimise` to ensure the repository is on branch `optimise`.
- When all your work is complete, produce ONE clean git commit for your task: `git add <your files>` and commit with descriptive message.

STRICT FILE OWNERSHIP (You may ONLY edit or create these files — DO NOT touch any other files):
- `app/book/[year]/[month]/page.tsx`
- `components/setup/setupActions.ts`
- Widgets that fetch entries on mount (e.g. `components/widgets/HabitGridWidget.tsx`, `components/widgets/NumberLogWidget.tsx`, `components/widgets/PollWidget.tsx`, `components/widgets/DailyListWidget.tsx`, etc. — inspect widgets to find which ones fetch entries on mount)
- `entryHelpers.ts` (or wherever entry fetching helper lives, check `lib/entryHelpers.ts` or similar)
- `supabase/migrations/0002_add_widgets_month_id_index.sql`
- `PLAN_A.md` (at project root)
- `HANDOFF.md` (at project root)
- Files in your working directory `.agents/teamwork/agent_a/`

TASK REQUIREMENTS (Fix 1 and Fix 4):
1. In `app/book/[year]/[month]/page.tsx`:
   - Call `getUser()` once and redirect to `/` if there is no authenticated user.
   - Run previous-month and current-month fetches in `Promise.all` using `user.id`.
   - Use ONE nested relational query for books, months, and widgets (no `!inner`).
   - If an unset month (e.g. December 2026), default to `setup_done=false`, dotted/dotted paper, and no widgets, ensuring the 7-step wizard launches (The Month Setup wizard has 7 steps; do not alter the wizard flow).
   - Sort widgets by `created_at` ascending.
   - Fetch all entries in ONE query: `.in('widget_id', widgetIds)` and pass down as `initialEntries`.
2. In widgets that fetch entries on mount:
   - Accept initial data / initial entries and NO LONGER fetch entries on mount.
   - Ensure they continue to update after edits/mutations.
3. In `supabase/migrations/0002_add_widgets_month_id_index.sql`:
   - Create migration for `idx_widgets_month_id` (`CREATE INDEX IF NOT EXISTS idx_widgets_month_id ON widgets(month_id);`).
4. Write your plan to `PLAN_A.md` in the project root first, then build immediately. Do not stop for GO approvals unless something conflicts with L1-L14 or code no longer matches plan line numbers. Place any unrequested ideas under "Ideas (not built)".
5. Before completing, write `HANDOFF.md` in the project root detailing the exact `initialEntries` prop plumbing signature and TypeScript types so Agent D can seamlessly wire it into OpenBook/MobileBook.
6. Run `npm run build` to verify there are zero build/TypeScript errors.
7. Commit your changes to git on branch `optimise`.
8. Write your completion report to `c:\Users\aruko\OneDrive\Desktop\Documents\track\.agents\teamwork\agent_a\handoff.md`.
9. Send a message to orchestrator (`d182f0bb-01fa-45ed-9815-336f98e5e38b`) when finished!
