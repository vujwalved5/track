'use client'

/**
 * Shared DayStepper Component
 * Memorable Moments — Phase 5 / Task 9
 *
 * Rules:
 * - Hand-drawn SVG prev/next arrows (L13, no emoji)
 * - Kalam font (L5)
 * - Palette strictly L6
 * - No dropdowns, no date pickers (Correction 2)
 */

import React from 'react'

export interface DayStepperProps {
  day: number
  maxDays?: number
  onChange: (newDay: number) => void
  className?: string
  labelPrefix?: string
}

/**
 * Returns today's day of month if viewing current year & month, otherwise day 1.
 */
export function getDefaultActiveDay(year?: number, month?: number): number {
  if (!year || !month) return 1
  const today = new Date()
  const isCurrentYear = today.getFullYear() === year
  const isCurrentMonth = today.getMonth() + 1 === month
  return isCurrentYear && isCurrentMonth ? today.getDate() : 1
}

/**
 * Returns number of days in month (28..31), default 31.
 */
export function getDaysInMonth(year?: number, month?: number): number {
  if (!year || !month) return 31
  return new Date(year, month, 0).getDate()
}

export function DayStepper({
  day,
  maxDays = 31,
  onChange,
  className = '',
  labelPrefix = 'Day',
}: DayStepperProps) {
  const canGoPrev = day > 1
  const canGoNext = day < maxDays

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (canGoPrev) onChange(day - 1)
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (canGoNext) onChange(day + 1)
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 font-hand select-none ${className}`}
      aria-label={`Selected day: ${day}`}
    >
      {/* Prev Day Hand-Drawn Arrow */}
      <button
        type="button"
        onClick={handlePrev}
        disabled={!canGoPrev}
        aria-label="Previous day"
        className={`w-4 h-4 flex items-center justify-center rounded-xs transition-opacity ${
          canGoPrev
            ? 'text-ink hover:text-redpen cursor-pointer'
            : 'text-ink/70 opacity-40 cursor-not-allowed'
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
            d="M 10.5 3.5 C 8.5 6, 6 8, 4.5 8 C 6 8, 8.5 10, 10.5 12.5"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Day label */}
      <span className="text-xs text-ink font-semibold tracking-wide min-w-[38px] text-center">
        {labelPrefix} {day}
      </span>

      {/* Next Day Hand-Drawn Arrow */}
      <button
        type="button"
        onClick={handleNext}
        disabled={!canGoNext}
        aria-label="Next day"
        className={`w-4 h-4 flex items-center justify-center rounded-xs transition-opacity ${
          canGoNext
            ? 'text-ink hover:text-redpen cursor-pointer'
            : 'text-ink/70 opacity-40 cursor-not-allowed'
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
            d="M 5.5 3.5 C 7.5 6, 10 8, 11.5 8 C 10 8, 7.5 10, 5.5 12.5"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  )
}
