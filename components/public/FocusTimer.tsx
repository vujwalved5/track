'use client';

import { useState } from 'react';
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
    settings,
    schedule,
    updateSettings,
    applyPreset,
    start,
    pause,
    resume,
    skip,
    isResetConfirmOpen,
    openResetConfirm,
    cancelResetConfirm,
    confirmReset,
  } = useFocusSessionContext();

  // Active pill state in setup mode: 'study' | 'break' | 'total'
  const [activePill, setActivePill] = useState<'study' | 'break' | 'total'>('study');

  // Total session circumference: radius 180 -> 2 * PI * 180 ≈ 1130.97
  const C = 1131;
  const totalMins = Math.max(1, schedule.totalMinutes);

  // Proportional arc division for the whole session
  let accumulatedMins = 0;
  const sessionArcs = schedule.segments.map((seg, idx) => {
    const startMins = accumulatedMins;
    accumulatedMins += seg.minutes;
    const arcLength = (seg.minutes / totalMins) * C;
    const offset = (startMins / totalMins) * C;

    const isCurrent = idx === currentSegmentIndex;
    const isCompleted = idx < currentSegmentIndex;
    const isUpcoming = idx > currentSegmentIndex;

    return {
      seg,
      idx,
      arcLength,
      offset,
      isCurrent,
      isCompleted,
      isUpcoming,
    };
  });

  // Calculate position of active orbit bead
  const currentSeg = schedule.segments[currentSegmentIndex];
  let beadAngleDeg = -90;
  if (currentSeg) {
    const segStartMins = sessionArcs[currentSegmentIndex]?.offset ? (sessionArcs[currentSegmentIndex].offset / C) * totalMins : 0;
    const elapsedInSeg = currentSeg.minutes * (1 - segmentProgress);
    const currentMinsTotal = segStartMins + elapsedInSeg;
    beadAngleDeg = -90 + (currentMinsTotal / totalMins) * 360;
  }
  const beadRad = (beadAngleDeg * Math.PI) / 180;
  const beadX = Number((250 + 180 * Math.cos(beadRad)).toFixed(1));
  const beadY = Number((250 + 180 * Math.sin(beadRad)).toFixed(1));

  // Center display label
  let centerLabel = 'FOCUS 1 OF ' + schedule.focusBlocks;
  if (status === 'finished') {
    centerLabel = 'SESSION COMPLETE';
  } else if (status === 'running' || status === 'paused') {
    const totalPhaseBlocks = phase === 'focus' ? totalFocusBlocks : schedule.breaks;
    centerLabel = `${phase === 'focus' ? 'FOCUS' : 'BREAK'} ${currentBlockNumber} OF ${totalPhaseBlocks}`;
  }

  // Pill adjustment helpers
  const handlePillStep = (dir: 1 | -1) => {
    if (status !== 'setup') return;
    if (activePill === 'study') {
      const next = Math.max(5, Math.min(120, settings.studyMin + dir * 5));
      updateSettings({ studyMin: next });
    } else if (activePill === 'break') {
      updateSettings({ breakMin: settings.breakMin === 5 ? 10 : 5 });
    } else if (activePill === 'total') {
      const next = Math.max(15, Math.min(480, settings.totalStudyMin + dir * 15));
      updateSettings({ totalStudyMin: next });
    }
  };

  const handlePillClick = (pill: 'study' | 'break' | 'total') => {
    if (status !== 'setup') return;
    if (pill === 'break') {
      // BREAK toggles 5/10 on tap
      setActivePill('break');
      updateSettings({ breakMin: settings.breakMin === 5 ? 10 : 5 });
    } else {
      setActivePill(pill);
    }
  };

  const formatHoursMins = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}H ${m}M`;
    if (h > 0) return `${h}H`;
    return `${m}M`;
  };

  return (
    <div className={className ?? 'lg:col-span-8 relative flex flex-col'}>
      {/* Offset Shadow Slab */}
      <div
        className="absolute inset-0 translate-x-4 translate-y-4 rounded-[2px] bg-[#0d1926] border border-[#F4EFE4]/10 pointer-events-none"
        aria-hidden="true"
      />

      {/* Main Timer Card — DESIGN B: "DIAL-FIRST" */}
      <div className="relative rounded-[2px] bg-[#172536] border border-[#B68A53]/30 p-5 sm:p-6 lg:p-7 shadow-2xl flex flex-col justify-between">
        {/* Top Header Row with Presets as three small links */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#F4EFE4]/15">
          <span className="font-public-condensed text-xs uppercase tracking-[0.22em] font-semibold text-[#B68A53]">
            FOCUS SESSION / {status === 'setup' ? 'DIAL-FIRST' : status.toUpperCase()}
          </span>

          {/* Presets as three small links */}
          <div className="flex items-center gap-2 text-xs font-public-condensed uppercase tracking-wider">
            <span className="text-[#F4EFE4]/50">PRESETS:</span>
            <button
              type="button"
              disabled={status !== 'setup'}
              onClick={() => applyPreset(25, 5, 120)}
              className={`hover:underline cursor-pointer transition-colors ${
                settings.studyMin === 25 && settings.breakMin === 5
                  ? 'text-[#B68A53] font-bold underline'
                  : 'text-[#F4EFE4]/80'
              }`}
            >
              25/5
            </button>
            <span className="text-[#F4EFE4]/30">·</span>
            <button
              type="button"
              disabled={status !== 'setup'}
              onClick={() => applyPreset(50, 10, 180)}
              className={`hover:underline cursor-pointer transition-colors ${
                settings.studyMin === 50 && settings.breakMin === 10
                  ? 'text-[#B68A53] font-bold underline'
                  : 'text-[#F4EFE4]/80'
              }`}
            >
              50/10
            </button>
            <span className="text-[#F4EFE4]/30">·</span>
            <button
              type="button"
              disabled={status !== 'setup'}
              onClick={() => applyPreset(90, 10, 180)}
              className={`hover:underline cursor-pointer transition-colors ${
                settings.studyMin === 90 && settings.breakMin === 10
                  ? 'text-[#B68A53] font-bold underline'
                  : 'text-[#F4EFE4]/80'
              }`}
            >
              90/10
            </button>
          </div>
        </div>

        {/* Visual Timer Dial Area with Proportional Session Ring */}
        <div className="py-6 sm:py-8 flex flex-col items-center justify-center relative my-auto">
          <div className="relative w-[340px] h-[340px] sm:w-[440px] sm:h-[440px] lg:w-[480px] lg:h-[480px] flex items-center justify-center">
            <svg
              viewBox="0 0 500 500"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full text-[#B68A53]"
              aria-label={`Dial-First timer showing ${formattedTime}`}
              role="img"
            >
              <defs>
                <radialGradient id="dial-b-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#1e3852" stopOpacity="0.55" />
                  <stop offset="65%" stopColor="#1e3852" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#172536" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Radial glow */}
              <circle cx="250" cy="250" r="185" fill="url(#dial-b-glow)" />

              {/* Thin inner reference ring */}
              <circle cx="250" cy="250" r="148" stroke="#F4EFE4" strokeOpacity="0.12" strokeWidth="1" />

              {/* Base background ring */}
              <circle cx="250" cy="250" r="180" stroke="#1e3044" strokeWidth="9" />

              {/* PROPORTIONAL SESSION ARCS (Gold = Focus, Thin Dim = Breaks) */}
              {sessionArcs.map(({ seg, idx, arcLength, offset, isCurrent, isCompleted, isUpcoming }) => {
                const isFocus = seg.phase === 'focus';
                const strokeWidth = isFocus ? 9 : 4;
                // Leave a tiny 2px visual gap between adjacent arcs
                const displayArc = Math.max(1, arcLength - 2);

                let strokeColor = isFocus ? '#B68A53' : '#8799A7';
                let opacity = isFocus ? 1 : 0.45;

                if (status !== 'setup') {
                  if (isCompleted) {
                    strokeColor = isFocus ? '#B68A53' : '#8799A7';
                    opacity = isFocus ? 0.9 : 0.35;
                  } else if (isCurrent) {
                    strokeColor = isFocus ? '#D2A75D' : '#8799A7';
                    opacity = 1;
                  } else if (isUpcoming) {
                    opacity = 0.25;
                  }
                }

                return (
                  <circle
                    key={seg.id}
                    cx="250"
                    cy="250"
                    r="180"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${displayArc} ${C - displayArc}`}
                    strokeDashoffset={-offset}
                    opacity={opacity}
                    strokeLinecap="round"
                    transform="rotate(-90 250 250)"
                    className="transition-all duration-300"
                  />
                );
              })}

              {/* Active segment sweeping overlay when running / paused */}
              {status !== 'setup' && currentSeg && (
                <circle
                  cx="250"
                  cy="250"
                  r="180"
                  stroke={currentSeg.phase === 'focus' ? '#F4EFE4' : '#BD634A'}
                  strokeWidth="9"
                  strokeDasharray={`${Math.max(1, (sessionArcs[currentSegmentIndex]?.arcLength || 0) * (1 - segmentProgress))} ${C}`}
                  strokeDashoffset={-(sessionArcs[currentSegmentIndex]?.offset || 0)}
                  strokeLinecap="round"
                  transform="rotate(-90 250 250)"
                  className="motion-safe:transition-all motion-safe:duration-200"
                />
              )}

              {/* Orbit bead on active position */}
              {status !== 'setup' && (
                <circle
                  cx={beadX}
                  cy={beadY}
                  r="5"
                  fill="#F4EFE4"
                  className="motion-safe:transition-[cx,cy] motion-safe:duration-200 motion-reduce:transition-none"
                />
              )}

              {/* Dial markings */}
              <circle cx="250" cy="250" r="218" stroke="#F4EFE4" strokeOpacity="0.1" strokeWidth="1" />
              <line x1="250.0" y1="58.0" x2="250.0" y2="28.0" stroke="#B68A53" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="442.0" y1="250.0" x2="472.0" y2="250.0" stroke="#B68A53" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="250.0" y1="442.0" x2="250.0" y2="472.0" stroke="#B68A53" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="58.0" y1="250.0" x2="28.0" y2="250.0" stroke="#B68A53" strokeWidth="1.5" strokeLinecap="round" />
            </svg>

            {/* Center Time Readout, Center Label, Pills, and Preview */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              {/* Digits */}
              <span className="font-public-display text-7xl sm:text-8xl lg:text-[104px] font-normal leading-none tracking-tight text-[#F4EFE4] antialiased">
                {formattedTime}
              </span>

              {/* Centre label: FOCUS 1 OF 5 / BREAK 1 OF 4 */}
              <span className="font-public-condensed text-xs uppercase tracking-[0.28em] text-[#B68A53] font-semibold mt-2">
                {centerLabel}
              </span>

              {/* Task text if active */}
              {status !== 'setup' && taskText && (
                <span className="font-public-sans text-xs text-[#F4EFE4]/70 mt-1 max-w-[220px] truncate">
                  &ldquo;{taskText}&rdquo;
                </span>
              )}

              {/* THREE INLINE PILL CONTROLS: STUDY 25, BREAK 5, TOTAL 2H */}
              <div className="flex items-center gap-2 mt-4" role="group" aria-label="Dial parameter controls">
                {/* Pill 1: STUDY */}
                <button
                  type="button"
                  disabled={status !== 'setup'}
                  onClick={() => handlePillClick('study')}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
                      e.preventDefault();
                      handlePillStep(1);
                    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
                      e.preventDefault();
                      handlePillStep(-1);
                    }
                  }}
                  className={`px-3 py-1 rounded-full font-public-condensed text-xs uppercase tracking-wider transition-all ${
                    status === 'setup' ? 'cursor-pointer' : 'cursor-default'
                  } ${
                    status === 'setup' && activePill === 'study'
                      ? 'ring-2 ring-[#B68A53] bg-[#B68A53]/20 text-[#F4EFE4] font-bold shadow'
                      : 'bg-[#101b27] text-[#F4EFE4]/80 border border-[#F4EFE4]/20'
                  }`}
                >
                  STUDY {settings.studyMin}
                </button>

                {/* Pill 2: BREAK (toggles 5/10) */}
                <button
                  type="button"
                  disabled={status !== 'setup'}
                  onClick={() => handlePillClick('break')}
                  className={`px-3 py-1 rounded-full font-public-condensed text-xs uppercase tracking-wider transition-all ${
                    status === 'setup' ? 'cursor-pointer' : 'cursor-default'
                  } ${
                    status === 'setup' && activePill === 'break'
                      ? 'ring-2 ring-[#B68A53] bg-[#B68A53]/20 text-[#F4EFE4] font-bold shadow'
                      : 'bg-[#101b27] text-[#F4EFE4]/80 border border-[#F4EFE4]/20'
                  }`}
                >
                  BREAK {settings.breakMin}
                </button>

                {/* Pill 3: TOTAL */}
                <button
                  type="button"
                  disabled={status !== 'setup'}
                  onClick={() => handlePillClick('total')}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
                      e.preventDefault();
                      handlePillStep(1);
                    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
                      e.preventDefault();
                      handlePillStep(-1);
                    }
                  }}
                  className={`px-3 py-1 rounded-full font-public-condensed text-xs uppercase tracking-wider transition-all ${
                    status === 'setup' ? 'cursor-pointer' : 'cursor-default'
                  } ${
                    status === 'setup' && activePill === 'total'
                      ? 'ring-2 ring-[#B68A53] bg-[#B68A53]/20 text-[#F4EFE4] font-bold shadow'
                      : 'bg-[#101b27] text-[#F4EFE4]/80 border border-[#F4EFE4]/20'
                  }`}
                >
                  TOTAL {formatHoursMins(settings.totalStudyMin)}
                </button>
              </div>

              {/* Minus / Plus Stepper Buttons for active pill in setup mode */}
              {status === 'setup' && (
                <div className="flex items-center gap-3 mt-2 animate-fade-in">
                  <button
                    type="button"
                    onClick={() => handlePillStep(-1)}
                    aria-label={`Decrease active ${activePill}`}
                    className="w-7 h-7 rounded-full bg-[#101b27] border border-[#F4EFE4]/25 text-[#F4EFE4] hover:bg-[#F4EFE4]/15 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
                  >
                    &minus;
                  </button>
                  <span className="font-public-sans text-[11px] text-[#F4EFE4]/60 uppercase tracking-wider">
                    ADJUST {activePill.toUpperCase()}
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePillStep(1)}
                    aria-label={`Increase active ${activePill}`}
                    className="w-7 h-7 rounded-full bg-[#101b27] border border-[#F4EFE4]/25 text-[#F4EFE4] hover:bg-[#F4EFE4]/15 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
                  >
                    +
                  </button>
                </div>
              )}

              {/* Preview ENDS ABOUT under the pills */}
              <div className="font-public-condensed text-xs uppercase tracking-[0.2em] text-[#B68A53] font-medium mt-3">
                ENDS ABOUT {schedule.endsAt}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM CONTROLS: START (PAUSE/RESUME), SKIP, RESET WITH INLINE CONFIRM */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-[#F4EFE4]/15 min-h-[48px]">
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
                disabled={!isChecklistCleared}
                aria-label="Start focus session"
                className={`w-36 py-2.5 rounded-[2px] font-public-condensed text-xs uppercase tracking-[0.22em] font-bold shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B68A53] focus-visible:ring-offset-2 focus-visible:ring-offset-[#172536] ${
                  isChecklistCleared
                    ? 'bg-[#B68A53] text-[#172536] hover:bg-[#D2A75D] cursor-pointer'
                    : 'bg-[#B68A53]/35 text-[#172536]/60 cursor-not-allowed'
                }`}
              >
                START
              </button>
              {!isChecklistCleared && (
                <span className="font-public-sans text-[11px] text-[#F4EFE4]/60">
                  Complete checklist on the right to start
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
