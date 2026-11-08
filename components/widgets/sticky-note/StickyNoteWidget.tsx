/**
 * Sticky Note Widget (Test Widget for Engine Validation)
 * Memorable Moments — Phase 4 / Task 7
 *
 * Locked constraints:
 * - Hand-drawn SVG icon (L13, no emoji)
 * - Kalam font (L5)
 * - Palette strictly L6 (paper, ink, kraft, highlighter, redpen)
 * - Text-only configuration schema
 */

import React from 'react'
import { z } from 'zod'
import type { WidgetDefinition, WidgetRenderProps } from '../types'

// ── Zod Schema (Text Only) ────────────────────────────────────
export const stickyNoteSchema = z.object({
  text: z.string().default('Remember to...'),
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
      {/* Sticky note body with folded bottom-right corner */}
      <path
        d="M 4 4.5 C 9 4.2, 15 4.5, 19.5 4 C 20 8, 19.8 14, 20 16.5 L 15.5 20 C 11 19.8, 6 20.2, 4 20 C 3.8 15, 4.2 9, 4 4.5 Z"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Folded corner flap */}
      <path
        d="M 15.5 16.5 C 15.6 18, 15.5 19.5, 15.5 20 C 17.5 18.5, 18.5 17.5, 20 16.5 Z"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* Tape strip at top */}
      <path
        d="M 8.5 2.5 L 15.5 2.5 L 15 5.5 L 8 5.5 Z"
        strokeWidth="1.2"
        strokeLinejoin="round"
        strokeDasharray="2 2"
      />
      {/* Handwritten note lines */}
      <path
        d="M 7 9 C 9.5 8.8, 13 9.2, 16 9"
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
  config,
  isArrangeMode,
}: WidgetRenderProps<StickyNoteConfig>) {
  const noteText = config?.text?.trim() ? config.text : 'Click the pen icon in arrange mode to write a note...'

  return (
    <div className="relative w-full h-full p-3 flex flex-col justify-between bg-paper border border-ink/15 rounded shadow-[1px_2px_6px_rgba(28,36,51,0.08)] select-none overflow-hidden">
      {/* Washi tape strip at top edge */}
      <div
        className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-kraft/35 border-t border-b border-ink/10 rotate-[-1deg] pointer-events-none"
        aria-hidden="true"
      />

      {/* Note content */}
      <div className="pt-2 flex-1 overflow-hidden">
        <p className="font-hand text-sm text-ink leading-relaxed break-words whitespace-pre-wrap">
          {noteText}
        </p>
      </div>

      {/* Bottom corner paper fold shadow */}
      <div
        className="absolute bottom-0 right-0 w-3 h-3 bg-gradient-to-tl from-kraft/30 to-transparent pointer-events-none"
        aria-hidden="true"
      />
    </div>
  )
}

// ── Mobile Render Component (Task 11 layout placeholder) ─────
export function StickyNoteMobile({
  config,
}: WidgetRenderProps<StickyNoteConfig>) {
  return (
    <div className="w-full p-3 bg-paper border border-ink/20 rounded shadow-sm select-none">
      <p className="font-hand text-xs text-ink leading-normal break-words whitespace-pre-wrap">
        {config?.text || 'Sticky note'}
      </p>
    </div>
  )
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
