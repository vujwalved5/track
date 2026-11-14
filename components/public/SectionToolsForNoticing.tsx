export function SectionToolsForNoticing() {
  return (
    <section
      id="journal"
      className="w-full bg-[#F4EFE4] border-b border-[#172536]/10 relative overflow-hidden"
      style={{ minHeight: '1196px' }}
    >
            {/* MOBILE 1-COLUMN CARDS (Below 1024px) */}
      <div className="block lg:hidden w-full max-w-[1366px] mx-auto px-6 sm:px-8 pt-14 pb-12">
        {/* Section Header */}
        <div className="flex flex-col gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-public-condensed text-[14px] uppercase tracking-[0.25em] font-semibold text-[#BD634A]">
                02 /
              </span>
              <span className="font-public-condensed text-[14px] uppercase tracking-[0.25em] font-semibold text-[#172536]">
                TOOLS FOR NOTICING
              </span>
            </div>
            <h2 className="font-instrument text-5xl sm:text-7xl leading-[0.94] text-[#172536] tracking-[-0.02em]">
              <span className="block">Four ways to</span>
              <span className="block italic mt-[2px]">find your way.</span>
            </h2>
          </div>
          <div className="max-w-[320px] text-[#172536]/80 font-public-sans text-[14px] leading-relaxed">
            <p>
              A few thoughtful tools for the life unfolding right in front of you. These are illustrative page samples.
            </p>
          </div>
        </div>

        {/* 4 Cards Fluid Column */}
        <div className="flex flex-col items-center gap-8 w-full">
          {/* Card 1: Track */}
          <div
            className="w-full max-w-[420px] h-auto min-h-[580px] bg-[#E6E3D5] border border-[#172536]/15 p-6 sm:p-7 flex flex-col justify-between relative shadow-sm"
            style={{
              clipPath: 'polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 0 100%)',
            }}
          >
            <div>
              <div className="flex items-baseline justify-between mb-8">
                <h3 className="font-instrument text-[40px] sm:text-[44px] leading-none text-[#172536]">
                  Track
                </h3>
                <span className="font-public-condensed text-[14px] uppercase tracking-[0.2em] font-semibold text-[#172536]">
                  RECORD THE DAY
                </span>
              </div>
              <div className="border-t border-[#172536]/20">
                <div className="py-[18px] border-b border-[#172536]/15 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="font-public-condensed text-[14px] font-bold text-[#172536]/70">01</span>
                    <span className="font-instrument text-[19px] text-[#172536]">A morning walk</span>
                  </div>
                  <span className="w-[18px] h-[18px] rounded-full border-[1.5px] border-[#172536]/60 shrink-0" />
                </div>
                <div className="py-[18px] border-b border-[#172536]/15 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="font-public-condensed text-[14px] font-bold text-[#172536]/70">02</span>
                    <span className="font-instrument text-[19px] text-[#172536]">Time to make</span>
                  </div>
                  <span className="w-[18px] h-[18px] rounded-full bg-[#6F8576] border-[1.5px] border-[#6F8576] shrink-0" />
                </div>
                <div className="py-[18px] border-b border-[#172536]/15 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="font-public-condensed text-[14px] font-bold text-[#172536]/70">03</span>
                    <span className="font-instrument text-[19px] text-[#172536]">Something learned</span>
                  </div>
                  <span className="w-[18px] h-[18px] rounded-full border-[1.5px] border-[#172536]/60 shrink-0" />
                </div>
                <div className="py-[18px] border-b border-[#172536]/15 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="font-public-condensed text-[14px] font-bold text-[#172536]/70">04</span>
                    <span className="font-instrument text-[19px] text-[#172536]">A moment to keep</span>
                  </div>
                  <span className="w-[18px] h-[18px] rounded-full border-[1.5px] border-[#172536]/60 shrink-0" />
                </div>
              </div>
            </div>
            <div className="text-right pb-1 mt-6">
              <span className="font-public-hand text-[23px] text-[#30483D] leading-none">
                start with what happened
              </span>
            </div>
          </div>

          {/* Card 2: Charts */}
          <div
            className="w-full max-w-[420px] h-[278px] bg-[#778896] border border-[#172536]/15 p-6 flex flex-col justify-between relative shadow-sm"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(23, 37, 54, 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(23, 37, 54, 0.12) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          >
            <div className="flex items-baseline justify-between mb-4">
              <h3 className="font-instrument text-[36px] sm:text-[40px] leading-none text-[#172536]">Charts</h3>
              <span className="font-public-condensed text-[14px] uppercase tracking-[0.2em] font-semibold text-[#172536]">
                SEE THE PATTERNS
              </span>
            </div>
            <div className="w-full flex-1 flex items-center justify-center">
              <svg viewBox="0 0 340 140" fill="none" className="w-full h-full text-[#172536]" aria-label="Hand-drawn trendline curve on grid" role="img">
                <line x1="10" y1="35" x2="330" y2="35" stroke="#172536" strokeOpacity="0.25" strokeDasharray="3 3" />
                <line x1="10" y1="70" x2="330" y2="70" stroke="#172536" strokeOpacity="0.25" strokeDasharray="3 3" />
                <line x1="10" y1="105" x2="330" y2="105" stroke="#172536" strokeOpacity="0.25" strokeDasharray="3 3" />
                <path d="M 18 95 C 45 92, 60 55, 95 55 C 130 55, 145 88, 180 88 C 215 88, 235 48, 275 48 C 300 48, 315 25, 330 20" stroke="#172536" strokeWidth="3.2" strokeLinecap="round" />
                <circle cx="18" cy="95" r="4.5" fill="#172536" />
                <circle cx="180" cy="88" r="4.5" fill="#172536" />
                <circle cx="330" cy="20" r="4.5" fill="#172536" />
              </svg>
            </div>
          </div>

          {/* Card 4: Write */}
          <div className="w-full max-w-[420px] h-auto min-h-[309px] bg-[#F5EFE4] border border-[#172536]/15 p-6 flex flex-col justify-between shadow-sm">
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="font-instrument text-[36px] sm:text-[40px] leading-none text-[#172536]">Write</h3>
              <span className="font-public-condensed text-[14px] uppercase tracking-[0.2em] font-semibold text-[#172536]">
                KEEP WHAT MATTERS
              </span>
            </div>
            <div className="relative mt-1">
              <div
                className="bg-[#FCFAF5] border border-[#172536]/15 p-4 sm:p-5 shadow-sm transform -rotate-1 origin-top-left"
                style={{
                  backgroundImage: 'repeating-linear-gradient(transparent, transparent 26px, rgba(23, 37, 54, 0.12) 27px)',
                }}
              >
                <div className="border-b border-dashed border-[#172536]/30 pb-2 mb-3">
                  <span className="font-public-condensed text-[14px] uppercase tracking-[0.22em] font-bold text-[#172536]">
                    A PAGE FOR THE UNFINISHED THOUGHT
                  </span>
                </div>
                <p className="font-public-hand text-[21px] text-[#5D5061] leading-[27px] pt-1">
                  Today, I want to remember...
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Ask */}
          <div className="w-full max-w-[420px] h-auto min-h-[520px] bg-[#E4D3C2] border border-[#172536]/15 p-6 sm:p-7 flex flex-col justify-between relative shadow-sm">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[78px] h-[22px] bg-[#CDAE8B] opacity-90 shadow-xs transform -rotate-1 pointer-events-none" />
            <div>
              <div className="flex items-baseline justify-between mb-6 sm:mb-8">
                <h3 className="font-instrument text-[40px] sm:text-[44px] leading-none text-[#172536]">Ask</h3>
                <span className="font-public-condensed text-[14px] uppercase tracking-[0.2em] font-semibold text-[#BD634A]">
                  REFLECT AND EXPLORE
                </span>
              </div>
              <div className="bg-[#F6EDE0] border border-[#172536]/15 p-5 sm:p-6 shadow-sm transform -rotate-1 origin-top-left mt-2">
                <span className="block font-public-condensed text-[14px] uppercase tracking-[0.2em] font-bold text-[#BD634A] mb-3">
                  A QUESTION TO SIT WITH
                </span>
                <h4 className="font-instrument text-[28px] sm:text-[32px] leading-tight text-[#172536] mb-4">
                  What felt different today?
                </h4>
                <div className="w-full border-t border-[#172536]/20 my-4" />
                <p className="font-public-sans text-[14px] text-[#172536]/80 leading-relaxed">
                  Give yourself room for an honest answer. There is no right way to begin.
                </p>
              </div>
            </div>
            <div className="text-right pb-1 mt-6">
              <span className="font-public-hand text-[22px] text-[#BD634A] leading-none">
                look a little closer ↗
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:block w-full max-w-[1366px] mx-auto px-4 sm:px-8 lg:pl-[82px] lg:pr-[72px] pt-[119px] pb-[99px]">
        {/* Section Header: Eyebrow + 2-line Heading + Right Subtitle */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-[74px]">
          <div>
            {/* Eyebrow at y=1726 */}
            <div className="flex items-center gap-2 mb-[18px]">
              <span className="font-public-condensed text-xs uppercase tracking-[0.25em] font-semibold text-[#BD634A]">
                02 /
              </span>
              <span className="font-public-condensed text-xs uppercase tracking-[0.25em] font-semibold text-[#172536]">
                TOOLS FOR NOTICING
              </span>
            </div>

            {/* Display Heading at y=1772 */}
            <h2 className="font-instrument text-6xl sm:text-7xl lg:text-[92px] leading-[0.92] text-[#172536] tracking-[-0.02em]">
              <span className="block">Four ways to</span>
              <span className="block italic mt-[2px]">find your way.</span>
            </h2>
          </div>

          {/* Right Subtitle at x=1040..1294 */}
          <div className="max-w-[254px] lg:mb-[6px] text-[#172536]/80 font-public-sans text-[13.5px] leading-relaxed">
            <p>
              A few thoughtful tools for the life unfolding right in front of you. These are illustrative page samples.
            </p>
          </div>
        </div>

        {/* 4 Cards Layout: 3 Columns (Left Card 1: 420px, Center Stack: 395px, Right Card 3: 358px) */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6 lg:gap-0 w-full">
          {/* Card 1: Track (w=[420px], h=[685px], starts at x=82) */}
          <div
            className="w-full lg:w-[420px] h-[685px] bg-[#E6E3D5] border border-[#172536]/15 p-7 flex flex-col justify-between relative shadow-sm shrink-0"
            style={{
              clipPath: 'polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 0 100%)',
            }}
          >
            <div>
              {/* Card Header */}
              <div className="flex items-baseline justify-between mb-8">
                <h3 className="font-instrument text-[44px] leading-none text-[#172536]">
                  Track
                </h3>
                <span className="font-public-condensed text-[11px] uppercase tracking-[0.2em] font-semibold text-[#172536]">
                  RECORD THE DAY
                </span>
              </div>

              {/* 4 Daily Rows */}
              <div className="border-t border-[#172536]/20">
                {/* Row 01 */}
                <div className="py-[18px] border-b border-[#172536]/15 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="font-public-condensed text-xs font-bold text-[#172536]/70">
                      01
                    </span>
                    <span className="font-instrument text-[19px] text-[#172536]">
                      A morning walk
                    </span>
                  </div>
                  <span className="w-[18px] h-[18px] rounded-full border-[1.5px] border-[#172536]/60 shrink-0" />
                </div>

                {/* Row 02 (Checked) */}
                <div className="py-[18px] border-b border-[#172536]/15 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="font-public-condensed text-xs font-bold text-[#172536]/70">
                      02
                    </span>
                    <span className="font-instrument text-[19px] text-[#172536]">
                      Time to make
                    </span>
                  </div>
                  <span className="w-[18px] h-[18px] rounded-full bg-[#6F8576] border-[1.5px] border-[#6F8576] shrink-0" />
                </div>

                {/* Row 03 */}
                <div className="py-[18px] border-b border-[#172536]/15 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="font-public-condensed text-xs font-bold text-[#172536]/70">
                      03
                    </span>
                    <span className="font-instrument text-[19px] text-[#172536]">
                      Something learned
                    </span>
                  </div>
                  <span className="w-[18px] h-[18px] rounded-full border-[1.5px] border-[#172536]/60 shrink-0" />
                </div>

                {/* Row 04 */}
                <div className="py-[18px] border-b border-[#172536]/15 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="font-public-condensed text-xs font-bold text-[#172536]/70">
                      04
                    </span>
                    <span className="font-instrument text-[19px] text-[#172536]">
                      A moment to keep
                    </span>
                  </div>
                  <span className="w-[18px] h-[18px] rounded-full border-[1.5px] border-[#172536]/60 shrink-0" />
                </div>
              </div>
            </div>

            {/* Bottom handwritten note */}
            <div className="text-right pb-1">
              <span className="font-public-hand text-[23px] text-[#30483D] leading-none">
                start with what happened
              </span>
            </div>
          </div>

          {/* Center Column: Card 2 (Charts) + Card 4 (Write) (w=[395px], starts at x=520) */}
          <div className="w-full lg:w-[395px] flex flex-col justify-between h-[685px] shrink-0">
            {/* Card 2: Charts (h=[278px], Slate blue grid) */}
            <div
              className="w-full h-[278px] bg-[#778896] border border-[#172536]/15 p-6 flex flex-col justify-between relative shadow-sm shrink-0"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(23, 37, 54, 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(23, 37, 54, 0.12) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            >
              {/* Header */}
              <div className="flex items-baseline justify-between mb-4">
                <h3 className="font-instrument text-[40px] leading-none text-[#172536]">
                  Charts
                </h3>
                <span className="font-public-condensed text-[11px] uppercase tracking-[0.2em] font-semibold text-[#172536]">
                  SEE THE PATTERNS
                </span>
              </div>

              {/* Trendline Curve SVG */}
              <div className="w-full flex-1 flex items-center justify-center">
                <svg
                  viewBox="0 0 340 140"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full text-[#172536]"
                  aria-label="Hand-drawn trendline curve on grid"
                  role="img"
                >
                  {/* Horizontal dashed guide lines */}
                  <line x1="10" y1="35" x2="330" y2="35" stroke="#172536" strokeOpacity="0.25" strokeDasharray="3 3" />
                  <line x1="10" y1="70" x2="330" y2="70" stroke="#172536" strokeOpacity="0.25" strokeDasharray="3 3" />
                  <line x1="10" y1="105" x2="330" y2="105" stroke="#172536" strokeOpacity="0.25" strokeDasharray="3 3" />

                  {/* Smooth curved trendline */}
                  <path
                    d="M 18 95 C 45 92, 60 55, 95 55 C 130 55, 145 88, 180 88 C 215 88, 235 48, 275 48 C 300 48, 315 25, 330 20"
                    stroke="#172536"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />

                  {/* Nodes */}
                  <circle cx="18" cy="95" r="4.5" fill="#172536" />
                  <circle cx="180" cy="88" r="4.5" fill="#172536" />
                  <circle cx="330" cy="20" r="4.5" fill="#172536" />
                </svg>
              </div>
            </div>

            {/* Card 4: Write (h=[309px], Cream card with tilted lined sheet inside) */}
            <div className="w-full h-[309px] bg-[#F5EFE4] border border-[#172536]/15 p-6 flex flex-col justify-between shadow-sm shrink-0">
              {/* Header */}
              <div className="flex items-baseline justify-between mb-3">
                <h3 className="font-instrument text-[40px] leading-none text-[#172536]">
                  Write
                </h3>
                <span className="font-public-condensed text-[11px] uppercase tracking-[0.2em] font-semibold text-[#172536]">
                  KEEP WHAT MATTERS
                </span>
              </div>

              {/* Tilted lined paper sheet */}
              <div className="relative mt-1">
                <div
                  className="bg-[#FCFAF5] border border-[#172536]/15 p-5 shadow-sm transform -rotate-1 origin-top-left"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(transparent, transparent 26px, rgba(23, 37, 54, 0.12) 27px)',
                  }}
                >
                  <div className="border-b border-dashed border-[#172536]/30 pb-2 mb-3">
                    <span className="font-public-condensed text-[10.5px] uppercase tracking-[0.22em] font-bold text-[#172536]">
                      A PAGE FOR THE UNFINISHED THOUGHT
                    </span>
                  </div>

                  <p className="font-public-hand text-[21px] text-[#5D5061] leading-[27px] pt-1">
                    Today, I want to remember...
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Ask (w=[358px], h=[667px], starts at x=936) */}
          <div className="w-full lg:w-[358px] h-[667px] bg-[#E4D3C2] border border-[#172536]/15 p-7 flex flex-col justify-between relative shadow-sm shrink-0">
            {/* Top washi tape tab */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[78px] h-[22px] bg-[#CDAE8B] opacity-90 shadow-xs transform -rotate-1 pointer-events-none" />

            <div>
              {/* Header */}
              <div className="flex items-baseline justify-between mb-8">
                <h3 className="font-instrument text-[44px] leading-none text-[#172536]">
                  Ask
                </h3>
                <span className="font-public-condensed text-[11px] uppercase tracking-[0.2em] font-semibold text-[#BD634A]">
                  REFLECT AND EXPLORE
                </span>
              </div>

              {/* Tilted inner question note card */}
              <div className="bg-[#F6EDE0] border border-[#172536]/15 p-6 shadow-sm transform -rotate-1 origin-top-left mt-2">
                <span className="block font-public-condensed text-[11px] uppercase tracking-[0.2em] font-bold text-[#BD634A] mb-3">
                  A QUESTION TO SIT WITH
                </span>

                <h4 className="font-instrument text-[30px] sm:text-[32px] leading-tight text-[#172536] mb-4">
                  What felt different today?
                </h4>

                <div className="w-full border-t border-[#172536]/20 my-4" />

                <p className="font-public-sans text-[13px] text-[#172536]/80 leading-relaxed">
                  Give yourself room for an honest answer. There is no right way to begin.
                </p>
              </div>
            </div>

            {/* Bottom prompt */}
            <div className="text-right pb-1">
              <span className="font-public-hand text-[22px] text-[#BD634A] leading-none">
                look a little closer ↗
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
