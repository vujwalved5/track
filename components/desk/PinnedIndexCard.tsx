'use client'

import React, { useState, useEffect } from 'react'
import { getDailyDeskQuote, type DeskQuote } from '@/lib/deskQuotes'

/**
 * PinnedIndexCard Component
 * Memorable Moments — Home Desk Environment (Task 15)
 *
 * Rules:
 * - 3x5 card resting on the desk surface to the left of the book casing.
 * - Paper color #f4eddc, 22px grid rules, Kalam 15px/22px leading.
 * - Small hand-stamped date.
 * - Hand-drawn turned brass clip in SVG (gold #d8b45a, kraft #b9895a, desk #211b16).
 * - Organic tilt of -2.5deg.
 * - Multi-stage contact and drop shadow (.shadow-paper-card).
 * - Desktop only (>= 768px), hidden on narrow desktop viewports (< 1300px) to prevent overlap.
 * - Date computed on client after mount to prevent hydration mismatch.
 * - Pure L6 palette, L5 fonts, zero emoji.
 */

export function PinnedIndexCard() {
  const [currentDate, setCurrentDate] = useState<Date | null>(null)

  useEffect(() => {
    setCurrentDate(new Date())
  }, [])

  const quoteData: DeskQuote | null = currentDate ? getDailyDeskQuote(currentDate) : null

  // Format date stamp: e.g. "9 NOV 2026"
  const formattedDate = currentDate
    ? `${currentDate.getDate()} ${currentDate
        .toLocaleString('en-US', { month: 'short' })
        .toUpperCase()} ${currentDate.getFullYear()}`
    : ''

  return (
    <aside
      data-desk-object="card"
      aria-label="Daily inspiration index card"
      className="hidden min-[1300px]:block absolute select-none pointer-events-auto z-20"
      style={{
        left: '-216px',
        top: '48px',
        width: '198px', // 9 * 22px = 198px (3x5 aspect ratio with 330px height)
        height: '330px', // 15 * 22px = 330px
        transform: 'rotate(-2.5deg)',
        transformOrigin: 'top center',
      }}
    >
      {/* ── Hand-Drawn Turned Brass Bulldog Clip (SVG) ── */}
      <div
        className="absolute -top-5 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
        aria-hidden="true"
      >
        <svg
          width="48"
          height="32"
          viewBox="0 0 48 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-[0_2px_3px_rgba(15,12,10,0.45)]"
        >
          {/* Wire loop handle */}
          <path
            d="M 16 12 C 16 3, 32 3, 32 12"
            stroke="#b9895a"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M 17 12 C 17 4.5, 31 4.5, 31 12"
            stroke="#d8b45a"
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          {/* Clip Body / Barrel */}
          <rect
            x="10"
            y="11"
            width="28"
            height="14"
            rx="2.5"
            fill="#d8b45a"
            stroke="#211b16"
            strokeWidth="1"
          />

          {/* Brass Shading & Specular Highlight */}
          <rect
            x="11.5"
            y="12"
            width="25"
            height="3"
            rx="1"
            fill="#f4eddc"
            opacity="0.35"
          />
          <rect
            x="11.5"
            y="20"
            width="25"
            height="4"
            rx="1"
            fill="#b9895a"
            opacity="0.45"
          />

          {/* Clamping Jaws seam */}
          <path
            d="M 8 25 C 18 24.5, 30 24.5, 40 25"
            stroke="#211b16"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M 9 26.5 C 19 26, 29 26, 39 26.5"
            stroke="#b9895a"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* ── 3x5 Heavy Paper Card ── */}
      <div
        className="w-full h-full bg-paper rounded-[2px] shadow-paper-card border border-desk/20 overflow-hidden flex flex-col justify-between pt-7 pb-4 px-3 relative"
        style={{
          backgroundImage:
            'linear-gradient(to bottom, rgba(28, 36, 51, 0.12) 1px, transparent 1px)',
          backgroundSize: '100% 22px',
          backgroundPosition: '0 28px',
        }}
      >
        {/* Subtle fiber texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              'repeating-linear-gradient(35deg, rgba(28, 36, 51, 0.03) 0px, rgba(28, 36, 51, 0.03) 1px, transparent 1px, transparent 4px)',
          }}
          aria-hidden="true"
        />

        {/* Card Header: Small Hand-Stamped Date */}
        <div className="relative z-10 flex items-center justify-between border-b border-ink/20 pb-1 h-[22px]">
          <span className="font-hand text-[10px] tracking-[0.2em] uppercase text-ink/70">
            DAILY MEMO
          </span>
          {formattedDate && (
            <span
              className="font-hand text-[11px] tracking-widest text-ink/80 border border-ink/30 px-1.5 py-0.2 rounded-sm rotate-1 bg-paper/60"
              style={{
                boxShadow: 'inset 0 0 2px rgba(28, 36, 51, 0.15)',
              }}
            >
              {formattedDate}
            </span>
          )}
        </div>

        {/* Card Body: Quote in Kalam 15px / 22px leading */}
        <div className="relative z-10 flex-1 flex flex-col justify-center my-2">
          {quoteData ? (
            <blockquote className="font-hand text-[15px] leading-[22px] text-ink/85 italic">
              &ldquo;{quoteData.quote}&rdquo;
            </blockquote>
          ) : (
            <div className="h-[66px] flex items-center justify-center">
              <span className="font-hand text-xs text-ink/40">...</span>
            </div>
          )}
        </div>

        {/* Card Footer: Author and Work */}
        <div className="relative z-10 border-t border-ink/15 pt-1.5 text-right h-[44px] flex flex-col justify-end">
          {quoteData && (
            <>
              <p className="font-hand text-xs font-bold text-ink/80 leading-tight">
                — {quoteData.author}
              </p>
              <p className="font-hand text-[10px] text-ink/70 leading-tight">
                {quoteData.work}
              </p>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}
