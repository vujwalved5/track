import Link from 'next/link'

interface PublicFooterProps {
  current?: 'home' | 'focus-room'
}

export function PublicFooter({ current = 'home' }: PublicFooterProps = {}) {
  const isFocusRoom = current === 'focus-room'

  // Focus Room Footer (Preserved 100% byte-for-byte from commit ded0290)
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

  // Home Page Footer (1366px reference: y=5000..5281, 281px height)
  return (
    <footer className="relative w-full bg-[#172536] text-[#F4EFE4] overflow-hidden min-h-[281px] lg:h-[281px]">
      {/* Mobile Flow (Below 1024px) */}
      <div className="block lg:hidden w-full max-w-[1366px] mx-auto px-6 sm:px-8 py-10 space-y-6">
        <div>
          <h2 className="font-public-headline text-[32px] font-bold uppercase tracking-[-0.04em] text-[#F4EFE4] leading-none select-none">
            TRACK
          </h2>
          <p className="font-public-serif not-italic text-lg text-[#F4EFE4]/90 tracking-normal leading-tight mt-3">
            A little more present. A little more consistent.
          </p>
        </div>

        {/* Mobile Nav Links: min 44px tap targets, >= 14px text */}
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 font-public-condensed text-[14px] uppercase tracking-[0.22em] pt-2">
          <Link
            href="/"
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-[#F4EFE4] hover:text-[#D2A75D] transition-colors"
          >
            HOME
          </Link>
          <Link
            href="/login"
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-[#F4EFE4] hover:text-[#D2A75D] transition-colors"
          >
            JOURNAL
          </Link>
          <Link
            href="/focus-room"
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-[#F4EFE4] hover:text-[#D2A75D] transition-colors"
          >
            FOCUS ROOM
          </Link>
          <Link
            href="/#about"
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-[#F4EFE4] hover:text-[#D2A75D] transition-colors"
          >
            ABOUT
          </Link>
        </nav>

        {/* Divider Line */}
        <div className="w-full h-px bg-[#F4EFE4]/15" aria-hidden="true" />

        {/* Colophon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-public-condensed text-[14px] uppercase tracking-[0.22em] text-[#90A0B3]">
          <span>THE ATLAS OF EVERYDAY</span>
          <span>AN OPEN PAGE, ALWAYS</span>
        </div>
      </div>

      {/* Desktop Layout (>= 1024px) - 100% byte-for-byte identical to 1366px reference build */}
      <div className="hidden lg:block relative w-full max-w-[1366px] h-full mx-auto">
        {/* Wordmark: TRACK (Ref: x=83..181, y=5059..5092 / offset y=57) - heavier, tighter condensed Oswald */}
        <div className="absolute left-6 lg:left-[83px] top-[40px] lg:top-[57px]">
          <h2 className="font-public-headline text-[38px] font-bold uppercase tracking-[-0.04em] text-[#F4EFE4] leading-none select-none">
            TRACK
          </h2>
        </div>

        {/* Tagline: A little more present. A little more consistent. (Ref: x=83..584, y=5121..5146 / offset y=120) - UPRIGHT Fraunces serif */}
        <div className="absolute left-6 lg:left-[83px] top-[110px] lg:top-[120px]">
          <p className="font-public-serif not-italic text-xl lg:text-[22px] text-[#F4EFE4]/90 tracking-normal leading-tight">
            A little more present. A little more consistent.
          </p>
        </div>

        {/* Right Nav Links: HOME   JOURNAL   FOCUS ROOM   ABOUT (Ref: x=1009..1280 / offset y=58) */}
        <nav className="absolute left-6 lg:left-[1009px] top-[150px] lg:top-[58px] flex items-center justify-between w-[272px] font-public-condensed text-[12px] uppercase tracking-[0.22em]">
          <Link
            href="/"
            className="text-[#F4EFE4] hover:text-[#D2A75D] transition-colors"
          >
            HOME
          </Link>
          <Link
            href="/login"
            className="text-[#F4EFE4] hover:text-[#D2A75D] transition-colors"
          >
            JOURNAL
          </Link>
          <Link
            href="/focus-room"
            className="text-[#F4EFE4] hover:text-[#D2A75D] transition-colors"
          >
            FOCUS ROOM
          </Link>
          <Link
            href="/#about"
            className="text-[#F4EFE4] hover:text-[#D2A75D] transition-colors"
          >
            ABOUT
          </Link>
        </nav>

        {/* Hairline Divider Line (Ref: x=82..1283, y=5223 / offset y=222) */}
        <div
          className="absolute left-6 lg:left-[83px] w-[calc(100%-48px)] lg:w-[1200px] top-[200px] lg:top-[222px] h-px bg-[#F4EFE4]/15 pointer-events-none"
          aria-hidden="true"
        />

        {/* Colophon Bar (Ref: x=82..1281, y=5246 / offset y=244) */}
        <div className="absolute left-6 lg:left-[83px] w-[calc(100%-48px)] lg:w-[1200px] top-[220px] lg:top-[244px] flex flex-col sm:flex-row items-center justify-between font-public-condensed text-[11px] uppercase tracking-[0.22em] text-[#90A0B3]">
          <span>THE ATLAS OF EVERYDAY</span>
          <span>AN OPEN PAGE, ALWAYS</span>
        </div>
      </div>
    </footer>
  )
}
