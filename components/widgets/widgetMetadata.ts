/**
 * Widget Metadata & Collision Utilities
 * Memorable Moments — Phase 4 / Task F1
 *
 * Locked rules:
 * - Minimum sizes are defined ONLY here (Condition 1)
 * - All 14 registry types included (Condition 2)
 * - Pure data & Zod schemas: client-safe and server-safe pure TS, NO React components
 * - Server-safe: imported by Server Actions (widgetActions.ts) without client boundary leaks (Condition 3)
 */

import { z } from 'zod'
import type { WidgetGroup, WidgetSize, WidgetRect } from './types'
import { PAGE_COLS, PAGE_ROWS, hasOverlap, isWithinBounds } from './types'

export interface WidgetTypeMetadata {
  id: string
  displayName: string
  group: WidgetGroup
  defaultSize: WidgetSize
  minSize: WidgetSize
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: z.ZodTypeAny
}

// ── Configuration Schemas (Pure Zod, Server-Safe) ─────────────
export const stickyNoteConfigSchema = z.object({
  text: z.string().default('Remember to...'),
})

export const freeNoteConfigSchema = z.object({
  paper: z.enum(['lined', 'blank']).default('lined'),
  text: z.string().default(''),
})

export const counterConfigSchema = z.object({
  label: z.string().default('Counter'),
  target: z.number().optional(),
  perDay: z.boolean().default(false),
})

export const goalBarConfigSchema = z.object({
  title: z.string().default('Monthly Goal'),
  target: z.number().default(100),
  sourceWidgetId: z.string().default(''),
  unit: z.string().default(''),
  orientation: z.enum(['across', 'down']).default('across'),
})

export const lineGraphConfigSchema = z.object({
  title: z.string().default('Line Graph'),
  sourceWidgetId: z.string().default(''),
  orientation: z.enum(['across', 'down']).default('across'),
  vertical: z.boolean().optional(),
})

export const barChartConfigSchema = z.object({
  title: z.string().default('Daily Bars'),
  sourceWidgetId: z.string().default(''),
  orientation: z.enum(['across', 'down']).default('across'),
})

export const scatterPlotConfigSchema = z.object({
  title: z.string().default('Scatter Plot'),
  sourceWidgetId: z.string().default(''),
  sourceWidgetId2: z.string().default(''),
  xSourceWidgetId: z.string().default(''),
  ySourceWidgetId: z.string().default(''),
  orientation: z.enum(['across', 'down']).default('across'),
})

export const donutConfigSchema = z.object({
  title: z.string().default('Monthly Share'),
  sourceWidgetId: z.string().default(''),
})

export const habitTrackerConfigSchema = z.object({
  title: z.string().default('Habits'),
})

export const numberLogConfigSchema = z.object({
  label: z.string().default('Reading'),
  unit: z.string().default('min'),
})

export const pollConfigSchema = z.object({
  question: z.string().default('How was the day?'),
  options: z
    .array(z.string())
    .min(2)
    .max(5)
    .default(['Great', 'Okay', 'Tough']),
})

export const memorableMomentsConfigSchema = z.object({
  title: z.string().default('Memorable Moments'),
})

export const moodTrackerConfigSchema = z.object({
  title: z.string().default('Daily Mood'),
})

export const checklistConfigSchema = z.object({
  title: z.string().default('To Do'),
})

