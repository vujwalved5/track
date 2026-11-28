'use client'

import { create } from 'zustand'

export type TransitionKind = 'home-to-book' | 'public-to-login'
export type PublicSourcePath = '/' | '/focus-room'
export type PublicTransitionPhase = 'leave' | 'arrive' | 'wait' | 'swing' | 'reveal'

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

interface StartPublicTransitionPayload {
  sourcePath: PublicSourcePath
  prefersReducedMotion: boolean
}

interface BookTransitionState {
  isActive: boolean
  transitionId: number
  kind: TransitionKind
  sourcePath: PublicSourcePath | '/home'
  publicPhase: PublicTransitionPhase | null
  targetYear: number | null
  targetMonth: number | null
  targetUrl: string | null
  monthName: string
  variant: 'desktop' | 'mobile'
  rect: BookCoverRect | null
  prefersReducedMotion: boolean
  isAnimationDone: boolean
  isBookReady: boolean
  isLoginReady: boolean
  redirectedToBook: boolean
  isSwingDone: boolean
  isTimedOut: boolean
  hasNotifiedReady: boolean

  startTransition: (payload: StartTransitionPayload) => boolean
  startPublicTransition: (payload: StartPublicTransitionPayload) => boolean
  setPublicPhase: (transitionId: number, phase: PublicTransitionPhase) => void
  markAnimationDone: (transitionId: number) => void
  markLoginReady: () => void
  resolveBookRedirect: (year: number, month: number) => void
  markBookReady: (year: number, month: number) => void
  markSwingDone: (transitionId: number) => void
  markTimedOut: (transitionId: number) => void
  retryTransition: () => void
  resetTransition: () => void
}

const INITIAL_STATE = {
  isActive: false,
  kind: 'home-to-book' as TransitionKind,
  sourcePath: '/home' as PublicSourcePath | '/home',
  publicPhase: null as PublicTransitionPhase | null,
  targetYear: null as number | null,
  targetMonth: null as number | null,
  targetUrl: null as string | null,
  monthName: 'November',
  variant: 'desktop' as 'desktop' | 'mobile',
  rect: null as BookCoverRect | null,
  prefersReducedMotion: false,
  isAnimationDone: false,
  isBookReady: false,
  isLoginReady: false,
  redirectedToBook: false,
  isSwingDone: false,
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
      ...INITIAL_STATE,
      isActive: true,
      transitionId: nextId,
      kind: 'home-to-book',
      sourcePath: '/home',
      publicPhase: null,
      targetYear: payload.targetYear,
      targetMonth: payload.targetMonth,
      targetUrl: payload.targetUrl,
      monthName: payload.monthName,
      variant: payload.variant,
      rect: payload.rect,
      prefersReducedMotion: payload.prefersReducedMotion,
    })
    return true
  },

  startPublicTransition: (payload) => {
    const state = get()
    // Ignore repeat clicks while a transition is already active
    if (state.isActive) return false

    const nextId = state.transitionId + 1
    set({
      ...INITIAL_STATE,
      isActive: true,
      transitionId: nextId,
      kind: 'public-to-login',
      sourcePath: payload.sourcePath,
      publicPhase: 'leave',
      targetUrl: '/login',
      prefersReducedMotion: payload.prefersReducedMotion,
    })
    return true
  },

  setPublicPhase: (id, phase) => {
    const state = get()
    if (!state.isActive || state.transitionId !== id || state.kind !== 'public-to-login') {
      return
    }
    set({ publicPhase: phase })
  },

  markAnimationDone: (id) => {
    const state = get()
    if (!state.isActive || state.transitionId !== id || state.isAnimationDone) return
    set({ isAnimationDone: true })
  },

  markLoginReady: () => {
    const state = get()
    if (
      !state.isActive ||
      state.kind !== 'public-to-login' ||
      state.redirectedToBook ||
      state.hasNotifiedReady
    ) {
      return
    }
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      return
    }
    set({
      isLoginReady: true,
      hasNotifiedReady: true,
      isTimedOut: false,
    })
  },

  resolveBookRedirect: (year, month) => {
    const state = get()
    if (!state.isActive || state.kind !== 'public-to-login') return
    if (state.redirectedToBook && state.targetYear === year && state.targetMonth === month) {
      return
    }
    set({
      redirectedToBook: true,
      targetYear: year,
      targetMonth: month,
      targetUrl: `/book/${year}/${month}`,
      isLoginReady: false,
    })
  },

  markBookReady: (year, month) => {
    const state = get()
    if (!state.isActive || state.hasNotifiedReady) return

    if (state.kind === 'public-to-login') {
      const matchesTarget =
        state.redirectedToBook && state.targetYear === year && state.targetMonth === month
      const matchesUrl =
        typeof window !== 'undefined' &&
        window.location.pathname === `/book/${year}/${month}`
      if (!matchesTarget && !matchesUrl) return

      set({
        redirectedToBook: true,
        targetYear: year,
        targetMonth: month,
        targetUrl: `/book/${year}/${month}`,
        isBookReady: true,
        hasNotifiedReady: true,
        isTimedOut: false,
      })
      return
    }

    if (state.targetYear !== year || state.targetMonth !== month) {
      return
    }
    set({
      isBookReady: true,
      hasNotifiedReady: true,
      isTimedOut: false,
    })
  },

  markSwingDone: (id) => {
    const state = get()
    if (!state.isActive || state.transitionId !== id || state.isSwingDone) return
    set({ isSwingDone: true })
  },

  markTimedOut: (id) => {
    const state = get()
    const ready = state.kind === 'public-to-login'
      ? (state.redirectedToBook ? state.isBookReady : state.isLoginReady)
      : state.isBookReady
    if (!state.isActive || state.transitionId !== id || ready) return
    set({ isTimedOut: true })
  },

  retryTransition: () => {
    const state = get()
    if (!state.isActive) return
    if (state.kind === 'public-to-login') {
      set({
        transitionId: state.transitionId + 1,
        publicPhase: 'wait',
        isTimedOut: false,
        isBookReady: false,
        isLoginReady: false,
        isSwingDone: false,
        hasNotifiedReady: false,
        isAnimationDone: true,
      })
      return
    }
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
