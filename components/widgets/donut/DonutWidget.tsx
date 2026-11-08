'use client'

/**
 * Donut Widget
 * Memorable Moments — Phase 5 / Task 10 Batch B
 *
 * Rules:
 * - Group: 'Charts' (Correction 1)
 * - Default size: 10x10 (10 cols × 10 rows on 22px grid = 220px × 220px)
 * - Min size: 8x8
 * - Source: poll or habit-tracker (Correction 2)
 * - Share of habits completed for month or share between poll options
 * - Custom SVG, hand-drawn look with deterministic jitter (L4, Correction 8)
 * - Live updates when source entries change via entriesVersion store (Correction 3)
 * - Palette L6 only, fonts L5 only, no emoji, hand-drawn SVG icon (L13)
 */

import React, { useState, useEffect, useMemo } from 'react'
import { z } from 'zod'
import type { WidgetDefinition, WidgetRenderProps } from '../types'
import { pollEntrySchema, habitTrackerEntrySchema } from '../entryActions'
import { getWidgetEntriesWithCache } from '../entryHelpers'
import { useEntriesVersionStore } from '@/store/entriesVersion'
import { seedFromString, jitter } from '../charts/chartUtils'
import type { HabitConfig } from '@/types/db'

// ── Zod Config Schema ─────────────────────────────────────────
export const donutConfigSchema = z.object({
  title: z.string().default('Donut'),
  sourceWidgetId: z
    .string()
    .default('')
    .describe('poll, habit-tracker'),
})

export type DonutConfig = z.infer<typeof donutConfigSchema>

// ── Hand-Drawn SVG Icon ───────────────────────────────────────
export function DonutIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4.5" strokeWidth="1.4" />
      {/* Slices */}
      <path d="M 12 3 L 12 7.5" strokeWidth="1.3" />
      <path d="M 19.8 16.5 L 15.9 14.3" strokeWidth="1.3" />
      <path d="M 4.2 16.5 L 8.1 14.3" strokeWidth="1.3" />
    </svg>
  )
}

// Palette colors for slices (L6 strictly)
const SLICE_COLORS = [
  '#702028', // oxblood
  '#b9895a', // kraft
  '#d8b45a', // gold
  '#1c2433', // ink
  '#b3261e', // redpen
]

interface SliceData {
  label: string
  count: number
  color: string
}

