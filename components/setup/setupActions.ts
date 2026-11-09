'use server'

import { createClient } from '@/lib/supabase/server'
import type { HabitConfig, MonthSetupConfig, PaperStyle, StartingLayout, TrackedNumbersConfig } from '@/types/db'
import {
  PAGE_COLS,
  PAGE_ROWS,
  hasOverlap,
  isWithinBounds,
  type WidgetData,
  type WidgetRect,
  type PageSide,
} from '@/components/widgets/types'
import { getWidgetMetadata } from '@/components/widgets/widgetMetadata'

export interface PreviousMonthData {
  exists: boolean
  year?: number
  month?: number
  monthName?: string
  paperLeft?: PaperStyle
  paperRight?: PaperStyle
  nextMonthNote?: string | null
  habits?: HabitConfig[]
  widgetCount?: number
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/**
 * Reads the previous month's setup data (for "Use the same as last month").
 * January looks back to December of the previous year.
 */
export async function getPreviousMonthData(
  year: number,
  month: number,
  userId?: string,
): Promise<PreviousMonthData> {
  try {
    const supabase = await createClient()
    const prevYear = month === 1 ? year - 1 : year
    const prevMonth = month === 1 ? 12 : month - 1
    const prevMonthName = MONTH_NAMES[prevMonth - 1]

    // Fetch previous month's book, month, and widgets in ONE nested query.
    // Relies directly on Supabase RLS (user_id = (SELECT auth.uid())) to eliminate duplicate auth round trips.
    let query = supabase
      .from('books')
      .select(`
        id,
        months (
          id,
          setup_done,
          paper_left,
          paper_right,
          next_month_note,
          setup_config,
          widgets (id)
        )
      `)
      .eq('year', prevYear)
      .eq('months.month', prevMonth)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data: prevBook } = await query.maybeSingle()

    interface PrevBookQueryResult {
      id: string
      months?: Array<{
        id: string
        setup_done: boolean
        paper_left: string
        paper_right: string
        next_month_note: string | null
        setup_config: Record<string, unknown>
        widgets?: Array<{ id: string }>
      }>
    }

    const rawPrevBook = prevBook as unknown as PrevBookQueryResult | null
    const prevMonthRows = Array.isArray(rawPrevBook?.months) ? rawPrevBook.months : []
    const prevMonthRow = prevMonthRows[0] || null

    if (!prevMonthRow || !prevMonthRow.setup_done) {
      return { exists: false, year: prevYear, month: prevMonth, monthName: prevMonthName }
    }

    const rawConfig = (prevMonthRow.setup_config || {}) as MonthSetupConfig
    const habits: HabitConfig[] = Array.isArray(rawConfig.habits) ? rawConfig.habits : []
    const widgetCount = Array.isArray(prevMonthRow.widgets) ? prevMonthRow.widgets.length : 0

    return {
      exists: true,
      year: prevYear,
      month: prevMonth,
      monthName: prevMonthName,
      paperLeft: prevMonthRow.paper_left as PaperStyle,
      paperRight: prevMonthRow.paper_right as PaperStyle,
      nextMonthNote: prevMonthRow.next_month_note,
      habits,
      widgetCount,
    }
  } catch (err) {
    console.error('Failed to load previous month data:', err)
    return { exists: false }
  }
}

export interface SaveMonthSetupParams {
  year: number
  month: number
  copyFromPrevious: boolean
  paperLeft: PaperStyle
  paperRight: PaperStyle
  nextMonthNote: string
  habits: HabitConfig[]
  trackedNumbers: TrackedNumbersConfig
  startingLayout: StartingLayout
}

export interface CompleteMonthSetupResult {
  success: boolean
  monthId?: string
  widgets?: WidgetData[]
  setupConfig?: MonthSetupConfig
  error?: string
}

/**
 * Server-side bounds, minimum size, and zero-overlap validator for starting layout widgets.
 * Strictly enforces Task 7 geometric constraints (PAGE_COLS, PAGE_ROWS, minSize, hasOverlap).
 */
