import { OpenBook, MONTHS } from '@/components/book'
import type { PaperType } from '@/components/paper'
import { createClient } from '@/lib/supabase/server'
import { getPreviousMonthData } from '@/components/setup'
import type { WidgetData, WidgetEntryRow } from '@/components/widgets'

interface PageProps {
  params: Promise<{
    year: string
    month: string
  }>
}

interface WidgetDataWithEntries extends WidgetData {
  entries?: WidgetEntryRow[]
}

interface BookWithMonthsAndWidgets {
  id: string
  months?: MonthRowWithWidgets[] | null
}

interface MonthRowWithWidgets {
  id: string
  month: number
  setup_done: boolean
  paper_left: PaperType
  paper_right: PaperType
  setup_config?: Record<string, unknown>
  widgets?: WidgetDataWithEntries[]
}

export default async function BookMonthPage({ params }: PageProps) {
  const { year: yearStr, month: monthStr } = await params
  const parsedYear = parseInt(yearStr, 10)
  const parsedMonth = parseInt(monthStr, 10)

  const year = isNaN(parsedYear) ? new Date().getFullYear() : parsedYear
  const month =
    isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12
      ? new Date().getMonth() + 1
      : parsedMonth

  let paperLeft: PaperType = 'dotted'
  let paperRight: PaperType = 'dotted'
  let setupDone = false
  let showNextMonthPrompt = false
  let monthId: string | undefined = undefined
  let setupConfig: Record<string, unknown> = {}
  let initialWidgets: WidgetData[] = []
  let initialEntries: WidgetEntryRow[] = []

  const nextYear = month === 12 ? year + 1 : year
  const nextMonth = month === 12 ? 1 : month + 1
  const nextMonthName = MONTHS[nextMonth - 1]?.name || 'Next Month'

  // Gentle prompt timing condition evaluated synchronously before fetching:
  // Shows only when today is within last 3 days of viewed month AND next month's setup_done is false
  const today = new Date()
  const isViewingCurrentYear = today.getFullYear() === year
  const isViewingCurrentMonth = today.getMonth() + 1 === month
  const daysInViewedMonth = new Date(year, month, 0).getDate()
  const isLast3DaysOfViewedMonth =
    isViewingCurrentYear &&
    isViewingCurrentMonth &&
    today.getDate() >= daysInViewedMonth - 2 &&
    today.getDate() <= daysInViewedMonth

  const supabase = await createClient()

  try {
    // Run all independent queries in parallel via Promise.all (Condition 1 / Task 14-2).
    // Embed entries directly into widgets to eliminate the secondary waterfall query.
    // Auth & tenant isolation are strictly enforced by Supabase RLS policies (L11).
    const currentBookQuery = supabase
      .from('books')
      .select(`
        id,
        months (
          id,
          month,
          setup_done,
          paper_left,
          paper_right,
          setup_config,
          widgets (
            id, month_id, page, type, x, y, w, h, config, z, created_at,
            entries (*)
          )
        )
      `)
      .eq('year', year)
      .eq('months.month', month)
      .maybeSingle()

    const nextBookQuery = isLast3DaysOfViewedMonth
      ? supabase
          .from('books')
          .select(`
            id,
            months (
              setup_done
            )
          `)
          .eq('year', nextYear)
          .eq('months.month', nextMonth)
          .maybeSingle()
      : Promise.resolve(null)

    const [prevMonthData, currentBookRes, nextBookRes] = await Promise.all([
      getPreviousMonthData(year, month),
      currentBookQuery,
      nextBookQuery,
    ])

    // Handle current month relational data safely
    const book = currentBookRes.data as unknown as BookWithMonthsAndWidgets | null
    const monthRows = Array.isArray(book?.months)
      ? (book.months as MonthRowWithWidgets[])
      : []
    const monthData = monthRows[0] || null

    if (monthData) {
      setupDone = !!monthData.setup_done
      paperLeft = monthData.paper_left || 'dotted'
      paperRight = monthData.paper_right || 'dotted'
      monthId = monthData.id
      setupConfig = (monthData.setup_config as Record<string, unknown>) || {}

      const rawWidgets = (monthData.widgets as WidgetDataWithEntries[]) || []
      // Deterministically sort widgets by created_at ascending (with id tie-breaker)
      rawWidgets.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime() ||
          a.id.localeCompare(b.id),
      )
      initialWidgets = rawWidgets

      // Collect embedded entries from all widgets in a single pass without extra query
      initialEntries = rawWidgets.flatMap((w) => w.entries || [])
    } else {
      // Month not yet set up; defaults ensure the 7-step wizard launches cleanly (Rule L9)
      setupDone = false
      paperLeft = 'dotted'
      paperRight = 'dotted'
      setupConfig = {}
      initialWidgets = []
      initialEntries = []
    }

    // Evaluate gentle next month prompt result
    if (isLast3DaysOfViewedMonth && nextBookRes) {
      const rawNextBook = nextBookRes.data as unknown as { months?: Array<{ setup_done: boolean }> } | null
      const nextMonthRow = rawNextBook?.months?.[0]
      if (!nextMonthRow || !nextMonthRow.setup_done) {
        showNextMonthPrompt = true
      }
    }

    return (
      <main
        className="h-screen w-screen overflow-hidden desk-surface flex items-center justify-center select-none"
        aria-label={`Book Spread ${year} Month ${month}`}
      >
        <OpenBook
          year={year}
          month={month}
          monthId={monthId}
          paperLeft={paperLeft}
          paperRight={paperRight}
          initialSetupDone={setupDone}
          initialWidgets={initialWidgets}
          initialEntries={initialEntries}
          setupConfig={setupConfig}
          prevMonthData={prevMonthData}
          showNextMonthPrompt={showNextMonthPrompt}
          nextMonthName={nextMonthName}
          nextMonthDate={{ year: nextYear, month: nextMonth }}
        />
      </main>
    )
  } catch (err) {
    console.error('Error loading month setup state:', err)
    return (
      <main
        className="h-screen w-screen overflow-hidden desk-surface flex items-center justify-center select-none"
        aria-label={`Book Spread ${year} Month ${month}`}
      >
        <OpenBook
          year={year}
          month={month}
          monthId={monthId}
          paperLeft={paperLeft}
          paperRight={paperRight}
          initialSetupDone={setupDone}
          initialWidgets={initialWidgets}
          initialEntries={initialEntries}
          setupConfig={setupConfig}
          prevMonthData={{ exists: false }}
          showNextMonthPrompt={showNextMonthPrompt}
          nextMonthName={nextMonthName}
          nextMonthDate={{ year: nextYear, month: nextMonth }}
        />
      </main>
    )
  }
}
