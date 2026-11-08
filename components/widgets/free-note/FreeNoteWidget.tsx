'use client'

/**
 * Free Note Widget
 * Memorable Moments — Phase 5 / Task 10 Batch B
 *
 * Rules:
 * - Group: 'Write' (Correction 1)
 * - Default size: 10x10 (10 cols × 10 rows on 22px grid = 220px × 220px)
 * - Min size: 6x6
 * - Config: paper = lined | blank (lined rules on 22px grid) (Correction 5)
 * - Text stored in widget config like Sticky Note and saved on blur (Correction 5)
 * - Font shrinks down to a 12px floor; beyond that, hide overflow and show hand-drawn "more" corner (Correction 5)
 * - Never scroll inside page (L1, Correction 5)
 * - Palette L6 only, fonts L5 only, no emoji, hand-drawn SVG icon (L13)
 */

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { z } from 'zod'
import type { WidgetDefinition, WidgetRenderProps } from '../types'
import { updateWidgetConfig } from '../widgetActions'

// ── Zod Config Schema ─────────────────────────────────────────
export const freeNoteConfigSchema = z.object({
  paper: z.enum(['lined', 'blank']).default('lined'),
  text: z.string().default(''),
})

export type FreeNoteConfig = z.infer<typeof freeNoteConfigSchema>

// ── Hand-Drawn SVG Icon ───────────────────────────────────────
export function FreeNoteIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      {/* Paper page with folded corner */}
      <path
        d="M 4 3.5 C 9 3.2, 15 3.5, 19.5 3.5 C 20 7, 19.8 14, 20 16.5 L 16 20.5 C 12 20.3, 7 20.6, 4 20.5 Z"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Folded corner triangle */}
      <path
        d="M 16 16.5 C 16 18, 16 19.5, 16 20.5 L 20 16.5 Z"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      {/* Lined notebook rules */}
      <path d="M 7 7.5 L 16.5 7.5" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M 7 11.5 L 16.5 11.5" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M 7 15.5 L 14 15.5" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

// ── Desktop / Main Component ──────────────────────────────────
export function FreeNoteDesktop({
  id,
  config,
  w,
  h,
  isArrangeMode,
}: WidgetRenderProps<FreeNoteConfig>) {
  const paper = config?.paper || 'lined'
  const initialText = config?.text || ''

  const [text, setText] = useState(initialText)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Sync state if config changes externally (e.g. from config card)
  useEffect(() => {
    setText(initialText)
  }, [initialText])

  // Height available inside container (22px grid units)
  const containerHeight = h * 22

  const isCompact = w <= 4 || h <= 3

  // Dynamic font size computation:
  // Starts at 16px, scales down to 11px floor based on text length and container height
  const fontSize = useMemo(() => {
    const chars = text.length
    const area = w * h // in grid blocks (1 block = 22x22 = 484px^2)
    if (area <= 6) return 11
    const density = chars / Math.max(1, area)
    if (density < 5) return 16
    if (density < 8) return 15
    if (density < 11) return 14
    if (density < 14) return 13
    if (density < 18) return 12
    return 11
  }, [text, w, h])

  // Check overflow beyond the floor
  useEffect(() => {
    const el = textareaRef.current
    if (el) {
      // If scrollHeight > clientHeight, it overflows
      setIsOverflowing(el.scrollHeight > el.clientHeight + 2)
    }
  }, [text, fontSize, containerHeight])

  // Commit text to widget config on blur (Correction 5)
  const handleBlur = async () => {
    if (text !== initialText) {
      await updateWidgetConfig(id, {
        paper,
        text,
      })
    }
  }

  return (
    <div
      className={`relative w-full h-full flex flex-col justify-between select-none overflow-hidden ${
        isCompact ? 'p-1.5' : 'p-2.5'
      }`}
      style={{
        backgroundImage:
          paper === 'lined'
            ? 'repeating-linear-gradient(transparent, transparent 21px, rgba(28,36,51,0.12) 21px, rgba(28,36,51,0.12) 22px)'
            : 'none',
        backgroundPosition: '0 4px',
      }}
    >
      {/* Textarea for handwritten note */}
      <textarea
        ref={textareaRef}
        disabled={isArrangeMode}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        placeholder="Write by hand..."
        aria-label="Free handwritten note"
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: paper === 'lined' ? '22px' : '1.4',
        }}
        className="w-full h-full bg-transparent font-hand text-ink focus:outline-none resize-none overflow-hidden placeholder:text-ink/70 select-text"
      />

      {/* Hand-Drawn "More" Folded Corner (shown when text overflows beyond 12px floor, Correction 5) */}
      {isOverflowing && (
        <div
          className="absolute bottom-0 right-0 w-6 h-6 pointer-events-none select-none z-10"
          title="More text below (resize to see all)"
          aria-label="More text below"
        >
          {/* Folded paper flap triangle */}
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
            {/* Ellipsis inside folded corner */}
            <circle cx="16" cy="19" r="1" fill="#1c2433" />
            <circle cx="19" cy="19" r="1" fill="#1c2433" />
            <circle cx="22" cy="19" r="1" fill="#1c2433" />
          </svg>
        </div>
      )}
    </div>
  )
}

// ── Mobile Render Component (Task 11 placeholder) ─────────────
export function FreeNoteMobile(props: WidgetRenderProps<FreeNoteConfig>) {
  return <FreeNoteDesktop {...props} />
}

// ── Widget Definition ─────────────────────────────────────────
export const freeNoteWidgetDefinition: WidgetDefinition<typeof freeNoteConfigSchema> = {
  id: 'free-note',
  displayName: 'Free Note',
  group: 'Write',
  defaultSize: { w: 10, h: 10 },
  minSize: { w: 6, h: 6 },
  schema: freeNoteConfigSchema,
  component: FreeNoteDesktop,
  mobileComponent: FreeNoteMobile,
  icon: FreeNoteIcon,
}
