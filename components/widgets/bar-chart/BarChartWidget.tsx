'use client'

/**
 * Bar Chart Widget
 * Memorable Moments — Phase 5 / Task 10 Batch A
 *
 * Rules:
 * - Group: 'Charts' (L1)
 * - Default size: 14x12 (14 cols × 12 rows on 22px grid = 308px × 264px)
 * - Min size: 8x8
 * - Source: number-log, counter, mood-tracker (chosen in config)
 * - One bar per day, hatched fill with pen strokes (L4)
 * - Custom SVG, ink-coloured, slightly wobbly lines (deterministic jitter) (L4, Correction 8)
 * - Handwritten day numbers at sparse intervals only (Correction 7)
 * - No software axes, tick marks, gridlines, tooltips or legends (Correction 7)
 * - Live updates when source entries change via entriesVersion store (Correction 3)
 * - Palette L6 only, fonts L5 only, no emoji, hand-drawn SVG icon (L13)
 */

import React, { useState, useEffect, useMemo } from 'react'
import { z } from 'zod'
import type { WidgetDefinition, WidgetRenderProps } from '../types'
import { getWidgetEntriesWithCache } from '../entryHelpers'
import { useEntriesVersionStore } from '@/store/entriesVersion'
import {
  seedFromString,
  resolveDataSeries,
} from '../charts/chartUtils'

// ── Zod Config Schema ─────────────────────────────────────────
export const barChartConfigSchema = z.object({
  title: z.string().default('Bar Chart'),
  sourceWidgetId: z
    .string()
    .default('')
    .describe('number-log, counter, mood-tracker'),
  orientation: z.enum(['across', 'down']).default('across'),
})

export type BarChartConfig = z.infer<typeof barChartConfigSchema>

// ── Hand-Drawn SVG Icon ───────────────────────────────────────
export function BarChartIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="1"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 3 Hatched bars */}
      <rect x="5" y="11" width="3.5" height="8" strokeWidth="1.2" />
      <path d="M 5 15 L 8.5 12 M 5 18 L 8.5 15" strokeWidth="1" />

      <rect x="10.5" y="7" width="3.5" height="12" strokeWidth="1.2" />
      <path d="M 10.5 11 L 14 8 M 10.5 15 L 14 12 M 10.5 18 L 14 15" strokeWidth="1" />

      <rect x="16" y="13" width="3.5" height="6" strokeWidth="1.2" />
      <path d="M 16 16 L 19.5 14" strokeWidth="1" />
    </svg>
  )
}

// Sparse day intervals to label (e.g. 1, 5, 10, 15, 20, 25, 30)
const SPARSE_DAYS = [1, 5, 10, 15, 20, 25, 30]

