export function FocusTheJourney() {
  // Waveform bar heights (symmetrical around midline)
  const barHeights = [
    12, 28, 22, 34, 30, 26, 20, 32, 24, 14, 18, 30, 12, 34, 18, 14, 10, 32, 12, 8, 24, 28, 12, 16, 12, 26, 16,
  ]

  return (
    <section className="pt-[103px] pb-[104px] bg-[#172536] text-[#F4EFE4] overflow-hidden">
      <div className="max-w-[1202px] mx-auto px-4 sm:px-6 lg:px-0">
        {/* Top Header Row */}
        <div className="flex items-center justify-between">
          <span className="font-public-condensed text-xs uppercase tracking-[0.25em] font-semibold text-[#B68A53]">
            02 / THE JOURNEY
          </span>
          <span className="font-public-condensed text-xs uppercase tracking-[0.25em] font-medium text-[#90A0B3]">
            ONE MOMENT AT A TIME
          </span>
        </div>

        {/* Section Divider Line (y = 2293) */}
        <div className="mt-7 mb-7 border-t border-[#F4EFE4]/15 w-full" />

        {/* Two Cards Row (top y = 2325, bottom y = 2684, height = 359px) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Card: The Path Ahead / Concept (w = 526px, h = 359px) */}
          <div className="lg:col-span-5 bg-[#1a2b3d] border border-[#F4EFE4]/15 rounded-[2px] p-7 sm:p-8 relative overflow-hidden flex flex-col justify-between h-[359px]">
            {/* Faint background celestial arc */}
            <svg
              className="absolute -top-12 -right-12 w-64 h-64 pointer-events-none"
              viewBox="0 0 240 240"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="190"
                cy="50"
                r="135"
                stroke="#F4EFE4"
                strokeOpacity="0.09"
                strokeWidth="1"
              />
            </svg>

            {/* Top Text */}
            <div className="relative z-10">
              <span className="font-public-condensed text-xs uppercase tracking-[0.22em] font-semibold text-[#B68A53] block">
                THE PATH AHEAD / CONCEPT
              </span>
              <h3 className="font-public-display text-4xl sm:text-[46px] text-[#F4EFE4] font-normal leading-tight mt-3">
                Session 1 of 4
              </h3>
            </div>

            {/* 4-Node Progression Wave */}
            <div className="py-2 relative z-10">
              <svg
                viewBox="0 0 420 95"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-auto text-[#B68A53]"
                aria-label="4-node session progression wave"
                role="img"
              >
                {/* Curved dashed wave path */}
                <path
                  d="M 28 50 C 80 18, 120 52, 155 24 C 195 0, 235 48, 275 42 C 315 36, 360 22, 395 28"
                  stroke="#8799A7"
                  strokeOpacity="0.45"
                  strokeWidth="1.5"
                  strokeDasharray="3 4"
                />

                {/* Node 1: Active glowing amber bead */}
                <circle cx="28" cy="50" r="14" fill="#D2A75D" fillOpacity="0.22" />
                <circle cx="28" cy="50" r="7.5" fill="#D2A75D" />
                <text
                  x="28"
                  y="77"
                  textAnchor="middle"
                  fill="#B68A53"
                  fontSize="11"
                  fontFamily="var(--font-barlow-condensed)"
                  letterSpacing="0.05em"
                >
                  01
                </text>

                {/* Node 2 */}
                <circle
                  cx="155"
                  cy="24"
                  r="7.5"
                  fill="#1a2b3d"
                  stroke="#8799A7"
                  strokeOpacity="0.65"
                  strokeWidth="1.5"
                />
                <text
                  x="155"
                  y="51"
                  textAnchor="middle"
                  fill="#8799A7"
                  fillOpacity="0.85"
                  fontSize="11"
                  fontFamily="var(--font-barlow-condensed)"
                  letterSpacing="0.05em"
                >
                  02
                </text>

                {/* Node 3 */}
                <circle
                  cx="275"
                  cy="42"
                  r="7.5"
                  fill="#1a2b3d"
                  stroke="#8799A7"
                  strokeOpacity="0.65"
                  strokeWidth="1.5"
                />
                <text
                  x="275"
                  y="69"
                  textAnchor="middle"
                  fill="#8799A7"
                  fillOpacity="0.85"
                  fontSize="11"
                  fontFamily="var(--font-barlow-condensed)"
                  letterSpacing="0.05em"
                >
                  03
                </text>

                {/* Node 4 */}
                <circle
                  cx="395"
                  cy="28"
                  r="7.5"
                  fill="#1a2b3d"
                  stroke="#8799A7"
                  strokeOpacity="0.65"
                  strokeWidth="1.5"
                />
                <text
                  x="395"
                  y="55"
                  textAnchor="middle"
                  fill="#8799A7"
                  fillOpacity="0.85"
                  fontSize="11"
                  fontFamily="var(--font-barlow-condensed)"
                  letterSpacing="0.05em"
                >
                  04
                </text>
              </svg>
            </div>

            {/* Bottom Handwritten Script */}
            <div className="relative z-10 pt-1">
              <span className="font-public-hand text-[24px] text-[#D2A75D] font-normal tracking-wide block">
                Stay with the next small thing.
              </span>
            </div>
          </div>

          {/* Right Card: Sound Study / Preview (w = 644px, h = 359px) */}
          <div className="lg:col-span-7 bg-gradient-to-r from-[#1c3230] via-[#1a2c32] to-[#172536] border border-[#F4EFE4]/15 rounded-[2px] p-3 sm:p-4 relative overflow-hidden flex flex-col justify-between h-[359px]">
            {/* Inner Framing Border */}
            <div className="border border-[#F4EFE4]/12 rounded-[1px] p-6 sm:p-7 h-full flex flex-col justify-between">
              {/* Top Row: Label and Play Button */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-public-condensed text-xs uppercase tracking-[0.22em] font-semibold text-[#B68A53] block">
                    SOUND STUDY / PREVIEW
                  </span>
                  <h3 className="font-public-display text-4xl sm:text-[46px] text-[#F4EFE4] font-normal leading-tight mt-3">
                    Ambient focus
                  </h3>
                  <p className="font-public-sans text-sm text-[#F4EFE4]/70 mt-1">
                    Music player coming soon
                  </p>
                </div>

                {/* Circular Gold-Bordered Play Button */}
                <button
                  type="button"
                  aria-label="Play sound preview (static preview)"
                  aria-disabled="true"
                  className="w-12 h-12 rounded-full border border-[#B68A53] bg-transparent flex items-center justify-center shrink-0 cursor-default"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M4.5 2.5L11 7L4.5 11.5V2.5Z"
                      fill="#F4EFE4"
                      fillOpacity="0.85"
                    />
                  </svg>
                </button>
              </div>

              {/* Middle Row: Waveform & Volume Control */}
              <div className="flex items-center justify-between gap-4 py-1 mt-2">
                {/* 27 Mirrored Waveform Bars in Gold */}
                <div className="flex items-center gap-[3.5px] h-10">
                  {barHeights.map((h, i) => (
                    <span
                      key={i}
                      className="w-[2.5px] bg-[#B68A53] rounded-full inline-block"
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>

                {/* Developer note hidden per prompt instructions */}
                <span className="sr-only">WAVEFORM PULSES GENTLY / FUTURE IMPLEMENTATION</span>

                {/* Volume Slider Mockup */}
                <div className="flex items-center gap-2.5 shrink-0 pt-4">
                  <span className="font-public-condensed text-xs uppercase tracking-[0.2em] font-semibold text-[#B68A53]">
                    VOL
                  </span>
                  <div className="w-20 sm:w-24 h-[2px] bg-[#8799A7]/40 relative rounded-full">
                    <div className="h-full bg-[#F4EFE4] rounded-full w-3/4" />
                    <div className="absolute top-1/2 left-3/4 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#F4EFE4] rounded-full shadow" />
                  </div>
                </div>
              </div>

              {/* Bottom Row: 3 Sound Chips */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <button
                  type="button"
                  aria-disabled="true"
                  className="font-public-condensed text-xs uppercase tracking-[0.16em] px-3.5 py-1.5 border border-[#F4EFE4]/20 rounded-[2px] text-[#F4EFE4]/80 bg-white/[0.02] cursor-default"
                >
                  RAIN & NATURE
                </button>
                <button
                  type="button"
                  aria-disabled="true"
                  className="font-public-condensed text-xs uppercase tracking-[0.16em] px-3.5 py-1.5 border border-[#F4EFE4]/20 rounded-[2px] text-[#F4EFE4]/80 bg-white/[0.02] cursor-default"
                >
                  SOFT PIANO
                </button>
                <button
                  type="button"
                  aria-disabled="true"
                  className="font-public-condensed text-xs uppercase tracking-[0.16em] px-3.5 py-1.5 border border-[#F4EFE4]/20 rounded-[2px] text-[#F4EFE4]/80 bg-white/[0.02] cursor-default"
                >
                  DEEP FOCUS
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
