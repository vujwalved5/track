'use client'

/**
 * Widget Wrapper Component
 * Memorable Moments — Phase 4 / Task 7
 *
 * Locked rules:
 * - Positioned strictly by x, y, w, h in 22px units (L7, L10)
 * - Dragging via @dnd-kit/core only (Correction 2)
 * - Resizing via plain pointer events on corner handle (Correction 2)
 * - Bounds, minSize, and no-overlap enforced in UI (Correction 3)
 * - Handwritten red-pen cross-out action for removal (L6, L13)
 * - Tucked card configuration trigger (Correction 1)
 */

import React, { useState, useRef, useEffect } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { WidgetData, WidgetRect } from './types'
import {
  GRID_PX,
  PAGE_COLS,
  PAGE_ROWS,
  hasOverlap,
  isWithinBounds,
} from './types'
import { getWidgetDefinition } from './registry'

interface WidgetWrapperProps {
  widget: WidgetData
  year?: number
  month?: number
  setupConfig?: Record<string, unknown>
  isArrangeMode: boolean
  otherWidgets: WidgetData[]
  onResizeEnd: (
    widgetId: string,
    newSize: { w: number; h: number },
  ) => Promise<void>
  onRemove: (widgetId: string) => void
  onOpenConfig: (widgetId: string) => void
}

