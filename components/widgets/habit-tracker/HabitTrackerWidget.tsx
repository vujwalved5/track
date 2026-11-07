'use client'

/**
 * Habit Tracker Widget
 * Memorable Moments — Phase 5 / Task 9
 *
 * Rules:
 * - Group: 'Track'
 * - Default size: 14x24 (14 cols × 24 rows on 22px grid = 308px × 528px)
 * - Rows: 1 header row + 31 daily rows (1..31)
 * - Columns: Day column + 1 column per habit from setup_config (Correction 1)
 * - Header names rotated vertically
 * - Habits marked isRed have red headers (text-redpen)
 * - If no habits in setup_config, render table with no habit columns (Correction 1)
 * - Tap a cell to draw a hand-drawn SVG X (L13, no emoji)
 * - Key stored marks by stable habit position string (e.g. "0", "1") (Correction 1)
 * - Stored in entries table per day (Correction 1, 6)
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { z } from 'zod'
import type { WidgetDefinition, WidgetRenderProps } from '../types'
import type { HabitConfig } from '@/types/db'
import {
  getWidgetEntries,
  habitTrackerEntrySchema,
} from '../entryActions'
import { saveWidgetEntryAndBump } from '../entryHelpers'

// ── Zod Config Schema ─────────────────────────────────────────
export const habitTrackerConfigSchema = z.object({
  title: z.string().default('Habits'),
})

export type HabitTrackerConfig = z.infer<typeof habitTrackerConfigSchema>

// ── Hand-Drawn SVG Icon ───────────────────────────────────────
export function HabitTrackerIcon({
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
      {/* Table grid outline */}
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="1"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Horizontal divider for header */}
      <path d="M 3.5 8.5 L 20.5 8.5" strokeWidth="1.3" />
      {/* Vertical columns */}
      <path d="M 8.5 3.5 L 8.5 20.5" strokeWidth="1.3" />
      <path d="M 14.5 3.5 L 14.5 20.5" strokeWidth="1.3" />
      {/* Hand-drawn X mark in cell */}
      <path
        d="M 10 11.5 L 13 14.5 M 13 11.5 L 10 14.5"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M 16 16.5 L 19 19.5 M 19 16.5 L 16 19.5"
        stroke="#b3261e"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ── Hand-Drawn SVG X Component ────────────────────────────────
function HandDrawnX({ isRed = false }: { isRed?: boolean }) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      className={`w-3 h-3 ${isRed ? 'text-redpen' : 'text-ink'}`}
      aria-hidden="true"
    >
      <path
        d="M 2.5 3 C 4.5 5, 8.5 9, 11.5 11"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M 11.5 3 C 9.5 5.5, 5.5 9, 2.5 11"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ── Desktop / Main Component ──────────────────────────────────
