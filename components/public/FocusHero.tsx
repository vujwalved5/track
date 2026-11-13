import Image from 'next/image'
import Link from 'next/link'

export function FocusHero() {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24 border-b border-[#F4EFE4]/15">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded bg-[#B68A53]/20 border border-[#B68A53]/40">
              <span className="w-2 h-2 rounded-full bg-[#BD634A]" />
              <span className="font-public-condensed text-xs uppercase tracking-[0.25em] font-semibold text-[#D2A75D]">
                Night Study / Focus Sanctuary
              </span>
            </div>

            <h1 className="font-public-serif text-5xl sm:text-6xl lg:text-7xl leading-[1.08] tracking-tight text-[#F4EFE4]">
              Find your{' '}
              <span className="italic text-[#D2A75D] font-normal">rhythm.</span>
            </h1>

            <p className="font-public-sans text-lg sm:text-xl text-[#F4EFE4]/80 max-w-xl leading-relaxed">
              A distraction-free sanctuary for deep work, slow reading, and single-tasking.
              One intention at a time, timed with quiet intervals and gentle ambience.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#practice"
                className="press-btn inline-flex items-center gap-2 px-6 py-3.5 bg-[#B68A53] text-[#172536] font-public-condensed text-sm uppercase tracking-[0.16em] font-semibold rounded shadow hover:bg-[#D2A75D]"
              >
                <span>Enter Practice</span>
                <span aria-hidden="true">↓</span>
              </a>
              <Link
                href="/"
                className="press-btn inline-flex items-center gap-2 px-6 py-3.5 bg-transparent border border-[#F4EFE4]/30 text-[#F4EFE4] font-public-condensed text-sm uppercase tracking-[0.16em] font-semibold rounded hover:border-[#F4EFE4] hover:bg-white/5"
              >
                <span>← Return to Journal</span>
              </Link>
            </div>

            <div className="pt-4 border-t border-[#F4EFE4]/15 max-w-md">
              <p className="font-public-condensed text-xs uppercase tracking-[0.2em] text-[#B68A53]">
                Single-tasking only. Close other tabs and settle in.
              </p>
            </div>
          </div>

          {/* Right Column: Desk Photo with Celestial Orbit SVG */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            <div className="relative w-full max-w-[460px]">
              {/* Main Photo Card */}
              <div className="relative lift-card rounded-lg overflow-hidden shadow-2xl border border-[#F4EFE4]/20 bg-[#172536] aspect-[4/3] w-full z-10">
                <Image
                  src="/welcome/focus-desk.jpg"
                  alt="Warm lit desk with books, magazines, and a glowing lamp for a cozy ambiance."
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 460px"
                />

                {/* Celestial Orbit SVG Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <svg
                    viewBox="0 0 400 300"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full opacity-60 text-[#D2A75D]"
                    aria-label="Celestial orbit lines"
                    role="img"
                  >
                    {/* Elliptical orbit rings */}
                    <ellipse cx="200" cy="150" rx="160" ry="85" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" />
                    <ellipse cx="200" cy="150" rx="120" ry="55" stroke="#F4EFE4" strokeWidth="0.8" strokeDasharray="2 3" opacity="0.7" />
                    <circle cx="280" cy="110" r="3.5" fill="#D2A75D" />
                    <circle cx="120" cy="180" r="2.5" fill="#BD634A" />
                    <circle cx="340" cy="170" r="2" fill="#F4EFE4" />
                  </svg>
                </div>
              </div>

              {/* Glowing Badge */}
              <div className="absolute -bottom-4 right-2 sm:-bottom-6 sm:-right-4 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded bg-[#172536] border border-[#B68A53]/50 text-[#F4EFE4] shadow-xl z-20 lift-card">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#BD634A]" />
                  <span className="font-public-condensed text-[10px] sm:text-[11px] uppercase tracking-[0.22em] font-semibold text-[#D2A75D]">
                    Low Light / Clear Mind / 01:25 AM
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
