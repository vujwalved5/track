'use client'

/**
 * Number Log Widget
 * Memorable Moments — Phase 5 / Task 9 Batch B
 *
 * Rules:
 * - Group: 'Track'
 * - Default size: 6x24 (6 cols × 24 rows on 22px grid = 132px × 528px)
 * - Min size: 4x18
 * - One number per day (1..31), unit set in config (e.g. kg)
 * - Tap a line to type a number; clearing removes the value
 * - 32px header + 12px padding + 31 rows = 15.61px per row (>= 14px threshold)
 * - Stored in entries table per day: { value: number | null }
 * - Palette L6 only, fonts L5 only, no emoji, hand-drawn SVG icon (L13)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { z } from 'zod'
import type { WidgetDefinition, WidgetRenderProps } from '../types'
import { numberLogEntrySchema } from '../entryActions'
import { saveWidgetEntryAndBump, getWidgetEntriesWithCache } from '../entryHelpers'

// ── Zod Config Schema ─────────────────────────────────────────
export const numberLogConfigSchema = z.object({
  label: z.string().default('Number Log'),
  unit: z.string().default(''),
})

export type NumberLogConfig = z.infer<typeof numberLogConfigSchema>

// ── Hand-Drawn SVG Icon ───────────────────────────────────────
export function NumberLogIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      {/* Narrow column outline */}
      <path
        d="M 7 3.5 C 10 3.3, 15 3.6, 17 3.5 L 17 20.5 C 14 20.3, 10 20.6, 7 20.5 Z"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Header divider */}
      <path d="M 7 7 L 17 7" strokeWidth="1.3" strokeLinecap="round" />
      {/* Three data rows with handwritten numbers */}
      <path d="M 9 10 L 15 10" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="2 1.5" />
      <path d="M 9 13.5 L 15 13.5" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="2 1.5" />
      <path d="M 9 17 L 15 17" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="2 1.5" />
      {/* Unit label (small "kg" suggestion) */}
      <text
        x="11"
        y="6.2"
        fontSize="3.2"
        fontFamily="sans-serif"
        fill="currentColor"
        stroke="none"
        textAnchor="middle"
      >
        kg
      </text>
    </svg>
  )
}

// ── Custom Hook for shared entry management ────────────────────
function useNumberLogEntries(id: string, isArrangeMode?: boolean) {
  const [valuesMap, setValuesMap] = useState<Record<number, number | null>>({})
  const [saveError, setSaveError] = useState<string | null>(null)
  const [editingDay, setEditingDay] = useState<number | null>(null)
  const [editingText, setEditingText] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const res = await getWidgetEntriesWithCache(id)
      if (!cancelled && res.success && res.data) {
        const next: Record<number, number | null> = {}
        for (const row of res.data) {
          const parsed = numberLogEntrySchema.safeParse(row.value)
          if (parsed.success) {
            next[row.day] = parsed.data.value
          }
        }
        setValuesMap(next)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    if (editingDay !== null && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingDay])

  const commitEdit = useCallback(
    async (day: number, rawText: string) => {
      const prevValue = valuesMap[day] ?? null
      const trimmed = rawText.trim()
      const nextValue = trimmed === '' ? null : parseFloat(trimmed)
      const finalValue =
        trimmed === '' || isNaN(nextValue as number) ? null : (nextValue as number)

      if (finalValue === prevValue) {
        setEditingDay(null)
        return
      }

      setValuesMap((prev) => ({ ...prev, [day]: finalValue }))
      setEditingDay(null)

      const res = await saveWidgetEntryAndBump(id, day, { value: finalValue })

      if (!res.success) {
        setValuesMap((prev) => ({ ...prev, [day]: prevValue }))
        setSaveError(`Failed to save Day ${day}`)
        setTimeout(() => setSaveError(null), 3500)
      }
    },
    [id, valuesMap],
  )

  const handleRowClick = (day: number) => {
    if (isArrangeMode) return
    const current = valuesMap[day]
    setEditingText(current !== null && current !== undefined ? String(current) : '')
    setEditingDay(day)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent, day: number) => {
    if (e.key === 'Enter') {
      commitEdit(day, editingText)
    } else if (e.key === 'Escape') {
      setEditingDay(null)
    }
  }

  return {
    valuesMap,
    saveError,
    editingDay,
    editingText,
    setEditingText,
    inputRef,
    commitEdit,
    handleRowClick,
    handleInputKeyDown,
    setEditingDay,
  }
}

