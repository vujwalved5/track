/**
 * Client-Side Entry Helpers & Offline Synchronization
 * Memorable Moments — Phase 5 / Task 10 & Phase 6 / Task 12
 *
 * Rules:
 * - Wraps saveWidgetEntry and getWidgetEntries with offline caching (Correction 3).
 * - Only ENTRY reads and writes work offline (Correction 3).
 * - Bumps global entriesVersionStore on successful save or optimistic offline write.
 * - Local cache keyed strictly by user ID (Correction 2: Privacy / L11).
 * - Automatically enqueues pending saves while offline and replays when online.
 */

import { getWidgetEntries, saveWidgetEntry } from './entryActions'
import { useEntriesVersionStore } from '@/store/entriesVersion'
import {
  getActiveUserId,
  getLocalCachedEntries,
  setLocalCachedEntries,
  updateLocalCachedDay,
  enqueueOfflineSave,
} from '@/lib/offlineSync'

export interface WidgetEntryRow {
  id: string
  widget_id: string
  day: number
  value: Record<string, unknown>
  created_at: string
  updated_at: string
}

let initialEntriesCache: Map<string, WidgetEntryRow[]> | null = null

/**
 * Primes the client entries cache with initial entries fetched during SSR.
 * Also seeds known widget IDs so widgets with 0 entries will not trigger network waterfalls.
 */
export function setInitialEntries(entries: WidgetEntryRow[], widgetIds?: string[]) {
  const map = new Map<string, WidgetEntryRow[]>()
  if (widgetIds) {
    for (const wid of widgetIds) {
      map.set(wid, [])
    }
  }
  for (const entry of entries) {
    const list = map.get(entry.widget_id) || []
    list.push(entry)
    map.set(entry.widget_id, list)
  }
  initialEntriesCache = map
}

/**
 * Registers a newly created widget in cache with an empty entry list.
 */
export function registerWidgetInCache(widgetId: string) {
  if (initialEntriesCache && !initialEntriesCache.has(widgetId)) {
    initialEntriesCache.set(widgetId, [])
  }
}

/**
 * Synchronously retrieves initial entries for a given widget ID from memory cache.
 * Returns an empty array if not cached or if the widget has 0 entries.
 */
export function getInitialWidgetEntries(widgetId: string): WidgetEntryRow[] {
  if (initialEntriesCache && initialEntriesCache.has(widgetId)) {
    return initialEntriesCache.get(widgetId) || []
  }
  return []
}

/**
 * Retrieves widget entries with transparent offline fallback.
 * - When primed with initial SSR entries: returns immediately from memory.
 * - When online: fetches from Supabase and populates local user cache.
 * - When offline: serves cached entries from local storage.
 */
export async function getWidgetEntriesWithCache(widgetId: string): Promise<{
  success: boolean
  data?: WidgetEntryRow[]
  error?: string
}> {
  // 1. If primed with initial server entries, serve synchronously from memory cache
  if (initialEntriesCache && initialEntriesCache.has(widgetId)) {
    const data = initialEntriesCache.get(widgetId) || []
    return { success: true, data }
  }

  const userId = await getActiveUserId()

  // 2. If currently offline, return immediately from local cache
  if (typeof window !== 'undefined' && !navigator.onLine && userId) {
    const cached = getLocalCachedEntries(userId, widgetId)
    if (cached) {
      return {
        success: true,
        data: cached.map((c) => ({
          id: `local-${widgetId}-${c.day}`,
          widget_id: widgetId,
          day: c.day,
          value: c.value,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })),
      }
    }
    return { success: true, data: [] }
  }

  // 3. Online: query server action
  try {
    const res = await getWidgetEntries(widgetId)
    if (res.success && res.data) {
      if (initialEntriesCache) {
        initialEntriesCache.set(widgetId, res.data as WidgetEntryRow[])
      }
      if (userId) {
        setLocalCachedEntries(
          userId,
          widgetId,
          res.data.map((row) => ({
            day: row.day,
            value: row.value as Record<string, unknown>,
          })),
        )
      }
    }
    return res as { success: boolean; data?: WidgetEntryRow[]; error?: string }
  } catch {
    // Fallback to local cache if network drops
    if (userId) {
      const cached = getLocalCachedEntries(userId, widgetId)
      if (cached) {
        return {
          success: true,
          data: cached.map((c) => ({
            id: `local-${widgetId}-${c.day}`,
            widget_id: widgetId,
            day: c.day,
            value: c.value,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })),
        }
      }
    }
    return { success: false, error: 'Network error' }
  }
}

/**
 * Saves a widget entry via server action or queues it offline.
 * Bumps the global entriesVersion store in either case so charts re-render.
 */
export async function saveWidgetEntryAndBump(
  widgetId: string,
  day: number,
  value: Record<string, unknown>,
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const updateMemoryCache = () => {
    if (initialEntriesCache) {
      const list = initialEntriesCache.get(widgetId) || []
      const existingIdx = list.findIndex((row) => row.day === day)
      const now = new Date().toISOString()
      if (existingIdx >= 0) {
        list[existingIdx] = {
          ...list[existingIdx],
          value,
          updated_at: now,
        }
      } else {
        list.push({
          id: `entry-${widgetId}-${day}`,
          widget_id: widgetId,
          day,
          value,
          created_at: now,
          updated_at: now,
        })
      }
      initialEntriesCache.set(widgetId, list)
    }
  }

  const userId = await getActiveUserId()

  // 1. If offline, optimistically update local cache and enqueue pending replay
  if (typeof window !== 'undefined' && !navigator.onLine && userId) {
    enqueueOfflineSave(userId, widgetId, day, value)
    updateLocalCachedDay(userId, widgetId, day, value)
    updateMemoryCache()
    useEntriesVersionStore.getState().bump()
    return { success: true, data: { widget_id: widgetId, day, value } }
  }

  // 2. If online, attempt server action
  try {
    const res = await saveWidgetEntry(widgetId, day, value)
    if (res.success) {
      if (userId) {
        updateLocalCachedDay(userId, widgetId, day, value)
      }
      updateMemoryCache()
      useEntriesVersionStore.getState().bump()
      return res
    } else {
      // If server action failed due to dropped connection, queue offline
      if (userId && typeof window !== 'undefined' && !navigator.onLine) {
        enqueueOfflineSave(userId, widgetId, day, value)
        updateLocalCachedDay(userId, widgetId, day, value)
        updateMemoryCache()
        useEntriesVersionStore.getState().bump()
        return { success: true, data: { widget_id: widgetId, day, value } }
      }
      return res
    }
  } catch {
    if (userId) {
      enqueueOfflineSave(userId, widgetId, day, value)
      updateLocalCachedDay(userId, widgetId, day, value)
      updateMemoryCache()
      useEntriesVersionStore.getState().bump()
      return { success: true, data: { widget_id: widgetId, day, value } }
    }
    return { success: false, error: 'Save failed' }
  }
}
