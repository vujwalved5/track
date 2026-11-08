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
import { getWidgetMetadata } from './widgetMetadata'

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

    // 2. Enforce minimum size from metadata
    const meta = getWidgetMetadata(targetWidget.type)
    const minW = meta?.minSize.w ?? 1
    const minH = meta?.minSize.h ?? 1

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

    const meta = getWidgetMetadata(targetWidget.type)
    if (meta) {
      const parsed = meta.schema.safeParse(config)
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
 * Places a newly selected widget on a page at (x, y) with its default dimensions.
 * Strictly verifies bounds and no-overlap before writing to Supabase.
 */
export async function createWidget(
  monthId: string,
  page: PageSide,
  type: string,
  x: number,
  y: number,
  w?: number,
  h?: number,
  id?: string,
): Promise<ActionResult<WidgetData>> {
  try {
    const supabase = await createClient()

    const meta = getWidgetMetadata(type)
    if (!meta) {
      return { success: false, error: `Unknown widget type: ${type}` }
    }

    const candidateW = w !== undefined ? Math.round(w) : meta.defaultSize.w
    const candidateH = h !== undefined ? Math.round(h) : meta.defaultSize.h

    if (candidateW < meta.minSize.w || candidateH < meta.minSize.h) {
      return {
        success: false,
        error: `Widget size ${candidateW}×${candidateH} is below minimum allowed size ${meta.minSize.w}×${meta.minSize.h}`,
      }
    }

    const candidate: WidgetRect = {
      x: Math.round(x),
      y: Math.round(y),
      w: candidateW,
      h: candidateH,
    }

    if (!isWithinBounds(candidate, PAGE_COLS, PAGE_ROWS)) {
      return {
        success: false,
        error: 'Widget placement exceeds page bounds (22 cols × 30 rows)',
      }
    }

    // Check sibling widgets on this page
    const { data: siblingWidgets, error: siblingsErr } = await supabase
      .from('widgets')
      .select('*')
      .eq('month_id', monthId)
      .eq('page', page)

    if (siblingsErr) {
      return { success: false, error: siblingsErr.message }
    }

    for (const other of siblingWidgets || []) {
      const otherRect: WidgetRect = {
        x: other.x,
        y: other.y,
        w: other.w,
        h: other.h,
      }
      if (hasOverlap(candidate, otherRect)) {
        return {
          success: false,
          error: 'Widget overlaps with an existing widget on this page',
        }
      }
    }

    // Default configuration inferred from schema
    const parsedConfig = meta.schema.safeParse({})
    const initialConfig = parsedConfig.success
      ? (parsedConfig.data as Record<string, unknown>)
      : {}

    const widgetId = id || crypto.randomUUID()

    const { data: inserted, error: insertErr } = await supabase
      .from('widgets')
      .insert({
        id: widgetId,
        month_id: monthId,
        page,
        type,
        x: candidate.x,
        y: candidate.y,
        w: candidate.w,
        h: candidate.h,
        config: initialConfig,
        z: 0,
      } as any)
      .select()
      .single()

    if (insertErr || !inserted) {
      return {
        success: false,
        error: insertErr?.message || 'Failed to place widget',
      }
    }

    return { success: true, data: inserted as WidgetData }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to place widget',
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

    const meta = getWidgetMetadata('sticky_note')
    const w = meta?.defaultSize.w ?? 7
    const h = meta?.defaultSize.h ?? 6

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
