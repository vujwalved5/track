'use client'

/**
 * Poll Widget
 * Memorable Moments — Phase 5 / Task 9 Batch B
 *
 * Rules:
 * - Group: 'Ask'
 * - Default size: 10x8 (10 cols × 8 rows on 22px grid = 220px × 176px)
 * - Min size: 8x6
 * - 2 to 5 options set in config
 * - Tap an option to record the answer for the active day
 * - Results shown as hand-drawn SVG tally marks (4 vertical + 1 diagonal per 5)
 * - Totals across the entire month — never bars
 * - Active day: today if current month, else day 1 (DayStepper)
 * - Stored in entries table per day: { selectedOption: string }
 * - Palette L6 only, fonts L5 only, no emoji, hand-drawn SVG icon (L13)
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { z } from 'zod'
import type { WidgetDefinition, WidgetRenderProps } from '../types'
import {
  DayStepper,
  getDefaultActiveDay,
  getDaysInMonth,
} from '../shared/DayStepper'
import { pollEntrySchema } from '../entryActions'
import { saveWidgetEntryAndBump, getWidgetEntriesWithCache } from '../entryHelpers'

// ── Zod Config Schema ─────────────────────────────────────────
export const pollConfigSchema = z.object({
  question: z.string().default('How was today?'),
  options: z
    .array(z.string().min(1))
    .min(2)
    .max(5)
    .default(['Great', 'Good', 'Okay', 'Bad']),
  title: z.string().default('Poll'),
})

export type PollConfig = z.infer<typeof pollConfigSchema>

// ── Hand-Drawn SVG Icon ───────────────────────────────────────
export function PollIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      {/* Ballot box outline */}
      <path
        d="M 4 5 C 9 4.7, 16 5.1, 20 5 L 20 19 C 15 19.2, 9 18.8, 4 19 Z"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Tally marks — group of 4 vertical + diagonal slash */}
      <path
        d="M 7 9 L 7 14"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M 9 9 L 9 14"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M 11 9 L 11 14"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M 13 9 L 13 14"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* Diagonal slash through the four verticals */}
      <path
        d="M 6 14.5 C 9 12, 12 10, 14.5 8.5"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* Two more partial tally marks */}
      <path
        d="M 16 10 L 16 14"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M 18 10 L 18 14"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ── Tally Mark SVG Component ──────────────────────────────────
/**
 * Renders n tally marks using hand-drawn SVG strokes.
 * Groups of 5: four vertical lines then one diagonal slash.
 */
function TallyMarks({ count }: { count: number }) {
  if (count <= 0) return null

  const groups = Math.floor(count / 5)
  const remainder = count % 5

  // Each group of 5 is 22px wide; a single mark is ~4px wide with 2px gap
  const groupWidth = 26 // px per complete group of 5
  const singleWidth = 5 // px per single mark

  const totalWidth = groups * groupWidth + remainder * singleWidth + 4
  const height = 18

  const paths: React.ReactNode[] = []
  let xCursor = 2

  // Full groups of 5
  for (let g = 0; g < groups; g++) {
    const gx = xCursor
    // 4 vertical strokes
    for (let v = 0; v < 4; v++) {
      paths.push(
        <path
          key={`g${g}-v${v}`}
          d={`M ${gx + v * 4} 3 L ${gx + v * 4} 15`}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />,
      )
    }
    // Diagonal slash
    paths.push(
      <path
        key={`g${g}-slash`}
        d={`M ${gx - 1} 14.5 C ${gx + 7} 10, ${gx + 13} 6, ${gx + 17} 2.5`}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />,
    )
    xCursor += groupWidth
  }

  // Remaining single strokes
  for (let r = 0; r < remainder; r++) {
    paths.push(
      <path
        key={`r${r}`}
        d={`M ${xCursor + r * 4} 3 L ${xCursor + r * 4} 15`}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />,
    )
  }

  return (
    <svg
      viewBox={`0 0 ${totalWidth} ${height}`}
      width={totalWidth}
      height={height}
      fill="none"
      aria-hidden="true"
      className="text-ink inline-block"
    >
      {paths}
    </svg>
  )
}

