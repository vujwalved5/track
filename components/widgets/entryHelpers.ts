/**
 * Client-Side Entry Helpers & Offline Synchronization
 * Memorable Moments — Phase 5 / Task 10 & Phase 6 / Task 12 / Task 14
 *
 * Rules:
 * - Per-cell save queue: Sequential execution per (widget_id, day); last edit always wins.
 * - Save on blur and Enter immediately; keep debounce only for rapid typing, capped at 400ms.
 * - Flush pending saves on visibilitychange (hidden) and pagehide using fetch with keepalive: true.
 * - Warn with beforeunload only if a save is still pending or in-flight.
 * - Automatic retry: 3 tries with increasing delay (400ms, 800ms, 1600ms).
 * - Cache merge rule: Only unsynced (pending/failed) entries override server data.
 *   Once write succeeds, remove from pending set so server copy wins again.
 * - Shows book-style save status near page folio via useSaveStatusStore.
 */

import { getWidgetEntries, saveWidgetEntry } from './entryActions'
import { useEntriesVersionStore } from '@/store/entriesVersion'
import { useSaveStatusStore } from '@/store/saveStatusStore'
import {
  getActiveUserId,
  getActiveUserIdSync,
  getLocalCachedEntries,
  setLocalCachedEntries,
  updateLocalCachedDay,
  enqueueOfflineSave,
  removePendingEntry,
  getPendingEntriesForWidget,
  getPendingQueue,
} from '@/lib/offlineSync'

export interface WidgetEntryRow {
  id: string
  widget_id: string
  day: number
  value: Record<string, unknown>
  created_at: string
  updated_at?: string
}

let initialEntriesCache: Map<string, WidgetEntryRow[]> | null = null

// ── In-Memory Per-Cell Queues & Debounce Tracking ──────────────

interface PendingDebounce {
  timer: NodeJS.Timeout
  widgetId: string
  day: number
  value: Record<string, unknown>
}

interface PendingConfigDebounce {
  timer: NodeJS.Timeout
  widgetId: string
  config: Record<string, unknown>
}

const cellQueues = new Map<string, Promise<unknown>>()
const debouncedCellTimers = new Map<string, PendingDebounce>()
const inFlightSaves = new Set<string>()

const configQueues = new Map<string, Promise<unknown>>()
const debouncedConfigTimers = new Map<string, PendingConfigDebounce>()
const inFlightConfigSaves = new Set<string>()

function getCellKey(widgetId: string, day: number): string {
  return `${widgetId}:${day}`
}

// ── Priming Cache with SSR Data & Pending Merge (Amendment 2) ──

/**
 * Primes the client entries cache with initial entries fetched during SSR,
 * merged with any currently unsynced (pending / failed) edits.
 */
