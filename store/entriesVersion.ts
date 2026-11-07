/**
 * Entries Version Store
 * Memorable Moments — Phase 5 / Task 10
 *
 * A single global version counter that increments after every successful
 * entry save. Chart widgets subscribe to this to know when to re-fetch
 * without a full page reload.
 *
 * Rules:
 * - No Math.random, no Date-based values (Correction 8)
 * - Strictly zustand (L3 — already approved package)
 */

import { create } from 'zustand'

interface EntriesVersionState {
  version: number
  bump: () => void
}

export const useEntriesVersionStore = create<EntriesVersionState>((set) => ({
  version: 0,
  bump: () => set((state) => ({ version: state.version + 1 })),
}))
