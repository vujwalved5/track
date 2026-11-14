import Image from 'next/image'
import Link from 'next/link'

export function HomeHero() {
  return (
    <section className="relative w-full overflow-hidden bg-[#F4EFE4] min-h-[870px] lg:h-[870px] bg-[radial-gradient(circle,#e9e2d6_0.65px,transparent_0.65px)] [background-size:6px_6px]">
      {/* Vertical 'FIELD NOTES / 01' at exact design coordinates (x=19..26, y=173..275 rel to hero) */}
      <div
        className="hidden lg:block absolute left-[19px] top-[173px] font-public-condensed text-[11px] uppercase tracking-[0.25em] text-[#60432F] [writing-mode:vertical-rl] rotate-180 font-semibold select-none pointer-events-none z-20"
        aria-hidden="true"
      >
        FIELD NOTES / 01
      </div>

      <div className="w-full max-w-[1202px] mx-auto px-6 lg:px-0 h-full relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start h-full">
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-6 z-10 lg:pt-[116px] flex flex-col">
            {/* Eyebrow with short terracotta rule at exact design y=116..128 (rel to hero) */}
            <div className="flex items-center gap-3">
              <span className="w-[35px] h-px bg-[#BD634A]" aria-hidden="true" />
              <span className="font-public-condensed text-[14px] lg:text-xs uppercase tracking-[0.25em] font-semibold text-[#60432F]">
                YOUR PERSONAL FIELD GUIDE / VOL. 01
              </span>
            </div>

            {/* Display Heading - 3 stacked lines with Instrument Serif starting at exact design y=199 rel to hero */}
            <h1 className="font-instrument select-none font-normal mt-[36px]">
              <span className="block text-[#172536] text-6xl sm:text-7xl lg:text-[158px] leading-[0.88] tracking-[-0.02em]">
                Make
              </span>
              <span className="block text-[#172536] text-6xl sm:text-7xl lg:text-[143px] leading-[0.88] tracking-[-0.03em] -mt-[16px] ml-0.5 sm:ml-1">
                Every Day
              </span>
              <span className="block text-[#BD634A] italic text-6xl sm:text-7xl lg:text-[166px] leading-[0.88] tracking-[-0.015em] -mt-[19px] ml-1.5 sm:ml-2">
                Count.
              </span>
            </h1>

            {/* Subparagraph at exact design y=598 rel to hero */}
            <p className="font-public-sans text-base sm:text-[17px] text-[#172536]/80 max-w-[430px] leading-[1.55] -mt-[10px]">
              An open invitation to pay attention. To the little things, the long way round, and all the days in between.
            </p>

            {/* CTA Buttons at exact design y=674 rel to hero */}
            <div className="flex flex-wrap items-center gap-3.5 mt-[31px]">
              <Link
                href="/login"
                className="press-btn inline-flex items-center justify-center gap-2 w-[218px] h-[46px] bg-[#172536] text-[#F4EFE4] font-public-condensed text-[14px] lg:text-xs uppercase tracking-[0.2em] font-semibold rounded shadow-sm hover:bg-[#172536]/90 transition-colors"
              >
                <span>OPEN YOUR JOURNAL</span>
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 11 11"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="shrink-0"
                >
                  <path d="M2.5 8.5L8.5 2.5M3.5 2.5H8.5V7.5" />
                </svg>
              </Link>
              <Link
                href="/focus-room"
                className="press-btn inline-flex items-center justify-center gap-2.5 w-[212px] h-[46px] bg-transparent text-[#172536] border border-[#172536] font-public-condensed text-[14px] lg:text-xs uppercase tracking-[0.2em] font-bold rounded hover:bg-[#172536]/5 transition-colors"
              >
                <span>EXPLORE FOCUS ROOM</span>
                <svg
                  width="13"
                  height="10"
                  viewBox="0 0 13 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="shrink-0"
                >
                  <path d="M1 5h11M8 1l4 4-4 4" />
                </svg>
              </Link>
            </div>

            {/* Bottom scroll prompt at exact design y=779 rel to hero in dark navy */}
            <div className="flex items-center gap-4 mt-[56px] pt-1 text-[#172536]">
              <span className="font-public-condensed text-[14px] lg:text-[11px] uppercase tracking-[0.25em] font-bold">
                A MAP OF YOUR DAYS
              </span>
              <div className="w-[45px] h-px bg-[#172536]/25" aria-hidden="true" />
              <span className="font-public-condensed text-[14px] lg:text-[11px] uppercase tracking-[0.25em] font-bold flex items-center gap-1.5">
                <span>SCROLL TO EXPLORE</span>
                <svg
                  width="9"
                  height="11"
                  viewBox="0 0 9 11"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="shrink-0"
                >
                  <path d="M4.5 1v9M1 6.5l3.5 3.5 3.5-3.5" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Tall Panel: Cup-and-Magazine Photo bleeding off the right at x=710 */}
      <div className="relative lg:absolute lg:top-0 lg:bottom-0 lg:left-[710px] lg:right-0 h-[450px] lg:h-[870px] bg-[#211b16] overflow-hidden z-10 mt-8 lg:mt-0">
        <Image
          src="/welcome/hero-desk-crop.jpg"
          alt="Coffee mug beside an open magazine in soft daylight, capturing quiet morning focus."
          fill
          priority
          className="object-cover object-center"
          sizes="(max-width: 1024px) 100vw, 656px"
        />

        {/* Thin inset frame line */}
        <div
          className="absolute top-6 bottom-6 left-6 right-6 border border-[#F4EFE4]/30 pointer-events-none z-10"
          aria-hidden="true"
        />

        {/* Tilted Polaroid of landscape at top right matching reference coordinates (clipped at x=1366 edge) */}
        <div
          className="absolute top-[5px] right-[-36px] bg-[#ede8df] p-3 pb-7 shadow-xl rounded-[2px] w-[295px] rotate-[7.5deg] z-20 lift-card"
        >
          <div className="relative w-full h-[210px] bg-[#172536]/10 overflow-hidden">
            <Image
              src="/welcome/hero-mountain.jpg"
              alt="Misty landscape study"
              fill
              className="object-cover grayscale"
              sizes="295px"
            />
          </div>
          <div className="font-public-condensed text-[14px] lg:text-[10px] uppercase tracking-[0.25em] text-[#172536] text-center font-bold mt-3">
            LANDSCAPE STUDY / 01
          </div>
        </div>

        {/* Narrower and taller Tilted Taped Paper Note matching reference coordinates: x=784 (left: 74px in panel), y=442 rel to hero */}
        <div
          className="absolute top-[442px] left-[74px] bg-[#F4EFE4]/95 backdrop-blur-[0.5px] p-7 pt-8 shadow-2xl rounded-[2px] border border-[#B68A53]/25 w-[316px] min-h-[345px] rotate-[-5deg] z-30 lift-card"
        >
          {/* Washi tape strip */}
          <div
            className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-20 h-6 bg-[#c29b63] opacity-85 rotate-[-2deg] shadow-xs"
            aria-hidden="true"
          />
          <div className="font-public-condensed text-[14px] lg:text-[11px] uppercase tracking-[0.25em] text-[#BD634A] font-semibold mb-3">
            FIELD ENTRY — OPEN PAGE
          </div>
          <h3 className="font-instrument text-[37px] leading-[1.05] text-[#172536] font-medium mb-5 tracking-[-0.02em]">
            Begin where<br />you are.
          </h3>
          {/* Three ruled lines spaced out naturally */}
          <div className="space-y-6 my-6" aria-hidden="true">
            <div className="w-full h-px bg-[#172536]/15" />
            <div className="w-full h-px bg-[#172536]/15" />
            <div className="w-full h-px bg-[#172536]/15" />
          </div>
          <div className="flex items-center justify-between text-[#BD634A] mt-5">
            <span className="font-public-hand text-2xl">the ordinary is enough</span>
            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="shrink-0"
            >
              <path d="M3 10L10 3M4 3h6v6" />
            </svg>
          </div>
        </div>

        {/* Vertical 'OBSERVATIONS FROM THE EVERYDAY / TRACK' inside frame at right photo edge at exact design y=502 rel to hero */}
        <div
          className="hidden lg:block absolute right-[32px] top-[502px] font-public-condensed text-[11px] uppercase tracking-[0.28em] text-white [writing-mode:vertical-rl] rotate-180 font-semibold select-none pointer-events-none z-20 whitespace-nowrap leading-none"
          aria-hidden="true"
        >
          OBSERVATIONS FROM THE EVERYDAY / TRACK
        </div>
      </div>
    </section>
  )
}
