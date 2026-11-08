# Plan A: Server Data Consolidation & Database Index (Fix 1 and Fix 4)

## Task Summary (At most 8 bullets)
- Call `getUser()` once in `app/book/[year]/[month]/page.tsx` and redirect to `/` if unauthenticated.
- Run previous-month and current-month data fetching concurrently in `Promise.all` using `user.id`.
- Use a single nested relational query for books, months, and widgets without `!inner`.
- Safe defaults for unset months (`setup_done=false`, dotted paper, empty widgets) ensuring the 7-step Month Setup wizard launches cleanly (L9).
- Sort widgets ascending by `created_at` (`created_at ASC`) to preserve stacking order.
- Batch fetch all widget entries in one query (`.in('widget_id', widgetIds)`) and pass down as `initialEntries`.
- Update widgets that fetch entries on mount to accept initial data and skip mount fetching while continuing to update on mutations.
- Create migration `supabase/migrations/0002_add_widgets_month_id_index.sql` and provide `HANDOFF.md` for Agent D.

## Files to Create or Edit
1. `app/book/[year]/[month]/page.tsx` (edit: single `getUser()`, parallel `Promise.all`, relational query, safe defaults, widget sorting, batch entries fetch)
2. `components/setup/setupActions.ts` (edit: nested relational query in `getPreviousMonthData`, accepting `userId`)
3. `components/widgets/entryHelpers.ts` (edit: export `getInitialWidgetEntries(widgetId)` to read from memory cache synchronously)
4. `components/widgets/number-log/NumberLogWidget.tsx` (edit: accept initial entries, initialize synchronously, remove mount fetch)
5. `components/widgets/habit-tracker/HabitTrackerWidget.tsx` (edit: accept initial entries, initialize synchronously, remove mount fetch)
6. `components/widgets/poll/PollWidget.tsx` (edit: accept initial entries, initialize synchronously, remove mount fetch)
7. `components/widgets/memorable-moments/MemorableMomentsWidget.tsx` (edit: accept initial entries, initialize synchronously, remove mount fetch)
8. `components/widgets/mood-tracker/MoodTrackerWidget.tsx` (edit: accept initial entries, initialize synchronously, remove mount fetch)
9. `components/widgets/counter/CounterWidget.tsx` (edit: accept initial entries, initialize synchronously, remove mount fetch)
10. `components/widgets/checklist/ChecklistWidget.tsx` (edit: accept initial entries, initialize synchronously, remove mount fetch)
11. `components/widgets/line-graph/LineGraphWidget.tsx` (edit: accept initial entries, initialize synchronously, skip mount fetch)
12. `components/widgets/donut/DonutWidget.tsx` (edit: accept initial entries, initialize synchronously, skip mount fetch)
13. `components/widgets/goal-bar/GoalBarWidget.tsx` (edit: accept initial entries, initialize synchronously, skip mount fetch)
14. `supabase/migrations/0002_add_widgets_month_id_index.sql` (verify/create: `CREATE INDEX IF NOT EXISTS idx_widgets_month_id ON public.widgets (month_id);`)
15. `HANDOFF.md` (create at project root: prop plumbing signature and TypeScript types for Agent D)

## Open Questions / Uncertainties
- None. All requirements and constraints are fully specified and verified against the codebase.

## Ideas (not built)
- Server-side pre-aggregation of chart statistics in Next.js Server Components.
- Automatic caching of previous month setup in Supabase edge config.
