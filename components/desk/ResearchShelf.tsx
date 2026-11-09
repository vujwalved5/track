'use client'

import React, { useState, useEffect } from 'react'
import {
  RESEARCH_CLIPPINGS,
  RESEARCH_SHELF_LAST_UPDATED,
  DOMAIN_LABELS,
  type ResearchClipping,
  type ResearchDomain,
} from '@/lib/researchShelf'

/**
 * Deeper focus insights for the back face of each clipping.
 * Calm, contemplative commentary expanding on cognitive takeaways for deep work and reflection.
 */
const DEEPER_INSIGHTS: Record<string, string> = {
  'ai-learning-guardrails-pnas':
    'Cognitive offloading produces immediate output but starves the neural circuits that consolidate long-term understanding. Lasting clarity requires the silent, unhurried friction of independent retrieval before seeking external synthesis.',
  'ai-critical-thinking-chi':
    'When machine fluency resembles polished competence, the brain prematurely suspends doubt. Protecting genuine focus means deliberately pausing to interrogate assumptions rather than passively accepting effortless prose.',
  'ai-productivity-qje':
    'Automation reliably replicates past average practice across widespread tasks. However, high-craft mastery and breakthrough synthesis remain rooted in deep, uninterrupted contemplation that no algorithm can anticipate.',
  'ai-productivity-jagged-frontier':
    'The boundary where automated calculation breaks and human judgment begins is invisible and jagged. Navigating it requires vigilant attention; a single lapse in focus risks adopting plausibly flawed conclusions.',
  'screen-time-pnas-nexus':
    'Constant ambient connectivity places the executive attention network on continuous low-grade standby. True contemplative depth only reemerges when the portal to the internet is physically closed.',
  'notifications-chb-disruption':
    'Every unexpected alert shatters the fragile working memory stack. Guarding continuous focus requires preemptive silence — quiet hours where no ping can fracture your train of thought.',
  'recent-ai-alphaproof-nature':
    'Machine-checked proof verification demonstrates that true reliability requires formal reasoning loops rather than surface eloquence. In human thought as well, rigorous clarity demands patient self-verification.',
  'recent-ai-alignment-faking':
    'Superficial compliance can easily mask divergent underlying patterns. Sustained critical thinking insists on inspecting fundamental premises rather than being lulled by reassuring appearances.',
}

/** Subtle alternating natural tilts for resting paper clippings on the shelf */
const RESTING_TILTS = [
  '-rotate-[1.2deg]',
  'rotate-[1.0deg]',
  '-rotate-[0.8deg]',
  'rotate-[1.4deg]',
  '-rotate-[1.5deg]',
  'rotate-[0.8deg]',
  '-rotate-[1.0deg]',
  'rotate-[1.2deg]',
]

interface ResearchShelfProps {
  isMobile?: boolean
}

