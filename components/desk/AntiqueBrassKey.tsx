'use client'

import React from 'react'

/**
 * AntiqueBrassKey Component
 * Memorable Moments — Home Desk Environment (Task 15)
 *
 * Rules:
 * - Desktop: hand-drawn SVG solid brass key resting on the desk to the right of the book below the month tabs.
 *   - Tilt +12deg.
 *   - Multi-stage drop shadow (--shadow-brass-key).
 *   - Accessible button with aria-label="Lock the book and sign out".
 *   - Focus ring in highlighter yellow (#ffd84a).
 *   - Handwritten "lock the book" tooltip appears on hover or focus.
 *   - On narrow desktop viewports (< 1300px), stays accessible and in-view without tab collision.
 * - Mobile (< 768px): miniature brass key charm dangling on an ink thread at the bottom-left edge above the "back" link.
 *   - 44x44px accessible tap target with no overlap.
 * - Triggers reverse cover-close animation and sign-out.
 * - Strictly L6 palette, L5 fonts, zero emoji, zero extra libraries.
 */

interface AntiqueBrassKeyProps {
  onLock: () => void
  disabled?: boolean
  variant?: 'desktop' | 'mobile'
}

export function AntiqueBrassKey({
  onLock,
  disabled = false,
  variant = 'desktop',
}: AntiqueBrassKeyProps) {
  if (variant === 'mobile') {
    return (
      <button
        type="button"
        onClick={onLock}
        disabled={disabled}
        aria-label="Lock the book and sign out"
        title="Lock the book and sign out"
        data-desk-object="mobile-key"
        className="absolute bottom-[54px] left-1.5 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center z-30 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlighter select-none"
      >
        {/* Ink thread dangling from spine binding */}
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-0.5 h-3.5 bg-ink/60 pointer-events-none"
          aria-hidden="true"
        />

        {/* Miniature Brass Key Charm */}
        <svg
          width="20"
          height="34"
          viewBox="0 0 20 34"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shadow-brass-key transition-transform duration-150 group-hover:scale-105 group-hover:rotate-6 group-active:scale-95"
          aria-hidden="true"
        >
          {/* Key Bow Ring */}
          <circle
            cx="10"
            cy="7"
            r="6"
            fill="#d8b45a"
            stroke="#211b16"
            strokeWidth="1.2"
          />
          <circle
            cx="10"
            cy="7"
            r="2.8"
            fill="#b9895a"
            stroke="#211b16"
            strokeWidth="0.8"
          />
          {/* Specular bow highlight */}
          <path
            d="M 6.5 4 C 8 2.5, 12 2.5, 13.5 4"
            stroke="#f4eddc"
            strokeWidth="0.9"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Key Collar */}
          <rect
            x="8"
            y="12.5"
            width="4"
            height="1.8"
            rx="0.5"
            fill="#b9895a"
            stroke="#211b16"
            strokeWidth="0.8"
          />

          {/* Key Shaft */}
          <rect
            x="8.5"
            y="14"
            width="3"
            height="15"
            rx="0.5"
            fill="#d8b45a"
            stroke="#211b16"
            strokeWidth="0.9"
          />

          {/* Key Bit (Teeth) */}
          <path
            d="M 11.5 23 H 15.5 V 25.5 H 13 V 27.5 H 15.5 V 29 H 11.5"
            fill="#d8b45a"
            stroke="#211b16"
            strokeWidth="0.9"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    )
  }

  // Desktop Variant
  return (
    <div
      data-desk-object="desktop-key"
      className="fixed bottom-4 right-4 min-[1300px]:absolute min-[1300px]:bottom-3 min-[1300px]:left-[calc(100%+14px)] min-[1300px]:right-auto select-none pointer-events-auto z-30"
    >
      <button
        type="button"
        onClick={onLock}
        disabled={disabled}
        aria-label="Lock the book and sign out"
        className="relative group p-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlighter focus-visible:ring-offset-2 focus-visible:ring-offset-desk rounded-md transition-transform duration-200"
        style={{
          transform: 'rotate(12deg)',
          transformOrigin: 'center center',
        }}
      >
        {/* Handwritten "lock the book" tooltip on hover or focus */}
        <span
          className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap font-hand text-xs text-ink bg-paper/95 border border-ink/30 px-2 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150 pointer-events-none -rotate-2"
          role="tooltip"
        >
          lock the book
        </span>

        {/* Hand-Drawn Solid Brass Key (SVG) */}
        <svg
          width="44"
          height="84"
          viewBox="0 0 44 84"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shadow-brass-key transition-transform duration-150 group-hover:scale-105 group-hover:rotate-2 group-active:scale-95"
          aria-hidden="true"
        >
          {/* Key Bow (Ornate antique ring) */}
          <circle
            cx="22"
            cy="18"
            r="15"
            fill="#d8b45a"
            stroke="#211b16"
            strokeWidth="2.2"
          />
          {/* Inner cutout */}
          <circle
            cx="22"
            cy="18"
            r="7.5"
            fill="#211b16"
            opacity="0.3"
          />
          <circle
            cx="22"
            cy="18"
            r="7"
            fill="#b9895a"
            stroke="#211b16"
            strokeWidth="1.8"
          />

          {/* Bow Antique Patina & Specular Shading */}
          <path
            d="M 12 11 C 16 6, 28 6, 32 11"
            stroke="#f4eddc"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.55"
          />
          <path
            d="M 11 23 C 14 27, 20 29, 27 28"
            stroke="#b9895a"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          {/* Decorative Upper Collar */}
          <rect
            x="17"
            y="31"
            width="10"
            height="4"
            rx="1.5"
            fill="#b9895a"
            stroke="#211b16"
            strokeWidth="1.6"
          />
          <rect
            x="18"
            y="32"
            width="8"
            height="1.5"
            fill="#f4eddc"
            opacity="0.4"
          />

          {/* Key Shaft / Barrel */}
          <rect
            x="19"
            y="35"
            width="6"
            height="42"
            rx="1"
            fill="#d8b45a"
            stroke="#211b16"
            strokeWidth="1.8"
          />
          {/* Shaft Specular Highlight Line */}
          <line
            x1="20.5"
            y1="36"
            x2="20.5"
            y2="75"
            stroke="#f4eddc"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.5"
          />

          {/* Lower Collar */}
          <rect
            x="17"
            y="52"
            width="10"
            height="3"
            rx="1"
            fill="#b9895a"
            stroke="#211b16"
            strokeWidth="1.4"
          />

          {/* Key Bit (Antique Lock Teeth) */}
          <path
            d="M 25 58 H 36 V 64 H 30 V 68 H 36 V 73 H 25"
            fill="#d8b45a"
            stroke="#211b16"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Bit Ward Cutout Notch */}
          <rect
            x="29"
            y="64"
            width="3"
            height="4"
            fill="#211b16"
            opacity="0.4"
          />
          {/* Bit Highlight */}
          <path
            d="M 27 59.5 H 34.5 V 62.5"
            stroke="#f4eddc"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.4"
          />

          {/* Key Tip */}
          <path
            d="M 19 77 C 20.5 79, 23.5 79, 25 77"
            fill="#b9895a"
            stroke="#211b16"
            strokeWidth="1.6"
          />
        </svg>
      </button>
    </div>
  )
}
