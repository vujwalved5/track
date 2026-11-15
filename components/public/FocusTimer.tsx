'use client';

import { useFocusSession } from './hooks/useFocusSession';

export interface FocusTimerProps {
  className?: string;
}

export function FocusTimer({ className }: FocusTimerProps) {
  const {
    status,
    phase,
    currentBlockNumber,
    totalFocusBlocks,
    formattedTime,
    segmentProgress,
    settings,
    schedule,
    applyPreset,
    start,
    pause,
    resume,
    skip,
    isResetConfirmOpen,
    openResetConfirm,
    cancelResetConfirm,
    confirmReset,
  } = useFocusSession();

  // Dynamic arc stroke-dasharray based on remaining progress (0..1)
  // At progress = 1: dash length is 612.6 (195 degrees of radius 180 circle, circumference ~1131)
  const arcDashLength = (segmentProgress * 612.6).toFixed(1);
  const strokeDasharray = `${arcDashLength} 1131`;

  // Dynamic orbit bead position on the tip of the gold arc
  // Formula: angle = -90 + progress * 195 degrees
  const angleDeg = -90 + segmentProgress * 195;
  const angleRad = (angleDeg * Math.PI) / 180;
  const beadX = Number((250 + 180 * Math.cos(angleRad)).toFixed(1));
  const beadY = Number((250 + 180 * Math.sin(angleRad)).toFixed(1));

  // Center display label
  let sessionTitle = 'FOCUS SESSION';
  if (status === 'finished') {
    sessionTitle = 'SESSION COMPLETE';
  } else if (status === 'running' || status === 'paused') {
    sessionTitle = `${phase === 'focus' ? 'FOCUS' : 'BREAK'} ${currentBlockNumber} OF ${totalFocusBlocks}`;
  } else {
    sessionTitle = `${settings.studyMin} MIN FOCUS / ${schedule.focusBlocks} BLOCKS`;
  }

  // Active preset determination
  const is25_5 = settings.studyMin === 25 && settings.breakMin === 5;
  const is50_10 = settings.studyMin === 50 && settings.breakMin === 10;
  const is90_10 = settings.studyMin === 90 && settings.breakMin === 10;

  return (
    <div className={className ?? 'lg:col-span-8 relative flex flex-col'}>
      {/* Offset Shadow Slab behind the timer card */}
      <div
        className="absolute inset-0 translate-x-4 translate-y-4 rounded-[2px] bg-[#0d1926] border border-[#F4EFE4]/10 pointer-events-none"
        aria-hidden="true"
      />

      {/* Main Timer Card */}
      <div className="relative rounded-[2px] bg-[#172536] border border-[#B68A53]/30 p-5 sm:p-6 lg:p-7 shadow-2xl flex flex-col justify-between">
        {/* Top row: Session label */}
        <div className="flex items-center justify-between gap-3 pb-5 border-b border-[#F4EFE4]/15">
          <span className="font-public-condensed text-xs uppercase tracking-[0.22em] font-semibold text-[#B68A53]">
            FOCUS SESSION / {status.toUpperCase()}
          </span>
          <span className="font-public-condensed text-xs uppercase tracking-[0.18em] text-[#F4EFE4]/60">
            {schedule.endsAt ? `ENDS ABOUT ${schedule.endsAt}` : ''}
          </span>
        </div>

        {/* Visual Timer Dial Area */}
        <div className="py-6 sm:py-8 lg:py-9 flex flex-col items-center justify-center relative my-auto">
          <div className="relative w-[340px] h-[340px] sm:w-[450px] sm:h-[450px] lg:w-[495px] lg:h-[495px] flex items-center justify-center">
            <svg
              viewBox="0 0 500 500"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full text-[#B68A53]"
              aria-label={`Timer dial indicator showing ${formattedTime}`}
              role="img"
            >
              <defs>
                <radialGradient id="dial-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#1e3852" stopOpacity="0.55" />
                  <stop offset="65%" stopColor="#1e3852" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#172536" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Soft central radial glow */}
              <circle cx="250" cy="250" r="185" fill="url(#dial-glow)" />

              {/* Thin inner ring */}
              <circle cx="250" cy="250" r="148" stroke="#F4EFE4" strokeOpacity="0.14" strokeWidth="1" />

              {/* Thick dark track ring */}
              <circle cx="250" cy="250" r="180" stroke="#1e3044" strokeWidth="9" />

              {/* Thick gold arc: starts at 12 o'clock and dynamically tracks remaining progress */}
              <circle
                cx="250"
                cy="250"
                r="180"
                stroke={phase === 'break' ? '#8799A7' : '#B68A53'}
                strokeWidth="9"
                strokeDasharray={strokeDasharray}
                strokeLinecap="round"
                transform="rotate(-90 250 250)"
                className="motion-safe:transition-[stroke-dasharray] motion-safe:duration-200 motion-reduce:transition-none"
              />

              {/* Orbit indicator bead on active arc tip */}
              <circle
                cx={beadX}
                cy={beadY}
                r="5"
                fill={phase === 'break' ? '#8799A7' : '#B68A53'}
                className="motion-safe:transition-[cx,cy] motion-safe:duration-200 motion-reduce:transition-none"
              />

              {/* Glowing amber beacon star at 12 o'clock inside dial */}
              <circle cx="250" cy="100" r="14" fill="#D2A75D" opacity="0.25" />
              <circle cx="250" cy="100" r="3.5" fill="#D2A75D" />

              {/* Thin outer ring */}
              <circle cx="250" cy="250" r="218" stroke="#F4EFE4" strokeOpacity="0.12" strokeWidth="1" />

              {/* 4 Cardinal Ticks (0, 90, 180, 270 deg) */}
              <line x1="250.0" y1="58.0" x2="250.0" y2="28.0" stroke="#B68A53" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="442.0" y1="250.0" x2="472.0" y2="250.0" stroke="#B68A53" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="250.0" y1="442.0" x2="250.0" y2="472.0" stroke="#B68A53" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="58.0" y1="250.0" x2="28.0" y2="250.0" stroke="#B68A53" strokeWidth="1.5" strokeLinecap="round" />

              {/* 8 Intermediate Hour Ticks */}
              <line x1="346.0" y1="83.7" x2="356.0" y2="66.4" stroke="#F4EFE4" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
              <line x1="416.3" y1="154.0" x2="433.6" y2="144.0" stroke="#F4EFE4" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
              <line x1="416.3" y1="346.0" x2="433.6" y2="356.0" stroke="#F4EFE4" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
              <line x1="346.0" y1="416.3" x2="356.0" y2="433.6" stroke="#F4EFE4" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
              <line x1="154.0" y1="416.3" x2="144.0" y2="433.6" stroke="#F4EFE4" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
              <line x1="83.7" y1="346.0" x2="66.4" y2="356.0" stroke="#F4EFE4" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
              <line x1="83.7" y1="154.0" x2="66.4" y2="144.0" stroke="#F4EFE4" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
              <line x1="154.0" y1="83.7" x2="144.0" y2="66.4" stroke="#F4EFE4" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
            </svg>

            {/* Center Time & Session Label */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none"
              aria-live="polite"
              aria-atomic="true"
            >
              <span className="font-public-display text-8xl sm:text-9xl lg:text-[112px] font-normal leading-none tracking-tight text-[#F4EFE4] antialiased">
                {formattedTime}
              </span>
              <span className="font-public-condensed text-xs uppercase tracking-[0.28em] text-[#B68A53] font-semibold mt-3">
                {sessionTitle}
              </span>
            </div>
          </div>

          {/* Action Buttons: START, PAUSE/RESUME, SKIP, RESET with Inline Confirm */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4 sm:mt-6 min-h-[48px]">
            {isResetConfirmOpen ? (
              <div className="flex items-center gap-3 p-1.5 rounded-[2px] bg-[#101b27] border border-[#BD634A]/40 animate-fade-in">
                <span className="font-public-condensed text-xs uppercase tracking-[0.16em] text-[#F4EFE4]/80 px-2">
                  Reset session?
                </span>
                <button
                  type="button"
                  onClick={confirmReset}
                  className="px-3.5 py-1.5 rounded-[2px] bg-[#BD634A] text-[#F4EFE4] font-public-condensed text-xs uppercase tracking-[0.16em] font-bold hover:bg-[#d67055] transition-colors cursor-pointer"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={cancelResetConfirm}
                  className="px-3.5 py-1.5 rounded-[2px] bg-transparent border border-[#F4EFE4]/30 text-[#F4EFE4]/80 font-public-condensed text-xs uppercase tracking-[0.16em] hover:text-[#F4EFE4] hover:border-[#F4EFE4]/60 transition-colors cursor-pointer"
                >
                  Keep going
                </button>
              </div>
            ) : status === 'setup' ? (
              <button
                type="button"
                onClick={start}
                aria-label="Start focus session"
                className="w-32 sm:w-36 py-2.5 rounded-[2px] font-public-condensed text-xs uppercase tracking-[0.22em] font-bold shadow transition-colors cursor-pointer bg-[#B68A53] text-[#172536] hover:bg-[#D2A75D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B68A53] focus-visible:ring-offset-2 focus-visible:ring-offset-[#172536]"
              >
                START
              </button>
            ) : status === 'finished' ? (
              <button
                type="button"
                onClick={confirmReset}
                aria-label="Start new session"
                className="w-36 py-2.5 rounded-[2px] font-public-condensed text-xs uppercase tracking-[0.22em] font-bold shadow transition-colors cursor-pointer bg-[#B68A53] text-[#172536] hover:bg-[#D2A75D]"
              >
                NEW SESSION
              </button>
            ) : (
              <>
                {/* PAUSE / RESUME button */}
                {status === 'running' ? (
                  <button
                    type="button"
                    onClick={pause}
                    aria-label="Pause focus timer"
                    className="w-28 sm:w-32 py-2.5 rounded-[2px] bg-[#172536] border border-[#B68A53] text-[#B68A53] font-public-condensed text-xs uppercase tracking-[0.22em] font-bold transition-colors cursor-pointer hover:bg-[#B68A53]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B68A53]"
                  >
                    PAUSE
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={resume}
                    aria-label="Resume focus timer"
                    className="w-28 sm:w-32 py-2.5 rounded-[2px] bg-[#B68A53] text-[#172536] font-public-condensed text-xs uppercase tracking-[0.22em] font-bold transition-colors cursor-pointer hover:bg-[#D2A75D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B68A53]"
                  >
                    RESUME
                  </button>
                )}

                {/* SKIP button */}
                <button
                  type="button"
                  onClick={skip}
                  aria-label="Skip to next segment"
                  className="w-28 sm:w-32 py-2.5 rounded-[2px] bg-[#172536] border border-[#F4EFE4]/30 text-[#F4EFE4] font-public-condensed text-xs uppercase tracking-[0.22em] font-medium transition-colors cursor-pointer hover:bg-[#1e3044] hover:border-[#F4EFE4]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B68A53]"
                >
                  SKIP
                </button>

                {/* RESET button */}
                <button
                  type="button"
                  onClick={openResetConfirm}
                  aria-label="Reset focus timer"
                  className="w-28 sm:w-32 py-2.5 rounded-[2px] bg-[#172536] border border-[#F4EFE4]/30 text-[#F4EFE4]/80 font-public-condensed text-xs uppercase tracking-[0.22em] font-medium transition-colors cursor-pointer hover:bg-[#1e3044] hover:text-[#F4EFE4] hover:border-[#F4EFE4]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B68A53]"
                >
                  RESET
                </button>
              </>
            )}
          </div>
        </div>

        {/* Bottom Section: Presets (25/5, 50/10, 90/10) */}
        <div className="pt-5 mt-4 border-t border-[#F4EFE4]/15">
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-public-condensed text-xs uppercase tracking-[0.25em] font-semibold text-[#B68A53]">
              PRESET SHORTCUTS
            </span>
            <span className="font-public-condensed text-xs uppercase tracking-[0.2em] font-semibold text-[#B68A53]">
              01 — 03
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="tablist" aria-label="Timer preset shortcuts">
            {/* Preset 1: 25 / 5 */}
            <div className="flex flex-col">
              <button
                type="button"
                role="tab"
                aria-selected={is25_5}
                disabled={status !== 'setup'}
                onClick={() => applyPreset(25, 5, 120)}
                className={`w-full h-[52px] flex items-center justify-center font-public-condensed text-xs uppercase tracking-[0.18em] font-bold text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B68A53] ${
                  status !== 'setup' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                } ${
                  is25_5
                    ? 'bg-[#F4EFE4] text-[#172536]'
                    : 'rounded-[8px] bg-[#172536] text-[#F4EFE4]/80 border border-[#F4EFE4]/20 hover:border-[#F4EFE4]/40 hover:text-[#F4EFE4]'
                }`}
                style={
                  is25_5
                    ? { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }
                    : undefined
                }
              >
                FOCUS 25 / 5 MIN
              </button>
              <div
                className={`w-full h-[2px] mt-1 transition-opacity ${
                  is25_5 ? 'bg-[#B68A53] opacity-100' : 'bg-transparent opacity-0'
                }`}
                aria-hidden="true"
              />
            </div>

            {/* Preset 2: 50 / 10 */}
            <div className="flex flex-col">
              <button
                type="button"
                role="tab"
                aria-selected={is50_10}
                disabled={status !== 'setup'}
                onClick={() => applyPreset(50, 10, 180)}
                className={`w-full h-[52px] flex items-center justify-center font-public-condensed text-xs uppercase tracking-[0.18em] font-bold text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B68A53] ${
                  status !== 'setup' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                } ${
                  is50_10
                    ? 'bg-[#F4EFE4] text-[#172536]'
                    : 'rounded-[8px] bg-[#172536] text-[#F4EFE4]/80 border border-[#F4EFE4]/20 hover:border-[#F4EFE4]/40 hover:text-[#F4EFE4]'
                }`}
                style={
                  is50_10
                    ? { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }
                    : undefined
                }
              >
                EXTENDED 50 / 10 MIN
              </button>
              <div
                className={`w-full h-[2px] mt-1 transition-opacity ${
                  is50_10 ? 'bg-[#B68A53] opacity-100' : 'bg-transparent opacity-0'
                }`}
                aria-hidden="true"
              />
            </div>

            {/* Preset 3: 90 / 10 */}
            <div className="flex flex-col">
              <button
                type="button"
                role="tab"
                aria-selected={is90_10}
                disabled={status !== 'setup'}
                onClick={() => applyPreset(90, 10, 180)}
                className={`w-full h-[52px] flex items-center justify-center font-public-condensed text-xs uppercase tracking-[0.18em] font-bold text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B68A53] ${
                  status !== 'setup' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                } ${
                  is90_10
                    ? 'bg-[#F4EFE4] text-[#172536]'
                    : 'rounded-[8px] bg-[#172536] text-[#F4EFE4]/80 border border-[#F4EFE4]/20 hover:border-[#F4EFE4]/40 hover:text-[#F4EFE4]'
                }`}
                style={
                  is90_10
                    ? { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }
                    : undefined
                }
              >
                DEEP DIVE 90 / 10 MIN
              </button>
              <div
                className={`w-full h-[2px] mt-1 transition-opacity ${
                  is90_10 ? 'bg-[#B68A53] opacity-100' : 'bg-transparent opacity-0'
                }`}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FocusTimer;
