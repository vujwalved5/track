'use client'

/**
 * Memorable Moments Widget
 * Memorable Moments — Phase 5 / Task 9
 *
 * Rules:
 * - Group: 'Track'
 * - Default size: 22x18 (22 cols × 18 rows on 22px grid)
 * - Two columns: days 1 to 16 and 17 to 31 (Correction 4)
 * - Lines on 22px rules (h-[22px]) (Correction 4)
 * - Handwritten Kalam font (L5)
 * - Tap line to write inline
 * - Long-press (~500ms) toggles yellow highlighter (#ffd84a) (Correction 4)
 * - Cross-out: small hand-drawn cross at line end, visible on hover/focus and on touch (Correction 4)
 * - Stored in entries table per day (Correction 1, 6)
 * - Hand-drawn SVG icon (L13)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { z } from 'zod'
import type { WidgetDefinition, WidgetRenderProps } from '../types'
import {
  memorableMomentsEntrySchema,
} from '../entryActions'
import { saveWidgetEntryAndBump, getWidgetEntriesWithCache } from '../entryHelpers'

// ── Zod Config Schema ─────────────────────────────────────────
export const memorableMomentsConfigSchema = z.object({
  title: z.string().default('Memorable Moments'),
})

export type MemorableMomentsConfig = z.infer<typeof memorableMomentsConfigSchema>

interface DayEntryState {
  text: string
  highlighted: boolean
  crossedOut: boolean
}

// ── Hand-Drawn SVG Icon ───────────────────────────────────────
export function MemorableMomentsIcon({
  className = 'w-5 h-5',
}: {
  className?: string
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      {/* Notebook page outline */}
      <path
        d="M 5 3.5 C 10 3.2, 16 3.6, 20 3.5 C 20.2 8, 19.8 15, 20 20.5 C 15 20.3, 9 20.6, 5 20.5 C 4.7 15, 5.2 8, 5 3.5 Z"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Numbered lines 1, 2, 3 */}
      <path
        d="M 7.5 7 L 8.5 7 M 10.5 7 L 17 7"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M 7.5 11.5 L 9 11.5 M 11 11.5 L 17 11.5"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M 7.5 16 L 9 16 M 11 16 L 16.5 16"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* Highlighter wash mark */}
      <path
        d="M 10 11.5 L 15.5 11.5"
        stroke="#ffd84a"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.65"
      />
    </svg>
  )
}

