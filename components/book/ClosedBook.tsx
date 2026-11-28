'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Cormorant_Garamond } from 'next/font/google'
import { signIn, signUp } from '@/lib/supabase/auth'
import { useBookTransitionStore } from '@/store/bookTransitionStore'
import { LoginBookCoverArt } from './BookCoverArt'

const cormorant = Cormorant_Garamond({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
})

export function ClosedBook() {
  const router = useRouter()
  const [mode, setMode] = useState<'open' | 'begin'>('open')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(
    null
  )
  const [passwordError, setPasswordError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOpening, setIsOpening] = useState(false)
  const [isReducedMotion, setIsReducedMotion] = useState(false)

  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const failSafeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (openTimerRef.current) clearTimeout(openTimerRef.current)
      if (failSafeTimerRef.current) clearTimeout(failSafeTimerRef.current)
    }
  }, [])

  // Signal transition layer once /login cover is mounted, fonts loaded, and painted
  useEffect(() => {
    if (!useBookTransitionStore.getState().isActive) return

    let cancelled = false
    let raf1 = 0
    let raf2 = 0

    const waitAndSignal = async () => {
      if (typeof document !== 'undefined' && document.fonts?.ready) {
        try {
          await document.fonts.ready
        } catch {
          // Proceed if fonts.ready rejects
        }
      }
      if (cancelled) return
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          if (!cancelled) {
            useBookTransitionStore.getState().markLoginReady()
          }
        })
      })
    }

    waitAndSignal()

    return () => {
      cancelled = true
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [])

  const currentYear = new Date().getFullYear()

  const switchMode = (newMode: 'open' | 'begin') => {
    setMode(newMode)
    setErrorMessage(null)
    setConfirmationMessage(null)
    setPasswordError(false)
  }

  const handleOpenBook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)
    setConfirmationMessage(null)
    setPasswordError(false)

    if (openTimerRef.current) clearTimeout(openTimerRef.current)
    if (failSafeTimerRef.current) clearTimeout(failSafeTimerRef.current)

    if (!email.trim()) {
      setErrorMessage('Please enter an email address.')
      return
    }

    if (mode === 'begin') {
      if (!password || password.length < 6) {
        setPasswordError(true)
        setErrorMessage('Password must be at least 6 characters.')
        return
      }

      setIsSubmitting(true)

      try {
        const { session, error } = await signUp(email, password)

        if (error) {
          setIsSubmitting(false)
          setIsOpening(false)
          setErrorMessage(error.message || 'Could not create account.')
          return
        }

        setIsSubmitting(false)

        if (session) {
          // Email confirmation is off — open the book and land on /home
          const targetUrl = '/home'
          router.prefetch(targetUrl)

          const prefersReducedMotion =
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches

          setIsOpening(true)
          if (prefersReducedMotion) {
            setIsReducedMotion(true)
            openTimerRef.current = setTimeout(() => {
              router.push(targetUrl)
              failSafeTimerRef.current = setTimeout(() => {
                if (
                  typeof window !== 'undefined' &&
                  window.location.pathname !== '/home'
                ) {
                  window.location.assign('/home')
                }
              }, 4000)
            }, 200)
            return
          }

          // Router.push after the 1100ms swing ends
          openTimerRef.current = setTimeout(() => {
            router.push(targetUrl)
            failSafeTimerRef.current = setTimeout(() => {
              if (
                typeof window !== 'undefined' &&
                window.location.pathname !== '/home'
              ) {
                window.location.assign('/home')
              }
            }, 4000)
          }, 1100)
        } else {
          // Confirmation is on — show ink message, do not open cover
          setIsOpening(false)
          setConfirmationMessage(
            'Check your email to confirm, then open the book.'
          )
        }
      } catch (err: unknown) {
        setIsSubmitting(false)
        setIsOpening(false)
        const message =
          err instanceof Error ? err.message : 'Could not create account.'
        setErrorMessage(message)
      }
    } else {
      // mode === 'open' (sign in)
      if (!password) {
        setErrorMessage('Please enter your password.')
        return
      }

      setIsSubmitting(true)

      try {
        const { user, error } = await signIn(email, password)

        if (error || !user) {
          setIsSubmitting(false)
          setIsOpening(false)
          setErrorMessage(error?.message || 'Invalid email or password.')
          return
        }

        // Successful sign in — route to /home
        const targetUrl = '/home'
        router.prefetch(targetUrl)

        const prefersReducedMotion =
          typeof window !== 'undefined' &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches

        setIsOpening(true)
        if (prefersReducedMotion) {
          setIsReducedMotion(true)
          openTimerRef.current = setTimeout(() => {
            router.push(targetUrl)
            failSafeTimerRef.current = setTimeout(() => {
              if (
                typeof window !== 'undefined' &&
                window.location.pathname !== '/home'
              ) {
                window.location.assign('/home')
              }
            }, 4000)
          }, 200)
          return
        }

        // Router.push after the 1100ms swing ends
        openTimerRef.current = setTimeout(() => {
          router.push(targetUrl)
          failSafeTimerRef.current = setTimeout(() => {
            if (
              typeof window !== 'undefined' &&
              window.location.pathname !== '/home'
            ) {
              window.location.assign('/home')
            }
          }, 4000)
        }, 1100)
      } catch (err: unknown) {
        setIsSubmitting(false)
        setIsOpening(false)
        const message =
          err instanceof Error ? err.message : 'Invalid email or password.'
        setErrorMessage(message)
      }
    }
  }

  return (
    <LoginBookCoverArt
      currentYear={currentYear}
      isOpening={isOpening}
      isReducedMotion={isReducedMotion}
      cormorantClassName={cormorant.variable}
      footer={
        <div className="flex flex-col items-center justify-center gap-2 mt-10 sm:mt-12 text-center select-none">
          <div className="flex items-center justify-center gap-5">
            <button
              type="button"
              className="font-cover text-xs tracking-widest text-gold/75 hover:text-gold transition-colors underline decoration-dotted underline-offset-4 decoration-gold/50 cursor-default"
              aria-disabled="true"
            >
              Forgot the key?
            </button>
            <span className="text-gold/40 text-xs" aria-hidden="true">
              ·
            </span>
            <button
              type="button"
              onClick={() => switchMode(mode === 'open' ? 'begin' : 'open')}
              className="font-cover text-xs tracking-widest text-gold/75 hover:text-gold transition-colors underline decoration-dotted underline-offset-4 decoration-gold/50 cursor-pointer"
            >
              {mode === 'begin' ? 'I already have a book' : 'Begin a new book'}
            </button>
          </div>

          <Link
            href="/"
            className="font-hand text-xs sm:text-sm text-gold/80 hover:text-gold transition-colors underline decoration-dotted underline-offset-4 decoration-gold/40 inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-3"
            aria-label="Back to the desk"
          >
            Back to the desk
          </Link>
        </div>
      }
    >
      <p className="font-cover text-[11px] sm:text-xs font-semibold tracking-[0.22em] text-ink uppercase text-center border-b border-ink/20 pb-1.5 mb-2 sm:mb-2.5">
        {mode === 'begin' ? 'A NEW BOOK FOR' : 'THIS BOOK BELONGS TO'}
      </p>

      <form
        onSubmit={handleOpenBook}
        className="flex flex-col flex-1 justify-between"
        noValidate
      >
        <div className="flex flex-col gap-2 sm:gap-2.5">
          <div className="flex flex-col gap-0.5">
            <label
              htmlFor="book-email"
              className="font-cover text-[10px] sm:text-[11px] tracking-wider text-ink/75 uppercase font-medium"
            >
              Email
            </label>
            <input
              id="book-email"
              name="email"
              type="email"
              required
              autoComplete="off"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errorMessage) setErrorMessage(null)
                if (confirmationMessage) setConfirmationMessage(null)
                if (passwordError) setPasswordError(false)
              }}
              className="bg-transparent border-0 border-b-2 border-dotted border-ink/60 font-hand text-ink text-sm sm:text-base px-1 py-0.5 focus:border-ink placeholder:text-ink/70"
            />
          </div>

          <div className="flex flex-col gap-0.5">
            <label
              htmlFor="book-password"
              className="font-cover text-[10px] sm:text-[11px] tracking-wider text-ink/75 uppercase font-medium"
            >
              Password
            </label>
            <input
              id="book-password"
              name="password"
              type="password"
              required
              autoComplete="off"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errorMessage) setErrorMessage(null)
                if (confirmationMessage) setConfirmationMessage(null)
                if (passwordError) setPasswordError(false)
              }}
              className="bg-transparent border-0 border-b-2 border-dotted border-ink/60 font-hand text-ink text-sm sm:text-base px-1 py-0.5 focus:border-ink placeholder:text-ink/70"
            />
            {mode === 'begin' && (
              <p
                className={`font-hand text-[11px] sm:text-xs pt-0.5 ${
                  passwordError ? 'text-redpen' : 'text-ink/70'
                }`}
              >
                Password must be at least 6 characters.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1 mt-auto pt-1">
          {errorMessage && (
            <p
              role="alert"
              className="font-hand text-redpen text-xs sm:text-sm text-center leading-snug"
            >
              {errorMessage}
            </p>
          )}

          {confirmationMessage && (
            <p
              role="status"
              className="font-hand text-ink text-xs sm:text-sm text-center leading-snug"
            >
              {confirmationMessage}
            </p>
          )}

          {/* Brass button (only gold #d8b45a or kraft #b9895a) */}
          <button
            type="submit"
            disabled={isSubmitting || isOpening}
            className="mt-1 bg-gold hover:bg-kraft text-desk font-cover font-bold text-[11px] sm:text-xs tracking-[0.2em] uppercase py-2 sm:py-2.5 px-4 rounded-sm shadow-sm active:translate-y-px transition-colors duration-150 disabled:opacity-60 cursor-pointer text-center"
          >
            {isSubmitting || isOpening
              ? 'turning the page...'
              : mode === 'begin'
              ? 'BEGIN THE BOOK'
              : 'OPEN THE BOOK'}
          </button>
        </div>
      </form>
    </LoginBookCoverArt>
  )
}
