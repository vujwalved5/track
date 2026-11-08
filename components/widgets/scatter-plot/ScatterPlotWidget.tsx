'use client'

/**
 * Scatter Plot Widget
 * Memorable Moments — Phase 5 / Task 10 Batch A
 *
 * Rules:
 * - Group: 'Charts' (L1)
 * - Default size: 12x12 (12 cols × 12 rows on 22px grid = 264px × 264px)
 * - Min size: 8x8
 * - Pick two sources (e.g. sleep score against weight)
 * - Plots only days where BOTH sources have values (Correction 7)
 * - One dot per day plotted as (x=source1, y=source2)
 * - Custom SVG, ink-coloured, slightly wobbly dots (deterministic jitter) (L4, Correction 8)
 * - No software axes, gridlines, tooltips or legends (Correction 7)
 * - Live updates when source entries change via entriesVersion store (Correction 3)
 * - Palette L6 only, fonts L5 only, no emoji, hand-drawn SVG icon (L13)
 */

import React, { useState, useEffect, useMemo } from 'react'
import { z } from 'zod'
import type { WidgetDefinition, WidgetRenderProps } from '../types'
import { getWidgetEntriesWithCache } from '../entryHelpers'
import { useEntriesVersionStore } from '@/store/entriesVersion'
import {
  wobbleCircle,
  seedFromString,
  resolveDataSeries,
} from '../charts/chartUtils'

// ── Zod Config Schema ─────────────────────────────────────────
export const scatterPlotConfigSchema = z.object({
  title: z.string().default('Scatter Plot'),
  sourceWidgetId: z
    .string()
    .default('')
    .describe('number-log, counter, mood-tracker'),
  sourceWidgetId2: z
    .string()
    .default('')
    .describe('number-log, counter, mood-tracker'),
})

export type ScatterPlotConfig = z.infer<typeof scatterPlotConfigSchema>

// ── Hand-Drawn SVG Icon ───────────────────────────────────────
export function ScatterPlotIcon({ className = 'w-5 h-5' }: { className?: string }) {
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
      {/* Scattered hand-drawn points */}
      <circle cx="7" cy="16" r="1.5" fill="currentColor" />
      <circle cx="10" cy="13" r="1.5" fill="currentColor" />
      <circle cx="12" cy="15" r="1.5" fill="currentColor" />
      <circle cx="14" cy="9" r="1.5" fill="currentColor" />
      <circle cx="17" cy="7" r="1.5" fill="currentColor" />
      <circle cx="18" cy="11" r="1.5" fill="currentColor" />
    </svg>
  )
}

