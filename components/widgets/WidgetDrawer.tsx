'use client'

/**
 * Wooden Card-Catalogue Widget Library Drawer
 * Memorable Moments — Phase 4 / Task 8
 *
 * Rules:
 * - Slides out from bottom of the desk below the book (Correction 3)
 * - Toggled via small brass drawer handle under the book
 * - 4 tabbed dividers: Track, Charts, Ask, Write (all 4 always show, no placeholder text, Correction 5)
 * - Paper index cards showing ONLY hand-drawn SVG icon and handwritten name (Correction 1)
 * - Palette: strictly L6 (kraft #b9895a, desk #211b16, oxblood #702028, gold #d8b45a, paper #f4eddc, ink #1c2433) (Correction 2)
 * - No scrollbars at 1440x900 (Correction 3)
 * - Cancelled by Esc, tapping handle, or page turn (Correction 4)
 */

import React, { useState, useEffect } from 'react'
import type { WidgetDefinition, WidgetGroup } from './types'
import { WIDGET_GROUPS } from './types'
import { getAllWidgetDefinitions } from './registry'

interface WidgetDrawerProps {
  isOpen: boolean
  isSetupDone: boolean
  pickedWidgetDef: WidgetDefinition | null
  onToggleOpen: () => void
  onPickCard: (def: WidgetDefinition) => void
  onCancelPick: () => void
}

