'use client'

/**
 * Page Placement Overlay Component
 * Memorable Moments — Phase 4 / Task F1
 *
 * Locked rules:
 * - Rendered ONLY while a widget card is picked up
 * - Highlighter yellow (#ffd84a) preview when valid; redpen (#b3261e) when invalid
 * - Snaps to 22px grid; shrinks to largest fitting size down to minSize
 * - Keyboard: starts at first empty spot fitting minSize; arrows move, Enter/Space places (Condition 6)
 * - "No room here." dismisses on next tap/key or after 3.5s; role="status" (Condition 7)
 * - Placement works on left and right pages (Condition 5)
 * - Strictly L6 palette
 */

import React, { useMemo, useRef, useState } from 'react'
import type { WidgetData, WidgetDefinition, PageSide, WidgetRect } from './types'
import {
  GRID_PX,
  PAGE_COLS,
  PAGE_ROWS,
} from './types'
import {
  getWidgetMetadata,
  findFittingSizeAt,
} from './widgetMetadata'

interface PlacementOverlayProps {
  page: PageSide
  pickedWidgetDef: WidgetDefinition
  existingWidgets: WidgetData[]
  cursor: { page: PageSide; x: number; y: number } | null
  onClearCursor: () => void
  onPlace: (page: PageSide, x: number, y: number, w: number, h: number) => void
  onNoRoom: () => void
  onDismissNoRoom: () => void
}

export function PlacementOverlay({
  page,
  pickedWidgetDef,
  existingWidgets,
  cursor,
  onClearCursor,
  onPlace,
  onNoRoom,
  onDismissNoRoom,
}: PlacementOverlayProps) {
  // Effective minSize and defaultSize (Condition 1: minSize defined ONLY in widgetMetadata.ts)
  const meta = getWidgetMetadata(pickedWidgetDef.id)
  const defaultSize = meta?.defaultSize ?? pickedWidgetDef.defaultSize
  const minSize = meta?.minSize ?? pickedWidgetDef.minSize

  // Local pointer hover cell so moving across 22px grid cells does not re-render OpenBook
  const [hoverCell, setHoverCell] = useState<{ x: number; y: number } | null>(null)
  if (cursor && hoverCell) setHoverCell(null)

  const activeCursor = hoverCell || (cursor && cursor.page === page ? cursor : null)

  // Cached bounding rect to avoid layout thrashing on pointer move (Fix 6)
  const rectRef = useRef<DOMRect | null>(null)

  const otherRects: WidgetRect[] = useMemo(
    () =>
      existingWidgets.map((item) => ({
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
      })),
    [existingWidgets],
  )

  // Calculate largest fitting size at current cursor position (if active on this page)
  const fitSize = useMemo(() => {
    if (!activeCursor) return null
    return findFittingSizeAt(
      activeCursor.x,
      activeCursor.y,
      defaultSize,
      minSize,
      otherRects,
      PAGE_COLS,
      PAGE_ROWS,
    )
  }, [activeCursor, defaultSize, minSize, otherRects])

  const cacheRect = (e: React.PointerEvent<HTMLDivElement>) => {
    rectRef.current = e.currentTarget.getBoundingClientRect()
  }

  const getGridCell = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = rectRef.current || (rectRef.current = e.currentTarget.getBoundingClientRect())
    return {
      x: Math.max(0, Math.min(PAGE_COLS - 1, Math.floor((e.clientX - r.left) / GRID_PX))),
      y: Math.max(0, Math.min(PAGE_ROWS - 1, Math.floor((e.clientY - r.top) / GRID_PX))),
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    onDismissNoRoom()
    const { x, y } = getGridCell(e)
    onClearCursor()
    setHoverCell((prev) => (prev && prev.x === x && prev.y === y ? prev : { x, y }))
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    onDismissNoRoom()
    const { x, y } = getGridCell(e)

    const fit = findFittingSizeAt(
      x,
      y,
      defaultSize,
      minSize,
      otherRects,
      PAGE_COLS,
      PAGE_ROWS,
    )

    if (fit) {
      onPlace(page, x, y, fit.w, fit.h)
    } else {
      onNoRoom()
    }
  }

  return (
    <div
      onPointerEnter={cacheRect}
      onPointerLeave={() => setHoverCell(null)}
      onPointerDown={cacheRect}
      onPointerMove={handlePointerMove}
      onClick={handleClick}
      className="absolute inset-0 z-30 cursor-crosshair select-none focus:outline-none"
      style={{
        backgroundColor: 'rgba(255, 216, 74, 0.04)',
      }}
      role="button"
      aria-label={`Place ${pickedWidgetDef.displayName} on ${page} page`}
      tabIndex={0}
    >
      {/* 22px Grid Snapped Footprint: rendered when cursor is on this page */}
      {activeCursor && (
        <div
          className={`absolute rounded-sm transition-all duration-75 pointer-events-none flex flex-col items-center justify-center p-2 font-hand text-xs ${
            fitSize
              ? 'bg-highlighter/35 border-2 border-dashed border-highlighter text-ink shadow-[0_0_12px_rgba(255,216,74,0.4)]'
              : 'bg-redpen/20 border-2 border-dashed border-redpen text-redpen'
          }`}
          style={{
            left: activeCursor.x * GRID_PX,
            top: activeCursor.y * GRID_PX,
            width: (fitSize ? fitSize.w : Math.min(minSize.w, PAGE_COLS - activeCursor.x)) * GRID_PX,
            height: (fitSize ? fitSize.h : Math.min(minSize.h, PAGE_ROWS - activeCursor.y)) * GRID_PX,
          }}
        >
          <span className="font-bold tracking-wide select-none">
            {pickedWidgetDef.displayName}
          </span>
          <span className="text-[10px] opacity-80 select-none">
            {fitSize ? `Tap to place (${fitSize.w}×${fitSize.h})` : 'No room here'}
          </span>
        </div>
      )}
    </div>
  )
}
