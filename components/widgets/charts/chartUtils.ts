/**
 * Chart Utilities
 * Memorable Moments — Phase 5 / Task 10
 *
 * Rules:
 * - Deterministic seeded jitter using LCG arithmetic — no Math.random (Correction 8)
 * - No Date-based values in render (Correction 8)
 * - Hand-drawn look via wobbly cubic bezier paths (L4)
 * - No chart library (L4)
 */

// ── Deterministic Pseudo-Random ───────────────────────────────

/**
 * Linear Congruential Generator — purely arithmetic, deterministic.
 * Returns a value in [0, 1). No Math.random, no Date.
 * Constants from Knuth "The Art of Computer Programming".
 */
export function seededRandom(seed: number): number {
  return (((seed * 1664525 + 1013904223) >>> 0) / 4294967296)
}

/**
 * Returns a small offset in [-amplitude, +amplitude] for a given seed.
 * Same seed always returns the same value.
 */
export function jitter(seed: number, amplitude: number = 1.5): number {
  return (seededRandom(seed) - 0.5) * 2 * amplitude
}

/**
 * Converts a string (e.g., a widget UUID) to a numeric seed.
 * Uses djb2 hash — fast, deterministic, no floating-point ambiguity.
 */
export function seedFromString(s: string): number {
  let hash = 5381
  for (let i = 0; i < s.length; i++) {
    hash = (((hash << 5) + hash) + s.charCodeAt(i)) >>> 0
  }
  return hash
}

// ── Wobbly SVG Path Builders ──────────────────────────────────

/**
 * Builds a wobbly SVG `d` path through an ordered array of [x, y] points
 * using cubic bezier curves with tiny seeded jitter on control points.
 * seedBase differentiates paths from different widgets.
 */
export function wobblePath(points: [number, number][], seedBase: number = 0): string {
  if (points.length === 0) return ''
  if (points.length === 1) {
    return `M ${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`
  }

  let d = `M ${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`

  for (let i = 1; i < points.length; i++) {
    const [x1, y1] = points[i - 1]
    const [x2, y2] = points[i]
    const s = seedBase + i * 13

    // Jitter amplitude proportional to distance, capped at 2.5px
    const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
    const amp = Math.min(dist * 0.08, 2.5)

    // Cubic bezier control points near the two thirds of each segment
    const cp1x = (x1 * 0.6 + x2 * 0.4) + jitter(s,     amp)
    const cp1y = (y1 * 0.6 + y2 * 0.4) + jitter(s + 1, amp)
    const cp2x = (x1 * 0.4 + x2 * 0.6) + jitter(s + 2, amp)
    const cp2y = (y1 * 0.4 + y2 * 0.6) + jitter(s + 3, amp)

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`
  }

  return d
}

/**
 * Builds a wobbly closed circle SVG path centred at (cx, cy) with radius r.
 * Uses a 4-segment cubic bezier approximation of a circle plus seeded jitter.
 * Looks hand-drawn at any radius.
 */
export function wobbleCircle(cx: number, cy: number, r: number, seed: number): string {
  const k = r * 0.5522 // bezier circle control-point constant
  const j = (s: number) => jitter(seed + s, r * 0.22)
  return [
    `M ${(cx + j(0)).toFixed(1)},${(cy - r + j(1)).toFixed(1)}`,
    `C ${(cx + k + j(2)).toFixed(1)},${(cy - r + j(3)).toFixed(1)}`,
    `  ${(cx + r + j(4)).toFixed(1)},${(cy - k + j(5)).toFixed(1)}`,
    `  ${(cx + r + j(6)).toFixed(1)},${(cy + j(7)).toFixed(1)}`,
    `C ${(cx + r + j(8)).toFixed(1)},${(cy + k + j(9)).toFixed(1)}`,
    `  ${(cx + k + j(10)).toFixed(1)},${(cy + r + j(11)).toFixed(1)}`,
    `  ${(cx + j(12)).toFixed(1)},${(cy + r + j(13)).toFixed(1)}`,
    `C ${(cx - k + j(14)).toFixed(1)},${(cy + r + j(15)).toFixed(1)}`,
    `  ${(cx - r + j(16)).toFixed(1)},${(cy + k + j(17)).toFixed(1)}`,
    `  ${(cx - r + j(18)).toFixed(1)},${(cy + j(19)).toFixed(1)}`,
    `C ${(cx - r + j(20)).toFixed(1)},${(cy - k + j(21)).toFixed(1)}`,
    `  ${(cx - k + j(22)).toFixed(1)},${(cy - r + j(23)).toFixed(1)}`,
    `  ${(cx + j(24)).toFixed(1)},${(cy - r + j(25)).toFixed(1)} Z`,
  ].join(' ')
}

// ── Data Helpers ──────────────────────────────────────────────

/**
 * Normalises an array of values to [0, 1].
 * Returns 0.5 for all if range is zero (all identical values).
 */
export function normalise(values: number[]): number[] {
  if (values.length === 0) return []
  const min = Math.min(...values)
  const max = Math.max(...values)
  if (min === max) return values.map(() => 0.5)
  return values.map((v) => (v - min) / (max - min))
}

/**
 * Resolves entries from any compatible source widget type into
 * a flat array of { day, value } pairs.
 *
 * Detects source type by the shape of the stored JSON value:
 *   number-log   → { value: number }
 *   mood-tracker → { mood: number }
 *   counter      → { count: number }
 *
 * null values (number-log with no reading) are skipped.
 */
export function resolveDataSeries(
  entries: Array<{ day: number; value: unknown }>,
): Array<{ day: number; value: number }> {
  const result: Array<{ day: number; value: number }> = []
  for (const entry of entries) {
    if (!entry.value || typeof entry.value !== 'object') continue
    const val = entry.value as Record<string, unknown>

    if ('value' in val && typeof val.value === 'number') {
      // number-log — skip null readings
      result.push({ day: entry.day, value: val.value })
    } else if ('mood' in val && typeof val.mood === 'number') {
      // mood-tracker
      result.push({ day: entry.day, value: val.mood })
    } else if ('count' in val && typeof val.count === 'number') {
      // counter
      result.push({ day: entry.day, value: val.count })
    }
  }
  return result
}
