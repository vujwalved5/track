/**
 * Widget Engine Types & Geometry Utilities
 * Memorable Moments — Phase 4 / Task 7
 *
 * Locked constraints:
 * - 22px grid units (L7, L10)
 * - Page dimensions: 22 cols × 30 rows = 484 × 660 px (L7, L8)
 * - Strict bounds clamping and no-overlap enforcement (UI + Server)
 */

import type { ComponentType } from 'react'
import type { z } from 'zod'
import { PAGE_COLS, PAGE_ROWS, GRID_PX } from '../paper'

export { PAGE_COLS, PAGE_ROWS, GRID_PX }

export type PageSide = 'left' | 'right'

export interface WidgetSize {
  w: number // grid units (1..22)
  h: number // grid units (1..30)
}

export interface WidgetRect {
  x: number // grid units (0..21)
  y: number // grid units (0..29)
  w: number
  h: number
}

export interface WidgetData extends WidgetRect {
  id: string
  created_at: string
  month_id: string
  page: PageSide
  type: string
  config: Record<string, unknown>
  z: number
}

export interface WidgetRenderProps<T = Record<string, unknown>> {
  id: string
  config: T
  w: number
  h: number
  isArrangeMode?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface WidgetDefinition<TSchema extends z.ZodTypeAny = any> {
  id: string
  displayName: string
  defaultSize: WidgetSize
  minSize: WidgetSize
  schema: TSchema
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<WidgetRenderProps<any>>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mobileComponent: ComponentType<WidgetRenderProps<any>>
  icon: ComponentType<{ className?: string }>
}

// ── Geometry & Collision Math ─────────────────────────────────

/**
 * Checks if two rectangles overlap on the 22px grid.
 * Touching edges (e.g. A.x + A.w === B.x) do NOT overlap.
 */
export function hasOverlap(a: WidgetRect, b: WidgetRect): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  )
}

/**
 * Checks if a rectangle stays strictly within page bounds.
 */
export function isWithinBounds(
  rect: WidgetRect,
  cols = PAGE_COLS,
  rows = PAGE_ROWS,
): boolean {
  return (
    rect.x >= 0 &&
    rect.y >= 0 &&
    rect.w > 0 &&
    rect.h > 0 &&
    rect.x + rect.w <= cols &&
    rect.y + rect.h <= rows
  )
}

/**
 * Validates whether a candidate widget placement satisfies:
 * 1. Bounds (within 22x30 grid)
 * 2. Minimum size constraints
 * 3. No overlap with any other widget on that page
 */
export function isValidPlacement(
  candidate: WidgetRect,
  minSize: WidgetSize,
  otherWidgets: WidgetRect[],
  cols = PAGE_COLS,
  rows = PAGE_ROWS,
): boolean {
  if (candidate.w < minSize.w || candidate.h < minSize.h) {
    return false
  }

  if (!isWithinBounds(candidate, cols, rows)) {
    return false
  }

  for (const other of otherWidgets) {
    if (hasOverlap(candidate, other)) {
      return false
    }
  }

  return true
}

/**
 * Finds the first available non-overlapping position on the page
 * scanning row-by-row, column-by-column.
 */
export function findNextAvailablePosition(
  existing: WidgetRect[],
  w: number,
  h: number,
  cols = PAGE_COLS,
  rows = PAGE_ROWS,
): { x: number; y: number } | null {
  for (let y = 0; y <= rows - h; y++) {
    for (let x = 0; x <= cols - w; x++) {
      const candidate: WidgetRect = { x, y, w, h }
      const overlaps = existing.some((item) => hasOverlap(candidate, item))
      if (!overlaps) {
        return { x, y }
      }
    }
  }
  return null
}
