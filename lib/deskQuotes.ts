/**
 * Daily Desk Quotes & Deterministic Rotation
 * Memorable Moments — Home Desk Environment (Task 15)
 *
 * Rules:
 * - 11 classical verified quotes under 15 words (Quote 11 Wendell Berry dropped for copyright).
 * - Wording to be spot-checked against sources by the owner.
 * - Pure stateless modulo day-of-year calculation (zero Math.random, zero network, zero state).
 * - Rotates over quotes.length dynamically.
 */

export interface DeskQuote {
  quote: string
  author: string
  work: string
  words: number
}

// Wording to be spot-checked against sources by the owner.
export const DESK_QUOTES: readonly DeskQuote[] = [
  {
    quote: 'Occupy thyself with few things, if thou wouldst be tranquil.',
    author: 'Marcus Aurelius',
    work: 'Meditations',
    words: 10,
  },
  {
    quote: 'Life is long if you know how to use it.',
    author: 'Lucius Annaeus Seneca',
    work: 'De Brevitate Vitae',
    words: 10,
  },
  {
    quote: 'To affect the quality of the day, that is the highest of arts.',
    author: 'Henry David Thoreau',
    work: 'Walden',
    words: 13,
  },
  {
    quote: 'Nothing can bring you peace but yourself.',
    author: 'Ralph Waldo Emerson',
    work: 'Self-Reliance',
    words: 7,
  },
  {
    quote: 'My experience is what I agree to attend to.',
    author: 'William James',
    work: 'The Principles of Psychology',
    words: 9,
  },
  {
    quote: 'Forever is composed of Nows.',
    author: 'Emily Dickinson',
    work: 'Poem 690',
    words: 5,
  },
  {
    quote: 'The journey of a thousand li commenced with a single step.',
    author: 'Lao Tzu',
    work: 'Tao Te Ching',
    words: 11,
  },
  {
    quote: 'Go into yourself.',
    author: 'Rainer Maria Rilke',
    work: 'Letters to a Young Poet',
    words: 3,
  },
  {
    quote: 'In every walk with nature one receives far more than he seeks.',
    author: 'John Muir',
    work: 'Steep Trails',
    words: 12,
  },
  {
    quote: 'Small rooms or dwellings discipline the mind, large ones weaken it.',
    author: 'Leonardo da Vinci',
    work: 'The Notebooks',
    words: 11,
  },
  {
    quote: 'Come forth into the light of things, let nature be your teacher.',
    author: 'William Wordsworth',
    work: 'The Tables Turned',
    words: 12,
  },
] as const

/**
 * Deterministically selects one quote index based on the calendar date.
 * Pure mathematical calculation: zero network queries, zero state, zero Math.random().
 */
export function getDailyDeskQuoteIndex(
  date: Date = new Date(),
  totalQuotes: number = DESK_QUOTES.length,
): number {
  if (totalQuotes <= 0) return 0
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()
  const utcDate = Date.UTC(year, month, day)
  const utcStart = Date.UTC(year, 0, 1)
  const oneDayMs = 1000 * 60 * 60 * 24
  const dayOfYear = Math.floor((utcDate - utcStart) / oneDayMs) + 1 // Range: 1 to 366
  return ((dayOfYear - 1) % totalQuotes + totalQuotes) % totalQuotes
}

/**
 * Returns today's deterministic quote.
 */
export function getDailyDeskQuote(date: Date = new Date()): DeskQuote {
  const index = getDailyDeskQuoteIndex(date, DESK_QUOTES.length)
  return DESK_QUOTES[index]
}
