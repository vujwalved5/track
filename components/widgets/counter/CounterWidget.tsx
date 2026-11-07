'use client'

/**
 * Counter Widget
 * Memorable Moments — Phase 5 / Task 9
 *
 * Rules:
 * - Group: 'Track'
 * - Default size: 6x6 (6 cols × 6 rows on 22px grid = 132px × 132px)
 * - Big handwritten number in Kalam font (L5)
 * - Hand-drawn minus and plus buttons
 * - Configurable label and optional target
 * - Optional "per-day" mode: active day controlled via DayStepper (Correction 2)
 * - Non-per-day mode stores total in entries at day = 1 (Correction 3)
 * - Stored in entries table per day (Correction 1, 6)
 * - Hand-drawn SVG icon (L13)
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { z } from 'zod'
import type { WidgetDefinition, WidgetRenderProps } from '../types'
import {
  DayStepper,
  getDefaultActiveDay,
  getDaysInMonth,
} from '../shared/DayStepper'
import {
  getWidgetEntries,
  counterEntrySchema,
} from '../entryActions'
import { saveWidgetEntryAndBump } from '../entryHelpers'

// ── Zod Config Schema ─────────────────────────────────────────
export const counterConfigSchema = z.object({
  label: z.string().default('Counter'),
  target: z.number().int().positive().optional(),
  perDay: z.boolean().default(false),
})

export type CounterConfig = z.infer<typeof counterConfigSchema>

// ── Hand-Drawn SVG Icon ───────────────────────────────────────
export function CounterIcon({
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
      {/* Tally counter / dial frame */}
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="2"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* Display box */}
      <path
        d="M 6.5 8.5 L 17.5 8.5 L 17.5 15.5 L 6.5 15.5 Z"
        strokeWidth="1.3"
      />
      {/* Hand-drawn number 7 */}
      <path
        d="M 10 10.5 L 14 10.5 L 11.5 14"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Plus button at top right */}
      <circle cx="18" cy="4" r="2.5" fill="#f4eddc" strokeWidth="1.2" />
      <path d="M 18 2.5 L 18 5.5 M 16.5 4 L 19.5 4" strokeWidth="1.2" />
    </svg>
  )
}

