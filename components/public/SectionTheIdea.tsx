export function SectionTheIdea() {
  return (
    <section
      id="about"
      className="relative w-full overflow-hidden min-h-[637px] lg:h-[637px] flex items-center bg-[#172536]"
    >
      {/* Background Split: Left half is Navy (#172536, 0..683), Right half is Tan Squared Grid Paper (#E9E1D1, 683..1366) */}
      <div
        className="hidden lg:block absolute top-0 bottom-0 left-0 w-1/2 bg-[#172536] z-0"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[#172536]" />
      </div>
      <div
        className="hidden lg:block absolute top-0 bottom-0 left-1/2 right-0 bg-[#E9E1D1] bg-[linear-gradient(to_right,#ded5c3_1px,transparent_1px),linear-gradient(to_bottom,#ded5c3_1px,transparent_1px)] [background-size:24px_24px] z-0"
        aria-hidden="true"
      />

      {/* Vertical Ruled Ladder Strip spanning x=665..700 (w=35px, centered on x=683 screen divider) with 32px rungs */}
      <div
        className="hidden lg:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[35px] border-l border-[#d4bd9d] border-r border-[#8a7a67] bg-[repeating-linear-gradient(to_bottom,transparent,transparent_31px,#c3b89e_31px,#c3b89e_32px)] pointer-events-none z-10"
        aria-hidden="true"
      />

      {/* Main Content Container matching max-w-[1202px] */}
      <div className="w-full max-w-[1202px] mx-auto px-6 lg:px-0 h-full relative z-20 flex flex-col justify-between pt-12 pb-10 lg:pt-[100px] lg:pb-[38px]">
        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-0 items-start">
          {/* Left Column (on Navy #172536, starting at exact design x=110) */}
          <div className="lg:col-span-6 flex flex-col justify-start text-[#F4EFE4] lg:pl-[28px]">
            {/* Eyebrow at design page y=1064..1071 */}
            <div className="flex items-center gap-1.5">
              <span className="font-public-condensed text-xs uppercase tracking-[0.25em] font-semibold text-[#BD634A]">
                01 /
              </span>
              <span className="font-public-condensed text-xs uppercase tracking-[0.25em] font-semibold text-[#F4EFE4]">
                THE IDEA
              </span>
            </div>

            {/* Display Heading: Two stacked lines ("What is" / "Track?") starting at exact design page y=1168 */}
            <h2 className="font-instrument text-5xl sm:text-6xl lg:text-[72px] tracking-[-0.03em] leading-[0.98] mt-[80px] font-normal select-none">
              <span className="block text-[#F4EFE4]">What is</span>
              <span className="block text-[#D2A75D] italic mt-1.5">Track?</span>
            </h2>

            {/* Left Paragraph in Fraunces 400 regular serif, cream, normal letter-spacing, 3 lines, design copy only starting at exact design page y=1358 */}
            <p className="font-public-serif text-2xl sm:text-[28px] lg:text-[30px] leading-[1.38] tracking-normal text-[#F4EFE4] mt-[38px] max-w-[490px] font-normal">
              A quieter space to track your days,<br />
              notice your progress, and build habits<br />
              that last.
            </p>
          </div>

          {/* Right Column (on Tan Squared Grid Paper, starting at exact design x=868, y=1196) */}
          <div className="lg:col-span-6 flex flex-col justify-start lg:pl-[191px] lg:pt-[122px]">
            <p className="font-public-sans text-base sm:text-[17px] text-[#172536] leading-[1.9] font-normal w-[392px] max-w-[392px]">
              <span className="font-bold text-[#172536]">Not a race to do more.</span> Track is a personal space<br className="hidden lg:inline" />
              to record daily activities, capture<br className="hidden lg:inline" />
              memorable moments, reflect on what<br className="hidden lg:inline" />
              matters, and see your progress over time. A<br className="hidden lg:inline" />
              place to return to yourself, one day at a time.
            </p>
          </div>
        </div>

        {/* Bottom Colophon Tag in cream at exact design page y=1557 */}
        <div className="lg:pl-[28px] flex items-center">
          <span className="font-public-condensed text-xs uppercase tracking-[0.22em] font-semibold text-[#F4EFE4]/90">
            A PERSONAL ATLAS, IN THE MAKING
          </span>
        </div>
      </div>

      {/* Botanical Branch SVG Illustration crossing the divider at bottom center */}
      <div
        className="hidden lg:block absolute bottom-[-16px] left-[683px] -translate-x-[50%] z-30 pointer-events-none"
        aria-hidden="true"
      >
        <svg
          width="320"
          height="340"
          viewBox="0 0 320 340"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Hand-drawn botanical branch crossing dividing line"
          role="img"
        >
          <defs>
            <filter id="branch-shadow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="4" dy="8" stdDeviation="8" floodColor="#000000" floodOpacity="0.45" />
            </filter>
          </defs>

          <g filter="url(#branch-shadow)">
            {/* Main curved central stem rising from bottom divider up past ladder (centered at x=160 = page x=683) */}
            <path
              d="M160 340 C 158 265, 152 175, 142 85"
              stroke="#1e3328"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* 7 Leaves: wider spread matching x=552..759 in design, dark leaf edges, soft shadow */}

            {/* Leaf 1: Terminal top leaf (tilted slightly left, upright) */}
            <g transform="translate(142, 85) rotate(-14)">
              <path
                d="M0 0 C -16 -20, -18 -44, 0 -60 C 18 -44, 16 -20, 0 0Z"
                fill="#7e9680"
                stroke="#1e3328"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path d="M0 0 C 0 -20, -1 -44, 0 -56" stroke="#1e3328" strokeWidth="1.1" strokeLinecap="round" />
            </g>

            {/* Leaf 2: Upper right leaf (crossing into tan grid, reaching page x=740) */}
            <g transform="translate(150, 135) rotate(54)">
              <path
                d="M0 0 C -18 -24, -22 -56, 0 -80 C 22 -56, 18 -24, 0 0Z"
                fill="#7e9680"
                stroke="#1e3328"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path d="M0 0 C 0 -26, 0 -56, 0 -76" stroke="#1e3328" strokeWidth="1.1" strokeLinecap="round" />
            </g>

            {/* Leaf 3: Upper left leaf (extending wide into navy, reaching page x=560) */}
            <g transform="translate(147, 165) rotate(-58)">
              <path
                d="M0 0 C -22 -26, -26 -60, 0 -86 C 26 -60, 22 -26, 0 0Z"
                fill="#7e9680"
                stroke="#1e3328"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path d="M0 0 C 0 -28, -1 -60, 0 -82" stroke="#1e3328" strokeWidth="1.1" strokeLinecap="round" />
            </g>

            {/* Leaf 4: Mid-lower right leaf (pointing down-right, crossing divider to page x=755) */}
            <g transform="translate(156, 215) rotate(45)">
              <path
                d="M0 0 C -22 -28, -26 -64, 0 -90 C 26 -64, 22 -28, 0 0Z"
                fill="#7e9680"
                stroke="#1e3328"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path d="M0 0 C 0 -30, 1 -64, 0 -86" stroke="#1e3328" strokeWidth="1.1" strokeLinecap="round" />
            </g>

            {/* Leaf 5: Mid-lower left leaf (pointing down-left, reaching page x=552) */}
            <g transform="translate(154, 245) rotate(-50)">
              <path
                d="M0 0 C -22 -28, -26 -64, 0 -90 C 26 -64, 22 -28, 0 0Z"
                fill="#7e9680"
                stroke="#1e3328"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path d="M0 0 C 0 -28, -1 -60, 0 -86" stroke="#1e3328" strokeWidth="1.1" strokeLinecap="round" />
            </g>

            {/* Leaf 6: Lowest left leaf */}
            <g transform="translate(157, 285) rotate(-64)">
              <path
                d="M0 0 C -18 -22, -20 -50, 0 -70 C 20 -50, 18 -22, 0 0Z"
                fill="#7e9680"
                stroke="#1e3328"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path d="M0 0 C 0 -24, 0 -50, 0 -66" stroke="#1e3328" strokeWidth="1.1" strokeLinecap="round" />
            </g>

            {/* Leaf 7: Lowest right leaf (crossing well into the right panel to page x=759) */}
            <g transform="translate(160, 275) rotate(64)">
              <path
                d="M0 0 C -20 -24, -24 -56, 0 -80 C 24 -56, 20 -24, 0 0Z"
                fill="#7e9680"
                stroke="#1e3328"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path d="M0 0 C 0 -26, 0 -56, 0 -76" stroke="#1e3328" strokeWidth="1.1" strokeLinecap="round" />
            </g>
          </g>
        </svg>
      </div>
    </section>
  )
}
