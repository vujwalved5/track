'use client'

import React, { useState, useEffect, useRef, useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Paper, { PAGE_W, PAGE_H, PAGE_COLS, PAGE_ROWS, type PaperType } from '@/components/paper'
import type { PreviousMonthData } from '@/components/setup'
import { MobileBook } from './MobileBook'
import {
  PageWidgetLayer,
  PlacementOverlay,
  createWidget,
  isValidPlacement,
  type WidgetData,
  type WidgetDefinition,
  type PageSide,
  type WidgetRect,
} from '@/components/widgets'
import {
  getWidgetMetadata,
  findFittingSizeAt,
  findFirstAvailableSpot,
} from '@/components/widgets/widgetMetadata'
import {
  setInitialEntries,
  type WidgetEntryRow,
} from '@/components/widgets/entryHelpers'

const MonthSetupWizard = dynamic(
  () => import('@/components/setup/MonthSetupWizard').then((m) => m.MonthSetupWizard),
  { ssr: false, loading: () => null },
)
const WidgetDrawer = dynamic(
  () => import('@/components/widgets/WidgetDrawer').then((m) => m.WidgetDrawer),
  { ssr: false, loading: () => null },
)
const WidgetConfigCard = dynamic(
  () => import('@/components/widgets/WidgetConfigCard').then((m) => m.WidgetConfigCard),
  { ssr: false, loading: () => null },
)

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
  initialEntries?: WidgetEntryRow[]
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
  initialEntries = [],
  setupConfig = {},
  prevMonthData = { exists: false },
  showNextMonthPrompt = false,
  nextMonthName,
  nextMonthDate,
}: OpenBookProps) {
  // Synchronously prime the entries cache with initial SSR data so child widgets avoid waterfalls
  setInitialEntries(initialEntries, initialWidgets.map((w) => w.id))

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
  const [connectionError, setConnectionError] = useState<string | null>(null)

  const showConnectionError = useCallback((msg = 'needs a connection') => {
    setConnectionError(msg)
    setTimeout(() => setConnectionError(null), 3500)
  }, [])
  const [targetDate, setTargetDate] = useState<{ year: number; month: number }>({
    year,
    month,
  })
  const [isFading, setIsFading] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Viewport detection (Correction 7: exactly ONE tree, null avoids hydration mismatch)
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null)
  const [mobilePageMode, setMobilePageMode] = useState<'first' | 'last'>('first')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(min-width: 768px)')
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

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
    setInitialEntries(initialEntries, initialWidgets.map((w) => w.id))
  }, [year, month, initialSetupDone, paperLeft, paperRight, initialWidgets, initialEntries, monthId, setupConfig])

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

  const handleOpenConfig = useCallback((id: string) => {
    setActiveConfigWidgetId(id)
  }, [])

  const handleCloseConfig = useCallback(() => {
    setActiveConfigWidgetId(null)
  }, [])

  const handleOverlayHover = useCallback((page: PageSide, x: number, y: number) => {
    setActivePlacement({ page, x, y })
  }, [])

  const handleDrawerOpenToggle = useCallback(() => {
    if (pickedWidgetDef) {
      setPickedWidgetDef(null)
    } else {
      setIsDrawerOpen((prev) => !prev)
    }
  }, [pickedWidgetDef])

  const handlePickCard = useCallback((def: WidgetDefinition) => {
    setPickedWidgetDef(def)
    setIsDrawerOpen(false)
  }, [])

  const handleCancelPick = useCallback(() => {
    setPickedWidgetDef(null)
  }, [])

  const noop = useCallback(() => {}, [])

  const handleCompleteSetup = useCallback(
    (
      newLeft: PaperType,
      newRight: PaperType,
      createdWidgets?: WidgetData[],
      newMonthId?: string,
      newSetupConfig?: Record<string, unknown>,
    ) => {
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
    },
    [router],
  )

  const [placementError, setPlacementError] = useState<string | null>(null)
  const [activePlacement, setActivePlacement] = useState<{
    page: PageSide
    x: number
    y: number
  } | null>(null)
  const [noRoomMessage, setNoRoomMessage] = useState(false)
  const noRoomTimerRef = useRef<NodeJS.Timeout | null>(null)

  const triggerNoRoom = useCallback(() => {
    if (noRoomTimerRef.current) clearTimeout(noRoomTimerRef.current)
    setNoRoomMessage(true)
    noRoomTimerRef.current = setTimeout(() => {
      setNoRoomMessage(false)
    }, 3500)
  }, [])

  const dismissNoRoom = useCallback(() => {
    if (noRoomTimerRef.current) {
      clearTimeout(noRoomTimerRef.current)
      noRoomTimerRef.current = null
    }
    setNoRoomMessage(false)
  }, [])

  // Auto-dismiss "No room here." on next tap or key (Condition 7)
  useEffect(() => {
    if (!noRoomMessage) return
    const handleNextInteraction = () => {
      dismissNoRoom()
    }
    window.addEventListener('keydown', handleNextInteraction, true)
    window.addEventListener('pointerdown', handleNextInteraction, true)
    return () => {
      window.removeEventListener('keydown', handleNextInteraction, true)
      window.removeEventListener('pointerdown', handleNextInteraction, true)
    }
  }, [noRoomMessage, dismissNoRoom])

  const handlePlaceWidget = useCallback(
    async (targetPage: PageSide, x: number, y: number, w?: number, h?: number) => {
      if (!currentMonthId || !pickedWidgetDef) return

      // Offline guard (Correction 3): placing widgets needs a connection
      if (typeof window !== 'undefined' && !navigator.onLine) {
        setPlacementError('needs a connection')
        setTimeout(() => setPlacementError(null), 3500)
        return
      }

      const defToPlace = pickedWidgetDef
      const meta = getWidgetMetadata(defToPlace.id)
      const candidateW = w !== undefined ? Math.round(w) : meta?.defaultSize.w ?? defToPlace.defaultSize.w
      const candidateH = h !== undefined ? Math.round(h) : meta?.defaultSize.h ?? defToPlace.defaultSize.h
      const minSz = meta?.minSize ?? defToPlace.minSize

      const candidateRect: WidgetRect = {
        x: Math.round(x),
        y: Math.round(y),
        w: candidateW,
        h: candidateH,
      }

      const existingOnPage = (targetPage === 'left' ? leftWidgets : rightWidgets).map((cw) => ({
        x: cw.x,
        y: cw.y,
        w: cw.w,
        h: cw.h,
      }))

      // Client-side bounds and overlap validation
      if (!isValidPlacement(candidateRect, minSz, existingOnPage, PAGE_COLS, PAGE_ROWS)) {
        triggerNoRoom()
        return
      }

      const widgetId = crypto.randomUUID()
      const optimisticWidget: WidgetData = {
        id: widgetId,
        month_id: currentMonthId,
        page: targetPage,
        type: defToPlace.id,
        x: candidateRect.x,
        y: candidateRect.y,
        w: candidateRect.w,
        h: candidateRect.h,
        config: {},
        z: 0,
        created_at: new Date().toISOString(),
      }

      // Optimistically insert widget into state on immediate frame
      setWidgets((prev) => [...prev, optimisticWidget])
      setPickedWidgetDef(null)
      setActivePlacement(null)
      setIsDrawerOpen(false)
      setIsArrangeMode(true)

      // Call createWidget in background with same client-generated UUID
      try {
        const res = await createWidget(
          currentMonthId,
          targetPage,
          defToPlace.id,
          candidateRect.x,
          candidateRect.y,
          candidateRect.w,
          candidateRect.h,
          widgetId,
        )
        if (!res.success) {
          // Roll back optimistic widget on placement failure
          setWidgets((prev) => prev.filter((w) => w.id !== widgetId))
          setPlacementError(res.error || 'Failed to place widget')
          setTimeout(() => setPlacementError(null), 3500)
        }
      } catch (err) {
        // Roll back optimistic widget on network/server error
        setWidgets((prev) => prev.filter((w) => w.id !== widgetId))
        setPlacementError(err instanceof Error ? err.message : 'Failed to place widget')
        setTimeout(() => setPlacementError(null), 3500)
      }
    },
    [currentMonthId, pickedWidgetDef, leftWidgets, rightWidgets, triggerNoRoom],
  )

  // Find first available spot when a card is picked (Condition 6)
  useEffect(() => {
    if (!pickedWidgetDef) {
      setActivePlacement(null)
      dismissNoRoom()
      return
    }

    const meta = getWidgetMetadata(pickedWidgetDef.id)
    const defSize = meta?.defaultSize ?? pickedWidgetDef.defaultSize
    const minSz = meta?.minSize ?? pickedWidgetDef.minSize
    const leftRects = leftWidgets.map((w) => ({ x: w.x, y: w.y, w: w.w, h: w.h }))
    const rightRects = rightWidgets.map((w) => ({ x: w.x, y: w.y, w: w.w, h: w.h }))

    const leftSpot = findFirstAvailableSpot(minSz, defSize, leftRects, PAGE_COLS, PAGE_ROWS)
    if (leftSpot) {
      setActivePlacement({ page: 'left', x: leftSpot.x, y: leftSpot.y })
    } else {
      const rightSpot = findFirstAvailableSpot(minSz, defSize, rightRects, PAGE_COLS, PAGE_ROWS)
      if (rightSpot) {
        setActivePlacement({ page: 'right', x: rightSpot.x, y: rightSpot.y })
      } else {
        setActivePlacement({ page: 'left', x: 0, y: 0 })
      }
    }
  }, [pickedWidgetDef])

  const activePlacementRef = useRef(activePlacement)
  activePlacementRef.current = activePlacement

  const pickedWidgetDefRef = useRef(pickedWidgetDef)
  pickedWidgetDefRef.current = pickedWidgetDef

  const widgetsRef = useRef(widgets)
  widgetsRef.current = widgets

  // Keyboard navigation & global dismissal for placement (Condition 6 & 7)
  useEffect(() => {
    if (!pickedWidgetDef) return

    const handleKeyDown = (e: KeyboardEvent) => {
      dismissNoRoom()

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        e.stopPropagation()
        setActivePlacement((prev) => {
          if (!prev) return { page: 'left', x: 0, y: 0 }
          if (prev.page === 'right' && prev.x === 0) {
            return { page: 'left', x: PAGE_COLS - 1, y: prev.y }
          }
          return { ...prev, x: Math.max(0, prev.x - 1) }
        })
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        e.stopPropagation()
        setActivePlacement((prev) => {
          if (!prev) return { page: 'left', x: 0, y: 0 }
          if (prev.page === 'left' && prev.x === PAGE_COLS - 1) {
            return { page: 'right', x: 0, y: prev.y }
          }
          return { ...prev, x: Math.min(PAGE_COLS - 1, prev.x + 1) }
        })
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        e.stopPropagation()
        setActivePlacement((prev) => ({
          page: prev?.page ?? 'left',
          x: prev?.x ?? 0,
          y: Math.max(0, (prev?.y ?? 0) - 1),
        }))
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        e.stopPropagation()
        setActivePlacement((prev) => ({
          page: prev?.page ?? 'left',
          x: prev?.x ?? 0,
          y: Math.min(PAGE_ROWS - 1, (prev?.y ?? 0) + 1),
        }))
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        e.stopPropagation()
        const curPlacement = activePlacementRef.current
        const curDef = pickedWidgetDefRef.current
        if (!curPlacement || !curDef) return

        const meta = getWidgetMetadata(curDef.id)
        const defSize = meta?.defaultSize ?? curDef.defaultSize
        const minSz = meta?.minSize ?? curDef.minSize
        const curWidgets = widgetsRef.current
        const targetWidgets = curWidgets.filter((w) => w.page === curPlacement.page)
        const targetRects = targetWidgets.map((w) => ({ x: w.x, y: w.y, w: w.w, h: w.h }))
        const fit = findFittingSizeAt(
          curPlacement.x,
          curPlacement.y,
          defSize,
          minSz,
          targetRects,
          PAGE_COLS,
          PAGE_ROWS,
        )
        if (fit) {
          handlePlaceWidget(curPlacement.page, curPlacement.x, curPlacement.y, fit.w, fit.h)
        } else {
          triggerNoRoom()
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        setPickedWidgetDef(null)
        setActivePlacement(null)
      }
    }

    const handlePointerDown = () => {
      dismissNoRoom()
    }

    window.addEventListener('keydown', handleKeyDown, true)
    window.addEventListener('pointerdown', handlePointerDown, true)
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
      window.removeEventListener('pointerdown', handlePointerDown, true)
    }
  }, [pickedWidgetDef, handlePlaceWidget, dismissNoRoom, triggerNoRoom])

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

  // Prefetch previous and next month routes during idle time (Fix 2)
  useEffect(() => {
    const prev = getPrevDate(year, month)
    const next = getNextDate(year, month)
    router.prefetch(`/book/${prev.year}/${prev.month}`)
    router.prefetch(`/book/${next.year}/${next.month}`)
  }, [year, month, router, getPrevDate, getNextDate])

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

  const handleMobileTurnMonth = useCallback(
    (
      tgtYear: number,
      tgtMonth: number,
      direction: TurnDirection,
      targetPageMode: 'first' | 'last' = 'first',
    ) => {
      setMobilePageMode(targetPageMode)
      executeTurn(tgtYear, tgtMonth, direction)
    },
    [executeTurn],
  )

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
      if (pickedWidgetDef) return // Do not turn pages while placing a widget (arrows move placement cursor)
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
  }, [turnForward, turnBackward, isSetupDone, pickedWidgetDef])

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
      <button
        type="button"
        onClick={onClickCorner}
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
      </button>
    )
  }

  // Neutral desk-coloured placeholder until matchMedia is known (avoid hydration mismatch, Correction 7)
  if (isDesktop === null) {
    return (
      <div
        className="w-screen h-screen min-h-screen bg-desk"
        style={{
          backgroundColor: '#211b16',
          contain: 'paint layout',
        }}
        aria-hidden="true"
      />
    )
  }

  // Mobile layout (< 768px, L8, Correction 7)
  if (!isDesktop) {
    return (
      <MobileBook
        year={year}
        month={month}
        monthId={currentMonthId}
        paperType={currentPaperLeft}
        isSetupDone={isSetupDone}
        setupConfig={currentSetupConfig}
        prevMonthData={prevMonthData}
        widgets={widgets}
        initialEntries={initialEntries}
        onWidgetsChange={setWidgets}
        onWidgetSaved={handleWidgetSaved}
        onTurnMonth={handleMobileTurnMonth}
        onCompleteSetup={handleCompleteSetup}
        initialPageMode={mobilePageMode}
      />
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
      {/* Red-Pen Offline Connection Banner (Correction 3) */}
      {connectionError && (
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 bg-paper/95 border border-redpen px-4 py-1 rounded shadow-md font-hand text-sm text-redpen font-bold"
          role="alert"
        >
          {connectionError}
        </div>
      )}

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
                    onOpenConfig={noop}
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
                className="absolute top-0 left-[484px] preserve-3d animate-page-flip-forward transform-gpu"
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
                      onOpenConfig={noop}
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
                    onOpenConfig={noop}
                  />
                  {renderRightFolio(month, year)}
                  {renderFoldedCorner(() => {})}
                  <div className="absolute inset-0 bg-ink pointer-events-none animate-shadow-under-left" />
                </Paper>
              </div>

              {/* Flipping Leaf */}
              <div
                className="absolute top-0 left-0 preserve-3d animate-page-flip-backward transform-gpu"
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
                      onOpenConfig={noop}
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
              {/* Server / Placement Error Feedback: handwritten red-pen message directly on the page (L1) */}
              {placementError && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none">
                  <p className="font-hand text-sm text-redpen tracking-wide font-normal -rotate-1">
                    {placementError}
                  </p>
                </div>
              )}

              {/* Red-Pen "No room here." status notification (Condition 7: role="status", dismisses on tap/key or 3.5s) */}
              {noRoomMessage && (
                <div
                  role="status"
                  className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-paper/95 border border-redpen px-4 py-1.5 rounded shadow-md pointer-events-none"
                >
                  <p className="font-hand text-xs text-redpen font-bold tracking-wide">
                    No room here.
                  </p>
                </div>
              )}

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
                  onOpenConfig={handleOpenConfig}
                />
                {pickedWidgetDef && (
                  <PlacementOverlay
                    page="left"
                    pickedWidgetDef={pickedWidgetDef}
                    existingWidgets={leftWidgets}
                    cursor={activePlacement?.page === 'left' ? activePlacement : null}
                    onHover={handleOverlayHover}
                    onPlace={handlePlaceWidget}
                    onNoRoom={triggerNoRoom}
                    onDismissNoRoom={dismissNoRoom}
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
                  onOpenConfig={handleOpenConfig}
                />
                {pickedWidgetDef && (
                  <PlacementOverlay
                    page="right"
                    pickedWidgetDef={pickedWidgetDef}
                    existingWidgets={rightWidgets}
                    cursor={activePlacement?.page === 'right' ? activePlacement : null}
                    onHover={handleOverlayHover}
                    onPlace={handlePlaceWidget}
                    onNoRoom={triggerNoRoom}
                    onDismissNoRoom={dismissNoRoom}
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
                  onClose={handleCloseConfig}
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
                  onComplete={handleCompleteSetup}
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
                onPointerDown={() => router.prefetch(`/book/${year}/${m.num}`)}
                onMouseEnter={() => router.prefetch(`/book/${year}/${m.num}`)}
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

        {/* ── Print Ribbon Tab at Top Edge (L1 — ribbon, Correction 6) ── */}
        {isSetupDone && (
          <button
            type="button"
            onClick={() => window.print()}
            className="absolute -top-7 left-48 z-30 flex items-center justify-center px-4 py-1 font-hand text-xs transition-all duration-200 cursor-pointer select-none rounded-t-sm shadow-[0_-2px_6px_rgba(28,36,51,0.3)] bg-kraft/90 hover:bg-kraft text-paper hover:-translate-y-0.5"
            style={{
              clipPath: 'polygon(0 100%, 0 0, 100% 0, 100% 100%, 50% 85%)',
              height: '38px',
              paddingBottom: '8px',
            }}
            aria-label="Print this month"
            title="Print this month"
          >
            Print
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
        onToggleOpen={handleDrawerOpenToggle}
        onPickCard={handlePickCard}
        onCancelPick={handleCancelPick}
      />
    </div>
  )
}
