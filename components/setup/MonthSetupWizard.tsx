'use client'

import React, { useState, useEffect } from 'react'
import type { HabitConfig, MonthSetupConfig, PaperStyle, StartingLayout, TrackedNumbersConfig } from '@/types/db'
import type { WidgetData } from '@/components/widgets/types'
import { completeMonthSetup, type PreviousMonthData } from './setupActions'

interface MonthSetupWizardProps {
  year: number
  month: number
  monthName: string
  prevMonthData: PreviousMonthData
  onComplete: (
    paperLeft: PaperStyle,
    paperRight: PaperStyle,
    createdWidgets?: WidgetData[],
    monthId?: string,
    setupConfig?: MonthSetupConfig,
  ) => void
}

const PAPER_OPTIONS: Array<{ type: PaperStyle; label: string }> = [
  { type: 'dotted', label: 'Dotted' },
  { type: 'squared', label: 'Squared' },
  { type: 'lined', label: 'Lined' },
  { type: 'blank', label: 'Blank' },
]

function HandDrawnCheckboxVisual({
  checked,
  color = 'ink',
}: {
  checked: boolean
  color?: 'ink' | 'redpen'
}) {
  const strokeColor = color === 'redpen' ? '#b3261e' : '#1c2433'

  return (
    <span className="relative w-5 h-5 flex items-center justify-center select-none pointer-events-none" aria-hidden="true">
      <svg
        viewBox="0 0 20 20"
        className="w-5 h-5 overflow-visible"
        style={{ color: strokeColor }}
        aria-hidden="true"
      >
        {/* Slightly uneven hand-drawn box */}
        <path
          d="M 2.5 3.2 C 7.5 2.4, 13 2.7, 17.2 3.1 C 17.8 7.6, 17.4 12.8, 17.1 16.9 C 12.8 17.4, 7.2 16.9, 2.8 17.1 C 2.3 12.8, 2.7 7.2, 2.5 3.2 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        {/* Hand-drawn checkmark */}
        {checked && (
          <path
            d="M 4.5 10.2 C 6.5 12.2, 7.8 14.1, 8.8 15.6 C 11.2 11.1, 13.8 6.9, 16.8 4.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </span>
  )
}

// Hand-drawn SVG tick box component (L13, correction 4: SVG not switches)
function HandDrawnCheckbox({
  checked,
  onChange,
  color = 'ink',
  ariaLabel,
}: {
  checked: boolean
  onChange: () => void
  color?: 'ink' | 'redpen'
  ariaLabel?: string
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onChange}
      className="relative w-5 h-5 flex items-center justify-center cursor-pointer select-none"
    >
      <HandDrawnCheckboxVisual checked={checked} color={color} />
    </button>
  )
}

// Hand-drawn miniature paper preview for Step 2
function MiniPaperPreview({ type, selected }: { type: PaperStyle; selected: boolean }) {
  return (
    <div
      className={`w-14 h-16 rounded border transition-all relative overflow-hidden flex flex-col justify-end p-1 select-none ${
        selected
          ? 'border-ink bg-paper shadow-[0_2px_6px_rgba(28,36,51,0.25)] ring-2 ring-gold'
          : 'border-ink/30 bg-paper/60 hover:border-ink/60'
      }`}
    >
      <div className="absolute inset-0 pointer-events-none">
        {type === 'dotted' && (
          <div
            className="w-full h-full"
            style={{
              backgroundImage: 'radial-gradient(#1c2433 1.2px, transparent 1.2px)',
              backgroundSize: '8px 8px',
              opacity: 0.45,
            }}
          />
        )}
        {type === 'squared' && (
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(28,36,51,0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(28,36,51,0.3) 1px, transparent 1px)',
              backgroundSize: '8px 8px',
            }}
          />
        )}
        {type === 'lined' && (
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                'linear-gradient(to bottom, rgba(28,36,51,0.3) 1px, transparent 1px)',
              backgroundSize: '100% 8px',
            }}
          />
        )}
      </div>
      <span className="text-[10px] font-hand text-ink text-center z-10 capitalize leading-tight">
        {type}
      </span>
    </div>
  )
}

