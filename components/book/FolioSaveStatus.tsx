'use client'

/**
 * Folio Save Status Indicator
 * Memorable Moments — Task 14
 *
 * Rules:
 * - Tiny handwritten indicator near the page folio (L1, L5 Kalam font).
 * - Palette L6 only: text-ink (#1c2433) or text-redpen (#b3261e).
 * - No toasts, no SaaS popups, no modals.
 * - States:
 *   - "saving..."
 *   - "saved"
 *   - "not saved, retrying" (red pen)
 *   - "waiting to sync" (offline)
 */

import React, { useEffect, useState } from 'react'
import { useSaveStatusStore } from '@/store/saveStatusStore'

export function FolioSaveStatus({ className = '' }: { className?: string }) {
  const status = useSaveStatusStore((s) => s.status)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isOnline || status === 'syncing') {
    return (
      <span
        className={`font-hand text-[11px] text-ink/70 italic tracking-wide select-none ${className}`}
        aria-live="polite"
      >
        waiting to sync
      </span>
    )
  }

  if (status === 'saving') {
    return (
      <span
        className={`font-hand text-[11px] text-ink/70 italic tracking-wide select-none animate-pulse ${className}`}
        aria-live="polite"
      >
        saving...
      </span>
    )
  }

  if (status === 'saved') {
    return (
      <span
        className={`font-hand text-[11px] text-ink/80 italic tracking-wide select-none transition-opacity duration-500 ${className}`}
        aria-live="polite"
      >
        saved
      </span>
    )
  }

  if (status === 'retrying' || status === 'error') {
    return (
      <span
        className={`font-hand text-[11px] text-redpen italic tracking-wide select-none ${className}`}
        role="alert"
      >
        not saved, retrying
      </span>
    )
  }

  return null
}
