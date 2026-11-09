'use client'

import React, { useState } from 'react'
import { FOCUS_NOTES, type FocusNote } from '@/lib/focusNotes'

interface FocusNotesStackProps {
  variant?: 'desktop' | 'mobile'
}

export function FocusNotesStack({ variant = 'desktop' }: FocusNotesStackProps) {
  const [isLifted, setIsLifted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const currentNote: FocusNote = FOCUS_NOTES[currentIndex] || FOCUS_NOTES[0]
  const totalNotes = FOCUS_NOTES.length

  const handleTurnOver = () => {
    setCurrentIndex((prev) => (prev + 1) % totalNotes)
  }

  const handlePutBack = () => {
    setIsLifted(false)
  }

  const isMobile = variant === 'mobile'

  return (
    <div
      data-desk-object="focus-notes"
      className="relative select-none z-20"
    >
      {/* ── 1. RESTING STACK (when not lifted) ── */}
      {!isLifted ? (
        <button
          type="button"
          onClick={() => setIsLifted(true)}
          aria-label={`Open Focus Notes stack. Currently on sheet ${currentIndex + 1} of ${totalNotes}: ${currentNote.title}. Tap to lift.`}
          className={`relative group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlighter focus-visible:ring-offset-2 focus-visible:ring-offset-desk rounded-sm transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] text-left p-0 border-0 bg-transparent ${
            isMobile
              ? 'w-full max-w-[340px] h-[110px]'
              : 'w-[200px] h-[280px] lg:w-[220px] lg:h-[310px]'
          }`}
        >
          {/* Stack Layer 3 (deepest sheet) */}
          <div
            className="absolute inset-0 bg-paper/75 rounded-sm shadow-sm pointer-events-none"
            style={{
              transform: 'rotate(2.8deg) translate(4px, 3px)',
              border: '1px solid rgba(185, 137, 90, 0.3)',
            }}
            aria-hidden="true"
          />

          {/* Stack Layer 2 (middle sheet) */}
          <div
            className="absolute inset-0 bg-paper/85 rounded-sm shadow-sm pointer-events-none"
            style={{
              transform: 'rotate(-2.2deg) translate(-3px, 2px)',
              border: '1px solid rgba(185, 137, 90, 0.35)',
            }}
            aria-hidden="true"
          />

          {/* Top Sheet (visible resting cover note) */}
          <div
            className="relative w-full h-full bg-paper text-ink rounded-sm shadow-paper-card p-3 sm:p-4 flex flex-col justify-between -rotate-1 border border-kraft/40"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(28, 36, 51, 0.22) 1.2px, transparent 1.2px)',
              backgroundSize: '22px 22px',
            }}
          >
            {/* Corner paper clip illustration */}
            <div
              className="absolute -top-2 left-6 w-3.5 h-5 border-t-2 border-r-2 border-l-2 border-kraft/70 rounded-t-sm pointer-events-none"
              aria-hidden="true"
            />

            <div>
              <div className="flex items-center justify-between border-b border-ink/20 pb-1 mb-1.5">
                <span className="font-hand text-[11px] text-ink/70">
                  Focus Note {currentIndex + 1}/{totalNotes}
                </span>
                <span className="font-hand text-[10px] text-kraft font-bold uppercase tracking-wider">
                  stack of 7
                </span>
              </div>
              <h2 className="font-hand font-bold text-sm sm:text-base text-ink leading-tight">
                {currentNote.title}
              </h2>
              <p className="font-hand text-xs text-ink/75 line-clamp-2 mt-1 leading-snug">
                {currentNote.body}
              </p>
            </div>

            <div className="pt-1 flex items-center justify-between border-t border-ink/15 text-ink/70">
              <span className="font-hand text-[11px] group-hover:text-ink font-medium">
                tap stack to lift
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transform group-hover:translate-x-0.5 transition-transform"
                aria-hidden="true"
              >
                <path
                  d="M 3 7 H 11 M 8 4 L 11 7 L 8 10"
                  stroke="#1c2433"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </button>
      ) : (
        /* ── 2. LIFTED ACTIVE SHEET (Month Setup card style, no modal) ── */
        <div
          role="region"
          aria-label={`Focus note ${currentIndex + 1} of ${totalNotes}: ${currentNote.title}`}
          className={`relative bg-paper text-ink rounded-sm shadow-paper-card border border-kraft/45 p-3.5 sm:p-5 flex flex-col justify-between -rotate-1 animate-note-lift ${
            isMobile
              ? 'w-full max-w-[340px] min-h-[220px]'
              : 'w-[290px] min-h-[380px] lg:w-[320px] lg:min-h-[410px]'
          }`}
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(28, 36, 51, 0.22) 1.2px, transparent 1.2px)',
            backgroundSize: '22px 22px',
          }}
        >
          {/* Top Card Brass Clip Accent */}
          <div
            className="absolute -top-3 left-8 w-5 h-6 border-t-2 border-r-2 border-l-2 border-kraft rounded-t-sm pointer-events-none z-10"
            aria-hidden="true"
          />

          {/* Header */}
          <div className="border-b border-ink/20 pb-1.5 mb-2">
            <div className="flex items-center justify-between">
              <span className="font-hand text-xs text-ink/75 font-semibold">
                Sheet {currentIndex + 1} of {totalNotes}
              </span>
              <span className="font-hand text-[11px] text-kraft font-bold uppercase tracking-wider">
                {currentNote.topic}
              </span>
            </div>
            <h2 className="font-hand font-bold text-base sm:text-lg text-ink mt-0.5">
              {currentNote.title}
            </h2>
          </div>

          {/* Body: 80 to 120 words in calm Kalam handwriting */}
          <div className="flex-1 my-1">
            <p className="font-hand text-xs sm:text-[13px] text-ink/90 leading-[20px] sm:leading-[22px]">
              {currentNote.body}
            </p>

            {/* "Try this today" actionable line */}
            <div className="mt-2.5 pt-1.5 border-t border-dotted border-ink/25 bg-gold/10 px-2 py-1 rounded-sm">
              <p className="font-hand text-xs text-ink leading-snug">
                <span className="font-bold text-oxblood mr-1">Try this today:</span>
                {currentNote.tryThisToday}
              </p>
            </div>
          </div>

          {/* Source Attribution with Working Canonical URL */}
          <div className="mt-2 pt-1.5 border-t border-ink/15 text-[10px] text-ink/70 font-hand">
            <a
              href={currentNote.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline hover:text-ink text-ink/75 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-highlighter inline-block truncate max-w-full"
              title={`Read primary source: ${currentNote.sourceLabel}`}
            >
              Source: {currentNote.sourceLabel}
            </a>
          </div>

          {/* Footer Controls: "turn over" arrow and "put back" action (each >= 44x44px tap target) */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-ink/20">
            <button
              type="button"
              onClick={handlePutBack}
              className="min-w-[44px] min-h-[44px] px-2 py-1 font-hand text-xs text-ink/75 hover:text-ink hover:underline cursor-pointer flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-highlighter rounded-sm"
              aria-label="Put back the note sheet into the stack"
            >
              put back
            </button>

            <button
              type="button"
              onClick={handleTurnOver}
              className="min-w-[44px] min-h-[44px] px-3 py-1 font-hand text-xs font-bold text-desk bg-gold hover:bg-kraft rounded-sm shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlighter"
              aria-label={`Turn over to next note: sheet ${
                ((currentIndex + 1) % totalNotes) + 1
              } of ${totalNotes}`}
            >
              <span>turn over</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M 2 7 H 12 M 8 3 L 12 7 L 8 11"
                  stroke="#211b16"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
