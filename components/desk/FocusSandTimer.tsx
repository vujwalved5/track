'use client'

import React, { useState, useEffect, useRef } from 'react'

interface FocusSandTimerProps {
  variant?: 'desktop' | 'mobile'
}

type DurationMinutes = 15 | 25 | 45

export function FocusSandTimer({ variant = 'desktop' }: FocusSandTimerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [duration, setDuration] = useState<DurationMinutes | null>(null)
  const [secondsLeft, setSecondsLeft] = useState<number>(0)
  const [isDone, setIsDone] = useState(false)
  const [isReducedMotion, setIsReducedMotion] = useState(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      setIsReducedMotion(mediaQuery.matches)
      const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches)
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
  }, [])

  useEffect(() => {
    if (duration !== null && secondsLeft > 0) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!)
            setIsDone(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [duration, secondsLeft > 0])

  const handleStartTimer = (mins: DurationMinutes) => {
    setDuration(mins)
    setSecondsLeft(mins * 60)
    setIsDone(false)
    setIsOpen(false)
  }

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setDuration(null)
    setSecondsLeft(0)
    setIsDone(false)
  }

  const toggleOpen = () => {
    if (isDone) {
      handleReset()
      setIsOpen(true)
    } else {
      setIsOpen((prev) => !prev)
    }
  }

  const isRunning = duration !== null && secondsLeft > 0 && !isDone
  const totalSeconds = duration ? duration * 60 : 1
  const progressFraction = duration ? 1 - secondsLeft / totalSeconds : 0

  // Calculate SVG sand levels
  // Top sand height: starts at 18px (full), shrinks to 0px
  const topSandHeight = Math.max(0, 18 * (1 - progressFraction))
  // Bottom sand height: starts at 0px (empty), grows to 18px
  const bottomSandHeight = Math.min(18, 18 * progressFraction)

  const minutesRemaining = Math.ceil(secondsLeft / 60)

  return (
    <div
      data-desk-object="sand-timer"
      className="relative select-none z-30"
    >
      {/* ── Selection Paper Tag (15, 25, 45 minutes) ── */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Choose focus duration"
          className="absolute bottom-[calc(100%+8px)] left-0 bg-paper text-ink border border-kraft/40 rounded-sm shadow-paper-card p-2 sm:p-2.5 z-40 animate-sheet-slide-in -rotate-1"
          style={{ width: '160px' }}
        >
          {/* Small Paper Clip / Pin visual at top */}
          <div
            className="absolute -top-2 left-4 w-4 h-2.5 border-t-2 border-r-2 border-l-2 border-kraft rounded-t-sm pointer-events-none"
            aria-hidden="true"
          />

          <p className="font-hand font-bold text-xs text-ink/80 mb-1.5 pb-1 border-b border-ink/15 text-center">
            Focus sandglass
          </p>

          <div className="flex items-center justify-between gap-1">
            {([15, 25, 45] as const).map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => handleStartTimer(mins)}
                className="flex-1 min-w-[44px] min-h-[44px] flex flex-col items-center justify-center font-hand text-xs text-ink bg-kraft/15 hover:bg-gold/40 border border-ink/20 rounded-sm transition-colors cursor-pointer active:translate-y-px"
                aria-label={`Set focus timer for ${mins} minutes`}
              >
                <span className="font-bold text-sm leading-none">{mins}</span>
                <span className="text-[10px] text-ink/75 leading-tight">min</span>
              </button>
            ))}
          </div>

          {isRunning && (
            <button
              type="button"
              onClick={handleReset}
              className="w-full mt-2 min-h-[44px] py-1 text-center font-hand text-xs text-redpen hover:underline cursor-pointer flex items-center justify-center"
            >
              put away glass
            </button>
          )}
        </div>
      )}

      {/* ── Hourglass Button Target ── */}
      <button
        type="button"
        onClick={toggleOpen}
        aria-label={
          isDone
            ? 'Focus session complete. Tap to reset.'
            : isRunning
            ? `Focus timer running: ${minutesRemaining} minutes remaining. Tap to open controls.`
            : 'Focus sand timer. Tap to set duration.'
        }
        className={`group relative flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlighter focus-visible:ring-offset-2 focus-visible:ring-offset-desk rounded-md p-1.5 transition-transform duration-200 hover:scale-105 active:scale-95 ${
          variant === 'mobile' ? 'min-w-[44px] min-h-[44px]' : 'min-w-[48px] min-h-[58px]'
        }`}
      >
        {/* Tooltip / Done indicator in Kalam handwriting */}
        {isDone ? (
          <span
            className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap font-hand font-bold text-sm text-oxblood bg-paper/95 border border-oxblood/40 px-2 py-0.5 rounded shadow-sm animate-bounce"
            style={{ animationDuration: '2s' }}
          >
            done
          </span>
        ) : isReducedMotion && isRunning ? (
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap font-hand text-xs text-ink bg-paper/95 border border-ink/30 px-2 py-0.5 rounded shadow-sm">
            {minutesRemaining}m left
          </span>
        ) : (
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap font-hand text-xs text-ink bg-paper/95 border border-ink/30 px-2 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150 pointer-events-none">
            {isRunning ? `${minutesRemaining}m left` : 'sand timer'}
          </span>
        )}

        {/* ── Hand-Drawn SVG Hourglass ── */}
        <div
          className={`relative ${isDone && !isReducedMotion ? 'animate-sandglass-tip' : ''}`}
        >
          <svg
            width="34"
            height="52"
            viewBox="0 0 34 52"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="filter drop-shadow-[0_2px_4px_rgba(15,12,10,0.45)]"
            aria-hidden="true"
          >
            {/* Top Turned Brass Cap */}
            <path
              d="M 5 4 C 5 2.5, 29 2.5, 29 4 L 27 7 C 27 7.5, 7 7.5, 7 7 Z"
              fill="#d8b45a"
              stroke="#211b16"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {/* Brass Cap Highlight */}
            <line
              x1="9"
              y1="4.5"
              x2="25"
              y2="4.5"
              stroke="#f4eddc"
              strokeWidth="0.8"
              opacity="0.6"
            />

            {/* Bottom Turned Brass Base */}
            <path
              d="M 7 45 C 7 44.5, 27 44.5, 27 45 L 29 48 C 29 49.5, 5 49.5, 5 48 Z"
              fill="#d8b45a"
              stroke="#211b16"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {/* Brass Base Highlight */}
            <line
              x1="9"
              y1="47.5"
              x2="25"
              y2="47.5"
              stroke="#f4eddc"
              strokeWidth="0.8"
              opacity="0.6"
            />

            {/* Brass Support Pillars (Left & Right) */}
            <rect
              x="5.5"
              y="7"
              width="2"
              height="38"
              rx="0.8"
              fill="#b9895a"
              stroke="#211b16"
              strokeWidth="0.8"
            />
            <rect
              x="26.5"
              y="7"
              width="2"
              height="38"
              rx="0.8"
              fill="#b9895a"
              stroke="#211b16"
              strokeWidth="0.8"
            />

            {/* Glass Outer Shell (Upper bulb, neck, lower bulb) */}
            <path
              d="M 8 7 C 8 18, 14 24, 15 26 C 14 28, 8 34, 8 45 L 26 45 C 26 34, 20 28, 19 26 C 20 24, 26 18, 26 7 Z"
              fill="#f4eddc"
              fillOpacity="0.18"
              stroke="#211b16"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />

            {/* Glass Specular Highlights */}
            <path
              d="M 10 10 C 9.5 15, 12 21, 13 23"
              stroke="#f4eddc"
              strokeWidth="0.8"
              strokeLinecap="round"
              opacity="0.55"
            />
            <path
              d="M 10 42 C 9.5 37, 12 31, 13 29"
              stroke="#f4eddc"
              strokeWidth="0.8"
              strokeLinecap="round"
              opacity="0.55"
            />

            {/* Top Sand Level */}
            {!isReducedMotion && isRunning && topSandHeight > 0 && (
              <path
                d={`M 10 ${25 - topSandHeight} C 12 ${25 - topSandHeight - 1}, 22 ${
                  25 - topSandHeight - 1
                }, 24 ${25 - topSandHeight} L 18 24.5 L 16 24.5 Z`}
                fill="#d8b45a"
                stroke="#b9895a"
                strokeWidth="0.6"
              />
            )}
            {!isRunning && !isDone && (
              // Idle state: top bulb is full of sand
              <path
                d="M 9.5 10 C 12 8.5, 22 8.5, 24.5 10 C 23.5 16, 19 23, 17 25 C 15 23, 10.5 16, 9.5 10 Z"
                fill="#d8b45a"
                stroke="#b9895a"
                strokeWidth="0.6"
              />
            )}

            {/* Falling Sand Stream in the Neck */}
            {!isReducedMotion && isRunning && (
              <line
                x1="17"
                y1="24"
                x2="17"
                y2="43"
                stroke="#d8b45a"
                strokeWidth="1.1"
                strokeDasharray="2 1"
              />
            )}

            {/* Bottom Sand Mound */}
            {!isReducedMotion && isRunning && bottomSandHeight > 0 && (
              <path
                d={`M 10 44.5 C 13 ${45 - bottomSandHeight}, 21 ${
                  45 - bottomSandHeight
                }, 24 44.5 Z`}
                fill="#d8b45a"
                stroke="#b9895a"
                strokeWidth="0.6"
              />
            )}
            {isDone && (
              // Done state: bottom bulb is full
              <path
                d="M 9.5 44 C 12 36, 22 36, 24.5 44 Z"
                fill="#d8b45a"
                stroke="#b9895a"
                strokeWidth="0.6"
              />
            )}
          </svg>
        </div>
      </button>
    </div>
  )
}
