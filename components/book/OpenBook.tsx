'use client'

import React, { useState, useEffect, useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Paper, { PAGE_W, PAGE_H, type PaperType } from '@/components/paper'
import { MonthSetupWizard, type PreviousMonthData } from '@/components/setup'
import {
  PageWidgetLayer,
  WidgetConfigCard,
  WidgetDrawer,
  PlacementOverlay,
  createWidget,
  type WidgetData,
  type WidgetDefinition,
  type PageSide,
} from '@/components/widgets'

// ── Month definitions (JAN - DEC) ─────────────────────────────
export const MONTHS = [
  { num: 1,  short: 'JAN', name: 'January' },
  { num: 2,  short: 'FEB', name: 'February' },
  { num: 3,  short: 'MAR', name: 'March' },
  { num: 4,  short: 'APR', name: 'April' },
  { num: 5,  short: 'MAY', name: 'May' },
  { num: 6,  short: 'JUN', name: 'June' },
  { num: 7,  short: 'JUL', name: 'July' },
  { num: 8,  short: 'AUG', name: 'August' },
  { num: 9,  short: 'SEP', name: 'September' },
  { num: 10, short: 'OCT', name: 'October' },
  { num: 11, short: 'NOV', name: 'November' },
  { num: 12, short: 'DEC', name: 'December' },
] as const

interface OpenBookProps {
  year: number
  month: number
  monthId?: string
  paperLeft?: PaperType
  paperRight?: PaperType
  initialSetupDone?: boolean
  initialWidgets?: WidgetData[]
  setupConfig?: Record<string, unknown>
  prevMonthData?: PreviousMonthData
  showNextMonthPrompt?: boolean
  nextMonthName?: string
  nextMonthDate?: { year: number; month: number }
}

type TurnDirection = 'forward' | 'backward'

export function OpenBook({
  year,
  month,
  monthId,
  paperLeft = 'dotted',
  paperRight = 'dotted',
  initialSetupDone = false,
  initialWidgets = [],
  setupConfig = {},
  prevMonthData = { exists: false },
  showNextMonthPrompt = false,
  nextMonthName,
  nextMonthDate,
}: OpenBookProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  // Setup state for the month
  const [isSetupDone, setIsSetupDone] = useState(initialSetupDone)
  const [currentMonthId, setCurrentMonthId] = useState<string | undefined>(monthId)
  const [currentSetupConfig, setCurrentSetupConfig] = useState<Record<string, unknown>>(setupConfig)
  const [currentPaperLeft, setCurrentPaperLeft] = useState<PaperType>(paperLeft)
  const [currentPaperRight, setCurrentPaperRight] = useState<PaperType>(paperRight)

  // Widgets & Arrange Mode state
  const [widgets, setWidgets] = useState<WidgetData[]>(initialWidgets)
  const [isArrangeMode, setIsArrangeMode] = useState(false)
  const [activeConfigWidgetId, setActiveConfigWidgetId] = useState<string | null>(null)

  // Card-catalogue drawer & placement state (Task 8)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pickedWidgetDef, setPickedWidgetDef] = useState<WidgetDefinition<any> | null>(null)

  // Navigation / animation state
  const [isTurning, setIsTurning] = useState<TurnDirection | null>(null)
  const [targetDate, setTargetDate] = useState<{ year: number; month: number }>({
    year,
    month,
  })
  const [isFading, setIsFading] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Listen to prefers-reduced-motion media query
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Sync state when route params change (turn finished and new page loaded)
  useEffect(() => {
    setIsTurning(null)
    setIsFading(false)
    setTargetDate({ year, month })
    setIsSetupDone(initialSetupDone)
    setCurrentMonthId(monthId)
    setCurrentSetupConfig(setupConfig)
    setCurrentPaperLeft(paperLeft)
    setCurrentPaperRight(paperRight)
    setWidgets(initialWidgets)
    setIsArrangeMode(false)
    setActiveConfigWidgetId(null)
    setIsDrawerOpen(false)
    setPickedWidgetDef(null)
  }, [year, month, initialSetupDone, paperLeft, paperRight, initialWidgets, monthId, setupConfig])

  const leftWidgets = widgets.filter((w) => w.page === 'left')
  const rightWidgets = widgets.filter((w) => w.page === 'right')

  const handleLeftWidgetsChange = useCallback((newLeft: WidgetData[]) => {
    setWidgets((prev) => [...prev.filter((w) => w.page !== 'left'), ...newLeft])
  }, [])

  const handleRightWidgetsChange = useCallback((newRight: WidgetData[]) => {
    setWidgets((prev) => [...prev.filter((w) => w.page !== 'right'), ...newRight])
  }, [])

  const handleWidgetSaved = useCallback((updated: WidgetData) => {
    setWidgets((prev) => prev.map((w) => (w.id === updated.id ? updated : w)))
  }, [])

  const handlePlaceWidget = useCallback(
    async (targetPage: PageSide, x: number, y: number) => {
      if (!currentMonthId || !pickedWidgetDef) return

      const defToPlace = pickedWidgetDef
      const res = await createWidget(currentMonthId, targetPage, defToPlace.id, x, y)
      if (res.success && res.data) {
        setWidgets((prev) => [...prev, res.data!])
        setPickedWidgetDef(null)
        setIsDrawerOpen(false)
        setIsArrangeMode(true) // Automatically enter Arrange mode (Correction & Detail)
      }
    },
    [currentMonthId, pickedWidgetDef],
  )

  const activeConfigWidget = widgets.find((w) => w.id === activeConfigWidgetId)

  // Calculate previous and next month dates with year boundary turn support
  const getPrevDate = useCallback(
    (curYear: number, curMonth: number) => {
      if (curMonth === 1) {
        return { year: curYear - 1, month: 12 }
      }
      return { year: curYear, month: curMonth - 1 }
    },
    [],
  )

  const getNextDate = useCallback(
    (curYear: number, curMonth: number) => {
      if (curMonth === 12) {
        return { year: curYear + 1, month: 1 }
      }
      return { year: curYear, month: curMonth + 1 }
    },
    [],
  )

  const curMonthObj = MONTHS[month - 1]

  // Master turn handler
  const executeTurn = useCallback(
    (tgtYear: number, tgtMonth: number, direction: TurnDirection) => {
      if (isTurning || isFading) return
      if (tgtYear === year && tgtMonth === month) return

      // Cancel picked card and close drawer on page turn (Correction 4)
      setPickedWidgetDef(null)
      setIsDrawerOpen(false)

      setTargetDate({ year: tgtYear, month: tgtMonth })

      if (prefersReducedMotion) {
        setIsFading(true)
        setTimeout(() => {
          startTransition(() => {
            router.push(`/book/${tgtYear}/${tgtMonth}`)
          })
        }, 180)
        return
      }

      setIsTurning(direction)
      setTimeout(() => {
        startTransition(() => {
          router.push(`/book/${tgtYear}/${tgtMonth}`)
        })
      }, 600)
    },
    [isTurning, isFading, year, month, prefersReducedMotion, router],
  )

  const turnForward = useCallback(() => {
    if (!isSetupDone) return // Cannot skip unset month (correction 5)
    const next = getNextDate(year, month)
    executeTurn(next.year, next.month, 'forward')
  }, [getNextDate, year, month, executeTurn, isSetupDone])

  const turnBackward = useCallback(() => {
    if (!isSetupDone) return // Cannot skip unset month (correction 5)
    const prev = getPrevDate(year, month)
    executeTurn(prev.year, prev.month, 'backward')
  }, [getPrevDate, year, month, executeTurn, isSetupDone])

  // Month tabs navigate to other months (allowed by correction 5)
  const handleTabClick = useCallback(
    (tabMonth: number) => {
      if (tabMonth === month) return
      const direction: TurnDirection = tabMonth > month ? 'forward' : 'backward'
      executeTurn(year, tabMonth, direction)
    },
    [month, year, executeTurn],
  )

  // Arrow keys listener (disabled when setup is pending, correction 5)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isSetupDone) return // Unset month cannot be dismissed by arrows
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        turnForward()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        turnBackward()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [turnForward, turnBackward, isSetupDone])

  // Left page heading
  const renderMonthTitle = (displayMonth: number, displayYear: number) => (
    <div className="pt-7 pl-8 select-none">
      <h1 className="font-hand text-2xl font-bold tracking-wider text-ink uppercase inline-block">
        {MONTHS[displayMonth - 1].name} {displayYear}
      </h1>
      <svg
        className="w-48 h-2 text-ink mt-0.5 opacity-75"
        viewBox="0 0 190 6"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M 2 3 C 45 1, 95 5, 140 2 C 160 1, 175 4, 188 3"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )

  // Left page folio (prev link + page number)
  const renderLeftFolio = (
    displayMonth: number,
    displayYear: number,
    onPrevClick?: () => void,
  ) => {
    const prev = getPrevDate(displayYear, displayMonth)
    const prevName = MONTHS[prev.month - 1].name
    const pageNum = 2 * displayMonth

    return (
      <div className="absolute bottom-4 left-7 right-7 flex items-center justify-between text-ink/70 font-hand text-xs select-none">
        {isSetupDone ? (
          <button
            type="button"
            onClick={onPrevClick}
            className="hover:text-ink transition-opacity cursor-pointer font-hand text-xs tracking-wide"
            aria-label={`Turn back to ${prevName}`}
          >
            {prevName}
          </button>
        ) : (
          <span className="opacity-50">{prevName}</span>
        )}
        <span className="font-hand tracking-widest text-[11px] opacity-80">
          p. {pageNum}
        </span>
      </div>
    )
  }

  // Right page folio (page number + next link)
  const renderRightFolio = (
    displayMonth: number,
    displayYear: number,
    onNextClick?: () => void,
  ) => {
    const next = getNextDate(displayYear, displayMonth)
    const nextName = MONTHS[next.month - 1].name
    const pageNum = 2 * displayMonth + 1

    return (
      <div className="absolute bottom-4 left-7 right-7 flex items-center justify-between text-ink/70 font-hand text-xs select-none">
        <span className="font-hand tracking-widest text-[11px] opacity-80">
          p. {pageNum}
        </span>
        {isSetupDone ? (
          <button
            type="button"
            onClick={onNextClick}
            className="hover:text-ink transition-opacity cursor-pointer font-hand text-xs tracking-wide mr-8"
            aria-label={`Turn forward to ${nextName}`}
          >
            {nextName}
          </button>
        ) : (
          <span className="opacity-50 mr-8">{nextName}</span>
        )}
      </div>
    )
  }

  // Folded dog-ear corner on bottom-right of right page
  const renderFoldedCorner = (onClickCorner: () => void) => {
    if (!isSetupDone) return null
    return (
      <div
        onClick={onClickCorner}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClickCorner()
          }
        }}
        aria-label="Turn forward to next month"
        title="Turn forward to next month"
        className="absolute bottom-0 right-0 w-9 h-9 cursor-pointer z-20 group select-none"
      >
        {/* Dark book casing exposed underneath cut corner */}
        <div
          className="absolute inset-0 bg-ink"
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
      </div>
    )
  }

  return (
    <div
      className={`relative select-none transition-opacity duration-200 ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        width: PAGE_W * 2 + 24, // 968px + 24px casing padding = 992px
      }}
    >
      {/* ── Hardcover Casing Frame (desk #211b16 / ink #1c2433) ── */}
      <div
        className="relative bg-ink rounded-lg p-[12px] shadow-[0_20px_50px_rgba(28,36,51,0.7),0_2px_8px_rgba(33,27,22,0.5)] border border-desk"
        style={{
          width: PAGE_W * 2 + 24,
          height: PAGE_H + 24,
        }}
      >
        {/* ── 3D Book Spread Perspective Container ── */}
        <div
          className="relative perspective-book"
          style={{ width: PAGE_W * 2, height: PAGE_H }}
        >
          {/* ════════════════════════════════════════════════════════
              CASE 1: TURNING FORWARD (Right leaf flips to left)
              ════════════════════════════════════════════════════════ */}
          {isTurning === 'forward' && (
            <div className="relative w-full h-full preserve-3d">
              {/* Base Left Page */}
              <div className="absolute top-0 left-0">
                <Paper type={currentPaperLeft} side="left">
                  {renderMonthTitle(month, year)}
                  <PageWidgetLayer
                    page="left"
                    monthId={currentMonthId}
                    widgets={leftWidgets}
                    isArrangeMode={false}
                    onWidgetsChange={handleLeftWidgetsChange}
                    onOpenConfig={() => {}}
                  />
                  {renderLeftFolio(month, year)}
                  <div className="absolute inset-0 bg-ink pointer-events-none animate-shadow-under-left" />
                </Paper>
              </div>

              {/* Base Right Page: Target month right page */}
              <div className="absolute top-0 left-[484px]">
                <Paper type={currentPaperRight} side="right">
                  {renderRightFolio(targetDate.month, targetDate.year)}
                  {renderFoldedCorner(() => {})}
                  <div className="absolute inset-0 bg-ink pointer-events-none animate-shadow-under-right" />
                </Paper>
              </div>

              {/* Flipping Leaf */}
              <div
                className="absolute top-0 left-[484px] preserve-3d animate-page-flip-forward"
                style={{
                  width: PAGE_W,
                  height: PAGE_H,
                  transformOrigin: 'left center',
                }}
              >
                {/* Front Face of Leaf */}
                <div className="absolute inset-0 backface-hidden">
                  <Paper type={currentPaperRight} side="right">
                    <PageWidgetLayer
                      page="right"
                      monthId={monthId}
                      widgets={rightWidgets}
                      isArrangeMode={false}
                      onWidgetsChange={handleRightWidgetsChange}
                      onOpenConfig={() => {}}
                    />
                    {renderRightFolio(month, year)}
                    {renderFoldedCorner(() => {})}
                    <div className="absolute inset-0 bg-ink pointer-events-none animate-leaf-shadow-forward" />
                  </Paper>
                </div>

                {/* Back Face of Leaf */}
                <div
                  className="absolute inset-0 backface-hidden"
                  style={{ transform: 'rotateY(180deg)' }}
                >
                  <Paper type={currentPaperLeft} side="left">
                    {renderMonthTitle(targetDate.month, targetDate.year)}
                    {renderLeftFolio(targetDate.month, targetDate.year)}
                    <div className="absolute inset-0 bg-ink pointer-events-none animate-leaf-shadow-forward" />
                  </Paper>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              CASE 2: TURNING BACKWARD (Left leaf flips to right)
              ════════════════════════════════════════════════════════ */}
          {isTurning === 'backward' && (
            <div className="relative w-full h-full preserve-3d">
              {/* Base Left Page */}
              <div className="absolute top-0 left-0">
                <Paper type={currentPaperLeft} side="left">
                  {renderMonthTitle(targetDate.month, targetDate.year)}
                  {renderLeftFolio(targetDate.month, targetDate.year)}
                  <div className="absolute inset-0 bg-ink pointer-events-none animate-shadow-under-right" />
                </Paper>
              </div>

              {/* Base Right Page */}
              <div className="absolute top-0 left-[484px]">
                <Paper type={currentPaperRight} side="right">
                  <PageWidgetLayer
                    page="right"
                    monthId={monthId}
                    widgets={rightWidgets}
                    isArrangeMode={false}
                    onWidgetsChange={handleRightWidgetsChange}
                    onOpenConfig={() => {}}
                  />
                  {renderRightFolio(month, year)}
                  {renderFoldedCorner(() => {})}
                  <div className="absolute inset-0 bg-ink pointer-events-none animate-shadow-under-left" />
                </Paper>
              </div>

              {/* Flipping Leaf */}
              <div
                className="absolute top-0 left-0 preserve-3d animate-page-flip-backward"
                style={{
                  width: PAGE_W,
                  height: PAGE_H,
                  transformOrigin: 'right center',
                }}
              >
                {/* Front Face of Leaf */}
                <div className="absolute inset-0 backface-hidden">
                  <Paper type={currentPaperLeft} side="left">
                    {renderMonthTitle(month, year)}
                    <PageWidgetLayer
                      page="left"
                      monthId={monthId}
                      widgets={leftWidgets}
                      isArrangeMode={false}
                      onWidgetsChange={handleLeftWidgetsChange}
                      onOpenConfig={() => {}}
                    />
                    {renderLeftFolio(month, year)}
                    <div className="absolute inset-0 bg-ink pointer-events-none animate-leaf-shadow-backward" />
                  </Paper>
                </div>

                {/* Back Face of Leaf */}
                <div
                  className="absolute inset-0 backface-hidden"
                  style={{ transform: 'rotateY(-180deg)' }}
                >
                  <Paper type={currentPaperRight} side="right">
                    {renderRightFolio(targetDate.month, targetDate.year)}
                    {renderFoldedCorner(() => {})}
                    <div className="absolute inset-0 bg-ink pointer-events-none animate-leaf-shadow-backward" />
                  </Paper>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              CASE 3: STATIC SPREAD (Default resting state)
              ════════════════════════════════════════════════════════ */}
          {!isTurning && (
            <div className="flex relative">
              {/* Left Page */}
              <Paper type={currentPaperLeft} side="left">
                {renderMonthTitle(month, year)}
                <PageWidgetLayer
                  page="left"
                  monthId={currentMonthId}
                  year={year}
                  month={month}
                  setupConfig={currentSetupConfig}
                  widgets={leftWidgets}
                  isArrangeMode={isArrangeMode}
                  onWidgetsChange={handleLeftWidgetsChange}
                  onOpenConfig={(id) => setActiveConfigWidgetId(id)}
                />
                {pickedWidgetDef && (
                  <PlacementOverlay
                    page="left"
                    pickedWidgetDef={pickedWidgetDef}
                    existingWidgets={leftWidgets}
                    onPlace={handlePlaceWidget}
                  />
                )}
                {renderLeftFolio(month, year, turnBackward)}
              </Paper>

              {/* Right Page */}
              <Paper type={currentPaperRight} side="right">
                <PageWidgetLayer
                  page="right"
                  monthId={currentMonthId}
                  year={year}
                  month={month}
                  setupConfig={currentSetupConfig}
                  widgets={rightWidgets}
                  isArrangeMode={isArrangeMode}
                  onWidgetsChange={handleRightWidgetsChange}
                  onOpenConfig={(id) => setActiveConfigWidgetId(id)}
                />
                {pickedWidgetDef && (
                  <PlacementOverlay
                    page="right"
                    pickedWidgetDef={pickedWidgetDef}
                    existingWidgets={rightWidgets}
                    onPlace={handlePlaceWidget}
                  />
                )}
                {renderRightFolio(month, year, turnForward)}
                {renderFoldedCorner(turnForward)}

                {/* Gentle prompt for next month's setup in last 3 days (correction 5) */}
                {isSetupDone && showNextMonthPrompt && nextMonthName && nextMonthDate && (
                  <div className="absolute top-6 right-8 z-30 select-none">
                    <button
                      type="button"
                      onClick={() =>
                        executeTurn(
                          nextMonthDate.year,
                          nextMonthDate.month,
                          'forward',
                        )
                      }
                      className="bg-paper border border-ink/30 hover:border-redpen/70 px-3 py-1.5 rounded shadow-[1px_2px_6px_rgba(28,36,51,0.25)] font-hand text-xs text-ink hover:text-redpen transition-all cursor-pointer flex items-center gap-1.5 -rotate-1 group"
                      aria-label={`Set up ${nextMonthName}`}
                    >
                      <span>Set up {nextMonthName}?</span>
                      <svg
                        className="w-3.5 h-3.5 text-ink group-hover:text-redpen transition-transform group-hover:translate-x-0.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M 4 12 C 9 11.5, 14 12, 19 12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 14 7 C 16 9.5, 18 11.5, 20 12 C 18 12.5, 16 14.5, 14 17"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </Paper>

              {/* ── Widget Configuration Card (Task 6 Tucked Loose Card Style) ── */}
              {activeConfigWidget && (
                <WidgetConfigCard
                  widget={activeConfigWidget}
                  onClose={() => setActiveConfigWidgetId(null)}
                  onSaved={handleWidgetSaved}
                  allWidgets={widgets}
                />
              )}

              {/* ── Month Setup Wizard Overlay (Unset month sheet, L9) ── */}
              {!isSetupDone && (
                <MonthSetupWizard
                  year={year}
                  month={month}
                  monthName={curMonthObj.name}
                  prevMonthData={prevMonthData}
                  onComplete={(newLeft, newRight, createdWidgets, newMonthId, newSetupConfig) => {
                    setCurrentPaperLeft(newLeft)
                    setCurrentPaperRight(newRight)
                    if (newMonthId) {
                      setCurrentMonthId(newMonthId)
                    }
                    if (newSetupConfig) {
                      setCurrentSetupConfig(newSetupConfig)
                    }
                    if (createdWidgets && createdWidgets.length > 0) {
                      setWidgets(createdWidgets)
                    }
                    setIsSetupDone(true)
                    startTransition(() => {
                      router.refresh()
                    })
                  }}
                />
              )}
            </div>
          )}

          {/* ── Center Spine Shadow / Seam ── */}
          <div
            className="absolute top-0 bottom-0 left-[483px] w-[2px] bg-desk/50 shadow-[0_0_8px_rgba(28,36,51,0.6)] pointer-events-none z-10"
            aria-hidden="true"
          />
        </div>

        {/* ── Month Index Tabs on Right Edge (L6 palette) ── */}
        <nav
          aria-label="Month index tabs"
          className="absolute left-full top-[16px] bottom-[16px] flex flex-col justify-between"
          style={{ width: '48px' }}
        >
          {MONTHS.map((m) => {
            const isActive = m.num === month
            return (
              <button
                key={m.num}
                type="button"
                onClick={() => handleTabClick(m.num)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Jump to ${m.name}`}
                className={`flex items-center justify-center font-hand text-[11px] tracking-wider rounded-r-md transition-all duration-150 cursor-pointer select-none ${
                  isActive
                    ? 'w-11 bg-redpen text-paper font-bold shadow-[2px_2px_4px_rgba(28,36,51,0.4)] z-20 translate-x-0'
                    : 'w-7 bg-paper/90 hover:w-9 text-ink/80 hover:text-ink border-t border-b border-r border-ink/20 shadow-[1px_1px_3px_rgba(28,36,51,0.2)]'
                }`}
                style={{
                  height: '38px',
                }}
              >
                {m.short}
              </button>
            )
          })}
        </nav>

        {/* ── Arrange Ribbon Tab at Top Edge (L1 — ribbon, not toolbar) ── */}
        {isSetupDone && (
          <button
            type="button"
            onClick={() => setIsArrangeMode((prev) => !prev)}
            className={`absolute -top-7 left-24 z-30 flex items-center justify-center px-4 py-1 font-hand text-xs transition-all duration-200 cursor-pointer select-none rounded-t-sm shadow-[0_-2px_6px_rgba(28,36,51,0.3)] ${
              isArrangeMode
                ? 'bg-gold text-ink font-bold -translate-y-1'
                : 'bg-kraft/90 hover:bg-kraft text-paper hover:-translate-y-0.5'
            }`}
            style={{
              clipPath: 'polygon(0 100%, 0 0, 100% 0, 100% 100%, 50% 85%)',
              height: '38px',
              paddingBottom: '8px',
            }}
            aria-pressed={isArrangeMode}
            aria-label="Toggle Arrange Mode"
            title={isArrangeMode ? 'Finish arranging' : 'Arrange widgets'}
          >
            {isArrangeMode ? 'Done' : 'Arrange'}
          </button>
        )}

        {/* ── Red Ribbon hanging from bottom of spine ── */}
        <div
          className="absolute bottom-[-68px] left-1/2 -translate-x-1/2 w-[22px] h-[78px] bg-redpen z-30 pointer-events-none"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 84%, 0 100%)',
            filter: 'drop-shadow(0 4px 6px rgba(28, 36, 51, 0.5))',
          }}
          aria-hidden="true"
        >
          <div className="w-full h-full bg-gradient-to-r from-ink/20 via-transparent to-ink/20" />
        </div>
      </div>

      {/* ── Wooden Card-Catalogue Widget Library Drawer (Task 8) ── */}
      <WidgetDrawer
        isOpen={isDrawerOpen}
        isSetupDone={isSetupDone}
        pickedWidgetDef={pickedWidgetDef}
        onToggleOpen={() => {
          if (pickedWidgetDef) {
            setPickedWidgetDef(null)
          } else {
            setIsDrawerOpen((prev) => !prev)
          }
        }}
        onPickCard={(def) => {
          setPickedWidgetDef(def)
          setIsDrawerOpen(false)
        }}
        onCancelPick={() => setPickedWidgetDef(null)}
      />
    </div>
  )
}
