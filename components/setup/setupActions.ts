'use server'

import { createClient } from '@/lib/supabase/server'
import type { HabitConfig, MonthSetupConfig, PaperStyle, StartingLayout, TrackedNumbersConfig } from '@/types/db'

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
): Promise<PreviousMonthData> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { exists: false }
    }

    const prevYear = month === 1 ? year - 1 : year
    const prevMonth = month === 1 ? 12 : month - 1
    const prevMonthName = MONTH_NAMES[prevMonth - 1]

    // Find previous year's book
    const { data: prevBook } = await supabase
      .from('books')
      .select('id')
      .eq('user_id', user.id)
      .eq('year', prevYear)
      .maybeSingle()

    if (!prevBook) {
      return { exists: false, year: prevYear, month: prevMonth, monthName: prevMonthName }
    }

    // Find previous month record
    const { data: prevMonthRow } = await supabase
      .from('months')
      .select('id, setup_done, paper_left, paper_right, next_month_note, setup_config')
      .eq('book_id', prevBook.id)
      .eq('month', prevMonth)
      .maybeSingle()

    if (!prevMonthRow || !prevMonthRow.setup_done) {
      return { exists: false, year: prevYear, month: prevMonth, monthName: prevMonthName }
    }

    // Count widgets to verify if any exist
    const { count } = await supabase
      .from('widgets')
      .select('id', { count: 'exact', head: true })
      .eq('month_id', prevMonthRow.id)

    const rawConfig = (prevMonthRow.setup_config || {}) as MonthSetupConfig
    const habits: HabitConfig[] = Array.isArray(rawConfig.habits) ? rawConfig.habits : []

    return {
      exists: true,
      year: prevYear,
      month: prevMonth,
      monthName: prevMonthName,
      paperLeft: prevMonthRow.paper_left as PaperStyle,
      paperRight: prevMonthRow.paper_right as PaperStyle,
      nextMonthNote: prevMonthRow.next_month_note,
      habits,
      widgetCount: count ?? 0,
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

/**
 * Saves the month setup. Missing books or months rows are created strictly here.
 * If copyFromPrevious is true, duplicates widget rows from the preceding month.
 * Sets setup_done = true only upon successful completion.
 */
export async function completeMonthSetup(
  params: SaveMonthSetupParams,
): Promise<{ success: boolean; error?: string }> {
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

    // 2. Ensure or update months row
    let monthId: string
    const { data: existingMonth, error: monthFetchErr } = await supabase
      .from('months')
      .select('id')
      .eq('book_id', bookId)
      .eq('month', month)
      .maybeSingle()

    if (monthFetchErr) {
      return { success: false, error: monthFetchErr.message }
    }

    const cleanNote = nextMonthNote.trim() || null

    if (existingMonth) {
      monthId = existingMonth.id
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
    } else {
      const { data: newMonth, error: insertErr } = await supabase
        .from('months')
        .insert({
          book_id: bookId,
          month,
          setup_done: true,
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

    // 3. If copyFromPrevious, copy widget ROWS only (never entries)
    if (copyFromPrevious) {
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

            const { error: widgetInsertError } = await supabase
              .from('widgets')
              .insert(rowsToInsert)

            if (widgetInsertError) {
              return { success: false, error: widgetInsertError.message }
            }
          }
        }
      }
    }

    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error during month setup.'
    return { success: false, error: message }
  }
}
