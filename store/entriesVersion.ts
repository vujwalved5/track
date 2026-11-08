/**
 * Entries Version Store
 * Memorable Moments — Phase 5 / Task 10 & Optimisation Task C (Fix 11, Fix 12)
 *
 * Partitioned version counter by widget ID so modifying one widget's entries
 * invalidates and re-renders only that widget and subscribing charts.
 *
 * Rules:
 * - No Math.random, no Date-based values (Correction 8)
 * - Strictly zustand (L3 — already approved package)
 */

import { create } from 'zustand'

export interface EntriesVersionState {
  version: number
  versions: Record<string, number>
  lastMutatedWidgetId: string | null
  setLastMutatedWidgetId: (widgetId: string | null) => void
  bump: (widgetId?: string) => void
  getVersion: (widgetId?: string) => number
}

export const useEntriesVersionStore = create<EntriesVersionState>((set, get) => ({
  version: 0,
  versions: {},
  lastMutatedWidgetId: null,
  setLastMutatedWidgetId: (widgetId: string | null) => {
    set({ lastMutatedWidgetId: widgetId })
  },
  bump: (widgetId?: string) => {
    const targetId = widgetId || get().lastMutatedWidgetId
    if (targetId) {
      set((state) => ({
        lastMutatedWidgetId: null,
        versions: {
          ...state.versions,
          [targetId]: (state.versions[targetId] || 0) + 1,
        },
      }))
    } else {
      // Global bump fallback
      set((state) => ({
        version: state.version + 1,
      }))
    }
  },
  getVersion: (widgetId?: string) => {
    if (!widgetId) return get().version
    return (get().versions[widgetId] || 0) + get().version
  },
}))