// ── Desktop / Main Component ──────────────────────────────────
export function NumberLogDesktop({
  id,
  config,
  isArrangeMode,
}: WidgetRenderProps<NumberLogConfig>) {
  const label = config?.label || 'Number Log'
  const unit = config?.unit || ''
  const {
    valuesMap,
    saveError,
    editingDay,
    editingText,
    setEditingText,
    inputRef,
    commitEdit,
    handleRowClick,
    handleInputKeyDown,
  } = useNumberLogEntries(id, isArrangeMode)

  return (
    <div className="relative w-full h-full flex flex-col bg-transparent select-none overflow-hidden">
      {/* Red-Pen Save Error Feedback */}
      {saveError && (
        <div
          className="absolute top-1 right-1 z-40 bg-paper border border-redpen px-1.5 py-0.5 rounded shadow text-redpen font-hand text-[9px]"
          role="alert"
        >
          {saveError}
        </div>
      )}

      {/* Header: 32px */}
      <div className="h-[32px] flex items-center justify-between px-2 border-b border-ink/25 shrink-0">
        <span className="font-hand text-[11px] font-bold text-ink truncate">
          {label}
        </span>
        {unit && (
          <span className="font-hand text-[10px] text-ink/70 italic shrink-0 ml-1">
            {unit}
          </span>
        )}
      </div>

      {/* 12px padding row then 31 rows flex-distributed */}
      <div className="flex-1 flex flex-col pt-[6px] pb-[6px] overflow-hidden">
        {Array.from({ length: 31 }, (_, i) => {
          const day = i + 1
          const value = valuesMap[day]
          const hasValue = value !== null && value !== undefined
          const isEditing = editingDay === day

          if (isEditing) {
            return (
              <div
                key={day}
                className="flex-1 min-h-[14px] flex items-center border-b border-ink/10 px-1.5"
              >
                {/* Day number */}
                <span className="w-[18px] shrink-0 font-hand text-[10px] text-ink/70 text-right pr-1 pointer-events-none">
                  {day}
                </span>
                <input
                  ref={inputRef}
                  type="number"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onBlur={() => commitEdit(day, editingText)}
                  onKeyDown={(e) => handleInputKeyDown(e, day)}
                  aria-label={`Day ${day}: ${label}`}
                  className="flex-1 h-full bg-transparent font-hand text-[11px] text-ink focus:outline-none border-b border-ink/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )
          }

          return (
            <button
              key={day}
              type="button"
              disabled={isArrangeMode}
              className={`w-full flex-1 min-h-[14px] flex items-center border-b border-ink/10 px-1.5 group cursor-pointer text-left ${
                isArrangeMode ? 'pointer-events-none' : 'hover:bg-ink/[0.025]'
              }`}
              onClick={() => handleRowClick(day)}
              aria-label={`Day ${day}${hasValue ? `: ${value} ${unit}` : ': unrecorded'}`}
            >
              {/* Day number */}
              <span className="w-[18px] shrink-0 font-hand text-[10px] text-ink/70 text-right pr-1 pointer-events-none">
                {day}
              </span>

              <span
                className={`flex-1 font-hand text-[11px] ${
                  hasValue ? 'text-ink' : 'text-ink/70 opacity-40 italic group-hover:opacity-70'
                }`}
              >
                {hasValue ? value : '—'}
              </span>

              {/* Unit label beside value */}
              {hasValue && unit && (
                <span className="font-hand text-[9px] text-ink/70 shrink-0 ml-0.5">
                  {unit}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Mobile Render Component (Task 11) ────────────────────────
export function NumberLogMobile({
  id,
  config,
  isArrangeMode,
  year,
  month,
  mobileSubPage = 0,
}: WidgetRenderProps<NumberLogConfig>) {
  const label = config?.label || 'Number Log'
  const unit = config?.unit || ''
  const {
    valuesMap,
    saveError,
    editingDay,
    editingText,
    setEditingText,
    inputRef,
    commitEdit,
    handleRowClick,
    handleInputKeyDown,
    setEditingDay,
  } = useNumberLogEntries(id, isArrangeMode)

  const daysInMonth =
    year && month ? new Date(year, month, 0).getDate() : 31

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
      {/* Save Error */}
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
          <div className="flex items-baseline gap-2">
            <h2 className="font-hand text-base font-bold text-ink">{label}</h2>
            {unit && (
              <span className="font-hand text-xs text-ink/70">({unit})</span>
            )}
          </div>
        ) : (
          <span className="font-hand text-sm text-ink/70 italic">(cont.)</span>
        )}
        <span className="font-hand text-xs text-ink/70">
          Days {startDay}–{endDay}
        </span>
      </div>

      {/* Rows with >= 44px tap targets */}
      <div className="flex-1 flex flex-col divide-y divide-ink/10">
        {daysArray.map((day) => {
          const value = valuesMap[day]
          const isEditing = editingDay === day
          const hasValue = value !== null && value !== undefined

          if (isEditing) {
            return (
              <div
                key={day}
                className="flex items-center min-h-[44px] h-[44px] px-1 border-b border-ink/10"
              >
                {/* Day label */}
                <span className="w-8 shrink-0 font-hand text-xs text-ink/70 text-right pr-2 select-none pointer-events-none">
                  {day}.
                </span>
                <input
                  ref={inputRef}
                  type="number"
                  step="any"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onBlur={() => commitEdit(day, editingText)}
                  onKeyDown={(e) => handleInputKeyDown(e, day)}
                  aria-label={`Day ${day}: ${label}`}
                  className="flex-1 h-[36px] bg-transparent font-hand text-sm text-ink focus:outline-none border-b border-ink/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )
          }

          return (
            <button
              key={day}
              type="button"
              disabled={isArrangeMode}
              onClick={() => handleRowClick(day)}
              aria-label={`Day ${day}${hasValue ? `: ${value} ${unit}` : ': unrecorded'}`}
              className="w-full flex items-center min-h-[44px] h-[44px] px-1 hover:bg-ink/[0.03] transition-colors cursor-pointer select-none text-left"
            >
              {/* Day label */}
              <span className="w-8 shrink-0 font-hand text-xs text-ink/70 text-right pr-2 select-none pointer-events-none">
                {day}.
              </span>

              {/* Value display */}
              <div className="flex items-baseline gap-1.5 w-full h-full flex items-center">
                <span
                  className={`font-hand text-sm ${
                    hasValue
                      ? 'text-ink font-bold'
                      : 'text-ink/70 opacity-40 italic'
                  }`}
                >
                  {hasValue ? value : '—'}
                </span>
                {hasValue && unit && (
                  <span className="font-hand text-xs text-ink/70">
                    {unit}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Widget Definition ─────────────────────────────────────────
export const numberLogWidgetDefinition: WidgetDefinition<typeof numberLogConfigSchema> = {
  id: 'number-log',
  displayName: 'Number Log',
  group: 'Track',
  defaultSize: { w: 6, h: 24 },
  minSize: { w: 4, h: 18 },
  schema: numberLogConfigSchema,
  component: NumberLogDesktop,
  mobileComponent: NumberLogMobile,
  icon: NumberLogIcon,
  getMobilePageCount: () => 3,
}
