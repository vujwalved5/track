export function SectionTheIdea() {
  return (
    <section id="about" className="py-16 md:py-24 border-b border-[#172536]/10">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Navy / Ink Card */}
          <div className="lg:col-span-5 bg-[#172536] text-[#F4EFE4] rounded-lg p-8 sm:p-12 flex flex-col justify-between shadow-lg relative overflow-hidden lift-card">
            {/* Subtle stationery corner watermark */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-radial from-[#F4EFE4]/10 to-transparent pointer-events-none" />

            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="font-public-condensed text-xs uppercase tracking-[0.25em] font-semibold text-[#B68A53]">
                  01 / The Idea
                </span>
                <span className="h-px w-8 bg-[#B68A53]/40" />
              </div>

              <h2 className="font-public-serif text-3xl sm:text-4xl text-[#F4EFE4] tracking-tight">
                What is Track?
              </h2>

              <p className="font-public-sans text-base sm:text-lg text-[#F4EFE4]/85 leading-relaxed">
                A quieter space to track your days, notice your progress, and build habits that last.
              </p>
            </div>

            <div className="pt-8 border-t border-[#F4EFE4]/15 mt-8 flex items-center justify-between">
              <span className="font-public-condensed text-xs uppercase tracking-[0.2em] text-[#BD634A]">
                Daily Reflection & Focus
              </span>
              <svg
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#B68A53]"
                aria-hidden="true"
              >
                <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 3" />
                <path d="M14 6V22M6 14H22" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="14" cy="14" r="2" fill="currentColor" />
              </svg>
            </div>
          </div>

          {/* Right Paper Grid */}
          <div className="lg:col-span-7 bg-[#F4EFE4] rounded-lg p-8 sm:p-12 border border-[#172536]/15 flex flex-col justify-between relative shadow-sm lift-card">
            {/* Dot grid subtle background */}
            <div
              className="absolute inset-0 opacity-25 rounded-lg pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#172536 1.2px, transparent 1.2px)',
                backgroundSize: '22px 22px',
              }}
            />

            <div className="relative z-10 space-y-6 max-w-2xl">
              <p className="font-public-serif text-2xl sm:text-3xl text-[#172536] leading-snug">
                <strong className="font-semibold text-[#172536]">Not a race to do more.</strong>{' '}
                Track is a personal space to record daily activities, capture memorable moments, reflect on what matters, and see your progress over time.
              </p>

              <p className="font-public-sans text-base sm:text-lg text-[#172536]/80 leading-relaxed">
                A place to return to yourself, one day at a time. It behaves like real paper in your hands: two pages side by side on desktop, one page on mobile, with hand-drawn charts and no algorithmic feeds.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <span className="font-public-hand text-xl text-[#BD634A]">
                  one day at a time...
                </span>
                <span className="font-public-script text-sm text-[#B68A53]">
                  ~ recorded in ink
                </span>
              </div>
            </div>

            {/* Botanical Branch SVG illustration */}
            <div className="relative z-10 pt-6 mt-6 border-t border-[#172536]/10 flex justify-end">
              <svg
                width="160"
                height="48"
                viewBox="0 0 160 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#30483D]"
                aria-label="Hand-drawn botanical branch illustration"
                role="img"
              >
                {/* Hand-drawn stem */}
                <path
                  d="M10 24C40 22 80 25 150 20"
                  stroke="#30483D"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                {/* Leaves */}
                <path
                  d="M35 23C32 15 42 10 48 18C44 23 38 24 35 23Z"
                  fill="#899783"
                  stroke="#30483D"
                  strokeWidth="1.2"
                />
                <path
                  d="M60 24C62 32 72 36 76 28C71 24 64 23 60 24Z"
                  fill="#899783"
                  stroke="#30483D"
                  strokeWidth="1.2"
                />
                <path
                  d="M85 24C83 14 95 11 100 20C95 24 88 25 85 24Z"
                  fill="#899783"
                  stroke="#30483D"
                  strokeWidth="1.2"
                />
                <path
                  d="M115 23C118 31 129 33 132 26C127 22 120 22 115 23Z"
                  fill="#899783"
                  stroke="#30483D"
                  strokeWidth="1.2"
                />
                <path
                  d="M140 21C142 15 152 14 155 19C150 22 144 22 140 21Z"
                  fill="#899783"
                  stroke="#30483D"
                  strokeWidth="1.2"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
