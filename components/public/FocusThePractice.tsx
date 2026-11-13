export function FocusThePractice() {
  return (
    <section id="practice" className="py-16 md:py-24 border-b border-[#F4EFE4]/15 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="mb-12 space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-public-condensed text-xs uppercase tracking-[0.25em] font-semibold text-[#B68A53]">
              01 / The Practice ———— A Place to Begin
            </span>
            <span className="h-px w-8 bg-[#B68A53]/40" />
          </div>
          <h2 className="font-public-serif text-3xl sm:text-4xl lg:text-5xl text-[#F4EFE4] tracking-tight">
            Settle into focus.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Visual Timer Dial Card */}
          <div className="lg:col-span-6 bg-[#172536] border border-[#F4EFE4]/20 rounded-xl p-5 sm:p-8 lg:p-10 shadow-xl relative overflow-hidden lift-card">
            {/* Top row: Pace Tabs + Coming Soon Tag */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-[#F4EFE4]/15">
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded bg-[#F4EFE4]/10 border border-[#F4EFE4]/15 text-xs font-public-condensed uppercase tracking-wider">
                <button
                  type="button"
                  className="px-2.5 sm:px-3 py-1 rounded bg-[#B68A53] text-[#172536] font-semibold shadow-xs"
                >
                  Focus 25 min
                </button>
                <button
                  type="button"
                  className="px-2.5 sm:px-3 py-1 rounded text-[#F4EFE4]/80 hover:text-[#F4EFE4]"
                >
                  Short break 5 min
                </button>
                <button
                  type="button"
                  className="px-2.5 sm:px-3 py-1 rounded text-[#F4EFE4]/80 hover:text-[#F4EFE4]"
                >
                  Long break 15 min
                </button>
              </div>

              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#D2A75D]/20 border border-[#D2A75D]/40 text-[10px] font-public-condensed uppercase tracking-[0.18em] font-bold text-[#D2A75D]">
                <span>Coming soon</span>
              </div>
            </div>

            {/* Visual Timer Dial */}
            <div className="py-8 sm:py-10 flex flex-col items-center justify-center relative">
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
                {/* Dial SVG */}
                <svg
                  viewBox="0 0 240 240"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full text-[#B68A53]"
                  aria-label="Timer dial indicator showing 25:00"
                  role="img"
                >
                  {/* Outer subtle track */}
                  <circle cx="120" cy="120" r="105" stroke="#F4EFE4" strokeOpacity="0.1" strokeWidth="6" />

                  {/* Active arc: 25 minutes out of 60 or full block */}
                  <circle
                    cx="120"
                    cy="120"
                    r="105"
                    stroke="#D2A75D"
                    strokeWidth="6"
                    strokeDasharray="660"
                    strokeDashoffset="165"
                    strokeLinecap="round"
                    transform="rotate(-90 120 120)"
                  />

                  {/* Indicator bead */}
                  <circle cx="120" cy="15" r="5" fill="#BD634A" />

                  {/* Tick marks */}
                  <line x1="120" y1="28" x2="120" y2="34" stroke="#F4EFE4" strokeOpacity="0.4" strokeWidth="2" />
                  <line x1="212" y1="120" x2="206" y2="120" stroke="#F4EFE4" strokeOpacity="0.4" strokeWidth="2" />
                  <line x1="120" y1="212" x2="120" y2="206" stroke="#F4EFE4" strokeOpacity="0.4" strokeWidth="2" />
                  <line x1="28" y1="120" x2="34" y2="120" stroke="#F4EFE4" strokeOpacity="0.4" strokeWidth="2" />
                </svg>

                {/* Center Time & Status */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-public-condensed text-4xl sm:text-6xl font-bold tracking-tight text-[#F4EFE4]">
                    25:00
                  </span>
                  <span className="font-public-script text-xs sm:text-sm text-[#D2A75D] mt-1">
                    one intention
                  </span>
                </div>
              </div>

              {/* Action Buttons (Start / Pause / Reset) */}
              <div className="flex items-center gap-3 mt-6 sm:mt-8">
                <button
                  type="button"
                  className="press-btn px-5 sm:px-6 py-2.5 bg-[#B68A53] text-[#172536] font-public-condensed text-xs uppercase tracking-[0.18em] font-bold rounded shadow hover:bg-[#D2A75D]"
                >
                  Start
                </button>
                <button
                  type="button"
                  className="press-btn px-4 sm:px-5 py-2.5 bg-transparent border border-[#F4EFE4]/30 text-[#F4EFE4] font-public-condensed text-xs uppercase tracking-[0.18em] font-semibold rounded hover:border-[#F4EFE4]"
                >
                  Pause
                </button>
                <button
                  type="button"
                  className="press-btn px-3 sm:px-4 py-2.5 bg-transparent text-[#F4EFE4]/60 hover:text-[#F4EFE4] font-public-condensed text-xs uppercase tracking-[0.18em]"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-[#F4EFE4]/15 flex items-center justify-between text-xs font-public-sans text-[#F4EFE4]/60">
              <span>Interval protocol</span>
              <span className="font-public-condensed uppercase tracking-wider text-[#B68A53]">
                Visual only · 25 min block
              </span>
            </div>
          </div>

          {/* Right Column: Checklist, Habit Radar & Breathing Guide */}
          <div className="lg:col-span-6 space-y-6">
            {/* 1. Before You Begin Checklist */}
            <div className="bg-[#172536] border border-[#F4EFE4]/20 rounded-xl p-5 sm:p-7 shadow-lg lift-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-public-serif text-lg text-[#F4EFE4]">
                  Before you begin
                </h3>
                <span className="font-public-condensed text-[10px] uppercase tracking-[0.2em] text-[#B68A53]">
                  Ritual
                </span>
              </div>

              <div className="space-y-3 font-public-sans text-xs text-[#F4EFE4]/85">
                <div className="flex items-center gap-3 p-2 rounded bg-white/5 border border-white/5">
                  <span className="w-4 h-4 rounded border border-[#B68A53] flex items-center justify-center text-[#D2A75D] font-bold text-xs bg-[#B68A53]/20 shrink-0">
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M2.5 6.5L4.8 9L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span>Clear physical and digital desktop</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded bg-white/5 border border-white/5">
                  <span className="w-4 h-4 rounded border border-[#B68A53] flex items-center justify-center text-[#D2A75D] font-bold text-xs bg-[#B68A53]/20 shrink-0">
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M2.5 6.5L4.8 9L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span>Fill a glass of water or brew fresh tea</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded bg-white/5 border border-white/5">
                  <span className="w-4 h-4 rounded border border-[#F4EFE4]/30 shrink-0" />
                  <span>Silence notifications and phone</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded bg-white/5 border border-white/5">
                  <span className="w-4 h-4 rounded border border-[#F4EFE4]/30 shrink-0" />
                  <span>Write your single intention for this block</span>
                </div>
              </div>
            </div>

            {/* 2. Habit Radar Chart & 3. Breathing Guide */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Habit Radar Chart */}
              <div className="bg-[#172536] border border-[#F4EFE4]/20 rounded-xl p-5 sm:p-6 shadow-lg flex flex-col justify-between lift-card">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-public-serif text-base text-[#F4EFE4]">
                      Balance Radar
                    </h4>
                    <span className="font-public-condensed text-[10px] uppercase tracking-[0.2em] text-[#899783]">
                      5 Axes
                    </span>
                  </div>
                  <p className="font-public-sans text-[11px] text-[#F4EFE4]/70 mb-4">
                    Daily equilibrium score
                  </p>
                </div>

                {/* Radar Chart SVG */}
                <div className="flex justify-center items-center py-2">
                  <svg
                    viewBox="0 0 160 160"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-32 h-32 sm:w-36 sm:h-36 text-[#899783]"
                    aria-label="Habit radar chart with 5 axes"
                    role="img"
                  >
                    {/* Concentric pentagons */}
                    <polygon points="80,20 137,61 115,129 45,129 23,61" stroke="#F4EFE4" strokeOpacity="0.15" strokeWidth="1" />
                    <polygon points="80,44 114,69 101,110 59,110 46,69" stroke="#F4EFE4" strokeOpacity="0.25" strokeWidth="1" />

                    {/* Axis spokes */}
                    <line x1="80" y1="80" x2="80" y2="20" stroke="#F4EFE4" strokeOpacity="0.2" />
                    <line x1="80" y1="80" x2="137" y2="61" stroke="#F4EFE4" strokeOpacity="0.2" />
                    <line x1="80" y1="80" x2="115" y2="129" stroke="#F4EFE4" strokeOpacity="0.2" />
                    <line x1="80" y1="80" x2="45" y2="129" stroke="#F4EFE4" strokeOpacity="0.2" />
                    <line x1="80" y1="80" x2="23" y2="61" stroke="#F4EFE4" strokeOpacity="0.2" />

                    {/* Data Shape */}
                    <polygon
                      points="80,30 128,64 104,116 52,118 36,66"
                      fill="#899783"
                      fillOpacity="0.35"
                      stroke="#899783"
                      strokeWidth="1.8"
                    />

                    {/* Labels */}
                    <text x="80" y="14" textAnchor="middle" fill="#D2A75D" fontSize="8" fontFamily="var(--font-barlow-condensed)">FOCUS</text>
                    <text x="142" y="62" textAnchor="start" fill="#D2A75D" fontSize="8" fontFamily="var(--font-barlow-condensed)">CALM</text>
                    <text x="120" y="142" textAnchor="middle" fill="#D2A75D" fontSize="8" fontFamily="var(--font-barlow-condensed)">ENERGY</text>
                    <text x="40" y="142" textAnchor="middle" fill="#D2A75D" fontSize="8" fontFamily="var(--font-barlow-condensed)">FLOW</text>
                    <text x="18" y="62" textAnchor="end" fill="#D2A75D" fontSize="8" fontFamily="var(--font-barlow-condensed)">CLARITY</text>
                  </svg>
                </div>

                <div className="pt-2 text-center font-public-script text-xs text-[#D2A75D]">
                  steady balance
                </div>
              </div>

              {/* 4-Stage Breathing Guide (NO animation pulse per instruction 1!) */}
              <div className="bg-[#172536] border border-[#F4EFE4]/20 rounded-xl p-5 sm:p-6 shadow-lg flex flex-col justify-between lift-card">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-public-serif text-base text-[#F4EFE4]">
                      Box Breathing
                    </h4>
                    <span className="font-public-condensed text-[10px] uppercase tracking-[0.2em] text-[#BD634A]">
                      4 Stages
                    </span>
                  </div>
                  <p className="font-public-sans text-[11px] text-[#F4EFE4]/70 mb-4">
                    4-4-4-4 grounding cycle
                  </p>
                </div>

                {/* Static 4-Stage Breathing Layout (NO ring pulse) */}
                <div className="grid grid-cols-2 gap-2 py-2">
                  <div className="p-2 sm:p-2.5 rounded bg-white/5 border border-white/10 text-center">
                    <span className="block font-public-condensed text-[10px] uppercase tracking-wider text-[#D2A75D]">
                      Inhale
                    </span>
                    <span className="font-public-sans text-xs font-semibold text-[#F4EFE4]">
                      4 sec
                    </span>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded bg-white/5 border border-white/10 text-center">
                    <span className="block font-public-condensed text-[10px] uppercase tracking-wider text-[#8799A7]">
                      Hold
                    </span>
                    <span className="font-public-sans text-xs font-semibold text-[#F4EFE4]">
                      4 sec
                    </span>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded bg-white/5 border border-white/10 text-center">
                    <span className="block font-public-condensed text-[10px] uppercase tracking-wider text-[#BD634A]">
                      Exhale
                    </span>
                    <span className="font-public-sans text-xs font-semibold text-[#F4EFE4]">
                      4 sec
                    </span>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded bg-white/5 border border-white/10 text-center">
                    <span className="block font-public-condensed text-[10px] uppercase tracking-wider text-[#899783]">
                      Rest
                    </span>
                    <span className="font-public-sans text-xs font-semibold text-[#F4EFE4]">
                      4 sec
                    </span>
                  </div>
                </div>

                <div className="pt-2 text-center font-public-script text-xs text-[#899783]">
                  steady breath, steady mind
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
