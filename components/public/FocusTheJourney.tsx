export function FocusTheJourney() {
  // 31 heights for the waveform bars
  const waveformHeights = [
    14, 22, 35, 18, 42, 60, 48, 72, 85, 64, 45, 58, 80, 95, 78, 62, 50, 70, 88, 65, 48, 55, 40, 62, 75, 52, 38, 44, 30, 20, 12,
  ]

  return (
    <section className="py-16 md:py-24 border-b border-[#F4EFE4]/15 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="mb-12 space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-public-condensed text-xs uppercase tracking-[0.25em] font-semibold text-[#B68A53]">
              02 / The Journey
            </span>
            <span className="h-px w-8 bg-[#B68A53]/40" />
          </div>
          <h2 className="font-public-serif text-3xl sm:text-4xl lg:text-5xl text-[#F4EFE4] tracking-tight">
            Structure your hours.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Card: Session Sequence */}
          <div className="lg:col-span-5 bg-[#172536] border border-[#F4EFE4]/20 rounded-xl p-5 sm:p-8 lg:p-10 shadow-lg flex flex-col justify-between lift-card">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="font-public-condensed text-xs uppercase tracking-[0.2em] font-bold text-[#D2A75D]">
                  Interval Wave
                </span>
                <span className="font-public-sans text-xs text-[#F4EFE4]/60">
                  Target: 100 min
                </span>
              </div>

              <div>
                <h3 className="font-public-serif text-2xl sm:text-3xl text-[#F4EFE4]">
                  Session 1 of 4
                </h3>
                <p className="font-public-sans text-xs sm:text-sm text-[#F4EFE4]/70 mt-1">
                  First interval: establish steady concentration.
                </p>
              </div>

              {/* 4-Node Wave Path SVG */}
              <div className="py-4 sm:py-6">
                <svg
                  viewBox="0 0 320 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-auto text-[#B68A53]"
                  aria-label="4-node session progression wave"
                  role="img"
                >
                  {/* Wave curve */}
                  <path
                    d="M20 50 C 60 20, 100 80, 140 50 C 180 20, 220 80, 260 50 C 280 35, 295 45, 305 50"
                    stroke="#F4EFE4"
                    strokeOpacity="0.3"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />

                  {/* Active segment */}
                  <path
                    d="M20 50 C 40 35, 55 25, 70 30"
                    stroke="#D2A75D"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Node 1 (Active) */}
                  <circle cx="20" cy="50" r="9" fill="#172536" stroke="#D2A75D" strokeWidth="2.5" />
                  <circle cx="20" cy="50" r="3.5" fill="#BD634A" />
                  <text x="20" y="78" textAnchor="middle" fill="#D2A75D" fontSize="10" fontWeight="600" fontFamily="var(--font-barlow-condensed)">
                    01
                  </text>

                  {/* Node 2 */}
                  <circle cx="110" cy="62" r="7" fill="#172536" stroke="#F4EFE4" strokeOpacity="0.5" strokeWidth="1.8" />
                  <text x="110" y="88" textAnchor="middle" fill="#F4EFE4" fillOpacity="0.6" fontSize="10" fontFamily="var(--font-barlow-condensed)">
                    02
                  </text>

                  {/* Node 3 */}
                  <circle cx="200" cy="38" r="7" fill="#172536" stroke="#F4EFE4" strokeOpacity="0.5" strokeWidth="1.8" />
                  <text x="200" y="65" textAnchor="middle" fill="#F4EFE4" fillOpacity="0.6" fontSize="10" fontFamily="var(--font-barlow-condensed)">
                    03
                  </text>

                  {/* Node 4 */}
                  <circle cx="290" cy="50" r="7" fill="#172536" stroke="#F4EFE4" strokeOpacity="0.5" strokeWidth="1.8" />
                  <text x="290" y="78" textAnchor="middle" fill="#F4EFE4" fillOpacity="0.6" fontSize="10" fontFamily="var(--font-barlow-condensed)">
                    04
                  </text>
                </svg>
              </div>
            </div>

            <div className="pt-4 border-t border-[#F4EFE4]/15 flex items-center justify-between">
              <span className="font-public-hand text-base text-[#D2A75D]">
                the quiet hours belong to you.
              </span>
              <span className="font-public-condensed text-[11px] uppercase tracking-wider text-[#B68A53]">
                Paced
              </span>
            </div>
          </div>

          {/* Right Card: Ambient Sound Player */}
          <div className="lg:col-span-7 bg-[#172536] border border-[#F4EFE4]/20 rounded-xl p-5 sm:p-8 lg:p-10 shadow-lg flex flex-col justify-between lift-card">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-public-serif text-xl sm:text-2xl text-[#F4EFE4]">
                    Ambient focus
                  </h3>
                  <p className="font-public-sans text-xs text-[#F4EFE4]/70 mt-0.5">
                    Gentle acoustics for deep concentration
                  </p>
                </div>

                <span className="px-2.5 py-1 rounded bg-[#D2A75D]/20 border border-[#D2A75D]/40 text-[10px] font-public-condensed uppercase tracking-[0.18em] font-semibold text-[#D2A75D]">
                  Music player coming soon
                </span>
              </div>

              {/* Player Waveform Display & Play Button */}
              <div className="p-3 sm:p-6 rounded-lg bg-white/5 border border-white/5 space-y-4 overflow-hidden">
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Play Button Icon */}
                  <button
                    type="button"
                    aria-label="Play ambient sound (visual preview)"
                    className="press-btn w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#B68A53] text-[#172536] flex items-center justify-center shrink-0 shadow hover:bg-[#D2A75D]"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path d="M5 3.5L14 9L5 14.5V3.5Z" fill="currentColor" />
                    </svg>
                  </button>

                  {/* 31 Waveform Bars SVG (Static visual per instruction) */}
                  <svg
                    viewBox="0 0 310 56"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="flex-1 h-12 sm:h-14 w-full"
                    aria-label="31 vertical waveform bars"
                    role="img"
                  >
                    {waveformHeights.map((h, i) => {
                      const x = i * 10 + 5
                      const barH = (h / 100) * 48
                      const y1 = 52 - barH
                      const y2 = 52
                      return (
                        <line
                          key={i}
                          x1={x}
                          y1={y1}
                          x2={x}
                          y2={y2}
                          stroke={i < 14 ? '#D2A75D' : '#F4EFE4'}
                          strokeOpacity={i < 14 ? 1 : 0.35}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />
                      )
                    })}
                  </svg>
                </div>

                {/* Volume Slider Mockup */}
                <div className="pt-2 flex items-center gap-3">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-[#F4EFE4]/60 shrink-0"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 6H5L9 2V14L5 10H2V6Z"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 5C13 6 13.5 7 13.5 8C13.5 9 13 10 12 11"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="flex-1 h-1.5 bg-[#F4EFE4]/15 rounded-full relative">
                    <div className="h-full bg-[#B68A53] rounded-full w-2/3" />
                    <div className="absolute top-1/2 left-2/3 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-[#F4EFE4] rounded-full shadow" />
                  </div>
                  <span className="font-public-condensed text-[10px] text-[#F4EFE4]/60 uppercase tracking-wider shrink-0">
                    65%
                  </span>
                </div>
              </div>

              {/* 3 Sound Chips */}
              <div className="space-y-2">
                <span className="font-public-condensed text-[10px] uppercase tracking-[0.2em] text-[#B68A53]">
                  Soundscapes
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="press-btn px-3 py-1.5 rounded-full bg-[#B68A53]/25 border border-[#B68A53] text-[#D2A75D] font-public-sans text-xs flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D2A75D]" />
                    <span>Rain & Nature</span>
                  </button>
                  <button
                    type="button"
                    className="press-btn px-3 py-1.5 rounded-full bg-white/5 border border-[#F4EFE4]/20 text-[#F4EFE4]/80 hover:text-[#F4EFE4] font-public-sans text-xs flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F4EFE4]/40" />
                    <span>Soft Piano</span>
                  </button>
                  <button
                    type="button"
                    className="press-btn px-3 py-1.5 rounded-full bg-white/5 border border-[#F4EFE4]/20 text-[#F4EFE4]/80 hover:text-[#F4EFE4] font-public-sans text-xs flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F4EFE4]/40" />
                    <span>Deep Focus</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#F4EFE4]/15 mt-6 flex items-center justify-between text-xs font-public-sans text-[#F4EFE4]/60">
              <span>Non-distracting loop</span>
              <span className="font-public-condensed uppercase tracking-wider text-[#B68A53]">
                Analogue warmth
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
