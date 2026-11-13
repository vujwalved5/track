export function SectionTheLongView() {
  return (
    <section id="trace" className="py-16 md:py-24 border-b border-[#172536]/10 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        {/* Section Header with Compass Rose */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-public-condensed text-xs uppercase tracking-[0.25em] font-semibold text-[#B68A53]">
                03 / The Long View
              </span>
              <span className="h-px w-8 bg-[#B68A53]/40" />
            </div>
            <h2 className="font-public-serif text-3xl sm:text-4xl lg:text-5xl text-[#172536] tracking-tight">
              Your days leave a trace.
            </h2>
          </div>

          {/* Hand-drawn Compass Rose SVG */}
          <div className="flex items-center gap-3">
            <svg
              width="44"
              height="44"
              viewBox="0 0 44 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#B68A53]"
              aria-label="Compass rose emblem"
              role="img"
            >
              <circle cx="22" cy="22" r="20" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" />
              <circle cx="22" cy="22" r="14" stroke="#172536" strokeWidth="0.8" />
              {/* Compass points */}
              <polygon points="22,4 25,20 22,22 19,20" fill="#BD634A" />
              <polygon points="22,40 25,24 22,22 19,24" fill="#172536" />
              <polygon points="4,22 20,19 22,22 20,25" fill="#172536" />
              <polygon points="40,22 24,19 22,22 24,25" fill="#172536" />
              <circle cx="22" cy="22" r="2.5" fill="#B68A53" />
            </svg>
            <div className="text-right">
              <span className="block font-public-condensed text-[10px] uppercase tracking-[0.2em] text-[#B68A53]">
                Trajectory
              </span>
              <span className="font-public-script text-xs text-[#172536]/80">
                true north
              </span>
            </div>
          </div>
        </div>

        {/* Route Diagram Container */}
        <div className="lift-card bg-[#F4EFE4] rounded-lg p-6 sm:p-10 border border-[#172536]/15 shadow-sm relative">
          {/* Subtle graph background */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none rounded-lg"
            style={{
              backgroundImage: 'linear-gradient(to right, rgba(23,37,54,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(23,37,54,0.08) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Desktop & Tablet SVG Route Diagram */}
          <div className="relative z-10 w-full overflow-x-auto pb-4">
            <div className="min-w-[700px] sm:min-w-[850px] lg:min-w-full">
              <svg
                viewBox="0 0 1000 240"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-auto text-[#172536]"
                aria-label="Route diagram showing 6 milestone nodes along a path"
                role="img"
              >
                {/* Winding Trail / Route SVG */}
                <path
                  d="M50 160 C 150 160, 180 80, 260 90 C 340 100, 390 190, 480 180 C 570 170, 620 70, 710 80 C 800 90, 860 160, 950 120"
                  stroke="#172536"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="6 4"
                />

                {/* Footprint markers along the route */}
                <g opacity="0.65" fill="#B68A53">
                  {/* Step pair 1 between node 01 and 02 */}
                  <g transform="translate(130, 150) rotate(-15)">
                    <ellipse cx="-3" cy="2" rx="1.8" ry="3.2" />
                    <circle cx="-3" cy="7" r="1.3" />
                    <ellipse cx="3" cy="-2" rx="1.8" ry="3.2" />
                    <circle cx="3" cy="3" r="1.3" />
                  </g>
                  {/* Step pair 2 */}
                  <g transform="translate(195, 102) rotate(-25)">
                    <ellipse cx="-3" cy="2" rx="1.8" ry="3.2" />
                    <circle cx="-3" cy="7" r="1.3" />
                    <ellipse cx="3" cy="-2" rx="1.8" ry="3.2" />
                    <circle cx="3" cy="3" r="1.3" />
                  </g>
                  {/* Step pair 3 between node 02 and 03 */}
                  <g transform="translate(340, 120) rotate(35)">
                    <ellipse cx="-3" cy="2" rx="1.8" ry="3.2" />
                    <circle cx="-3" cy="7" r="1.3" />
                    <ellipse cx="3" cy="-2" rx="1.8" ry="3.2" />
                    <circle cx="3" cy="3" r="1.3" />
                  </g>
                  {/* Step pair 4 */}
                  <g transform="translate(415, 175) rotate(10)">
                    <ellipse cx="-3" cy="2" rx="1.8" ry="3.2" />
                    <circle cx="-3" cy="7" r="1.3" />
                    <ellipse cx="3" cy="-2" rx="1.8" ry="3.2" />
                    <circle cx="3" cy="3" r="1.3" />
                  </g>
                  {/* Step pair 5 between node 03 and 04 */}
                  <g transform="translate(565, 145) rotate(-35)">
                    <ellipse cx="-3" cy="2" rx="1.8" ry="3.2" />
                    <circle cx="-3" cy="7" r="1.3" />
                    <ellipse cx="3" cy="-2" rx="1.8" ry="3.2" />
                    <circle cx="3" cy="3" r="1.3" />
                  </g>
                  {/* Step pair 6 */}
                  <g transform="translate(645, 80) rotate(-10)">
                    <ellipse cx="-3" cy="2" rx="1.8" ry="3.2" />
                    <circle cx="-3" cy="7" r="1.3" />
                    <ellipse cx="3" cy="-2" rx="1.8" ry="3.2" />
                    <circle cx="3" cy="3" r="1.3" />
                  </g>
                  {/* Step pair 7 between node 04 and 05 */}
                  <g transform="translate(780, 105) rotate(25)">
                    <ellipse cx="-3" cy="2" rx="1.8" ry="3.2" />
                    <circle cx="-3" cy="7" r="1.3" />
                    <ellipse cx="3" cy="-2" rx="1.8" ry="3.2" />
                    <circle cx="3" cy="3" r="1.3" />
                  </g>
                  {/* Step pair 8 between node 05 and 06 */}
                  <g transform="translate(900, 140) rotate(-20)">
                    <ellipse cx="-3" cy="2" rx="1.8" ry="3.2" />
                    <circle cx="-3" cy="7" r="1.3" />
                    <ellipse cx="3" cy="-2" rx="1.8" ry="3.2" />
                    <circle cx="3" cy="3" r="1.3" />
                  </g>
                </g>

                {/* Shaded area underneath */}
                <path
                  d="M50 160 C 150 160, 180 80, 260 90 C 340 100, 390 190, 480 180 C 570 170, 620 70, 710 80 C 800 90, 860 160, 950 120 L 950 230 L 50 230 Z"
                  fill="url(#route-gradient)"
                  opacity="0.25"
                />

                <defs>
                  <linearGradient id="route-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#BD634A" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#F4EFE4" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* 6 Nodes */}
                {/* Node 1 */}
                <g>
                  <circle cx="50" cy="160" r="10" fill="#F4EFE4" stroke="#172536" strokeWidth="2.5" />
                  <circle cx="50" cy="160" r="4" fill="#BD634A" />
                  <text x="50" y="195" textAnchor="middle" fill="#172536" fontSize="12" fontWeight="600" fontFamily="var(--font-barlow-condensed)">
                    01
                  </text>
                </g>

                {/* Node 2 */}
                <g>
                  <circle cx="260" cy="90" r="8" fill="#F4EFE4" stroke="#172536" strokeWidth="2" />
                  <circle cx="260" cy="90" r="3" fill="#B68A53" />
                  <text x="260" y="65" textAnchor="middle" fill="#172536" fontSize="12" fontWeight="600" fontFamily="var(--font-barlow-condensed)">
                    02
                  </text>
                </g>

                {/* Node 3 */}
                <g>
                  <circle cx="480" cy="180" r="10" fill="#F4EFE4" stroke="#172536" strokeWidth="2.5" />
                  <circle cx="480" cy="180" r="4" fill="#BD634A" />
                  <text x="480" y="215" textAnchor="middle" fill="#172536" fontSize="12" fontWeight="600" fontFamily="var(--font-barlow-condensed)">
                    03
                  </text>
                </g>

                {/* Node 4 */}
                <g>
                  <circle cx="710" cy="80" r="8" fill="#F4EFE4" stroke="#172536" strokeWidth="2" />
                  <circle cx="710" cy="80" r="3" fill="#B68A53" />
                  <text x="710" y="55" textAnchor="middle" fill="#172536" fontSize="12" fontWeight="600" fontFamily="var(--font-barlow-condensed)">
                    04
                  </text>
                </g>

                {/* Node 5 */}
                <g>
                  <circle cx="850" cy="148" r="10" fill="#F4EFE4" stroke="#172536" strokeWidth="2.5" />
                  <circle cx="850" cy="148" r="4" fill="#BD634A" />
                  <text x="850" y="180" textAnchor="middle" fill="#172536" fontSize="12" fontWeight="600" fontFamily="var(--font-barlow-condensed)">
                    05
                  </text>
                </g>

                {/* Node 6 */}
                <g>
                  <circle cx="950" cy="120" r="11" fill="#172536" stroke="#D2A75D" strokeWidth="2" />
                  <circle cx="950" cy="120" r="4" fill="#F4EFE4" />
                  <text x="950" y="155" textAnchor="middle" fill="#172536" fontSize="12" fontWeight="600" fontFamily="var(--font-barlow-condensed)">
                    06
                  </text>
                </g>
              </svg>
            </div>
          </div>

          {/* Badges & Handwritten Notes Grid */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-[#172536]/10 mt-6">
            {/* Milestone 1 */}
            <div className="space-y-1">
              <span className="inline-block px-2.5 py-0.5 rounded bg-[#B68A53]/20 border border-[#B68A53]/40 font-public-condensed text-[11px] uppercase tracking-[0.18em] font-semibold text-[#172536]">
                A Small Beginning
              </span>
              <p className="font-public-hand text-base text-[#BD634A]">
                the first step is always quiet
              </p>
              <p className="font-public-sans text-xs text-[#172536]/70">
                You begin without ceremony. A single line in ink on Day 1.
              </p>
            </div>

            {/* Milestone 2 */}
            <div className="space-y-1">
              <span className="inline-block px-2.5 py-0.5 rounded bg-[#BD634A]/20 border border-[#BD634A]/40 font-public-condensed text-[11px] uppercase tracking-[0.18em] font-semibold text-[#172536]">
                Notice the Shift
              </span>
              <p className="font-public-hand text-base text-[#BD634A]">
                momentum builds without asking
              </p>
              <p className="font-public-sans text-xs text-[#172536]/70">
                By mid-month, patterns surface naturally on the dotted page.
              </p>
            </div>

            {/* Milestone 3 */}
            <div className="space-y-1">
              <span className="inline-block px-2.5 py-0.5 rounded bg-[#30483D]/20 border border-[#30483D]/40 font-public-condensed text-[11px] uppercase tracking-[0.18em] font-semibold text-[#172536]">
                Keep Going
              </span>
              <p className="font-public-hand text-base text-[#BD634A]">
                look back only to see how far you've come
              </p>
              <p className="font-public-sans text-xs text-[#172536]/70">
                The entire volume becomes an honest archive of your everyday life.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
