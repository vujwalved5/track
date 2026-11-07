/**
 * Widget Registry
 * Memorable Moments — Phase 4 / Task 7
 *
 * Central registry for all widget types.
 * Each widget type registers:
 * - type id
 * - display name
 * - default size (grid units, 22px)
 * - minimum size (grid units, 22px)
 * - zod config schema
 * - render component (desktop)
 * - mobile render component
 * - hand-drawn SVG icon (L13)
 */

import type { WidgetDefinition, WidgetGroup } from './types'
import { stickyNoteWidgetDefinition } from './sticky-note/StickyNoteWidget'
import { memorableMomentsWidgetDefinition } from './memorable-moments/MemorableMomentsWidget'
import { habitTrackerWidgetDefinition } from './habit-tracker/HabitTrackerWidget'
import { counterWidgetDefinition } from './counter/CounterWidget'
import { pollWidgetDefinition } from './poll/PollWidget'
import { numberLogWidgetDefinition } from './number-log/NumberLogWidget'
import { moodTrackerWidgetDefinition } from './mood-tracker/MoodTrackerWidget'
import { lineGraphWidgetDefinition } from './line-graph/LineGraphWidget'
import { barChartWidgetDefinition } from './bar-chart/BarChartWidget'
import { scatterPlotWidgetDefinition } from './scatter-plot/ScatterPlotWidget'
import { donutWidgetDefinition } from './donut/DonutWidget'
import { goalBarWidgetDefinition } from './goal-bar/GoalBarWidget'
import { checklistWidgetDefinition } from './checklist/ChecklistWidget'
import { freeNoteWidgetDefinition } from './free-note/FreeNoteWidget'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const registry = new Map<string, WidgetDefinition<any>>()

/**
 * Registers a widget definition in the central registry.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function registerWidget(definition: WidgetDefinition<any>): void {
  registry.set(definition.id, definition)
}

/**
 * Gets a widget definition by type id.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getWidgetDefinition(type: string): WidgetDefinition<any> | undefined {
  return registry.get(type)
}

/**
 * Returns all registered widget definitions.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getAllWidgetDefinitions(): WidgetDefinition<any>[] {
  return Array.from(registry.values())
}

/**
 * Returns all registered widget definitions for a specific group.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getWidgetsByGroup(group: WidgetGroup): WidgetDefinition<any>[] {
  return Array.from(registry.values()).filter((def) => def.group === group)
}

// ── Register all built-in widgets ─────────────────────────────
registerWidget(stickyNoteWidgetDefinition)
registerWidget(memorableMomentsWidgetDefinition)
registerWidget(habitTrackerWidgetDefinition)
registerWidget(counterWidgetDefinition)
// Batch B
registerWidget(pollWidgetDefinition)
registerWidget(numberLogWidgetDefinition)
registerWidget(moodTrackerWidgetDefinition)
// Task 10 Batch A (Charts)
registerWidget(lineGraphWidgetDefinition)
registerWidget(barChartWidgetDefinition)
registerWidget(scatterPlotWidgetDefinition)
// Task 10 Batch B
registerWidget(donutWidgetDefinition)
registerWidget(goalBarWidgetDefinition)
registerWidget(checklistWidgetDefinition)
registerWidget(freeNoteWidgetDefinition)
