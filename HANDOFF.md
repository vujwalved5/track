# HANDOFF — Agent A to Agent D (Data & Plumbing Specification)

## Overview
Agent A has implemented **Fix 1** (authenticated parallel data fetching, safe relational query without `!inner`, deterministic widget sorting `created_at ASC`, and single batch fetch for `initialEntries`) and **Fix 4** (`idx_widgets_month_id` database index migration).

This document specifies the exact prop plumbing signatures and TypeScript types for `initialEntries` so Agent D can seamlessly wire them into `OpenBook.tsx` and `MobileBook.tsx`.

---

## 1. TypeScript Types

Imported from `@/components/widgets/entryHelpers` or `@/components/widgets`:

```typescript
export interface WidgetEntryRow {
  id: string
  widget_id: string
  day: number
  value: Record<string, unknown>
  created_at: string
  updated_at: string
}
```

---

## 2. Server Page Contract (`app/book/[year]/[month]/page.tsx`)

`page.tsx` now fetches all entries for the viewed month's widgets in a single query:
```typescript
const { data: entriesData } = await supabase
  .from('entries')
  .select('*')
  .in('widget_id', widgetIds)
```
And passes it directly to `<OpenBook />`:

```tsx
<OpenBook
  year={year}
  month={month}
  monthId={monthId}
  paperLeft={paperLeft}
  paperRight={paperRight}
  initialSetupDone={setupDone}
  initialWidgets={initialWidgets}
  initialEntries={initialEntries}  // <-- WidgetEntryRow[]
  setupConfig={setupConfig}
  prevMonthData={prevMonthData}
  showNextMonthPrompt={showNextMonthPrompt}
  nextMonthName={nextMonthName}
  nextMonthDate={{ year: nextYear, month: nextMonth }}
/>
```

---

## 3. Prop Plumbing into `OpenBook.tsx` and `MobileBook.tsx`

### A. `OpenBookProps` Interface
In `components/book/OpenBook.tsx`:
```typescript
import type { WidgetEntryRow } from '@/components/widgets/entryHelpers'

interface OpenBookProps {
  year: number
  month: number
  monthId?: string
  paperLeft?: PaperType
  paperRight?: PaperType
  initialSetupDone?: boolean
  initialWidgets?: WidgetData[]
  initialEntries?: WidgetEntryRow[]  // <-- Added
  setupConfig?: Record<string, unknown>
  prevMonthData?: PreviousMonthData
  showNextMonthPrompt?: boolean
  nextMonthName?: string
  nextMonthDate?: { year: number; month: number }
}
```

### B. Priming Client Cache
`OpenBook.tsx` already primes the client memory cache on render and route transitions:
```typescript
import { setInitialEntries } from '@/components/widgets/entryHelpers'

// On initial render:
setInitialEntries(initialEntries, initialWidgets.map((w) => w.id))

// In route param sync useEffect:
setInitialEntries(initialEntries, initialWidgets.map((w) => w.id))
```

### C. Plumbing down to `PageWidgetLayer` / `MobileBook`
Pass `initialEntries` down to `PageWidgetLayer`:
```tsx
<PageWidgetLayer
  page="left"
  monthId={currentMonthId}
  year={year}
  month={month}
  setupConfig={currentSetupConfig}
  widgets={leftWidgets}
  initialEntries={initialEntries}  // <-- Wire to PageWidgetLayer
  isArrangeMode={isArrangeMode}
  onWidgetsChange={handleLeftWidgetsChange}
  onOpenConfig={setActiveConfigWidgetId}
/>
```

And similarly to `MobileBook`:
```tsx
<MobileBook
  year={year}
  month={month}
  monthId={currentMonthId}
  paperLeft={currentPaperLeft}
  paperRight={currentPaperRight}
  setupDone={isSetupDone}
  setupConfig={currentSetupConfig}
  widgets={widgets}
  initialEntries={initialEntries}  // <-- Wire to MobileBook
  onWidgetsChange={setWidgets}
  // ... other props
/>
```

---

## 4. Child Widget Props Signature

All widgets now accept:
```typescript
WidgetRenderProps<TConfig> & { initialEntries?: WidgetEntryRow[] }
```

### Dual-Layer Fallback Guarantee:
Even before `initialEntries` is threaded through intermediate wrapper layers, every widget synchronously checks:
```typescript
const entries = initialEntries ?? getInitialWidgetEntries(id)
```
Where `getInitialWidgetEntries(id)` reads synchronously from the memory cache primed by `setInitialEntries(...)`.
- Zero waterfalls on initial mount.
- Zero extra client HTTP requests.
- Live updates continue to function via `saveWidgetEntryAndBump` and `entriesVersionStore`.

---

## 5. Summary of Agent A Modifications

1. `app/book/[year]/[month]/page.tsx`:
   - Single `getUser()` call with redirect to `/` if missing.
   - `Promise.all` parallel fetch of previous and current month data.
   - Nested relational query for `books -> months -> widgets` (safe, no `!inner`).
   - Default fallback for unset months guaranteeing 7-step wizard launches (L9).
   - Deterministic sorting by `created_at ASC` (with `id` tie-breaker).
   - Single `.in('widget_id', widgetIds)` query for `initialEntries`.
2. `components/setup/setupActions.ts`:
   - `getPreviousMonthData` accepts `userId` and runs a single nested relational query.
3. `components/widgets/entryHelpers.ts`:
   - Exported `getInitialWidgetEntries(widgetId: string): WidgetEntryRow[]`.
4. All entry-consuming widgets:
   - Synchronous initial state initialization from `initialEntries ?? getInitialWidgetEntries(id)`.
   - Removed mount `useEffect` server fetches.
   - Preserved edit mutation handlers and reactive version updates.
5. `supabase/migrations/0002_add_widgets_month_id_index.sql`:
   - Secondary index migration for `idx_widgets_month_id`.