// ── Desktop / Main Component ──────────────────────────────────
export function PollDesktop({
  id,
  config,
  year,
  month,
  isArrangeMode,
}: WidgetRenderProps<PollConfig>) {
  const question = config?.question || 'How was today?'
  const options: string[] =
    Array.isArray(config?.options) && config.options.length >= 2
      ? config.options.slice(0, 5)
      : ['Great', 'Good', 'Okay', 'Bad']
  const title = config?.title || 'Poll'

  const defaultDay = useMemo(() => getDefaultActiveDay(year, month), [year, month])
  const maxDays = useMemo(() => getDaysInMonth(year, month), [year, month])
  const [activeDay, setActiveDay] = useState(defaultDay)

  // Map of day -> selectedOption string
  const [entriesMap, setEntriesMap] = useState<Record<number, string>>({})
  const [saveError, setSaveError] = useState<string | null>(null)

  // Load entries from DB
  useEffect(() => {
    let cancelled = false
    async function load() {
      const res = await getWidgetEntriesWithCache(id)
      if (!cancelled && res.success && res.data) {
        const next: Record<number, string> = {}
        for (const row of res.data) {
          const parsed = pollEntrySchema.safeParse(row.value)
          if (parsed.success) {
            next[row.day] = parsed.data.selectedOption
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

  // Select an option for the active day
  const selectOption = useCallback(
    async (option: string) => {
      if (isArrangeMode) return
      const prevOption = entriesMap[activeDay]

      // Optimistic update
      setEntriesMap((prev) => ({ ...prev, [activeDay]: option }))

      const res = await saveWidgetEntryAndBump(id, activeDay, { selectedOption: option })

      if (!res.success) {
        // Rollback on error
        setEntriesMap((prev) => {
          const next = { ...prev }
          if (prevOption === undefined) {
            delete next[activeDay]
          } else {
            next[activeDay] = prevOption
          }
          return next
        })
        setSaveError('Save failed')
        setTimeout(() => setSaveError(null), 3000)
      }
    },
    [id, activeDay, entriesMap, isArrangeMode],
  )

  // Tally counts per option across all 31 days
  const tallyCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const opt of options) counts[opt] = 0
    for (const sel of Object.values(entriesMap)) {
      if (sel && counts[sel] !== undefined) {
        counts[sel]++
      }
    }
    return counts
  }, [entriesMap, options])

  const activeDaySelection = entriesMap[activeDay]

  return (
    <div className="relative w-full h-full flex flex-col bg-transparent select-none overflow-hidden p-2 gap-1">
      {/* Red-Pen Save Error Feedback */}
      {saveError && (
        <div
          className="absolute top-1 right-2 z-40 bg-paper border border-redpen px-2 py-0.5 rounded shadow text-redpen font-hand text-[10px]"
          role="alert"
        >
          {saveError}
        </div>
      )}

      {/* Header: title + DayStepper */}
      <div className="flex items-center justify-between border-b border-ink/20 pb-1 shrink-0">
        <h3 className="font-hand text-xs font-bold text-ink tracking-wide truncate">
          {title}
        </h3>
        <DayStepper
          day={activeDay}
          maxDays={maxDays}
          onChange={setActiveDay}
          className="scale-90 origin-right"
        />
      </div>

      {/* Question */}
      <p className="font-hand text-[11px] text-ink/80 italic truncate shrink-0 px-0.5">
        {question}
      </p>

      {/* Options: tap to select for active day */}
      <div className="flex flex-col gap-0.5 shrink-0">
        {options.map((opt) => {
          const isSelected = activeDaySelection === opt
          return (
            <button
              key={opt}
              type="button"
              disabled={isArrangeMode}
              onClick={() => selectOption(opt)}
              aria-pressed={isSelected}
              aria-label={`Select ${opt}`}
              className={`w-full text-left px-2 py-0.5 rounded-xs font-hand text-[11px] border transition-all cursor-pointer ${
                isSelected
                  ? 'border-ink bg-ink/8 text-ink font-bold'
                  : 'border-ink/20 text-ink/70 hover:border-ink/50 hover:bg-ink/5'
              } ${isArrangeMode ? 'pointer-events-none opacity-70' : ''}`}
            >
              {/* Hand-drawn radio dot */}
              <span className="inline-flex items-center gap-1.5">
                <svg
                  viewBox="0 0 10 10"
                  width="10"
                  height="10"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden="true"
                  className="shrink-0 text-ink/70"
                >
                  <path
                    d="M 5 1.5 C 7.5 1.5, 8.5 3, 8.5 5 C 8.5 7, 7 8.5, 5 8.5 C 3 8.5, 1.5 7, 1.5 5 C 1.5 3, 2.5 1.5, 5 1.5"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  {isSelected && (
                    <circle cx="5" cy="5" r="2.2" fill="currentColor" className="text-ink" />
                  )}
                </svg>
                {opt}
              </span>
            </button>
          )
        })}
      </div>

      {/* Tally results across month */}
      <div className="flex-1 flex flex-col justify-end gap-0.5 pt-1 border-t border-ink/15 overflow-hidden">
        <span className="font-hand text-[9px] text-ink/70 uppercase tracking-wider">
          Month totals
        </span>
        {options.map((opt) => {
          const count = tallyCounts[opt] ?? 0
          return (
            <div key={opt} className="flex items-center gap-1.5 min-h-[20px]">
              <span className="font-hand text-[10px] text-ink/70 w-[60px] truncate shrink-0">
                {opt}
              </span>
              <div className="flex items-center gap-1 flex-1 overflow-hidden">
                {count > 0 ? (
                  <TallyMarks count={count} />
                ) : (
                  <span className="font-hand text-[10px] text-ink/70 opacity-40 italic">—</span>
                )}
                {count > 0 && (
                  <span className="font-hand text-[9px] text-ink/70 ml-0.5">
                    {count}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Mobile Render Component (Task 11 placeholder) ─────────────
export function PollMobile(props: WidgetRenderProps<PollConfig>) {
  return <PollDesktop {...props} />
}

// ── Widget Definition ─────────────────────────────────────────
export const pollWidgetDefinition: WidgetDefinition<typeof pollConfigSchema> = {
  id: 'poll',
  displayName: 'Poll',
  group: 'Ask',
  defaultSize: { w: 10, h: 8 },
  minSize: { w: 8, h: 6 },
  schema: pollConfigSchema,
  component: PollDesktop,
  mobileComponent: PollMobile,
  icon: PollIcon,
}
