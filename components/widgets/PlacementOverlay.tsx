'use client'

/**
 * Page Placement Overlay Component
 * Memorable Moments — Phase 4 / Task 8
 *
 * Locked rules:
 * - Rendered ONLY while a widget card is picked up (Correction 4)
 * - Highlighter yellow (#ffd84a) preview when valid; redpen (#b3261e) when invalid (Correction 5)
 * - Reuses isValidPlacement() from Task 7 (Correction 5)
 * - Tapping places the widget at default size and enters Arrange mode
 * - Strictly L6 palette
 */

import React, { useState } from 'react'
import type { WidgetData, WidgetDefinition, PageSide, WidgetRect } from './types'
import {
  GRID_PX,
  PAGE_COLS,
  PAGE_ROWS,
  isValidPlacement,
} from './types'

interface PlacementOverlayProps {
  page: PageSide
  pickedWidgetDef: WidgetDefinition
  existingWidgets: WidgetData[]
  onPlace: (page: PageSide, x: number, y: number) => void
}

export function PlacementOverlay({
  page,
  pickedWidgetDef,
  existingWidgets,
  onPlace,
}: PlacementOverlayProps) {
  const [hoverGrid, setHoverGrid] = useState<{ x: number; y: number } | null>(
    null,
  )

  const w = pickedWidgetDef.defaultSize.w
  const h = pickedWidgetDef.defaultSize.h

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top

    const gridX = Math.floor(offsetX / GRID_PX)
    const gridY = Math.floor(offsetY / GRID_PX)

    if (
      !hoverGrid ||
      hoverGrid.x !== gridX ||
      hoverGrid.y !== gridY
    ) {
      setHoverGrid({ x: gridX, y: gridY })
    }
  }

  const handlePointerLeave = () => {
    setHoverGrid(null)
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    if (!hoverGrid) return

    const candidate: WidgetRect = {
      x: hoverGrid.x,
      y: hoverGrid.y,
      w,
      h,
    }

    const otherRects: WidgetRect[] = existingWidgets.map((item) => ({
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
    }))

    const valid = isValidPlacement(
      candidate,
      pickedWidgetDef.minSize,
      otherRects,
      PAGE_COLS,
      PAGE_ROWS,
    )

    if (valid) {
      onPlace(page, hoverGrid.x, hoverGrid.y)
    }
  }

  // Calculate validity of current hover candidate
  let isValid = false
  if (hoverGrid) {
    const candidate: WidgetRect = {
      x: hoverGrid.x,
      y: hoverGrid.y,
      w,
      h,
    }
    const otherRects: WidgetRect[] = existingWidgets.map((item) => ({
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
    }))
    isValid = isValidPlacement(
      candidate,
      pickedWidgetDef.minSize,
      otherRects,
      PAGE_COLS,
      PAGE_ROWS,
    )
  }

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      className="absolute inset-0 z-30 cursor-crosshair select-none"
      style={{
        // Visual cue that paper is awaiting placement
        backgroundColor: 'rgba(255, 216, 74, 0.04)',
      }}
      role="button"
      aria-label={`Place ${pickedWidgetDef.displayName} on ${page} page`}
      tabIndex={0}
    >
      {/* 22px Grid Snapped Footprint */}
      {hoverGrid && (
        <div
          className={`absolute rounded-sm transition-all duration-75 pointer-events-none flex flex-col items-center justify-center p-2 font-hand text-xs ${
            isValid
              ? 'bg-highlighter/35 border-2 border-dashed border-highlighter text-ink shadow-[0_0_12px_rgba(255,216,74,0.4)]'
              : 'bg-redpen/20 border-2 border-dashed border-redpen text-redpen'
          }`}
          style={{
            left: hoverGrid.x * GRID_PX,
            top: hoverGrid.y * GRID_PX,
            width: w * GRID_PX,
            height: h * GRID_PX,
          }}
        >
          <span className="font-bold tracking-wide select-none">
            {pickedWidgetDef.displayName}
          </span>
          <span className="text-[10px] opacity-80 select-none">
            {isValid ? 'Tap to place' : 'Cannot place here'}
          </span>
        </div>
      )}
    </div>
  )
}
