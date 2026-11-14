import Link from 'next/link'

interface PublicFooterProps {
  current?: 'home' | 'focus-room'
}

export function PublicFooter({ current = 'home' }: PublicFooterProps = {}) {
  const isFocusRoom = current === 'focus-room'

  if (isFocusRoom) {
    return (
      <footer className="w-full bg-[#172536] text-[#F4EFE4] pt-[71px] pb-[17px] overflow-hidden">
        <div className="max-w-[1202px] mx-auto px-4 sm:px-6 lg:px-0">
          {/* Top Eyebrows Row */}
          <div className="flex items-center justify-between">
            <span className="font-public-condensed text-xs uppercase tracking-[0.25em] font-semibold text-[#B68A53]">
              TRACK / FOCUS ROOM
            </span>
            <span className="font-public-condensed text-xs uppercase tracking-[0.22em] font-semibold text-[#B68A53]">
              COMPANION PAGES / DESIGN PREVIEW
            </span>
          </div>

          {/* Heading + Companion Links Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mt-6">
            <h2 className="font-public-display text-4xl sm:text-6xl lg:text-[92px] text-[#F4EFE4] font-normal leading-[0.98] tracking-tight whitespace-nowrap">
              Until then, take your time.
            </h2>
            <nav className="flex flex-wrap items-center gap-6 sm:gap-7 lg:pt-5 font-public-condensed text-xs uppercase tracking-[0.22em] shrink-0">
              <Link
                href="/"
                className="text-[#F4EFE4]/75 hover:text-[#F4EFE4] transition-colors"
              >
                HOME
              </Link>
              <Link
                href="/login"
                className="text-[#F4EFE4]/75 hover:text-[#F4EFE4] transition-colors"
              >
                JOURNAL
              </Link>
              <Link
                href="/focus-room"
                className="text-[#F4EFE4] border-b border-[#B68A53] pb-1 flex items-center gap-1 font-semibold"
              >
                <span>FOCUS ROOM</span>
                <span aria-hidden="true">↑</span>
              </Link>
              <Link
                href="/#about"
                className="text-[#F4EFE4]/75 hover:text-[#F4EFE4] transition-colors"
              >
                ABOUT
              </Link>
            </nav>
          </div>

          {/* Subtitle Paragraph */}
          <p className="font-public-sans text-sm sm:text-base text-[#F4EFE4]/80 mt-5 max-w-md leading-relaxed">
            The Focus Room is being prepared. Your timer and music controls will arrive here.
          </p>

          {/* Bottom Divider Line */}
          <div className="mt-14 mb-8 border-t border-[#F4EFE4]/15 w-full" />

          {/* Colophon Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-public-condensed text-xs uppercase tracking-[0.22em] text-[#90A0B3]">
            <span>TRACK © 2026</span>
            <span>AN ATLAS OF EVERYDAY / NIGHT STUDY 02</span>
          </div>
        </div>
      </footer>
    )
  }

  // Home Page Footer
  return (
    <footer className="w-full bg-[#172536] text-[#F4EFE4] pt-16 pb-12 overflow-hidden">
      <div className="max-w-[1202px] mx-auto px-4 sm:px-6 lg:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            <h2 className="font-public-headline text-4xl sm:text-5xl font-bold uppercase tracking-[0.15em] text-[#F4EFE4]">
              TRACK
            </h2>
            <p className="font-public-serif text-lg sm:text-xl text-[#F4EFE4]/90 mt-4 max-w-md">
              A little more present. A little more consistent.
            </p>
          </div>

          <div className="lg:col-span-5 lg:text-right pt-2 lg:pt-0">
            <nav className="flex flex-wrap items-center gap-6 sm:gap-7 lg:justify-end font-public-condensed text-xs uppercase tracking-[0.22em]">
              <Link
                href="/"
                className="text-[#F4EFE4] border-b border-[#B68A53] pb-1 font-semibold"
              >
                HOME
              </Link>
              <Link
                href="/login"
                className="text-[#F4EFE4]/75 hover:text-[#F4EFE4] transition-colors"
              >
                JOURNAL
              </Link>
              <Link
                href="/focus-room"
                className="text-[#F4EFE4]/75 hover:text-[#F4EFE4] transition-colors"
              >
                FOCUS ROOM
              </Link>
              <Link
                href="/#about"
                className="text-[#F4EFE4]/75 hover:text-[#F4EFE4] transition-colors"
              >
                ABOUT
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-14 mb-8 border-t border-[#F4EFE4]/15 w-full" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-public-condensed text-xs uppercase tracking-[0.22em] text-[#90A0B3]">
          <span>THE ATLAS OF EVERYDAY</span>
          <span>AN OPEN PAGE, ALWAYS</span>
        </div>
      </div>
    </footer>
  )
}
