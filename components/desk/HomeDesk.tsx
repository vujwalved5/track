'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { signOut } from '@/lib/supabase/auth'
import { ClosedBookDesk } from './ClosedBookDesk'
import { PinnedIndexCard } from './PinnedIndexCard'
import { FocusNotesStack } from './FocusNotesStack'
import { FocusSandTimer } from './FocusSandTimer'
import { AntiqueBrassKey } from './AntiqueBrassKey'

/**
 * HomeDesk Component
 * Memorable Moments — Home Desk Environment (Task 16)
 *
 * Rules:
 * - Real study desk at /home.
 * - Procedural wood grain & lamp glow (+30% to +40% stronger via .desk-surface).
 * - Closed book in the centre with "Open [Month]" tag.
 * - Handwritten time-of-day greeting (morning, afternoon, evening) in Kalam. No name, no emoji.
 * - Daily tip card (PinnedIndexCard with verified quotes).
 * - 7 Focus Notes loose paper stack (tap to lift, turn over, put back, no modal).
 * - Focus sand timer (hand-drawn SVG hourglass, 15/25/45m tags, real-time sand drain, gentle tipping finish).
 * - Antique brass key for logout, overlapping nothing at 1440x900, 1300x800, and 390x844.
 * - Mobile (< 768px): fits one screen with NO scrolling (book top, tip middle, notes bottom, timer/key on desk edge).
 * - Strictly L6 palette, L5 fonts, zero emoji, zero extra libraries.
 */

