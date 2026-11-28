'use client'

import { create } from 'zustand'

export interface BookCoverRect {
  left: number
  top: number
  width: number
  height: number
}

interface StartTransitionPayload {
  targetYear: number
  targetMonth: number
  targetUrl: string
  monthName: string
  variant: 'desktop' | 'mobile'
  rect: BookCoverRect | null
  prefersReducedMotion: boolean
}

interface BookTransitionState {
  isActive: boolean
  transitionId: number
  targetYear: number | null
  targetMonth: number | null
  targetUrl: string | null
  monthName: string
  variant: 'desktop' | 'mobile'
  rect: BookCoverRect | null
  prefersReducedMotion: boolean
  isAnimationDone: boolean
  isBookReady: boolean
  isTimedOut: boolean
  hasNotifiedReady: boolean

  startTransition: (payload: StartTransitionPayload) => boolean
  markAnimationDone: (transitionId: number) => void
  markBookReady: (year: number, month: number) => void
  markTimedOut: (transitionId: number) => void
  retryTransition: () => void
  resetTransition: () => void
}

const INITIAL_STATE = {
  isActive: false,
  targetYear: null as number | null,
  targetMonth: null as number | null,
  targetUrl: null as string | null,
  monthName: 'November',
  variant: 'desktop' as 'desktop' | 'mobile',
  rect: null as BookCoverRect | null,
  prefersReducedMotion: false,
  isAnimationDone: false,
  isBookReady: false,
  isTimedOut: false,
  hasNotifiedReady: false,
}

export const useBookTransitionStore = create<BookTransitionState>((set, get) => ({
  ...INITIAL_STATE,
  transitionId: 0,

  startTransition: (payload) => {
    const state = get()
    // Ignore repeat clicks while a transition is already active
    if (state.isActive) return false

    const nextId = state.transitionId + 1
    set({
      isActive: true,
      transitionId: nextId,
      targetYear: payload.targetYear,
      targetMonth: payload.targetMonth,
      targetUrl: payload.targetUrl,
      monthName: payload.monthName,
      variant: payload.variant,
      rect: payload.rect,
      prefersReducedMotion: payload.prefersReducedMotion,
      isAnimationDone: false,
      isBookReady: false,
      isTimedOut: false,
      hasNotifiedReady: false,
    })
    return true
  },

  markAnimationDone: (id) => {
    const state = get()
    if (!state.isActive || state.transitionId !== id || state.isAnimationDone) return
    set({ isAnimationDone: true })
  },

  markBookReady: (year, month) => {
    const state = get()
    if (
      !state.isActive ||
      state.hasNotifiedReady ||
      state.targetYear !== year ||
      state.targetMonth !== month
    ) {
      return
    }
    set({
      isBookReady: true,
      hasNotifiedReady: true,
      isTimedOut: false,
    })
  },

  markTimedOut: (id) => {
    const state = get()
    if (!state.isActive || state.transitionId !== id || state.isBookReady) return
    set({ isTimedOut: true })
  },

  retryTransition: () => {
    const state = get()
    if (!state.isActive) return
    set({
      transitionId: state.transitionId + 1,
      isTimedOut: false,
      isBookReady: false,
      hasNotifiedReady: false,
      isAnimationDone: true,
    })
  },

  resetTransition: () => {
    set((state) => ({
      ...INITIAL_STATE,
      transitionId: state.transitionId + 1,
    }))
  },
}))
