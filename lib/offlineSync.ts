/**
 * Offline Sync and Local Entry Cache
 * Memorable Moments — Phase 6 / Task 12 (Batch B)
 *
 * Rules:
 * - Privacy (L11): Key all data by user ID; never cache another user's data (Correction 2).
 * - Clear all caches and replay queue on sign-out (Correction 2).
 * - Only ENTRY reads and writes work offline (Correction 3).
 * - Replay pending saves on "online" event and on app startup (Correction 3).
 * - Upserts are idempotent; drop item if widget no longer exists (Correction 3).
 */

import { saveWidgetEntry } from '@/components/widgets/entryActions'
import { createClient } from '@/lib/supabase/client'
import { useEntriesVersionStore } from '@/store/entriesVersion'

export interface PendingSaveItem {
  widgetId: string
  day: number
  value: Record<string, unknown>
  timestamp: number
}

let activeUserId: string | null = null

/**
 * Gets or loads the authenticated user's ID.
 */
export async function getActiveUserId(): Promise<string | null> {
  if (activeUserId) return activeUserId
  try {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session?.user?.id) {
      activeUserId = session.user.id
      return activeUserId
    }
  } catch {
    // Supabase auth can fail when offline; fallback to last known user id
    if (typeof window !== 'undefined') {
      activeUserId = localStorage.getItem('mm_last_user_id')
      return activeUserId
    }
  }
  return null
}

/**
 * Records the active user ID locally.
 */
export function setActiveUserId(userId: string | null) {
  activeUserId = userId
  if (typeof window !== 'undefined') {
    if (userId) {
      localStorage.setItem('mm_last_user_id', userId)
    } else {
      localStorage.removeItem('mm_last_user_id')
    }
  }
}

// ── Local Cache Key Helpers ───────────────────────────────────

function getCacheKey(userId: string, widgetId: string): string {
  return `mm_entries_${userId}:${widgetId}`
}

function getQueueKey(userId: string): string {
  return `mm_queue_${userId}`
}

// ── Entry Cache Functions ─────────────────────────────────────

/**
 * Retrieves cached entries for a widget belonging to the user.
 */
export function getLocalCachedEntries(
  userId: string,
  widgetId: string,
): Array<{ day: number; value: Record<string, unknown> }> | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(getCacheKey(userId, widgetId))
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * Stores full list of entries for a widget in local cache.
 */
export function setLocalCachedEntries(
  userId: string,
  widgetId: string,
  entries: Array<{ day: number; value: Record<string, unknown> }>,
): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(getCacheKey(userId, widgetId), JSON.stringify(entries))
  } catch {
    // Quota exceeded or private browsing
  }
}

/**
 * Optimistically updates a single day's entry in the local cache.
 */
export function updateLocalCachedDay(
  userId: string,
  widgetId: string,
  day: number,
  value: Record<string, unknown>,
): void {
  useEntriesVersionStore.getState().setLastMutatedWidgetId(widgetId)
  if (typeof window === 'undefined') return
  try {
    const existing = getLocalCachedEntries(userId, widgetId) || []
    const filtered = existing.filter((e) => e.day !== day)
    filtered.push({ day, value })
    setLocalCachedEntries(userId, widgetId, filtered)
  } catch {
    // Ignore
  }
}

// ── Replay Queue Functions ────────────────────────────────────

/**
 * Enqueues a pending save operation while offline.
 */
export function enqueueOfflineSave(
  userId: string,
  widgetId: string,
  day: number,
  value: Record<string, unknown>,
): void {
  useEntriesVersionStore.getState().setLastMutatedWidgetId(widgetId)
  if (typeof window === 'undefined') return
  try {
    const queueKey = getQueueKey(userId)
    const raw = localStorage.getItem(queueKey)
    const queue: PendingSaveItem[] = raw ? JSON.parse(raw) : []

    // Deduplicate/replace pending save for the exact same widget & day
    const updated = queue.filter(
      (item) => !(item.widgetId === widgetId && item.day === day),
    )
    updated.push({
      widgetId,
      day,
      value,
      timestamp: Date.now(),
    })

    localStorage.setItem(queueKey, JSON.stringify(updated))
  } catch {
    // Ignore
  }
}

/**
 * Drains and synchronizes pending saves when connection is restored.
 */
export async function drainOfflineQueue(userId: string): Promise<void> {
  if (typeof window === 'undefined') return
  if (!navigator.onLine) return

  const queueKey = getQueueKey(userId)
  const raw = localStorage.getItem(queueKey)
  if (!raw) return

  let queue: PendingSaveItem[] = []
  try {
    queue = JSON.parse(raw)
  } catch {
    localStorage.removeItem(queueKey)
    return
  }

  if (queue.length === 0) return

  const remaining: PendingSaveItem[] = []
  let anySaved = false

  for (const item of queue) {
    if (!navigator.onLine) {
      remaining.push(item)
      continue
    }

    try {
      const res = await saveWidgetEntry(item.widgetId, item.day, item.value)
      if (res.success) {
        anySaved = true
        useEntriesVersionStore.getState().bump(item.widgetId)
      } else {
        // Correction 3: If replay fails because widget no longer exists, drop that item
        const errMsg = String(res.error || '').toLowerCase()
        const isNotFound =
          errMsg.includes('not found') ||
          errMsg.includes('foreign key') ||
          errMsg.includes('violates foreign key') ||
          errMsg.includes('does not exist')

        if (isNotFound) {
          // Drop stale item
          continue
        } else {
          // Temporary network failure or server error; retain for retry
          remaining.push(item)
        }
      }
    } catch {
      remaining.push(item)
    }
  }

  if (remaining.length > 0) {
    localStorage.setItem(queueKey, JSON.stringify(remaining))
  } else {
    localStorage.removeItem(queueKey)
  }

  if (anySaved) {
    useEntriesVersionStore.getState().bump()
  }
}

// ── Sign-Out Cache Cleansing (Correction 2: Privacy / L11) ────

/**
 * Clears all service worker caches and local entry data on sign out.
 */
export async function clearAllLocalCaches(): Promise<void> {
  if (typeof window === 'undefined') return

  // 1. Remove all mm_* keys from localStorage
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('mm_')) {
      keysToRemove.push(key)
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key))
  activeUserId = null

  // 2. Clear all Service Worker CacheStorage
  if ('caches' in window) {
    try {
      const cacheNames = await window.caches.keys()
      await Promise.all(cacheNames.map((name) => window.caches.delete(name)))
    } catch {
      // Ignore
    }
  }

  // 3. Post CLEAR_CACHES message to active service worker controller
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHES' })
    } catch {
      // Ignore
    }
  }
}

// ── Auto-Replay Listeners (Replay on 'online' event & startup) ─

if (typeof window !== 'undefined') {
  const triggerReplay = async () => {
    const uid = await getActiveUserId()
    if (uid) {
      await drainOfflineQueue(uid)
    }
  }

  window.addEventListener('online', triggerReplay)
  // Check immediately on script load
  if (navigator.onLine) {
    setTimeout(triggerReplay, 1500)
  }
}
