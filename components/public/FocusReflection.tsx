export function FocusReflection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[#172536] via-[#1a2d42] to-[#2e4760] text-[#F4EFE4] pt-[104px] pb-[104px] border-b border-[#F4EFE4]/15">
      {/* Background Star Specks */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <svg
          viewBox="0 0 1366 540"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover"
          aria-hidden="true"
        >
          <circle cx="180" cy="120" r="1" fill="#F4EFE4" opacity="0.6" />
          <circle cx="340" cy="80" r="1.5" fill="#D2A75D" opacity="0.7" />
          <circle cx="520" cy="160" r="1" fill="#F4EFE4" opacity="0.5" />
          <circle cx="720" cy="90" r="1" fill="#F4EFE4" opacity="0.4" />
          <circle cx="890" cy="220" r="1.5" fill="#D2A75D" opacity="0.6" />
          <circle cx="1060" cy="130" r="1" fill="#F4EFE4" opacity="0.7" />
          <circle cx="1220" cy="70" r="1" fill="#F4EFE4" opacity="0.5" />
          <circle cx="280" cy="380" r="1" fill="#F4EFE4" opacity="0.4" />
          <circle cx="480" cy="440" r="1.5" fill="#D2A75D" opacity="0.5" />
          <circle cx="950" cy="420" r="1" fill="#F4EFE4" opacity="0.6" />
          <circle cx="1150" cy="360" r="1.5" fill="#F4EFE4" opacity="0.5" />
        </svg>
      </div>

      {/* Right-Side Celestial Orbit Ellipses & Planet Bead */}
      <div className="absolute right-[-20px] sm:right-[20px] lg:right-[60px] top-[70px] w-[540px] sm:w-[640px] lg:w-[740px] h-[360px] pointer-events-none z-0">
        <svg
          viewBox="0 0 740 360"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-hidden="true"
        >
          <g transform="rotate(-18 370 180)">
            {/* Outer Ellipse */}
            <ellipse
              cx="370"
              cy="180"
              rx="340"
              ry="120"
              stroke="#F4EFE4"
              strokeOpacity="0.22"
              strokeWidth="1"
            />
            {/* Inner Ellipse */}
            <ellipse
              cx="370"
              cy="180"
              rx="290"
              ry="95"
              stroke="#F4EFE4"
              strokeOpacity="0.22"
              strokeWidth="1"
            />
            {/* Planet Bead on Inner Ellipse */}
            <circle cx="80" cy="180" r="3.5" fill="#B68A53" />
          </g>
        </svg>
      </div>

      {/* Main Content Container */}
      <div className="max-w-[1202px] mx-auto px-4 sm:px-6 lg:px-0 relative z-10">
        {/* Eyebrow */}
        <span className="font-public-condensed text-xs uppercase tracking-[0.25em] font-semibold text-[#B68A53] block">
          A NOTE FOR THE MARGIN / 03
        </span>

        {/* Heading in Italiana */}
        <h2 className="font-public-display text-5xl sm:text-7xl lg:text-[104px] text-[#F4EFE4] font-normal leading-[1.04] tracking-tight mt-7 max-w-4xl">
          Give one thing your
          <br />
          full attention.
        </h2>

        {/* Tilted Cream Paper Slip */}
        <div className="mt-8 sm:mt-11 inline-block rotate-[-1.5deg]">
          <div className="bg-[#F4EFE4] px-4 sm:px-5 py-2 sm:py-2.5 rounded-[1px] shadow-md border border-[#dcd4c3]">
            <span className="font-public-hand text-base sm:text-lg text-[#172536] font-medium tracking-wide">
              the rest can wait a little.
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
