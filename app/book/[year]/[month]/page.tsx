import { OpenBook, MONTHS } from '@/components/book'
import type { PaperType } from '@/components/paper'
import { createClient } from '@/lib/supabase/server'
import { getPreviousMonthData } from '@/components/setup'
import type { WidgetData } from '@/components/widgets'

interface PageProps {
  params: Promise<{
    year: string
    month: string
  }>
}

interface MonthRow {
  id: string
  setup_done: boolean
  paper_left: PaperType
  paper_right: PaperType
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
  let initialWidgets: WidgetData[] = []

  const nextYear = month === 12 ? year + 1 : year
  const nextMonth = month === 12 ? 1 : month + 1
  const nextMonthName = MONTHS[nextMonth - 1]?.name || 'Next Month'

  // Load previous month data for Month Setup wizard
  const prevMonthData = await getPreviousMonthData(year, month)

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // 1. Check current month setup status. Missing rows are NOT created here (correction 1).
      const bookRes = await supabase
        .from('books')
        .select('id')
        .eq('user_id', user.id)
        .eq('year', year)
        .maybeSingle()

      if (bookRes.data) {
        const monthRes = (await supabase
          .from('months')
          .select('id, setup_done, paper_left, paper_right')
          .eq('book_id', bookRes.data.id)
          .eq('month', month)
          .maybeSingle()) as { data: MonthRow | null }

        if (monthRes.data) {
          setupDone = !!monthRes.data.setup_done
          paperLeft = monthRes.data.paper_left || 'dotted'
          paperRight = monthRes.data.paper_right || 'dotted'
          monthId = monthRes.data.id

          // Load widgets for the current month spread
          const widgetsRes = await supabase
            .from('widgets')
            .select('*')
            .eq('month_id', monthId)
            .order('created_at', { ascending: true })

          if (widgetsRes.data) {
            initialWidgets = widgetsRes.data as WidgetData[]
          }
        }
      }

      // 2. Check gentle prompt condition (correction 5):
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

      if (isLast3DaysOfViewedMonth) {
        const nextBookRes = await supabase
          .from('books')
          .select('id')
          .eq('user_id', user.id)
          .eq('year', nextYear)
          .maybeSingle()

        if (!nextBookRes.data) {
          showNextMonthPrompt = true
        } else {
          const nextMonthRes = await supabase
            .from('months')
            .select('setup_done')
            .eq('book_id', nextBookRes.data.id)
            .eq('month', nextMonth)
            .maybeSingle()

          if (!nextMonthRes.data || !nextMonthRes.data.setup_done) {
            showNextMonthPrompt = true
          }
        }
      }
    }
  } catch (err) {
    console.error('Error loading month setup state:', err)
  }

  return (
    <main
      className="h-screen w-screen overflow-hidden bg-desk flex items-center justify-center select-none"
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
        prevMonthData={prevMonthData}
        showNextMonthPrompt={showNextMonthPrompt}
        nextMonthName={nextMonthName}
        nextMonthDate={{ year: nextYear, month: nextMonth }}
      />
    </main>
  )
}
