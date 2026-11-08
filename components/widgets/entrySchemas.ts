import { z } from 'zod'

// ── Zod Schemas for Entry Values ──────────────────────────────
export const memorableMomentsEntrySchema = z.object({
  text: z.string().default(''),
  highlighted: z.boolean().default(false),
  crossedOut: z.boolean().default(false),
})

export const habitTrackerEntrySchema = z.object({
  marks: z.record(z.boolean()).default({}),
})

export const counterEntrySchema = z.object({
  count: z.number().int(),
})

export const pollEntrySchema = z.object({
  selectedOption: z.string(),
})

export const numberLogEntrySchema = z.object({
  value: z.number().nullable(),
})

export const moodTrackerEntrySchema = z.object({
  mood: z.number().int().min(1).max(5),
})

export const checklistItemSchema = z.object({
  text: z.string(),
  ticked: z.boolean().default(false),
  crossed: z.boolean().default(false),
})

export const checklistEntrySchema = z.object({
  items: z.array(checklistItemSchema).default([]),
})

export const entryPayloadSchema = z.object({
  widgetId: z.string().uuid(),
  day: z.number().int().min(1).max(31),
  value: z.record(z.unknown()),
})
