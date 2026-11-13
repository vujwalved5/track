'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cormorant_Garamond } from 'next/font/google'
import { PinnedIndexCard } from './PinnedIndexCard'
import { FocusNotesStack } from './FocusNotesStack'
import { ResearchShelf } from './ResearchShelf'

const cormorant = Cormorant_Garamond({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
})

/**
 * PublicDesk Component
 * Memorable Moments — Public Home Desk Environment (Requirement R1, R4)
 *
 * Locked Decisions & Constraints:
 * - L1: Book/desk atmosphere, not a website (no navbars, sidebars, SaaS modals, or scrolling inside desktop).
 * - L5: Kalam (font-hand) & Cormorant Garamond (font-cover).
 * - L6: Strict 9-color palette (desk, paper, ink, redpen, highlighter, oxblood, oxbloodDark, gold, kraft, orange).
 * - L11/L15: Public desk on "/" with zero user data, zero auth calls.
 * - L13: Zero emoji; hand-drawn inline SVG icons only.
 * - R1: Paper strip title, brass bookmark tag to /enter, reused daily tip card, reused focus notes stack, research shelf.
 * - R1: Strictly excludes sand timer, closed book, brass key.
 * - R4: Desktop (1440x900) fits without scrolling (scrollHeight <= clientHeight). Responsive at 1300x800. Mobile (<768px) single vertical scroll.
 */