function TurnOverArrow({ onClick, label = 'turn over' }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 font-hand text-sm text-ink hover:text-ink/75 transition-colors cursor-pointer group select-none"
    >
      <span>{label}</span>
      <svg
        className="w-4 h-4 text-ink transition-transform group-hover:translate-x-1"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M 4 12 C 9 11.5, 14 12, 19 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M 14 7 C 16 9.5, 18 11.5, 20 12 C 18 12.5, 16 14.5, 14 17"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

function TurnBackArrow({ onClick, label = 'turn back' }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 font-hand text-sm text-ink/70 hover:text-ink transition-colors cursor-pointer group select-none"
    >
      <svg
        className="w-4 h-4 text-ink/70 transition-transform group-hover:-translate-x-1"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M 20 12 C 15 12.5, 10 12, 5 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M 10 7 C 8 9.5, 6 11.5, 4 12 C 6 12.5, 8 14.5, 10 17"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{label}</span>
    </button>
  )
}

export function MonthSetupWizard({
  year,
  month,
  monthName,
  prevMonthData,
  onComplete,
}: MonthSetupWizardProps) {
  // Exactly 7 steps (1 to 7)
  const [step, setStep] = useState<number>(1)

  // Configuration state
  const [copyFromPrevious, setCopyFromPrevious] = useState(false)
  const [paperLeft, setPaperLeft] = useState<PaperStyle>('dotted')
  const [paperRight, setPaperRight] = useState<PaperStyle>('dotted')
  const [nextMonthNote, setNextMonthNote] = useState<string>('')
  const [habits, setHabits] = useState<HabitConfig[]>(() =>
    Array.from({ length: 12 }, () => ({ name: '', isRed: false })),
  )
  const [trackedNumbers, setTrackedNumbers] = useState<TrackedNumbersConfig>({
    weight: true,
    sleepScore: true,
    mood: true,
    custom: [
      { name: '', enabled: false },
      { name: '', enabled: false },
      { name: '', enabled: false },
    ],
  })
  const [startingLayout, setStartingLayout] = useState<StartingLayout>('journal')

  // Save execution state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Block Escape key dismiss (correction 5)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [])

  // Action handlers
  const handleChooseSameAsLast = () => {
    if (!prevMonthData.exists) return
    setCopyFromPrevious(true)
    if (prevMonthData.paperLeft) setPaperLeft(prevMonthData.paperLeft)
    if (prevMonthData.paperRight) setPaperRight(prevMonthData.paperRight)

    // Pre-fill habits
    if (prevMonthData.habits && prevMonthData.habits.length > 0) {
      const mergedHabits: HabitConfig[] = Array.from({ length: 12 }, (_, i) => {
        const existing = prevMonthData.habits![i]
        return existing ? { name: existing.name, isRed: existing.isRed } : { name: '', isRed: false }
      })
      setHabits(mergedHabits)
    }
    setStep(2)
  }

  const handleChooseFresh = () => {
    setCopyFromPrevious(false)
    setPaperLeft('dotted')
    setPaperRight('dotted')
    setStep(2)
  }

  const updateHabitName = (index: number, name: string) => {
    setHabits((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], name }
      return next
    })
  }

  const toggleHabitRed = (index: number) => {
    setHabits((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], isRed: !next[index].isRed }
      return next
    })
  }

  const updateCustomNumberName = (index: number, name: string) => {
    setTrackedNumbers((prev) => {
      const custom = [...prev.custom]
      custom[index] = { ...custom[index], name }
      return { ...prev, custom }
    })
  }

  const toggleCustomNumber = (index: number) => {
    setTrackedNumbers((prev) => {
      const custom = [...prev.custom]
      custom[index] = { ...custom[index], enabled: !custom[index].enabled }
      return { ...prev, custom }
    })
  }

  // Final step save
  const handleOpenMonth = async () => {
    setIsSubmitting(true)
    setErrorMessage(null)

    // Offline guard (Correction 3): Month Setup needs a connection
    if (typeof window !== 'undefined' && !navigator.onLine) {
      setErrorMessage('needs a connection')
      setIsSubmitting(false)
      return
    }

    try {
      const result = await completeMonthSetup({
        year,
        month,
        copyFromPrevious,
        paperLeft,
        paperRight,
        nextMonthNote,
        habits,
        trackedNumbers,
        startingLayout,
      })

      if (!result.success) {
        // Red-pen error message on sheet, keeps setup_done = false, stays on sheet (correction 2)
        setErrorMessage(result.error || 'Could not save month setup.')
        setIsSubmitting(false)
        return
      }

      // Success: notify parent
      onComplete(
        paperLeft,
        paperRight,
        result.widgets,
        result.monthId,
        result.setupConfig,
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save failed.'
      setErrorMessage(msg)
      setIsSubmitting(false)
    }
  }

  const filledHabitsCount = habits.filter((h) => h.name.trim().length > 0).length
  const redHabitsCount = habits.filter((h) => h.name.trim().length > 0 && h.isRed).length

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center pointer-events-auto"
      onClick={(e) => e.stopPropagation()} // Cannot be dismissed by clicking outside (correction 5)
    >
      {/* Loose card tucked into the book: paper colour, slight tilt, handwritten Kalam text */}
      <div
        role="region"
        aria-label="Month Setup Wizard"
        className="w-[520px] h-[590px] bg-paper text-ink rounded-[2px] p-7 flex flex-col justify-between shadow-[0_16px_40px_rgba(28,36,51,0.5),0_2px_8px_rgba(28,36,51,0.3)] border border-kraft/50 -rotate-1 animate-sheet-slide-in overflow-hidden select-none"
        style={{
          backgroundImage:
            'radial-gradient(#1c2433 0.8px, transparent 0.8px), repeating-linear-gradient(45deg, rgba(28,36,51,0.015) 0px, rgba(28,36,51,0.015) 2px, transparent 2px, transparent 4px)',
          backgroundSize: '22px 22px, auto',
        }}
      >
        {/* Sheet Top Ribbon / Step Indicator */}
        <div className="flex items-center justify-between border-b border-ink/20 pb-2">
          <span className="font-hand text-xs tracking-widest uppercase text-ink/70">
            {monthName} {year} — Setup Sheet
          </span>
          <span className="font-hand text-xs tracking-widest text-ink/70">
            Sheet {step} of 7
          </span>
        </div>

        {/* ════════════════════════════════════════════════════════
            STEP 1: START
            ════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="flex-1 flex flex-col justify-center py-4">
            <h2 className="font-hand text-2xl font-bold text-ink mb-1 text-center">
              Setting up {monthName}
            </h2>
            <p className="font-hand text-sm text-ink/80 text-center mb-6">
              Before this month can be opened, how would you like to set up its pages?
            </p>

            <div className="space-y-4 max-w-sm mx-auto w-full">
              {/* Option A: Use the same as last month */}
              <button
                type="button"
                disabled={!prevMonthData.exists}
                onClick={prevMonthData.exists ? handleChooseSameAsLast : undefined}
                className={`w-full p-4 rounded border transition-all text-left ${
                  prevMonthData.exists
                    ? 'border-ink bg-paper/80 hover:bg-kraft/10 cursor-pointer shadow-[1px_1px_4px_rgba(28,36,51,0.15)]'
                    : 'border-ink/25 bg-paper/40 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="font-hand font-bold text-base text-ink">
                  Use the same as last month
                </div>
                {prevMonthData.exists ? (
                  <p className="font-hand text-xs text-ink/75 mt-1">
                    Copies {prevMonthData.monthName}’s paper ({prevMonthData.paperLeft}/
                    {prevMonthData.paperRight}), {prevMonthData.habits?.length || 0} habits, and
                    widgets.
                  </p>
                ) : (
                  <p className="font-hand text-xs text-ink/70 mt-1 italic">
                    No earlier month yet. Guide to &quot;Set up fresh&quot;.
                  </p>
                )}
              </button>

              {/* Option B: Set up fresh */}
              <button
                type="button"
                onClick={handleChooseFresh}
                className="w-full p-4 rounded border border-ink bg-paper/80 hover:bg-kraft/10 cursor-pointer shadow-[1px_1px_4px_rgba(28,36,51,0.15)] transition-all text-left"
              >
                <div className="font-hand font-bold text-base text-ink">
                  Set up fresh
                </div>
                <p className="font-hand text-xs text-ink/75 mt-1">
                  Start with fresh paper choices, intentions, and habit selections.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            STEP 2: PAPER
            ════════════════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="flex-1 flex flex-col justify-center py-2">
            <h2 className="font-hand text-xl font-bold text-ink mb-1 text-center">
              Paper Texture
            </h2>
            <p className="font-hand text-xs text-ink/80 text-center mb-5">
              Choose the paper style for the left and right pages (dotted by default).
            </p>

            <div className="space-y-4">
              {/* Left Page Paper */}
              <div>
                <span className="font-hand text-xs font-bold text-ink uppercase tracking-wider block mb-1.5 text-center">
                  Left Page Paper
                </span>
                <div className="flex justify-center gap-3">
                  {PAPER_OPTIONS.map((opt) => (
                    <button
                      key={`left-${opt.type}`}
                      type="button"
                      onClick={() => setPaperLeft(opt.type)}
                      aria-label={`Left page: ${opt.type} paper${paperLeft === opt.type ? ' (selected)' : ''}`}
                      aria-pressed={paperLeft === opt.type}
                      className="cursor-pointer"
                    >
                      <MiniPaperPreview type={opt.type} selected={paperLeft === opt.type} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Page Paper */}
              <div>
                <span className="font-hand text-xs font-bold text-ink uppercase tracking-wider block mb-1.5 text-center">
                  Right Page Paper
                </span>
                <div className="flex justify-center gap-3">
                  {PAPER_OPTIONS.map((opt) => (
                    <button
                      key={`right-${opt.type}`}
                      type="button"
                      onClick={() => setPaperRight(opt.type)}
                      aria-label={`Right page: ${opt.type} paper${paperRight === opt.type ? ' (selected)' : ''}`}
                      aria-pressed={paperRight === opt.type}
                      className="cursor-pointer"
                    >
                      <MiniPaperPreview type={opt.type} selected={paperRight === opt.type} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            STEP 3: INTENTIONS
            ════════════════════════════════════════════════════════ */}
        {step === 3 && (
          <div className="flex-1 flex flex-col justify-center py-2">
            <h2 className="font-hand text-xl font-bold text-ink mb-1 text-center">
              Intentions
            </h2>
            <p className="font-hand text-xs text-ink/80 text-center mb-4">
              Read last month’s intention, then write what matters for {monthName}.
            </p>

            {/* Read previous month's next_month_note */}
            <div className="mb-4 bg-kraft/15 border border-kraft/40 rounded p-3 text-left">
              <span className="font-hand text-[11px] font-bold tracking-wider text-ink/70 block uppercase mb-1">
                Last month&apos;s note to self ({prevMonthData.monthName || 'Previous'}):
              </span>
              <p className="font-hand text-sm text-ink italic leading-relaxed">
                {prevMonthData.nextMonthNote && prevMonthData.nextMonthNote.trim()
                  ? `"${prevMonthData.nextMonthNote}"`
                  : 'No note left from last month.'}
              </p>
            </div>

            {/* Write this month's note */}
            <div className="text-left">
              <label
                htmlFor="next-month-note-input"
                className="font-hand text-xs font-bold text-ink uppercase tracking-wider block mb-1"
              >
                A note for next month:
              </label>
              <textarea
                id="next-month-note-input"
                value={nextMonthNote}
                onChange={(e) => setNextMonthNote(e.target.value)}
                placeholder="What will you carry forward or remember?"
                rows={4}
                className="w-full bg-paper/80 border-b border-ink/40 focus:border-ink font-hand text-sm text-ink p-2 resize-none outline-none leading-relaxed placeholder:text-ink/70"
              />
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            STEP 4: HABITS (All 12 fit without scrolling, correction 4)
            ════════════════════════════════════════════════════════ */}
        {step === 4 && (
          <div className="flex-1 flex flex-col justify-center py-1">
            <div className="text-center mb-2">
              <h2 className="font-hand text-lg font-bold text-ink leading-tight">
                Habits to Track
              </h2>
              <p className="font-hand text-[11px] text-ink/75 leading-tight">
                Up to 12 habits. Click the tick box to mark indulgence habits in{' '}
                <span className="text-redpen font-bold">red pen</span>.
              </p>
            </div>

            {/* 2 columns x 6 rows = 12 habits, tight 28px height, 0 scroll */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 max-w-lg mx-auto w-full">
              {habits.map((habit, idx) => (
                <div
                  key={`habit-slot-${idx}`}
                  className="flex items-center gap-1.5 h-7 border-b border-ink/15 pb-0.5"
                >
                  <span className="font-hand text-[11px] text-ink/70 w-4 text-right">
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    value={habit.name}
                    onChange={(e) => updateHabitName(idx, e.target.value)}
                    placeholder="Habit name..."
                    maxLength={24}
                    aria-label={`Habit ${idx + 1} name`}
                    className="flex-1 bg-transparent font-hand text-xs text-ink placeholder:text-ink/70 outline-none px-1"
                  />
                  <div className="flex items-center gap-1" title="Mark indulgence (red pen)">
                    <HandDrawnCheckbox
                      checked={habit.isRed}
                      onChange={() => toggleHabitRed(idx)}
                      color={habit.isRed ? 'redpen' : 'ink'}
                      ariaLabel={`Mark habit ${idx + 1} as indulgence`}
                    />
                    <span
                      className={`text-[10px] font-hand select-none ${
                        habit.isRed ? 'text-redpen font-bold' : 'text-ink/70'
                      }`}
                    >
                      red
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            STEP 5: NUMBERS TO TRACK (SVG tick boxes, correction 4)
            ════════════════════════════════════════════════════════ */}
        {step === 5 && (
          <div className="flex-1 flex flex-col justify-center py-2">
            <h2 className="font-hand text-xl font-bold text-ink mb-1 text-center">
              Numbers to Track
            </h2>
            <p className="font-hand text-xs text-ink/80 text-center mb-4">
              Select standard daily metrics, plus up to 3 custom numbers.
            </p>

            <div className="space-y-2 max-w-sm mx-auto w-full">
              {/* Standard Trackers */}
              <div className="space-y-1.5 border-b border-ink/20 pb-3">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={trackedNumbers.weight}
                  onClick={() =>
                    setTrackedNumbers((prev) => ({ ...prev, weight: !prev.weight }))
                  }
                  className="w-full flex items-center justify-between py-1 cursor-pointer text-left"
                >
                  <span className="font-hand text-sm text-ink">Weight (kg / lbs)</span>
                  <HandDrawnCheckboxVisual
                    checked={trackedNumbers.weight}
                    color="ink"
                  />
                </button>

                <button
                  type="button"
                  role="checkbox"
                  aria-checked={trackedNumbers.sleepScore}
                  onClick={() =>
                    setTrackedNumbers((prev) => ({ ...prev, sleepScore: !prev.sleepScore }))
                  }
                  className="w-full flex items-center justify-between py-1 cursor-pointer text-left"
                >
                  <span className="font-hand text-sm text-ink">Sleep Score / Hours</span>
                  <HandDrawnCheckboxVisual
                    checked={trackedNumbers.sleepScore}
                    color="ink"
                  />
                </button>

                <button
                  type="button"
                  role="checkbox"
                  aria-checked={trackedNumbers.mood}
                  onClick={() =>
                    setTrackedNumbers((prev) => ({ ...prev, mood: !prev.mood }))
                  }
                  className="w-full flex items-center justify-between py-1 cursor-pointer text-left"
                >
                  <span className="font-hand text-sm text-ink">Mood Rating (1–5)</span>
                  <HandDrawnCheckboxVisual
                    checked={trackedNumbers.mood}
                    color="ink"
                  />
                </button>
              </div>

              {/* 3 Custom Numbers */}
              <div className="pt-1 space-y-1.5">
                <span className="font-hand text-xs font-bold text-ink uppercase tracking-wider block">
                  Custom Numbers (up to 3):
                </span>
                {trackedNumbers.custom.map((cust, cIdx) => (
                  <div key={`custom-num-${cIdx}`} className="flex items-center gap-2">
                    <HandDrawnCheckbox
                      checked={cust.enabled}
                      onChange={() => toggleCustomNumber(cIdx)}
                      ariaLabel={`Enable custom number ${cIdx + 1}`}
                    />
                    <input
                      type="text"
                      value={cust.name}
                      onChange={(e) => updateCustomNumberName(cIdx, e.target.value)}
                      placeholder={`Custom ${cIdx + 1} (e.g. Steps, Pages, Water)`}
                      maxLength={20}
                      aria-label={`Custom number ${cIdx + 1} name`}
                      className="flex-1 bg-transparent border-b border-ink/20 focus:border-ink font-hand text-xs text-ink p-1 outline-none placeholder:text-ink/70"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            STEP 6: PAGES (Starting Layout choice only saved)
            ════════════════════════════════════════════════════════ */}
        {step === 6 && (
          <div className="flex-1 flex flex-col justify-center py-2">
            <h2 className="font-hand text-xl font-bold text-ink mb-1 text-center">
              Starting Layout
            </h2>
            <p className="font-hand text-xs text-ink/80 text-center mb-5">
              Choose your starting layout for the month&apos;s spread.
            </p>

            <div className="space-y-4 max-w-sm mx-auto w-full">
              {/* Choice: Journal */}
              <button
                type="button"
                role="radio"
                aria-checked={startingLayout === 'journal'}
                onClick={() => setStartingLayout('journal')}
                className={`w-full p-4 rounded border cursor-pointer transition-all text-left ${
                  startingLayout === 'journal'
                    ? 'border-ink bg-kraft/15 shadow-[0_2px_6px_rgba(28,36,51,0.2)] ring-1 ring-gold'
                    : 'border-ink/30 bg-paper/70 hover:border-ink/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-hand font-bold text-base text-ink">Journal Layout</span>
                  <HandDrawnCheckboxVisual
                    checked={startingLayout === 'journal'}
                  />
                </div>
                <p className="font-hand text-xs text-ink/75 mt-1.5 leading-relaxed">
                  Moments list on the left page; habits and sleep graph on the right page.
                </p>
              </button>

              {/* Choice: Empty */}
              <button
                type="button"
                role="radio"
                aria-checked={startingLayout === 'empty'}
                onClick={() => setStartingLayout('empty')}
                className={`w-full p-4 rounded border cursor-pointer transition-all text-left ${
                  startingLayout === 'empty'
                    ? 'border-ink bg-kraft/15 shadow-[0_2px_6px_rgba(28,36,51,0.2)] ring-1 ring-gold'
                    : 'border-ink/30 bg-paper/70 hover:border-ink/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-hand font-bold text-base text-ink">Empty Layout</span>
                  <HandDrawnCheckboxVisual
                    checked={startingLayout === 'empty'}
                  />
                </div>
                <p className="font-hand text-xs text-ink/75 mt-1.5 leading-relaxed">
                  Start with clean blank sheets. Add widgets freely later.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            STEP 7: REVIEW
            ════════════════════════════════════════════════════════ */}
        {step === 7 && (
          <div className="flex-1 flex flex-col justify-center py-2 text-center">
            <h2 className="font-hand text-xl font-bold text-ink mb-1">
              Ready to Open {monthName}
            </h2>
            <p className="font-hand text-xs text-ink/80 mb-3">
              Review your configuration before opening the month.
            </p>

            <div className="bg-kraft/15 border border-kraft/40 rounded p-3 text-left space-y-1.5 text-xs font-hand text-ink max-w-sm mx-auto w-full mb-3">
              <div className="flex justify-between border-b border-ink/10 pb-1">
                <span className="text-ink/70">Paper:</span>
                <span className="font-bold capitalize">
                  Left: {paperLeft} / Right: {paperRight}
                </span>
              </div>
              <div className="flex justify-between border-b border-ink/10 pb-1">
                <span className="text-ink/70">Habits:</span>
                <span className="font-bold">
                  {filledHabitsCount} configured{' '}
                  {redHabitsCount > 0 && `(${redHabitsCount} red indulgence)`}
                </span>
              </div>
              <div className="flex justify-between border-b border-ink/10 pb-1">
                <span className="text-ink/70">Numbers:</span>
                <span className="font-bold">
                  {[
                    trackedNumbers.weight && 'Weight',
                    trackedNumbers.sleepScore && 'Sleep',
                    trackedNumbers.mood && 'Mood',
                    ...trackedNumbers.custom
                      .filter((c) => c.enabled && c.name.trim())
                      .map((c) => c.name),
                  ]
                    .filter(Boolean)
                    .join(', ') || 'None'}
                </span>
              </div>
              <div className="flex justify-between border-b border-ink/10 pb-1">
                <span className="text-ink/70">Starting Layout:</span>
                <span className="font-bold capitalize">{startingLayout}</span>
              </div>
              {copyFromPrevious && (
                <div className="flex justify-between text-ink/80 text-[11px] italic">
                  <span>Last month&apos;s widgets:</span>
                  <span>Will be copied</span>
                </div>
              )}
            </div>

            {/* Handwritten red-pen error message if save failed (correction 2) */}
            {errorMessage && (
              <div className="mb-3 max-w-sm mx-auto text-center">
                <p className="font-hand text-xs text-redpen font-bold leading-tight">
                  {errorMessage}
                </p>
              </div>
            )}

            {/* Brass / Gold Button "Open the month" */}
            <div className="max-w-xs mx-auto w-full mt-1">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleOpenMonth}
                className={`w-full py-2.5 px-4 rounded border border-gold font-hand text-sm font-bold tracking-wider uppercase transition-all select-none ${
                  isSubmitting
                    ? 'bg-kraft/50 text-ink/70 cursor-wait'
                    : 'bg-gold text-ink hover:bg-gold/90 shadow-[0_2px_6px_rgba(28,36,51,0.25)] cursor-pointer'
                }`}
              >
                {isSubmitting ? 'turning the page...' : 'Open the month'}
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            FOOTER: NAVIGATION ARROWS (Turn Back / Turn Over)
            ════════════════════════════════════════════════════════ */}
        <div className="flex items-center justify-between border-t border-ink/20 pt-2">
          {step > 1 ? (
            <TurnBackArrow onClick={() => setStep((s) => s - 1)} />
          ) : (
            <div />
          )}

          {step < 7 && (
            <TurnOverArrow onClick={() => setStep((s) => s + 1)} />
          )}
        </div>
      </div>
    </div>
  )
}