// ── Custom Hook for shared entry management ────────────────────
function useMemorableMomentsEntries(id: string, isArrangeMode?: boolean) {
  const [entriesMap, setEntriesMap] = useState<Record<number, DayEntryState>>({})
  const [saveError, setSaveError] = useState<string | null>(null)
  const longPressTimerRef = useRef<{ [day: number]: NodeJS.Timeout }>({})
  const longPressFiredRef = useRef<{ [day: number]: boolean }>({})

  useEffect(() => {
    let cancelled = false
    async function load() {
      const res = await getWidgetEntriesWithCache(id)
      if (!cancelled && res.success && res.data) {
        const next: Record<number, DayEntryState> = {}
        for (const row of res.data) {
          const parsed = memorableMomentsEntrySchema.safeParse(row.value)
          if (parsed.success) {
            next[row.day] = parsed.data
          }
        }
        setEntriesMap(next)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id])

  const commitDayState = useCallback(
    async (day: number, nextState: DayEntryState) => {
      const prevState = entriesMap[day] || {
        text: '',
        highlighted: false,
        crossedOut: false,
      }

      setEntriesMap((prev) => ({
        ...prev,
        [day]: nextState,
      }))

      const res = await saveWidgetEntryAndBump(id, day, {
        text: nextState.text,
        highlighted: nextState.highlighted,
        crossedOut: nextState.crossedOut,
      })

      if (!res.success) {
        setEntriesMap((prev) => ({
          ...prev,
          [day]: prevState,
        }))
        setSaveError(`Failed to save Day ${day}`)
        setTimeout(() => setSaveError(null), 3500)
      }
    },
    [id, entriesMap],
  )

  const handleTextChange = (day: number, newText: string) => {
    const cur = entriesMap[day] || {
      text: '',
      highlighted: false,
      crossedOut: false,
    }
    setEntriesMap((prev) => ({
      ...prev,
      [day]: { ...cur, text: newText },
    }))
  }

  const handleTextBlur = (day: number) => {
    const cur = entriesMap[day] || {
      text: '',
      highlighted: false,
      crossedOut: false,
    }
    commitDayState(day, cur)
  }

  const toggleCrossOut = (day: number) => {
    const cur = entriesMap[day] || {
      text: '',
      highlighted: false,
      crossedOut: false,
    }
    commitDayState(day, { ...cur, crossedOut: !cur.crossedOut })
  }

  const toggleHighlight = (day: number) => {
    const cur = entriesMap[day] || {
      text: '',
      highlighted: false,
      crossedOut: false,
    }
    commitDayState(day, { ...cur, highlighted: !cur.highlighted })
  }

  const handlePointerDown = (day: number) => {
    if (isArrangeMode) return
    longPressFiredRef.current[day] = false
    longPressTimerRef.current[day] = setTimeout(() => {
      longPressFiredRef.current[day] = true
      toggleHighlight(day)
    }, 500)
  }

  const handlePointerUpOrLeave = (day: number) => {
    if (longPressTimerRef.current[day]) {
      clearTimeout(longPressTimerRef.current[day])
      delete longPressTimerRef.current[day]
    }
  }

  return {
    entriesMap,
    saveError,
    handleTextChange,
    handleTextBlur,
    toggleCrossOut,
    handlePointerDown,
    handlePointerUpOrLeave,
  }
}

// ── Desktop / Main Component ──────────────────────────────────
export function MemorableMomentsDesktop({
  id,
  config,
  isArrangeMode,
}: WidgetRenderProps<MemorableMomentsConfig>) {
  const title = config?.title || 'Memorable Moments'
  const {
    entriesMap,
    saveError,
    handleTextChange,
    handleTextBlur,
    toggleCrossOut,
    handlePointerDown,
    handlePointerUpOrLeave,
  } = useMemorableMomentsEntries(id, isArrangeMode)

  // Render a single day row on 22px rule
  const renderDayRow = (day: number) => {
    const entry = entriesMap[day] || {
      text: '',
      highlighted: false,
      crossedOut: false,
    }

    return (
      <div
        key={day}
        className="group relative flex items-center h-[22px] px-1 border-b border-ink/10 select-none"
        onPointerDown={() => handlePointerDown(day)}
        onPointerUp={() => handlePointerUpOrLeave(day)}
        onPointerLeave={() => handlePointerUpOrLeave(day)}
      >
        {/* Day number (1..31) */}
        <span className="w-5 shrink-0 font-hand text-[11px] text-ink/65 text-right pr-1 select-none pointer-events-none">
          {day}.
        </span>

        {/* Text container with optional highlighter background */}
        <div
          className={`relative flex-1 h-[20px] flex items-center px-1 rounded-xs transition-colors ${
            entry.highlighted ? 'bg-[#ffd84a]/40' : ''
          }`}
        >
          <input
            type="text"
            value={entry.text}
            disabled={isArrangeMode}
            onChange={(e) => handleTextChange(day, e.target.value)}
            onBlur={() => handleTextBlur(day)}
            placeholder="..."
            aria-label={`Memorable moment day ${day}`}
            className={`w-full bg-transparent font-hand text-[12px] text-ink focus:outline-none focus:border-b focus:border-ink/40 transition-opacity ${
              entry.crossedOut ? 'opacity-40 line-through text-ink/50' : ''
            }`}
          />

          {/* Hand-drawn cross-out strike overlay if crossed out */}
          {entry.crossedOut && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none text-redpen/75"
              viewBox="0 0 100 20"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M 2 10 Q 50 8, 98 11"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          )}
        </div>

        {/* Cross-out button at line end: visible on hover/focus and always on touch (Correction 4) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            toggleCrossOut(day)
          }}
          disabled={isArrangeMode}
          title={entry.crossedOut ? 'Restore line' : 'Cross out line'}
          aria-label={`Cross out day ${day}`}
          className={`shrink-0 w-4 h-4 ml-1 flex items-center justify-center transition-opacity cursor-pointer ${
            entry.crossedOut
              ? 'opacity-85 text-redpen'
              : 'opacity-0 group-hover:opacity-75 group-focus-within:opacity-75 md:opacity-0 active:opacity-100 text-ink/45 hover:text-redpen'
          }`}
        >
          <svg
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            className="w-3 h-3"
            aria-hidden="true"
          >
            <path
              d="M 2.5 2.5 L 11.5 11.5 M 11.5 2.5 L 2.5 11.5"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full p-2 flex flex-col justify-between overflow-hidden bg-transparent select-none">
      {/* Title Header (22px) */}
      <div className="h-[22px] flex items-center justify-between border-b border-ink/20 px-1 mb-0.5">
        <h3 className="font-hand text-xs font-bold text-ink tracking-wide">
          {title}
        </h3>
        <span className="font-hand text-[10px] text-ink/50 italic">
          tap to write · hold to highlight
        </span>
      </div>

      {/* Red-Pen Save Error Feedback */}
      {saveError && (
        <div
          className="absolute top-1 right-2 z-40 bg-paper border border-redpen px-2 py-0.5 rounded shadow text-redpen font-hand text-[10px]"
          role="alert"
        >
          {saveError}
        </div>
      )}

      {/* Two columns: days 1 to 16 (left) and 17 to 31 (right) (Correction 4) */}
      <div className="flex-1 grid grid-cols-2 gap-2 overflow-hidden">
        {/* Column 1: Days 1 to 16 */}
        <div className="flex flex-col">
          {Array.from({ length: 16 }, (_, i) => renderDayRow(i + 1))}
        </div>

        {/* Column 2: Days 17 to 31 */}
        <div className="flex flex-col">
          {Array.from({ length: 15 }, (_, i) => renderDayRow(i + 17))}
        </div>
      </div>
    </div>
  )
}

// ── Mobile Render Component (Task 11) ────────────────────────
export function MemorableMomentsMobile({
  id,
  config,
  isArrangeMode,
  year,
  month,
  mobileSubPage = 0,
}: WidgetRenderProps<MemorableMomentsConfig>) {
  const title = config?.title || 'Memorable Moments'
  const {
    entriesMap,
    saveError,
    handleTextChange,
    handleTextBlur,
    toggleCrossOut,
    handlePointerDown,
    handlePointerUpOrLeave,
  } = useMemorableMomentsEntries(id, isArrangeMode)

  const daysInMonth =
    year && month ? new Date(year, month, 0).getDate() : 31

  // Dynamic pagination into 3 sub-pages:
  // SubPage 0: Days 1..10
  // SubPage 1: Days 11..20
  // SubPage 2: Days 21..daysInMonth
  let startDay = 1
  let endDay = 10
  if (mobileSubPage === 1) {
    startDay = 11
    endDay = 20
  } else if (mobileSubPage >= 2) {
    startDay = 21
    endDay = daysInMonth
  }

  const daysCount = Math.max(0, endDay - startDay + 1)
  const daysArray = Array.from({ length: daysCount }, (_, i) => startDay + i)

  return (
    <div className="relative w-full h-full flex flex-col bg-transparent select-none p-1">
      {/* Red-Pen Save Error Feedback */}
      {saveError && (
        <div
          className="absolute top-0 right-1 z-40 bg-paper border border-redpen px-2 py-0.5 rounded shadow text-redpen font-hand text-[10px]"
          role="alert"
        >
          {saveError}
        </div>
      )}

      {/* Header: Title or (cont.) */}
      <div className="shrink-0 mb-1 flex items-baseline justify-between border-b border-ink/20 pb-1">
        {mobileSubPage === 0 ? (
          <h2 className="font-hand text-base font-bold text-ink">{title}</h2>
        ) : (
          <span className="font-hand text-sm text-ink/70 italic">(cont.)</span>
        )}
        <span className="font-hand text-xs text-ink/50">
          Days {startDay}–{endDay}
        </span>
      </div>

      {/* Rows with >= 44px tap targets */}
      <div className="flex-1 flex flex-col divide-y divide-ink/10">
        {daysArray.map((day) => {
          const entry = entriesMap[day] || {
            text: '',
            highlighted: false,
            crossedOut: false,
          }

          return (
            <div
              key={day}
              className="relative flex items-center min-h-[44px] h-[44px] px-0.5 select-none"
              onPointerDown={() => handlePointerDown(day)}
              onPointerUp={() => handlePointerUpOrLeave(day)}
              onPointerLeave={() => handlePointerUpOrLeave(day)}
            >
              {/* Day Number */}
              <span className="w-7 shrink-0 font-hand text-xs text-ink/65 text-right pr-1 select-none pointer-events-none">
                {day}.
              </span>

              {/* Text Input Container with Highlight */}
              <div
                className={`relative flex-1 h-[38px] flex items-center px-1.5 rounded-xs transition-colors ${
                  entry.highlighted ? 'bg-[#ffd84a]/40' : ''
                }`}
              >
                <input
                  type="text"
                  value={entry.text}
                  disabled={isArrangeMode}
                  onChange={(e) => handleTextChange(day, e.target.value)}
                  onBlur={() => handleTextBlur(day)}
                  placeholder="..."
                  aria-label={`Memorable moment day ${day}`}
                  className={`w-full h-full bg-transparent font-hand text-xs text-ink focus:outline-none transition-opacity ${
                    entry.crossedOut ? 'opacity-40 line-through text-ink/50' : ''
                  }`}
                />

                {/* Hand-drawn cross-out strike */}
                {entry.crossedOut && (
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none text-redpen/75"
                    viewBox="0 0 100 20"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M 2 10 Q 50 8, 98 11"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                )}
              </div>

              {/* Cross-out button: >= 44px tap target */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleCrossOut(day)
                }}
                disabled={isArrangeMode}
                title={entry.crossedOut ? 'Restore line' : 'Cross out line'}
                aria-label={`Cross out day ${day}`}
                className={`shrink-0 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer transition-colors ${
                  entry.crossedOut
                    ? 'text-redpen'
                    : 'text-ink/35 hover:text-redpen active:text-redpen'
                }`}
              >
                <svg
                  viewBox="0 0 14 14"
                  fill="none"
                  className="w-3.5 h-3.5 pointer-events-none"
                  aria-hidden="true"
                >
                  <path
                    d="M 2.5 2.5 L 11.5 11.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 11.5 2.5 L 2.5 11.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Widget Definition ─────────────────────────────────────────
export const memorableMomentsWidgetDefinition: WidgetDefinition<
  typeof memorableMomentsConfigSchema
> = {
  id: 'memorable-moments',
  displayName: 'Memorable Moments',
  group: 'Track',
  defaultSize: { w: 22, h: 18 },
  minSize: { w: 14, h: 18 },
  schema: memorableMomentsConfigSchema,
  component: MemorableMomentsDesktop,
  mobileComponent: MemorableMomentsMobile,
  icon: MemorableMomentsIcon,
  getMobilePageCount: () => 3,
}
