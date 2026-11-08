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

import React, { useMemo } from 'react'
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
  cursor: { x: number; y: number } | null
  onHover: (page: PageSide, x: number, y: number) => void
  onPlace: (page: PageSide, x: number, y: number, w: number, h: number) => void
  onNoRoom: () => void
  onDismissNoRoom: () => void
}

export function PlacementOverlay({
  page,
  pickedWidgetDef,
  existingWidgets,
  cursor,
  onHover,
  onPlace,
  onNoRoom,
  onDismissNoRoom,
}: PlacementOverlayProps) {
  // Effective minSize and defaultSize (Condition 1: minSize defined ONLY in widgetMetadata.ts)
  const meta = getWidgetMetadata(pickedWidgetDef.id)
  const defaultSize = meta?.defaultSize ?? pickedWidgetDef.defaultSize
  const minSize = meta?.minSize ?? pickedWidgetDef.minSize

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
    if (!cursor) return null
    return findFittingSizeAt(
      cursor.x,
      cursor.y,
      defaultSize,
      minSize,
      otherRects,
      PAGE_COLS,
      PAGE_ROWS,
    )
  }, [cursor, defaultSize, minSize, otherRects])

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    onDismissNoRoom()
    const rect = e.currentTarget.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top

    const gridX = Math.max(0, Math.min(PAGE_COLS - 1, Math.floor(offsetX / GRID_PX)))
    const gridY = Math.max(0, Math.min(PAGE_ROWS - 1, Math.floor(offsetY / GRID_PX)))

    if (!cursor || cursor.x !== gridX || cursor.y !== gridY) {
      onHover(page, gridX, gridY)
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    onDismissNoRoom()
    const rect = e.currentTarget.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top

    const gridX = Math.max(0, Math.min(PAGE_COLS - 1, Math.floor(offsetX / GRID_PX)))
    const gridY = Math.max(0, Math.min(PAGE_ROWS - 1, Math.floor(offsetY / GRID_PX)))

    const fit = findFittingSizeAt(
      gridX,
      gridY,
      defaultSize,
      minSize,
      otherRects,
      PAGE_COLS,
      PAGE_ROWS,
    )

    if (fit) {
      onPlace(page, gridX, gridY, fit.w, fit.h)
    } else {
      onNoRoom()
    }
  }

  return (
    <div
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
      {cursor && (
        <div
          className={`absolute rounded-sm transition-all duration-75 pointer-events-none flex flex-col items-center justify-center p-2 font-hand text-xs ${
            fitSize
              ? 'bg-highlighter/35 border-2 border-dashed border-highlighter text-ink shadow-[0_0_12px_rgba(255,216,74,0.4)]'
              : 'bg-redpen/20 border-2 border-dashed border-redpen text-redpen'
          }`}
          style={{
            left: cursor.x * GRID_PX,
            top: cursor.y * GRID_PX,
            width: (fitSize ? fitSize.w : Math.min(minSize.w, PAGE_COLS - cursor.x)) * GRID_PX,
            height: (fitSize ? fitSize.h : Math.min(minSize.h, PAGE_ROWS - cursor.y)) * GRID_PX,
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