// ── Complete 14-Widget Metadata Definitions ────────────────────
export const WIDGET_METADATA: Record<string, WidgetTypeMetadata> = {
  // Text widgets: minSize 3x2
  sticky_note: {
    id: 'sticky_note',
    displayName: 'Sticky note',
    group: 'Write',
    defaultSize: { w: 7, h: 6 },
    minSize: { w: 3, h: 2 },
    schema: stickyNoteConfigSchema,
  },
  'free-note': {
    id: 'free-note',
    displayName: 'Free Note',
    group: 'Write',
    defaultSize: { w: 10, h: 10 },
    minSize: { w: 3, h: 2 },
    schema: freeNoteConfigSchema,
  },
  counter: {
    id: 'counter',
    displayName: 'Counter',
    group: 'Track',
    defaultSize: { w: 6, h: 6 },
    minSize: { w: 3, h: 2 },
    schema: counterConfigSchema,
  },
  'goal-bar': {
    id: 'goal-bar',
    displayName: 'Goal Bar',
    group: 'Ask',
    defaultSize: { w: 14, h: 4 },
    minSize: { w: 3, h: 2 },
    schema: goalBarConfigSchema,
  },

  // Charts & Donut: minSize 6x6
  'line-graph': {
    id: 'line-graph',
    displayName: 'Line Graph',
    group: 'Charts',
    defaultSize: { w: 14, h: 14 },
    minSize: { w: 6, h: 6 },
    schema: lineGraphConfigSchema,
  },
  'bar-chart': {
    id: 'bar-chart',
    displayName: 'Bar Chart',
    group: 'Charts',
    defaultSize: { w: 14, h: 12 },
    minSize: { w: 6, h: 6 },
    schema: barChartConfigSchema,
  },
  'scatter-plot': {
    id: 'scatter-plot',
    displayName: 'Scatter Plot',
    group: 'Charts',
    defaultSize: { w: 12, h: 12 },
    minSize: { w: 6, h: 6 },
    schema: scatterPlotConfigSchema,
  },
  donut: {
    id: 'donut',
    displayName: 'Donut',
    group: 'Charts',
    defaultSize: { w: 10, h: 10 },
    minSize: { w: 6, h: 6 },
    schema: donutConfigSchema,
  },

  // Trackers & Poll: minSize 4x6
  'habit-tracker': {
    id: 'habit-tracker',
    displayName: 'Habit Tracker',
    group: 'Track',
    defaultSize: { w: 14, h: 24 },
    minSize: { w: 4, h: 6 },
    schema: habitTrackerConfigSchema,
  },
  'number-log': {
    id: 'number-log',
    displayName: 'Number Log',
    group: 'Track',
    defaultSize: { w: 6, h: 24 },
    minSize: { w: 4, h: 6 },
    schema: numberLogConfigSchema,
  },
  poll: {
    id: 'poll',
    displayName: 'Poll',
    group: 'Ask',
    defaultSize: { w: 10, h: 8 },
    minSize: { w: 4, h: 6 },
    schema: pollConfigSchema,
  },

  // Remaining registry types
  'memorable-moments': {
    id: 'memorable-moments',
    displayName: 'Memorable Moments',
    group: 'Track',
    defaultSize: { w: 22, h: 18 },
    minSize: { w: 14, h: 18 },
    schema: memorableMomentsConfigSchema,
  },
  'mood-tracker': {
    id: 'mood-tracker',
    displayName: 'Mood Tracker',
    group: 'Track',
    defaultSize: { w: 22, h: 4 },
    minSize: { w: 14, h: 4 },
    schema: moodTrackerConfigSchema,
  },
  checklist: {
    id: 'checklist',
    displayName: 'Checklist',
    group: 'Ask',
    defaultSize: { w: 10, h: 10 },
    minSize: { w: 4, h: 4 },
    schema: checklistConfigSchema,
  },
}

/**
 * Retrieves metadata for a widget type.
 */
export function getWidgetMetadata(type: string): WidgetTypeMetadata | undefined {
  return WIDGET_METADATA[type]
}

/**
 * Finds the largest (w, h) that fits at (x, y) between minSize and defaultSize.
 * Returns null if even minSize does not fit within page bounds or collides with existing widgets.
 */
export function findFittingSizeAt(
  x: number,
  y: number,
  defaultSize: WidgetSize,
  minSize: WidgetSize,
  existingWidgets: WidgetRect[],
  cols = PAGE_COLS,
  rows = PAGE_ROWS,
): WidgetSize | null {
  // If even minSize exceeds page bounds, reject
  if (x + minSize.w > cols || y + minSize.h > rows) {
    return null
  }

  // If minSize collides with any existing widget, reject
  const minRect: WidgetRect = { x, y, w: minSize.w, h: minSize.h }
  if (existingWidgets.some((other) => hasOverlap(minRect, other))) {
    return null
  }

  // Scan down from defaultSize to minSize, finding the largest area (w * h)
  const maxW = Math.min(defaultSize.w, cols - x)
  const maxH = Math.min(defaultSize.h, rows - y)

  let bestSize: WidgetSize | null = null
  let maxArea = -1

  for (let w = maxW; w >= minSize.w; w--) {
    for (let h = maxH; h >= minSize.h; h--) {
      const candidate: WidgetRect = { x, y, w, h }
      const collides = existingWidgets.some((other) => hasOverlap(candidate, other))
      if (!collides) {
        const area = w * h
        if (area > maxArea) {
          maxArea = area
          bestSize = { w, h }
        }
      }
    }
  }

  return bestSize
}

/**
 * Scans row-by-row, col-by-col for the first position where at least minSize fits without collision.
 */
export function findFirstAvailableSpot(
  minSize: WidgetSize,
  defaultSize: WidgetSize,
  existingWidgets: WidgetRect[],
  cols = PAGE_COLS,
  rows = PAGE_ROWS,
): { x: number; y: number } | null {
  for (let y = 0; y <= rows - minSize.h; y++) {
    for (let x = 0; x <= cols - minSize.w; x++) {
      const fit = findFittingSizeAt(x, y, defaultSize, minSize, existingWidgets, cols, rows)
      if (fit !== null) {
        return { x, y }
      }
    }
  }
  return null
}
