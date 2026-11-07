'use client'

/**
 * Checklist Widget
 * Memorable Moments — Phase 5 / Task 10 Batch B
 *
 * Rules:
 * - Group: 'Ask' (Correction 1)
 * - Default size: 10x10 (10 cols × 10 rows on 22px grid = 220px × 220px)
 * - Min size: 6x6
 * - Items stored in entries at day = 1 as { items: [{ text, ticked, crossed }] } (Correction 4)
 * - No config items (Correction 4)
 * - Hand-drawn tick boxes toggle ticked
 * - Small hand-drawn cross at line end toggles crossed (visible on hover/focus, always on touch)
 * - New item added by writing on blank line at bottom
 * - Palette L6 only, fonts L5 only, no emoji, hand-drawn SVG icon (L13)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { z } from 'zod'
import type { WidgetDefinition, WidgetRenderProps } from '../types'
import { checklistEntrySchema } from '../entryActions'
import { saveWidgetEntryAndBump, getWidgetEntriesWithCache } from '../entryHelpers'

// ── Zod Config Schema ─────────────────────────────────────────
export const checklistConfigSchema = z.object({
  title: z.string().default('Checklist'),
})

export type ChecklistConfig = z.infer<typeof checklistConfigSchema>

interface ChecklistItem {
  text: string
  ticked: boolean
  crossed: boolean
}

// ── Hand-Drawn SVG Icon ───────────────────────────────────────
export function ChecklistIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      {/* Clipboard frame */}
      <rect x="4" y="3.5" width="16" height="17" rx="1" strokeWidth="1.6" />
      {/* Top clip */}
      <rect x="8.5" y="2" width="7" height="3" rx="0.5" strokeWidth="1.2" />
      {/* Checked item */}
      <rect x="6.5" y="7.5" width="3" height="3" strokeWidth="1.2" />
      <path d="M 6.8 9 L 7.8 10.2 L 9.8 7.8" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M 11.5 9 L 17 9" strokeWidth="1.3" strokeLinecap="round" />
      {/* Second item */}
      <rect x="6.5" y="12.5" width="3" height="3" strokeWidth="1.2" />
      <path d="M 11.5 14 L 17 14" strokeWidth="1.3" strokeLinecap="round" />
      {/* Third item */}
      <rect x="6.5" y="16.5" width="3" height="3" strokeWidth="1.2" />
      <path d="M 11.5 18 L 16 18" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