function validateStartingWidgets(
  widgets: Array<{
    page: PageSide
    type: string
    x: number
    y: number
    w: number
    h: number
  }>,
): { valid: boolean; error?: string } {
  for (const w of widgets) {
    const meta = getWidgetMetadata(w.type)
    const minW = meta?.minSize.w ?? 1
    const minH = meta?.minSize.h ?? 1

    if (w.w < minW || w.h < minH) {
      return {
        valid: false,
        error: `Widget ${w.type} (${w.w}×${w.h}) is below minimum allowed size (${minW}×${minH})`,
      }
    }

    const rect: WidgetRect = { x: w.x, y: w.y, w: w.w, h: w.h }
    if (!isWithinBounds(rect, PAGE_COLS, PAGE_ROWS)) {
      return {
        valid: false,
        error: `Widget ${w.type} placement exceeds page bounds (${PAGE_COLS} cols × ${PAGE_ROWS} rows)`,
      }
    }
  }

  // Check overlaps on left page
  const leftWidgets = widgets.filter((w) => w.page === 'left')
  for (let i = 0; i < leftWidgets.length; i++) {
    for (let j = i + 1; j < leftWidgets.length; j++) {
      const r1: WidgetRect = {
        x: leftWidgets[i].x,
        y: leftWidgets[i].y,
        w: leftWidgets[i].w,
        h: leftWidgets[i].h,
      }
      const r2: WidgetRect = {
        x: leftWidgets[j].x,
        y: leftWidgets[j].y,
        w: leftWidgets[j].w,
        h: leftWidgets[j].h,
      }
      if (hasOverlap(r1, r2)) {
        return {
          valid: false,
          error: `Overlap detected on left page between ${leftWidgets[i].type} and ${leftWidgets[j].type}`,
        }
      }
    }
  }

  // Check overlaps on right page
  const rightWidgets = widgets.filter((w) => w.page === 'right')
  for (let i = 0; i < rightWidgets.length; i++) {
    for (let j = i + 1; j < rightWidgets.length; j++) {
      const r1: WidgetRect = {
        x: rightWidgets[i].x,
        y: rightWidgets[i].y,
        w: rightWidgets[i].w,
        h: rightWidgets[i].h,
      }
      const r2: WidgetRect = {
        x: rightWidgets[j].x,
        y: rightWidgets[j].y,
        w: rightWidgets[j].w,
        h: rightWidgets[j].h,
      }
      if (hasOverlap(r1, r2)) {
        return {
          valid: false,
          error: `Overlap detected on right page between ${rightWidgets[i].type} and ${rightWidgets[j].type}`,
        }
      }
    }
  }

  return { valid: true }
}

/**
 * Saves the month setup (Phase 5 / Task 10b).
 * Order:
 * 1. Ensure book and months records exist.
 * 2. Check if widgets already exist for this month.
 * 3. Create starting widgets FIRST (if layout is Journal and month has zero widgets).
 * 4. Run through server-side bounds & overlap validator.
 * 5. Batch-insert starting widgets into Supabase.
 * 6. Set setup_done = true only AFTER widget creation succeeds.
 * 7. Return created widgets so UI displays them immediately without refresh.
 */
