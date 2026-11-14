export function SectionTheLongView() {
  return (
    <section
      id="trace"
      className="w-full bg-[#DFE4D9] border-b border-[#172536]/10 relative overflow-hidden"
      style={{
        minHeight: '968px',
        backgroundImage:
          'linear-gradient(to right, rgba(23, 37, 54, 0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(23, 37, 54, 0.07) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}
    >
      <div className="w-full max-w-[1366px] mx-auto px-4 sm:px-8 lg:pl-[82px] lg:pr-[72px] pt-[111px] pb-[88px] relative z-10">
        {/* Section Header: Eyebrow + 2-line Heading + Right Subtitle */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            {/* Eyebrow at y=2914 */}
            <div className="flex items-center gap-2 mb-[23px]">
              <span className="font-public-condensed text-xs uppercase tracking-[0.25em] font-semibold text-[#BD634A]">
                03 /
              </span>
              <span className="font-public-condensed text-xs uppercase tracking-[0.25em] font-semibold text-[#172536]">
                THE LONG VIEW
              </span>
            </div>

            {/* Display Heading at y=2961 */}
            <h2 className="font-instrument text-6xl sm:text-7xl lg:text-[92px] leading-[0.92] text-[#172536] tracking-[-0.02em]">
              <span className="block">Your days</span>
              <span className="block italic mt-[2px]">leave a trace.</span>
            </h2>
          </div>

          {/* Right Subtitle at x=1030..1294 */}
          <div className="max-w-[260px] lg:mb-[6px] text-[#172536]/80 font-public-sans text-[13.5px] leading-relaxed">
            <p>
              Not every step feels significant while you take it. Look back, and a path begins to appear.
            </p>
          </div>
        </div>

        {/* Route Diagram Container */}
        <div className="w-full relative mt-4 overflow-x-auto pb-4">
          <div className="min-w-[900px] lg:min-w-full">
            <svg
              viewBox="0 0 1212 480"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto text-[#172536]"
              aria-label="Route diagram showing 6 milestone nodes along a path"
              role="img"
            >
              <defs>
                {/* Soft shadow for botanical leaves */}
                <filter id="leaf-shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#172536" floodOpacity="0.18" />
                </filter>
              </defs>

              {/* Start + mark */}
              <g stroke="#30483D" strokeWidth="1.8" strokeLinecap="round">
                <line x1="24" y1="384" x2="24" y2="408" />
                <line x1="12" y1="396" x2="36" y2="396" />
              </g>

              {/* Winding Dashed Route Path through 6 Nodes */}
              <path
                d="M 42 375 C 70 370, 95 362, 125 342 C 165 315, 205 235, 252 225 C 298 215, 332 245, 385 292 C 435 338, 470 348, 510 332 C 550 316, 592 232, 658 206 C 715 184, 760 220, 808 268 C 852 312, 895 324, 935 308 C 975 292, 1018 228, 1075 182 C 1115 150, 1142 146, 1170 148"
                stroke="#30483D"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeDasharray="6 6"
              />

              {/* ========================================================
                  MILESTONES & NODES (3 Labeled Milestones, 6 Total Nodes)
                  ======================================================== */}

              {/* Node 1 (Far Left, near start) */}
              <circle cx="42" cy="375" r="10.5" stroke="#30483D" strokeWidth="2.2" fill="#DFE4D9" />

              {/* Milestone 1 Text & Botanical Sprout */}
              <g transform="translate(105, 316)">
                {/* Milestone 1 Text */}
                <text
                  x="0"
                  y="0"
                  fill="#172536"
                  className="font-public-condensed text-[11px] font-bold uppercase"
                  letterSpacing="0.2em"
                >
                  A SMALL BEGINNING
                </text>
                {/* Tilted ground line */}
                <line x1="2" y1="32" x2="56" y2="42" stroke="#30483D" strokeWidth="1.2" strokeLinecap="round" />
                {/* Left stem & oval leaf */}
                <line x1="24" y1="36" x2="16" y2="24" stroke="#30483D" strokeWidth="1.2" strokeLinecap="round" />
                <ellipse
                  cx="14"
                  cy="14"
                  rx="6.5"
                  ry="12"
                  transform="rotate(-15 14 14)"
                  fill="#899783"
                  stroke="#30483D"
                  strokeWidth="1.2"
                  filter="url(#leaf-shadow)"
                />
                {/* Right stem & oval leaf */}
                <line x1="24" y1="36" x2="34" y2="24" stroke="#30483D" strokeWidth="1.2" strokeLinecap="round" />
                <ellipse
                  cx="36"
                  cy="14"
                  rx="6.5"
                  ry="12"
                  transform="rotate(15 36 14)"
                  fill="#899783"
                  stroke="#30483D"
                  strokeWidth="1.2"
                  filter="url(#leaf-shadow)"
                />
              </g>

              {/* Node 2 (First Peak) */}
              <circle cx="252" cy="225" r="10.5" stroke="#30483D" strokeWidth="2.2" fill="#DFE4D9" />

              {/* Handwritten Marginalia 1 above first peak */}
              <text
                x="195"
                y="152"
                fill="#30483D"
                className="font-public-hand text-[22px]"
                transform="rotate(-5 195 152)"
              >
                one thing at a time
              </text>

              {/* Botanical Accent 2 (Leaves between Node 2 and Node 3) */}
              <g transform="translate(355, 245)" filter="url(#leaf-shadow)">
                <line x1="16" y1="28" x2="8" y2="18" stroke="#30483D" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="16" y1="28" x2="26" y2="18" stroke="#30483D" strokeWidth="1.2" strokeLinecap="round" />
                <ellipse
                  cx="6"
                  cy="9"
                  rx="6"
                  ry="12"
                  transform="rotate(-22 6 9)"
                  fill="#899783"
                  stroke="#30483D"
                  strokeWidth="1.2"
                />
                <ellipse
                  cx="28"
                  cy="9"
                  rx="6"
                  ry="12"
                  transform="rotate(22 28 9)"
                  fill="#899783"
                  stroke="#30483D"
                  strokeWidth="1.2"
                />
              </g>

              {/* Milestone 2 Label above Node 3 */}
              <text
                x="442"
                y="204"
                fill="#172536"
                className="font-public-condensed text-[11px] font-bold uppercase"
                letterSpacing="0.2em"
              >
                NOTICE THE SHIFT
              </text>

              {/* Node 3 (Trough / Valley) */}
              <circle cx="465" cy="336" r="10.5" stroke="#30483D" strokeWidth="2.2" fill="#DFE4D9" />

              {/* Node 4 (Second Peak / Slope) */}
              <circle cx="630" cy="216" r="10.5" stroke="#30483D" strokeWidth="2.2" fill="#DFE4D9" />

              {/* Botanical Accent 3 (Leaves between Node 4 and Node 5) */}
              <g transform="translate(705, 255)" filter="url(#leaf-shadow)">
                <line x1="16" y1="28" x2="8" y2="18" stroke="#30483D" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="16" y1="28" x2="26" y2="18" stroke="#30483D" strokeWidth="1.2" strokeLinecap="round" />
                <ellipse
                  cx="6"
                  cy="9"
                  rx="6"
                  ry="12"
                  transform="rotate(-22 6 9)"
                  fill="#899783"
                  stroke="#30483D"
                  strokeWidth="1.2"
                />
                <ellipse
                  cx="28"
                  cy="9"
                  rx="6"
                  ry="12"
                  transform="rotate(22 28 9)"
                  fill="#899783"
                  stroke="#30483D"
                  strokeWidth="1.2"
                />
              </g>

              {/* Node 5 (Second Trough / Valley) */}
              <circle cx="818" cy="278" r="10.5" stroke="#30483D" strokeWidth="2.2" fill="#DFE4D9" />

              {/* Handwritten Marginalia 2 below second valley */}
              <text
                x="655"
                y="382"
                fill="#30483D"
                className="font-public-hand text-[22px]"
                transform="rotate(-2 655 382)"
              >
                there's a story here ↗
              </text>

              {/* Milestone 3 Label before Node 6 */}
              <text
                x="948"
                y="152"
                fill="#172536"
                className="font-public-condensed text-[11px] font-bold uppercase"
                letterSpacing="0.2em"
              >
                KEEP GOING
              </text>

              {/* Node 6 (Final Peak / Far Right) */}
              <circle cx="1170" cy="148" r="10.5" stroke="#30483D" strokeWidth="2.2" fill="#DFE4D9" />

              {/* End + mark above Node 6 */}
              <g stroke="#30483D" strokeWidth="1.8" strokeLinecap="round">
                <line x1="1170" y1="102" x2="1170" y2="126" />
                <line x1="1158" y1="114" x2="1182" y2="114" />
              </g>

              {/* Authentic Outlined Compass Rose at Bottom Right */}
              <g transform="translate(1125, 345)">
                {/* Outer circle */}
                <circle cx="30" cy="30" r="28" stroke="#30483D" strokeWidth="1.2" />
                {/* Inner circle */}
                <circle cx="30" cy="30" r="18" stroke="#30483D" strokeWidth="0.8" strokeDasharray="3 3" />

                {/* 4 Needles Outlined */}
                {/* North needle */}
                <polygon points="30,2 33,26 30,30 27,26" stroke="#30483D" strokeWidth="1.1" fill="none" />
                {/* South needle */}
                <polygon points="30,58 33,34 30,30 27,34" stroke="#30483D" strokeWidth="1.1" fill="none" />
                {/* East needle */}
                <polygon points="58,30 34,33 30,30 34,27" stroke="#30483D" strokeWidth="1.1" fill="none" />
                {/* West needle */}
                <polygon points="2,30 26,33 30,30 26,27" stroke="#30483D" strokeWidth="1.1" fill="none" />

                {/* Center dot */}
                <circle cx="30" cy="30" r="2.5" fill="#30483D" />
                {/* Top point dot */}
                <circle cx="30" cy="2" r="1.5" fill="#30483D" />

                {/* North label N */}
                <text
                  x="30"
                  y="-5"
                  textAnchor="middle"
                  fill="#30483D"
                  className="font-public-sans text-[11px] font-semibold"
                >
                  N
                </text>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
