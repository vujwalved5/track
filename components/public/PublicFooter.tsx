import Link from 'next/link'

interface PublicFooterProps {
  current?: 'home' | 'focus-room'
}

export function PublicFooter({ current = 'home' }: PublicFooterProps = {}) {
  const isFocusRoom = current === 'focus-room'

  return (
    <footer className="w-full bg-[#172536] text-[#F4EFE4] border-t border-[#F4EFE4]/15 mt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          {/* Brand & Tagline */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-baseline gap-3">
              <span className="font-public-display text-4xl sm:text-5xl tracking-[0.2em] uppercase font-bold text-[#F4EFE4]">
                TRACK
              </span>
              <span className="font-public-condensed text-xs tracking-[0.25em] uppercase text-[#B68A53]">
                {isFocusRoom ? 'Night Study / 02' : 'Atlas of Everyday'}
              </span>
            </div>
            <p className="font-public-serif text-base text-[#F4EFE4]/80 max-w-sm italic">
              {isFocusRoom
                ? 'Until then, take your time.'
                : 'A quieter digital notebook for recording days, noticing progress, and returning to what matters.'}
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="press-btn inline-flex items-center gap-2 px-4 py-2 bg-[#BD634A] text-[#F4EFE4] font-public-condensed text-xs uppercase tracking-[0.18em] rounded hover:bg-[#BD634A]/90"
              >
                <span>{isFocusRoom ? 'Return to journal' : 'Start with today'}</span>
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>

          {/* Quick links */}
          <div className="md:col-span-4 space-y-3">
            <h3 className="font-public-condensed text-xs uppercase tracking-[0.2em] text-[#B68A53]">
              Navigation
            </h3>
            <ul className="space-y-2 font-public-sans text-sm text-[#F4EFE4]/75">
              <li>
                <Link href="/welcome" className="hover:text-[#BD634A] transition-colors">
                  Home (Atlas)
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-[#BD634A] transition-colors">
                  Journal Login
                </Link>
              </li>
              <li>
                <Link href="/welcome/focus-room" className="hover:text-[#BD634A] transition-colors">
                  Focus Room
                </Link>
              </li>
              <li>
                <Link href="/welcome#about" className="hover:text-[#BD634A] transition-colors">
                  About the Idea
                </Link>
              </li>
            </ul>
          </div>

          {/* Colophon & Hand-drawn SVG Emblem */}
          <div className="md:col-span-3 space-y-4">
            <div className="flex items-center gap-3">
              <svg
                width="36"
                height="36"
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#B68A53]"
                aria-hidden="true"
              >
                {/* Hand-drawn open book / compass icon */}
                <path
                  d="M18 6V30M18 30C15 27 8 27 4 29V7C8 5 15 5 18 8M18 30C21 27 28 27 32 29V7C28 5 21 5 18 8"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="18" cy="18" r="1.5" fill="currentColor" />
              </svg>
              <div className="font-public-script text-lg text-[#D2A75D]">
                kept by hand
              </div>
            </div>
            <p className="font-public-sans text-xs text-[#F4EFE4]/60 leading-relaxed">
              Two pages side by side on desktop, one page on mobile. Dot grid stationery and calm reflection.
            </p>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="border-t border-[#F4EFE4]/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-public-sans text-[#F4EFE4]/50">
          <div>© {new Date().getFullYear()} TRACK · Memorable Moments. All rights reserved.</div>
          <div className="font-public-condensed tracking-wider uppercase text-[#B68A53]">
            No algorithms. No social feeds. Just your days.
          </div>
        </div>
      </div>
    </footer>
  )
}