export function WidgetDrawer({
  isOpen,
  isSetupDone,
  pickedWidgetDef,
  onToggleOpen,
  onPickCard,
  onCancelPick,
}: WidgetDrawerProps) {
  const [activeGroup, setActiveGroup] = useState<WidgetGroup>('Write')

  // Cancel pick or close drawer with Esc key (Correction 4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (pickedWidgetDef) {
          onCancelPick()
        } else if (isOpen) {
          onToggleOpen()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [pickedWidgetDef, isOpen, onCancelPick, onToggleOpen])

  // Get all registered widgets from central registry
  const allWidgets = getAllWidgetDefinitions()
  const currentGroupWidgets = allWidgets.filter(
    (w) => w.group === activeGroup,
  )

  // Drawer handle is hidden while month is unset (Correction 4)
  if (!isSetupDone) {
    return null
  }

  const handlePullClick = () => {
    if (pickedWidgetDef) {
      onCancelPick()
    } else {
      onToggleOpen()
    }
  }

  return (
    <>
      {/* ── Brass Drawer Pull Handle under the book ── */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 z-30 select-none pointer-events-auto"
        style={{
          transform: isOpen ? 'translate(-50%, -200px)' : 'translate(-50%, 0)',
          transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <button
          type="button"
          onClick={handlePullClick}
          className="group relative flex flex-col items-center justify-center cursor-pointer focus:outline-none"
          aria-label={isOpen ? 'Close card catalogue drawer' : 'Open card catalogue drawer'}
          title={isOpen ? 'Push drawer back' : 'Pull widget catalogue drawer'}
        >
          {/* Brass Cup Pull Shape */}
          <div
            className="w-24 h-6 bg-gold rounded-t-md shadow-[0_-2px_8px_rgba(28,36,51,0.4)] border-t border-x border-kraft/70 flex items-center justify-center transition-transform group-hover:-translate-y-0.5"
            style={{
              clipPath: 'polygon(8% 0, 92% 0, 100% 100%, 0 100%)',
            }}
          >
            {/* Center brass label indent */}
            <div className="w-14 h-2.5 bg-kraft/40 rounded-xs border border-ink/30 flex items-center justify-center">
              <span className="font-hand text-[9px] text-ink font-bold tracking-widest uppercase">
                {pickedWidgetDef ? 'Cancel' : isOpen ? 'Tuck in' : 'Widgets'}
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* ── Wooden Card-Catalogue Drawer Box (L6 palette only) ── */}
      <section
        aria-label="Widget card catalogue drawer"
        className="fixed bottom-0 left-1/2 -translate-x-1/2 z-40 w-[680px] h-[190px] select-none pointer-events-auto shadow-[0_-12px_32px_rgba(28,36,51,0.6)]"
        style={{
          transform: isOpen ? 'translate(-50%, 0)' : 'translate(-50%, 100%)',
          transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
          // Dark desk wood with layered kraft grain
          backgroundColor: '#211b16',
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(185, 137, 90, 0.04) 40px, rgba(185, 137, 90, 0.04) 80px)',
          borderTop: '3px solid #b9895a',
          borderLeft: '4px solid #211b16',
          borderRight: '4px solid #211b16',
        }}
      >
        {/* Inner Drawer Tray (oxblood / kraft rails) */}
        <div className="w-full h-full p-3 flex flex-col justify-between bg-desk/70 border-t border-kraft/20">
          {/* ── Four Card-Stock Tabbed Dividers (Always visible, Correction 5) ── */}
          <div
            className="flex items-end gap-1.5 border-b border-kraft/40 pb-0.5"
            role="tablist"
            aria-label="Widget category dividers"
          >
            {WIDGET_GROUPS.map((group) => {
              const isActive = activeGroup === group
              return (
                <button
                  key={group}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveGroup(group)}
                  className={`relative px-4 py-1 font-hand text-xs transition-all cursor-pointer rounded-t-sm select-none ${
                    isActive
                      ? 'bg-kraft text-paper font-bold shadow-[0_-2px_4px_rgba(28,36,51,0.3)] -translate-y-0.5 border-t border-x border-paper/30'
                      : 'bg-kraft/40 text-paper/70 hover:text-paper hover:bg-kraft/60 border-t border-x border-kraft/30'
                  }`}
                  style={{
                    clipPath: 'polygon(6% 0, 94% 0, 100% 100%, 0 100%)',
                  }}
                >
                  {group}
                </button>
              )
            })}

            {/* Active picked indicator / cancel hint */}
            {pickedWidgetDef && (
              <div className="ml-auto flex items-center gap-2 pr-1">
                <span className="font-hand text-[11px] text-gold tracking-wide">
                  Holding: {pickedWidgetDef.displayName}
                </span>
                <button
                  type="button"
                  onClick={onCancelPick}
                  className="font-hand text-[10px] text-paper/70 hover:text-redpen cursor-pointer underline"
                >
                  Cancel (Esc)
                </button>
              </div>
            )}
          </div>

          {/* ── Index Cards Tray ── */}
          <div
            className="flex-1 mt-2 flex items-center gap-4 overflow-x-auto overflow-y-hidden px-2 pb-1"
            role="tabpanel"
            aria-label={`${activeGroup} widgets`}
          >
            {currentGroupWidgets.map((widgetDef) => {
              const Icon = widgetDef.icon
              const isPicked = pickedWidgetDef?.id === widgetDef.id

              return (
                <button
                  key={widgetDef.id}
                  type="button"
                  onClick={() => onPickCard(widgetDef)}
                  className={`group relative w-36 h-24 bg-paper rounded-xs p-2.5 flex flex-col items-center justify-between transition-all duration-150 cursor-pointer select-none text-left shrink-0 ${
                    isPicked
                      ? 'border-2 border-highlighter shadow-[0_0_10px_rgba(255,216,74,0.6)] -translate-y-1.5'
                      : 'border border-ink/20 shadow-[1px_2px_5px_rgba(28,36,51,0.3)] hover:-translate-y-1.5 hover:shadow-[2px_4px_8px_rgba(28,36,51,0.4)]'
                  }`}
                  style={{
                    // Paper index card subtle ruling
                    backgroundImage:
                      'linear-gradient(rgba(112, 32, 40, 0.25) 1px, transparent 1px)',
                    backgroundSize: '100% 18px',
                    backgroundPosition: '0 20px',
                  }}
                  title={`Pick up ${widgetDef.displayName} to place on paper`}
                  aria-label={`Pick up ${widgetDef.displayName}`}
                >
                  {/* Top red index rule line */}
                  <div
                    className="w-full h-0.5 bg-oxblood/30 pointer-events-none mb-1"
                    aria-hidden="true"
                  />

                  {/* Hand-drawn SVG Icon (Correction 1) */}
                  <div className="text-ink/80 group-hover:text-ink transition-colors flex items-center justify-center py-1">
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Handwritten Name ONLY (Correction 1) */}
                  <div className="w-full text-center">
                    <span className="font-hand text-xs font-bold text-ink truncate block tracking-wide">
                      {widgetDef.displayName}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Wooden drawer bottom lip */}
          <div
            className="w-full h-1.5 bg-desk border-t border-kraft/30 mt-1 pointer-events-none"
            aria-hidden="true"
          />
        </div>
      </section>
    </>
  )
}