// ── Desktop / Main Component ──────────────────────────────────
export function DonutDesktop({
  id,
  config,
  setupConfig,
  w,
  h,
}: WidgetRenderProps<DonutConfig>) {
  const title = config?.title || 'Donut'
  const sourceWidgetId = config?.sourceWidgetId || ''

  const version = useEntriesVersionStore((s) => s.version)
  const [entries, setEntries] = useState<Array<{ day: number; value: unknown }>>([])
  const [loading, setLoading] = useState(false)

  const seed = useMemo(() => seedFromString(id || 'donut'), [id])

  // Habits from setup config (for naming habit slices)
  const habits: HabitConfig[] = useMemo(() => {
    if (!setupConfig || !Array.isArray(setupConfig.habits)) return []
    return setupConfig.habits as HabitConfig[]
  }, [setupConfig])

  // Fetch source data
  useEffect(() => {
    let cancelled = false
    async function fetchSource() {
      if (!sourceWidgetId) {
        setEntries([])
        return
      }
      setLoading(true)
      const res = await getWidgetEntriesWithCache(sourceWidgetId)
      if (!cancelled) {
        setEntries(res.success && res.data ? res.data : [])
        setLoading(false)
      }
    }
    fetchSource()
    return () => {
      cancelled = true
    }
  }, [sourceWidgetId, version])

  // Parse slices from entries
  const slices: SliceData[] = useMemo(() => {
    if (entries.length === 0) return []

    // 1. Try Poll entries shape: { selectedOption: string }
    const pollCounts: Record<string, number> = {}
    let isPoll = false
    for (const e of entries) {
      const parsed = pollEntrySchema.safeParse(e.value)
      if (parsed.success && parsed.data.selectedOption) {
        isPoll = true
        pollCounts[parsed.data.selectedOption] =
          (pollCounts[parsed.data.selectedOption] || 0) + 1
      }
    }

    if (isPoll && Object.keys(pollCounts).length > 0) {
      return Object.entries(pollCounts).map(([label, count], i) => ({
        label,
        count,
        color: SLICE_COLORS[i % SLICE_COLORS.length],
      }))
    }

    // 2. Try Habit Tracker entries shape: { marks: Record<string, boolean> }
    const habitCounts: Record<string, number> = {}
    let isHabit = false
    for (const e of entries) {
      const parsed = habitTrackerEntrySchema.safeParse(e.value)
      if (parsed.success && parsed.data.marks) {
        isHabit = true
        for (const [habitPos, marked] of Object.entries(parsed.data.marks)) {
          if (marked) {
            habitCounts[habitPos] = (habitCounts[habitPos] || 0) + 1
          }
        }
      }
    }

    if (isHabit) {
      return Object.entries(habitCounts).map(([posStr, count], i) => {
        const idx = parseInt(posStr, 10)
        const name = habits[idx]?.name || `Habit ${idx + 1}`
        return {
          label: name,
          count,
          color: SLICE_COLORS[i % SLICE_COLORS.length],
        }
      })
    }

    return []
  }, [entries, habits])

  const totalCount = useMemo(() => {
    return slices.reduce((acc, s) => acc + s.count, 0)
  }, [slices])

  // Dimensions
  const widthPx = Math.max(120, w * 22)
  const heightPx = Math.max(120, h * 22)

  const cx = widthPx / 2
  const cy = (heightPx - 30) / 2 + 16
  const outerR = Math.min(cx - 16, cy - 24, 75)
  const innerR = outerR * 0.52

  // Generate SVG arc paths for slices
  const arcSegments = useMemo(() => {
    if (totalCount === 0) return []

    let currentAngle = -Math.PI / 2
    return slices.map((slice, i) => {
      const fraction = slice.count / totalCount
      const sliceAngle = fraction * 2 * Math.PI
      const endAngle = currentAngle + sliceAngle

      const s = seed + i * 11
      const jOuterR = outerR + jitter(s, 1.2)
      const jInnerR = innerR + jitter(s + 3, 1.0)

      // Points on outer circle
      const x1 = cx + jOuterR * Math.cos(currentAngle)
      const y1 = cy + jOuterR * Math.sin(currentAngle)
      const x2 = cx + jOuterR * Math.cos(endAngle)
      const y2 = cy + jOuterR * Math.sin(endAngle)

      // Points on inner circle
      const x3 = cx + jInnerR * Math.cos(endAngle)
      const y3 = cy + jInnerR * Math.sin(endAngle)
      const x4 = cx + jInnerR * Math.cos(currentAngle)
      const y4 = cy + jInnerR * Math.sin(currentAngle)

      const largeArc = sliceAngle > Math.PI ? 1 : 0

      // SVG path definition
      const d = [
        `M ${x1.toFixed(1)} ${y1.toFixed(1)}`,
        `A ${jOuterR.toFixed(1)} ${jOuterR.toFixed(1)} 0 ${largeArc} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`,
        `L ${x3.toFixed(1)} ${y3.toFixed(1)}`,
        `A ${jInnerR.toFixed(1)} ${jInnerR.toFixed(1)} 0 ${largeArc} 0 ${x4.toFixed(1)} ${y4.toFixed(1)}`,
        'Z',
      ].join(' ')

      currentAngle = endAngle
      return {
        ...slice,
        d,
        percentage: Math.round(fraction * 100),
      }
    })
  }, [slices, totalCount, cx, cy, outerR, innerR, seed])

  return (
    <div className="relative w-full h-full flex flex-col bg-transparent select-none overflow-hidden p-2">
      {/* Header */}
      <div className="h-[20px] flex items-center justify-between border-b border-ink/15 px-1 shrink-0">
        <span className="font-hand text-xs font-bold text-ink truncate">
          {title}
        </span>
        {totalCount > 0 && (
          <span className="font-hand text-[9px] text-ink/70">
            {totalCount} total
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 w-full relative">
        {!sourceWidgetId ? (
          <div className="w-full h-full flex items-center justify-center text-center p-3">
            <p className="font-hand text-xs text-ink/70 italic leading-snug">
              Pick a source in settings
            </p>
          </div>
        ) : slices.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-center p-3">
            <p className="font-hand text-xs text-ink/70 italic">
              {loading ? 'turning the page...' : 'No entries yet'}
            </p>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-between">
            <svg
              viewBox={`0 0 ${widthPx} ${heightPx - 50}`}
              className="flex-1 w-full overflow-visible"
              role="img"
              aria-label={`Donut chart of ${title}, ${slices.length} categories, ${totalCount} total entries`}
            >
              {arcSegments.map((seg, i) => (
                <path
                  key={i}
                  d={seg.d}
                  fill={seg.color}
                  fillOpacity="0.8"
                  stroke="#1c2433"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              ))}

              {/* Center count */}
              <text
                x={cx}
                y={cy + 4}
                textAnchor="middle"
                className="font-hand text-base font-bold fill-ink"
              >
                {totalCount}
              </text>
            </svg>

            {/* Handwritten Mini Legend */}
            <div className="w-full flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 pt-1 border-t border-ink/10 shrink-0">
              {arcSegments.map((seg, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full border border-ink/40 shrink-0"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="font-hand text-[9px] text-ink/75 truncate max-w-[80px]">
                    {seg.label}
                  </span>
                  <span className="font-hand text-[9px] text-ink/70">
                    {seg.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Mobile Render Component (Task 11 placeholder) ─────────────
export function DonutMobile(props: WidgetRenderProps<DonutConfig>) {
  return <DonutDesktop {...props} />
}

// ── Widget Definition ─────────────────────────────────────────
export const donutWidgetDefinition: WidgetDefinition<typeof donutConfigSchema> = {
  id: 'donut',
  displayName: 'Donut',
  group: 'Charts',
  defaultSize: { w: 10, h: 10 },
  minSize: { w: 8, h: 8 },
  schema: donutConfigSchema,
  component: DonutDesktop,
  mobileComponent: DonutMobile,
  icon: DonutIcon,
}