export async function completeMonthSetup(
  params: SaveMonthSetupParams,
): Promise<CompleteMonthSetupResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication failed: you must be signed in to save.',
      }
    }

    const {
      year,
      month,
      copyFromPrevious,
      paperLeft,
      paperRight,
      nextMonthNote,
      habits,
      trackedNumbers,
      startingLayout,
    } = params

    // 1. Ensure book row exists
    let bookId: string
    const { data: existingBook, error: bookFetchErr } = await supabase
      .from('books')
      .select('id')
      .eq('user_id', user.id)
      .eq('year', year)
      .maybeSingle()

    if (bookFetchErr) {
      return { success: false, error: bookFetchErr.message }
    }

    if (existingBook) {
      bookId = existingBook.id
    } else {
      const { data: newBook, error: bookCreateErr } = await supabase
        .from('books')
        .insert({ user_id: user.id, year })
        .select('id')
        .single()

      if (bookCreateErr || !newBook) {
        return {
          success: false,
          error: bookCreateErr?.message || 'Could not create book volume.',
        }
      }
      bookId = newBook.id
    }

    const setupConfig: MonthSetupConfig = {
      habits: habits.filter((h) => h.name.trim().length > 0),
      trackedNumbers,
      startingLayout,
    }

    const cleanNote = nextMonthNote.trim() || null

    // 2. Ensure months row exists (setup_done remains false until widgets are created)
    let monthId: string
    const { data: existingMonth, error: monthFetchErr } = await supabase
      .from('months')
      .select('id, setup_done')
      .eq('book_id', bookId)
      .eq('month', month)
      .maybeSingle()

    if (monthFetchErr) {
      return { success: false, error: monthFetchErr.message }
    }

    if (existingMonth) {
      monthId = existingMonth.id
    } else {
      const { data: newMonth, error: insertErr } = await supabase
        .from('months')
        .insert({
          book_id: bookId,
          month,
          setup_done: false,
          paper_left: paperLeft,
          paper_right: paperRight,
          next_month_note: cleanNote,
          setup_config: setupConfig,
        })
        .select('id')
        .single()

      if (insertErr || !newMonth) {
        return {
          success: false,
          error: insertErr?.message || 'Could not create month record.',
        }
      }
      monthId = newMonth.id
    }

    // 3. Check if month already has widgets (prevent duplicate runs or reload duplicates)
    const { count: widgetCount, error: widgetCountErr } = await supabase
      .from('widgets')
      .select('id', { count: 'exact', head: true })
      .eq('month_id', monthId)

    if (widgetCountErr) {
      return { success: false, error: widgetCountErr.message }
    }

    const hasWidgets = (widgetCount ?? 0) > 0
    let createdWidgets: WidgetData[] = []

    // 4. Create starting widgets FIRST (before setting setup_done = true)
    if (copyFromPrevious) {
      if (!hasWidgets) {
        const prevYear = month === 1 ? year - 1 : year
        const prevMonth = month === 1 ? 12 : month - 1

        const { data: prevBook } = await supabase
          .from('books')
          .select('id')
          .eq('user_id', user.id)
          .eq('year', prevYear)
          .maybeSingle()

        if (prevBook) {
          const { data: prevMonthRow } = await supabase
            .from('months')
            .select('id')
            .eq('book_id', prevBook.id)
            .eq('month', prevMonth)
            .maybeSingle()

          if (prevMonthRow) {
            const { data: prevWidgets, error: widgetFetchError } = await supabase
              .from('widgets')
              .select('page, type, x, y, w, h, config, z')
              .eq('month_id', prevMonthRow.id)

            if (widgetFetchError) {
              return { success: false, error: widgetFetchError.message }
            }

            if (prevWidgets && prevWidgets.length > 0) {
              const rowsToInsert = prevWidgets.map((w) => ({
                month_id: monthId,
                page: w.page,
                type: w.type,
                x: w.x,
                y: w.y,
                w: w.w,
                h: w.h,
                config: w.config,
                z: w.z,
              }))

              const { data: copied, error: widgetInsertError } = await supabase
                .from('widgets')
                .insert(rowsToInsert)
                .select()

              if (widgetInsertError) {
                return { success: false, error: widgetInsertError.message }
              }
              createdWidgets = (copied as WidgetData[]) || []
            }
          }
        }
      } else {
        const { data: existingRows } = await supabase
          .from('widgets')
          .select('*')
          .eq('month_id', monthId)
          .order('created_at', { ascending: true })
        createdWidgets = (existingRows as WidgetData[]) || []
      }
    } else if (startingLayout === 'journal') {
      if (!hasWidgets) {
        const rowsToInsert: Array<{
          id: string
          month_id: string
          page: PageSide
          type: string
          x: number
          y: number
          w: number
          h: number
          config: Record<string, unknown>
          z: number
        }> = []

        // Widget 1: Memorable Moments on left page — w 22, h 18 at (x 0, y 0)
        rowsToInsert.push({
          id: crypto.randomUUID(),
          month_id: monthId,
          page: 'left',
          type: 'memorable-moments',
          x: 0,
          y: 0,
          w: 22,
          h: 18,
          config: { title: 'Memorable Moments' },
          z: 0,
        })

        // Widget 2: Habit Tracker on right page — w 14, h 24 at (x 0, y 0)
        rowsToInsert.push({
          id: crypto.randomUUID(),
          month_id: monthId,
          page: 'right',
          type: 'habit-tracker',
          x: 0,
          y: 0,
          w: 14,
          h: 24,
          config: { title: 'Habits' },
          z: 0,
        })

        // Widget 3 & 4: Sleep Score Number Log + Line Graph (if enabled)
        if (trackedNumbers.sleepScore) {
          const sleepScoreId = crypto.randomUUID()

          // Sleep score Number Log on right page: w 6, h 24 at (x 14, y 0)
          rowsToInsert.push({
            id: sleepScoreId,
            month_id: monthId,
            page: 'right',
            type: 'number-log',
            x: 14,
            y: 0,
            w: 6,
            h: 24,
            config: { label: 'Sleep Score', unit: '' },
            z: 0,
          })

          // Line Graph on left page: w 14 at (x 0, y 18), h = 8 if Mood Tracker is enabled, h = 12 if not
          const lineGraphH = trackedNumbers.mood ? 8 : 12
          rowsToInsert.push({
            id: crypto.randomUUID(),
            month_id: monthId,
            page: 'left',
            type: 'line-graph',
            x: 0,
            y: 18,
            w: 14,
            h: lineGraphH,
            config: {
              title: 'Sleep Score',
              sourceWidgetId: sleepScoreId,
              vertical: false,
            },
            z: 0,
          })
        }

        // Widget 5: Mood Tracker on left page (when enabled): w 22, h 4 at (x 0, y 26)
        if (trackedNumbers.mood) {
          rowsToInsert.push({
            id: crypto.randomUUID(),
            month_id: monthId,
            page: 'left',
            type: 'mood-tracker',
            x: 0,
            y: 26,
            w: 22,
            h: 4,
            config: { title: 'Mood' },
            z: 0,
          })
        }

        // Fallback: If sleep score is OFF, weight Number Log fits on right page at (x 14, y 0)
        if (!trackedNumbers.sleepScore && trackedNumbers.weight) {
          rowsToInsert.push({
            id: crypto.randomUUID(),
            month_id: monthId,
            page: 'right',
            type: 'number-log',
            x: 14,
            y: 0,
            w: 6,
            h: 24,
            config: { label: 'Weight', unit: 'kg' },
            z: 0,
          })
        }

        // Run every created widget through the server-side bounds & overlap validator (Correction 2)
        const validation = validateStartingWidgets(rowsToInsert)
        if (!validation.valid) {
          return {
            success: false,
            error: validation.error || 'Starting widgets failed geometric validation.',
          }
        }

        // Single batch insert for all starting widgets (Correction 4)
        const { data: inserted, error: widgetInsertError } = await supabase
          .from('widgets')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .insert(rowsToInsert as any)
          .select()

        if (widgetInsertError || !inserted) {
          return {
            success: false,
            error: widgetInsertError?.message || 'Failed to create starting widgets.',
          }
        }

        createdWidgets = inserted as WidgetData[]
      } else {
        // Month already had widgets: do not duplicate
        const { data: existingRows } = await supabase
          .from('widgets')
          .select('*')
          .eq('month_id', monthId)
          .order('created_at', { ascending: true })
        createdWidgets = (existingRows as WidgetData[]) || []
      }
    } else {
      // Layout "Empty": create nothing
      createdWidgets = []
    }

    // 5. FINALLY, set setup_done = true only AFTER starting widgets have been successfully created (Correction 1)
    const { error: updateErr } = await supabase
      .from('months')
      .update({
        setup_done: true,
        paper_left: paperLeft,
        paper_right: paperRight,
        next_month_note: cleanNote,
        setup_config: setupConfig,
      })
      .eq('id', monthId)

    if (updateErr) {
      return { success: false, error: updateErr.message }
    }

    return {
      success: true,
      monthId,
      widgets: createdWidgets,
      setupConfig,
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error during month setup.'
    return { success: false, error: message }
  }
}
