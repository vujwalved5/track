import Image from 'next/image'

export function SectionNoteForRoad() {
  return (
    <section id="perspective" className="py-16 md:py-24 border-b border-[#172536]/10">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Mountain Sunrise Photo */}
          <div className="lg:col-span-6 relative">
            <div className="lift-card relative rounded-lg overflow-hidden shadow-lg border-4 border-[#F4EFE4] bg-[#F4EFE4] aspect-[4/3] w-full">
              <Image
                src="/welcome/quote-mountain.jpg"
                alt="Capturing the peaceful serenity of mountain ranges during sunrise with soft pastel skies."
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 600px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#172536]/40 via-transparent to-transparent pointer-events-none" />

              {/* Bottom photo overlay caption */}
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[#F4EFE4]">
                <span className="font-public-condensed text-[11px] uppercase tracking-[0.2em] font-semibold text-[#D2A75D]">
                  Horizon View
                </span>
                <span className="font-public-script text-xs text-[#F4EFE4]/90">
                  first light
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Quote & Reflection */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-2">
              <h2 className="font-public-condensed text-xs uppercase tracking-[0.25em] font-semibold text-[#B68A53]">
                04 / A Note for the Road
              </h2>
              <span className="h-px w-8 bg-[#B68A53]/40" />
            </div>

            <blockquote className="space-y-4">
              <p className="font-public-serif text-3xl sm:text-4xl lg:text-5xl text-[#172536] leading-tight font-medium">
                "You don't have to be perfect. You just have to keep showing up."
              </p>
              <footer className="font-public-hand text-xl text-[#BD634A] pt-2">
                — a reminder for every quiet morning
              </footer>
            </blockquote>

            <p className="font-public-sans text-base text-[#172536]/80 leading-relaxed max-w-lg">
              Missing a day doesn't break anything. In an authentic notebook, blank days are part of the story too. Return to your journal whenever you are ready.
            </p>

            <div className="pt-4 border-t border-[#172536]/10">
              <div className="inline-flex items-center gap-2 font-public-condensed text-xs uppercase tracking-[0.22em] font-bold text-[#B68A53]">
                <span>Keep the wider view in sight</span>
                <span aria-hidden="true">↗</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