export function ResearchShelf({ isMobile = false }: ResearchShelfProps) {
  const [activeClippingId, setActiveClippingId] = useState<string | null>(null)
  const [isFlipped, setIsFlipped] = useState(false)

  const activeClipping =
    RESEARCH_CLIPPINGS.find((c) => c.id === activeClippingId) || null

  const handleTurnOver = () => {
    setIsFlipped((prev) => !prev)
  }

  const handlePutBack = () => {
    setActiveClippingId(null)
    setIsFlipped(false)
  }

  // Keyboard accessibility: Escape closes lifted clipping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeClippingId !== null) {
        handlePutBack()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeClippingId])

  return (
    <section
      data-desk-object="research-shelf"
      aria-label="Technology and Focus Research Shelf"
      className="relative w-full select-none"
    >
      {/* ── Shelf Header: Title & Last Updated Stamp ── */}
      <div className="flex items-center justify-between pb-1.5 px-2 border-b border-kraft/30 mb-2">
        <div className="flex items-center gap-2">
          {/* Hand-drawn brass shelf bracket SVG */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
            className="shrink-0"
          >
            <path
              d="M 2 2 H 12 V 5 H 5 V 12 H 2 Z"
              fill="#d8b45a"
              stroke="#211b16"
              strokeWidth="0.8"
            />
          </svg>
          <h2 className="font-hand font-bold text-xs sm:text-sm text-paper/90 tracking-wide">
            Technology &amp; Focus Research
          </h2>
        </div>
        <div className="font-hand text-[11px] sm:text-xs text-paper/70 tracking-wider">
          Last updated: {RESEARCH_SHELF_LAST_UPDATED}
        </div>
      </div>

      {/* ── 1. ACTIVE LIFTED CLIPPING (Elevation z-80, no modal backdrop) ── */}
      {activeClipping !== null ? (
        <div
          role="region"
          aria-label={`Research clipping: ${activeClipping.headline}`}
          className={`relative z-80 mx-auto bg-paper text-ink rounded-sm shadow-paper-card border border-kraft/45 p-4 sm:p-5 flex flex-col justify-between -rotate-[0.5deg] animate-note-lift ${
            isMobile
              ? 'w-full max-w-[340px] min-h-[290px]'
              : 'w-full max-w-[560px] min-h-[250px] max-h-[310px]'
          }`}
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(28, 36, 51, 0.22) 1.2px, transparent 1.2px)',
            backgroundSize: '22px 22px',
          }}
        >
          {/* Top Brass Clip Accent */}
          <div
            className="absolute -top-3 left-8 w-5 h-6 border-t-2 border-r-2 border-l-2 border-kraft rounded-t-sm pointer-events-none z-10"
            aria-hidden="true"
          />

          {/* FRONT FACE */}
          {!isFlipped ? (
            <div className="flex-1 flex flex-col justify-between">
              {/* Card Header */}
              <div className="border-b border-ink/20 pb-1.5 mb-2">
                <div className="flex items-center justify-between">
                  <span className="font-hand text-[11px] font-bold text-kraft uppercase tracking-wider">
                    {DOMAIN_LABELS[activeClipping.domain]}
                  </span>
                  <span className="font-hand text-[10px] text-ink/65">
                    {activeClipping.publicationDate}
                  </span>
                </div>
                <h3 className="font-hand font-bold text-sm sm:text-base text-ink leading-snug mt-0.5">
                  {activeClipping.headline}
                </h3>
              </div>

              {/* Body: 2-3 sentence plain-language summary */}
              <div className="flex-1 my-1">
                <p className="font-hand text-xs sm:text-[13px] text-ink/90 leading-[19px] sm:leading-[21px]">
                  {activeClipping.summary}
                </p>

                {/* "Why it matters for focus" box */}
                <div className="mt-2.5 pt-1.5 pb-1 border-t border-dotted border-ink/25 bg-gold/10 px-2.5 rounded-sm">
                  <p className="font-hand text-xs text-ink leading-snug">
                    <span className="font-bold text-oxblood mr-1.5">
                      Why it matters for focus:
                    </span>
                    {activeClipping.whyItMatters}
                  </p>
                </div>
              </div>

              {/* Source attribution and working canonical URL */}
              <div className="mt-2 pt-1 border-t border-ink/15 flex flex-wrap items-center justify-between gap-1 text-[11px] text-ink/70 font-hand">
                <span className="truncate max-w-[260px] sm:max-w-[340px]">
                  Source: {activeClipping.sourceName}
                </span>
                <a
                  href={activeClipping.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] inline-flex items-center text-ink/80 hover:text-ink hover:underline decoration-dotted underline-offset-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-highlighter"
                  title={`Open primary source for ${activeClipping.headline}`}
                >
                  View source &rarr;
                </a>
              </div>
            </div>
          ) : (
            /* BACK FACE (on "Turn over") */
            <div className="flex-1 flex flex-col justify-between">
              {/* Card Header Back */}
              <div className="border-b border-ink/20 pb-1.5 mb-2">
                <div className="flex items-center justify-between">
                  <span className="font-hand text-[11px] font-bold text-kraft uppercase tracking-wider">
                    {DOMAIN_LABELS[activeClipping.domain]} — Field Notes
                  </span>
                  <span className="font-hand text-[10px] text-ink/65">
                    Reverse Side
                  </span>
                </div>
                <h3 className="font-hand font-bold text-xs sm:text-sm text-ink truncate mt-0.5">
                  {activeClipping.headline}
                </h3>
              </div>

              {/* Body Back: Verified quote (<15 words) & Deeper Focus Insight */}
              <div className="flex-1 my-1 space-y-2">
                {activeClipping.quote && (
                  <blockquote className="p-2 sm:p-2.5 bg-gold/10 border-l-2 border-oxblood rounded-r-sm font-hand text-xs sm:text-[13px] text-ink leading-relaxed italic">
                    &ldquo;{activeClipping.quote.text}&rdquo;
                    <footer className="mt-1 text-right font-hand font-bold text-[11px] text-ink/80 not-italic">
                      &mdash; {activeClipping.quote.author}
                    </footer>
                  </blockquote>
                )}

                <div className="pt-1">
                  <p className="font-hand text-[11px] sm:text-xs text-ink/90 leading-[18px] sm:leading-[20px]">
                    <span className="font-bold text-kraft mr-1">
                      Contemplative Insight:
                    </span>
                    {DEEPER_INSIGHTS[activeClipping.id] ||
                      activeClipping.whyItMatters}
                  </p>
                </div>
              </div>

              {/* Source Details & Working Canonical URL */}
              <div className="mt-2 pt-1 border-t border-ink/15 flex flex-wrap items-center justify-between gap-1 text-[11px] text-ink/70 font-hand">
                <span className="truncate max-w-[260px] sm:max-w-[340px]">
                  {activeClipping.sourceName} ({activeClipping.publicationDate})
                </span>
                <a
                  href={activeClipping.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] inline-flex items-center text-ink/80 hover:text-ink hover:underline decoration-dotted underline-offset-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-highlighter"
                  title={`Open primary canonical reference for ${activeClipping.headline}`}
                >
                  Primary reference &rarr;
                </a>
              </div>
            </div>
          )}

          {/* Controls Footer: "turn over" brass button and "put back" link (each >= 44x44px hit target) */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-ink/20">
            <button
              type="button"
              onClick={handlePutBack}
              className="min-w-[44px] min-h-[44px] px-3 py-1 font-hand text-xs text-ink/75 hover:text-ink hover:underline cursor-pointer flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlighter rounded-sm"
              aria-label="Put back the clipping onto the shelf"
            >
              put back
            </button>

            <button
              type="button"
              onClick={handleTurnOver}
              className="min-w-[44px] min-h-[44px] px-3.5 py-1 font-hand text-xs font-bold text-desk bg-gold hover:bg-kraft rounded-sm shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlighter"
              aria-label={
                isFlipped
                  ? 'Turn over to front of clipping'
                  : 'Turn over to read back of clipping'
              }
            >
              <span>{isFlipped ? 'turn front' : 'turn over'}</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M 2 7 H 12 M 8 3 L 12 7 L 8 11"
                  stroke="#211b16"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        /* ── 2. RESTING SHELF CLIPPINGS ROW ── */
        <div className="w-full">
          {/* Mobile: Horizontal Swipeable Row (< 768px) */}
          {isMobile ? (
            <div
              className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-3 pt-1 px-1 scrollbar-none"
              tabIndex={0}
              aria-label="Swipeable research clippings row"
            >
              {RESEARCH_CLIPPINGS.map((clipping, index) => (
                <button
                  key={clipping.id}
                  type="button"
                  onClick={() => {
                    setActiveClippingId(clipping.id)
                    setIsFlipped(false)
                  }}
                  aria-label={`Open research clipping ${index + 1} of 8: ${clipping.headline}. Tap to lift.`}
                  className={`snap-start shrink-0 w-[240px] h-[120px] bg-paper text-ink rounded-sm shadow-paper-card border border-kraft/35 p-3 flex flex-col justify-between cursor-pointer text-left transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlighter ${
                    RESTING_TILTS[index % RESTING_TILTS.length]
                  }`}
                  style={{
                    backgroundImage:
                      'radial-gradient(circle, rgba(28, 36, 51, 0.18) 1px, transparent 1px)',
                    backgroundSize: '22px 22px',
                  }}
                >
                  <div className="flex items-center justify-between border-b border-ink/15 pb-1">
                    <span className="font-hand text-[10px] font-bold text-kraft uppercase tracking-wider truncate max-w-[150px]">
                      {DOMAIN_LABELS[clipping.domain]}
                    </span>
                    <span className="font-hand text-[9px] text-ink/60">
                      {clipping.publicationDate}
                    </span>
                  </div>

                  <h3 className="font-hand font-bold text-xs text-ink line-clamp-2 leading-tight my-1">
                    {clipping.headline}
                  </h3>

                  <div className="flex items-center justify-between pt-1 border-t border-ink/10 text-[10px] font-hand text-ink/70">
                    <span className="truncate max-w-[150px]">
                      {clipping.sourceName}
                    </span>
                    <span className="text-kraft font-bold">lift &rarr;</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            /* Desktop: Pinned 8-Clipping Row (>= 768px) */
            <div className="grid grid-cols-4 lg:grid-cols-8 gap-2.5 items-end pt-1 pb-2">
              {RESEARCH_CLIPPINGS.map((clipping, index) => (
                <button
                  key={clipping.id}
                  type="button"
                  onClick={() => {
                    setActiveClippingId(clipping.id)
                    setIsFlipped(false)
                  }}
                  aria-label={`Open research clipping ${index + 1} of 8: ${clipping.headline}. Tap to lift.`}
                  className={`relative group bg-paper text-ink rounded-sm shadow-paper-card border border-kraft/35 hover:border-kraft/70 p-2 h-[100px] flex flex-col justify-between cursor-pointer text-left transition-all duration-150 hover:-translate-y-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlighter min-w-[44px] min-h-[44px] ${
                    RESTING_TILTS[index % RESTING_TILTS.length]
                  }`}
                  style={{
                    backgroundImage:
                      'radial-gradient(circle, rgba(28, 36, 51, 0.16) 1.1px, transparent 1.1px)',
                    backgroundSize: '22px 22px',
                  }}
                >
                  {/* Subtle top staple / clip accent */}
                  <div
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-1 bg-kraft/70 rounded-full pointer-events-none"
                    aria-hidden="true"
                  />

                  <div className="flex items-center justify-between border-b border-ink/15 pb-0.5">
                    <span className="font-hand text-[9px] font-bold text-kraft uppercase tracking-wider truncate max-w-[80px]">
                      {DOMAIN_LABELS[clipping.domain]}
                    </span>
                  </div>

                  <h3 className="font-hand font-bold text-[11px] leading-[13px] text-ink line-clamp-2 my-0.5">
                    {clipping.headline}
                  </h3>

                  <div className="flex items-center justify-between pt-0.5 border-t border-ink/10 text-[9px] font-hand text-ink/65">
                    <span className="truncate max-w-[70px]">
                      {clipping.sourceName}
                    </span>
                    <span className="text-kraft font-bold group-hover:translate-x-0.5 transition-transform">
                      &uarr;
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Solid Wooden Shelf Rail Baseline */}
      <div
        className="w-full h-1.5 bg-gradient-to-r from-kraft/30 via-gold/40 to-kraft/30 rounded-full mt-1 border-t border-desk/40 shadow-sm"
        aria-hidden="true"
      />
    </section>
  )
}
