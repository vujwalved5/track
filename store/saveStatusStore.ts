import { create } from 'zustand'

export type SaveStatusState =
  | 'idle'
  | 'saving'
  | 'saved'
  | 'retrying'
  | 'syncing'
  | 'error'

interface SaveStatusStore {
  status: SaveStatusState
  pendingCount: number
  retryCount: number
  lastError: string | null
  setStatus: (status: SaveStatusState, meta?: { retryCount?: number; error?: string | null }) => void
  incrementPending: () => void
  decrementPending: () => void
}

let savedTimeout: NodeJS.Timeout | null = null

export const useSaveStatusStore = create<SaveStatusStore>((set) => ({
  status: 'idle',
  pendingCount: 0,
  retryCount: 0,
  lastError: null,

  setStatus: (newStatus, meta) => {
    if (savedTimeout) {
      clearTimeout(savedTimeout)
      savedTimeout = null
    }

    set((state) => ({
      status: newStatus,
      retryCount: meta?.retryCount !== undefined ? meta.retryCount : (newStatus === 'idle' || newStatus === 'saved' ? 0 : state.retryCount),
      lastError: meta?.error !== undefined ? meta.error : state.lastError,
    }))

    // Automatically transition 'saved' back to 'idle' after 2.5 seconds
    if (newStatus === 'saved') {
      savedTimeout = setTimeout(() => {
        set((state) => (state.status === 'saved' ? { status: 'idle' } : {}))
      }, 2500)
    }
  },

  incrementPending: () => {
    set((state) => ({
      pendingCount: state.pendingCount + 1,
      status: state.status === 'retrying' ? 'retrying' : 'saving',
    }))
  },

  decrementPending: () => {
    set((state) => {
      const nextPending = Math.max(0, state.pendingCount - 1)
      if (nextPending === 0 && (state.status === 'saving' || state.status === 'retrying')) {
        // Return to saved or idle
        return { pendingCount: 0, status: 'saved' }
      }
      return { pendingCount: nextPending }
    })
  },
}))
