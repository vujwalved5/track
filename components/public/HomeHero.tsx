import Image from 'next/image'
import Link from 'next/link'

export function HomeHero() {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24 border-b border-[#172536]/10">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#B68A53]/15 border border-[#B68A53]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#BD634A]" />
              <span className="font-public-condensed text-xs uppercase tracking-[0.2em] font-semibold text-[#B68A53]">
                Issue No. 01 — Autumn / Winter
              </span>
            </div>

            <h1 className="font-public-serif text-5xl sm:text-6xl lg:text-7xl leading-[1.08] tracking-tight text-[#172536]">
              Make Every Day{' '}
              <span className="italic text-[#BD634A] font-normal">Count.</span>
            </h1>

            <p className="font-public-sans text-lg sm:text-xl text-[#172536]/80 max-w-xl leading-relaxed">
              A quieter space to track your days, notice your progress, and build habits that last.
              A physical notebook feeling for your digital daily record.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/"
                className="press-btn inline-flex items-center gap-2 px-6 py-3.5 bg-[#172536] text-[#F4EFE4] font-public-condensed text-sm uppercase tracking-[0.16em] font-semibold rounded shadow-sm hover:bg-[#172536]/90"
              >
                <span>Open Your Journal</span>
                <span aria-hidden="true">↗</span>
              </Link>
              <Link
                href="/welcome/focus-room"
                className="press-btn inline-flex items-center gap-2 px-6 py-3.5 bg-[#F4EFE4] text-[#172536] border border-[#172536]/30 font-public-condensed text-sm uppercase tracking-[0.16em] font-semibold rounded hover:border-[#172536] hover:bg-white/40"
              >
                <span>Explore Focus Room</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="pt-4 border-t border-[#172536]/10 max-w-md">
              <p className="font-public-condensed text-xs uppercase tracking-[0.2em] text-[#B68A53]">
                Not a race to do more. Just a quiet record of what is.
              </p>
            </div>
          </div>

          {/* Right Column: Desk Photo Collage */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            <div className="relative w-full max-w-[480px]">
              {/* Main Desk Photo */}
              <div className="relative lift-card rounded-lg overflow-hidden shadow-xl border-4 border-[#F4EFE4] bg-[#F4EFE4] z-10 aspect-[4/3] w-full">
                <Image
                  src="/welcome/hero-desk.jpg"
                  alt="Orange coffee mug beside an open notebook in soft sunlight, capturing a calm study vibe."
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 480px"
                />
              </div>

              {/* Inset Polaroid: Mountain Sunrise */}
              <div className="absolute -bottom-8 -left-4 sm:-bottom-10 sm:-left-6 w-44 sm:w-52 p-2 sm:p-2.5 bg-[#F4EFE4] shadow-2xl rounded-sm border border-[#172536]/15 rotate-[-4deg] z-20 lift-card">
                <div className="relative aspect-square w-full overflow-hidden rounded-xs bg-[#172536]/5">
                  <Image
                    src="/welcome/hero-mountain.jpg"
                    alt="Tranquil view of misty mountain ranges under a pale sky, evoking peace and serenity."
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                </div>
                <div className="mt-2 text-center">
                  <span className="font-public-script text-xs sm:text-sm text-[#172536]/80">
                    morning ridge
                  </span>
                </div>
              </div>

              {/* Taped handwritten note */}
              <div className="absolute -top-6 -right-2 sm:-top-8 sm:-right-4 bg-[#F4EFE4] p-3 sm:p-4 rounded shadow-md border border-[#B68A53]/30 rotate-[3deg] z-20 max-w-[200px] lift-card">
                {/* Washi tape strip */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-[#B68A53]/35 rounded-xs transform -rotate-1" />
                <div className="font-public-condensed text-[10px] uppercase tracking-[0.18em] text-[#BD634A] mb-1 font-semibold">
                  Field Entry — Open Page
                </div>
                <p className="font-public-hand text-base leading-snug text-[#172536]">
                  Begin where you are.
                </p>
                <div className="font-public-script text-xs text-[#BD634A] mt-1 flex items-center justify-between">
                  <span>the ordinary is enough</span>
                  <span aria-hidden="true">↗</span>
                </div>
              </div>

              {/* Vertical stamp / badge */}
              <div className="hidden sm:flex absolute -right-6 top-1/2 -translate-y-1/2 transform rotate-90 origin-right items-center gap-2 py-1 px-3 bg-[#172536] text-[#F4EFE4] rounded text-[10px] font-public-condensed uppercase tracking-[0.22em] shadow z-0">
                <span>Observations from the Everyday</span>
                <span className="text-[#BD634A]">·</span>
                <span className="text-[#D2A75D]">TRACK</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
