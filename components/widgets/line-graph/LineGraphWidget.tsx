'use client'

/**
 * Line Graph Widget
 * Memorable Moments — Phase 5 / Task 10 Batch A & Task 16 (Day Zoom + Value Axis)
 *
 * Rules:
 * - Group: 'Charts' (L1)
 * - Default size: 14x14 (14 cols × 14 rows on 22px grid = 308px × 308px)
 * - Min size: 8x8
 * - Source: number-log, counter, mood-tracker (chosen in config)
 * - Custom SVG, ink-coloured, slightly wobbly lines (deterministic jitter) (L4, Correction 8)
 * - Option to draw vertically (days running top to bottom, values left to right)
 * - Day axis zoom to days with data [first - 1 .. last + 1], clamped to 1..31, min 7 days
 * - Dotted pen stroke across gap days inside range
 * - Value axis: data min minus pad to max plus pad. Pad = 2 or 10% of span. Fixed 1..5 for mood.
 * - 3 value ticks (min, mid, max) rounded to whole or 1 decimal, Kalam font, ink/70.
 * - Unit next to top tick from source config.
 * - Point values beside each point (all if <= 10 points, min/max if > 10).
 * - Thin out to min/max only at minimum widget size.
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

// ── Day Range Math ────────────────────────────────────────────
export function computeDayRange(daysWithData: number[]): { startDay: number; endDay: number } {
  if (daysWithData.length === 0) {
    return { startDay: 1, endDay: 31 }
  }

  const minDay = Math.min(...daysWithData)
  const maxDay = Math.max(...daysWithData)

  let startDay = Math.max(1, minDay - 1)
  let endDay = Math.min(31, maxDay + 1)

  // Ensure never fewer than 7 days shown, so a single new entry still looks sensible
  while (endDay - startDay + 1 < 7 && (startDay > 1 || endDay < 31)) {
    if (startDay > 1) startDay--
    if (endDay - startDay + 1 < 7 && endDay < 31) endDay++
  }

  return { startDay, endDay }
}

interface LineSegment {
  type: 'solid' | 'dotted'
  d: string
}

// ── Desktop / Main Component ──────────────────────────────────
export const LineGraphDesktop = React.memo(function LineGraphDesktop({
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

  const version = useEntriesVersionStore((s) =>
    sourceWidgetId ? s.versions[sourceWidgetId] ?? 0 : 0,
  )
  const [entries, setEntries] = useState<Array<{ day: number; value: unknown }>>(() => {
    if (!sourceWidgetId) return []
    const sourceInitial = initialEntries?.filter((e) => e.widget_id === sourceWidgetId)
    if (sourceInitial && sourceInitial.length > 0) return sourceInitial
    return getInitialWidgetEntries(sourceWidgetId)
  })
  const rawUnit = sourceWidgetId
    ? rest.allWidgets?.find((w) => w.id === sourceWidgetId)?.config?.unit
    : ''
  const sourceUnit = typeof rawUnit === 'string' ? rawUnit : ''
  const [loading, setLoading] = useState(false)

  // Seed for deterministic wobble
  const seed = useMemo(() => seedFromString(id || 'line-graph'), [id])

  const isFirstMount = useRef(true)
  useEffect(() => {
    let cancelled = false
    async function fetchSourceData() {
      if (isFirstMount.current) {
        isFirstMount.current = false
        return
      }

      if (!sourceWidgetId) {
        setEntries([])
        return
      }

      setLoading(true)
      try {
        const res = await getWidgetEntriesWithCache(sourceWidgetId)
        if (!cancelled) {
          setEntries(res.success && res.data ? res.data : [])
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load widget entries:', err)
          setEntries([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    fetchSourceData()
    return () => {
      cancelled = true
    }
  }, [sourceWidgetId, version])

  // Sorted by day
  const series = useMemo(() => {
    const s = resolveDataSeries(entries)
    return [...s].sort((a, b) => a.day - b.day)
  }, [entries])

  const isMoodSource = useMemo(() => {
    return entries.some(
      (e) =>
        e.value &&
        typeof e.value === 'object' &&
        'mood' in (e.value as Record<string, unknown>),
    )
  }, [entries])

  // Day range clamped to 1..31, min 7 days
  const daysWithData = useMemo(() => series.map((s) => s.day), [series])
  const dayRange = useMemo(() => computeDayRange(daysWithData), [daysWithData])

  // Value extents: min - pad to max + pad, pad = max(2, span * 0.1), no clamp to 0. Mood uses 1..5.
  const values = useMemo(() => series.map((s) => s.value), [series])
  const { minVal, maxVal, valRange } = useMemo(() => {
    if (isMoodSource) {
      return { minVal: 1, maxVal: 5, valRange: 4 }
    }
    if (values.length === 0) {
      return { minVal: 0, maxVal: 10, valRange: 10 }
    }
    const rawMin = Math.min(...values)
    const rawMax = Math.max(...values)
    const span = rawMax - rawMin
    const pad = Math.max(2, span * 0.1)
    const calculatedMin = rawMin - pad
    const calculatedMax = rawMax + pad
    const vRange = calculatedMax === calculatedMin ? 1 : calculatedMax - calculatedMin
    return { minVal: calculatedMin, maxVal: calculatedMax, valRange: vRange }
  }, [isMoodSource, values])

  const hasDecimals = useMemo(() => {
    return series.some((s) => !Number.isInteger(s.value))
  }, [series])

  const formatValue = (v: number): string => {
    if (hasDecimals) {
      return v.toFixed(1)
    }
    return Math.round(v).toString()
  }

  // Pixel dimensions based on grid units w & h (each unit is 22px)
  const widthPx = w * 22
  const heightPx = h * 22
  const isCompact = w <= 8 || h <= 8
  const svgH = Math.max(40, heightPx - 24)

  // Chart plotting area
  const padLeft = isCompact ? (isDown ? 22 : 30) : (isDown ? 28 : 36)
  const padRight = isCompact ? (isDown ? 16 : 10) : (isDown ? 22 : 16)
  const padTop = isCompact ? (isDown ? 22 : 16) : (isDown ? 26 : 20)
  const padBottom = isCompact ? (isDown ? 12 : 20) : (isDown ? 16 : 24)

  const plotW = Math.max(30, widthPx - padLeft - padRight)
  const plotH = Math.max(30, svgH - padTop - padBottom)

  // Compute points
  const points: [number, number][] = useMemo(() => {
    const { startDay, endDay } = dayRange
    const daySpan = endDay === startDay ? 1 : endDay - startDay
    return series.map((s) => {
      const dayFrac = Math.max(0, Math.min(1, (s.day - startDay) / daySpan))
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
  }, [series, dayRange, minVal, valRange, isDown, padTop, padLeft, plotW, plotH])

  // Segment generation: solid lines for consecutive days, dotted lines across gaps
  const lineSegments = useMemo<LineSegment[]>(() => {
    if (points.length < 2) return []

    const segments: LineSegment[] = []
    let currentSolidRun: [number, number][] = [points[0]]

    for (let i = 1; i < series.length; i++) {
      const prevDay = series[i - 1].day
      const currDay = series[i].day
      const ptPrev = points[i - 1]
      const ptCurr = points[i]

      if (currDay - prevDay === 1) {
        // Consecutive day -> extend solid run
        currentSolidRun.push(ptCurr)
      } else {
        // Missing days inside the range!
        // 1. Flush any completed solid run with >= 2 points
        if (currentSolidRun.length >= 2) {
          segments.push({
            type: 'solid',
            d: wobblePath(currentSolidRun, seed + segments.length * 13),
          })
        }
        currentSolidRun = [ptCurr]

        // 2. Short dotted pen line across the gap
        segments.push({
          type: 'dotted',
          d: wobblePath([ptPrev, ptCurr], seed + i * 19),
        })
      }
    }

    // Flush remaining solid run
    if (currentSolidRun.length >= 2) {
      segments.push({
        type: 'solid',
        d: wobblePath(currentSolidRun, seed + segments.length * 13),
      })
    }

    return segments
  }, [series, points, seed])

  // Value axis ticks: min, mid, max (thinned out to min and max at minimum size)
  const valueTicks = useMemo(() => {
    const ticks = isCompact
      ? [minVal, maxVal]
      : [minVal, (minVal + maxVal) / 2, maxVal]

    return ticks.map((val, idx) => {
      const isTop = idx === ticks.length - 1
      const frac = valRange === 0 ? 0.5 : (val - minVal) / valRange
      const label = formatValue(val) + (isTop && sourceUnit ? ` ${sourceUnit}` : '')

      if (isDown) {
        // Horizontal along top
        const x = padLeft + frac * plotW
        const y1 = padTop - 4
        const y2 = padTop
        const textX = x
        const textY = padTop - 7
        const textAnchor: 'start' | 'middle' | 'end' =
          idx === 0 ? 'start' : isTop ? 'end' : 'middle'
        return { val, label, x1: x, y1, x2: x, y2, textX, textY, textAnchor }
      } else {
        // Vertical along left
        const y = padTop + plotH - frac * plotH
        const x1 = padLeft - 4
        const x2 = padLeft
        const textX = padLeft - 6
        const textY = y + 3
        const textAnchor: 'start' | 'middle' | 'end' = 'end'
        return { val, label, x1, y1: y, x2, y2: y, textX, textY, textAnchor }
      }
    })
  }, [
    minVal,
    maxVal,
    valRange,
    isCompact,
    isDown,
    padLeft,
    padTop,
    plotW,
    plotH,
    sourceUnit,
    hasDecimals,
  ])

  // Labeled point indices: all points if <= 10 points; otherwise only highest and lowest
  const labeledPointIndices = useMemo(() => {
    const set = new Set<number>()
    if (series.length === 0) return set
    if (series.length <= 10) {
      for (let i = 0; i < series.length; i++) set.add(i)
      return set
    }
    let maxIdx = 0
    let minIdx = 0
    for (let i = 1; i < series.length; i++) {
      if (series[i].value > series[maxIdx].value) maxIdx = i
      if (series[i].value < series[minIdx].value) minIdx = i
    }
    set.add(maxIdx)
    set.add(minIdx)
    return set
  }, [series])

  // Day tick labels: first day, last day, every data day if <= 10 days, otherwise every 5th day. Never overlap.
  const renderedDayLabels = useMemo(() => {
    const { startDay, endDay } = dayRange
    if (startDay === endDay) {
      return [{ day: startDay, x: padLeft, y: padTop, anchor: 'middle' as const }]
    }

    const span = endDay - startDay + 1
    const dataDays = series.map((s) => s.day)

    let candidates: number[] = []
    if (isCompact) {
      candidates = [startDay, endDay]
    } else if (span <= 10) {
      const set = new Set<number>([startDay, endDay])
      for (const d of dataDays) {
        if (d >= startDay && d <= endDay) {
          set.add(d)
        }
      }
      candidates = Array.from(set).sort((a, b) => a - b)
    } else {
      const set = new Set<number>([startDay, endDay])
      for (let d = startDay; d <= endDay; d++) {
        if (d % 5 === 0) set.add(d)
      }
      candidates = Array.from(set).sort((a, b) => a - b)
    }

    // Ensure labels never overlap
    const minSpacing = isDown ? 13 : 16
    const axisLength = isDown ? plotH : plotW
    const getPosPx = (d: number) => ((d - startDay) / (endDay - startDay)) * axisLength

    const accepted: number[] = [startDay]
    const middleCandidates = candidates.filter((d) => d !== startDay && d !== endDay)

    for (const d of middleCandidates) {
      const prev = accepted[accepted.length - 1]
      const posD = getPosPx(d)
      const posPrev = getPosPx(prev)
      const posEnd = getPosPx(endDay)
      if (posD - posPrev >= minSpacing && posEnd - posD >= minSpacing) {
        accepted.push(d)
      }
    }

    if (endDay !== startDay) {
      const lastAccepted = accepted[accepted.length - 1]
      if (getPosPx(endDay) - getPosPx(lastAccepted) >= minSpacing || accepted.length === 1) {
        accepted.push(endDay)
      }
    }

    return accepted.map((d) => {
      const frac = (d - startDay) / (endDay - startDay)
      if (isDown) {
        const y = padTop + frac * plotH
        return {
          day: d,
          x: padLeft - 6,
          y: y + 3,
          anchor: 'end' as const,
        }
      } else {
        const x = padLeft + frac * plotW
        return {
          day: d,
          x,
          y: padTop + plotH + 14,
          anchor: 'middle' as const,
        }
      }
    })
  }, [dayRange, series, isCompact, isDown, padLeft, padTop, plotH, plotW])

  // Accessible aria-label description
  const ariaLabel = useMemo(() => {
    const minFmt = formatValue(minVal)
    const maxFmt = formatValue(maxVal)
    const unitStr = sourceUnit ? ` ${sourceUnit}` : ''
    const dayRangeStr = `days ${dayRange.startDay} to ${dayRange.endDay}`
    const countStr = `${series.length} ${series.length === 1 ? 'entry' : 'entries'}`
    const latestStr =
      series.length > 0 ? `, latest ${series[series.length - 1].value}` : ''
    return `Line graph of ${title}, ${dayRangeStr}, range ${minFmt} to ${maxFmt}${unitStr}, ${countStr}${latestStr}`
  }, [title, dayRange, minVal, maxVal, sourceUnit, series, hasDecimals])

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
            aria-label={ariaLabel}
          >
            {/* Value Axis Ticks & Tick Marks (Task 15 rules) */}
            {valueTicks.map((tick, i) => (
              <g key={`val-tick-${i}`}>
                {/* Short hand-drawn tick mark */}
                <line
                  x1={tick.x1}
                  y1={tick.y1}
                  x2={tick.x2}
                  y2={tick.y2}
                  stroke="#1c2433"
                  strokeWidth="1.2"
                  strokeOpacity="0.7"
                  strokeLinecap="round"
                />
                {/* Value label */}
                <text
                  x={tick.textX}
                  y={tick.textY}
                  textAnchor={tick.textAnchor}
                  className="font-hand text-[9px] fill-ink/70 select-none"
                >
                  {tick.label}
                </text>
              </g>
            ))}

            {/* Connecting lines: solid runs and dotted gap segments */}
            {lineSegments.map((seg, i) => (
              <path
                key={`seg-${i}`}
                d={seg.d}
                fill="none"
                stroke="#1c2433"
                strokeWidth={seg.type === 'solid' ? 1.8 : 1.6}
                strokeDasharray={seg.type === 'dotted' ? '2.5 3' : undefined}
                strokeOpacity={seg.type === 'dotted' ? 0.75 : 1}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

            {/* Hand-drawn point dots */}
            {points.map(([px, py], i) => (
              <circle
                key={`pt-${i}`}
                cx={px}
                cy={py}
                r={2.2}
                fill="#1c2433"
                className="transition-all"
              />
            ))}

            {/* Values beside points */}
            {points.map(([px, py], i) => {
              if (!labeledPointIndices.has(i)) return null
              const valText = formatValue(series[i].value)
              if (isDown) {
                const isNearRight = px > widthPx - padRight - 18
                const tx = isNearRight ? px - 4 : px + 4
                const ty = py + 3
                const anchor = isNearRight ? 'end' : 'start'
                return (
                  <text
                    key={`point-val-${i}`}
                    x={tx}
                    y={ty}
                    textAnchor={anchor}
                    className="font-hand text-[9px] fill-ink/75 select-none pointer-events-none"
                  >
                    {valText}
                  </text>
                )
              } else {
                const isNearTop = py < padTop + 14
                const tx = px
                const ty = isNearTop ? py + 11 : py - 4
                return (
                  <text
                    key={`point-val-${i}`}
                    x={tx}
                    y={ty}
                    textAnchor="middle"
                    className="font-hand text-[9px] fill-ink/75 select-none pointer-events-none"
                  >
                    {valText}
                  </text>
                )
              }
            })}

            {/* Day tick labels (adaptive zoom & collision prevention) */}
            {renderedDayLabels.map((lbl, idx) => (
              <text
                key={`day-lbl-${idx}`}
                x={lbl.x}
                y={lbl.y}
                textAnchor={lbl.anchor}
                className="font-hand text-[9px] fill-ink/70 select-none"
              >
                {lbl.day}
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
})

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