export function setInitialEntries(
  entries: WidgetEntryRow[],
  widgetIds?: string[],
) {
  const map = new Map<string, WidgetEntryRow[]>()
  if (widgetIds) {
    for (const wid of widgetIds) {
      map.set(wid, [])
    }
  }

  // 1. Map server entries
  for (const entry of entries) {
    const list = map.get(entry.widget_id) || []
    list.push(entry)
    map.set(entry.widget_id, list)
  }

  // 2. Cache merge rule (Amendment 2):
  // ONLY entries that are still unsynced (pending or failed) override server data.
  const userId = getActiveUserIdSync()
  if (userId) {
    const pendingItems = getPendingQueue(userId)
    for (const pending of pendingItems) {
      const list = map.get(pending.widgetId) || []
      const existingIdx = list.findIndex((row) => row.day === pending.day)
      const now = new Date(pending.timestamp || Date.now()).toISOString()
      const mergedRow: WidgetEntryRow = {
        id: `pending-${pending.widgetId}-${pending.day}`,
        widget_id: pending.widgetId,
        day: pending.day,
        value: pending.value,
        created_at: now,
        updated_at: now,
      }
      if (existingIdx >= 0) {
        list[existingIdx] = mergedRow
      } else {
        list.push(mergedRow)
      }
      map.set(pending.widgetId, list)
    }
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
 */
export function getInitialWidgetEntries(widgetId: string): WidgetEntryRow[] {
  if (initialEntriesCache && initialEntriesCache.has(widgetId)) {
    const list = initialEntriesCache.get(widgetId) || []
    // Overlay any active debounced entries currently uncommitted
    const userId = getActiveUserIdSync()
    if (userId) {
      const pendingMap = getPendingEntriesForWidget(userId, widgetId)
      if (pendingMap.size > 0) {
        const merged = [...list]
        for (const [day, pending] of pendingMap.entries()) {
          const idx = merged.findIndex((r) => r.day === day)
          const row: WidgetEntryRow = {
            id: `pending-${widgetId}-${day}`,
            widget_id: widgetId,
            day,
            value: pending.value,
            created_at: new Date(pending.timestamp).toISOString(),
            updated_at: new Date(pending.timestamp).toISOString(),
          }
          if (idx >= 0) {
            merged[idx] = row
          } else {
            merged.push(row)
          }
        }
        return merged
      }
    }
    return list
  }
  return []
}

/**
 * Retrieves widget entries with transparent offline fallback.
 */
export async function getWidgetEntriesWithCache(widgetId: string): Promise<{
  success: boolean
  data?: WidgetEntryRow[]
  error?: string
}> {
  if (initialEntriesCache && initialEntriesCache.has(widgetId)) {
    return { success: true, data: getInitialWidgetEntries(widgetId) }
  }

  const userId = await getActiveUserId()

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

// ── In-Memory Cache Updater ───────────────────────────────────

function updateMemoryCache(
  widgetId: string,
  day: number,
  value: Record<string, unknown>,
) {
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

// ── Sequential Execution with Retries ─────────────────────────

async function executeCellSaveWithRetries(
  widgetId: string,
  day: number,
  value: Record<string, unknown>,
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const cellKey = getCellKey(widgetId, day)
  inFlightSaves.add(cellKey)
  useSaveStatusStore.getState().incrementPending()

  const userId = await getActiveUserId()

  // 1. If currently offline: record in pending queue and update local state
  if (typeof window !== 'undefined' && !navigator.onLine) {
    if (userId) {
      enqueueOfflineSave(userId, widgetId, day, value)
      updateLocalCachedDay(userId, widgetId, day, value)
    }
    updateMemoryCache(widgetId, day, value)
    useEntriesVersionStore.getState().bump(widgetId)
    useSaveStatusStore.getState().setStatus('retrying', { error: 'Waiting to sync' })
    inFlightSaves.delete(cellKey)
    useSaveStatusStore.getState().decrementPending()
    return { success: true, data: { widget_id: widgetId, day, value } }
  }

  // 2. Optimistically queue as pending in case refresh happens during in-flight network call
  if (userId) {
    enqueueOfflineSave(userId, widgetId, day, value)
  }

  let lastError = ''
  // 3. Retry up to 3 times with increasing delay (400ms, 800ms, 1600ms)
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await saveWidgetEntry(widgetId, day, value)
      if (res.success && res.data) {
        // Success: remove from pending queue so server copy wins from now on (Amendment 2)
        if (userId) {
          removePendingEntry(userId, widgetId, day)
          updateLocalCachedDay(userId, widgetId, day, value)
        }
        updateMemoryCache(widgetId, day, value)
        useEntriesVersionStore.getState().bump(widgetId)
        inFlightSaves.delete(cellKey)
        useSaveStatusStore.getState().decrementPending()
        return res
      } else {
        lastError = res.error || 'Failed to save entry'
        if (attempt < 3) {
          useSaveStatusStore.getState().setStatus('retrying', {
            retryCount: attempt,
            error: 'not saved, retrying',
          })
          await new Promise((r) => setTimeout(r, 400 * Math.pow(2, attempt - 1)))
        }
      }
    } catch (err) {
      lastError = err instanceof Error ? err.message : 'Failed to save entry'
      if (attempt < 3) {
        useSaveStatusStore.getState().setStatus('retrying', {
          retryCount: attempt,
          error: 'not saved, retrying',
        })
        await new Promise((r) => setTimeout(r, 400 * Math.pow(2, attempt - 1)))
      }
    }
  }

  // If all 3 attempts failed: retain in pending queue for offline / manual retry
  if (userId) {
    enqueueOfflineSave(userId, widgetId, day, value)
  }
  useSaveStatusStore.getState().setStatus('error', {
    retryCount: 3,
    error: 'not saved, retrying',
  })
  inFlightSaves.delete(cellKey)
  useSaveStatusStore.getState().decrementPending()
  return { success: false, error: lastError }
}

// ── Per-Cell Queued Save (Public API) ──────────────────────────

/**
 * Saves a widget entry through a per-cell sequential queue.
 * Guarantees later edits to the same (widget_id, day) wait for earlier ones,
 * ensuring the last edit always wins without out-of-order race conditions.
 */
export async function saveWidgetEntryAndBump(
  widgetId: string,
  day: number,
  value: Record<string, unknown>,
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const cellKey = getCellKey(widgetId, day)

  // Cancel any pending debounced save for this cell since we are saving now
  const pendingDebounce = debouncedCellTimers.get(cellKey)
  if (pendingDebounce) {
    clearTimeout(pendingDebounce.timer)
    debouncedCellTimers.delete(cellKey)
  }

  const prevPromise = cellQueues.get(cellKey) || Promise.resolve()

  const currentPromise = prevPromise
    .catch(() => {}) // Don't let previous rejection block next save
    .then(() => executeCellSaveWithRetries(widgetId, day, value))

  cellQueues.set(cellKey, currentPromise)
  return (await currentPromise) as { success: boolean; data?: unknown; error?: string }
}

/**
 * Schedules a debounced entry save (capped at 400ms) for rapid keystrokes.
 */
export function scheduleDebouncedEntrySave(
  widgetId: string,
  day: number,
  value: Record<string, unknown>,
  delayMs = 400,
) {
  const cellKey = getCellKey(widgetId, day)
  const existing = debouncedCellTimers.get(cellKey)
  if (existing) {
    clearTimeout(existing.timer)
  }

  // Update memory cache immediately so UI feels responsive
  updateMemoryCache(widgetId, day, value)
  const userId = getActiveUserIdSync()
  if (userId) {
    enqueueOfflineSave(userId, widgetId, day, value)
  }

  const timer = setTimeout(() => {
    debouncedCellTimers.delete(cellKey)
    saveWidgetEntryAndBump(widgetId, day, value)
  }, Math.min(400, Math.max(50, delayMs)))

  debouncedCellTimers.set(cellKey, { timer, widgetId, day, value })
}

// ── Config Save Queue & Debounce (FreeNote & StickyNote) ───────

async function executeConfigSaveWithRetries(
  widgetId: string,
  config: Record<string, unknown>,
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  inFlightConfigSaves.add(widgetId)
  useSaveStatusStore.getState().incrementPending()

  const { updateWidgetConfig } = await import('./widgetActions')

  let lastError = ''
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await updateWidgetConfig(widgetId, config)
      if (res.success) {
        inFlightConfigSaves.delete(widgetId)
        useSaveStatusStore.getState().decrementPending()
        return res
      } else {
        lastError = res.error || 'Failed to update config'
        if (attempt < 3) {
          useSaveStatusStore.getState().setStatus('retrying', {
            retryCount: attempt,
            error: 'not saved, retrying',
          })
          await new Promise((r) => setTimeout(r, 400 * Math.pow(2, attempt - 1)))
        }
      }
    } catch (err) {
      lastError = err instanceof Error ? err.message : 'Failed to update config'
      if (attempt < 3) {
        useSaveStatusStore.getState().setStatus('retrying', {
          retryCount: attempt,
          error: 'not saved, retrying',
        })
        await new Promise((r) => setTimeout(r, 400 * Math.pow(2, attempt - 1)))
      }
    }
  }

  useSaveStatusStore.getState().setStatus('error', {
    retryCount: 3,
    error: 'not saved, retrying',
  })
  inFlightConfigSaves.delete(widgetId)
  useSaveStatusStore.getState().decrementPending()
  return { success: false, error: lastError }
}