export function HabitTrackerDesktop({
  id,
  setupConfig,
  isArrangeMode,
}: WidgetRenderProps<HabitTrackerConfig>) {
  // Read habits strictly from setupConfig (Correction 1: no invented habits)
  const habits: HabitConfig[] = useMemo(() => {
    if (!setupConfig || !Array.isArray(setupConfig.habits)) {
      return []
    }
    return setupConfig.habits as HabitConfig[]
  }, [setupConfig])

  // Map of day (1..31) -> marks { [habitPosition]: boolean }
  const [entriesMap, setEntriesMap] = useState<
    Record<number, Record<string, boolean>>
  >({})
  const [saveError, setSaveError] = useState<string | null>(null)

  // Load entries from DB
  useEffect(() => {
    let cancelled = false
    async function load() {
      const res = await getWidgetEntries(id)
      if (!cancelled && res.success && res.data) {
        const next: Record<number, Record<string, boolean>> = {}
        for (const row of res.data) {
          const parsed = habitTrackerEntrySchema.safeParse(row.value)
          if (parsed.success) {
            next[row.day] = parsed.data.marks
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

  // Toggle cell mark and save
  const toggleCell = useCallback(
    async (day: number, habitIdx: number) => {
      if (isArrangeMode) return
      const posKey = String(habitIdx)
      const currentDayMarks = entriesMap[day] || {}
      const prevVal = !!currentDayMarks[posKey]
      const nextDayMarks = {
        ...currentDayMarks,
        [posKey]: !prevVal,
      }

      // Optimistic update
      setEntriesMap((prev) => ({
        ...prev,
        [day]: nextDayMarks,
      }))

      const res = await saveWidgetEntryAndBump(id, day, {
        marks: nextDayMarks,
      })

      if (!res.success) {
        // Rollback on error & display red-pen message (Correction 6)
        setEntriesMap((prev) => ({
          ...prev,
          [day]: currentDayMarks,
        }))
        setSaveError(`Failed to save Habit ${day}`)
        setTimeout(() => setSaveError(null), 3500)
      }
    },
    [id, entriesMap, isArrangeMode],
  )

  return (
    <div className="relative w-full h-full flex flex-col bg-transparent select-none overflow-hidden p-1.5">
      {/* Red-Pen Save Error Feedback */}
      {saveError && (
        <div
          className="absolute top-1 right-2 z-40 bg-paper border border-redpen px-2 py-0.5 rounded shadow text-redpen font-hand text-[10px]"
          role="alert"
        >
          {saveError}
        </div>
      )}

      {/* Habit Table: Header height = 64px; 31 rows = 450px (~14.5px/row >= 14px, Correction 5) */}
      <div className="flex-1 flex flex-col border border-ink/25 rounded-xs overflow-hidden">
        {/* Table Header Row (64px) with Rotated Names */}
        <div className="h-[64px] flex border-b border-ink/30 bg-paper/30 shrink-0">
          {/* Top-left corner: Day header */}
          <div className="w-6 shrink-0 flex items-end justify-center pb-1 border-r border-ink/20 font-hand text-[10px] text-ink/60">
            d.
          </div>

          {/* Habit columns headers (or empty if no habits in setup_config) */}
          {habits.map((habit, idx) => (
            <div
              key={idx}
              className="flex-1 flex items-end justify-center pb-1 border-r border-ink/15 last:border-r-0 overflow-hidden"
              title={habit.name}
            >
              <span
                className={`font-hand text-[10px] tracking-tight whitespace-nowrap [writing-mode:vertical-rl] rotate-180 select-none ${
                  habit.isRed ? 'text-redpen font-bold' : 'text-ink font-medium'
                }`}
              >
                {habit.name}
              </span>
            </div>
          ))}

          {/* If no habits configured, show an empty space (Correction 1) */}
          {habits.length === 0 && (
            <div className="flex-1 flex items-center justify-center p-1 text-center font-hand text-[10px] text-ink/40 italic">
              No habits set
            </div>
          )}
        </div>

        {/* 31 Daily Rows (height distributed across remaining container space, ~14.9px/row) */}
        <div className="flex-1 flex flex-col divide-y divide-ink/10">
          {Array.from({ length: 31 }, (_, i) => {
            const day = i + 1
            const dayMarks = entriesMap[day] || {}

            return (
              <div
                key={day}
                className="flex-1 min-h-[14px] flex items-center hover:bg-ink/[0.02] transition-colors"
              >
                {/* Day label */}
                <div className="w-6 shrink-0 h-full flex items-center justify-center border-r border-ink/20 font-hand text-[10px] text-ink/65 select-none pointer-events-none">
                  {day}
                </div>

                {/* Habit cells */}
                {habits.map((habit, habitIdx) => {
                  const isChecked = !!dayMarks[String(habitIdx)]
                  return (
                    <button
                      key={habitIdx}
                      type="button"
                      disabled={isArrangeMode}
                      onClick={() => toggleCell(day, habitIdx)}
                      aria-label={`Day ${day} ${habit.name} ${isChecked ? 'completed' : 'not completed'}`}
                      className="flex-1 h-full flex items-center justify-center border-r border-ink/10 last:border-r-0 cursor-pointer active:bg-ink/5 focus:outline-none"
                    >
                      {isChecked && <HandDrawnX isRed={habit.isRed} />}
                    </button>
                  )
                })}

                {/* If no habits configured */}
                {habits.length === 0 && (
                  <div className="flex-1 h-full border-r border-ink/10 last:border-r-0 pointer-events-none" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Mobile Render Component (Task 11 placeholder per Correction 7) ────
export function HabitTrackerMobile(
  props: WidgetRenderProps<HabitTrackerConfig>,
) {
  return <HabitTrackerDesktop {...props} />
}

// ── Widget Definition ─────────────────────────────────────────
export const habitTrackerWidgetDefinition: WidgetDefinition<
  typeof habitTrackerConfigSchema
> = {
  id: 'habit-tracker',
  displayName: 'Habit Tracker',
  group: 'Track',
  defaultSize: { w: 14, h: 24 },
  minSize: { w: 8, h: 18 },
  schema: habitTrackerConfigSchema,
  component: HabitTrackerDesktop,
  mobileComponent: HabitTrackerMobile,
  icon: HabitTrackerIcon,
}
