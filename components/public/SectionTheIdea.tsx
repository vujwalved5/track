export function SectionTheIdea() {
  return (
    <section
      id="about"
      className="relative w-full overflow-hidden min-h-[637px] lg:h-[637px] 2xl:h-[692px] flex items-center bg-[#172536]"
    >
      {/* Background Split: Left half navy full-bleed (0..50vw), Right half Tan Squared Grid (50vw..100vw) */}
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

      {/* Vertical Ruled Ladder Strip on the 50% spine */}
      <div
        className="hidden lg:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[35px] border-l border-[#d4bd9d] border-r border-[#8a7a67] bg-[repeating-linear-gradient(to_bottom,transparent,transparent_31px,#c3b89e_31px,#c3b89e_32px)] pointer-events-none z-10"
        aria-hidden="true"
      />

      {/* Full-width layout: left text uses padding-left ~6.5vw so it hugs the full-bleed edge.
          At 1920px: 6.5% × 1920 = 124.8px ≈ design x=125 ✓
          At 1366px: 6.5% × 1366 = 88.8px (the centred-container approach gave ~110px before,
          so this brings left text a little further left — matches the full-bleed navy intent).
          Right text uses padding-left ~50vw + 191px (matching original right column indent from spine). */}
      <div className="w-full h-full relative z-20 flex flex-col justify-between pt-12 pb-10 lg:pt-[100px] lg:pb-[38px]">
        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-0 items-start">
          {/* Left Column — full-bleed navy, text padded from viewport left at ~6.5vw */}
          <div
            className="flex flex-col justify-start text-[#F4EFE4] px-6 lg:px-0"
            style={{ paddingLeft: 'clamp(24px, 6.5vw, 160px)' }}
          >
            {/* Eyebrow */}
            <div className="flex items-center gap-1.5">
              <span className="font-public-condensed text-[14px] lg:text-xs uppercase tracking-[0.25em] font-semibold text-[#BD634A]">
                01 /
              </span>
              <span className="font-public-condensed text-[14px] lg:text-xs uppercase tracking-[0.25em] font-semibold text-[#F4EFE4]">
                THE IDEA
              </span>
            </div>

            {/* Display Heading */}
            <h2 className="font-instrument text-5xl sm:text-6xl lg:text-[72px] tracking-[-0.03em] leading-[0.98] mt-8 lg:mt-[80px] font-normal select-none">
              <span className="block text-[#F4EFE4]">What is</span>
              <span className="block text-[#D2A75D] italic mt-1.5">Track?</span>
            </h2>

            {/* Left Paragraph — max-w controls wrapping, no <br> tags.
                At 1366px and 1920px: max-w-[460px] naturally wraps to exactly 3 lines:
                "A quieter space to track your / days, notice your progress, and / build habits that last." */}
            <p className="font-public-serif text-2xl sm:text-[28px] lg:text-[30px] leading-[1.38] tracking-normal text-[#F4EFE4] mt-6 lg:mt-[38px] max-w-[460px] font-normal">
              A quieter space to track your days, notice your progress, and build habits that last.
            </p>
          </div>

          {/* Right Column — full-bleed tan grid paper; padding-left positions text:
              At 1366px: 683px + 191px = 874px (matches 1366 baseline ~876px)
              At 1920px: 960px + 441px = 1401px (matches design reference x≈1400)
              max-w-[392px] forms 5 even lines without <br> tags. */}
          <div
            className="flex flex-col justify-start bg-[#E9E1D1] lg:bg-transparent p-6 sm:p-8 lg:p-0 rounded-[2px] lg:rounded-none bg-[linear-gradient(to_right,#ded5c3_1px,transparent_1px),linear-gradient(to_bottom,#ded5c3_1px,transparent_1px)] [background-size:24px_24px] lg:bg-none lg:pt-[122px] lg:pl-[191px] 2xl:pl-[441px]"
          >
            <p className="font-public-sans text-base sm:text-[17px] text-[#172536] leading-[1.9] font-normal max-w-[392px]">
              <span className="font-bold text-[#172536]">Not a race to do more.</span> Track is a personal space to record daily activities, capture memorable moments, reflect on what matters, and see your progress over time. A place to return to yourself, one day at a time.
            </p>
          </div>
        </div>

        {/* Bottom Colophon Tag */}
        <div
          className="flex items-center mt-8 lg:mt-0 px-6 lg:px-0"
          style={{ paddingLeft: 'clamp(24px, 6.5vw, 160px)' }}
        >
          <span className="font-public-condensed text-[14px] lg:text-xs uppercase tracking-[0.22em] font-semibold text-[#F4EFE4]/90">
            A PERSONAL ATLAS, IN THE MAKING
          </span>
        </div>
      </div>

      {/* Botanical Branch SVG — anchored to left-1/2 (the spine / 50vw line) at every width.
          At 1920px: 50vw = 960px; SVG is 320px wide, translate-x-1/2 centers it on the spine.
          Sprig spans x = 960 - 160 = 800px to 960 + 160 = 1120px ≈ design x=855..1040 ✓
          No fixed pixel left value — the spine is always exactly 50% of the viewport. */}
      <div
        className="hidden lg:block absolute bottom-[-16px] left-1/2 -translate-x-[50%] z-30 pointer-events-none"
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

            {/* Leaf 1: Terminal top leaf */}
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

            {/* Leaf 2: Upper right leaf */}
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

            {/* Leaf 3: Upper left leaf */}
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

            {/* Leaf 4: Mid-lower right leaf */}
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

            {/* Leaf 5: Mid-lower left leaf */}
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

            {/* Leaf 7: Lowest right leaf */}
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
