'use client'

/**
 * Mood Tracker Widget
 * Memorable Moments — Phase 5 / Task 9 Batch B
 *
 * Rules:
 * - Group: 'Track'
 * - Default size: 22x4 (22 cols × 4 rows = 484px × 88px)
 * - Min size: 14x4
 * - Five hand-drawn SVG faces (1=very sad, 2=sad, 3=neutral, 4=happy, 5=very happy)
 * - No emoji; all faces are unique hand-drawn SVGs (L13)
 * - Tap a face to record mood for the active day
 * - Shows a row of 31 small faces, one per day, for the month
 * - Active day: today if current month, else day 1 (DayStepper)
 * - Layout: 16px header+stepper row | 32px face picker row | 40px 31-day row = 88px total
 * - Stored in entries table per day: { mood: 1..5 }
 * - Palette L6 only, fonts L5 only, no emoji, hand-drawn SVG icon (L13)
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { z } from 'zod'
import type { WidgetDefinition, WidgetRenderProps } from '../types'
import {
  DayStepper,
  getDefaultActiveDay,
  getDaysInMonth,
} from '../shared/DayStepper'
import { moodTrackerEntrySchema } from '../entryActions'
import { saveWidgetEntryAndBump, getWidgetEntriesWithCache } from '../entryHelpers'

// ── Zod Config Schema ─────────────────────────────────────────
export const moodTrackerConfigSchema = z.object({
  title: z.string().default('Mood'),
})

export type MoodTrackerConfig = z.infer<typeof moodTrackerConfigSchema>

// ── Hand-Drawn SVG Faces (1–5) ────────────────────────────────
/**
 * Returns a hand-drawn face SVG for mood 1..5.
 * 1 = very sad, 2 = sad, 3 = neutral, 4 = happy, 5 = very happy.
 * All faces are unique in expression — no emoji, strictly L13.
 */
function MoodFace({
  mood,
  size = 24,
  className = '',
}: {
  mood: 1 | 2 | 3 | 4 | 5
  size?: number
  className?: string
}) {
  // Face circle is always present; expressions differ per mood
  const faceColor = {
    1: '#b3261e', // very sad → red pen
    2: '#702028', // sad → oxblood
    3: '#1c2433', // neutral → ink
    4: '#b9895a', // happy → kraft
    5: '#d8b45a', // very happy → gold
  }[mood]

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Face circle */}
      <path
        d="M 12 3 C 18 3, 21 7, 21 12 C 21 17, 17.5 21, 12 21 C 6.5 21, 3 17, 3 12 C 3 7, 6.5 3, 12 3"
        stroke={faceColor}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Eyes — all five have different eye expressions */}
      {mood === 1 && (
        // Very sad: downward-curved arcs for eyebrows (creased)
        <>
          <path d="M 8 9.5 C 9 8.5, 10 8.5, 10.5 9.5" stroke={faceColor} strokeWidth="1.3" strokeLinecap="round" />
          <path d="M 13.5 9.5 C 14 8.5, 15 8.5, 16 9.5" stroke={faceColor} strokeWidth="1.3" strokeLinecap="round" />
          {/* Teardrop */}
          <path d="M 9 11 C 9 12, 8.3 12.5, 8.3 11.5 C 8.3 10.8, 9 10.5, 9 11" stroke={faceColor} strokeWidth="1" strokeLinecap="round" />
        </>
      )}
      {mood === 2 && (
        // Sad: closed/small dots
        <>
          <circle cx="9" cy="10" r="1" fill={faceColor} />
          <circle cx="15" cy="10" r="1" fill={faceColor} />
        </>
      )}
      {mood === 3 && (
        // Neutral: simple horizontal dashes (sleepy/blank)
        <>
          <path d="M 8 10 L 10.5 10" stroke={faceColor} strokeWidth="1.4" strokeLinecap="round" />
          <path d="M 13.5 10 L 16 10" stroke={faceColor} strokeWidth="1.4" strokeLinecap="round" />
        </>
      )}
      {mood === 4 && (
        // Happy: open wide dots
        <>
          <circle cx="9" cy="10" r="1.2" fill={faceColor} />
          <circle cx="15" cy="10" r="1.2" fill={faceColor} />
        </>
      )}
      {mood === 5 && (
        // Very happy: curved upward arcs (raised eyebrows)
        <>
          <path d="M 8 10 C 8.5 8.5, 10 8.5, 10.5 10" stroke={faceColor} strokeWidth="1.3" strokeLinecap="round" />
          <path d="M 13.5 10 C 14 8.5, 15.5 8.5, 16 10" stroke={faceColor} strokeWidth="1.3" strokeLinecap="round" />
          {/* Sparkle */}
          <path d="M 18 6 L 18.5 7 M 18.5 5.5 L 17.5 6.5" stroke={faceColor} strokeWidth="1" strokeLinecap="round" />
        </>
      )}

      {/* Mouth — unique per mood */}
      {mood === 1 && (
        // Very sad: deep frown
        <path
          d="M 8.5 16 C 10 14, 14 14, 15.5 16"
          stroke={faceColor}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      )}
      {mood === 2 && (
        // Sad: slight frown
        <path
          d="M 8.5 16 C 10 15, 14 15, 15.5 16"
          stroke={faceColor}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      )}
      {mood === 3 && (
        // Neutral: flat line
        <path
          d="M 9 15.5 C 11 15.3, 13 15.6, 15 15.5"
          stroke={faceColor}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      )}
      {mood === 4 && (
        // Happy: gentle smile
        <path
          d="M 8.5 15 C 10 17, 14 17, 15.5 15"
          stroke={faceColor}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      )}
      {mood === 5 && (
        // Very happy: big open smile
        <path
          d="M 8 14.5 C 9.5 18, 14.5 18, 16 14.5"
          stroke={faceColor}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}

// ── Hand-Drawn SVG Icon (for Widget Library card) ─────────────
export function MoodTrackerIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      {/* Three faces in a row: sad, neutral, happy */}
      {/* Sad face (left) */}
      <circle cx="5" cy="12" r="3.5" strokeWidth="1.3" />
      <circle cx="4" cy="11" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="6" cy="11" r="0.5" fill="currentColor" stroke="none" />
      <path d="M 3.5 13.5 C 4.2 13, 5.8 13, 6.5 13.5" strokeWidth="1.1" strokeLinecap="round" />

      {/* Neutral face (center) */}
      <circle cx="12" cy="12" r="3.5" strokeWidth="1.3" />
      <circle cx="11" cy="11" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="13" cy="11" r="0.5" fill="currentColor" stroke="none" />
      <path d="M 10.5 13.5 L 13.5 13.5" strokeWidth="1.1" strokeLinecap="round" />

      {/* Happy face (right) */}
      <circle cx="19" cy="12" r="3.5" strokeWidth="1.3" />
      <circle cx="18" cy="11" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="20" cy="11" r="0.5" fill="currentColor" stroke="none" />
      <path d="M 17.5 13 C 18.2 14.5, 19.8 14.5, 20.5 13" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}

