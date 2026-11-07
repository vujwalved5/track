'use client'

/**
 * Service Worker Registration Component
 * Memorable Moments — Phase 6 / Task 12 (Batch B)
 *
 * Rules:
 * - Register with navigator.serviceWorker.register in a small client component (Correction 1).
 * - No @serwist/window (Correction 1).
 * - Do NOT register in development (Correction 1).
 */

import { useEffect } from 'react'

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      process.env.NODE_ENV === 'production' &&
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator
    ) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          // Listen for updates
          reg.addEventListener('updatefound', () => {
            const installing = reg.installing
            if (installing) {
              installing.addEventListener('statechange', () => {
                if (
                  installing.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  // New update installed
                }
              })
            }
          })
        })
        .catch((err) => {
          console.error('Service worker registration failed:', err)
        })
    }
  }, [])

  return null
}
