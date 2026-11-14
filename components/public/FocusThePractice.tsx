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
          {/* Left Column: Visual Timer Card with Offset Shadow Slab */}
          <div className="lg:col-span-8 relative flex flex-col">
            {/* Offset Shadow Slab behind the timer card */}
            <div
              className="absolute inset-0 translate-x-4 translate-y-4 rounded-[2px] bg-[#0d1926] border border-[#F4EFE4]/10 pointer-events-none"
              aria-hidden="true"
            />

            {/* Main Timer Card - inner frame around dial removed per item 8 check */}
            <div className="relative rounded-[2px] bg-[#172536] border border-[#B68A53]/30 p-5 sm:p-6 lg:p-7 shadow-2xl flex flex-col justify-between">
              {/* Top row: Session label + Coming soon tag */}
              <div className="flex items-center justify-between gap-3 pb-5 border-b border-[#F4EFE4]/15">
                <span className="font-public-condensed text-xs uppercase tracking-[0.22em] font-semibold text-[#B68A53]">
                  FOCUS SESSION / 01
                </span>

                {/* MOCKUP / COMING SOON tag tilted at -2.5deg */}
                <div className="inline-flex items-center px-3 py-1 bg-[#172536] border border-[#B68A53]/50 text-[10px] font-public-condensed uppercase tracking-[0.2em] font-semibold text-[#D2A75D] -rotate-[2.5deg]">
                  <span>MOCKUP / COMING SOON</span>
                </div>
              </div>

              {/* Visual Timer Dial Area */}
              <div className="py-6 sm:py-8 lg:py-9 flex flex-col items-center justify-center relative my-auto">
                <div className="relative w-[340px] h-[340px] sm:w-[450px] sm:h-[450px] lg:w-[495px] lg:h-[495px] flex items-center justify-center">
                  <svg
                    viewBox="0 0 500 500"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full text-[#B68A53]"
                    aria-label="Timer dial indicator showing 25:00"
                    role="img"
                  >
                    <defs>
                      <radialGradient id="dial-glow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#1e3852" stopOpacity="0.55" />
                        <stop offset="65%" stopColor="#1e3852" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#172536" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    {/* Soft central radial glow */}
                    <circle cx="250" cy="250" r="185" fill="url(#dial-glow)" />

                    {/* Thin inner ring */}
                    <circle cx="250" cy="250" r="148" stroke="#F4EFE4" strokeOpacity="0.14" strokeWidth="1" />

                    {/* Thick dark track ring */}
                    <circle cx="250" cy="250" r="180" stroke="#1e3044" strokeWidth="9" />

                    {/* Thick gold arc: 150 degrees clockwise from 12 o'clock (25 mins on 60 min clock) */}
                    <circle
                      cx="250"
                      cy="250"
                      r="180"
                      stroke="#B68A53"
                      strokeWidth="9"
                      strokeDasharray="471.2 1131"
                      strokeLinecap="round"
                      transform="rotate(-90 250 250)"
                    />

                    {/* Orbit indicator bead on active arc at 3 o'clock */}
                    <circle cx="430" cy="250" r="5" fill="#B68A53" />

                    {/* Glowing amber beacon star at 12 o'clock inside dial */}
                    <circle cx="250" cy="100" r="14" fill="#D2A75D" opacity="0.25" />
                    <circle cx="250" cy="100" r="3.5" fill="#D2A75D" />

                    {/* Thin outer ring */}
                    <circle cx="250" cy="250" r="218" stroke="#F4EFE4" strokeOpacity="0.12" strokeWidth="1" />

                    {/* 4 Cardinal Ticks (0, 90, 180, 270 deg) extending outward to outer ring */}
                    <line x1="250.0" y1="58.0" x2="250.0" y2="28.0" stroke="#B68A53" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="442.0" y1="250.0" x2="472.0" y2="250.0" stroke="#B68A53" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="250.0" y1="442.0" x2="250.0" y2="472.0" stroke="#B68A53" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="58.0" y1="250.0" x2="28.0" y2="250.0" stroke="#B68A53" strokeWidth="1.5" strokeLinecap="round" />

                    {/* 8 Intermediate Hour Ticks (30, 60, 120, 150, 210, 240, 300, 330 deg) */}
                    <line x1="346.0" y1="83.7" x2="356.0" y2="66.4" stroke="#F4EFE4" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
                    <line x1="416.3" y1="154.0" x2="433.6" y2="144.0" stroke="#F4EFE4" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
                    <line x1="416.3" y1="346.0" x2="433.6" y2="356.0" stroke="#F4EFE4" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
                    <line x1="346.0" y1="416.3" x2="356.0" y2="433.6" stroke="#F4EFE4" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
                    <line x1="154.0" y1="416.3" x2="144.0" y2="433.6" stroke="#F4EFE4" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
                    <line x1="83.7" y1="346.0" x2="66.4" y2="356.0" stroke="#F4EFE4" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
                    <line x1="83.7" y1="154.0" x2="66.4" y2="144.0" stroke="#F4EFE4" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
                    <line x1="154.0" y1="83.7" x2="144.0" y2="66.4" stroke="#F4EFE4" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />

                    {/* 12 Minor Ticks (every 15 deg) */}
                    <line x1="299.7" y1="64.5" x2="302.3" y2="54.9" stroke="#F4EFE4" strokeOpacity="0.22" strokeWidth="0.8" strokeLinecap="round" />
                    <line x1="385.8" y1="114.2" x2="392.8" y2="107.2" stroke="#F4EFE4" strokeOpacity="0.22" strokeWidth="0.8" strokeLinecap="round" />
                    <line x1="435.5" y1="200.3" x2="445.1" y2="197.7" stroke="#F4EFE4" strokeOpacity="0.22" strokeWidth="0.8" strokeLinecap="round" />
                    <line x1="435.5" y1="299.7" x2="445.1" y2="302.3" stroke="#F4EFE4" strokeOpacity="0.22" strokeWidth="0.8" strokeLinecap="round" />
                    <line x1="385.8" y1="385.8" x2="392.8" y2="392.8" stroke="#F4EFE4" strokeOpacity="0.22" strokeWidth="0.8" strokeLinecap="round" />
                    <line x1="299.7" y1="435.5" x2="302.3" y2="445.1" stroke="#F4EFE4" strokeOpacity="0.22" strokeWidth="0.8" strokeLinecap="round" />
                    <line x1="200.3" y1="435.5" x2="197.7" y2="445.1" stroke="#F4EFE4" strokeOpacity="0.22" strokeWidth="0.8" strokeLinecap="round" />
                    <line x1="114.2" y1="385.8" x2="107.2" y2="392.8" stroke="#F4EFE4" strokeOpacity="0.22" strokeWidth="0.8" strokeLinecap="round" />
                    <line x1="64.5" y1="299.7" x2="54.9" y2="302.3" stroke="#F4EFE4" strokeOpacity="0.22" strokeWidth="0.8" strokeLinecap="round" />
                    <line x1="64.5" y1="200.3" x2="54.9" y2="197.7" stroke="#F4EFE4" strokeOpacity="0.22" strokeWidth="0.8" strokeLinecap="round" />
                    <line x1="114.2" y1="114.2" x2="107.2" y2="107.2" stroke="#F4EFE4" strokeOpacity="0.22" strokeWidth="0.8" strokeLinecap="round" />
                    <line x1="200.3" y1="64.5" x2="197.7" y2="54.9" stroke="#F4EFE4" strokeOpacity="0.22" strokeWidth="0.8" strokeLinecap="round" />
                  </svg>

                  {/* Center Time & FOCUS SESSION label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="font-public-display text-8xl sm:text-9xl lg:text-[112px] font-normal leading-none tracking-tight text-[#F4EFE4] antialiased">
                      25:00
                    </span>
                    <span className="font-public-condensed text-xs uppercase tracking-[0.28em] text-[#B68A53] font-semibold mt-3">
                      FOCUS SESSION
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 mt-4 sm:mt-6">
                  <button
                    type="button"
                    aria-disabled="true"
                    tabIndex={-1}
                    className="w-28 sm:w-32 py-2.5 rounded-[2px] bg-[#B68A53] text-[#172536] font-public-condensed text-xs uppercase tracking-[0.22em] font-bold shadow hover:bg-[#D2A75D] cursor-default focus:outline-none"
                  >
                    START
                  </button>
                  <button
                    type="button"
                    aria-disabled="true"
                    tabIndex={-1}
                    className="w-28 sm:w-32 py-2.5 rounded-[2px] bg-[#172536] border border-[#F4EFE4]/30 text-[#F4EFE4] font-public-condensed text-xs uppercase tracking-[0.22em] font-medium cursor-default focus:outline-none"
                  >
                    PAUSE
                  </button>
                  <button
                    type="button"
                    aria-disabled="true"
                    tabIndex={-1}
                    className="w-28 sm:w-32 py-2.5 rounded-[2px] bg-[#172536] border border-[#F4EFE4]/30 text-[#F4EFE4]/80 font-public-condensed text-xs uppercase tracking-[0.22em] font-medium cursor-default focus:outline-none"
                  >
                    RESET
                  </button>
                </div>
              </div>

              {/* Bottom Section: CHOOSE YOUR PACE + Tabs matching reference 52px height and rounded inactive corners */}
              <div className="pt-5 mt-4 border-t border-[#F4EFE4]/15">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="font-public-condensed text-xs uppercase tracking-[0.25em] font-semibold text-[#B68A53]">
                    CHOOSE YOUR PACE
                  </span>
                  <span className="font-public-condensed text-xs uppercase tracking-[0.2em] font-semibold text-[#B68A53]">
                    01 — 03
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="tablist">
                  {/* Active tab FOCUS 25 MIN with cut bottom-left corner and gold underline */}
                  <div className="flex flex-col">
                    <button
                      type="button"
                      role="tab"
                      aria-selected="true"
                      aria-disabled="true"
                      tabIndex={-1}
                      className="w-full h-[52px] flex items-center justify-center bg-[#F4EFE4] text-[#172536] font-public-condensed text-xs uppercase tracking-[0.18em] font-bold text-center cursor-default focus:outline-none"
                      style={{
                        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
                      }}
                    >
                      FOCUS 25 MIN
                    </button>
                    <div className="w-full h-[2px] bg-[#B68A53] mt-1" aria-hidden="true" />
                  </div>

                  {/* Inactive tab with 52px height and rounded-[8px] corners matching reference */}
                  <button
                    type="button"
                    role="tab"
                    aria-selected="false"
                    aria-disabled="true"
                    tabIndex={-1}
                    className="w-full h-[52px] flex items-center justify-center rounded-[8px] bg-[#172536] text-[#F4EFE4]/80 border border-[#F4EFE4]/20 font-public-condensed text-xs uppercase tracking-[0.18em] font-medium text-center cursor-default focus:outline-none"
                  >
                    SHORT BREAK 5 MIN
                  </button>

                  {/* Inactive tab with 52px height and rounded-[8px] corners matching reference */}
                  <button
                    type="button"
                    role="tab"
                    aria-selected="false"
                    aria-disabled="true"
                    tabIndex={-1}
                    className="w-full h-[52px] flex items-center justify-center rounded-[8px] bg-[#172536] text-[#F4EFE4]/80 border border-[#F4EFE4]/20 font-public-condensed text-xs uppercase tracking-[0.18em] font-medium text-center cursor-default focus:outline-none"
                  >
                    LONG BREAK 15 MIN
                  </button>
                </div>
              </div>
            </div>
          </div>

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

                  {/* Middle Section: Habit Balance Radar Chart with matched compact size and darker contrast */}
                  <div className="py-4 my-auto flex flex-col items-center justify-center">
                    <div className="relative w-full max-w-[155px] aspect-square flex items-center justify-center">
                      <svg
                        viewBox="0 0 220 220"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-full h-full text-[#60432F]"
                        aria-label="Habit balance radar chart"
                        role="img"
                      >
                        {/* Outer solid circular outline */}
                        <circle cx="110" cy="110" r="70" stroke="#60432F" strokeOpacity="0.55" strokeWidth="1" />

                        {/* Inner dashed circle */}
                        <circle cx="110" cy="110" r="45" stroke="#60432F" strokeOpacity="0.55" strokeWidth="1" strokeDasharray="3 3" />

                        {/* 8 Radial Spokes through center (110, 110) */}
                        <line x1="30" y1="110" x2="190" y2="110" stroke="#60432F" strokeOpacity="0.45" strokeWidth="1" />
                        <line x1="110" y1="30" x2="110" y2="190" stroke="#60432F" strokeOpacity="0.45" strokeWidth="1" />
                        <line x1="53" y1="53" x2="167" y2="167" stroke="#60432F" strokeOpacity="0.45" strokeWidth="1" />
                        <line x1="53" y1="167" x2="167" y2="53" stroke="#60432F" strokeOpacity="0.45" strokeWidth="1" />

                        {/* Polygon with 5 nodes - darker tobacco stroke and tint */}
                        <polygon
                          points="98,52 155,88 142,148 78,148 58,96"
                          fill="#BD634A"
                          fillOpacity="0.14"
                          stroke="#60432F"
                          strokeWidth="1.5"
                        />
                        {/* Vertex Nodes */}
                        <circle cx="98" cy="52" r="2.5" fill="#172536" />
                        <circle cx="155" cy="88" r="3" fill="#BD634A" />
                        <circle cx="142" cy="148" r="2.5" fill="#172536" />
                        <circle cx="78" cy="148" r="2.5" fill="#172536" />
                        <circle cx="58" cy="96" r="3" fill="#BD634A" />

                        {/* Crosshairs: Top-right and Bottom-left */}
                        <text x="170" y="52" fill="#60432F" fillOpacity="0.75" fontSize="14" fontFamily="monospace" textAnchor="middle">+</text>
                        <text x="50" y="174" fill="#60432F" fillOpacity="0.75" fontSize="14" fontFamily="monospace" textAnchor="middle">+</text>

                        {/* Label NORTH / 02 at bottom right */}
                        <text
                          x="142"
                          y="172"
                          fill="#60432F"
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
