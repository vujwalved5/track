'use client'

/**
 * Widget Configuration Card (Task 6 Tucked Loose Paper Style)
 * Memorable Moments — Phase 4 / Task 7
 *
 * Rules:
 * - NO modals, NO backdrops, NO centred overlays (Correction 1).
 * - "Card" terminology strictly used in code and comments.
 * - Dynamic generation supporting ONLY: string, number, boolean, enum (Correction 4).
 * - Kalam handwriting font, strictly L6 palette (paper #f4eddc, ink #1c2433, redpen #b3261e).
 * - Red-pen text on error (Correction 6).
 */

import React, { useState } from 'react'
import { z } from 'zod'
import type { WidgetData } from './types'
import { getWidgetDefinition } from './registry'
import { updateWidgetConfig } from './widgetActions'

interface WidgetConfigCardProps {
  widget: WidgetData
  onClose: () => void
  onSaved: (updatedWidget: WidgetData) => void
}

type SupportedFieldType =
  | { kind: 'string'; defaultValue: string }
  | { kind: 'number'; defaultValue: number }
  | { kind: 'boolean'; defaultValue: boolean }
  | { kind: 'enum'; options: string[]; defaultValue: string }

/**
 * Unwraps Zod wrapper types (Optional, Nullable, Default) to inspect the core type.
 */
function unwrapZodType(type: z.ZodTypeAny): z.ZodTypeAny {
  if (
    type instanceof z.ZodOptional ||
    type instanceof z.ZodNullable ||
    type instanceof z.ZodDefault
  ) {
    return unwrapZodType(type._def.innerType)
  }
  return type
}

/**
 * Extracts supported schema field descriptors (string, number, boolean, enum).
 */
function extractSchemaFields(
  schema: z.ZodTypeAny,
): Record<string, SupportedFieldType> {
  const fields: Record<string, SupportedFieldType> = {}

  if (!(schema instanceof z.ZodObject)) {
    return fields
  }

  const shape = schema.shape as Record<string, z.ZodTypeAny>

  for (const [key, rawType] of Object.entries(shape)) {
    const unwrapped = unwrapZodType(rawType)

    if (unwrapped instanceof z.ZodString) {
      fields[key] = { kind: 'string', defaultValue: '' }
    } else if (unwrapped instanceof z.ZodNumber) {
      fields[key] = { kind: 'number', defaultValue: 0 }
    } else if (unwrapped instanceof z.ZodBoolean) {
      fields[key] = { kind: 'boolean', defaultValue: false }
    } else if (unwrapped instanceof z.ZodEnum) {
      fields[key] = {
        kind: 'enum',
        options: unwrapped._def.values as string[],
        defaultValue: (unwrapped._def.values as string[])[0] || '',
      }
    }
  }

  return fields
}

