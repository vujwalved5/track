import Link from 'next/link'

export function SectionNextPageIsYours() {
  return (
    <section id="start" className="py-16 md:py-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="lift-card rounded-xl bg-[#172536] text-[#F4EFE4] p-8 sm:p-14 lg:p-16 relative overflow-hidden shadow-xl border border-[#B68A53]/30">
          {/* Subtle gold double inset line */}
          <div className="absolute inset-2 sm:inset-3 border border-[#B68A53]/25 rounded-lg pointer-events-none" />

          {/* Background subtle radial glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-radial from-[#B68A53]/15 to-transparent rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="flex items-center gap-2">
              <span className="font-public-condensed text-xs uppercase tracking-[0.25em] font-semibold text-[#B68A53]">
                05 / The Next Page Is Yours
              </span>
              <span className="h-px w-8 bg-[#B68A53]/40" />
            </div>

            <h2 className="font-public-serif text-3xl sm:text-5xl lg:text-6xl text-[#F4EFE4] tracking-tight leading-tight">
              Your days are worth remembering.
            </h2>

            <p className="font-public-sans text-base sm:text-lg text-[#F4EFE4]/80 leading-relaxed">
              Open your volume. Set up your first month. Begin where you are.
              No notifications, no streak anxieties—just honest dotted paper waiting for your pen.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link
                href="/login"
                className="press-btn inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#BD634A] text-[#F4EFE4] font-public-condensed text-sm uppercase tracking-[0.18em] font-semibold rounded hover:bg-[#BD634A]/90 shadow-md"
              >
                <span>Start with today</span>
                <span aria-hidden="true">↗</span>
              </Link>
              <Link
                href="/focus-room"
                className="press-btn inline-flex items-center gap-2 px-6 py-3.5 bg-transparent border border-[#F4EFE4]/30 text-[#F4EFE4] font-public-condensed text-sm uppercase tracking-[0.16em] font-semibold rounded hover:border-[#F4EFE4] hover:bg-white/5"
              >
                <span>Explore Focus Room</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <span className="font-public-script text-base text-[#D2A75D]">
                ready when you are
              </span>
              <span className="text-[#B68A53]/50">·</span>
              <span className="font-public-condensed text-xs uppercase tracking-wider text-[#B68A53]">
                Two-page desktop book · Mobile pocket edition
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
