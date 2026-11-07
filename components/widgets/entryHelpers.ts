/**
 * Client-Side Entry Helpers
 * Memorable Moments — Phase 5 / Task 10
 *
 * Wraps the saveWidgetEntry server action and bumps the global entries
 * version counter on success, so chart widgets re-fetch automatically.
 *
 * Not a server action — this is client-side glue code.
 */

import { saveWidgetEntry } from './entryActions'
import { useEntriesVersionStore } from '@/store/entriesVersion'

/**
 * Saves a widget entry via the existing server action and, on success,
 * bumps the global entriesVersion so all chart widgets re-fetch.
 *
 * Drop-in replacement for saveWidgetEntry in widget components.
 * Return type is structurally compatible: { success, data?, error? }.
 */
export async function saveWidgetEntryAndBump(
  widgetId: string,
  day: number,
  value: Record<string, unknown>,
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const res = await saveWidgetEntry(widgetId, day, value)
  if (res.success) {
    useEntriesVersionStore.getState().bump()
  }
  return res
}
