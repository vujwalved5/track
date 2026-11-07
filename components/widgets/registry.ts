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

// ── Register initial built-in widget(s) ───────────────────────
registerWidget(stickyNoteWidgetDefinition)
registerWidget(memorableMomentsWidgetDefinition)
registerWidget(habitTrackerWidgetDefinition)
registerWidget(counterWidgetDefinition)
