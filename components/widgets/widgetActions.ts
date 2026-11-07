'use server'

/**
 * Widget Server Actions
 * Memorable Moments — Phase 4 / Task 7
 *
 * Enforces:
 * - Strict bounds clamping (22 cols × 30 rows)
 * - Minimum size constraints from widget registry
 * - Absolute zero-overlap enforcement before committing writes to Supabase
 * - Authentication & RLS through createClient()
 */

import { createClient } from '@/lib/supabase/server'
import type { WidgetData, PageSide, WidgetRect } from './types'
import {
  PAGE_COLS,
  PAGE_ROWS,
  hasOverlap,
  isWithinBounds,
  findNextAvailablePosition,
} from './types'
import { getWidgetDefinition } from './registry'

interface ActionResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Fetches all widgets for a given month ID.
 */
export async function getWidgetsForMonth(
  monthId: string,
): Promise<ActionResult<WidgetData[]>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('widgets')
      .select('*')
      .eq('month_id', monthId)
      .order('created_at', { ascending: true })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: (data as WidgetData[]) || [] }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch widgets',
    }
  }
}

/**
 * Updates a widget's grid position (x, y, w, h, page).
 * Rejects any write that violates bounds, minimum size, or overlaps an existing widget.
 */
export async function updateWidgetPosition(
  widgetId: string,
  pos: {
    x: number
    y: number
    w: number
    h: number
    page: PageSide
  },
): Promise<ActionResult<WidgetData>> {
  try {
    const supabase = await createClient()

    // 1. Fetch current target widget to verify existence and type
    const { data: targetWidget, error: fetchErr } = await supabase
      .from('widgets')
      .select('*')
      .eq('id', widgetId)
      .single()

    if (fetchErr || !targetWidget) {
      return { success: false, error: 'Widget not found' }
    }

    const candidate: WidgetRect = {
      x: Math.round(pos.x),
      y: Math.round(pos.y),
      w: Math.round(pos.w),
      h: Math.round(pos.h),
    }

    // 2. Enforce minimum size from registry
    const def = getWidgetDefinition(targetWidget.type)
    const minW = def?.minSize.w ?? 1
    const minH = def?.minSize.h ?? 1

    if (candidate.w < minW || candidate.h < minH) {
      return {
        success: false,
        error: `Widget size ${candidate.w}×${candidate.h} is below minimum allowed size ${minW}×${minH}`,
      }
    }

    // 3. Enforce page boundaries
    if (!isWithinBounds(candidate, PAGE_COLS, PAGE_ROWS)) {
      return {
        success: false,
        error: `Widget placement exceeds page bounds (22 cols × 30 rows)`,
      }
    }

    // 4. Fetch all other widgets on the target page for this month to check overlaps
    const { data: otherWidgets, error: othersErr } = await supabase
      .from('widgets')
      .select('*')
      .eq('month_id', targetWidget.month_id)
      .eq('page', pos.page)
      .neq('id', widgetId)

    if (othersErr) {
      return { success: false, error: othersErr.message }
    }

    // 5. Strict overlap check against all sibling widgets
    for (const other of otherWidgets || []) {
      const otherRect: WidgetRect = {
        x: other.x,
        y: other.y,
        w: other.w,
        h: other.h,
      }
      if (hasOverlap(candidate, otherRect)) {
        return {
          success: false,
          error: 'Widget overlaps with another widget on this page',
        }
      }
    }

    // 6. Valid placement: persist to Supabase
    const { data: updated, error: updateErr } = await supabase
      .from('widgets')
      .update({
        x: candidate.x,
        y: candidate.y,
        w: candidate.w,
        h: candidate.h,
        page: pos.page,
      })
      .eq('id', widgetId)
      .select()
      .single()

    if (updateErr || !updated) {
      return { success: false, error: updateErr?.message || 'Update failed' }
    }

    return { success: true, data: updated as WidgetData }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update widget position',
    }
  }
}

/**
 * Updates a widget's JSON configuration.
 * Validates against the widget's registered Zod schema before saving.
 */
export async function updateWidgetConfig(
  widgetId: string,
  config: Record<string, unknown>,
): Promise<ActionResult<WidgetData>> {
  try {
    const supabase = await createClient()

    const { data: targetWidget, error: fetchErr } = await supabase
      .from('widgets')
      .select('*')
      .eq('id', widgetId)
      .single()

    if (fetchErr || !targetWidget) {
      return { success: false, error: 'Widget not found' }
    }

    const def = getWidgetDefinition(targetWidget.type)
    if (def) {
      const parsed = def.schema.safeParse(config)
      if (!parsed.success) {
        return {
          success: false,
          error: 'Configuration failed schema validation: ' + parsed.error.message,
        }
      }
      config = parsed.data as Record<string, unknown>
    }

    const { data: updated, error: updateErr } = await supabase
      .from('widgets')
      .update({ config })
      .eq('id', widgetId)
      .select()
      .single()

    if (updateErr || !updated) {
      return { success: false, error: updateErr?.message || 'Config update failed' }
    }

    return { success: true, data: updated as WidgetData }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update widget config',
    }
  }
}

/**
 * Removes a widget by ID.
 * Database foreign key cascade ensures all entries belonging to this widget are deleted.
 */
export async function deleteWidget(
  widgetId: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('widgets').delete().eq('id', widgetId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: { id: widgetId } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete widget',
    }
  }
}

/**
 * Programmatic helper to add a test sticky note on a page.
 * Scans for an open non-overlapping slot on the page before inserting.
 */
export async function addTestStickyNote(
  monthId: string,
  page: PageSide = 'left',
): Promise<ActionResult<WidgetData>> {
  try {
    const supabase = await createClient()

    const def = getWidgetDefinition('sticky_note')
    const w = def?.defaultSize.w ?? 7
    const h = def?.defaultSize.h ?? 6

    // Fetch existing widgets on the page
    const { data: existingWidgets, error: fetchErr } = await supabase
      .from('widgets')
      .select('*')
      .eq('month_id', monthId)
      .eq('page', page)

    if (fetchErr) {
      return { success: false, error: fetchErr.message }
    }

    const rects: WidgetRect[] = (existingWidgets || []).map((wgt) => ({
      x: wgt.x,
      y: wgt.y,
      w: wgt.w,
      h: wgt.h,
    }))

    // Find next non-overlapping position
    const freeSlot = findNextAvailablePosition(rects, w, h)
    if (!freeSlot) {
      return {
        success: false,
        error: `No space available on the ${page} page for a ${w}×${h} sticky note`,
      }
    }

    const { data: inserted, error: insertErr } = await supabase
      .from('widgets')
      .insert({
        month_id: monthId,
        page,
        type: 'sticky_note',
        x: freeSlot.x,
        y: freeSlot.y,
        w,
        h,
        config: { text: 'Remember to...' },
        z: 0,
      })
      .select()
      .single()

    if (insertErr || !inserted) {
      return {
        success: false,
        error: insertErr?.message || 'Failed to insert sticky note',
      }
    }

    return { success: true, data: inserted as WidgetData }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to add test sticky note',
    }
  }
}
