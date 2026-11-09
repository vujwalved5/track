'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Cormorant_Garamond } from 'next/font/google'

const cormorant = Cormorant_Garamond({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
})

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

interface ClosedBookDeskProps {
  variant?: 'desktop' | 'mobile'
}

export function ClosedBookDesk({ variant = 'desktop' }: ClosedBookDeskProps) {
  const router = useRouter()
  const [isOpening, setIsOpening] = useState(false)

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonthNum = now.getMonth() + 1
  const currentMonthName = MONTH_NAMES[now.getMonth()] || 'November'
  const targetUrl = `/book/${currentYear}/${currentMonthNum}`

  const handleOpenMonth = () => {
    if (isOpening) return

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      router.push(targetUrl)
      return
    }

    setIsOpening(true)
    setTimeout(() => {
      router.push(targetUrl)
    }, 900)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleOpenMonth()
    }
  }

  const isMobile = variant === 'mobile'

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none ${cormorant.variable}`}
      data-desk-object="closed-book"
    >
      {/* 3D Perspective Container */}
      <button
        type="button"
        onClick={handleOpenMonth}
        onKeyDown={handleKeyDown}
        disabled={isOpening}
        aria-label={`Open ${currentMonthName} journal`}
        className={`relative group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlighter focus-visible:ring-offset-4 focus-visible:ring-offset-desk rounded-r-2xl transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99] text-left p-0 border-0 bg-transparent ${
          isMobile
            ? 'w-[180px] h-[240px]'
            : 'w-[360px] h-[480px] lg:w-[400px] lg:h-[530px]'
        }`}
        style={{ perspective: '1800px' }}
      >
        {/* Book block (interior right page visible when opened + page edges on right) */}
        <div
          className="absolute inset-0 rounded-r-2xl overflow-hidden bg-paper pointer-events-none"
          style={{
            boxShadow:
              '14px 18px 45px rgba(0, 0, 0, 0.65), 4px 6px 14px rgba(0, 0, 0, 0.45)',
          }}
          aria-hidden="true"
        >
          {/* Paper texture with 22px dot grid */}
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(28, 36, 51, 0.28) 1.4px, transparent 1.4px)',
              backgroundSize: '22px 22px',
              boxShadow: 'inset 28px 0 32px -12px rgba(28, 36, 51, 0.22)',
            }}
          />

          {/* Page edges visible behind the cover on the right (thin cream stripes) */}
          <div
            className="absolute right-0 top-1.5 bottom-1.5 w-2 sm:w-2.5 rounded-r-sm overflow-hidden pointer-events-none"
            style={{
              background:
                'repeating-linear-gradient(to bottom, #f4eddc 0px, #f4eddc 2px, rgba(28, 36, 51, 0.16) 2px, rgba(28, 36, 51, 0.16) 4px)',
              boxShadow:
                'inset 2px 0 3px rgba(28, 36, 51, 0.25), 2px 0 4px rgba(0, 0, 0, 0.35)',
            }}
          />
        </div>

        {/* Gold ribbon hanging from the bottom */}
        <div
          className={`absolute left-10 sm:left-14 bg-gold pointer-events-none z-10 ${
            isMobile
              ? 'bottom-[-22px] w-3 h-8'
              : 'bottom-[-34px] w-4 h-12'
          }`}
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 84%, 0 100%)',
            boxShadow: '2px 4px 8px rgba(0, 0, 0, 0.55)',
          }}
          aria-hidden="true"
        />

        {/* 3D Hinged Front Cover */}
        <div
          className="absolute inset-y-0 left-0 w-[calc(100%-6px)] rounded-r-2xl z-20 motion-reduce:transition-none motion-reduce:transform-none"
          style={{
            transformOrigin: 'left center',
            transformStyle: 'preserve-3d',
            transform: isOpening ? 'rotateY(-140deg)' : 'rotateY(0deg)',
            transition: 'transform 900ms cubic-bezier(0.25, 1, 0.5, 1)',
            boxShadow: isOpening
              ? '-12px 14px 35px rgba(0, 0, 0, 0.7)'
              : '8px 12px 28px rgba(0, 0, 0, 0.55)',
          }}
        >
          {/* Front face of cover */}
          <div
            className={`absolute inset-0 rounded-r-2xl overflow-hidden bg-gradient-to-br from-oxblood to-oxblood-dark flex flex-col justify-between select-none ${
              isMobile ? 'p-3' : 'p-5 sm:p-6'
            }`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* Darker spine band on the left with gold vertical line */}
            <div
              className={`absolute left-0 top-0 bottom-0 bg-oxblood-dark border-r border-gold/75 pointer-events-none z-10 ${
                isMobile ? 'w-5' : 'w-8 sm:w-10'
              }`}
              aria-hidden="true"
            />

            {/* Gold foil inset double border */}
            <div
              className={`absolute right-2.5 top-2.5 bottom-2.5 border border-gold/70 pointer-events-none rounded-r-lg ${
                isMobile ? 'left-7' : 'left-11 sm:left-13'
              }`}
              aria-hidden="true"
            >
              <div
                className="absolute inset-1 border border-gold/45 rounded-r-md"
                aria-hidden="true"
              />
            </div>

            {/* Title section (Cormorant Garamond, Gold) */}
            <div
              className={`relative z-10 pr-1 text-center ${
                isMobile ? 'pl-5 pt-1.5' : 'pl-9 pt-4'
              }`}
            >
              <p
                className={`font-cover tracking-[0.25em] text-gold uppercase font-medium ${
                  isMobile ? 'text-[9px]' : 'text-xs'
                }`}
              >
                VOLUME — {currentYear}
              </p>
              <h1
                className={`font-cover text-gold font-bold tracking-[0.16em] uppercase leading-tight ${
                  isMobile ? 'text-base mt-0.5' : 'text-2xl sm:text-3xl mt-2'
                }`}
              >
                MEMORABLE
                <br />
                MOMENTS
              </h1>
              <p
                className={`font-cover italic text-gold/90 tracking-widest font-normal ${
                  isMobile ? 'text-[9px] mt-0.5' : 'text-xs sm:text-sm mt-1.5'
                }`}
              >
                a year, kept by hand
              </p>
            </div>

            {/* Handwritten Paper Tag: "Open [Month]" (No bookplate fields) */}
            <div
              className={`relative z-10 pr-1 text-center ${
                isMobile ? 'pl-5 pb-2' : 'pl-9 pb-5'
              }`}
            >
              <div
                className={`inline-flex items-center justify-center bg-paper text-ink border border-kraft/40 rounded-sm shadow-md transition-transform duration-150 group-hover:scale-105 group-hover:-rotate-1 ${
                  isMobile
                    ? 'px-3 py-1.5 -rotate-2'
                    : 'px-5 py-2.5 -rotate-2'
                }`}
                style={{
                  boxShadow:
                    '0 2px 8px rgba(15, 12, 10, 0.35), inset 0 0 10px rgba(185, 137, 90, 0.2)',
                }}
              >
                {/* Tiny hand-drawn bookmark tab indicator on the slip */}
                <span
                  className="font-hand font-bold text-ink tracking-wide whitespace-nowrap"
                  style={{
                    fontSize: isMobile ? '13px' : '17px',
                    lineHeight: '22px',
                  }}
                >
                  {isOpening ? 'turning the page...' : `Open ${currentMonthName}`}
                </span>
              </div>
            </div>
          </div>

          {/* Inside facing endpaper of front cover when swung open */}
          <div
            className="absolute inset-0 rounded-l-2xl bg-paper overflow-hidden pointer-events-none"
            style={{
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden',
              boxShadow: 'inset -24px 0 28px -10px rgba(28, 36, 51, 0.25)',
            }}
            aria-hidden="true"
          >
            <div
              className="w-full h-full"
              style={{
                backgroundImage:
                  'radial-gradient(circle, rgba(28, 36, 51, 0.25) 1.2px, transparent 1.2px)',
                backgroundSize: '22px 22px',
              }}
            />
          </div>
        </div>
      </button>
    </div>
  )
}