const MOODS = [1, 2, 3, 4, 5] as const
type MoodValue = (typeof MOODS)[number]

const MOOD_LABELS: Record<MoodValue, string> = {
  1: 'Very sad',
  2: 'Sad',
  3: 'Neutral',
  4: 'Happy',
  5: 'Very happy',
}

// ── Desktop / Main Component ──────────────────────────────────
export function MoodTrackerDesktop({
  id,
  config,
  year,
  month,
  isArrangeMode,
}: WidgetRenderProps<MoodTrackerConfig>) {
  const title = config?.title || 'Mood'

  const defaultDay = useMemo(() => getDefaultActiveDay(year, month), [year, month])
  const maxDays = useMemo(() => getDaysInMonth(year, month), [year, month])
  const [activeDay, setActiveDay] = useState(defaultDay)

  // Map of day -> mood (1..5)
  const [moodsMap, setMoodsMap] = useState<Record<number, MoodValue>>({})
  const [saveError, setSaveError] = useState<string | null>(null)

  // Load entries from DB
  useEffect(() => {
    let cancelled = false
    async function load() {
      const res = await getWidgetEntriesWithCache(id)
      if (!cancelled && res.success && res.data) {
        const next: Record<number, MoodValue> = {}
        for (const row of res.data) {
          const parsed = moodTrackerEntrySchema.safeParse(row.value)
          if (parsed.success) {
            next[row.day] = parsed.data.mood as MoodValue
          }
        }
        setMoodsMap(next)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id])

  // Record mood for active day
  const selectMood = useCallback(
    async (mood: MoodValue) => {
      if (isArrangeMode) return
      const prevMood = moodsMap[activeDay]

      // Optimistic update
      setMoodsMap((prev) => ({ ...prev, [activeDay]: mood }))

      const res = await saveWidgetEntryAndBump(id, activeDay, { mood })

      if (!res.success) {
        // Rollback on error
        setMoodsMap((prev) => {
          const next = { ...prev }
          if (prevMood === undefined) {
            delete next[activeDay]
          } else {
            next[activeDay] = prevMood
          }
          return next
        })
        setSaveError('Save failed')
        setTimeout(() => setSaveError(null), 3000)
      }
    },
    [id, activeDay, moodsMap, isArrangeMode],
  )

  const activeMood = moodsMap[activeDay]

  /**
   * Layout (88px total height):
   *   Row 1: 16px — title + DayStepper
   *   Row 2: 36px — five large face picker buttons
   *   Row 3: 36px — 31 small daily faces
   */
  return (
    <div className="relative w-full h-full flex flex-col bg-transparent select-none overflow-hidden">
      {/* Red-Pen Save Error Feedback */}
      {saveError && (
        <div
          className="absolute top-0 right-2 z-40 bg-paper border border-redpen px-1.5 py-0.5 rounded shadow text-redpen font-hand text-[9px]"
          role="alert"
        >
          {saveError}
        </div>
      )}

      {/* Row 1: 16px — Title + DayStepper */}
      <div className="h-[16px] flex items-center justify-between px-2 border-b border-ink/20 shrink-0">
        <span className="font-hand text-[10px] font-bold text-ink tracking-wide">
          {title}
        </span>
        <DayStepper
          day={activeDay}
          maxDays={maxDays}
          onChange={setActiveDay}
          className="scale-75 origin-right"
        />
      </div>

      {/* Row 2: 36px — Five face picker buttons */}
      <div className="h-[36px] flex items-center justify-center gap-1 px-2 border-b border-ink/15 shrink-0">
        {MOODS.map((mood) => {
          const isSelected = activeMood === mood
          return (
            <button
              key={mood}
              type="button"
              disabled={isArrangeMode}
              onClick={() => selectMood(mood)}
              aria-label={`${MOOD_LABELS[mood]}${isSelected ? ' (selected)' : ''}`}
              aria-pressed={isSelected}
              title={MOOD_LABELS[mood]}
              className={`w-[26px] h-[26px] flex items-center justify-center rounded-full transition-all cursor-pointer ${
                isSelected
                  ? 'ring-1 ring-ink/40 bg-ink/[0.06] scale-110'
                  : 'hover:bg-ink/[0.04] hover:scale-105'
              } ${isArrangeMode ? 'pointer-events-none opacity-70' : ''}`}
            >
              <MoodFace mood={mood} size={22} />
            </button>
          )
        })}
      </div>

      {/* Row 3: 36px — 31 small daily faces */}
      <div className="flex-1 flex items-center px-1 gap-px overflow-hidden">
        {Array.from({ length: 31 }, (_, i) => {
          const day = i + 1
          const dayMood = moodsMap[day]
          const isToday = day === activeDay

          return (
            <button
              key={day}
              type="button"
              disabled={isArrangeMode}
              onClick={() => setActiveDay(day)}
              aria-label={`Day ${day}${dayMood ? `: ${MOOD_LABELS[dayMood]}` : ''}`}
              title={`Day ${day}${dayMood ? `: ${MOOD_LABELS[dayMood]}` : ''}`}
              className={`flex-1 h-full flex flex-col items-center justify-center gap-0 cursor-pointer transition-all rounded-xs ${
                isToday ? 'bg-highlighter/25 ring-1 ring-highlighter/50' : 'hover:bg-ink/[0.03]'
              } ${isArrangeMode ? 'pointer-events-none' : ''}`}
            >
              {dayMood ? (
                <MoodFace mood={dayMood} size={14} />
              ) : (
                // Empty day: faint circle placeholder
                <svg
                  viewBox="0 0 14 14"
                  width="14"
                  height="14"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="7"
                    cy="7"
                    r="5"
                    stroke="#1c2433"
                    strokeWidth="0.8"
                    strokeOpacity="0.18"
                  />
                </svg>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Mobile Render Component (Task 11 placeholder) ─────────────
export function MoodTrackerMobile(props: WidgetRenderProps<MoodTrackerConfig>) {
  return <MoodTrackerDesktop {...props} />
}

// ── Widget Definition ─────────────────────────────────────────
export const moodTrackerWidgetDefinition: WidgetDefinition<typeof moodTrackerConfigSchema> = {
  id: 'mood-tracker',
  displayName: 'Mood Tracker',
  group: 'Track',
  defaultSize: { w: 22, h: 4 },
  minSize: { w: 14, h: 4 },
  schema: moodTrackerConfigSchema,
  component: MoodTrackerDesktop,
  mobileComponent: MoodTrackerMobile,
  icon: MoodTrackerIcon,
}
