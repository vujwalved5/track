/**
 * DEV ONLY — /dev/paper
 * Shows all four paper types side by side for visual verification.
 * This route is not linked from anywhere in production.
 */

import Paper from '@/components/paper/Paper'
import type { PaperType, PageSide } from '@/components/paper/Paper'

const SAMPLES: { type: PaperType; side: PageSide }[] = [
  { type: 'dotted',  side: 'left'  },
  { type: 'squared', side: 'right' },
  { type: 'lined',   side: 'left'  },
  { type: 'blank',   side: 'right' },
]

export default function DevPaperPage() {
  return (
    <div
      style={{
        minHeight:       '100vh',
        backgroundColor: '#211b16',   // desk (L6)
        display:         'flex',
        flexWrap:        'wrap',
        alignItems:      'center',
        justifyContent:  'center',
        gap:             40,
        padding:         48,
      }}
    >
      {SAMPLES.map(({ type, side }) => (
        <div
          key={type}
          style={{
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            gap:            12,
          }}
        >
          <Paper type={type} side={side} />

          {/* Label — Kalam font, gold colour (L5, L6) */}
          <span
            style={{
              fontFamily: 'var(--font-kalam), cursive',
              fontSize:   15,
              color:      '#d8b45a',   // gold (L6)
              letterSpacing: '0.03em',
            }}
          >
            {type} / {side}
          </span>
        </div>
      ))}
    </div>
  )
}