// ── Hand-Drawn SVG Checkbox ───────────────────────────────────
function HandDrawnCheckbox({
  ticked,
  onClick,
  disabled,
}: {
  ticked: boolean
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      aria-label={ticked ? 'Mark incomplete' : 'Mark complete'}
      className="w-4 h-4 shrink-0 flex items-center justify-center cursor-pointer focus:outline-none"
    >
      <svg
        viewBox="0 0 16 16"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        className="text-ink"
        aria-hidden="true"
      >
        {/* Wobbly box outline */}
        <path
          d="M 2.5 2.8 C 6 2.3, 10 2.6, 13.5 2.5 C 13.8 6, 13.4 10, 13.5 13.5 C 10 13.7, 6 13.3, 2.5 13.5 C 2.3 10, 2.7 6, 2.5 2.8 Z"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Hand-drawn tick */}
        {ticked && (
          <path
            d="M 4 8 C 5.5 9.5, 6.5 11, 7 12 C 8.5 9, 11 5, 13 3.5"
            stroke="#1c2433"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </button>
  )
}

// ── Desktop / Main Component ──────────────────────────────────
export function ChecklistDesktop({
  id,
  config,
  isArrangeMode,
}: WidgetRenderProps<ChecklistConfig>) {
  const title = config?.title || 'Checklist'

  const [items, setItems] = useState<ChecklistItem[]>([])
  const [newItemText, setNewItemText] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)
  const newRef = useRef<HTMLInputElement>(null)

  // Load items from DB at day = 1 (Correction 4)
  useEffect(() => {
    let cancelled = false
    async function load() {
      const res = await getWidgetEntriesWithCache(id)
      if (!cancelled && res.success && res.data) {
        const day1Row = res.data.find((e) => e.day === 1)
        if (day1Row) {
          const parsed = checklistEntrySchema.safeParse(day1Row.value)
          if (parsed.success) {
            setItems(parsed.data.items)
          }
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id])

  // Commit items array to entries at day = 1
  const commitItems = useCallback(
    async (nextItems: ChecklistItem[]) => {
      const prevItems = [...items]
      setItems(nextItems)

      const res = await saveWidgetEntryAndBump(id, 1, { items: nextItems })

      if (!res.success) {
        setItems(prevItems)
        setSaveError('Failed to save checklist')
        setTimeout(() => setSaveError(null), 3000)
      }
    },
    [id, items],
  )

  const toggleTick = (index: number) => {
    if (isArrangeMode) return
    const next = items.map((item, i) =>
      i === index ? { ...item, ticked: !item.ticked } : item,
    )
    commitItems(next)
  }

  const toggleCross = (index: number) => {
    if (isArrangeMode) return
    const next = items.map((item, i) =>
      i === index ? { ...item, crossed: !item.crossed } : item,
    )
    commitItems(next)
  }

  const handleItemTextChange = (index: number, newText: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, text: newText } : item)),
    )
  }

  const handleItemBlur = (index: number) => {
    const item = items[index]
    if (!item) return
    if (!item.text.trim()) {
      // Remove empty item
      const next = items.filter((_, i) => i !== index)
      commitItems(next)
    } else {
      commitItems(items)
    }
  }

  const handleAddNewItem = () => {
    const trimmed = newItemText.trim()
    if (!trimmed) return
    const next = [...items, { text: trimmed, ticked: false, crossed: false }]
    setNewItemText('')
    commitItems(next)
  }

  const handleNewKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddNewItem()
    }
  }

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-transparent select-none overflow-hidden p-2">
      {/* Title Header */}
      <div className="h-[20px] flex items-center justify-between border-b border-ink/20 px-1 shrink-0 mb-1">
        <span className="font-hand text-xs font-bold text-ink truncate">
          {title}
        </span>
        {items.length > 0 && (
          <span className="font-hand text-[9px] text-ink/50">
            {items.filter((it) => it.ticked).length}/{items.length}
          </span>
        )}
      </div>

      {/* Red-Pen Save Error Feedback */}
      {saveError && (
        <div
          className="absolute top-1 right-2 z-40 bg-paper border border-redpen px-1.5 py-0.5 rounded shadow text-redpen font-hand text-[9px]"
          role="alert"
        >
          {saveError}
        </div>
      )}

      {/* Items List (no inner scrolling) */}
      <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="group flex items-center gap-1.5 h-[22px] px-1 rounded-xs hover:bg-ink/[0.02] border-b border-ink/10"
          >
            {/* Hand-drawn checkbox */}
            <HandDrawnCheckbox
              ticked={item.ticked}
              onClick={() => toggleTick(idx)}
              disabled={isArrangeMode}
            />

            {/* Item text */}
            <div className="relative flex-1 h-full flex items-center">
              <input
                type="text"
                disabled={isArrangeMode}
                value={item.text}
                onChange={(e) => handleItemTextChange(idx, e.target.value)}
                onBlur={() => handleItemBlur(idx)}
                aria-label={`Checklist item ${idx + 1}`}
                className={`w-full bg-transparent font-hand text-[11px] text-ink focus:outline-none ${
                  item.crossed
                    ? 'opacity-40 line-through text-ink/50'
                    : item.ticked
                      ? 'text-ink/60'
                      : 'text-ink'
                }`}
              />

              {/* Hand-drawn strike if crossed */}
              {item.crossed && (
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none text-redpen/75"
                  viewBox="0 0 100 20"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M 2 10 Q 50 8, 98 11"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              )}
            </div>

            {/* Hand-drawn cross-out button at line end (visible on hover/focus, always on touch, Correction 4) */}
            <button
              type="button"
              disabled={isArrangeMode}
              onClick={() => toggleCross(idx)}
              title={item.crossed ? 'Restore item' : 'Cross out item'}
              aria-label={`Cross out ${item.text || 'item'}`}
              className={`shrink-0 w-4 h-4 flex items-center justify-center transition-opacity cursor-pointer ${
                item.crossed
                  ? 'opacity-80 text-redpen'
                  : 'opacity-0 group-hover:opacity-70 group-focus-within:opacity-70 md:opacity-0 active:opacity-100 text-ink/40 hover:text-redpen'
              }`}
            >
              <svg
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                className="w-3 h-3"
                aria-hidden="true"
              >
                <path
                  d="M 3 3 L 11 11 M 11 3 L 3 11"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        ))}

        {/* Blank line at bottom to add a new item (Correction 4) */}
        <div className="flex items-center gap-1.5 h-[22px] px-1 border-b border-dotted border-ink/20 mt-0.5">
          <span className="w-4 text-center font-hand text-xs text-ink/35 pointer-events-none">
            +
          </span>
          <input
            ref={newRef}
            type="text"
            disabled={isArrangeMode}
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={handleNewKeyDown}
            onBlur={handleAddNewItem}
            placeholder="Write an item..."
            aria-label="Add new checklist item"
            className="flex-1 bg-transparent font-hand text-[11px] text-ink placeholder:text-ink/30 focus:outline-none"
          />
        </div>
      </div>
    </div>
  )
}

// ── Mobile Render Component (Task 11 placeholder) ─────────────
export function ChecklistMobile(props: WidgetRenderProps<ChecklistConfig>) {
  return <ChecklistDesktop {...props} />
}

// ── Widget Definition ─────────────────────────────────────────
export const checklistWidgetDefinition: WidgetDefinition<typeof checklistConfigSchema> = {
  id: 'checklist',
  displayName: 'Checklist',
  group: 'Ask',
  defaultSize: { w: 10, h: 10 },
  minSize: { w: 6, h: 6 },
  schema: checklistConfigSchema,
  component: ChecklistDesktop,
  mobileComponent: ChecklistMobile,
  icon: ChecklistIcon,
}