export async function saveWidgetConfigQueued(
  widgetId: string,
  config: Record<string, unknown>,
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const existing = debouncedConfigTimers.get(widgetId)
  if (existing) {
    clearTimeout(existing.timer)
    debouncedConfigTimers.delete(widgetId)
  }

  const prev = configQueues.get(widgetId) || Promise.resolve()
  const nextPromise = prev
    .catch(() => {})
    .then(() => executeConfigSaveWithRetries(widgetId, config))

  configQueues.set(widgetId, nextPromise)
  return (await nextPromise) as { success: boolean; data?: unknown; error?: string }
}

export function scheduleDebouncedConfigSave(
  widgetId: string,
  config: Record<string, unknown>,
  delayMs = 400,
) {
  const existing = debouncedConfigTimers.get(widgetId)
  if (existing) {
    clearTimeout(existing.timer)
  }

  const timer = setTimeout(() => {
    debouncedConfigTimers.delete(widgetId)
    saveWidgetConfigQueued(widgetId, config)
  }, Math.min(400, Math.max(50, delayMs)))

  debouncedConfigTimers.set(widgetId, { timer, widgetId, config })
}

// ── Flush on Unload & Visibility Listeners ─────────────────────

/**
 * Immediately flushes all debounced and pending saves.
 * When `useKeepalive` is true, sends fetch with keepalive: true to ensure
 * requests survive page refresh and tab close.
 */
