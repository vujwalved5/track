'use client'

/**
 * MobileBook Component (Pocket Notebook Layout for < 768px)
 * Memorable Moments — Phase 6 / Task 11 (Batch A)
 *
 * Rules:
 * - Background kraft #b9895a. Single cream page (#f4eddc) with dashed stitched line near left edge and red ribbon hanging from top.
 * - Shows ONE widget's content at a time, stacked in sequence: widgets.z ascending; if equal, page (left first), then y, then x (Correction 1).
 * - Multi-page dynamic paging for tall widgets; zero inner scrolling.
 * - Navigation: folded bottom-right corner for "next" (>= 44px), small "back" text at bottom-left (>= 44px), swipe left/right to turn pages, and right-edge month index tabs (>= 44px tall) (Correction 6).
 * - Swiping past last page goes to next month's first page; back from first page goes to previous month's last page (Correction 6).
 * - Unset month shows MonthSetupWizard (Correction 6).
 * - Tap targets at least 44px (except documented Habit Tracker column width exception).
 * - Desktop spread unchanged. Palette L6 only, fonts L5 only, no emoji.
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import type { PaperType } from '@/components/paper'
import type { PreviousMonthData } from '@/components/setup'
import {
  getWidgetDefinition,
  type WidgetData,
  type WidgetDefinition,
} from '@/components/widgets'
import type { WidgetEntryRow } from '@/components/widgets/entryHelpers'
import { signOut } from '@/lib/supabase/auth'
import { AntiqueBrassKey } from '@/components/desk'
import { MONTHS } from './OpenBook'

const MonthSetupWizard = dynamic(
  () => import('@/components/setup/MonthSetupWizard').then((m) => m.MonthSetupWizard),
  { ssr: false, loading: () => null },
)

interface MobileBookProps {
  year: number
  month: number
  monthId?: string
  paperType?: PaperType
  isSetupDone: boolean
  setupConfig?: Record<string, unknown>
  prevMonthData?: PreviousMonthData
  widgets: WidgetData[]
  initialEntries?: WidgetEntryRow[]
  onWidgetsChange?: (widgets: WidgetData[]) => void
  onWidgetSaved?: (widget: WidgetData) => void
  onTurnMonth: (
    targetYear: number,
    targetMonth: number,
    direction: 'forward' | 'backward',
    targetPageMode?: 'first' | 'last',
  ) => void
  onCompleteSetup: (
    newLeft: PaperType,
    newRight: PaperType,
    createdWidgets?: WidgetData[],
    newMonthId?: string,
    newSetupConfig?: Record<string, unknown>,
  ) => void
  initialPageMode?: 'first' | 'last'
}

interface MobilePageItem {
  widget: WidgetData
  subPage: number
  totalSubPages: number
}

// ── Mobile sorting: widgets.z ascending, then page (left first), then y, then x (Correction 1) ──
export function sortWidgetsForMobile(widgets: WidgetData[]): WidgetData[] {
  return [...widgets].sort((a, b) => {
    const zA = a.z ?? 0
    const zB = b.z ?? 0
    if (zA !== zB) {
      return zA - zB
    }
    if (a.page !== b.page) {
      return a.page === 'left' ? -1 : 1
    }
    if (a.y !== b.y) {
      return a.y - b.y
    }
    return a.x - b.x
  })
}

export function MobileBook({
  year,
  month,
  paperType = 'dotted',
  isSetupDone,
  setupConfig = {},
  prevMonthData = { exists: false },
  widgets,
  initialEntries,
  onTurnMonth,
  onCompleteSetup,
  initialPageMode = 'first',
}: MobileBookProps) {
  const router = useRouter()

  // Adjacent month prefetching in idle time
  useEffect(() => {
    const prevYear = month === 1 ? year - 1 : year
    const prevMonth = month === 1 ? 12 : month - 1
    const nextYear = month === 12 ? year + 1 : year
    const nextMonth = month === 12 ? 1 : month + 1
    router.prefetch(`/book/${prevYear}/${prevMonth}`)
    router.prefetch(`/book/${nextYear}/${nextMonth}`)
  }, [year, month, router])

  // Sort widgets according to mobile sequence rules
  const sortedWidgets = useMemo(() => sortWidgetsForMobile(widgets), [widgets])

  // Build flattened mobile pages list (supporting multi-page tall widgets)
  const mobilePages = useMemo<MobilePageItem[]>(() => {
    const list: MobilePageItem[] = []
    for (const widget of sortedWidgets) {
      const def = getWidgetDefinition(widget.type)
      const count = def?.getMobilePageCount?.(widget.config) ?? 1
      for (let s = 0; s < count; s++) {
        list.push({
          widget,
          subPage: s,
          totalSubPages: count,
        })
      }
    }
    return list
  }, [sortedWidgets])

  const totalPages = Math.max(1, mobilePages.length)

  // Current mobile page index
  const [currentPage, setCurrentPage] = useState<number>(() =>
    initialPageMode === 'last' ? totalPages - 1 : 0,
  )

  // Reset or adjust page index on month/widget changes
  useEffect(() => {
    if (initialPageMode === 'last') {
      setCurrentPage(totalPages - 1)
    } else {
      setCurrentPage(0)
    }
  }, [year, month, initialPageMode, totalPages])

  // Make sure currentPage stays clamped within bounds
  const clampedPage = Math.min(Math.max(0, currentPage), totalPages - 1)

  const [isClosing, setIsClosing] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Mobile reverse cover-close & sign-out (Task 15 / Section 5.3)
  const handleLockBook = useCallback(async () => {
    if (isClosing) return
    setIsClosing(true)

    if (prefersReducedMotion) {
      setTimeout(async () => {
        try {
          await signOut()
        } catch (err) {
          console.error('Sign-out error:', err)
        }
        window.location.replace('/')
      }, 150)
      return
    }

    // Midpoint: sign out & clear caches
    setTimeout(async () => {
      try {
        await signOut()
      } catch (err) {
        console.error('Sign-out error:', err)
      }
    }, 450)

    // Complete 900ms reverse close: full navigation to /
    setTimeout(() => {
      window.location.replace('/')
    }, 900)
  }, [isClosing, prefersReducedMotion])

  // Navigate to previous page or previous month
  const handleTurnBack = useCallback(() => {
    if (!isSetupDone || isClosing) return
    if (clampedPage > 0) {
      setCurrentPage((prev) => prev - 1)
    } else {
      // Turn to previous month's last page (Correction 6)
      const prevYear = month === 1 ? year - 1 : year
      const prevMonth = month === 1 ? 12 : month - 1
      onTurnMonth(prevYear, prevMonth, 'backward', 'last')
    }
  }, [clampedPage, isSetupDone, isClosing, month, year, onTurnMonth])

  // Navigate to next page or next month
  const handleTurnNext = useCallback(() => {
    if (!isSetupDone || isClosing) return
    if (clampedPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1)
    } else {
      // Turn to next month's first page (Correction 6)
      const nextYear = month === 12 ? year + 1 : year
      const nextMonth = month === 12 ? 1 : month + 1
      onTurnMonth(nextYear, nextMonth, 'forward', 'first')
    }
  }, [clampedPage, totalPages, isSetupDone, isClosing, month, year, onTurnMonth])

  // ── Swipe Touch Event Handlers (Correction 8) ────────────────
  const touchStartRef = useRef<{ x: number; y: number; isInteractive: boolean }>({
    x: 0,
    y: 0,
    isInteractive: false,
  })

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isClosing) return
    const touch = e.touches[0]
    if (!touch) return

    // Check if touch originated from an interactive element
    const target = e.target as HTMLElement | null
    const isInteractive = !!target?.closest(
      'input, textarea, select, button, [contenteditable="true"], [role="button"]',
    )

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      isInteractive,
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isClosing) return
    if (touchStartRef.current.isInteractive) return
    const touch = e.changedTouches[0]
    if (!touch) return

    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y

    // Must exceed horizontal threshold and ignore mostly-vertical gestures (Correction 8)
    const HORIZONTAL_THRESHOLD = 40
    if (
      Math.abs(deltaX) > HORIZONTAL_THRESHOLD &&
      Math.abs(deltaX) > Math.abs(deltaY) * 1.5
    ) {
      if (deltaX < 0) {
        // Swiped left -> next page
        handleTurnNext()
      } else {
        // Swiped right -> previous page
        handleTurnBack()
      }
    }
  }

  // Month information
  const curMonthObj = MONTHS[month - 1]
  const curMonthName = curMonthObj?.name || 'Month'

  // Current active page item
  const activePageItem = mobilePages[clampedPage]

  // Paper styling
  let paperBgStyle: React.CSSProperties = {}
  if (paperType === 'dotted') {
    paperBgStyle = {
      backgroundImage:
        'radial-gradient(circle, rgba(28, 36, 51, 0.22) 1.4px, transparent 1.4px)',
      backgroundSize: '22px 22px',
    }
  } else if (paperType === 'squared') {
    paperBgStyle = {
      backgroundImage:
        'linear-gradient(to right, rgba(28, 36, 51, 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(28, 36, 51, 0.12) 1px, transparent 1px)',
      backgroundSize: '22px 22px',
    }
  } else if (paperType === 'lined') {
    paperBgStyle = {
      backgroundImage:
        'linear-gradient(to bottom, rgba(28, 36, 51, 0.14) 1px, transparent 1px)',
      backgroundSize: '100% 22px',
    }
  }

  return (
    <div
      className="relative w-full min-h-screen bg-kraft flex items-center justify-center p-2 sm:p-4 select-none overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Pocket Book Outer Frame (Single Cream Page + Edge Tabs) ── */}
      <div className="relative flex items-center justify-center max-w-[390px] w-full h-[844px] max-h-[100dvh]">
        {/* ── Single Cream Page (#f4eddc) ── */}
        <div
          className={`relative bg-paper text-ink rounded-sm shadow-[0_12px_36px_rgba(33,27,22,0.45),0_2px_8px_rgba(33,27,22,0.3)] border border-desk/30 overflow-hidden flex flex-col justify-between transition-opacity duration-150 ${
            isClosing && prefersReducedMotion ? 'opacity-0' : 'opacity-100'
          } ${isClosing ? 'pointer-events-none' : ''}`}
          style={{
            width: 'calc(100% - 44px)', // 346px at 390px width
            height: 'calc(100% - 24px)', // 820px at 844px height
            ...paperBgStyle,
          }}
        >
          {/* Subtle paper grain texture */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, rgba(28, 36, 51, 0.02) 0px, rgba(28, 36, 51, 0.02) 2px, transparent 2px, transparent 4px)',
            }}
            aria-hidden="true"
          />

          {/* ── Dashed Stitched Line Near Left Edge (Handmade binding feel) ── */}
          <div
            className="absolute left-3.5 top-2 bottom-2 w-0 border-r-2 border-dashed border-ink/25 pointer-events-none z-10"
            aria-hidden="true"
          />

          {/* ── Miniature Antique Brass Key Charm (Home Desk — Task 15) ── */}
          <AntiqueBrassKey
            onLock={handleLockBook}
            disabled={isClosing}
            variant="mobile"
          />

          {/* ── Hanging Red Ribbon from Top Edge ── */}
          <div
            className="absolute -top-1 left-7 w-[20px] h-[52px] bg-redpen z-20 pointer-events-none"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 84%, 0 100%)',
              filter: 'drop-shadow(0 2px 4px rgba(28, 36, 51, 0.4))',
            }}
            aria-hidden="true"
          >
            <div className="w-full h-full bg-gradient-to-r from-ink/20 via-transparent to-ink/20" />
          </div>

          {/* ── Page Content Container (Zero inner scrolling) ── */}
          <div className="relative flex-1 flex flex-col pl-6 pr-3 pt-6 pb-2 overflow-hidden z-10">
            {/* Unset month sheet: show MonthSetupWizard (Correction 6) */}
            {!isSetupDone ? (
              <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                <MonthSetupWizard
                  year={year}
                  month={month}
                  monthName={curMonthName}
                  prevMonthData={prevMonthData}
                  onComplete={onCompleteSetup}
                />
              </div>
            ) : activePageItem ? (
              /* Widget Page Slice */
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* On first mobile page: handwritten Month Title with hand-drawn underline */}
                {clampedPage === 0 && (
                  <div className="mb-2 shrink-0">
                    <h1 className="font-hand text-xl font-bold text-ink leading-tight">
                      {curMonthName} {year}
                    </h1>
                    <svg
                      className="w-28 h-2 text-ink/70 mt-0.5"
                      viewBox="0 0 120 8"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M 2 4 Q 60 7, 118 3"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                )}

                {/* Render the widget using its mobile render component */}
                {(() => {
                  const { widget, subPage, totalSubPages } = activePageItem
                  const def = getWidgetDefinition(widget.type)
                  if (!def) {
                    return (
                      <div className="flex-1 flex items-center justify-center font-hand text-xs text-ink/70">
                        Unknown widget
                      </div>
                    )
                  }
                  const MobileComp = (def.mobileComponent || def.component) as React.ComponentType<any>
                  return (
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <MobileComp
                        id={widget.id}
                        config={widget.config}
                        w={widget.w}
                        h={widget.h}
                        isArrangeMode={false}
                        year={year}
                        month={month}
                        setupConfig={setupConfig}
                        mobileSubPage={subPage}
                        mobileTotalSubPages={totalSubPages}
                        initialEntries={initialEntries}
                      />
                    </div>
                  )
                })()}
              </div>
            ) : (
              /* Empty month spread with no widgets */
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <h1 className="font-hand text-2xl font-bold text-ink mb-2">
                  {curMonthName} {year}
                </h1>
                <p className="font-hand text-sm text-ink/70">
                  A fresh, quiet month.
                </p>
              </div>
            )}
          </div>

          {/* ── Page Footer Navigation (Back, Folio, Next Dog-Ear) ── */}
          <div className="relative h-12 flex items-center justify-between px-2 border-t border-ink/10 shrink-0 z-20">
            {/* Small "back" text at bottom-left (at least 44px tap target) */}
            <button
              type="button"
              onClick={handleTurnBack}
              className="min-w-[44px] min-h-[44px] pl-3 pr-2 flex items-center justify-center font-hand text-xs text-ink/70 hover:text-ink transition-colors cursor-pointer"
              aria-label="Previous page"
            >
              back
            </button>

            {/* Handwritten Folio in Center */}
            <div className="font-hand text-xs text-ink/70 select-none pointer-events-none">
              p. {clampedPage + 1} of {totalPages}
            </div>

            {/* Folded bottom-right dog-ear corner for "next" (at least 44px tap target) */}
            <button
              type="button"
              onClick={handleTurnNext}
              aria-label="Next page"
              title="Next page"
              className="relative w-12 h-12 min-w-[44px] min-h-[44px] cursor-pointer group select-none"
            >
              {/* Dark casing exposed underneath cut corner */}
              <div
                className="absolute inset-0 bg-ink/80"
                style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }}
              />
              {/* Turned-over folded flap */}
              <div
                className="absolute inset-0 bg-paper transition-transform duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5"
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 0 100%)',
                  filter: 'drop-shadow(-2px -2px 3px rgba(28, 36, 51, 0.35))',
                }}
              >
                <div className="w-full h-full bg-kraft/20" />
              </div>
            </button>
          </div>
        </div>

        {/* ── Mobile 3D Reverse Cover-Closing Overlay (Task 15 / Section 5.3) ── */}
        {isClosing && !prefersReducedMotion && (
          <div
            className="absolute left-0 top-3 bottom-3 z-50 pointer-events-none flex items-center justify-center"
            style={{
              width: 'calc(100% - 44px)',
              perspective: '1800px',
            }}
          >
            <div
              className="absolute inset-0 preserve-3d animate-reverse-cover-close transform-gpu"
              style={{
                transformOrigin: 'left center',
                boxShadow: '4px 6px 20px rgba(0, 0, 0, 0.65)',
              }}
            >
              {/* Front face of cover (oxblood with gold foil borders and title) */}
              <div
                className="absolute inset-0 rounded-sm overflow-hidden bg-gradient-to-br from-oxblood to-oxblood-dark flex flex-col justify-between p-6 select-none"
                style={{ backfaceVisibility: 'hidden' }}
              >
                {/* Spine band */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-7 bg-oxblood-dark border-r border-gold/75"
                  aria-hidden="true"
                />
                <div
                  className="absolute left-9 right-3 top-4 bottom-4 border border-gold/70 rounded-sm"
                  aria-hidden="true"
                >
                  <div className="absolute inset-1 border border-gold/45 rounded-sm" />
                </div>
                <div className="relative z-10 pl-6 text-center pt-8">
                  <p className="font-cover text-[10px] tracking-[0.25em] text-gold uppercase font-medium">
                    VOLUME — {year}
                  </p>
                  <h2 className="font-cover text-2xl text-gold font-bold tracking-[0.16em] uppercase mt-1">
                    MEMORABLE
                    <br />
                    MOMENTS
                  </h2>
                  <p className="font-cover italic text-xs text-gold/90 tracking-widest mt-1 font-normal">
                    a year, kept by hand
                  </p>
                </div>
                <div className="relative z-10 pl-6 text-center pb-6">
                  <span className="font-cover text-[11px] tracking-[0.2em] text-gold/80 uppercase">
                    LOCKED
                  </span>
                </div>
              </div>

              {/* Inside endpaper backface */}
              <div
                className="absolute inset-0 rounded-sm bg-paper overflow-hidden backface-hidden"
                style={{
                  transform: 'rotateY(180deg)',
                  backgroundImage:
                    'radial-gradient(circle, rgba(28, 36, 51, 0.25) 1.2px, transparent 1.2px)',
                  backgroundSize: '22px 22px',
                }}
                aria-hidden="true"
              />
            </div>
          </div>
        )}

        {/* ── Month Index Tabs on Right Edge (At least 44px tall each, Correction 6) ── */}
        <nav
          aria-label="Month index tabs"
          className="absolute right-0 top-3 bottom-3 w-[42px] flex flex-col justify-between z-30 pointer-events-auto"
        >
          {MONTHS.map((m) => {
            const isActive = m.num === month
            return (
              <button
                key={m.num}
                type="button"
                onClick={() => {
                  if (m.num === month) return
                  const direction = m.num > month ? 'forward' : 'backward'
                  onTurnMonth(year, m.num, direction, 'first')
                }}
                onPointerDown={() => router.prefetch(`/book/${year}/${m.num}`)}
                onMouseEnter={() => router.prefetch(`/book/${year}/${m.num}`)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Jump to ${m.name}`}
                className={`flex items-center justify-center font-hand text-[11px] tracking-wider rounded-r-md transition-all duration-150 cursor-pointer select-none min-h-[44px] ${
                  isActive
                    ? 'w-10 bg-redpen text-paper font-bold shadow-[2px_2px_4px_rgba(28,36,51,0.4)] z-20 translate-x-0'
                    : 'w-7 bg-paper/90 hover:w-9 text-ink/80 hover:text-ink border-t border-b border-r border-ink/20 shadow-[1px_1px_3px_rgba(28,36,51,0.2)]'
                }`}
                style={{
                  height: '46px',
                }}
              >
                {m.short}
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
