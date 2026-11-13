import Link from 'next/link'

export function FocusReflection() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden bg-[#172536] text-[#F4EFE4]">
      {/* Star Map / Constellation Background SVG */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <svg
          viewBox="0 0 1200 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover text-[#D2A75D]"
          aria-hidden="true"
        >
          {/* Constellation lines */}
          <line x1="120" y1="180" x2="280" y2="120" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 4" />
          <line x1="280" y1="120" x2="420" y2="240" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 4" />
          <line x1="420" y1="240" x2="560" y2="150" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 4" />
          <line x1="780" y1="320" x2="940" y2="210" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 4" />
          <line x1="940" y1="210" x2="1080" y2="280" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 4" />

          {/* Stars */}
          <circle cx="120" cy="180" r="2.5" fill="#D2A75D" />
          <circle cx="280" cy="120" r="3" fill="#F4EFE4" />
          <circle cx="420" cy="240" r="2" fill="#BD634A" />
          <circle cx="560" cy="150" r="3.5" fill="#D2A75D" />
          <circle cx="780" cy="320" r="2" fill="#F4EFE4" />
          <circle cx="940" cy="210" r="3" fill="#D2A75D" />
          <circle cx="1080" cy="280" r="2" fill="#BD634A" />

          {/* Faint ambient stars */}
          <circle cx="200" cy="400" r="1.5" fill="#F4EFE4" opacity="0.6" />
          <circle cx="650" cy="80" r="1.5" fill="#D2A75D" opacity="0.7" />
          <circle cx="850" cy="480" r="1.5" fill="#F4EFE4" opacity="0.5" />
          <circle cx="1000" cy="100" r="1.5" fill="#D2A75D" opacity="0.6" />
        </svg>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 relative z-10 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#B68A53]/20 border border-[#B68A53]/40">
            <span className="font-public-condensed text-xs uppercase tracking-[0.25em] font-semibold text-[#D2A75D]">
              03 / Reflection
            </span>
          </div>

          <h2 className="font-public-serif text-3xl sm:text-5xl lg:text-6xl text-[#F4EFE4] leading-tight tracking-tight">
            Give one thing your full attention.
          </h2>

          <p className="font-public-hand text-2xl sm:text-3xl text-[#D2A75D]">
            the rest can wait a little.
          </p>

          <p className="font-public-sans text-sm sm:text-base text-[#F4EFE4]/75 max-w-lg mx-auto leading-relaxed pt-2">
            Until then, take your time. When your session concludes, your notebook will be waiting to record what was learned.
          </p>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="press-btn inline-flex items-center gap-2 px-6 py-3 bg-[#BD634A] text-[#F4EFE4] font-public-condensed text-xs uppercase tracking-[0.18em] font-bold rounded shadow hover:bg-[#BD634A]/90"
            >
              <span>Return to journal</span>
              <span aria-hidden="true">↗</span>
            </Link>
            <Link
              href="/"
              className="press-btn inline-flex items-center gap-2 px-6 py-3 bg-transparent border border-[#F4EFE4]/30 text-[#F4EFE4] font-public-condensed text-xs uppercase tracking-[0.16em] font-semibold rounded hover:border-[#F4EFE4]"
            >
              <span>Home (Atlas)</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