export function HomeDesk() {
  const [greeting, setGreeting] = useState<string>('')
  const [isClosing, setIsClosing] = useState(false)
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useEffect(() => {
    // 1. Time-of-day greeting calculation (client-side to match local user time)
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) {
      setGreeting('The quiet morning hours are yours to keep.')
    } else if (hour >= 12 && hour < 17) {
      setGreeting('The afternoon light settles softly on the desk.')
    } else {
      setGreeting('The evening is still. Rest your thoughts upon the page.')
    }

    // 2. Viewport detection (< 768px mobile)
    const mql = window.matchMedia('(max-width: 767px)')
    setIsMobile(mql.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', handler)

    // 3. Defensive BFcache reload listener
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        window.location.reload()
      }
    }
    window.addEventListener('pageshow', onPageShow)

    return () => {
      mql.removeEventListener('change', handler)
      window.removeEventListener('pageshow', onPageShow)
    }
  }, [])

  const handleLockDesk = async () => {
    if (isClosing) return
    setIsClosing(true)

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      setTimeout(async () => {
        try {
          await signOut()
        } catch (err) {
          console.error('Sign-out error:', err)
        }
        window.location.replace('/enter')
      }, 150)
      return
    }

    // Midpoint: sign out and purge auth/cache
    setTimeout(async () => {
      try {
        await signOut()
      } catch (err) {
        console.error('Sign-out error:', err)
      }
    }, 450)

    // Complete sequence (900ms): full navigation to /enter preventing back cache restore
    setTimeout(() => {
      window.location.replace('/enter')
    }, 900)
  }

  // Hydration safeguard placeholder with desk background
  if (isMobile === null) {
    return (
      <main
        className="w-full h-screen desk-surface"
        aria-hidden="true"
      />
    )
  }

  // ── MOBILE DESK LAYOUT (< 768px): 100dvh, ZERO SCROLLING ──
  if (isMobile) {
    return (
      <main
        className="w-full h-[100dvh] max-h-[100dvh] desk-surface flex flex-col justify-between items-center px-3 py-2 overflow-hidden select-none relative"
        data-testid="home-desk-mobile"
      >
        {/* Top: Handwritten Greeting and Public Desk Link */}
        <header className="w-full pt-1 pb-0.5 text-center shrink-0 flex flex-col items-center">
          <p className="font-hand italic text-xs sm:text-sm text-paper/85 tracking-wide leading-tight">
            {greeting}
          </p>
          <Link
            href="/"
            className="font-hand text-[11px] sm:text-xs text-paper/70 hover:text-paper transition-colors underline decoration-dotted underline-offset-4 decoration-paper/30 inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-2"
            aria-label="Visit the desk"
          >
            Visit the desk
          </Link>
        </header>

        {/* 1. Closed Book at Top */}
        <section className="shrink-0 my-1 flex justify-center">
          <ClosedBookDesk variant="mobile" />
        </section>

        {/* 2. Daily Tip as Small Card */}
        <section className="shrink-0 w-full max-w-[340px] my-1 flex justify-center">
          <PinnedIndexCard variant="mobile" />
        </section>

        {/* 3. Focus Notes Stack Below It */}
        <section className="shrink-0 w-full max-w-[340px] my-1 flex justify-center">
          <FocusNotesStack variant="mobile" />
        </section>

        {/* Desk Edge Periphery Controls (Sand Timer Bottom-Left, Brass Key Bottom-Right) */}
        <footer className="w-full max-w-[360px] h-[48px] min-h-[48px] flex items-center justify-between px-2 shrink-0 z-30">
          <div className="relative">
            <FocusSandTimer variant="mobile" />
          </div>

          <div className="relative">
            <AntiqueBrassKey
              onLock={handleLockDesk}
              disabled={isClosing}
              variant="mobile"
              className="!static !bottom-auto !left-auto"
            />
          </div>
        </footer>
      </main>
    )
  }

  // ── DESKTOP DESK LAYOUT (>= 768px): WOODEN DESK SCENE ──
  return (
    <main
      className="w-full min-h-screen desk-surface flex flex-col items-center justify-between p-6 lg:p-8 select-none relative overflow-hidden"
      data-testid="home-desk-desktop"
    >
      {/* ── Ambient Handwritten Greeting Inscribed on Desk Timber ── */}
      <header className="w-full pt-2 pb-1 text-center z-10 flex flex-col items-center">
        <p className="font-hand italic text-base lg:text-xl text-paper/85 tracking-wide">
          {greeting}
        </p>
        <Link
          href="/"
          className="font-hand text-xs sm:text-sm text-paper/70 hover:text-paper transition-colors underline decoration-dotted underline-offset-4 decoration-paper/30 mt-1 inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-2"
          aria-label="Visit the desk"
        >
          Visit the desk
        </Link>
      </header>

      {/* ── Central Desk Working Area ── */}
      <div className="relative flex-1 w-full max-w-[1360px] flex items-center justify-center gap-6 lg:gap-10 xl:gap-14 my-auto z-10">
        {/* Left: Daily Tip Card (PinnedIndexCard with turned brass clip) */}
        <div className="flex items-center justify-center shrink-0">
          <PinnedIndexCard variant="desk" />
        </div>

        {/* Center: Closed Book with "Open November" Handwritten Tag */}
        <div className="flex items-center justify-center shrink-0">
          <ClosedBookDesk variant="desktop" />
        </div>

        {/* Right: Focus Notes Stack (7 loose sheets) */}
        <div className="flex items-center justify-center shrink-0">
          <FocusNotesStack variant="desktop" />
        </div>
      </div>

      {/* ── Bottom Edge Paraphernalia ── */}
      <footer className="w-full max-w-[1400px] flex items-end justify-between px-4 pb-2 z-20">
        {/* Bottom-Left: Hand-Drawn SVG Hourglass Timer */}
        <div className="relative">
          <FocusSandTimer variant="desktop" />
        </div>

        {/* Bottom-Right: Antique Brass Key (overlapping nothing) */}
        <div className="relative">
          <AntiqueBrassKey
            onLock={handleLockDesk}
            disabled={isClosing}
            variant="desktop"
            className="!static !bottom-auto !left-auto !right-auto"
          />
        </div>
      </footer>
    </main>
  )
}