export function flushPendingSaves(useKeepalive = false) {
  // 1. Flush debounced entry saves
  for (const [cellKey, item] of debouncedCellTimers.entries()) {
    clearTimeout(item.timer)
    debouncedCellTimers.delete(cellKey)

    if (useKeepalive && typeof window !== 'undefined' && navigator.onLine) {
      try {
        fetch('/api/entries/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            widgetId: item.widgetId,
            day: item.day,
            value: item.value,
          }),
          keepalive: true,
        }).catch(() => {})
      } catch {
        // Ignore
      }
    } else {
      saveWidgetEntryAndBump(item.widgetId, item.day, item.value)
    }
  }

  // 2. Flush debounced config saves
  for (const [widgetId, item] of debouncedConfigTimers.entries()) {
    clearTimeout(item.timer)
    debouncedConfigTimers.delete(widgetId)

    if (useKeepalive && typeof window !== 'undefined' && navigator.onLine) {
      try {
        fetch('/api/widgets/config/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            widgetId: item.widgetId,
            config: item.config,
          }),
          keepalive: true,
        }).catch(() => {})
      } catch {
        // Ignore
      }
    } else {
      saveWidgetConfigQueued(item.widgetId, item.config)
    }
  }
}

// ── Browser Lifecycle Hooks ───────────────────────────────────

if (typeof window !== 'undefined') {
  // Flush on visibilitychange (hidden)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushPendingSaves(true)
    }
  })

  // Flush on pagehide
  window.addEventListener('pagehide', () => {
    flushPendingSaves(true)
  })

  // Warn on beforeunload only if a save is still actively in-flight or debounced
  window.addEventListener('beforeunload', (e) => {
    const hasPendingDebounce =
      debouncedCellTimers.size > 0 || debouncedConfigTimers.size > 0
    const hasInFlight = inFlightSaves.size > 0 || inFlightConfigSaves.size > 0

    if (hasPendingDebounce || hasInFlight) {
      // Trigger keepalive flush immediately
      flushPendingSaves(true)
      e.preventDefault()
      e.returnValue = ''
      return ''
    }
  })
}
