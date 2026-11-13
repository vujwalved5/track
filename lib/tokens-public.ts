/**
 * Design tokens for the public Canva-designed pages (/welcome and /welcome/focus-room).
 * Scoped Exception E1: Canva colours and fonts are used ONLY on /welcome, /welcome/focus-room,
 * and /components/public/*. The core book and widgets remain strictly L6 locked.
 */

export const publicColors = {
  ink: '#172536',
  chalk: '#F4EFE4',
  tobacco: '#60432F',
  brass: '#B68A53',
  clay: '#BD634A',
  sage: '#899783',
  forest: '#30483D',
  blue: '#8799A7',
  marigold: '#D2A75D',
  plum: '#79677A',
  line: 'rgba(244, 239, 228, 0.21)',
} as const

export type PublicColorKey = keyof typeof publicColors
