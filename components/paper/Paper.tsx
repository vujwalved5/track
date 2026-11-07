/**
 * Paper — reusable notebook page background (L7).
 *
 * Renders one of four paper textures entirely in CSS:
 *   dotted   – 1.4 px dot at every 22 px intersection (radial-gradient)
 *   squared  – 1 px grid lines every 22 px (linear-gradient both axes)
 *   lined    – horizontal lines only every 22 px
 *   blank    – plain paper colour
 *
 * A subtle grain layer (two crossed low-opacity hatch gradients) sits on top
 * of every texture. No images, no SVG.
 *
 * Fixed page size: 22 cols × 30 rows × 22 px = 484 × 660 px (L7, L8).
 * Spine shadow: left page → inset on right edge; right page → inset on left.
 */

import type { CSSProperties } from 'react'

// ── Public types ─────────────────────────────────────────────
export type PaperType = 'dotted' | 'squared' | 'lined' | 'blank'
export type PageSide  = 'left' | 'right'

export interface PaperProps {
  type:       PaperType
  side:       PageSide
  children?:  React.ReactNode
  className?: string
  style?:     CSSProperties
}

// ── Dimensions (22-px grid, L7) ──────────────────────────────
export const PAGE_COLS = 22
export const PAGE_ROWS = 30
export const GRID_PX   = 22
export const PAGE_W    = PAGE_COLS * GRID_PX  // 484 px
export const PAGE_H    = PAGE_ROWS * GRID_PX  // 660 px

// ── Colour helpers (L6 — ink #1c2433, desk #211b16) ──────────
const ink  = (a: number) => `rgba(28,36,51,${a})`
const desk = (a: number) => `rgba(33,27,22,${a})`

// ── Paper grain — two crossed diagonal hatches ────────────────
// Each gradient tiles at 2 × 2 px. Together they read as a
// very faint woven texture that breaks the flat colour.
const GRAIN_A = `repeating-linear-gradient(45deg,transparent,transparent 1px,${ink(0.016)} 1px,${ink(0.016)} 2px)`
const GRAIN_B = `repeating-linear-gradient(-45deg,transparent,transparent 1px,${ink(0.016)} 1px,${ink(0.016)} 2px)`
// GRAIN_A and GRAIN_B are both layer 1 and 2 — 2 grain layers total.
const GRAIN        = `${GRAIN_A},${GRAIN_B}`
const GRAIN_SIZE   = '2px 2px,2px 2px'   // one size entry per grain layer

// ── Pattern styles ────────────────────────────────────────────
type BgStyle = Pick<CSSProperties, 'backgroundImage' | 'backgroundSize'>

function patternStyle(type: PaperType): BgStyle {
  switch (type) {
    case 'dotted':
      // 2 grain layers + 1 dot layer = 3 total
      return {
        backgroundImage: `${GRAIN},radial-gradient(circle,${ink(0.35)} 0.7px,transparent 0.7px)`,
        backgroundSize:  `${GRAIN_SIZE},${GRID_PX}px ${GRID_PX}px`,
      }

    case 'squared':
      // 2 grain layers + 1 horizontal + 1 vertical = 4 total
      return {
        backgroundImage: [
          GRAIN,
          `linear-gradient(${ink(0.22)} 1px,transparent 1px)`,
          `linear-gradient(90deg,${ink(0.22)} 1px,transparent 1px)`,
        ].join(','),
        backgroundSize: `${GRAIN_SIZE},${GRID_PX}px ${GRID_PX}px,${GRID_PX}px ${GRID_PX}px`,
      }

    case 'lined':
      // 2 grain layers + 1 horizontal = 3 total
      return {
        backgroundImage: `${GRAIN},linear-gradient(${ink(0.22)} 1px,transparent 1px)`,
        backgroundSize:  `${GRAIN_SIZE},${GRID_PX}px ${GRID_PX}px`,
      }

    case 'blank':
      // 2 grain layers only
      return {
        backgroundImage: GRAIN,
        backgroundSize:  GRAIN_SIZE,
      }
  }
}

// ── Spine shadow ──────────────────────────────────────────────
// Soft inset shadow on the spine edge only (L1 — book, not website).
// No external drop shadow — only the inner gutter darkening.
function spineStyle(side: PageSide): Pick<CSSProperties, 'boxShadow'> {
  return side === 'left'
    ? { boxShadow: `inset -20px 0 32px -10px ${desk(0.32)}` }
    : { boxShadow: `inset  20px 0 32px -10px ${desk(0.32)}` }
}

// ── Component ─────────────────────────────────────────────────
export default function Paper({
  type,
  side,
  children,
  className = '',
  style: extraStyle,
}: PaperProps) {
  const style: CSSProperties = {
    // Size
    width:    PAGE_W,
    height:   PAGE_H,
    flexShrink: 0,
    // Paper colour (L6)
    backgroundColor: '#f4eddc',
    // Clip children and grain to page boundary
    position: 'relative',
    overflow: 'hidden',
    // Texture
    ...patternStyle(type),
    // Spine
    ...spineStyle(side),
    // Caller overrides (position, z-index, etc.)
    ...extraStyle,
  }

  return (
    <div className={className} style={style}>
      {children}
    </div>
  )
}
