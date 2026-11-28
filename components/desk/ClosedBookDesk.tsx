'use client'

import React, { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Cormorant_Garamond } from 'next/font/google'
import { useBookTransitionStore } from '@/store/bookTransitionStore'
import { BookCoverArt } from '@/components/book/BookCoverArt'

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
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const isTransitionActive = useBookTransitionStore((s) => s.isActive)
  const transitionTargetUrl = useBookTransitionStore((s) => s.targetUrl)
  const startTransition = useBookTransitionStore((s) => s.startTransition)

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonthNum = now.getMonth() + 1
  const currentMonthName = MONTH_NAMES[now.getMonth()] || 'November'
  const targetUrl = `/book/${currentYear}/${currentMonthNum}`
  const isOpening = isTransitionActive && transitionTargetUrl === targetUrl

  useEffect(() => {
    router.prefetch(targetUrl)
  }, [router, targetUrl])

  const handleOpenMonth = () => {
    if (useBookTransitionStore.getState().isActive) return

    router.prefetch(targetUrl)

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const domRect = buttonRef.current?.getBoundingClientRect()
    const rect = domRect
      ? {
          left: domRect.left,
          top: domRect.top,
          width: domRect.width,
          height: domRect.height,
        }
      : null

    const started = startTransition({
      targetYear: currentYear,
      targetMonth: currentMonthNum,
      targetUrl,
      monthName: currentMonthName,
      variant,
      rect,
      prefersReducedMotion,
    })
    if (!started) return

    router.push(targetUrl)
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
      className={`relative flex flex-col items-center justify-center select-none ${cormorant.variable} ${
        isOpening ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      data-desk-object="closed-book"
    >
      {/* 3D Perspective Container */}
      <button
        ref={buttonRef}
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
        <BookCoverArt
          currentYear={currentYear}
          currentMonthName={currentMonthName}
          isMobile={isMobile}
          isOpening={false}
          enableHover
        />
      </button>
    </div>
  )
}
