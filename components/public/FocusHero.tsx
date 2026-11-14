import Image from 'next/image'

export function FocusHero() {
  return (
    <section className="relative overflow-hidden border-b border-[#F4EFE4]/15 bg-[#172536] text-[#F4EFE4]">
      <div className="max-w-[1366px] mx-auto min-h-[862px] lg:h-[862px] flex flex-col lg:flex-row">
        {/* Left Column: Typography & Intent */}
        <div className="w-full lg:w-[780px] lg:shrink-0 px-6 sm:px-14 lg:pl-[84px] lg:pr-12 py-12 lg:py-14 flex flex-col justify-between">
          {/* Top Badge */}
          <div className="flex items-center gap-3">
            <span className="font-public-condensed text-xs uppercase tracking-[0.25em] font-semibold text-[#B68A53]">
              TRACK / FOCUS ROOM
            </span>
            <span className="text-[#B68A53]/60 text-xs select-none" aria-hidden="true">—</span>
            <span className="font-public-condensed text-xs uppercase tracking-[0.2em] font-semibold text-[#B68A53]">
              02
            </span>
            <span className="w-16 h-px bg-[#B68A53]/40 inline-block align-middle" aria-hidden="true" />
          </div>

          {/* Center: Headline & Lead Copy */}
          <div className="my-auto py-8 lg:py-10">
            <h1 className="font-public-display text-6xl sm:text-7xl lg:text-[116px] xl:text-[122px] leading-[0.92] tracking-tight text-[#F4EFE4] font-normal">
              Find your
              <span className="block mt-1">rhythm.</span>
            </h1>

            <p className="font-public-sans text-base sm:text-lg text-[#F4EFE4]/80 max-w-md leading-relaxed mt-8">
              One focused session at a time. Make space for deep work, then take a proper break.
            </p>
          </div>

          {/* Bottom Label */}
          <div className="flex items-center gap-3 pt-4">
            <span className="w-[60px] h-px bg-[#B68A53] inline-block align-middle" aria-hidden="true" />
            <span className="font-public-condensed text-xs uppercase tracking-[0.25em] font-semibold text-[#B68A53]">
              A QUIETER KIND OF MOMENTUM
            </span>
          </div>
        </div>

        {/* Right Column: Desk Photo with Subtle Orbit */}
        <div className="w-full lg:w-[586px] lg:shrink-0 relative min-h-[420px] lg:min-h-full border-t lg:border-t-0 lg:border-l border-[#F4EFE4]/15">
          <Image
            src="/welcome/focus-desk.jpg"
            alt="Warm lit desk with books, lamp, and coffee"
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 586px"
          />

          {/* Subtle dark gradient overlay on the left edge to blend seamlessly with left column */}
          <div
            className="absolute inset-y-0 left-0 w-32 sm:w-48 bg-gradient-to-r from-[#172536] via-[#172536]/60 to-transparent pointer-events-none z-[5]"
            aria-hidden="true"
          />

          {/* Thin framing line border */}
          <div className="absolute inset-6 lg:inset-8 border border-[#F4EFE4]/25 pointer-events-none z-10" />

          {/* Upper-right + crosshair */}
          <div className="absolute top-7 right-7 lg:top-9 lg:right-9 text-[#F4EFE4]/60 font-mono text-sm leading-none pointer-events-none select-none z-10" aria-hidden="true">
            +
          </div>

          {/* Subtle Celestial Orbit Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-45 z-[6]">
            <svg
              viewBox="0 0 574 860"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full text-[#D2A75D]"
              aria-label="Celestial orbit lines"
              role="img"
            >
              <g transform="rotate(-22 287 430)">
                <ellipse
                  cx="287"
                  cy="430"
                  rx="220"
                  ry="125"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="4 6"
                />
                <ellipse
                  cx="287"
                  cy="430"
                  rx="160"
                  ry="85"
                  stroke="#F4EFE4"
                  strokeWidth="0.8"
                  strokeDasharray="3 4"
                  opacity="0.6"
                />
                <circle cx="450" cy="390" r="3" fill="#D2A75D" />
                <circle cx="150" cy="470" r="2.5" fill="#BD634A" />
                <circle cx="360" cy="510" r="2" fill="#F4EFE4" />
              </g>
            </svg>
          </div>

          {/* Vertical caption running along the right edge */}
          <div className="absolute right-8 bottom-12 lg:right-10 lg:bottom-14 z-10 pointer-events-none select-none [writing-mode:vertical-rl] font-public-condensed text-[11px] tracking-[0.28em] uppercase text-[#F4EFE4]/70">
            LOW LIGHT / CLEAR MIND / 01:25 AM
          </div>

          {/* Developer note 'STAR MAP DRIFTS BARELY / FUTURE IMPLEMENTATION' is hidden per Requirement 2 */}
        </div>
      </div>
    </section>
  )
}
