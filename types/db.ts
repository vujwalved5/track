/**
 * TypeScript types for Memorable Moments — matches the DB schema exactly.
 * Generated manually from migration 0001_initial_schema.sql.
 * Update here whenever the schema changes.
 */

export type PaperStyle = 'dotted' | 'squared' | 'lined' | 'blank'
export type PageSide   = 'left' | 'right'

export interface HabitConfig {
  name: string
  isRed: boolean
}

export interface TrackedNumbersConfig {
  weight: boolean
  sleepScore: boolean
  mood: boolean
  custom: Array<{ name: string; enabled: boolean }>
}

export type StartingLayout = 'journal' | 'empty'

export interface MonthSetupConfig {
  habits?: HabitConfig[]
  trackedNumbers?: TrackedNumbersConfig
  startingLayout?: StartingLayout
  [key: string]: unknown
}

// ── books ─────────────────────────────────────────────────────
export type Book = {
  id:         string        // uuid
  created_at: string        // timestamptz (ISO string)
  user_id:    string        // uuid — references auth.users
  year:       number        // int
}

export type BookInsert = Omit<Book, 'id' | 'created_at'>
export type BookUpdate = Partial<Omit<Book, 'id' | 'created_at' | 'user_id'>>

// ── months ────────────────────────────────────────────────────
export type Month = {
  id:               string      // uuid
  created_at:       string      // timestamptz
  book_id:          string      // uuid — references books
  month:            number      // 1-12
  setup_done:       boolean
  paper_left:       PaperStyle
  paper_right:      PaperStyle
  next_month_note:  string | null
  setup_config:     Record<string, unknown>  // jsonb
}

export type MonthInsert = Omit<Month, 'id' | 'created_at'>
export type MonthUpdate = Partial<Omit<Month, 'id' | 'created_at' | 'book_id'>>

// ── widgets ───────────────────────────────────────────────────
export type Widget = {
  id:         string                    // uuid
  created_at: string                    // timestamptz
  month_id:   string                    // uuid — references months
  page:       PageSide
  type:       string
  x:          number                    // grid units (22px)
  y:          number
  w:          number
  h:          number
  config:     Record<string, unknown>   // jsonb
  z:          number
}

export type WidgetInsert = Omit<Widget, 'id' | 'created_at'>
export type WidgetUpdate = Partial<Omit<Widget, 'id' | 'created_at' | 'month_id'>>

// ── entries ───────────────────────────────────────────────────
export type Entry = {
  id:         string                    // uuid
  created_at: string                    // timestamptz
  widget_id:  string                    // uuid — references widgets
  day:        number                    // 1-31
  value:      Record<string, unknown>   // jsonb
}

export type EntryInsert = Omit<Entry, 'id' | 'created_at'>
export type EntryUpdate = Partial<Omit<Entry, 'id' | 'created_at' | 'widget_id'>>

// ── convenience union ─────────────────────────────────────────
export type Database = {
  public: {
    Tables: {
      books: {
        Row: Book
        Insert: BookInsert
        Update: BookUpdate
        Relationships: Array<{
          foreignKeyName: string
          columns: string[]
          isOneToOne?: boolean
          referencedRelation: string
          referencedColumns: string[]
        }>
      }
      months: {
        Row: Month
        Insert: MonthInsert
        Update: MonthUpdate
        Relationships: Array<{
          foreignKeyName: string
          columns: string[]
          isOneToOne?: boolean
          referencedRelation: string
          referencedColumns: string[]
        }>
      }
      widgets: {
        Row: Widget
        Insert: WidgetInsert
        Update: WidgetUpdate
        Relationships: Array<{
          foreignKeyName: string
          columns: string[]
          isOneToOne?: boolean
          referencedRelation: string
          referencedColumns: string[]
        }>
      }
      entries: {
        Row: Entry
        Insert: EntryInsert
        Update: EntryUpdate
        Relationships: Array<{
          foreignKeyName: string
          columns: string[]
          isOneToOne?: boolean
          referencedRelation: string
          referencedColumns: string[]
        }>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
