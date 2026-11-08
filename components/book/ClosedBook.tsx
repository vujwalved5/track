'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Cormorant_Garamond } from 'next/font/google'
import { signIn, signUp } from '@/lib/supabase/auth'

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
        const { user, session, error } = await signUp(email, password)

        if (error) {
          setIsSubmitting(false)
          setErrorMessage(error.message || 'Could not create account.')
          return
        }

        setIsSubmitting(false)

        if (session) {
          // Email confirmation is off — open the book as in sign in
          const now = new Date()
          const year = now.getFullYear()
          const month = now.getMonth() + 1
          const targetUrl = `/book/${year}/${month}`

          const prefersReducedMotion =
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches

          if (prefersReducedMotion) {
            router.push(targetUrl)
            return
          }

          setIsOpening(true)
          setTimeout(() => {
            router.push(targetUrl)
          }, 900)
        } else {
          // Confirmation is on — show ink message, do not open cover
          setConfirmationMessage(
            'Check your email to confirm, then open the book.'
          )
        }
      } catch (err: unknown) {
        setIsSubmitting(false)
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
          setErrorMessage(error?.message || 'Invalid email or password.')
          return
        }

        // Successful sign in — route to current year and unpadded month number (e.g. /book/2026/11)
        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth() + 1
        const targetUrl = `/book/${year}/${month}`

        const prefersReducedMotion =
          typeof window !== 'undefined' &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches

        if (prefersReducedMotion) {
          router.push(targetUrl)
          return
        }

        setIsOpening(true)
        setTimeout(() => {
          router.push(targetUrl)
        }, 900)
      } catch (err: unknown) {
        setIsSubmitting(false)
        const message =
          err instanceof Error ? err.message : 'Invalid email or password.'
        setErrorMessage(message)
      }
    }
  }

  return (
    <div className={`relative flex flex-col items-center justify-center p-4 ${cormorant.variable}`}>
      {/* 3D Perspective container */}
      <div
        className="relative w-[min(520px,calc(100vw-32px))] h-[min(700px,calc((100vw-32px)*700/520))] aspect-[520/700] sm:aspect-auto sm:w-[520px] sm:h-[700px]"
        style={{ perspective: '1800px' }}
      >
        {/* Book block (interior right page visible when opened + page edges on right) */}
        <div
          className="absolute inset-0 rounded-r-2xl sm:rounded-r-3xl overflow-hidden bg-paper"
          style={{
            boxShadow:
              '14px 18px 45px rgba(0, 0, 0, 0.65), 4px 6px 14px rgba(0, 0, 0, 0.45)',
          }}
          aria-hidden="true"
        >
          {/* Paper texture with 22px dot grid */}
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(28, 36, 51, 0.28) 1.4px, transparent 1.4px)',
              backgroundSize: '22px 22px',
              boxShadow: 'inset 28px 0 32px -12px rgba(28, 36, 51, 0.22)',
            }}
          />

          {/* Page edges visible behind the cover on the right (thin cream stripes) */}
          <div
            className="absolute right-0 top-1.5 bottom-1.5 w-2.5 sm:w-3 rounded-r-sm overflow-hidden pointer-events-none"
            style={{
              background:
                'repeating-linear-gradient(to bottom, #f4eddc 0px, #f4eddc 2px, rgba(28, 36, 51, 0.16) 2px, rgba(28, 36, 51, 0.16) 4px)',
              boxShadow:
                'inset 2px 0 3px rgba(28, 36, 51, 0.25), 2px 0 4px rgba(0, 0, 0, 0.35)',
            }}
          />
        </div>

        {/* Gold ribbon hanging from the bottom */}
        <div
          className="absolute bottom-[-38px] sm:bottom-[-48px] left-14 sm:left-20 w-4 sm:w-5 h-12 sm:h-16 bg-gold pointer-events-none z-10"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 84%, 0 100%)',
            boxShadow: '2px 4px 10px rgba(0, 0, 0, 0.55)',
          }}
          aria-hidden="true"
        />

        {/* 3D Hinged Front Cover */}
        <div
          className="absolute inset-y-0 left-0 w-[calc(100%-8px)] sm:w-[calc(100%-10px)] rounded-r-2xl sm:rounded-r-3xl z-20 motion-reduce:transition-none motion-reduce:transform-none"
          style={{
            transformOrigin: 'left center',
            transformStyle: 'preserve-3d',
            transform: isOpening ? 'rotateY(-140deg)' : 'rotateY(0deg)',
            transition: 'transform 900ms cubic-bezier(0.25, 1, 0.5, 1)',
            boxShadow: isOpening
              ? '-12px 14px 35px rgba(0, 0, 0, 0.7)'
              : '8px 12px 28px rgba(0, 0, 0, 0.55)',
          }}
        >
          {/* Front face of cover */}
          <div
            className="absolute inset-0 rounded-r-2xl sm:rounded-r-3xl overflow-hidden bg-gradient-to-br from-oxblood to-oxblood-dark flex flex-col justify-between p-4 sm:p-7 select-none"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* Darker spine band on the left with gold vertical line */}
            <div
              className="absolute left-0 top-0 bottom-0 w-8 sm:w-11 bg-oxblood-dark border-r border-gold/75 pointer-events-none z-10"
              aria-hidden="true"
            />

            {/* Gold foil inset double border */}
            <div
              className="absolute left-10 sm:left-14 right-3 sm:right-5 top-3 sm:top-5 bottom-3 sm:bottom-5 border border-gold/70 pointer-events-none rounded-r-lg"
              aria-hidden="true"
            >
              <div
                className="absolute inset-1 sm:inset-1.5 border border-gold/45 rounded-r-md"
                aria-hidden="true"
              />
            </div>

            {/* Title section (Cormorant Garamond, Gold) */}
            <div className="relative z-10 pl-7 sm:pl-9 pr-1 sm:pr-2 pt-2 sm:pt-4 text-center">
              <p className="font-cover text-[10px] sm:text-xs tracking-[0.25em] text-gold uppercase font-medium">
                VOLUME — {currentYear}
              </p>
              <h1 className="font-cover text-2xl sm:text-4xl text-gold font-bold tracking-[0.16em] uppercase leading-tight mt-1 sm:mt-2">
                MEMORABLE
                <br />
                MOMENTS
              </h1>
              <p className="font-cover italic text-xs sm:text-sm text-gold/90 tracking-widest mt-1 sm:mt-2 font-normal">
                a year, kept by hand
              </p>
            </div>

            {/* Cream bookplate label glued on the lower cover */}
            <div className="relative z-10 pl-7 sm:pl-9 pr-1 sm:pr-2 pb-2 sm:pb-3">
              <div
                className="bg-paper text-ink rounded-sm shadow-md border border-kraft/35 p-3.5 sm:p-5 max-w-[340px] sm:max-w-[370px] mx-auto h-[275px] sm:h-[305px] flex flex-col justify-between"
                style={{
                  boxShadow:
                    '0 3px 10px rgba(0, 0, 0, 0.35), inset 0 0 16px rgba(185, 137, 90, 0.15)',
                }}
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
                        autoComplete="email"
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
                        autoComplete={mode === 'begin' ? 'new-password' : 'current-password'}
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
              </div>
            </div>
          </div>

          {/* Inside facing endpaper of front cover when swung open */}
          <div
            className="absolute inset-0 rounded-l-2xl sm:rounded-l-3xl bg-paper overflow-hidden pointer-events-none"
            style={{
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden',
              boxShadow: 'inset -24px 0 28px -10px rgba(28, 36, 51, 0.25)',
            }}
            aria-hidden="true"
          >
            <div
              className="w-full h-full"
              style={{
                backgroundImage:
                  'radial-gradient(circle, rgba(28, 36, 51, 0.25) 1.2px, transparent 1.2px)',
                backgroundSize: '22px 22px',
              }}
            />
          </div>
        </div>
      </div>

      {/* Under the book: small links */}
      <div className="flex items-center justify-center gap-5 mt-12 sm:mt-14 text-center">
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
    </div>
  )
}
