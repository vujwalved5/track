'use client'

/**
 * Sticky Note Widget
 * Memorable Moments — Phase 4 / Task 7 & Task 14
 *
 * Rules:
 * - Group: 'Write' (Correction 1)
 * - Default size: 7x6 (154px × 132px on 22px grid)
 * - Min size: 4x4 (88px × 88px)
 * - Kalam font, L6 paper (#f4eddc), ink (#1c2433), washi tape kraft (#b9895a)
 * - Debounced text edit (max 400ms), save-on-blur, flush on pagehide/visibilitychange
 * - Hand-drawn SVG icon (L13)
 */

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { z } from 'zod'
import type { WidgetDefinition, WidgetRenderProps } from '../types'
import {
  saveWidgetConfigQueued,
  scheduleDebouncedConfigSave,
} from '../entryHelpers'

// ── Zod Config Schema ─────────────────────────────────────────
export const stickyNoteSchema = z.object({
  text: z.string().default(''),
})

export type StickyNoteConfig = z.infer<typeof stickyNoteSchema>

// ── Hand-Drawn SVG Icon ───────────────────────────────────────
export function StickyNoteIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      {/* Square paper outline */}
      <rect
        x="3.5"
        y="4"
        width="17"
        height="16"
        rx="1"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Top washi tape strip */}
      <path
        d="M 8 2.5 L 16 2.5 L 15.5 5.5 L 7.5 5.5 Z"
        fill="currentColor"
        opacity="0.35"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      {/* Hand-drawn text rule lines */}
      <path
        d="M 6.5 9 C 9.5 8.7, 13 9.2, 16.5 9"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M 7 12.5 C 10 12.2, 13 12.6, 15.5 12.5"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ── Desktop Render Component ──────────────────────────────────
export function StickyNoteDesktop({
  id,
  config,
  w = 7,
  h = 6,
  isArrangeMode,
}: WidgetRenderProps<StickyNoteConfig>) {
  const initialText = config?.text || ''
  const [text, setText] = useState(initialText)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)

  useEffect(() => {
    setText(initialText)
  }, [initialText])

  const fontSize = useMemo(() => {
    const area = w * h
    if (area <= 6) return 11
    if (area <= 12) return 12
    if (area <= 24) return 13
    return 14
  }, [w, h])

  useEffect(() => {
    const el = textareaRef.current
    if (el) {
      setIsOverflowing(el.scrollHeight > el.clientHeight + 2)
    }
  }, [text, fontSize, w, h])

  const handleBlur = async () => {
    await saveWidgetConfigQueued(id, { text })
  }

  const handleChange = (newText: string) => {
    setText(newText)
    scheduleDebouncedConfigSave(id, { text: newText }, 400)
  }

  return (
    <div className="relative w-full h-full p-2 flex flex-col justify-between bg-paper border border-ink/15 rounded shadow-[1px_2px_6px_rgba(28,36,51,0.08)] select-none overflow-hidden">
      {/* Washi tape strip at top edge (hidden if h <= 2) */}
      {h > 2 && (
        <div
          className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-12 h-3 bg-kraft/35 border-t border-b border-ink/10 rotate-[-1deg] pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* Note content textarea */}
      <div className={`flex-1 overflow-hidden ${h > 2 ? 'pt-1.5' : 'pt-0.5'}`}>
        <textarea
          ref={textareaRef}
          disabled={isArrangeMode}
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder="Write a note..."
          aria-label="Sticky note content"
          style={{ fontSize: `${fontSize}px`, lineHeight: 1.3 }}
          className="w-full h-full bg-transparent font-hand text-ink leading-snug break-words resize-none focus:outline-none overflow-hidden placeholder:text-ink/40 select-text"
        />
      </div>

      {/* Hand-Drawn "More" Folded Corner when content overflows */}
      {isOverflowing && (
        <div
          className="absolute bottom-0 right-0 w-5 h-5 pointer-events-none select-none z-10"
          title="More text below (resize to see all)"
          aria-label="More text below"
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
            <circle cx="16" cy="19" r="1" fill="#1c2433" />
            <circle cx="19" cy="19" r="1" fill="#1c2433" />
            <circle cx="22" cy="19" r="1" fill="#1c2433" />
          </svg>
        </div>
      )}
    </div>
  )
}

// ── Mobile Render Component ───────────────────────────────────
export function StickyNoteMobile(props: WidgetRenderProps<StickyNoteConfig>) {
  return <StickyNoteDesktop {...props} />
}

// ── Widget Definition ─────────────────────────────────────────
export const stickyNoteWidgetDefinition: WidgetDefinition<typeof stickyNoteSchema> = {
  id: 'sticky_note',
  displayName: 'Sticky note',
  group: 'Write',
  defaultSize: { w: 7, h: 6 }, // 154px × 132px on 22px grid
  minSize: { w: 4, h: 4 },     // 88px × 88px minimum
  schema: stickyNoteSchema,
  component: StickyNoteDesktop,
  mobileComponent: StickyNoteMobile,
  icon: StickyNoteIcon,
}
