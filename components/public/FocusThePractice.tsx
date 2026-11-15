import { FocusTimer } from './FocusTimer'

export function FocusThePractice() {
  return (
    <section id="practice" className="pt-14 pb-4 lg:pt-16 lg:pb-4 bg-[#172536] text-[#F4EFE4] overflow-hidden">
      <div className="max-w-[1366px] mx-auto px-6 sm:px-14 lg:px-[84px]">
        {/* Top Header Row / Divider */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#F4EFE4]/15">
          <span className="font-public-condensed text-xs uppercase tracking-[0.25em] font-semibold text-[#B68A53]">
            01 / THE PRACTICE
          </span>
          <span className="font-public-condensed text-xs uppercase tracking-[0.25em] font-semibold text-[#B68A53]">
            A PLACE TO BEGIN
          </span>
        </div>

        {/* Section Headline & Lead Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-end pt-7 pb-10 lg:pb-[66px]">
          {/* Left Column: Title */}
          <div className="lg:col-span-8">
            <span className="font-public-condensed text-xs uppercase tracking-[0.25em] font-semibold text-[#B68A53]">
              A LITTLE SPACE TO THINK
            </span>
            <h2 className="font-public-display text-5xl sm:text-6xl lg:text-[84px] leading-[0.98] font-normal text-[#F4EFE4] tracking-tight mt-2 antialiased">
              Settle into focus.
            </h2>
          </div>

          {/* Right Column: Narrower column wrapping to exactly 3 lines like reference */}
          <div className="lg:col-span-4 flex flex-col justify-end">
            <p className="font-public-sans text-sm text-[#F4EFE4]/80 leading-relaxed text-left max-w-[245px] lg:ml-auto">
              A future home for unhurried work, thoughtful pauses, and the simple ritual of beginning.
            </p>
          </div>
        </div>

        {/* Two Cards Layout - items-start to allow authentic vertical stagger */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Focus Timer */}
          <FocusTimer />

          {/* Right Column: Cream Field-Note Card - staggered lower than timer card per item 9 */}
          <div className="lg:col-span-4 relative flex flex-col mt-8 lg:mt-[43px]">
            {/* Outer Cream Card with Cut Top-Right Corner */}
            <div
              className="relative bg-[#F4EFE4] text-[#172536] p-2.5 shadow-2xl flex flex-col justify-between lg:min-h-[825px]"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 32px) 0, 100% 32px, 100% 100%, 0 100%)',
              }}
            >
              {/* First Border Box following corner chamfer */}
              <div
                className="relative border border-[#172536]/25 p-1 flex-1 flex flex-col justify-between"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 27px) 0, 100% 27px, 100% 100%, 0 100%)',
                }}
              >
                {/* Second Inner Double Border Box following corner chamfer */}
                <div
                  className="relative border border-[#172536]/25 p-5 sm:p-6 lg:p-7 flex-1 flex flex-col justify-between"
                  style={{
                    clipPath: 'polygon(0 0, calc(100% - 23px) 0, 100% 23px, 100% 100%, 0 100%)',
                  }}
                >
                  {/* Top Section */}
                  <div>
                    <span className="font-public-condensed text-xs uppercase tracking-[0.25em] font-semibold text-[#60432F]">
                      FIELD NOTE / A SMALL RITUAL
                    </span>

                    <h3 className="font-public-display text-4xl sm:text-5xl lg:text-[48px] text-[#172536] tracking-tight font-normal leading-[1.04] mt-5 antialiased">
                      Before you
                      <span className="block">begin</span>
                    </h3>

                    {/* Paragraph under 'Before you begin' */}
                    <p className="font-public-sans text-xs sm:text-sm text-[#60432F]/85 leading-relaxed mt-3 max-w-[280px]">
                      A few quiet gestures can make room for what matters.
                    </p>

                    {/* 3 Checklist Items with matched font size text-[15px] and empty circle checkboxes */}
                    <div className="mt-5 font-public-sans text-[15px] text-[#172536]">
                      <div className="border-t border-[#172536]/18 py-3.5 flex items-center gap-3">
                        <span
                          className="w-4 h-4 rounded-full border border-[#172536]/55 shrink-0 bg-transparent"
                          aria-hidden="true"
                        />
                        <span>Clear your desk</span>
                      </div>
                      <div className="border-t border-[#172536]/18 py-3.5 flex items-center gap-3">
                        <span
                          className="w-4 h-4 rounded-full border border-[#172536]/55 shrink-0 bg-transparent"
                          aria-hidden="true"
                        />
                        <span>Choose one task</span>
                      </div>
                      <div className="border-t border-b border-[#172536]/18 py-3.5 flex items-center gap-3">
                        <span
                          className="w-4 h-4 rounded-full border border-[#172536]/55 shrink-0 bg-transparent"
                          aria-hidden="true"
                        />
                        <span>Take a breath</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Section: Habit Balance Radar Chart with larger size (240px), darker lines, no pink fill */}
                  <div className="py-0.5 my-auto flex flex-col items-center justify-center">
                    <div className="relative w-full max-w-[240px] aspect-square flex items-center justify-center">
                      <svg
                        viewBox="0 0 220 220"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-full h-full text-[#172536]"
                        aria-label="Habit balance radar chart"
                        role="img"
                      >
                        {/* Outer solid circular outline */}
                        <circle cx="110" cy="110" r="70" stroke="#172536" strokeOpacity="0.8" strokeWidth="1.2" />

                        {/* Inner dashed circle */}
                        <circle cx="110" cy="110" r="45" stroke="#172536" strokeOpacity="0.7" strokeWidth="1.2" strokeDasharray="3 3" />

                        {/* 8 Radial Spokes through center (110, 110) */}
                        <line x1="30" y1="110" x2="190" y2="110" stroke="#172536" strokeOpacity="0.6" strokeWidth="1.2" />
                        <line x1="110" y1="30" x2="110" y2="190" stroke="#172536" strokeOpacity="0.6" strokeWidth="1.2" />
                        <line x1="53" y1="53" x2="167" y2="167" stroke="#172536" strokeOpacity="0.6" strokeWidth="1.2" />
                        <line x1="53" y1="167" x2="167" y2="53" stroke="#172536" strokeOpacity="0.6" strokeWidth="1.2" />

                        {/* Polygon with 5 nodes - dark line, no pink fill per Task 14E */}
                        <polygon
                          points="98,52 155,88 142,148 78,148 58,96"
                          fill="none"
                          stroke="#172536"
                          strokeWidth="2"
                        />
                        {/* Vertex Nodes */}
                        <circle cx="98" cy="52" r="2.5" fill="#172536" />
                        <circle cx="155" cy="88" r="3" fill="#172536" />
                        <circle cx="142" cy="148" r="2.5" fill="#172536" />
                        <circle cx="78" cy="148" r="2.5" fill="#172536" />
                        <circle cx="58" cy="96" r="3" fill="#172536" />

                        {/* Crosshairs: Top-right and Bottom-left */}
                        <text x="170" y="52" fill="#172536" fillOpacity="0.85" fontSize="14" fontFamily="monospace" textAnchor="middle">+</text>
                        <text x="50" y="174" fill="#172536" fillOpacity="0.85" fontSize="14" fontFamily="monospace" textAnchor="middle">+</text>

                        {/* Label NORTH / 02 at bottom right */}
                        <text
                          x="142"
                          y="172"
                          fill="#172536"
                          fontSize="9"
                          fontFamily="var(--font-barlow-condensed)"
                          fontWeight="600"
                          letterSpacing="0.2em"
                        >
                          NORTH / 02
                        </text>
                      </svg>
                    </div>
                  </div>

                  {/* Bottom Section: 4-Stage Box Breathing Guide */}
                  <div className="pt-4 border-t border-[#172536]/18 mt-auto">
                    <div className="flex items-center gap-3 mb-2.5">
                      <span className="font-public-condensed text-xs uppercase tracking-[0.22em] font-semibold text-[#60432F]">
                        A BREATHING GUIDE
                      </span>
                      <span className="flex-1 h-px bg-[#172536]/18" aria-hidden="true" />
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 py-1 text-center">
                      {/* Stage 1: INHALE */}
                      <div className="flex flex-col items-center gap-1.5">
                        <div
                          className="w-8 h-8 rounded-full border border-[#60432F]/50 flex items-center justify-center text-[#60432F]"
                          aria-hidden="true"
                        >
                          <span className="w-4 h-4 rounded-full border border-[#B68A53]" />
                        </div>
                        <span className="font-public-condensed text-[10px] uppercase tracking-[0.16em] font-semibold text-[#60432F]">
                          INHALE
                        </span>
                      </div>

                      {/* Stage 2: HOLD */}
                      <div className="flex flex-col items-center gap-1.5">
                        <div
                          className="w-8 h-8 rounded-full border border-[#60432F]/50 flex items-center justify-center text-[#60432F]"
                          aria-hidden="true"
                        >
                          <span className="w-5 h-5 rounded-full border border-[#B68A53]" />
                        </div>
                        <span className="font-public-condensed text-[10px] uppercase tracking-[0.16em] font-semibold text-[#60432F]">
                          HOLD
                        </span>
                      </div>

                      {/* Stage 3: EXHALE */}
                      <div className="flex flex-col items-center gap-1.5">
                        <div
                          className="w-8 h-8 rounded-full border border-[#60432F]/50 flex items-center justify-center text-[#60432F]"
                          aria-hidden="true"
                        >
                          <span className="w-2 h-2 rounded-full border border-[#B68A53]" />
                        </div>
                        <span className="font-public-condensed text-[10px] uppercase tracking-[0.16em] font-semibold text-[#60432F]">
                          EXHALE
                        </span>
                      </div>

                      {/* Stage 4: REST */}
                      <div className="flex flex-col items-center gap-1.5">
                        <div
                          className="w-8 h-8 rounded-full border border-[#60432F]/50 flex items-center justify-center text-[#60432F]"
                          aria-hidden="true"
                        >
                          <span className="w-4 h-4 rounded-full border border-[#B68A53]" />
                        </div>
                        <span className="font-public-condensed text-[10px] uppercase tracking-[0.16em] font-semibold text-[#60432F]">
                          REST
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