export function WidgetWrapper({
  widget,
  year,
  month,
  setupConfig,
  isArrangeMode,
  otherWidgets,
  onResizeEnd,
  onRemove,
  onOpenConfig,
}: WidgetWrapperProps) {
  const definition = getWidgetDefinition(widget.type)
  const minW = definition?.minSize.w ?? 2
  const minH = definition?.minSize.h ?? 2

  // Live dimensions during resize
  const [liveW, setLiveW] = useState(widget.w)
  const [liveH, setLiveH] = useState(widget.h)
  const [isResizing, setIsResizing] = useState(false)

  // Keep live dimensions in sync with prop changes
  useEffect(() => {
    if (!isResizing) {
      setLiveW(widget.w)
      setLiveH(widget.h)
    }
  }, [widget.w, widget.h, isResizing])

  // @dnd-kit dragging
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: widget.id,
    disabled: !isArrangeMode || isResizing,
    data: {
      widget,
    },
  })

  // Resize pointer tracking refs
  const resizeRef = useRef<{
    startX: number
    startY: number
    startW: number
    startH: number
  } | null>(null)

  const handleResizePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isArrangeMode) return
    e.stopPropagation()
    e.preventDefault()

    const handle = e.currentTarget
    handle.setPointerCapture(e.pointerId)

    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: liveW,
      startH: liveH,
    }
    setIsResizing(true)
  }

  const handleResizePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isResizing || !resizeRef.current) return
    e.stopPropagation()

    const { startX, startY, startW, startH } = resizeRef.current
    const dx = e.clientX - startX
    const dy = e.clientY - startY

    const deltaCols = Math.round(dx / GRID_PX)
    const deltaRows = Math.round(dy / GRID_PX)

    let candidateW = startW + deltaCols
    let candidateH = startH + deltaRows

    // 1. Min size clamping
    candidateW = Math.max(minW, candidateW)
    candidateH = Math.max(minH, candidateH)

    // 2. Page bounds clamping
    candidateW = Math.min(candidateW, PAGE_COLS - widget.x)
    candidateH = Math.min(candidateH, PAGE_ROWS - widget.y)

    // 3. Strict no-overlap check
    const candidateRect: WidgetRect = {
      x: widget.x,
      y: widget.y,
      w: candidateW,
      h: candidateH,
    }

    const collides = otherWidgets.some((other) =>
      hasOverlap(candidateRect, {
        x: other.x,
        y: other.y,
        w: other.w,
        h: other.h,
      }),
    )

    if (!collides && isWithinBounds(candidateRect, PAGE_COLS, PAGE_ROWS)) {
      setLiveW(candidateW)
      setLiveH(candidateH)
    }
  }

  const handleResizePointerUp = async (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isResizing) return
    e.stopPropagation()

    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      // Ignore if pointer capture release fails
    }

    setIsResizing(false)
    resizeRef.current = null

    if (liveW !== widget.w || liveH !== widget.h) {
      await onResizeEnd(widget.id, { w: liveW, h: liveH })
    }
  }

  // Calculate layout pixel values
  const leftPx = widget.x * GRID_PX
  const topPx = widget.y * GRID_PX
  const widthPx = liveW * GRID_PX
  const heightPx = liveH * GRID_PX

  // DnD transform style
  const dndStyle = transform
    ? {
        transform: CSS.Translate.toString(transform),
        zIndex: 50,
      }
    : undefined

  const RenderComponent = definition?.component

  return (
    <div
      ref={setNodeRef}
      style={{
        position: 'absolute',
        left: leftPx,
        top: topPx,
        width: widthPx,
        height: heightPx,
        touchAction: isArrangeMode ? 'none' : 'auto',
        ...dndStyle,
      }}
      className={`group select-none ${
        isArrangeMode
          ? 'cursor-grab active:cursor-grabbing'
          : 'cursor-default'
      } ${isDragging ? 'opacity-70 shadow-lg' : ''}`}
      {...(isArrangeMode ? attributes : {})}
      {...(isArrangeMode ? listeners : {})}
    >
      {/* Arrange Mode dashed boundary outline */}
      {isArrangeMode && (
        <div
          className="absolute inset-0 border border-dashed border-ink/40 pointer-events-none rounded-sm z-30"
          aria-hidden="true"
        />
      )}

      {/* Render registered widget component */}
      <div className="w-full h-full relative">
        {RenderComponent ? (
          <RenderComponent
            id={widget.id}
            config={widget.config}
            w={liveW}
            h={liveH}
            isArrangeMode={isArrangeMode}
            year={year}
            month={month}
            setupConfig={setupConfig}
          />
        ) : (
          <div className="w-full h-full bg-paper/50 border border-ink/20 p-2 font-hand text-xs text-ink/70">
            {widget.type}
          </div>
        )}
      </div>

      {/* ── Arrange Mode Controls ────────────────────────────────── */}
      {isArrangeMode && (
        <>
          {/* Top-left: Settings Card Trigger */}
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              onOpenConfig(widget.id)
            }}
            className="absolute -top-2.5 -left-2.5 z-40 w-6 h-6 bg-paper border border-ink/40 rounded-full shadow-sm flex items-center justify-center text-ink hover:text-gold cursor-pointer transition-colors"
            title="Configure widget"
            aria-label="Open widget settings card"
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              {/* Hand-drawn quill/pen icon */}
              <path
                d="M 18 2 L 22 6 L 8 20 L 2 22 L 4 16 Z"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 14 6 L 18 10"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* Top-right: Handwritten Red-Pen Cross-Out Action (L13, no emoji) */}
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              onRemove(widget.id)
            }}
            className="absolute -top-2.5 -right-2.5 z-40 w-6 h-6 bg-paper border border-redpen/60 rounded-full shadow-sm flex items-center justify-center text-redpen hover:bg-redpen/10 cursor-pointer transition-colors"
            title="Cross out widget"
            aria-label="Remove widget"
          >
            <svg
              className="w-3.5 h-3.5 text-redpen"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              {/* Hand-drawn red cross-out strokes */}
              <path
                d="M 4 4.5 C 7 7.5, 12 12, 16 15.5"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M 15.5 4.5 C 12.5 7.5, 8 12, 4.5 16"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* Bottom-right: Corner Resize Handle (Plain Pointer Events, Correction 2) */}
          <div
            onPointerDown={handleResizePointerDown}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            className="absolute -bottom-2 -right-2 z-40 w-5 h-5 bg-paper border border-ink/50 rounded-xs shadow-sm flex items-center justify-center cursor-nwse-resize hover:bg-kraft/30"
            title="Drag corner to resize"
            aria-label="Resize widget corner handle"
          >
            <svg
              className="w-3 h-3 text-ink/70"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              {/* Hand-drawn corner bracket */}
              <path
                d="M 13 4 L 13 13 L 4 13"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 10 7 L 10 10 L 7 10"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </>
      )}
    </div>
  )
}
