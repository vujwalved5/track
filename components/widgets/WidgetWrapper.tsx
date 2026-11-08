'use client'

/**
 * Widget Wrapper Component
 * Memorable Moments — Phase 4 / Task F1
 *
 * Locked rules:
 * - Positioned strictly by x, y, w, h in 22px units (L7, L10)
 * - Dragging via @dnd-kit/core only (Correction 2)
 * - Resizing via plain pointer events on all 4 corners and all 4 edges (Step 3)
 * - Dragging top or left edge updates x and y
 * - Live dashed outline showing snapped size
 * - Stops at last valid size if drag would collide or leave page
 * - Persists to Supabase on pointer release
 * - Strictly L6 palette
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
import { getWidgetMetadata } from './widgetMetadata'

export type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

interface WidgetWrapperProps {
  widget: WidgetData
  year?: number
  month?: number
  setupConfig?: Record<string, unknown>
  isArrangeMode: boolean
  otherWidgets: WidgetData[]
  onResizeEnd: (
    widgetId: string,
    newRect: { x: number; y: number; w: number; h: number },
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
  const meta = getWidgetMetadata(widget.type)
  const minW = meta?.minSize.w ?? definition?.minSize.w ?? 2
  const minH = meta?.minSize.h ?? definition?.minSize.h ?? 2

  // Live position & dimensions during resize
  const [liveX, setLiveX] = useState(widget.x)
  const [liveY, setLiveY] = useState(widget.y)
  const [liveW, setLiveW] = useState(widget.w)
  const [liveH, setLiveH] = useState(widget.h)
  const [isResizing, setIsResizing] = useState(false)

  // Keep live dimensions in sync with prop changes
  useEffect(() => {
    if (!isResizing) {
      setLiveX(widget.x)
      setLiveY(widget.y)
      setLiveW(widget.w)
      setLiveH(widget.h)
    }
  }, [widget.x, widget.y, widget.w, widget.h, isResizing])

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

  // Resize pointer tracking ref
  const resizeRef = useRef<{
    handle: ResizeHandle
    startX: number
    startY: number
    startRect: WidgetRect
  } | null>(null)

  const handleResizePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    handle: ResizeHandle,
  ) => {
    if (!isArrangeMode) return
    e.stopPropagation()
    e.preventDefault()

    const target = e.currentTarget
    try {
      target.setPointerCapture(e.pointerId)
    } catch {
      // Ignore pointer capture release failure
    }

    resizeRef.current = {
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startRect: {
        x: liveX,
        y: liveY,
        w: liveW,
        h: liveH,
      },
    }
    setIsResizing(true)
  }

  const handleResizePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isResizing || !resizeRef.current) return
    e.stopPropagation()

    const { handle, startX, startY, startRect } = resizeRef.current
    const dx = e.clientX - startX
    const dy = e.clientY - startY

    const deltaCols = Math.round(dx / GRID_PX)
    const deltaRows = Math.round(dy / GRID_PX)

    let candX = startRect.x
    let candY = startRect.y
    let candW = startRect.w
    let candH = startRect.h

    // Horizontal adjustments
    if (handle.includes('e')) {
      candW = startRect.w + deltaCols
    }
    if (handle.includes('w')) {
      candX = startRect.x + deltaCols
      candW = startRect.w - deltaCols
    }

    // Vertical adjustments
    if (handle.includes('s')) {
      candH = startRect.h + deltaRows
    }
    if (handle.includes('n')) {
      candY = startRect.y + deltaRows
      candH = startRect.h - deltaRows
    }

    // Min size clamping
    if (handle.includes('w')) {
      if (candW < minW) {
        candW = minW
        candX = startRect.x + startRect.w - minW
      }
    } else {
      candW = Math.max(minW, candW)
    }

    if (handle.includes('n')) {
      if (candH < minH) {
        candH = minH
        candY = startRect.y + startRect.h - minH
      }
    } else {
      candH = Math.max(minH, candH)
    }

    // Max size clamping (Full page 22x30)
    candW = Math.min(PAGE_COLS, candW)
    candH = Math.min(PAGE_ROWS, candH)

    // Page boundaries clamping
    if (candX < 0) {
      if (handle.includes('w')) {
        candW = candW + candX
        candX = 0
      } else {
        candX = 0
      }
    }
    if (candY < 0) {
      if (handle.includes('n')) {
        candH = candH + candY
        candY = 0
      } else {
        candY = 0
      }
    }
    if (candX + candW > PAGE_COLS) {
      candW = PAGE_COLS - candX
    }
    if (candY + candH > PAGE_ROWS) {
      candH = PAGE_ROWS - candY
    }

    if (candW < minW || candH < minH) {
      return // Stop at last valid size
    }

    const candidateRect: WidgetRect = {
      x: candX,
      y: candY,
      w: candW,
      h: candH,
    }

    // Strict no-overlap check against all other widgets on this page
    const collides = otherWidgets.some((other) =>
      hasOverlap(candidateRect, {
        x: other.x,
        y: other.y,
        w: other.w,
        h: other.h,
      }),
    )

    // Only update live dimensions if valid; otherwise stop at last valid size (Step 3)
    if (!collides && isWithinBounds(candidateRect, PAGE_COLS, PAGE_ROWS)) {
      setLiveX(candX)
      setLiveY(candY)
      setLiveW(candW)
      setLiveH(candH)
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

    if (
      liveX !== widget.x ||
      liveY !== widget.y ||
      liveW !== widget.w ||
      liveH !== widget.h
    ) {
      await onResizeEnd(widget.id, {
        x: liveX,
        y: liveY,
        w: liveW,
        h: liveH,
      })
    }
  }

  // Calculate layout pixel values
  const leftPx = liveX * GRID_PX
  const topPx = liveY * GRID_PX
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

      {/* Live dashed outline during resize showing snapped size (Step 3) */}
      {isResizing && (
        <div
          className="absolute inset-0 border-2 border-dashed border-highlighter bg-highlighter/10 pointer-events-none rounded-sm z-50 flex items-center justify-center shadow-[0_0_12px_rgba(255,216,74,0.3)]"
          aria-hidden="true"
        >
          <span className="font-hand text-xs font-bold bg-paper/95 border border-ink/40 text-ink px-2 py-0.5 rounded shadow-sm">
            {liveW} × {liveH}
          </span>
        </div>
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
          {/* Top: Settings Card Trigger */}
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              onOpenConfig(widget.id)
            }}
            className="absolute -top-7 left-2 z-40 w-6 h-6 bg-paper border border-ink/40 rounded-full shadow-sm flex items-center justify-center text-ink hover:text-gold cursor-pointer transition-colors"
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

          {/* Top: Handwritten Red-Pen Cross-Out Action (L13, no emoji) */}
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              onRemove(widget.id)
            }}
            className="absolute -top-7 right-2 z-40 w-6 h-6 bg-paper border border-redpen/60 rounded-full shadow-sm flex items-center justify-center text-redpen hover:bg-redpen/10 cursor-pointer transition-colors"
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

          {/* ── 8 Resize Handles (All 4 Corners and All 4 Edges) ───── */}
          {/* Top-Left Corner */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'nw')}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            onLostPointerCapture={handleResizePointerUp}
            className="absolute -top-2 -left-2 z-40 w-4 h-4 bg-paper border border-ink/60 rounded-xs shadow-xs flex items-center justify-center cursor-nwse-resize hover:bg-highlighter/40 transition-colors"
            title="Resize top-left"
            aria-label="Resize widget top-left corner"
          />

          {/* Top-Right Corner */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'ne')}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            onLostPointerCapture={handleResizePointerUp}
            className="absolute -top-2 -right-2 z-40 w-4 h-4 bg-paper border border-ink/60 rounded-xs shadow-xs flex items-center justify-center cursor-nesw-resize hover:bg-highlighter/40 transition-colors"
            title="Resize top-right"
            aria-label="Resize widget top-right corner"
          />

          {/* Bottom-Left Corner */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'sw')}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            onLostPointerCapture={handleResizePointerUp}
            className="absolute -bottom-2 -left-2 z-40 w-4 h-4 bg-paper border border-ink/60 rounded-xs shadow-xs flex items-center justify-center cursor-nesw-resize hover:bg-highlighter/40 transition-colors"
            title="Resize bottom-left"
            aria-label="Resize widget bottom-left corner"
          />

          {/* Bottom-Right Corner */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'se')}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            onLostPointerCapture={handleResizePointerUp}
            className="absolute -bottom-2 -right-2 z-40 w-4 h-4 bg-paper border border-ink/60 rounded-xs shadow-xs flex items-center justify-center cursor-nwse-resize hover:bg-highlighter/40 transition-colors"
            title="Resize bottom-right"
            aria-label="Resize widget bottom-right corner"
          />

          {/* Top Edge */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'n')}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            onLostPointerCapture={handleResizePointerUp}
            className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-40 w-6 h-3 bg-paper border border-ink/60 rounded-xs shadow-xs flex items-center justify-center cursor-ns-resize hover:bg-highlighter/40 transition-colors"
            title="Resize top edge"
            aria-label="Resize widget top edge"
          />

          {/* Bottom Edge */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 's')}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            onLostPointerCapture={handleResizePointerUp}
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 z-40 w-6 h-3 bg-paper border border-ink/60 rounded-xs shadow-xs flex items-center justify-center cursor-ns-resize hover:bg-highlighter/40 transition-colors"
            title="Resize bottom edge"
            aria-label="Resize widget bottom edge"
          />

          {/* Left Edge */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'w')}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            onLostPointerCapture={handleResizePointerUp}
            className="absolute -left-1.5 top-1/2 -translate-y-1/2 z-40 w-3 h-6 bg-paper border border-ink/60 rounded-xs shadow-xs flex items-center justify-center cursor-ew-resize hover:bg-highlighter/40 transition-colors"
            title="Resize left edge"
            aria-label="Resize widget left edge"
          />

          {/* Right Edge */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'e')}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            onLostPointerCapture={handleResizePointerUp}
            className="absolute -right-1.5 top-1/2 -translate-y-1/2 z-40 w-3 h-6 bg-paper border border-ink/60 rounded-xs shadow-xs flex items-center justify-center cursor-ew-resize hover:bg-highlighter/40 transition-colors"
            title="Resize right edge"
            aria-label="Resize widget right edge"
          />
        </>
      )}
    </div>
  )
}
