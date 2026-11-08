'use server'

/**
 * Entry Server Actions
 * Memorable Moments — Phase 5 / Task 9
 *
 * Rules:
 * - Validate every entry write with Zod (day 1..31, valid value shape) (Correction 6)
 * - RLS enforcement via Supabase createClient() (L11)
 * - All entries stored in entries table per (widget_id, day) (L2, Correction 3)
 */

import { createClient } from '@/lib/supabase/server'
import type { Entry } from '@/types/db'
import { entryPayloadSchema } from './entrySchemas'

export interface EntryActionResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Fetches all daily entries for a given widget.
 */
export async function getWidgetEntries(
  widgetId: string,
): Promise<EntryActionResult<Entry[]>> {
  try {
    if (!widgetId) {
      return { success: false, error: 'Widget ID is required' }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('widget_id', widgetId)
      .order('day', { ascending: true })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: (data as Entry[]) || [] }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch entries',
    }
  }
}

/**
 * Saves or updates a daily entry for a widget.
 * Validates with Zod before writing to Supabase.
 */
export async function saveWidgetEntry(
  widgetId: string,
  day: number,
  value: Record<string, unknown>,
): Promise<EntryActionResult<Entry>> {
  try {
    const parsed = entryPayloadSchema.safeParse({ widgetId, day, value })
    if (!parsed.success) {
      return {
        success: false,
        error: `Validation error: ${parsed.error.errors.map((e) => e.message).join(', ')}`,
      }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('entries')
      .upsert(
        {
          widget_id: widgetId,
          day,
          value,
        },
        { onConflict: 'widget_id,day' },
      )
      .select()
      .single()

    if (error || !data) {
      return {
        success: false,
        error: error?.message || 'Failed to save entry',
      }
    }

    return { success: true, data: data as Entry }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to save entry',
    }
  }
}
