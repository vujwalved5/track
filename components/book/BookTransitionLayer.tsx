'use client'

import React, { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Cormorant_Garamond } from 'next/font/google'
import { useBookTransitionStore } from '@/store/bookTransitionStore'
import { BookCoverArt } from './BookCoverArt'

const cormorant = Cormorant_Garamond({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
})

export function BookTransitionLayer() {
  const router = useRouter()
  const pathname = usePathname()

  const isActive = useBookTransitionStore((s) => s.isActive)
  const transitionId = useBookTransitionStore((s) => s.transitionId)
  const targetYear = useBookTransitionStore((s) => s.targetYear)
  const targetMonth = useBookTransitionStore((s) => s.targetMonth)
  const targetUrl = useBookTransitionStore((s) => s.targetUrl)
  const monthName = useBookTransitionStore((s) => s.monthName)
  const variant = useBookTransitionStore((s) => s.variant)
  const rect = useBookTransitionStore((s) => s.rect)
  const prefersReducedMotion = useBookTransitionStore((s) => s.prefersReducedMotion)
  const isAnimationDone = useBookTransitionStore((s) => s.isAnimationDone)
  const isBookReady = useBookTransitionStore((s) => s.isBookReady)
  const isTimedOut = useBookTransitionStore((s) => s.isTimedOut)
  const markAnimationDone = useBookTransitionStore((s) => s.markAnimationDone)
  const markTimedOut = useBookTransitionStore((s) => s.markTimedOut)
  const retryTransition = useBookTransitionStore((s) => s.retryTransition)
  const resetTransition = useBookTransitionStore((s) => s.resetTransition)

  const [swingStarted, setSwingStarted] = useState(false)

  // Clear layer immediately on browser Back / forward navigation
  useEffect(() => {
    const handlePopState = () => {
      if (useBookTransitionStore.getState().isActive) {
        resetTransition()
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [resetTransition])

  // Clear layer at once if navigation redirects elsewhere (e.g. /login) or renders an error page
  useEffect(() => {
    if (!isActive || !targetUrl) return
    if (pathname !== '/home' && pathname !== targetUrl) {
      resetTransition()
      return
    }

    const checkForErrorPage = () => {
      if (
        document.querySelector('[data-nextjs-error], #__next-build-watcher, [data-nextjs-dialog]') ||
        document.title.includes('Application error') ||
        document.title.includes('404')
      ) {
        resetTransition()
      }
    }

    checkForErrorPage()
    const observer = new MutationObserver(checkForErrorPage)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [isActive, pathname, targetUrl, resetTransition])

  // Start cover swing / reduced-motion fade and animation completion timer
  useEffect(() => {
    if (!isActive) {
      setSwingStarted(false)
      return
    }

    if (isAnimationDone) return

    let raf1 = 0
    let raf2 = 0
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setSwingStarted(true)
      })
    })

    const animDurationMs = prefersReducedMotion ? 200 : 1100
    const animTimer = setTimeout(() => {
      markAnimationDone(transitionId)
    }, animDurationMs)

    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
      clearTimeout(animTimer)
    }
  }, [isActive, transitionId, prefersReducedMotion, isAnimationDone, markAnimationDone])

  // 10-second timeout fallback if the book has not reported ready
  useEffect(() => {
    if (!isActive || isBookReady || isTimedOut) return

    const timeoutId = setTimeout(() => {
      markTimedOut(transitionId)
    }, 10000)

    return () => clearTimeout(timeoutId)
  }, [isActive, transitionId, isBookReady, isTimedOut, markTimedOut])

  // Reveal only when BOTH the animation has finished AND the book reported ready
  useEffect(() => {
    if (!isActive || !isAnimationDone || !isBookReady) return
    resetTransition()
  }, [isActive, isAnimationDone, isBookReady, resetTransition])

  if (!isActive) return null

  const isMobile = variant === 'mobile'
  const showDeskBackdrop = pathname !== '/home'

  const handleTryAgain = () => {
    if (!targetUrl) return
    retryTransition()
    router.replace(targetUrl)
  }

  const handleGoBack = () => {
    resetTransition()
    router.push('/home')
  }

  return (
    <div
      className={`fixed inset-0 z-[100] select-none ${cormorant.variable} ${
        showDeskBackdrop ? 'desk-surface bg-desk' : 'bg-transparent'
      }`}
      aria-live="polite"
      data-transition-layer="book"
    >
      {/* Phase 1: Cover animation (at exact /home cover position) */}
      {!isAnimationDone && (
        <div
          className={`fixed pointer-events-none ${
            prefersReducedMotion
              ? `transition-opacity duration-200 ${swingStarted ? 'opacity-0' : 'opacity-100'}`
              : 'opacity-100'
          }`}
          style={
            rect
              ? {
                  left: `${rect.left}px`,
                  top: `${rect.top}px`,
                  width: `${rect.width}px`,
                  height: `${rect.height}px`,
                  perspective: '1800px',
                }
              : {
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: isMobile ? '180px' : '360px',
                  height: isMobile ? '240px' : '480px',
                  perspective: '1800px',
                }
          }
        >
          <BookCoverArt
            currentYear={targetYear ?? new Date().getFullYear()}
            currentMonthName={monthName}
            isMobile={isMobile}
            isOpening={!prefersReducedMotion && swingStarted}
            enableHover={false}
          />
        </div>
      )}

      {/* Phase 2: Waiting / Timeout after animation ends */}
      {isAnimationDone && !isBookReady && (
        <div className="w-full h-full desk-surface bg-desk flex items-center justify-center p-4">
          <div
            className="relative bg-paper rounded shadow-[0_20px_50px_rgba(28,36,51,0.7)] border border-desk/50 flex flex-col items-center justify-center gap-4 px-6 text-center"
            style={{
              width: 'min(968px, calc(100vw - 32px))',
              height: 'min(660px, calc(100vh - 48px))',
              backgroundImage:
                'radial-gradient(circle, rgba(28, 36, 51, 0.22) 1.4px, transparent 1.4px)',
              backgroundSize: '22px 22px',
            }}
          >
            {!isTimedOut ? (
              <p className="font-hand text-base text-ink/70 italic tracking-wider">
                turning the page...
              </p>
            ) : (
              <>
                <p className="font-hand text-lg text-ink">
                  This page is taking longer than expected.
                </p>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={handleTryAgain}
                    className="font-hand text-base font-bold text-ink bg-highlighter/80 border border-ink/40 rounded px-4 py-1.5 cursor-pointer hover:bg-highlighter transition-colors"
                  >
                    try again
                  </button>
                  <button
                    type="button"
                    onClick={handleGoBack}
                    className="font-hand text-base text-ink/80 border border-kraft/60 bg-paper rounded px-4 py-1.5 cursor-pointer hover:text-ink transition-colors"
                  >
                    go back
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
