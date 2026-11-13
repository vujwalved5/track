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
    ? 'text-[#F4EFE4]/80 hover:text-[#BD634A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BD634A]'
    : 'text-[#172536]/80 hover:text-[#BD634A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BD634A]'

  const activeLink = isDark
    ? 'text-[#F4EFE4] font-semibold border-b border-[#BD634A]'
    : 'text-[#172536] font-semibold border-b border-[#BD634A]'

  return (
    <nav
      aria-label="Main Navigation"
      className={`sticky top-0 z-40 w-full transition-colors ${navClasses}`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-y-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link
            href="/welcome"
            className="flex items-baseline gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BD634A] rounded"
          >
            <span className="font-public-display text-2xl tracking-[0.18em] uppercase font-bold text-inherit">
              TRACK
            </span>
            <span className="font-public-condensed text-xs tracking-[0.22em] uppercase text-[#B68A53]">
              {current === 'focus-room' ? 'Night Study / 02' : 'Atlas of Everyday'}
            </span>
          </Link>
        </div>

        {/* Links row - wraps on 390px without hamburger */}
        <div className="flex flex-wrap items-center gap-x-6 sm:gap-x-8 gap-y-2 text-sm font-public-sans tracking-wide">
          <Link
            href="/welcome"
            className={`pb-0.5 transition-colors ${current === 'home' ? activeLink : linkBase}`}
          >
            Home
          </Link>
          <Link
            href="/"
            className={`pb-0.5 transition-colors ${linkBase}`}
          >
            Journal
          </Link>
          <Link
            href="/welcome/focus-room"
            className={`pb-0.5 transition-colors ${current === 'focus-room' ? activeLink : linkBase}`}
          >
            Focus Room
          </Link>
          <Link
            href={current === 'home' ? '#about' : '/welcome#about'}
            className={`pb-0.5 transition-colors ${linkBase}`}
          >
            About
          </Link>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className={`press-btn inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-public-condensed uppercase tracking-[0.15em] font-semibold rounded ${
              isDark
                ? 'bg-[#B68A53] text-[#172536] hover:bg-[#D2A75D]'
                : 'bg-[#172536] text-[#F4EFE4] hover:bg-[#172536]/90'
            }`}
          >
            {current === 'focus-room' ? (
              <>
                <span aria-hidden="true">←</span>
                <span>Return to journal</span>
              </>
            ) : (
              <>
                <span>Open your journal</span>
                <span aria-hidden="true">↗</span>
              </>
            )}
          </Link>
        </div>
      </div>
    </nav>
  )
}