export function PublicDesk() {
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setMounted(true)
    const mql = window.matchMedia('(max-width: 767px)')
    setIsMobile(mql.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  const isMobileLayout = mounted && isMobile

  // ── MOBILE DESK LAYOUT (< 768px): SINGLE VERTICAL SCROLL PERMITTED ──
  if (isMobileLayout) {
    return (
      <main
        className={`${cormorant.variable} w-full min-h-screen desk-surface flex flex-col items-center px-3 py-4 select-none relative overflow-y-auto`}
        data-testid="public-desk-mobile"
        data-desk-scene="public"
      >
        {/* 1. Top Paper Strip Title with Handwritten Focus Line */}
        <header className="w-full shrink-0 flex flex-col items-center mb-3">
          <div
            className="relative bg-paper text-ink rounded-[2px] shadow-paper-card border border-kraft/35 px-5 py-2.5 text-center -rotate-[0.5deg] max-w-[340px] w-full"
            style={{
              backgroundImage:
                'linear-gradient(to bottom, rgba(28, 36, 51, 0.08) 1px, transparent 1px)',
              backgroundSize: '100% 22px',
            }}
          >
            {/* Corner Brass Pins */}
            <div
              className="absolute -top-1 left-2 pointer-events-none"
              aria-hidden="true"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <circle
                  cx="5"
                  cy="5"
                  r="4"
                  fill="#d8b45a"
                  stroke="#211b16"
                  strokeWidth="0.8"
                />
                <circle cx="5" cy="5" r="1.5" fill="#211b16" opacity="0.6" />
              </svg>
            </div>
            <div
              className="absolute -top-1 right-2 pointer-events-none"
              aria-hidden="true"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <circle
                  cx="5"
                  cy="5"
                  r="4"
                  fill="#d8b45a"
                  stroke="#211b16"
                  strokeWidth="0.8"
                />
                <circle cx="5" cy="5" r="1.5" fill="#211b16" opacity="0.6" />
              </svg>
            </div>

            <h1 className="font-cover font-bold uppercase tracking-[0.16em] text-ink text-xl leading-tight">
              Memorable Moments
            </h1>
            <p className="font-hand italic text-ink/80 text-xs mt-0.5 tracking-wide leading-tight">
              A quiet desk for contemplation, memory, and unhurried thought.
            </p>
          </div>

          {/* 2. Login Access: Brass bookmark tag & handwritten link */}
          <div className="flex items-center justify-center gap-3 mt-3 w-full max-w-[340px]">
            <Link
              href="/login"
              className="min-h-[44px] min-w-[44px] px-3.5 py-1.5 bg-gradient-to-r from-gold via-[#e5c46e] to-gold text-desk rounded-[2px] shadow-sm hover:brightness-105 active:translate-y-px transition-all border border-kraft/60 inline-flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlighter focus-visible:ring-offset-2 focus-visible:ring-offset-desk"
              aria-label="Open your book — sign in to your journal"
            >
              <svg
                width="16"
                height="20"
                viewBox="0 0 18 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="shrink-0"
              >
                <path
                  d="M 2 2 H 16 V 20 L 9 16 L 2 20 Z"
                  fill="#d8b45a"
                  stroke="#211b16"
                  strokeWidth="1.2"
                />
                <path
                  d="M 3.5 3.5 H 14.5 V 17.5 L 9 14.5 L 3.5 17.5 Z"
                  fill="#f4eddc"
                  opacity="0.25"
                />
                <circle cx="9" cy="6.5" r="1.5" fill="#211b16" />
              </svg>
              <span className="font-cover font-bold uppercase tracking-[0.16em] text-xs text-desk whitespace-nowrap">
                Open your book
              </span>
            </Link>

            <Link
              href="/login"
              className="min-h-[44px] min-w-[44px] px-2 inline-flex items-center font-hand text-xs text-paper/80 hover:text-paper underline decoration-dotted underline-offset-4 decoration-paper/40 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlighter rounded-sm"
              aria-label="Begin a new book"
            >
              Begin a new book
            </Link>
          </div>
        </header>

        {/* 3. Daily Tip Card (Reused PinnedIndexCard mobile variant) */}
        <section
          className="shrink-0 w-full max-w-[340px] my-2 flex justify-center"
          aria-label="Daily tip index card"
        >
          <PinnedIndexCard variant="mobile" />
        </section>

        {/* 4. Focus Notes Stack (Reused FocusNotesStack mobile variant) */}
        <section
          className="shrink-0 w-full max-w-[340px] my-2 flex justify-center"
          aria-label="Focus notes stack"
        >
          <FocusNotesStack variant="mobile" />
        </section>

        {/* 5. Research Shelf (Mobile swipeable row across lower desk) */}
        <section
          className="shrink-0 w-full max-w-[340px] mt-3 pb-4"
          aria-label="Technology and AI research shelf"
        >
          <ResearchShelf isMobile={true} />
        </section>
      </main>
    )
  }

  // ── DESKTOP DESK LAYOUT (>= 768px): 100vh ZERO SCROLLING ──
  return (
    <main
      className={`${cormorant.variable} w-full h-screen max-h-screen desk-surface flex flex-col justify-between items-center p-3 sm:p-4 lg:px-8 lg:py-3.5 select-none relative overflow-hidden`}
      data-testid="public-desk-desktop"
      data-desk-scene="public"
    >
      {/* ── Tier 1: Header (Title Paper Strip & Login Access) ── */}
      <header className="w-full max-w-[1360px] flex items-center justify-between shrink-0 z-20 px-2 lg:px-4">
        {/* Left balance accent */}
        <div className="hidden md:flex items-center gap-2 opacity-60 w-[240px]">
          <span
            className="w-2 h-2 rounded-full bg-gold/60 border border-desk/50"
            aria-hidden="true"
          />
          <span className="font-cover text-[11px] tracking-widest text-paper/70 uppercase">
            Focus &amp; Contemplation
          </span>
        </div>

        {/* Center: Paper Title Strip */}
        <div
          className="relative bg-paper text-ink rounded-[2px] shadow-paper-card border border-kraft/35 px-6 py-2 sm:px-8 sm:py-2.5 text-center -rotate-[0.5deg]"
          style={{
            backgroundImage:
              'linear-gradient(to bottom, rgba(28, 36, 51, 0.08) 1px, transparent 1px)',
            backgroundSize: '100% 22px',
          }}
        >
          {/* Subtle Corner Brass Thumbtacks in SVG */}
          <div
            className="absolute -top-1.5 left-3 pointer-events-none"
            aria-hidden="true"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle
                cx="6"
                cy="6"
                r="5"
                fill="#d8b45a"
                stroke="#211b16"
                strokeWidth="0.8"
              />
              <circle cx="6" cy="6" r="2" fill="#211b16" opacity="0.6" />
            </svg>
          </div>
          <div
            className="absolute -top-1.5 right-3 pointer-events-none"
            aria-hidden="true"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle
                cx="6"
                cy="6"
                r="5"
                fill="#d8b45a"
                stroke="#211b16"
                strokeWidth="0.8"
              />
              <circle cx="6" cy="6" r="2" fill="#211b16" opacity="0.6" />
            </svg>
          </div>

          <h1 className="font-cover font-bold uppercase tracking-[0.18em] text-ink text-xl sm:text-2xl lg:text-3xl leading-tight">
            Memorable Moments
          </h1>
          <p className="font-hand italic text-ink/80 text-xs sm:text-sm mt-0.5 tracking-wide">
            A quiet desk for contemplation, memory, and unhurried thought.
          </p>
        </div>

        {/* Right: Login Access (Brass Bookmark Tag + Handwritten Link) */}
        <div className="flex items-center justify-end gap-3 w-[240px]">
          <Link
            href="/login"
            className="min-h-[44px] min-w-[44px] px-3.5 py-1.5 bg-gradient-to-r from-gold via-[#e5c46e] to-gold text-desk rounded-[2px] shadow-sm hover:brightness-105 active:translate-y-px transition-all border border-kraft/60 inline-flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlighter focus-visible:ring-offset-2 focus-visible:ring-offset-desk"
            aria-label="Open your book — sign in to your journal"
          >
            <svg
              width="18"
              height="22"
              viewBox="0 0 18 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="shrink-0"
            >
              <path
                d="M 2 2 H 16 V 20 L 9 16 L 2 20 Z"
                fill="#d8b45a"
                stroke="#211b16"
                strokeWidth="1.2"
              />
              <path
                d="M 3.5 3.5 H 14.5 V 17.5 L 9 14.5 L 3.5 17.5 Z"
                fill="#f4eddc"
                opacity="0.25"
              />
              <circle cx="9" cy="6.5" r="1.5" fill="#211b16" />
            </svg>
            <span className="font-cover font-bold uppercase tracking-[0.16em] text-xs text-desk whitespace-nowrap">
              Open your book
            </span>
          </Link>

          <Link
            href="/login"
            className="min-h-[44px] min-w-[44px] px-2 inline-flex items-center font-hand text-xs sm:text-sm text-paper/80 hover:text-paper underline decoration-dotted underline-offset-4 decoration-paper/40 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlighter rounded-sm"
            aria-label="Begin a new book"
          >
            Begin a new book
          </Link>
        </div>
      </header>

      {/* ── Tier 2: Middle Working Desk Area (Tip Card Left, Notes Stack Right) ── */}
      <div className="relative flex-1 w-full max-w-[1360px] flex items-center justify-between px-6 lg:px-12 my-auto z-10 min-h-0">
        {/* Left: Daily Tip Card (Reused PinnedIndexCard desk variant) */}
        <div className="flex items-center justify-center shrink-0">
          <PinnedIndexCard variant="desk" />
        </div>

        {/* Center: Open Timber Blotter (Quiet lamp glow illumination) */}
        <div
          className="hidden md:flex flex-col items-center justify-center pointer-events-none opacity-30 select-none"
          aria-hidden="true"
        >
          <div className="w-16 h-px bg-kraft/40" />
          <span className="font-cover text-xs tracking-[0.25em] text-paper/50 my-1 uppercase">
            Silent Study
          </span>
          <div className="w-16 h-px bg-kraft/40" />
        </div>

        {/* Right: Focus Notes Stack (Reused FocusNotesStack desktop variant) */}
        <div className="flex items-center justify-center shrink-0">
          <FocusNotesStack variant="desktop" />
        </div>
      </div>

      {/* ── Tier 3: Lower Desk (Pinned Research Shelf Row) ── */}
      <footer className="w-full max-w-[1360px] shrink-0 z-20 px-2 lg:px-4 pb-1">
        <ResearchShelf isMobile={false} />
      </footer>
    </main>
  )
}