// ── Desktop / Main Component ──────────────────────────────────
export function CounterDesktop({
  id,
  config,
  year,
  month,
  isArrangeMode,
}: WidgetRenderProps<CounterConfig>) {
  const label = config?.label || 'Counter'
  const target = config?.target
  const perDay = !!config?.perDay

  // Active day for per-day mode (Correction 2: today or day 1)
  const defaultDay = useMemo(() => getDefaultActiveDay(year, month), [year, month])
  const maxDays = useMemo(() => getDaysInMonth(year, month), [year, month])
  const [activeDay, setActiveDay] = useState(defaultDay)

  // Map of day -> count
  const [countsMap, setCountsMap] = useState<Record<number, number>>({})
  const [saveError, setSaveError] = useState<string | null>(null)

  // Load entries from DB
  useEffect(() => {
    let cancelled = false
    async function load() {
      const res = await getWidgetEntries(id)
      if (!cancelled && res.success && res.data) {
        const next: Record<number, number> = {}
        for (const row of res.data) {
          const parsed = counterEntrySchema.safeParse(row.value)
          if (parsed.success) {
            next[row.day] = parsed.data.count
          }
        }
        setCountsMap(next)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id])

  // Current day key: in non-perDay mode, strictly store at day = 1 (Correction 3)
  const currentDayKey = perDay ? activeDay : 1
  const currentCount = countsMap[currentDayKey] ?? 0

  // Adjust count by delta (+1 or -1)
  const adjustCount = useCallback(
    async (delta: number) => {
      if (isArrangeMode) return
      const prevCount = countsMap[currentDayKey] ?? 0
      const nextCount = Math.max(0, prevCount + delta)
      if (nextCount === prevCount) return

      // Optimistic update
      setCountsMap((prev) => ({
        ...prev,
        [currentDayKey]: nextCount,
      }))

      const res = await saveWidgetEntryAndBump(id, currentDayKey, {
        count: nextCount,
      })

      if (!res.success) {
        // Rollback on error & display red-pen message (Correction 6)
        setCountsMap((prev) => ({
          ...prev,
          [currentDayKey]: prevCount,
        }))
        setSaveError('Save failed')
        setTimeout(() => setSaveError(null), 3000)
      }
    },
    [id, currentDayKey, countsMap, isArrangeMode],
  )

  const isTargetReached = target !== undefined && currentCount >= target

  return (
    <div className="relative w-full h-full p-2 flex flex-col justify-between items-center bg-transparent select-none overflow-hidden">
      {/* Red-Pen Save Error Feedback */}
      {saveError && (
        <div
          className="absolute top-1 z-40 bg-paper border border-redpen px-1.5 py-0.5 rounded shadow text-redpen font-hand text-[9px]"
          role="alert"
        >
          {saveError}
        </div>
      )}

      {/* Top Header: Label + Optional Target */}
      <div className="w-full flex items-center justify-between text-center border-b border-ink/15 pb-0.5 px-0.5">
        <span
          className="font-hand text-[11px] font-bold text-ink truncate max-w-[85px]"
          title={label}
        >
          {label}
        </span>
        {target !== undefined && (
          <span
            className={`font-hand text-[10px] ${
              isTargetReached ? 'text-redpen font-bold' : 'text-ink/60'
            }`}
          >
            /{target}
          </span>
        )}
      </div>

      {/* Center: Minus Button | Big Kalam Number | Plus Button */}
      <div className="flex-1 flex items-center justify-center gap-2 my-0.5">
        {/* Hand-Drawn Minus Button */}
        <button
          type="button"
          disabled={isArrangeMode || currentCount <= 0}
          onClick={() => adjustCount(-1)}
          aria-label="Decrease count"
          className={`w-7 h-7 rounded-full border border-ink/40 flex items-center justify-center transition-all ${
            currentCount > 0 && !isArrangeMode
              ? 'hover:border-ink hover:bg-ink/5 active:scale-95 text-ink cursor-pointer'
              : 'opacity-30 text-ink/30 cursor-not-allowed'
          }`}
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            className="w-3.5 h-3.5"
            aria-hidden="true"
          >
            <path
              d="M 3.5 8 C 6 7.8, 10 8.2, 12.5 8"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Big Handwritten Number */}
        <div className="min-w-[40px] text-center font-hand text-3xl font-bold text-ink tracking-tight select-none">
          {currentCount}
        </div>

        {/* Hand-Drawn Plus Button */}
        <button
          type="button"
          disabled={isArrangeMode}
          onClick={() => adjustCount(1)}
          aria-label="Increase count"
          className={`w-7 h-7 rounded-full border border-ink/40 flex items-center justify-center transition-all ${
            !isArrangeMode
              ? 'hover:border-ink hover:bg-ink/5 active:scale-95 text-ink cursor-pointer'
              : 'opacity-40 text-ink/40 cursor-not-allowed'
          }`}
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            className="w-3.5 h-3.5"
            aria-hidden="true"
          >
            <path
              d="M 3.5 8 C 6 7.8, 10 8.2, 12.5 8"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M 8 3.5 C 7.8 6, 8.2 10, 8 12.5"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Bottom Area: DayStepper if perDay mode, or target status */}
      <div className="w-full flex justify-center pt-0.5 border-t border-ink/10">
        {perDay ? (
          <DayStepper
            day={activeDay}
            maxDays={maxDays}
            onChange={(newDay) => setActiveDay(newDay)}
            className="scale-90"
          />
        ) : (
          <span className="font-hand text-[9px] text-ink/40 tracking-wider uppercase">
            {target !== undefined && isTargetReached ? (
              <span className="text-redpen font-bold">Goal Met!</span>
            ) : (
              'Total'
            )}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Mobile Render Component (Task 11 placeholder per Correction 7) ────
export function CounterMobile(props: WidgetRenderProps<CounterConfig>) {
  return <CounterDesktop {...props} />
}

// ── Widget Definition ─────────────────────────────────────────
export const counterWidgetDefinition: WidgetDefinition<
  typeof counterConfigSchema
> = {
  id: 'counter',
  displayName: 'Counter',
  group: 'Track',
  defaultSize: { w: 6, h: 6 },
  minSize: { w: 5, h: 5 },
  schema: counterConfigSchema,
  component: CounterDesktop,
  mobileComponent: CounterMobile,
  icon: CounterIcon,
}
