'use client'

/**
 * Line Graph Widget
 * Memorable Moments — Phase 5 / Task 10 Batch A
 *
 * Rules:
 * - Group: 'Charts' (L1)
 * - Default size: 14x14 (14 cols × 14 rows on 22px grid = 308px × 308px)
 * - Min size: 8x8
 * - Source: number-log, counter, mood-tracker (chosen in config)
 * - Custom SVG, ink-coloured, slightly wobbly lines (deterministic jitter) (L4, Correction 8)
 * - Option to draw vertically (days running top to bottom)
 * - Handwritten day numbers at sparse intervals only (Correction 7)
 * - No software axes, tick marks, gridlines, tooltips or legends (Correction 7)
 * - Live updates when source entries change via entriesVersion store (Correction 3)
 * - Palette L6 only, fonts L5 only, no emoji, hand-drawn SVG icon (L13)
 */

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { z } from 'zod'
import type { WidgetDefinition, WidgetRenderProps } from '../types'
import {
  getWidgetEntriesWithCache,
  getInitialWidgetEntries,
  type WidgetEntryRow,
} from '../entryHelpers'
import { useEntriesVersionStore } from '@/store/entriesVersion'
import {
  wobblePath,
  seedFromString,
  resolveDataSeries,
} from '../charts/chartUtils'

// ── Zod Config Schema ─────────────────────────────────────────
export const lineGraphConfigSchema = z.object({
  title: z.string().default('Line Graph'),
  sourceWidgetId: z
    .string()
    .default('')
    .describe('number-log, counter, mood-tracker'),
  orientation: z.enum(['across', 'down']).default('across'),
  vertical: z.boolean().optional(),
})

export type LineGraphConfig = z.infer<typeof lineGraphConfigSchema>

// ── Hand-Drawn SVG Icon ───────────────────────────────────────
export function LineGraphIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      {/* Box frame */}
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
      {/* Hand-drawn polyline */}
      <path
        d="M 5 17 Q 8 13, 10 14 T 15 8 T 19 10"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dots */}
      <circle cx="5" cy="17" r="1.2" fill="currentColor" />
      <circle cx="10" cy="14" r="1.2" fill="currentColor" />
      <circle cx="15" cy="8" r="1.2" fill="currentColor" />
      <circle cx="19" cy="10" r="1.2" fill="currentColor" />
    </svg>
  )
}

// Sparse day intervals to label (e.g. 1, 5, 10, 15, 20, 25, 30)
const SPARSE_DAYS = [1, 5, 10, 15, 20, 25, 30]

// ── Desktop / Main Component ──────────────────────────────────
export function LineGraphDesktop({
  id,
  config,
  w,
  h,
  ...rest
}: WidgetRenderProps<LineGraphConfig> & { initialEntries?: WidgetEntryRow[] }) {
  const initialEntries = rest.initialEntries
  const title = config?.title || 'Line Graph'
  const sourceWidgetId = config?.sourceWidgetId || ''
  const isDown =
    config?.orientation === 'down' || config?.orientation === 'across'
      ? config.orientation === 'down'
      : !!config?.vertical

  const version = useEntriesVersionStore((s) => s.version)
  const [entries, setEntries] = useState<Array<{ day: number; value: unknown }>>(() => {
    if (!sourceWidgetId) return []
    const sourceInitial = initialEntries?.filter((e) => e.widget_id === sourceWidgetId)
    if (sourceInitial && sourceInitial.length > 0) return sourceInitial
    return getInitialWidgetEntries(sourceWidgetId)
  })
  const [loading, setLoading] = useState(false)

  // Seed for deterministic wobble
  const seed = useMemo(() => seedFromString(id || 'line-graph'), [id])

  const isFirstMount = useRef(true)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }
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

  // Pixel dimensions based on grid units w & h (each unit is 22px)
  const widthPx = w * 22
  const heightPx = h * 22
  const isCompact = w <= 8 || h <= 8
  const svgH = Math.max(40, heightPx - 24)

  // Chart plotting area
  const padLeft = isCompact ? (isDown ? 22 : 14) : (isDown ? 28 : 22)
  const padRight = isCompact ? 8 : 14
  const padTop = isCompact ? 18 : 24 // below title
  const padBottom = isCompact ? (isDown ? 10 : 18) : (isDown ? 14 : 22)

  const plotW = Math.max(30, widthPx - padLeft - padRight)
  const plotH = Math.max(30, svgH - padTop - padBottom)

  // Value extents
  const values = series.map((s) => s.value)
  const minVal = values.length > 0 ? Math.min(...values) : 0
  const maxVal = values.length > 0 ? Math.max(...values) : 1
  const valRange = maxVal === minVal ? 1 : maxVal - minVal

  // Compute points
  const points: [number, number][] = useMemo(() => {
    return series.map((s) => {
      const dayFrac = Math.max(0, Math.min(1, (s.day - 1) / 30))
      const valFrac = (s.value - minVal) / valRange
      if (isDown) {
        // Days running top to bottom, values left to right
        const y = padTop + dayFrac * plotH
        const x = padLeft + valFrac * plotW
        return [x, y]
      } else {
        // Days running left to right, values bottom to top
        const x = padLeft + dayFrac * plotW
        const y = padTop + plotH - valFrac * plotH
        return [x, y]
      }
    })
  }, [series, minVal, valRange, isDown, padTop, padLeft, plotW, plotH])

  const pathD = useMemo(() => wobblePath(points, seed), [points, seed])

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
            aria-label={`Line graph of ${title}, ${series.length} entries${
              series.length > 0 ? `, latest ${series[series.length - 1].value}` : ''
            }`}
          >
            {/* Connecting line */}
            <path
              d={pathD}
              fill="none"
              stroke="#1c2433"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Hand-drawn point dots */}
            {points.map(([px, py], i) => (
              <circle
                key={i}
                cx={px}
                cy={py}
                r={2.2}
                fill="#1c2433"
                className="transition-all"
              />
            ))}

            {/* Sparse day labels (no axis lines or tick marks) */}
            {SPARSE_DAYS.map((d) => {
              const frac = (d - 1) / 30
              if (isDown) {
                const y = padTop + frac * plotH
                return (
                  <text
                    key={d}
                    x={padLeft - 6}
                    y={y + 3}
                    textAnchor="end"
                    className="font-hand text-[9px] fill-ink/70"
                  >
                    {d}
                  </text>
                )
              } else {
                const x = padLeft + frac * plotW
                return (
                  <text
                    key={d}
                    x={x}
                    y={padTop + plotH + 14}
                    textAnchor="middle"
                    className="font-hand text-[9px] fill-ink/70"
                  >
                    {d}
                  </text>
                )
              }
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
export function LineGraphMobile(
  props: WidgetRenderProps<LineGraphConfig> & { initialEntries?: WidgetEntryRow[] },
) {
  return <LineGraphDesktop {...props} />
}

// ── Widget Definition ─────────────────────────────────────────
export const lineGraphWidgetDefinition: WidgetDefinition<typeof lineGraphConfigSchema> = {
  id: 'line-graph',
  displayName: 'Line Graph',
  group: 'Charts',
  defaultSize: { w: 14, h: 14 },
  minSize: { w: 8, h: 8 },
  schema: lineGraphConfigSchema,
  component: LineGraphDesktop,
  mobileComponent: LineGraphMobile,
  icon: LineGraphIcon,
}
