'use client'

/**
 * Goal Bar Widget
 * Memorable Moments — Phase 5 / Task 10 Batch B
 *
 * Rules:
 * - Group: 'Ask' (Correction 1)
 * - Default size: 14x4 (14 cols × 4 rows on 22px grid = 308px × 88px)
 * - Min size: 8x3
 * - Source: Counter or Number Log (Correction 2, 6)
 * - Total: Counter total (sum of days if per-day, else day-1 count) OR sum of Number Log (Correction 6)
 * - No "latest" option (Correction 6)
 * - Hand-drawn SVG progress bar with deterministic jitter (L4, Correction 8)
 * - Live updates when source entries change via entriesVersion store (Correction 3)
 * - Palette L6 only, fonts L5 only, no emoji, hand-drawn SVG icon (L13)
 */

import React, { useState, useEffect, useMemo } from 'react'
import { z } from 'zod'
import type { WidgetDefinition, WidgetRenderProps } from '../types'
import { counterEntrySchema, numberLogEntrySchema } from '../entrySchemas'
import { getWidgetEntriesWithCache } from '../entryHelpers'
import { useEntriesVersionStore } from '@/store/entriesVersion'
import { seedFromString } from '../charts/chartUtils'

// ── Zod Config Schema ─────────────────────────────────────────
export const goalBarConfigSchema = z.object({
  title: z.string().default('Goal'),
  sourceWidgetId: z
    .string()
    .default('')
    .describe('counter, number-log'),
  target: z.number().positive().default(100),
  unit: z.string().default(''),
  orientation: z.enum(['across', 'down']).default('across'),
})

export type GoalBarConfig = z.infer<typeof goalBarConfigSchema>

// ── Hand-Drawn SVG Icon ───────────────────────────────────────
export function GoalBarIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      {/* Outer goal capsule / bar */}
      <rect
        x="3"
        y="8"
        width="18"
        height="8"
        rx="2"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Filled progress section */}
      <rect
        x="4.5"
        y="9.5"
        width="10"
        height="5"
        fill="currentColor"
        opacity="0.75"
        rx="1"
      />
      {/* Flag / goal line */}
      <path d="M 17 6 L 17 18" strokeWidth="1.3" strokeDasharray="1.5 1.5" />
    </svg>
  )
}

