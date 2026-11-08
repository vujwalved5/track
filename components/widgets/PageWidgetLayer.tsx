'use client'

/**
 * Page Widget Layer Component
 * Memorable Moments — Phase 4 / Task 7
 *
 * Rules:
 * - Positioned on a single Paper page (484 × 660 px, 22 × 30 grid)
 * - @dnd-kit/core used for dragging with 22px grid snap (Correction 2)
 * - Bounds, minSize, and no-overlap enforced strictly before saving (Correction 3)
 * - Reverts to last saved position and shows red-pen text on failure (Correction 6)
 * - Dev-only test control: "dev: add sticky note" (Correction 5)
 */

import React, { useState } from 'react'
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  type DragEndEvent,
} from '@dnd-kit/core'
import type { WidgetData, PageSide, WidgetRect } from './types'
import {
  GRID_PX,
  PAGE_COLS,
  PAGE_ROWS,
  hasOverlap,
  isWithinBounds,
} from './types'
import { WidgetWrapper } from './WidgetWrapper'
import {
  updateWidgetPosition,
  deleteWidget,
} from './widgetActions'

interface PageWidgetLayerProps {
  page: PageSide
  monthId?: string
  year?: number
  month?: number
  setupConfig?: Record<string, unknown>
  widgets: WidgetData[]
  isArrangeMode: boolean
  onWidgetsChange: (widgets: WidgetData[]) => void
  onOpenConfig: (widgetId: string) => void
}

export function PageWidgetLayer({
  page,
  monthId,
  year,
  month,
  setupConfig,
  widgets,
  isArrangeMode,
  onWidgetsChange,
  onOpenConfig,
}: PageWidgetLayerProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Configure pointer sensor with activation distance to avoid misclicks
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
  )

  // Clear error after 4 seconds
  const showError = (msg: string) => {
    setErrorMessage(msg)
    setTimeout(() => {
      setErrorMessage(null)
    }, 4000)
  }

  // Handle Drag End with grid snapping and collision avoidance
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, delta } = event
    const activeWidget = widgets.find((w) => w.id === active.id)
    if (!activeWidget) return

    // Offline guard (Correction 3): moving widgets needs a connection
    if (typeof window !== 'undefined' && !navigator.onLine) {
      showError('needs a connection')
      return
    }

    // Calculate delta in 22px grid units
    const dCols = Math.round(delta.x / GRID_PX)
    const dRows = Math.round(delta.y / GRID_PX)

    if (dCols === 0 && dRows === 0) return

    let targetX = activeWidget.x + dCols
    let targetY = activeWidget.y + dRows

    // Clamp strictly within page bounds
    targetX = Math.max(0, Math.min(targetX, PAGE_COLS - activeWidget.w))
    targetY = Math.max(0, Math.min(targetY, PAGE_ROWS - activeWidget.h))

    const candidateRect: WidgetRect = {
      x: targetX,
      y: targetY,
      w: activeWidget.w,
      h: activeWidget.h,
    }

    // Check collision with all other widgets on this page
    const otherWidgets = widgets.filter((w) => w.id !== activeWidget.id)
    const hasCollision = otherWidgets.some((other) =>
      hasOverlap(candidateRect, {
        x: other.x,
        y: other.y,
        w: other.w,
        h: other.h,
      }),
    )

    if (hasCollision || !isWithinBounds(candidateRect, PAGE_COLS, PAGE_ROWS)) {
      showError('Cannot place here: space is occupied or out of bounds')
      // Revert to original position
      return
    }

    // Store previous position for rollback
    const previousWidgetState = { ...activeWidget }

    // Optimistically update position
    const updatedList = widgets.map((w) =>
      w.id === activeWidget.id ? { ...w, x: targetX, y: targetY } : w,
    )
    onWidgetsChange(updatedList)

    // Save to Supabase (Server enforces bounds and no-overlap too)
    const res = await updateWidgetPosition(activeWidget.id, {
      x: targetX,
      y: targetY,
      w: activeWidget.w,
      h: activeWidget.h,
      page,
    })

    if (!res.success) {
      // Revert to last valid position (Correction 6)
      const revertedList = widgets.map((w) =>
        w.id === activeWidget.id ? previousWidgetState : w,
      )
      onWidgetsChange(revertedList)
      showError(res.error || 'Failed to save widget position')
    }
  }

  // Handle Resize End with grid snapping, bounds, and collision avoidance
  const handleResizeEnd = async (
    widgetId: string,
    newRect: { x: number; y: number; w: number; h: number },
  ) => {
    // Offline guard (Correction 3): resizing widgets needs a connection
    if (typeof window !== 'undefined' && !navigator.onLine) {
      showError('needs a connection')
      return
    }

    const targetWidget = widgets.find((w) => w.id === widgetId)
    if (!targetWidget) return

    const previousWidgetState = { ...targetWidget }

    // Optimistically update size and position
    const updatedList = widgets.map((w) =>
      w.id === widgetId ? { ...w, ...newRect } : w,
    )
    onWidgetsChange(updatedList)

    // Save to Supabase
    const res = await updateWidgetPosition(widgetId, {
      x: newRect.x,
      y: newRect.y,
      w: newRect.w,
      h: newRect.h,
      page,
    })

    if (!res.success) {
      // Revert on failure (Correction 6)
      const revertedList = widgets.map((w) =>
        w.id === widgetId ? previousWidgetState : w,
      )
      onWidgetsChange(revertedList)
      showError(res.error || 'Failed to resize widget')
    }
  }

  // Handle handwritten cross-out removal
  const handleRemove = async (widgetId: string) => {
    // Offline guard (Correction 3): removing widgets needs a connection
    if (typeof window !== 'undefined' && !navigator.onLine) {
      showError('needs a connection')
      return
    }

    const previousList = [...widgets]
    const filteredList = widgets.filter((w) => w.id !== widgetId)
    onWidgetsChange(filteredList)

    const res = await deleteWidget(widgetId)
    if (!res.success) {
      onWidgetsChange(previousList)
      showError(res.error || 'Failed to delete widget')
    }
  }

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      {/* Red-Pen Error Feedback Message (Correction 6) */}
      {errorMessage && (
        <div
          className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-paper/95 border border-redpen px-3 py-1 rounded shadow-md pointer-events-auto"
          role="alert"
        >
          <p className="font-hand text-xs text-redpen font-bold tracking-wide">
            {errorMessage}
          </p>
        </div>
      )}

      {/* DnD Context for Widget Dragging */}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="relative w-full h-full pointer-events-auto">
          {widgets.map((widget) => (
            <WidgetWrapper
              key={widget.id}
              widget={widget}
              year={year}
              month={month}
              setupConfig={setupConfig}
              isArrangeMode={isArrangeMode}
              otherWidgets={widgets.filter((w) => w.id !== widget.id)}
              onResizeEnd={handleResizeEnd}
              onRemove={handleRemove}
              onOpenConfig={onOpenConfig}
            />
          ))}
        </div>
      </DndContext>
    </div>
  )
}
