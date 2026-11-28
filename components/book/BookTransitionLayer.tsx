'use client'

import React, { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Cormorant_Garamond } from 'next/font/google'
import { useBookTransitionStore } from '@/store/bookTransitionStore'
import { BookCoverArt, LoginBookCoverArt } from './BookCoverArt'

const cormorant = Cormorant_Garamond({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
})

function isErrorPagePresent(): boolean {
  if (typeof document === 'undefined') return false
  if (
    document.querySelector(
      '[data-nextjs-error], [data-nextjs-dialog], #__next-build-watcher, #__next_error__, .next-error-h1',
    )
  ) {
    return true
  }
  if (/application error|404|not found|500|internal server error/i.test(document.title)) {
    return true
  }
  const headings = document.querySelectorAll('h1, h2')
  for (const heading of headings) {
    if (heading.closest('[data-transition-layer]')) continue
    const text = heading.textContent || ''
    if (
      text.includes('Application error:') ||
      text.includes('This page could not be found') ||
      text.includes('Something went wrong') ||
      text.includes('Internal Server Error')
    ) {
      return true
    }
  }
  return false
}

export function BookTransitionLayer() {
  const router = useRouter()
  const pathname = usePathname()

  const isActive = useBookTransitionStore((s) => s.isActive)
  const transitionId = useBookTransitionStore((s) => s.transitionId)
  const kind = useBookTransitionStore((s) => s.kind)
  const sourcePath = useBookTransitionStore((s) => s.sourcePath)
  const publicPhase = useBookTransitionStore((s) => s.publicPhase)
  const targetYear = useBookTransitionStore((s) => s.targetYear)
  const targetMonth = useBookTransitionStore((s) => s.targetMonth)
  const targetUrl = useBookTransitionStore((s) => s.targetUrl)
  const monthName = useBookTransitionStore((s) => s.monthName)
  const variant = useBookTransitionStore((s) => s.variant)
  const rect = useBookTransitionStore((s) => s.rect)
  const prefersReducedMotion = useBookTransitionStore((s) => s.prefersReducedMotion)
  const isAnimationDone = useBookTransitionStore((s) => s.isAnimationDone)
  const isBookReady = useBookTransitionStore((s) => s.isBookReady)
  const isLoginReady = useBookTransitionStore((s) => s.isLoginReady)
  const redirectedToBook = useBookTransitionStore((s) => s.redirectedToBook)
  const isTimedOut = useBookTransitionStore((s) => s.isTimedOut)
  const setPublicPhase = useBookTransitionStore((s) => s.setPublicPhase)
  const resolveBookRedirect = useBookTransitionStore((s) => s.resolveBookRedirect)
  const markAnimationDone = useBookTransitionStore((s) => s.markAnimationDone)
  const markTimedOut = useBookTransitionStore((s) => s.markTimedOut)
  const retryTransition = useBookTransitionStore((s) => s.retryTransition)
  const resetTransition = useBookTransitionStore((s) => s.resetTransition)

  const [swingStarted, setSwingStarted] = useState(false)
  const [leaveStarted, setLeaveStarted] = useState(false)
  const [arriveStarted, setArriveStarted] = useState(false)
  const [revealStarted, setRevealStarted] = useState(false)
  const [showTurningText, setShowTurningText] = useState(false)
  const hasLeftSourceRef = useRef(false)

  // Clear layer immediately on browser Back / forward navigation
  useEffect(() => {
    const handlePopState = () => {
      if (useBookTransitionStore.getState().isActive) {
        document.documentElement.removeAttribute('data-book-leaving')
        document.documentElement.style.removeProperty('--leave-origin-y')
        resetTransition()
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [resetTransition])

  // Manage html[data-book-leaving] strictly during Leave, removing it everywhere else
  useEffect(() => {
    if (isActive && kind === 'public-to-login' && publicPhase === 'leave' && !prefersReducedMotion) {
      const originY = window.scrollY + window.innerHeight / 2
      document.documentElement.style.setProperty('--leave-origin-y', `${originY}px`)
      document.documentElement.setAttribute(
        'data-book-leaving',
        sourcePath === '/focus-room' ? 'focus-room' : 'home',
      )
      return () => {
        document.documentElement.removeAttribute('data-book-leaving')
        document.documentElement.style.removeProperty('--leave-origin-y')
      }
    }

    document.documentElement.removeAttribute('data-book-leaving')
    document.documentElement.style.removeProperty('--leave-origin-y')
  }, [isActive, kind, publicPhase, sourcePath, prefersReducedMotion])

  // Track whether we have navigated away from sourcePath in public-to-login
  useEffect(() => {
    if (!isActive || kind !== 'public-to-login') {
      hasLeftSourceRef.current = false
      return
    }
    if (pathname !== sourcePath) {
      hasLeftSourceRef.current = true
    }
  }, [isActive, kind, pathname, sourcePath])

  // Clear layer on unexpected redirects or error pages; preserve expected /login -> /book/[year]/[month] redirect
  useEffect(() => {
    if (!isActive) return

    if (kind === 'public-to-login') {
      const bookMatch = pathname.match(/^\/book\/(\d+)\/(\d+)$/)
      if (bookMatch) {
        resolveBookRedirect(Number(bookMatch[1]), Number(bookMatch[2]))
      } else if (pathname !== '/login') {
        if (pathname !== sourcePath || hasLeftSourceRef.current) {
          resetTransition()
          return
        }
      }
    } else if (targetUrl) {
      if (pathname !== '/home' && pathname !== targetUrl) {
        resetTransition()
        return
      }
    }

    const checkForErrorPage = () => {
      if (isErrorPagePresent()) {
        resetTransition()
      }
    }

    checkForErrorPage()
    const observer = new MutationObserver(checkForErrorPage)
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
    })
    return () => observer.disconnect()
  }, [isActive, kind, pathname, sourcePath, targetUrl, resolveBookRedirect, resetTransition])

  // ── Existing /home -> /book/[year]/[month] animation & reveal ──────────────────────
  useEffect(() => {
    if (!isActive || kind !== 'home-to-book') {
      if (kind === 'home-to-book') setSwingStarted(false)
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
  }, [isActive, kind, transitionId, prefersReducedMotion, isAnimationDone, markAnimationDone])

  useEffect(() => {
    if (!isActive || kind !== 'home-to-book' || !isAnimationDone || !isBookReady) return
    resetTransition()
  }, [isActive, kind, isAnimationDone, isBookReady, resetTransition])

  // ── Public (/ or /focus-room) -> /login (or /book/[year]/[month]) phases ───────────
  useEffect(() => {
    if (!isActive || kind !== 'public-to-login') {
      setLeaveStarted(false)
      setArriveStarted(false)
      setRevealStarted(false)
      setShowTurningText(false)
      return
    }

    if (publicPhase === 'leave') {
      setSwingStarted(false)
      setArriveStarted(false)
      setRevealStarted(false)
      setShowTurningText(false)

      let raf1 = 0
      let raf2 = 0
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          setLeaveStarted(true)
        })
      })

      const leaveMs = prefersReducedMotion ? 200 : 350
      const timer = setTimeout(() => {
        document.documentElement.removeAttribute('data-book-leaving')
        document.documentElement.style.removeProperty('--leave-origin-y')
        router.push('/login')
        setPublicPhase(transitionId, 'arrive')
      }, leaveMs)

      return () => {
        cancelAnimationFrame(raf1)
        cancelAnimationFrame(raf2)
        clearTimeout(timer)
      }
    }

    if (publicPhase === 'arrive') {
      setSwingStarted(false)
      setArriveStarted(false)
      let raf1 = 0
      let raf2 = 0
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          setArriveStarted(true)
        })
      })

      const arriveMs = prefersReducedMotion ? 200 : 500
      const timer = setTimeout(() => {
        const s = useBookTransitionStore.getState()
        if (!s.isActive || s.transitionId !== transitionId) return
        if (s.redirectedToBook && s.isBookReady) {
          setPublicPhase(transitionId, prefersReducedMotion ? 'reveal' : 'swing')
        } else if (!s.redirectedToBook && s.isLoginReady) {
          setPublicPhase(transitionId, 'reveal')
        } else {
          setPublicPhase(transitionId, 'wait')
        }
      }, arriveMs)

      return () => {
        cancelAnimationFrame(raf1)
        cancelAnimationFrame(raf2)
        clearTimeout(timer)
      }
    }

    if (publicPhase === 'wait') {
      setShowTurningText(false)
      const turningTimer = setTimeout(() => {
        setShowTurningText(true)
      }, 1000)
      return () => clearTimeout(turningTimer)
    }

    if (publicPhase === 'swing') {
      setShowTurningText(false)
      let raf1 = 0
      let raf2 = 0
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          setSwingStarted(true)
        })
      })

      const swingMs = prefersReducedMotion ? 200 : 1100
      const timer = setTimeout(() => {
        setPublicPhase(transitionId, 'reveal')
      }, swingMs)

      return () => {
        cancelAnimationFrame(raf1)
        cancelAnimationFrame(raf2)
        clearTimeout(timer)
      }
    }

    if (publicPhase === 'reveal') {
      setShowTurningText(false)
      let raf1 = 0
      let raf2 = 0
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          setRevealStarted(true)
        })
      })

      const revealMs = prefersReducedMotion ? 200 : 250
      const timer = setTimeout(() => {
        resetTransition()
      }, revealMs)

      return () => {
        cancelAnimationFrame(raf1)
        cancelAnimationFrame(raf2)
        clearTimeout(timer)
      }
    }
  }, [
    isActive,
    kind,
    publicPhase,
    transitionId,
    prefersReducedMotion,
    router,
    setPublicPhase,
    resetTransition,
  ])

  // Advance from 'wait' as soon as destination reports ready
  useEffect(() => {
    if (!isActive || kind !== 'public-to-login' || publicPhase !== 'wait') return
    if (redirectedToBook && isBookReady) {
      setPublicPhase(transitionId, prefersReducedMotion ? 'reveal' : 'swing')
    } else if (!redirectedToBook && isLoginReady) {
      setPublicPhase(transitionId, 'reveal')
    }
  }, [
    isActive,
    kind,
    publicPhase,
    redirectedToBook,
    isBookReady,
    isLoginReady,
    transitionId,
    prefersReducedMotion,
    setPublicPhase,
  ])

  // 10-second timeout fallback if destination has not reported ready
  const isDestinationReady =
    kind === 'public-to-login' ? (redirectedToBook ? isBookReady : isLoginReady) : isBookReady
  const isPublicPastLeave = kind !== 'public-to-login' || (publicPhase !== null && publicPhase !== 'leave')

  useEffect(() => {
    if (!isActive || isDestinationReady || isTimedOut || !isPublicPastLeave) return

    const timeoutId = setTimeout(() => {
      markTimedOut(transitionId)
    }, 10000)

    return () => clearTimeout(timeoutId)
  }, [isActive, isPublicPastLeave, transitionId, isDestinationReady, isTimedOut, markTimedOut])

  if (!isActive) return null

  const handleTryAgain = () => {
    if (!targetUrl) return
    retryTransition()
    router.replace(targetUrl)
  }

  const handleGoBack = () => {
    const dest = sourcePath || '/home'
    document.documentElement.removeAttribute('data-book-leaving')
    document.documentElement.style.removeProperty('--leave-origin-y')
    resetTransition()
    router.push(dest)
  }

  // ── Render: Public -> /login (or /book redirect) ───────────────────────────────────
  if (kind === 'public-to-login') {
    const currentYear = targetYear ?? new Date().getFullYear()
    const isRevealing = publicPhase === 'reveal'
    const isLeaving = publicPhase === 'leave'

    return (
      <div
        className={`fixed inset-0 z-[100] select-none overflow-x-hidden ${cormorant.variable} ${
          isRevealing ? 'pointer-events-none' : ''
        }`}
        style={{
          opacity: isRevealing && revealStarted ? 0 : 1,
          transition: isRevealing
            ? `opacity ${prefersReducedMotion ? 200 : 250}ms ease-out`
            : undefined,
        }}
        aria-live="polite"
        data-transition-layer="book"
      >
        {/* Desk backdrop */}
        <div
          className="fixed inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(33, 27, 22, 0.4) 0%, rgba(15, 12, 10, 0.85) 100%), #211b16',
            opacity: isLeaving ? (leaveStarted ? 1 : 0) : 1,
            transition: isLeaving
              ? prefersReducedMotion
                ? 'opacity 200ms ease-out'
                : 'opacity 150ms ease-out 200ms'
              : undefined,
          }}
        />

        {/* Arrive / Wait / Swing / Reveal: closed book matching real /login cover */}
        {!isLeaving && (
          <div className="relative min-h-screen flex flex-col items-center justify-center py-8 px-4">
            <div
              className={
                publicPhase === 'arrive'
                  ? prefersReducedMotion
                    ? `transition-opacity duration-200 ${arriveStarted ? 'opacity-100' : 'opacity-0'}`
                    : 'animate-book-arrive'
                  : 'opacity-100'
              }
            >
              <LoginBookCoverArt
                currentYear={currentYear}
                isOpening={publicPhase === 'swing' && swingStarted}
                isReducedMotion={prefersReducedMotion}
                swayRibbon={publicPhase === 'wait' && !isTimedOut && !prefersReducedMotion}
                waitHint={
                  publicPhase === 'wait' && showTurningText && !isTimedOut ? (
                    <p className="font-hand text-base text-gold/75 italic tracking-wider">
                      turning the page...
                    </p>
                  ) : undefined
                }
              />
            </div>

            {/* 10-second timeout fallback card */}
            {isTimedOut && !isDestinationReady && (
              <div className="fixed inset-0 flex items-center justify-center p-4 z-30 bg-desk/70">
                <div className="bg-paper rounded shadow-[0_20px_50px_rgba(28,36,51,0.7)] border border-kraft/50 flex flex-col items-center justify-center gap-4 px-6 py-6 text-center max-w-sm">
                  <p className="font-hand text-lg text-ink">
                    This page is taking longer than expected.
                  </p>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={handleTryAgain}
                      className="font-hand text-base font-bold text-ink bg-highlighter/80 border border-ink/40 rounded px-4 py-1.5 cursor-pointer hover:bg-highlighter transition-colors min-h-[44px]"
                    >
                      try again
                    </button>
                    <button
                      type="button"
                      onClick={handleGoBack}
                      className="font-hand text-base text-ink/80 border border-kraft/60 bg-paper rounded px-4 py-1.5 cursor-pointer hover:text-ink transition-colors min-h-[44px]"
                    >
                      go back
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // ── Render: Existing /home -> /book/[year]/[month] ─────────────────────────────────
  const isMobile = variant === 'mobile'
  const showDeskBackdrop = pathname !== '/home'

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
