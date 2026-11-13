export function SectionToolsForNoticing() {
  return (
    <section id="journal" className="py-16 md:py-24 border-b border-[#172536]/10">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="mb-12 space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-public-condensed text-xs uppercase tracking-[0.25em] font-semibold text-[#B68A53]">
              02 / Tools for Noticing
            </span>
            <span className="h-px w-8 bg-[#B68A53]/40" />
          </div>
          <h2 className="font-public-serif text-3xl sm:text-4xl lg:text-5xl text-[#172536] tracking-tight">
            Four ways to find your way.
          </h2>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Track */}
          <div className="lift-card bg-[#F4EFE4] rounded-lg p-6 border border-[#172536]/15 flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-public-condensed text-xs uppercase tracking-[0.2em] font-bold text-[#BD634A]">
                  Track
                </span>
                <span className="font-public-sans text-xs text-[#172536]/50">01</span>
              </div>
              <h3 className="font-public-serif text-xl text-[#172536]">
                Daily Log & Habits
              </h3>
              <p className="font-public-sans text-xs text-[#172536]/70 italic">
                start with what happened
              </p>

              {/* Row list visual */}
              <div className="pt-2 space-y-2 border-t border-[#172536]/10 font-public-sans text-xs">
                <div className="flex items-center justify-between p-1.5 rounded bg-white/50 border border-[#172536]/5">
                  <span className="text-[#172536]">Morning daylight</span>
                  <span className="font-public-hand text-sm text-[#30483D] font-bold">✓ 20m</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-white/50 border border-[#172536]/5">
                  <span className="text-[#172536]">Unbroken reading</span>
                  <span className="font-public-hand text-sm text-[#30483D] font-bold">✓ 35m</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-white/50 border border-[#172536]/5">
                  <span className="text-[#172536]">Evening notebook</span>
                  <span className="font-public-hand text-sm text-[#BD634A] font-bold">✓ 15m</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#172536]/10 flex items-center justify-between text-[11px] font-public-condensed uppercase tracking-wider text-[#B68A53]">
              <span>Checkboxes & Tallies</span>
              <span aria-hidden="true">↗</span>
            </div>
          </div>

          {/* Card 2: Charts */}
          <div className="lift-card bg-[#F4EFE4] rounded-lg p-6 border border-[#172536]/15 flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-public-condensed text-xs uppercase tracking-[0.2em] font-bold text-[#BD634A]">
                  Charts
                </span>
                <span className="font-public-sans text-xs text-[#172536]/50">02</span>
              </div>
              <h3 className="font-public-serif text-xl text-[#172536]">
                Hand-drawn Trends
              </h3>
              <p className="font-public-sans text-xs text-[#172536]/70 italic">
                notice the patterns as they form
              </p>

              {/* Trendline SVG visual */}
              <div className="pt-2 border-t border-[#172536]/10">
                <div className="h-28 w-full flex items-center justify-center p-2 bg-white/40 rounded border border-[#172536]/5">
                  <svg
                    viewBox="0 0 180 80"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full text-[#172536]"
                    aria-label="Hand-drawn trendline chart"
                    role="img"
                  >
                    {/* Grid lines */}
                    <line x1="10" y1="20" x2="170" y2="20" stroke="#172536" strokeOpacity="0.1" strokeDasharray="2 3" />
                    <line x1="10" y1="45" x2="170" y2="45" stroke="#172536" strokeOpacity="0.1" strokeDasharray="2 3" />
                    <line x1="10" y1="70" x2="170" y2="70" stroke="#172536" strokeOpacity="0.2" />

                    {/* Hand-drawn dashed trendline */}
                    <path
                      d="M15 62C30 58 45 42 60 48C75 54 90 30 105 34C120 38 135 18 150 24C158 27 165 22 170 20"
                      stroke="#BD634A"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeDasharray="4 3"
                    />

                    {/* Nodes */}
                    <circle cx="15" cy="62" r="3" fill="#BD634A" />
                    <circle cx="60" cy="48" r="3" fill="#BD634A" />
                    <circle cx="105" cy="34" r="3" fill="#BD634A" />
                    <circle cx="150" cy="24" r="3.5" fill="#D2A75D" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#172536]/10 flex items-center justify-between text-[11px] font-public-condensed uppercase tracking-wider text-[#B68A53]">
              <span>Inked Curves</span>
              <span aria-hidden="true">↗</span>
            </div>
          </div>

          {/* Card 3: Ask */}
          <div className="lift-card bg-[#F4EFE4] rounded-lg p-6 border border-[#172536]/15 flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-public-condensed text-xs uppercase tracking-[0.2em] font-bold text-[#BD634A]">
                  Ask
                </span>
                <span className="font-public-sans text-xs text-[#172536]/50">03</span>
              </div>
              <h3 className="font-public-serif text-xl text-[#172536]">
                Inquiry & Clarity
              </h3>
              <p className="font-public-sans text-xs text-[#172536]/70 italic">
                curiosity over judgment
              </p>

              {/* Question prompt card visual */}
              <div className="pt-2 border-t border-[#172536]/10">
                <div className="p-3 bg-[#172536] text-[#F4EFE4] rounded shadow-inner space-y-2">
                  <span className="font-public-condensed text-[10px] uppercase tracking-[0.2em] text-[#D2A75D]">
                    Today's prompt
                  </span>
                  <p className="font-public-hand text-sm text-[#F4EFE4] leading-snug">
                    "What brought you energy today?"
                  </p>
                  <div className="text-[10px] font-public-sans text-[#8799A7] flex items-center gap-1">
                    <span>look a little closer</span>
                    <span aria-hidden="true">↗</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#172536]/10 flex items-center justify-between text-[11px] font-public-condensed uppercase tracking-wider text-[#B68A53]">
              <span>Reflective Questions</span>
              <span aria-hidden="true">↗</span>
            </div>
          </div>

          {/* Card 4: Write */}
          <div className="lift-card bg-[#F4EFE4] rounded-lg p-6 border border-[#172536]/15 flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-public-condensed text-xs uppercase tracking-[0.2em] font-bold text-[#BD634A]">
                  Write
                </span>
                <span className="font-public-sans text-xs text-[#172536]/50">04</span>
              </div>
              <h3 className="font-public-serif text-xl text-[#172536]">
                Memorable Moments
              </h3>
              <p className="font-public-sans text-xs text-[#172536]/70 italic">
                preserve what would otherwise fade
              </p>

              {/* Lined stationery card visual */}
              <div className="pt-2 border-t border-[#172536]/10">
                <div
                  className="p-3 bg-white/60 rounded border border-[#172536]/10 space-y-2"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(transparent, transparent 19px, rgba(23,37,54,0.08) 20px)',
                  }}
                >
                  <p className="font-public-hand text-sm text-[#172536] leading-[20px]">
                    Today, I want to remember the late sun cutting through the pine trees...
                  </p>
                  <div className="font-public-script text-xs text-[#BD634A]">
                    ~ 5:45 PM
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#172536]/10 flex items-center justify-between text-[11px] font-public-condensed uppercase tracking-wider text-[#B68A53]">
              <span>Handwritten Notes</span>
              <span aria-hidden="true">↗</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