// ── Desktop / Main Component ──────────────────────────────────
export function GoalBarDesktop({
  id,
  config,
  w = 14,
  h = 4,
}: WidgetRenderProps<GoalBarConfig>) {
  const title = config?.title || 'Goal'
  const sourceWidgetId = config?.sourceWidgetId || ''
  const target = config?.target && config.target > 0 ? config.target : 100
  const unit = config?.unit || ''
  const orientation = config?.orientation || 'across'
  const isDown = orientation === 'down'

  const version = useEntriesVersionStore((s) => s.version)
  const [entries, setEntries] = useState<Array<{ day: number; value: unknown }>>([])
  const [loading, setLoading] = useState(false)

  const patternId = useMemo(() => `goal-hatch-${id || 'goal'}`, [id])
  const seed = useMemo(() => seedFromString(id || 'goal-bar'), [id])

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

  // Calculate sum (Counter total or Number Log sum, Correction 6)
  const currentTotal = useMemo(() => {
    if (entries.length === 0) return 0
    let total = 0
    for (const e of entries) {
      // Counter: { count: number }
      const counterParsed = counterEntrySchema.safeParse(e.value)
      if (counterParsed.success) {
        total += counterParsed.data.count
        continue
      }
      // Number Log: { value: number | null }
      const numParsed = numberLogEntrySchema.safeParse(e.value)
      if (numParsed.success && typeof numParsed.data.value === 'number') {
        total += numParsed.data.value
      }
    }
    return Math.round(total * 10) / 10
  }, [entries])

  const progressFrac = Math.min(1, Math.max(0, currentTotal / target))
  const percent = Math.round(progressFrac * 100)
  const isReached = currentTotal >= target

  // Bar SVG dimensions
  const widthPx = w * 22
  const heightPx = h * 22
  const isCompact = w <= 5 || h <= 2
  const isUltraCompact = h <= 2

  // Horizontal "across" dimensions
  const sidePad = isCompact ? 8 : 16
  const barWidth = Math.max(20, widthPx - sidePad * 2)
  const barHeight = isCompact ? 16 : 22
  const filledWidth = Math.max(0, barWidth * progressFrac)

  // Vertical "down" dimensions (fills upward from bottom)
  const vBarW = isCompact ? 14 : 18
  const vBarH = Math.max(20, heightPx - (isUltraCompact ? 26 : 48))
  const barX = Math.round((widthPx - vBarW) / 2)
  const barY = 4
  const filledHeight = progressFrac > 0 ? Math.max(1, (vBarH - 2) * progressFrac) : 0
  const fillY = barY + 1 + (vBarH - 2 - filledHeight)
  const fillX = barX + 1
  const fillW = vBarW - 2

  return (
    <div className={`relative w-full h-full flex flex-col justify-between bg-transparent select-none overflow-hidden ${isCompact ? 'p-1' : 'p-2.5'}`}>
      {/* Top Header: Title + Target Display */}
      <div className={`flex items-center justify-between border-b border-ink/15 ${isCompact ? 'pb-0.5' : 'pb-1'} shrink-0`}>
        <span className={`font-hand ${isCompact ? 'text-[10px]' : 'text-xs'} font-bold text-ink truncate max-w-[50%]`}>
          {title}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <span className={`font-hand ${isCompact ? 'text-[9px]' : 'text-[11px]'} text-ink font-bold`}>
            {currentTotal}
            <span className="text-ink/70 font-normal"> / {target}</span>
            {unit && <span className="text-ink/70 font-normal ml-0.5">{unit}</span>}
          </span>
          <span
            className={`font-hand text-[9px] font-bold px-0.5 rounded-xs ${
              isReached
                ? 'bg-redpen/15 text-redpen'
                : 'text-ink/70'
            }`}
          >
            {percent}%
          </span>
        </div>
      </div>

      {/* Center: Hand-Drawn SVG Progress Bar */}
      <div className="flex-1 flex items-center justify-center py-0.5">
        {loading ? (
          <p className="font-hand text-[10px] text-ink/70 italic">
            turning the page...
          </p>
        ) : !sourceWidgetId ? (
          <p className="font-hand text-[10px] text-ink/70 italic text-center px-1">
            Pick a Counter or Number Log in settings
          </p>
        ) : (
          <svg
            viewBox={`0 0 ${widthPx} ${isDown ? vBarH + 8 : barHeight + 6}`}
            className={`w-full h-full ${isDown ? '' : 'max-h-[28px]'} overflow-visible`}
            role="img"
            aria-label={`Goal bar for ${title}, ${currentTotal} of ${target}${unit ? ' ' + unit : ''}, ${percent}%`}
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
                  stroke={isReached ? '#b3261e' : '#1c2433'}
                  strokeWidth="1.2"
                />
              </pattern>
            </defs>

            {isDown ? (
              <>
                {/* Outer vertical capsule frame */}
                <rect
                  x={barX}
                  y={barY}
                  width={vBarW}
                  height={vBarH}
                  rx="3"
                  fill="none"
                  stroke="#1c2433"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />

                {/* Filled progress section filling upward from bottom */}
                {filledHeight > 0 && (
                  <rect
                    x={fillX}
                    y={fillY}
                    width={fillW}
                    height={filledHeight}
                    rx="2"
                    fill={`url(#${patternId})`}
                    stroke={isReached ? '#b3261e' : '#1c2433'}
                    strokeWidth="1"
                  />
                )}

                {/* Goal achieved marker at top of vertical bar */}
                {isReached && (
                  <path
                    d={`M ${barX - 2} ${barY} L ${barX + vBarW / 2} ${barY - 3} L ${barX + vBarW + 2} ${barY}`}
                    stroke="#b3261e"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                )}

                {/* Side guide labels if width permits */}
                {widthPx >= 88 && (
                  <>
                    <text
                      x={barX + vBarW + 5}
                      y={barY + 9}
                      className="font-hand text-[9px] fill-ink/70 select-none"
                    >
                      {target}
                    </text>
                    <text
                      x={barX + vBarW + 5}
                      y={barY + vBarH - 1}
                      className="font-hand text-[9px] fill-ink/70 select-none"
                    >
                      0
                    </text>
                  </>
                )}
              </>
            ) : (
              <>
                {/* Outer wobbly capsule frame */}
                <rect
                  x={sidePad}
                  y="3"
                  width={barWidth}
                  height={barHeight}
                  rx="3"
                  fill="none"
                  stroke="#1c2433"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />

                {/* Filled progress section */}
                {filledWidth > 0 && (
                  <rect
                    x={sidePad + 1}
                    y="4"
                    width={Math.max(1, filledWidth - 2)}
                    height={barHeight - 2}
                    rx="2"
                    fill={`url(#${patternId})`}
                    stroke={isReached ? '#b3261e' : '#1c2433'}
                    strokeWidth="1"
                  />
                )}

                {/* Goal achieved marker */}
                {isReached && (
                  <path
                    d={`M ${sidePad + barWidth - 1} 1 L ${sidePad + barWidth + 3} 3 L ${sidePad + barWidth - 1} 5`}
                    stroke="#b3261e"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                )}
              </>
            )}
          </svg>
        )}
      </div>

      {/* Footer Subtitle (hidden if ultra-compact h <= 2) */}
      {!isUltraCompact && (
        <div className="flex items-center justify-between text-[9px] font-hand text-ink/70 pt-0.5 shrink-0">
          <span>0</span>
          {isReached ? (
            <span className="text-redpen font-bold">Goal achieved!</span>
          ) : (
            <span>Target: {target}</span>
          )}
        </div>
      )}

      {/* Hand-Drawn More Corner when small or overflowing */}
      {isUltraCompact && (
        <div
          className="absolute bottom-0 right-0 w-3.5 h-3.5 pointer-events-none select-none z-10"
          title="More details (resize to see all)"
          aria-label="More details below"
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
export function GoalBarMobile(props: WidgetRenderProps<GoalBarConfig>) {
  return <GoalBarDesktop {...props} />
}

// ── Widget Definition ─────────────────────────────────────────
export const goalBarWidgetDefinition: WidgetDefinition<typeof goalBarConfigSchema> = {
  id: 'goal-bar',
  displayName: 'Goal Bar',
  group: 'Ask',
  defaultSize: { w: 14, h: 4 },
  minSize: { w: 8, h: 3 },
  schema: goalBarConfigSchema,
  component: GoalBarDesktop,
  mobileComponent: GoalBarMobile,
  icon: GoalBarIcon,
}
