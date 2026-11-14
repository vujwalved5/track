import Link from 'next/link'

interface PublicNavProps {
  current?: 'home' | 'focus-room'
  theme?: 'chalk' | 'ink'
}

export function PublicNav({ current = 'home', theme = 'chalk' }: PublicNavProps) {
  const isDark = theme === 'ink'

  const navClasses = isDark
    ? 'bg-[#172536] text-[#F4EFE4] border-b border-[#F4EFE4]/15'
    : 'bg-[#F4EFE4] text-[#172536] border-b border-[#172536]/10'

  const linkBase = isDark
    ? 'text-[#F4EFE4]/75 hover:text-[#B68A53] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B68A53]'
    : 'text-[#172536]/75 hover:text-[#BD634A] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#BD634A]'

  const activeLink = isDark
    ? 'text-[#F4EFE4] font-semibold border-b border-[#B68A53]'
    : 'text-[#172536] font-semibold border-b border-[#BD634A]'

  return (
    <nav
      aria-label="Main Navigation"
      className={`sticky top-0 z-40 w-full transition-colors ${navClasses}`}
    >
      <div className="max-w-[1366px] mx-auto px-6 sm:px-14 lg:px-20 min-h-[91px] flex flex-wrap items-center justify-between gap-y-2 gap-x-4 py-3 relative">
        {/* Brand */}
        <div className="flex items-center z-10">
          <Link
            href="/"
            className="group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B68A53] rounded"
          >
            <div className="flex flex-col">
              <span className="font-public-headline text-2xl sm:text-3xl tracking-[0.2em] uppercase font-bold text-inherit leading-none">
                TRACK
              </span>
              <span className="w-8 h-[2px] bg-[#B68A53] mt-1" aria-hidden="true" />
            </div>
          </Link>
        </div>

        {/* Links row - centered on desktop */}
        <div className="hidden md:flex absolute inset-x-0 justify-center pointer-events-none">
          <div className="flex items-center gap-x-8 lg:gap-x-10 text-xs font-public-condensed uppercase tracking-[0.22em] font-medium pointer-events-auto">
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
              FOCUS ROOM
            </Link>
            <Link
              href={current === 'home' ? '#about' : '/#about'}
              className={`pb-0.5 ${linkBase}`}
            >
              ABOUT
            </Link>
          </div>
        </div>

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

        {/* Right Section */}
        <div className="flex items-center z-10">
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
              className="press-btn inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-public-condensed uppercase tracking-[0.15em] font-semibold rounded bg-[#172536] text-[#F4EFE4] hover:bg-[#172536]/90"
            >
              <span>Open your journal</span>
              <span aria-hidden="true">↗</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
