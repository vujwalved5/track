'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FocusSessionProvider, useFocusSessionContext } from './hooks/useFocusSession';
import { LayoutKnob, FocusLayoutType } from './LayoutKnob';
import { LedgerLayout } from './LedgerLayout';
import { DialFirstLayout } from './DialFirstLayout';

const LAYOUT_STORAGE_KEY = 'track.focus.layout.v1';

function FocusThePracticeContent() {
  const { status } = useFocusSessionContext();
  const [layout, setLayout] = useState<FocusLayoutType>('a');

  // Hydration effect: read localStorage and URL override ONLY on mount (client-side)
  // Server and initial client paint always render A (Ledger) to avoid hydration mismatch
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check URL override: ?layout=a | ?layout=b (only applied in setup)
    const params = new URLSearchParams(window.location.search);
    const urlLayout = params.get('layout')?.toLowerCase();
    if (urlLayout === 'a' || urlLayout === 'b') {
      setLayout(urlLayout);
      return;
    }

    // Read stored layout from localStorage
    try {
      const stored = localStorage.getItem(LAYOUT_STORAGE_KEY);
      if (stored === 'a' || stored === 'b') {
        setLayout(stored);
      }
    } catch {}
  }, []);

  // Layout change handler (enabled ONLY when status === 'setup')
  const handleLayoutChange = useCallback(
    (nextLayout: FocusLayoutType) => {
      if (status !== 'setup') return;
      setLayout(nextLayout);
      try {
        localStorage.setItem(LAYOUT_STORAGE_KEY, nextLayout);
      } catch {}
    },
    [status]
  );

  const isLocked = status !== 'setup';

  const knobNode = (
    <LayoutKnob
      layout={layout}
      onChangeLayout={handleLayoutChange}
      isLocked={isLocked}
    />
  );

  return (
    <section id="practice" className="pt-14 pb-4 lg:pt-16 lg:pb-4 bg-[#172536] text-[#F4EFE4] overflow-hidden">
      <div className="max-w-[1366px] mx-auto px-6 sm:px-14 lg:px-[84px]">
        {/* Top Header Row / Divider */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#F4EFE4]/15">
          <span className="font-public-condensed text-xs uppercase tracking-[0.25em] font-semibold text-[#B68A53]">
            01 / THE PRACTICE
          </span>
          <span className="font-public-condensed text-xs uppercase tracking-[0.25em] font-semibold text-[#B68A53]">
            {layout === 'a' ? 'DESIGN A: THE LEDGER' : 'DESIGN B: DIAL-FIRST'}
          </span>
        </div>

        {/* Section Headline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-end pt-7 pb-8 lg:pb-10">
          <div className="lg:col-span-8">
            <span className="font-public-condensed text-xs uppercase tracking-[0.25em] font-semibold text-[#B68A53]">
              A LITTLE SPACE TO THINK
            </span>
            <h2 className="font-public-display text-5xl sm:text-6xl lg:text-[84px] leading-[0.98] font-normal text-[#F4EFE4] tracking-tight mt-2 antialiased">
              Settle into focus.
            </h2>
          </div>
          <div className="lg:col-span-4 flex flex-col justify-end">
            <p className="font-public-sans text-sm text-[#F4EFE4]/80 leading-relaxed text-left max-w-[245px] lg:ml-auto">
              {layout === 'a'
                ? 'A structured ledger session for deliberate focus and structured breaks.'
                : 'A dial-centric session where the timer ring visually maps the entire arc of your focus.'}
            </p>
          </div>
        </div>

        {/* Two Cards Layout — switches between LedgerLayout and DialFirstLayout */}
        {layout === 'a' ? (
          <LedgerLayout knobNode={knobNode} />
        ) : (
          <DialFirstLayout knobNode={knobNode} />
        )}
      </div>
    </section>
  );
}

export function FocusThePractice() {
  return (
    <FocusSessionProvider>
      <FocusThePracticeContent />
    </FocusSessionProvider>
  );
}

export default FocusThePractice;
