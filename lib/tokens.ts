/**
 * Design tokens for Memorable Moments.
 * L6: locked palette — do not add or change colours.
 * L7: locked grid unit — 22 px.
 */

export const colors = {
  desk:        '#211b16',
  paper:       '#f4eddc',
  ink:         '#1c2433',
  redpen:      '#b3261e',
  highlighter: '#ffd84a',
  oxblood:     '#702028',
  oxbloodDark: '#54181e',
  gold:        '#d8b45a',
  kraft:       '#b9895a',
  orange:      '#ff5a1f',
} as const

/** Grid unit used for dot-paper and widget snapping (L7, L10). */
export const GRID_UNIT = 22 // px

export type ColorKey = keyof typeof colors
