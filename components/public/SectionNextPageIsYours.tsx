import Link from 'next/link'

export function SectionNextPageIsYours() {
  return (
    <section
      id="next-page-is-yours"
      className="relative w-full bg-[#BD634A] overflow-hidden min-h-[484px] lg:h-[484px] text-[#F4EFE4]"
    >
      <div className="relative w-full max-w-[1366px] h-full mx-auto">
        {/* Eyebrow: THE NEXT PAGE IS YOURS (x=120, y=4632 / offset y=114) */}
        <div className="absolute left-6 lg:left-[120px] top-[70px] lg:top-[114px]">
          <span className="font-public-condensed text-[14px] lg:text-[12px] uppercase tracking-[0.25em] font-semibold text-[#F4EFE4]">
            THE NEXT PAGE IS YOURS
          </span>
        </div>

        {/* Display Headline: 'Your days are' and 'worth' are UPRIGHT. Only 'remembering.' is italic */}
        <div className="absolute left-6 lg:left-[82px] top-[110px] lg:top-[164px] z-10">
          <h2 className="font-instrument text-[44px] sm:text-[78px] lg:text-[104px] leading-[0.98] tracking-tight text-[#F4EFE4]">
            <span className="block not-italic">Your days are</span>
            <span className="block">
              <span className="not-italic">worth </span>
              <span className="italic">remembering.</span>
            </span>
          </h2>
        </div>

        {/* Primary CTA Button: START WITH TODAY ↗ (x=1096..1283, y=4824 / offset y=306, w=188, h=46) */}
        <div className="absolute left-6 lg:left-[1096px] top-[340px] lg:top-[306px] z-10">
          <Link
            href="/login"
            className="press-btn flex items-center justify-center w-[188px] h-[46px] bg-[#F4EFE4] text-[#172536] shadow-sm select-none"
          >
            <span className="font-public-condensed text-[14px] font-bold uppercase tracking-[0.18em] flex items-center gap-2">
              <span>START WITH TODAY</span>
              <span aria-hidden="true">↗</span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