export function WidgetConfigCard({
  widget,
  onClose,
  onSaved,
}: WidgetConfigCardProps) {
  const definition = getWidgetDefinition(widget.type)
  const schema = definition?.schema || z.object({})
  const schemaFields = extractSchemaFields(schema)

  const [formData, setFormData] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {}
    for (const [key, desc] of Object.entries(schemaFields)) {
      if (widget.config && widget.config[key] !== undefined) {
        initial[key] = widget.config[key]
      } else {
        initial[key] = desc.defaultValue
      }
    }
    return initial
  })

  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleChange = (key: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    setErrorMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setErrorMessage(null)

    // Validate using Zod schema
    const validation = schema.safeParse(formData)
    if (!validation.success) {
      setErrorMessage(validation.error.errors[0]?.message || 'Invalid input')
      setIsSaving(false)
      return
    }

    const res = await updateWidgetConfig(widget.id, validation.data)
    setIsSaving(false)

    if (!res.success || !res.data) {
      setErrorMessage(res.error || 'Failed to save configuration')
      return
    }

    onSaved(res.data)
    onClose()
  }

  return (
    <div
      className="absolute top-12 right-12 z-40 w-80 bg-paper border border-ink/40 rounded-sm shadow-[3px_6px_18px_rgba(28,36,51,0.28)] -rotate-1 p-5 select-none font-hand"
      style={{
        backgroundImage:
          'repeating-linear-gradient(45deg,transparent,transparent 1px,rgba(28,36,51,0.012) 1px,rgba(28,36,51,0.012) 2px)',
      }}
      role="region"
      aria-label="Widget configuration card"
    >
      {/* Top tucked brass clip / pin */}
      <div
        className="absolute -top-3 left-8 w-10 h-4 bg-kraft/40 border border-ink/20 rounded-sm shadow-xs pointer-events-none"
        aria-hidden="true"
      />

      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-ink/15">
        <div>
          <h2 className="text-base font-bold text-ink tracking-wide">
            {definition?.displayName || 'Widget'} Settings
          </h2>
          <span className="text-[11px] text-ink/60">Tucked note</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-ink/60 hover:text-redpen text-lg font-bold px-1.5 py-0.5 cursor-pointer transition-colors"
          aria-label="Close configuration card"
          title="Close card"
        >
          ✕
        </button>
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSubmit} className="pt-4 flex flex-col gap-4">
        {Object.entries(schemaFields).map(([key, field]) => {
          const value = formData[key]

          switch (field.kind) {
            case 'string':
              return (
                <div key={key} className="flex flex-col gap-1">
                  <label
                    htmlFor={`field-${key}`}
                    className="text-xs font-bold text-ink/80 capitalize"
                  >
                    {key}
                  </label>
                  <textarea
                    id={`field-${key}`}
                    rows={3}
                    value={typeof value === 'string' ? value : ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="w-full bg-paper/60 border-b border-dotted border-ink/50 focus:border-ink focus:outline-none text-sm text-ink font-hand p-1 resize-none"
                    placeholder="Enter text..."
                  />
                </div>
              )

            case 'number':
              return (
                <div key={key} className="flex flex-col gap-1">
                  <label
                    htmlFor={`field-${key}`}
                    className="text-xs font-bold text-ink/80 capitalize"
                  >
                    {key}
                  </label>
                  <input
                    id={`field-${key}`}
                    type="number"
                    value={typeof value === 'number' ? value : 0}
                    onChange={(e) =>
                      handleChange(key, parseFloat(e.target.value) || 0)
                    }
                    className="w-full bg-paper/60 border-b border-dotted border-ink/50 focus:border-ink focus:outline-none text-sm text-ink font-hand p-1"
                  />
                </div>
              )

            case 'boolean':
              return (
                <div key={key} className="flex items-center gap-2 pt-1">
                  <input
                    id={`field-${key}`}
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={(e) => handleChange(key, e.target.checked)}
                    className="w-4 h-4 accent-ink cursor-pointer"
                  />
                  <label
                    htmlFor={`field-${key}`}
                    className="text-xs font-bold text-ink/80 capitalize cursor-pointer select-none"
                  >
                    {key}
                  </label>
                </div>
              )

            case 'enum':
              return (
                <div key={key} className="flex flex-col gap-1">
                  <label
                    htmlFor={`field-${key}`}
                    className="text-xs font-bold text-ink/80 capitalize"
                  >
                    {key}
                  </label>
                  <select
                    id={`field-${key}`}
                    value={typeof value === 'string' ? value : field.options[0]}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="w-full bg-paper border border-ink/30 rounded p-1 text-xs text-ink font-hand focus:outline-none cursor-pointer"
                  >
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              )

            default:
              return null
          }
        })}

        {/* Red-Pen Error Message Display (Correction 6) */}
        {errorMessage && (
          <p className="text-xs text-redpen font-hand mt-1 leading-snug">
            {errorMessage}
          </p>
        )}

        {/* Card Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-ink/15">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-ink/70 hover:text-ink font-hand cursor-pointer px-2 py-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="bg-gold/90 hover:bg-gold text-ink font-bold text-xs px-4 py-1.5 rounded-sm border border-kraft/60 shadow-[1px_2px_4px_rgba(28,36,51,0.2)] transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save card'}
          </button>
        </div>
      </form>
    </div>
  )
}
