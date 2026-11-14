export function SectionNoteForRoad() {
  return (
    <section
      id="note-for-the-road"
      className="relative w-full bg-[#30483D] overflow-hidden min-h-[750px] lg:h-[750px] text-[#F4EFE4]"
    >
      <div className="relative w-full max-w-[1366px] h-full mx-auto">
        {/* Eyebrow: 04 / A NOTE FOR THE ROAD (x=110, y=3865 / offset y=97) */}
        <div className="absolute left-6 lg:left-[110px] top-[75px] lg:top-[97px] flex items-center gap-2">
          <span className="font-public-condensed text-[14px] lg:text-[13px] uppercase tracking-[0.25em] font-semibold text-[#D2A75D]">
            04 /
          </span>
          <span className="font-public-condensed text-[14px] lg:text-[13px] uppercase tracking-[0.25em] font-semibold text-[#F4EFE4]">
            A NOTE FOR THE ROAD
          </span>
        </div>

        {/* Display Headline Quote: lines 1 and 'perfect.' are UPRIGHT cream. Only 'You just have to keep showing up.' is italic gold */}
        <blockquote className="absolute left-6 lg:left-[110px] top-[140px] lg:top-[178px] max-w-[760px] z-10">
          <h2 className="font-instrument text-[48px] sm:text-[68px] lg:text-[88px] leading-[1.0] tracking-tight">
            <span className="text-[#F4EFE4] not-italic block">You don't have to be</span>
            <span className="block whitespace-nowrap">
              <span className="text-[#F4EFE4] not-italic">perfect. </span>
              <span className="text-[#D2A75D] italic">You just have</span>
            </span>
            <span className="text-[#D2A75D] italic block">to keep showing up.</span>
          </h2>
        </blockquote>

        {/* Hairline Divider under quote (x=109..448, y=4257 / offset y=489) */}
        <div
          className="absolute left-6 lg:left-[109px] top-[460px] lg:top-[489px] w-[340px] max-w-[calc(100%-48px)] h-px bg-[#F4EFE4]/35 pointer-events-none"
          aria-hidden="true"
        />

        {/* Subtitle Paragraph: wraps as 'Small steps, written down, become progress / you can see.' via max-w-[315px] */}
        <p className="absolute left-6 lg:left-[109px] top-[485px] lg:top-[519px] font-public-sans text-[15px] leading-[22px] text-[#F4EFE4]/90 max-w-[315px]">
          Small steps, written down, become progress you can see.
        </p>

        {/* Tilted Date Stamp Box (x=107..266, y=4374 / offset y=606, tilted -5.4deg) */}
        <div
          className="absolute left-6 lg:left-[107px] top-[575px] lg:top-[606px] px-3.5 py-1.5 border border-[#D2A75D]/80 -rotate-[5.4deg] inline-block pointer-events-none select-none"
          aria-hidden="true"
        >
          <span className="font-public-condensed text-[14px] lg:text-[12px] uppercase tracking-[0.24em] font-medium text-[#D2A75D]">
            DATE STAMP / ------
          </span>
        </div>

        {/* Hidden Developer Note */}
        {/* DEV NOTE: QUOTE APPEARS LINE BY LINE / FUTURE IMPLEMENTATION (kept hidden in finished static state) */}

        {/* Tilted Kraft Tag: KEEP THE WIDER VIEW IN SIGHT ↗ (x=1077..1326, y=4434 / offset y=666, tilted 2.5deg) */}
        {/* Per instruction: Visible across all breakpoints (repositioned on mobile, not hidden) */}
        <div
          className="absolute flex items-center justify-center left-6 sm:left-auto right-auto sm:right-6 lg:right-auto lg:left-[1077px] top-[640px] lg:top-[666px] w-[250px] h-[53px] bg-[#D2A75D] text-[#172536] rotate-[2.5deg] shadow-sm select-none"
          aria-hidden="true"
        >
          <span className="font-public-condensed text-[14px] lg:text-[13px] font-bold uppercase tracking-[0.2em] flex items-center gap-1.5">
            <span>KEEP THE WIDER VIEW IN SIGHT</span>
            <span aria-hidden="true">↗</span>
          </span>
        </div>

        {/* Torn Paper Scrap along the bottom right edge (x=755..1366, y=739..750) */}
        <svg
          className="absolute hidden lg:block bottom-0 right-0 w-[611px] h-[15px] pointer-events-none z-10"
          viewBox="0 0 611 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M0,10 L25,7 L55,5 L85,4 L115,2 L145,4 L175,6 L205,8 L235,7 L265,4 L295,1 L325,3 L355,4 L385,6 L415,5 L445,4 L475,2 L505,3 L535,5 L565,7 L595,5 L611,6 L611,15 L0,15 Z"
            fill="#F4EFE4"
          />
        </svg>
      </div>
    </section>
  )
}
