import Link from 'next/link'

interface PublicNavProps {
  current?: 'home' | 'focus-room'
  theme?: 'chalk' | 'ink'
}

export function PublicNav({ current = 'home', theme = 'chalk' }: PublicNavProps) {
  const isDark = theme === 'ink'

  const navClasses = isDark
    ? 'bg-[#172536] text-[#F4EFE4] border-b border-[#F4EFE4]/15'
    : 'bg-[#F4EFE4] text-[#172536] border-b border-[#c3c2be]'

  const linkBase = isDark
    ? 'text-[#F4EFE4]/75 hover:text-[#B68A53] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B68A53]'
    : 'text-[#172536] font-bold hover:text-[#BD634A] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#BD634A]'

  const activeLink = isDark
    ? 'text-[#F4EFE4] font-semibold border-b border-[#B68A53]'
    : 'text-[#172536] font-bold border-b-2 border-[#BD634A]'

  return (
    <nav
      aria-label="Main Navigation"
      className={`sticky top-0 z-40 w-full transition-colors h-[95px] flex items-center ${navClasses}`}
    >
      <div className="w-full max-w-[1202px] mx-auto px-6 lg:px-0 flex items-center justify-between relative">
        {/* Brand */}
        <div className="flex items-center gap-5 sm:gap-6 z-10">
          <Link
            href="/"
            className="group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B68A53] rounded"
          >
            <div className="flex flex-col">
              <span className={`font-public-headline text-2xl sm:text-[29px] uppercase font-bold text-inherit leading-none ${current === 'home' ? 'tracking-normal' : 'tracking-[0.2em]'}`}>
                TRACK
              </span>
              {current === 'home' ? (
                <span className="font-public-condensed text-[10px] uppercase tracking-[0.2em] text-[#172536]/70 mt-[3px] font-semibold whitespace-nowrap leading-none">
                  AN ATLAS OF EVERYDAY
                </span>
              ) : (
                <span className="w-8 h-[2px] bg-[#B68A53] mt-1" aria-hidden="true" />
              )}
            </div>
          </Link>

          {current === 'home' && (
            <>
              <div className="hidden sm:block h-7 w-px bg-[#172536]/15" aria-hidden="true" />
              <div className="hidden sm:flex flex-col text-[10px] font-public-condensed uppercase tracking-[0.22em] text-[#172536]/70 leading-tight font-semibold">
                <span>ISSUE NO. 01</span>
                <span>THE EVERYDAY EDITION</span>
              </div>
            </>
          )}
        </div>

        {/* Links row for Focus Room (centered on desktop as originally designed) */}
        {current === 'focus-room' && (
          <div className="hidden md:flex absolute inset-x-0 justify-center pointer-events-none">
            <div className="flex items-center gap-x-8 lg:gap-x-10 text-xs font-public-condensed uppercase tracking-[0.22em] font-medium pointer-events-auto">
              <Link
                href="/"
                className={`pb-0.5 ${linkBase}`}
              >
                HOME
              </Link>
              <Link
                href="/login"
                className={`pb-0.5 ${linkBase}`}
              >
                JOURNAL
              </Link>
              <Link
                href="/focus-room"
                className={`pb-0.5 ${activeLink}`}
              >
                FOCUS ROOM
              </Link>
              <Link
                href="/#about"
                className={`pb-0.5 ${linkBase}`}
              >
                ABOUT
              </Link>
            </div>
          </div>
        )}

        {/* Mobile links row fallback */}
        <div className="flex md:hidden items-center gap-x-4 text-xs font-public-condensed uppercase tracking-[0.22em] font-medium">
          <Link
            href="/"
            className={`pb-0.5 ${current === 'home' ? activeLink : linkBase}`}
          >
            HOME
          </Link>
          <Link
            href="/login"
            className={`pb-0.5 ${linkBase}`}
          >
            JOURNAL
          </Link>
          <Link
            href="/focus-room"
            className={`pb-0.5 ${current === 'focus-room' ? activeLink : linkBase}`}
          >
            FOCUS
          </Link>
        </div>

        {/* Right Section: In Home mode, navigation links sit right-aligned adjacent to the 171px CTA button */}
        <div className="flex items-center gap-7 lg:gap-[18px] z-10">
          {current === 'home' && (
            <div className="hidden md:flex items-center gap-7 lg:gap-[36px] text-xs font-public-condensed uppercase tracking-[0.22em] font-bold">
              <Link
                href="/"
                className={`pb-0.5 ${activeLink}`}
              >
                HOME
              </Link>
              <Link
                href="/login"
                className={`pb-0.5 ${linkBase}`}
              >
                JOURNAL
              </Link>
              <Link
                href="/focus-room"
                className={`pb-0.5 ${linkBase}`}
              >
                FOCUS ROOM
              </Link>
              <Link
                href="#about"
                className={`pb-0.5 ${linkBase}`}
              >
                ABOUT
              </Link>
            </div>
          )}

          {current === 'focus-room' ? (
            <div className="flex flex-col items-end text-right">
              <span className="font-public-condensed text-[11px] uppercase tracking-[0.25em] font-semibold text-[#B68A53]">
                NIGHT STUDY / 02
              </span>
              <Link
                href="/login"
                className="font-public-sans text-xs tracking-normal text-[#F4EFE4]/90 hover:text-[#B68A53] border-b border-[#B68A53] pb-0.5 mt-0.5 transition-colors inline-block"
              >
                ← Return to journal
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="press-btn inline-flex items-center justify-center gap-2 w-[171px] h-[50px] text-xs font-public-condensed uppercase tracking-[0.2em] font-bold rounded bg-[#172536] text-[#F4EFE4] hover:bg-[#172536]/90 transition-colors"
            >
              <span>OPEN JOURNAL</span>
              <svg
                width="11"
                height="11"
                viewBox="0 0 11 11"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="shrink-0"
              >
                <path d="M2.5 8.5L8.5 2.5M3.5 2.5H8.5V7.5" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
