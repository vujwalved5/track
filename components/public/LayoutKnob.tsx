'use client';

import React, { useCallback } from 'react';

export type FocusLayoutType = 'a' | 'b';

export interface LayoutKnobProps {
  layout: FocusLayoutType;
  onChangeLayout: (nextLayout: FocusLayoutType) => void;
  isLocked: boolean;
  className?: string;
}

export function LayoutKnob({
  layout,
  onChangeLayout,
  isLocked,
  className = '',
}: LayoutKnobProps) {
  const toggle = useCallback(() => {
    if (isLocked) return;
    onChangeLayout(layout === 'a' ? 'b' : 'a');
  }, [isLocked, layout, onChangeLayout]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (isLocked) {
        e.preventDefault();
        return;
      }

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggle();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (layout !== 'a') onChangeLayout('a');
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (layout !== 'b') onChangeLayout('b');
      }
    },
    [isLocked, layout, onChangeLayout, toggle]
  );

  const isDialFirst = layout === 'b';
  // Rotation: A = -38deg (pointing to A notch), B = 38deg (pointing to B notch)
  const rotationDeg = isDialFirst ? 38 : -38;

  return (
    <div
      className={`inline-flex flex-col items-center select-none ${
        isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
      title={isLocked ? 'Locked during session' : `Switch layout (currently ${isDialFirst ? 'Dial-first' : 'Ledger'})`}
    >
      {/* Knob + A / B notches row */}
      <div
        role="switch"
        aria-label="Timer layout"
        aria-checked={isDialFirst}
        aria-valuetext={isDialFirst ? 'Dial-first' : 'Ledger'}
        aria-disabled={isLocked ? 'true' : undefined}
        tabIndex={isLocked ? -1 : 0}
        onClick={toggle}
        onKeyDown={handleKeyDown}
        className={`relative inline-flex items-center gap-1.5 p-1 rounded-[4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B68A53] focus-visible:ring-offset-2 focus-visible:ring-offset-[#172536] transition-opacity`}
      >
        {/* Notch A */}
        <span
          className={`font-public-condensed text-[11px] font-bold tracking-widest transition-colors ${
            !isDialFirst ? 'text-[#B68A53]' : 'text-[#F4EFE4]/40'
          }`}
          aria-hidden="true"
        >
          A
        </span>

        {/* Rotary Dial Knob (36px x 36px) */}
        <div
          className="relative w-9 h-9 rounded-full bg-[#101b27] border border-[#B68A53]/60 shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)] flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          {/* Inner concentric ring */}
          <div className="absolute inset-1 rounded-full border border-[#F4EFE4]/10" />

          {/* Rotating Notch Indicator */}
          <div
            className="absolute inset-0 flex items-start justify-center transition-transform duration-200 motion-reduce:transition-none"
            style={{
              transform: `rotate(${rotationDeg}deg)`,
            }}
          >
            {/* Pointer Notch Line at top edge */}
            <div className="w-[3px] h-2.5 bg-[#B68A53] rounded-full mt-1 shadow-[0_0_4px_rgba(182,138,83,0.8)]" />
          </div>

          {/* Central brass bead */}
          <div className="w-1.5 h-1.5 rounded-full bg-[#B68A53]/80" />
        </div>

        {/* Notch B */}
        <span
          className={`font-public-condensed text-[11px] font-bold tracking-widest transition-colors ${
            isDialFirst ? 'text-[#B68A53]' : 'text-[#F4EFE4]/40'
          }`}
          aria-hidden="true"
        >
          B
        </span>
      </div>

      {/* Caption / Tooltip under knob */}
      <span
        className={`font-public-condensed text-[9px] uppercase tracking-[0.18em] font-semibold transition-colors mt-0.5 text-center ${
          isLocked
            ? 'text-[#BD634A]'
            : isDialFirst
            ? 'text-[#B68A53]'
            : 'text-[#B68A53]'
        }`}
      >
        {isLocked ? 'LOCKED DURING SESSION' : isDialFirst ? 'DIAL-FIRST' : 'LEDGER'}
      </span>
    </div>
  );
}

export default LayoutKnob;