// ── Desktop / Main Component ──────────────────────────────────
export function ScatterPlotDesktop({
  id,
  config,
  w,
  h,
}: WidgetRenderProps<ScatterPlotConfig>) {
  const title = config?.title || 'Scatter Plot'
  const source1Id = config?.sourceWidgetId || ''
  const source2Id = config?.sourceWidgetId2 || ''

  const version = useEntriesVersionStore((s) => s.version)
  const [entries1, setEntries1] = useState<Array<{ day: number; value: unknown }>>([])
  const [entries2, setEntries2] = useState<Array<{ day: number; value: unknown }>>([])
  const [loading, setLoading] = useState(false)

  const seed = useMemo(() => seedFromString(id || 'scatter-plot'), [id])

  // Fetch both sources
  useEffect(() => {
    let cancelled = false
    async function fetchBoth() {
      if (!source1Id || !source2Id) {
        setEntries1([])
        setEntries2([])
        return
      }
      setLoading(true)
      const [res1, res2] = await Promise.all([
        getWidgetEntriesWithCache(source1Id),
        getWidgetEntriesWithCache(source2Id),
      ])

      if (!cancelled) {
        setEntries1(res1.success && res1.data ? res1.data : [])
        setEntries2(res2.success && res2.data ? res2.data : [])
        setLoading(false)
      }
    }
    fetchBoth()
    return () => {
      cancelled = true
    }
  }, [source1Id, source2Id, version])

  // Match days where BOTH sources have values (Correction 7)
  const matchedPoints = useMemo(() => {
    const series1 = resolveDataSeries(entries1)
    const series2 = resolveDataSeries(entries2)

    const map1 = new Map<number, number>()
    for (const item of series1) map1.set(item.day, item.value)

    const map2 = new Map<number, number>()
    for (const item of series2) map2.set(item.day, item.value)

    const matched: Array<{ day: number; x: number; y: number }> = []
    for (let day = 1; day <= 31; day++) {
      const v1 = map1.get(day)
      const v2 = map2.get(day)
      if (v1 !== undefined && v2 !== undefined) {
        matched.push({ day, x: v1, y: v2 })
      }
    }
    return matched
  }, [entries1, entries2])

  // Dimensions
  const widthPx = w * 22
  const heightPx = h * 22
  const isCompact = w <= 8 || h <= 8

  const padLeft = isCompact ? 14 : 20
  const padRight = isCompact ? 10 : 20
  const padTop = isCompact ? 22 : 32
  const padBottom = isCompact ? 14 : 20

  const plotW = Math.max(30, widthPx - padLeft - padRight)
  const plotH = Math.max(30, heightPx - padTop - padBottom)

  // Extents
  const xValues = matchedPoints.map((p) => p.x)
  const yValues = matchedPoints.map((p) => p.y)

  const minX = xValues.length > 0 ? Math.min(...xValues) : 0
  const maxX = xValues.length > 0 ? Math.max(...xValues) : 1
  const xRange = maxX === minX ? 1 : maxX - minX

  const minY = yValues.length > 0 ? Math.min(...yValues) : 0
  const maxY = yValues.length > 0 ? Math.max(...yValues) : 1
  const yRange = maxY === minY ? 1 : maxY - minY

  return (
    <div className="relative w-full h-full flex flex-col bg-transparent select-none overflow-hidden p-2">
      {/* Title Header */}
      <div className="h-[20px] flex items-center justify-between border-b border-ink/15 px-1 shrink-0">
        <span className="font-hand text-xs font-bold text-ink truncate">
          {title}
        </span>
        {matchedPoints.length > 0 && (
          <span className="font-hand text-[9px] text-ink/70">
            {matchedPoints.length} {matchedPoints.length === 1 ? 'day' : 'days'}
          </span>
        )}
      </div>

      {/* SVG Canvas */}
      <div className="flex-1 w-full relative">
        {!source1Id || !source2Id ? (
          <div className="w-full h-full flex items-center justify-center text-center p-3">
            <p className="font-hand text-xs text-ink/70 italic leading-snug">
              Pick two sources in settings
            </p>
          </div>
        ) : matchedPoints.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-center p-3">
            <p className="font-hand text-xs text-ink/70 italic">
              {loading ? 'turning the page...' : 'No matching days yet'}
            </p>
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${widthPx} ${heightPx - 24}`}
            className="w-full h-full overflow-visible"
            role="img"
            aria-label={`Scatter plot of ${title}, ${matchedPoints.length} matched days`}
          >
            {/* Hand-drawn scatter dots */}
            {matchedPoints.map((pt, i) => {
              const xFrac = (pt.x - minX) / xRange
              const yFrac = (pt.y - minY) / yRange

              const cx = padLeft + xFrac * plotW
              const cy = padTop + plotH - yFrac * plotH

              const dotPath = wobbleCircle(cx, cy, 2.8, seed + i * 7)

              return (
                <path
                  key={pt.day}
                  d={dotPath}
                  fill="#1c2433"
                  stroke="#1c2433"
                  strokeWidth="0.5"
                  className="transition-all"
                />
              )
            })}
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

// ── Mobile Render Component (Task 11 placeholder) ─────────────
export function ScatterPlotMobile(props: WidgetRenderProps<ScatterPlotConfig>) {
  return <ScatterPlotDesktop {...props} />
}

// ── Widget Definition ─────────────────────────────────────────
export const scatterPlotWidgetDefinition: WidgetDefinition<typeof scatterPlotConfigSchema> = {
  id: 'scatter-plot',
  displayName: 'Scatter Plot',
  group: 'Charts',
  defaultSize: { w: 12, h: 12 },
  minSize: { w: 8, h: 8 },
  schema: scatterPlotConfigSchema,
  component: ScatterPlotDesktop,
  mobileComponent: ScatterPlotMobile,
  icon: ScatterPlotIcon,
}
