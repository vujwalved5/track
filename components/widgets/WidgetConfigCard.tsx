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
  allWidgets?: WidgetData[]
}

type SupportedFieldType =
  | { kind: 'string'; defaultValue: string }
  | { kind: 'number'; defaultValue: number }
  | { kind: 'boolean'; defaultValue: boolean }
  | { kind: 'enum'; options: string[]; defaultValue: string }
  | { kind: 'widgetSource'; compatibleTypes: string[]; defaultValue: string }

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
  widgetType?: string,
): Record<string, SupportedFieldType> {
  const fields: Record<string, SupportedFieldType> = {}

  if (!(schema instanceof z.ZodObject)) {
    return fields
  }

  const shape = schema.shape as Record<string, z.ZodTypeAny>

  for (const [key, rawType] of Object.entries(shape)) {
    // Skip internal mirror fields and deprecated fields
    if (key === 'xSourceWidgetId' || key === 'ySourceWidgetId' || key === 'vertical') {
      continue
    }

    const unwrapped = unwrapZodType(rawType)

    if (unwrapped instanceof z.ZodString) {
      // Detect widgetSource picker: field for widget data source
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const description =
        rawType.description ||
        unwrapped.description ||
        (rawType as any)._def?.description ||
        (unwrapped as any)._def?.description

      const isSourceKey =
        key === 'sourceWidgetId' ||
        key === 'sourceWidgetId2' ||
        key.endsWith('SourceId') ||
        key.endsWith('WidgetId') ||
        key.toLowerCase().includes('source')

      if (isSourceKey) {
        let compatibleTypes: string[] = []
        if (description) {
          compatibleTypes = description
            .split(',')
            .map((t: string) => t.trim())
            .filter(Boolean)
        }
        if (compatibleTypes.length === 0) {
          if (widgetType === 'donut') {
            compatibleTypes = ['poll', 'habit-tracker']
          } else if (widgetType === 'goal-bar') {
            compatibleTypes = ['counter', 'number-log']
          } else {
            compatibleTypes = ['number-log', 'counter', 'mood-tracker']
          }
        }
        fields[key] = { kind: 'widgetSource', compatibleTypes, defaultValue: '' }
      } else {
        fields[key] = { kind: 'string', defaultValue: '' }
      }
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

/**
 * Returns a human-readable title for a widget in the source picker dropdown.
 * Format: title, label, or question (e.g. "Sleep score"), falling back to displayName.
 */
function getWidgetDisplayTitle(w: WidgetData): string {
  const cfg = (w.config || {}) as Record<string, unknown>
  for (const key of ['title', 'label', 'question']) {
    const candidate = cfg[key]
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate.trim()
    }
  }
  const def = getWidgetDefinition(w.type)
  return def?.displayName || w.type
}

// ── Hand-Drawn Radio Circle & Tick (L13, no emoji) ────────────
function HandDrawnRadioCircle({ checked }: { checked: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      className="shrink-0 text-ink"
    >
      {/* Hand-drawn wobbly circle outline */}
      <path
        d="M 8 2.5 C 11.2 2.2, 13.8 4.8, 13.5 8 C 13.7 11.2, 11.2 13.8, 8 13.5 C 4.8 13.7, 2.2 11.2, 2.5 8 C 2.2 4.8, 4.8 2.2, 8 2.5"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Hand-drawn pen tick when selected */}
      {checked && (
        <path
          d="M 4.5 8.2 C 6 9.5, 6.8 11, 7.2 11.5 C 8.5 9, 10.5 5.5, 12.5 4"
          stroke="#1c2433"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}

// ── Shared Handwritten Radio List for Config Card ─────────────
interface HandwrittenRadioListProps {
  name: string
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
  emptyMessage?: string
}

function HandwrittenRadioList({
  name,
  label,
  value,
  options,
  onChange,
  emptyMessage,
}: HandwrittenRadioListProps) {
  return (
    <div className="flex flex-col gap-1" role="radiogroup" aria-label={label}>
      <span className="text-xs font-bold text-ink/80 capitalize">
        {label}
      </span>

      {options.length === 0 && emptyMessage ? (
        <p className="text-[10px] text-ink/70 font-hand italic leading-tight">
          {emptyMessage}
        </p>
      ) : (
        <div className="flex flex-col gap-0.5">
          {options.map((opt) => {
            const isChecked = value === opt.value
            return (
              <label
                key={opt.value}
                className={`flex items-center gap-2 px-2 py-1 rounded-xs font-hand text-xs text-ink cursor-pointer transition-colors border border-transparent select-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#ffd84a] has-[:focus-visible]:bg-[#ffd84a]/25 ${
                  isChecked
                    ? 'bg-ink/[0.05] border-ink/20 font-semibold'
                    : 'hover:bg-ink/[0.03]'
                }`}
              >
                <input
                  type="radio"
                  name={name}
                  value={opt.value}
                  checked={isChecked}
                  onChange={() => onChange(opt.value)}
                  className="sr-only"
                />
                <HandDrawnRadioCircle checked={isChecked} />
                <span className="truncate">{opt.label}</span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function WidgetConfigCard({
  widget,
  onClose,
  onSaved,
  allWidgets,
}: WidgetConfigCardProps) {
  const definition = getWidgetDefinition(widget.type)
  const schema = definition?.schema || z.object({})
  const schemaFields = extractSchemaFields(schema, widget.type)

  const [formData, setFormData] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {}
    for (const [key, desc] of Object.entries(schemaFields)) {
      if (widget.config && widget.config[key] !== undefined) {
        initial[key] = widget.config[key]
      } else {
        initial[key] = desc.defaultValue
      }
    }
    if (widget.type === 'line-graph') {
      // Read orientation first. Only if orientation is missing, treat vertical === true as "down", otherwise "across".
      const hasExplicitOrientation =
        widget.config?.orientation === 'down' || widget.config?.orientation === 'across'
      if (!hasExplicitOrientation) {
        initial['orientation'] = widget.config?.vertical === true ? 'down' : 'across'
      }
    }
    if (widget.type === 'scatter-plot') {
      if (!initial['sourceWidgetId'] && widget.config?.['xSourceWidgetId']) {
        initial['sourceWidgetId'] = widget.config['xSourceWidgetId']
      }
      if (!initial['sourceWidgetId2'] && widget.config?.['ySourceWidgetId']) {
        initial['sourceWidgetId2'] = widget.config['ySourceWidgetId']
      }
    }
    return initial
  })

  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleChange = (key: string, value: unknown) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: value }
      if (widget.type === 'scatter-plot') {
        if (key === 'sourceWidgetId') {
          next.xSourceWidgetId = value
        } else if (key === 'sourceWidgetId2') {
          next.ySourceWidgetId = value
        }
      }
      return next
    })
    setErrorMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setErrorMessage(null)

    // Offline guard (Correction 3): configuring widgets needs a connection
    if (typeof window !== 'undefined' && !navigator.onLine) {
      setErrorMessage('needs a connection')
      setIsSaving(false)
      return
    }

    const payload = { ...formData }
    // Line graph: write orientation only, do not write vertical any more
    delete payload.vertical

    if (widget.type === 'scatter-plot') {
      if (payload.sourceWidgetId !== undefined) {
        payload.xSourceWidgetId = payload.sourceWidgetId
      }
      if (payload.sourceWidgetId2 !== undefined) {
        payload.ySourceWidgetId = payload.sourceWidgetId2
      }
    }

    // Validate using Zod schema
    const validation = schema.safeParse(payload)
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

    const savedWidget = { ...res.data }
    if (widget.type === 'scatter-plot' && savedWidget.config) {
      savedWidget.config = {
        ...savedWidget.config,
        sourceWidgetId:
          (savedWidget.config.sourceWidgetId as string) ||
          (savedWidget.config.xSourceWidgetId as string) ||
          '',
        sourceWidgetId2:
          (savedWidget.config.sourceWidgetId2 as string) ||
          (savedWidget.config.ySourceWidgetId as string) ||
          '',
      }
    }

    onSaved(savedWidget)
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
          <span className="text-[11px] text-ink/70">Tucked note</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-ink/70 hover:text-redpen p-1 cursor-pointer transition-colors"
          aria-label="Close configuration card"
          title="Close card"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              d="M 3.5 3.5 L 12.5 12.5 M 12.5 3.5 L 3.5 12.5"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSubmit} className="pt-4 flex flex-col gap-4">
        {Object.entries(schemaFields).map(([key, field]) => {
          const value = formData[key]

          if (key === 'orientation') {
            return (
              <div key={key} className="flex flex-col gap-1">
                <label
                  htmlFor={`field-${key}`}
                  className="text-xs font-bold text-ink/80"
                >
                  Direction
                </label>
                <select
                  id={`field-${key}`}
                  value={typeof value === 'string' ? value : 'across'}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full bg-paper/60 border-b border-dotted border-ink/50 focus:border-ink focus:outline-none text-sm text-ink font-hand p-1 cursor-pointer"
                >
                  <option value="across" className="bg-paper text-ink font-hand">
                    Across the page
                  </option>
                  <option value="down" className="bg-paper text-ink font-hand">
                    Down the page
                  </option>
                </select>
              </div>
            )
          }

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
                <HandwrittenRadioList
                  key={key}
                  name={`field-${key}`}
                  label={key}
                  value={typeof value === 'string' ? value : field.options[0]}
                  options={field.options.map((opt) => ({ value: opt, label: opt }))}
                  onChange={(val) => handleChange(key, val)}
                />
              )

            case 'widgetSource': {
              const compatibleWidgets = (allWidgets || []).filter(
                (w) => field.compatibleTypes.includes(w.type) && w.id !== widget.id,
              )

              let friendlyLabel = 'Data from'
              if (widget.type === 'scatter-plot') {
                if (key === 'sourceWidgetId') {
                  friendlyLabel = 'X axis data'
                } else if (key === 'sourceWidgetId2') {
                  friendlyLabel = 'Y axis data'
                }
              }

              return (
                <div key={key} className="flex flex-col gap-1">
                  <label
                    htmlFor={compatibleWidgets.length > 0 ? `field-${key}` : undefined}
                    className="text-xs font-bold text-ink/80"
                  >
                    {friendlyLabel}
                  </label>

                  {compatibleWidgets.length === 0 ? (
                    <p className="font-hand text-xs text-ink/70 italic py-1">
                      Add a Number Log first.
                    </p>
                  ) : (
                    <select
                      id={`field-${key}`}
                      value={typeof value === 'string' ? value : ''}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="w-full bg-paper/60 border-b border-dotted border-ink/50 focus:border-ink focus:outline-none text-sm text-ink font-hand p-1 cursor-pointer"
                    >
                      <option value="" className="bg-paper text-ink font-hand">
                        Select source
                      </option>
                      {compatibleWidgets.map((w) => (
                        <option
                          key={w.id}
                          value={w.id}
                          className="bg-paper text-ink font-hand"
                        >
                          {getWidgetDisplayTitle(w)}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )
            }

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
            {isSaving ? 'turning the page...' : 'Save card'}
          </button>
        </div>
      </form>
    </div>
  )
}
