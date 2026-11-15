'use client';

import { useFocusSessionContext } from './hooks/useFocusSession';

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
    currentSegmentIndex,
    taskText,
    isChecklistCleared,
    hasVisitedStep3OrPreset,
    settings,
    schedule,
    start,
    pause,
    resume,
    skip,
    isResetConfirmOpen,
    openResetConfirm,
    cancelResetConfirm,
    confirmReset,
  } = useFocusSessionContext();

  // Dynamic arc stroke-dasharray based on remaining progress (0..1)
  const arcDashLength = (segmentProgress * 612.6).toFixed(1);
  const strokeDasharray = `${arcDashLength} 1131`;

  // Dynamic orbit bead position
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

  // Session Strip calculations
  const totalSessionMins = Math.max(1, schedule.totalMinutes);

  // Calculate elapsed session minutes for the moving marker
  let elapsedMins = 0;
  for (let i = 0; i < currentSegmentIndex; i++) {
    elapsedMins += schedule.segments[i]?.minutes ?? 0;
  }
  const currentSeg = schedule.segments[currentSegmentIndex];
  if (currentSeg) {
    elapsedMins += currentSeg.minutes * (1 - segmentProgress);
  }
  const markerPct = Math.min(100, Math.max(0, (elapsedMins / totalSessionMins) * 100));

  // Midpoint clock time calculation
  const startTimestamp = Date.now();
  const midTimestamp = startTimestamp + (totalSessionMins / 2) * 60 * 1000;
  const midDate = new Date(midTimestamp);
  const midHours = midDate.getHours().toString().padStart(2, '0');
  const midMins = midDate.getMinutes().toString().padStart(2, '0');
  const midClockTime = `${midHours}:${midMins}`;

  // Start enabled gate: step 3 visited (or preset used) AND checklist cleared
  const isStartReady = hasVisitedStep3OrPreset && isChecklistCleared;

  return (
    <div className={className ?? 'lg:col-span-8 relative flex flex-col'}>
      {/* Offset Shadow Slab */}
      <div
        className="absolute inset-0 translate-x-4 translate-y-4 rounded-[2px] bg-[#0d1926] border border-[#F4EFE4]/10 pointer-events-none"
        aria-hidden="true"
      />

      {/* Main Timer Card — DESIGN C: "SESSION STRIP" */}
      <div className="relative rounded-[2px] bg-[#172536] border border-[#B68A53]/30 p-5 sm:p-6 lg:p-7 shadow-2xl flex flex-col justify-between">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-3 pb-5 border-b border-[#F4EFE4]/15">
          <span className="font-public-condensed text-xs uppercase tracking-[0.22em] font-semibold text-[#B68A53]">
            FOCUS SESSION / {status === 'setup' ? 'SESSION STRIP' : status.toUpperCase()}
          </span>
          <span className="font-public-condensed text-xs uppercase tracking-[0.18em] text-[#F4EFE4]/60">
            {schedule.endsAt ? `ENDS ABOUT ${schedule.endsAt}` : ''}
          </span>
        </div>

        {/* Visual Timer Dial Area (Original Dial Layout) */}
        <div className="py-4 sm:py-6 flex flex-col items-center justify-center relative my-auto">
          <div className="relative w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] lg:w-[460px] lg:h-[460px] flex items-center justify-center">
            <svg
              viewBox="0 0 500 500"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full text-[#B68A53]"
              aria-label={`Timer dial showing ${formattedTime}`}
              role="img"
            >
              <defs>
                <radialGradient id="dial-c-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#1e3852" stopOpacity="0.55" />
                  <stop offset="65%" stopColor="#1e3852" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#172536" stopOpacity="0" />
                </radialGradient>
              </defs>

              <circle cx="250" cy="250" r="185" fill="url(#dial-c-glow)" />
              <circle cx="250" cy="250" r="148" stroke="#F4EFE4" strokeOpacity="0.14" strokeWidth="1" />
              <circle cx="250" cy="250" r="180" stroke="#1e3044" strokeWidth="9" />

              {/* Dynamic gold arc */}
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

              {/* Orbit bead on active tip */}
              <circle
                cx={beadX}
                cy={beadY}
                r="5"
                fill={phase === 'break' ? '#8799A7' : '#B68A53'}
                className="motion-safe:transition-[cx,cy] motion-safe:duration-200 motion-reduce:transition-none"
              />

              <circle cx="250" cy="100" r="14" fill="#D2A75D" opacity="0.25" />
              <circle cx="250" cy="100" r="3.5" fill="#D2A75D" />

              <circle cx="250" cy="250" r="218" stroke="#F4EFE4" strokeOpacity="0.12" strokeWidth="1" />
              <line x1="250.0" y1="58.0" x2="250.0" y2="28.0" stroke="#B68A53" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="442.0" y1="250.0" x2="472.0" y2="250.0" stroke="#B68A53" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="250.0" y1="442.0" x2="250.0" y2="472.0" stroke="#B68A53" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="58.0" y1="250.0" x2="28.0" y2="250.0" stroke="#B68A53" strokeWidth="1.5" strokeLinecap="round" />
            </svg>

            {/* Center Time & Title */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4"
              aria-live="polite"
              aria-atomic="true"
            >
              <span className="font-public-display text-8xl sm:text-9xl lg:text-[112px] font-normal leading-none tracking-tight text-[#F4EFE4] antialiased">
                {formattedTime}
              </span>
              <span className="font-public-condensed text-xs uppercase tracking-[0.28em] text-[#B68A53] font-semibold mt-3">
                {sessionTitle}
              </span>
              {status !== 'setup' && taskText && (
                <span className="font-public-sans text-xs text-[#F4EFE4]/70 mt-1 max-w-[220px] truncate">
                  &ldquo;{taskText}&rdquo;
                </span>
              )}
            </div>
          </div>
        </div>

        {/* PROPORTIONAL HORIZONTAL SESSION STRIP UNDER THE DIAL */}
        <div className="w-full max-w-[480px] mx-auto pt-3 pb-2 border-t border-[#F4EFE4]/15">
          <div className="flex items-center justify-between mb-2">
            <span className="font-public-condensed text-xs uppercase tracking-[0.2em] font-semibold text-[#B68A53]">
              SESSION TIMELINE STRIP
            </span>
            <span className="font-public-condensed text-xs uppercase tracking-wider text-[#F4EFE4]/60">
              {schedule.focusBlocks} FOCUS / {schedule.breaks} BREAKS
            </span>
          </div>

          {/* Proportional Strip Container with Moving Marker */}
          <div className="relative w-full h-7 bg-[#101b27] border border-[#F4EFE4]/20 rounded-[2px] p-0.5 flex overflow-hidden">
            {schedule.segments.map((seg, idx) => {
              const widthPct = (seg.minutes / totalSessionMins) * 100;
              const isFocus = seg.phase === 'focus';
              const isCompleted = idx < currentSegmentIndex;
              const isCurrent = idx === currentSegmentIndex;

              let bgClass = isFocus ? 'bg-[#B68A53]' : 'bg-[#8799A7]/40';
              if (status !== 'setup') {
                if (isCompleted) {
                  bgClass = isFocus ? 'bg-[#B68A53]/85' : 'bg-[#8799A7]/25';
                } else if (isCurrent) {
                  bgClass = isFocus ? 'bg-[#D2A75D]' : 'bg-[#BD634A]';
                } else {
                  bgClass = isFocus ? 'bg-[#B68A53]/40' : 'bg-[#8799A7]/15';
                }
              }

              return (
                <div
                  key={seg.id}
                  style={{ width: `${widthPct}%` }}
                  className={`h-full relative flex items-center justify-center border-r border-[#172536] last:border-r-0 transition-colors ${bgClass}`}
                  title={`${isFocus ? 'Focus' : 'Break'}: ${seg.minutes}m`}
                >
                  {widthPct > 12 && (
                    <span className="text-[10px] font-public-condensed font-bold text-[#172536] uppercase tracking-wider select-none truncate px-0.5">
                      {isFocus ? `F${seg.blockNumber}` : 'B'}
                    </span>
                  )}
                </div>
              );
            })}

            {/* Moving Marker while running / paused */}
            {status !== 'setup' && (
              <div
                className="absolute top-0 bottom-0 w-1 bg-[#F4EFE4] shadow-lg transition-[left] duration-300 pointer-events-none -translate-x-1/2 z-10"
                style={{ left: `${markerPct}%` }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-[#F4EFE4] -top-1 -left-[3px] absolute shadow" />
              </div>
            )}
          </div>

          {/* Tick Labels: Start, Middle, End Clock Times */}
          <div className="flex items-center justify-between mt-1 text-[11px] font-public-condensed uppercase tracking-wider text-[#F4EFE4]/60">
            <span>START NOW</span>
            <span>MID ~{midClockTime}</span>
            <span>ENDS ~{schedule.endsAt}</span>
          </div>
        </div>

        {/* BOTTOM ACTION BUTTONS: START (PAUSE/RESUME), SKIP, RESET WITH INLINE CONFIRM */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-[#F4EFE4]/15 min-h-[48px]">
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
                Reset session
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
            <div className="flex flex-col items-center gap-1.5">
              <button
                type="button"
                onClick={start}
                disabled={!isStartReady}
                aria-label="Start focus session"
                className={`w-36 py-2.5 rounded-[2px] font-public-condensed text-xs uppercase tracking-[0.22em] font-bold shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B68A53] focus-visible:ring-offset-2 focus-visible:ring-offset-[#172536] ${
                  isStartReady
                    ? 'bg-[#B68A53] text-[#172536] hover:bg-[#D2A75D] cursor-pointer'
                    : 'bg-[#B68A53]/35 text-[#172536]/60 cursor-not-allowed'
                }`}
              >
                START
              </button>
              {!isStartReady && (
                <span className="font-public-sans text-[11px] text-[#F4EFE4]/60">
                  {!hasVisitedStep3OrPreset
                    ? 'Visit Step 3 or select a preset in the side panel'
                    : 'Complete checklist in side panel'}
                </span>
              )}
            </div>
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

              <button
                type="button"
                onClick={skip}
                aria-label="Skip to next segment"
                className="w-28 sm:w-32 py-2.5 rounded-[2px] bg-[#172536] border border-[#F4EFE4]/30 text-[#F4EFE4] font-public-condensed text-xs uppercase tracking-[0.22em] font-medium transition-colors cursor-pointer hover:bg-[#1e3044] hover:border-[#F4EFE4]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B68A53]"
              >
                SKIP
              </button>

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
    </div>
  );
}

export default FocusTimer;