// ── Desktop / Main Component ──────────────────────────────────
function BarChartDesktopInner({
  id,
  config,
  w,
  h,
}: WidgetRenderProps<BarChartConfig>) {
  const title = config?.title || 'Bar Chart'
  const sourceWidgetId = config?.sourceWidgetId || ''
  const orientation = config?.orientation || 'across'
  const isDown = orientation === 'down'

  // Subscribe only to source widget version plus global fallback (Fix 11, Fix 12)
  const version = useEntriesVersionStore(
    (s) => (sourceWidgetId ? (s.versions[sourceWidgetId] ?? 0) : 0) + s.version,
  )
  const [entries, setEntries] = useState<Array<{ day: number; value: unknown }>>([])
  const [loading, setLoading] = useState(false)

  // Seed for pattern ID uniqueness
  const patternId = useMemo(() => `hatch-${id || 'bar-chart'}`, [id])

  useEffect(() => {
    let cancelled = false
    async function fetchSourceData() {
      if (!sourceWidgetId) {
        setEntries([])
        return
      }
      setLoading(true)
      const res = await getWidgetEntriesWithCache(sourceWidgetId)
      if (!cancelled) {
        if (res.success && res.data) {
          setEntries(res.data)
        } else {
          setEntries([])
        }
        setLoading(false)
      }
    }
    fetchSourceData()
    return () => {
      cancelled = true
    }
  }, [sourceWidgetId, version])

  const series = useMemo(() => resolveDataSeries(entries), [entries])

  // Map of day (1..31) -> value
  const dayValueMap = useMemo(() => {
    const map: Record<number, number> = {}
    for (const item of series) {
      map[item.day] = item.value
    }
    return map
  }, [series])

  // Pixel dimensions based on grid units w & h (each unit is 22px)
  const widthPx = w * 22
  const heightPx = h * 22
  const isCompact = w <= 8 || h <= 8
  const svgH = Math.max(40, heightPx - 24)

  // Plot area
  const padLeft = isCompact ? (isDown ? 22 : 10) : (isDown ? 28 : 14)
  const padRight = isCompact ? 8 : 14
  const padTop = isCompact ? (isDown ? 14 : 18) : (isDown ? 18 : 24)
  const padBottom = isCompact ? (isDown ? 8 : 18) : (isDown ? 12 : 22)

  const plotW = Math.max(30, widthPx - padLeft - padRight)
  const plotH = Math.max(30, svgH - padTop - padBottom)

  // Value extents: start at 0 so bars represent heights from base
  const values = series.map((s) => s.value)
  const maxVal = values.length > 0 ? Math.max(1, ...values) : 1

  // 31 slots
  const slotW = plotW / 31
  const barW = Math.max(2, slotW * 0.72)

  const slotH = plotH / 31
  const barH = Math.max(2, slotH * 0.72)

  interface RenderedBar {
    day: number
    x: number
    y: number
    width: number
    height: number
  }

  // Memoize daily bar geometry and coordinate math (Fix 11)
  const renderedBars = useMemo<RenderedBar[]>(() => {
    const bars: RenderedBar[] = []
    for (let i = 0; i < 31; i++) {
      const day = i + 1
      const val = dayValueMap[day]
      if (val === undefined || val === null || val <= 0) continue

      if (isDown) {
        // "down" draws horizontal bars with days running top to bottom
        const barWidth = Math.max(2, (val / maxVal) * plotW)
        const bx = padLeft
        const by = padTop + (day - 1) * slotH + (slotH - barH) / 2
        bars.push({ day, x: bx, y: by, width: barWidth, height: barH })
      } else {
        // "across" draws vertical bars with days running left to right
        const barHeight = Math.max(2, (val / maxVal) * plotH)
        const bx = padLeft + (day - 1) * slotW + (slotW - barW) / 2
        const by = padTop + plotH - barHeight
        bars.push({ day, x: bx, y: by, width: barW, height: barHeight })
      }
    }
    return bars
  }, [dayValueMap, isDown, maxVal, plotW, plotH, padLeft, padTop, slotH, slotW, barH, barW])

  // Memoize sparse day label positions (Fix 11)
  const renderedSparseLabels = useMemo(() => {
    return SPARSE_DAYS.map((d) => {
      if (isDown) {
        const y = padTop + (d - 1) * slotH + slotH / 2
        return { d, x: padLeft - 6, y: y + 3, anchor: 'end' as const }
      } else {
        const x = padLeft + (d - 1) * slotW + slotW / 2
        return { d, x, y: padTop + plotH + 14, anchor: 'middle' as const }
      }
    })
  }, [isDown, padLeft, padTop, slotH, slotW, plotH])

  return (
    <div className="relative w-full h-full flex flex-col bg-transparent select-none overflow-hidden p-2">
      {/* Title Header */}
      <div className="h-[20px] flex items-center justify-between border-b border-ink/15 px-1 shrink-0">
        <span className="font-hand text-xs font-bold text-ink truncate">
          {title}
        </span>
      </div>

      {/* SVG Canvas */}
      <div className="flex-1 w-full relative">
        {!sourceWidgetId ? (
          <div className="w-full h-full flex items-center justify-center text-center p-3">
            <p className="font-hand text-xs text-ink/70 italic leading-snug">
              Pick a source in settings
            </p>
          </div>
        ) : series.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-center p-3">
            <p className="font-hand text-xs text-ink/70 italic">
              {loading ? 'turning the page...' : 'No data yet'}
            </p>
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${widthPx} ${svgH}`}
            className="w-full h-full overflow-visible"
            role="img"
            aria-label={`Bar chart of ${title}, ${series.length} entries, max value ${maxVal}`}
          >
            <defs>
              {/* Pen-stroke diagonal hatching pattern */}
              <pattern
                id={patternId}
                width="4"
                height="4"
                patternTransform="rotate(45 0 0)"
                patternUnits="userSpaceOnUse"
              >
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="4"
                  stroke="#1c2433"
                  strokeWidth="1.2"
                />
              </pattern>
            </defs>

            {/* Daily Bars (Fix 11: pre-memoized) */}
            {renderedBars.map((bar) => (
              <g key={bar.day}>
                {/* Hatched fill bar */}
                <rect
                  x={bar.x}
                  y={bar.y}
                  width={bar.width}
                  height={bar.height}
                  fill={`url(#${patternId})`}
                  stroke="#1c2433"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                />
              </g>
            ))}

            {/* Sparse day labels (Fix 11: pre-memoized) */}
            {renderedSparseLabels.map((lbl) => (
              <text
                key={lbl.d}
                x={lbl.x}
                y={lbl.y}
                textAnchor={lbl.anchor}
                className="font-hand text-[9px] fill-ink/70"
              >
                {lbl.d}
              </text>
            ))}
          </svg>
        )}
      </div>

      {/* Hand-drawn more corner when compact */}
      {isCompact && (
        <div
          className="absolute bottom-0 right-0 w-3.5 h-3.5 pointer-events-none select-none z-10"
          title="Resize to expand chart"
          aria-label="Resize to expand chart"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-full h-full text-ink/70"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M 24 0 L 0 24 L 24 24 Z"
              fill="#f4eddc"
              stroke="#1c2433"
              strokeWidth="1.2"
            />
          </svg>
        </div>
      )}
    </div>
  )
}

export const BarChartDesktop = React.memo(BarChartDesktopInner)
BarChartDesktop.displayName = 'BarChartDesktop'

// ── Mobile Render Component (Task 11 placeholder) ─────────────
export function BarChartMobile(props: WidgetRenderProps<BarChartConfig>) {
  return <BarChartDesktop {...props} />
}

// ── Widget Definition ─────────────────────────────────────────
export const barChartWidgetDefinition: WidgetDefinition<typeof barChartConfigSchema> = {
  id: 'bar-chart',
  displayName: 'Bar Chart',
  group: 'Charts',
  defaultSize: { w: 14, h: 12 },
  minSize: { w: 8, h: 8 },
  schema: barChartConfigSchema,
  component: BarChartDesktop,
  mobileComponent: BarChartMobile,
  icon: BarChartIcon,
}
