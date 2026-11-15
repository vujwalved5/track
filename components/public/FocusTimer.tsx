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
    settings,
    schedule,
    updateSettings,
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

  // Stepper handlers
  const handleStudyChange = (delta: number) => {
    const next = Math.max(5, Math.min(120, settings.studyMin + delta));
    updateSettings({ studyMin: next });
  };

  const handleTotalChange = (delta: number) => {
    const next = Math.max(15, Math.min(480, settings.totalStudyMin + delta));
    updateSettings({ totalStudyMin: next });
  };

  const formatHoursMins = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}H ${m}M`;
    if (h > 0) return `${h}H`;
    return `${m} MIN`;
  };

  return (
    <div className={className ?? 'lg:col-span-8 relative flex flex-col'}>
      {/* Offset Shadow Slab behind the timer card */}
      <div
        className="absolute inset-0 translate-x-4 translate-y-4 rounded-[2px] bg-[#0d1926] border border-[#F4EFE4]/10 pointer-events-none"
        aria-hidden="true"
      />

      {/* Main Timer Card — DESIGN A: "THE LEDGER" */}
      <div className="relative rounded-[2px] bg-[#172536] border border-[#B68A53]/30 p-5 sm:p-6 lg:p-7 shadow-2xl flex flex-col justify-between">
        {/* Top row: Section label & Live Preview Line */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#F4EFE4]/15">
          <span className="font-public-condensed text-xs uppercase tracking-[0.22em] font-semibold text-[#B68A53]">
            FOCUS SESSION / {status === 'setup' ? 'THE LEDGER' : status.toUpperCase()}
          </span>

          {/* Live Preview Line in Gold Label Style */}
          <div className="font-public-condensed text-xs uppercase tracking-[0.16em] text-[#B68A53] font-medium">
            <span>
              {schedule.focusBlocks} FOCUS BLOCKS / {schedule.breaks} BREAKS / ENDS ABOUT {schedule.endsAt}
            </span>
            {schedule.droppedMinutes > 0 && (
              <span className="text-[#BD634A] ml-1.5 lowercase">
                (last {schedule.droppedMinutes} min dropped)
              </span>
            )}
          </div>
        </div>

        {/* Visual Timer Dial Area */}
        <div className="py-4 sm:py-6 flex flex-col items-center justify-center relative my-auto">
          <div className="relative w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] lg:w-[420px] lg:h-[420px] flex items-center justify-center">
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

              {/* Thick arc: gold for focus, sage/blue for break */}
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

              {/* Glowing amber beacon star at 12 o'clock */}
              <circle cx="250" cy="100" r="14" fill="#D2A75D" opacity="0.25" />
              <circle cx="250" cy="100" r="3.5" fill="#D2A75D" />

              {/* Thin outer ring */}
              <circle cx="250" cy="250" r="218" stroke="#F4EFE4" strokeOpacity="0.12" strokeWidth="1" />

              {/* Cardinal Ticks */}
              <line x1="250.0" y1="58.0" x2="250.0" y2="28.0" stroke="#B68A53" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="442.0" y1="250.0" x2="472.0" y2="250.0" stroke="#B68A53" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="250.0" y1="442.0" x2="250.0" y2="472.0" stroke="#B68A53" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="58.0" y1="250.0" x2="28.0" y2="250.0" stroke="#B68A53" strokeWidth="1.5" strokeLinecap="round" />

              {/* Hour Ticks */}
              <line x1="346.0" y1="83.7" x2="356.0" y2="66.4" stroke="#F4EFE4" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
              <line x1="416.3" y1="154.0" x2="433.6" y2="144.0" stroke="#F4EFE4" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
              <line x1="416.3" y1="346.0" x2="433.6" y2="356.0" stroke="#F4EFE4" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
              <line x1="346.0" y1="416.3" x2="356.0" y2="433.6" stroke="#F4EFE4" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
              <line x1="154.0" y1="416.3" x2="144.0" y2="433.6" stroke="#F4EFE4" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
              <line x1="83.7" y1="346.0" x2="66.4" y2="356.0" stroke="#F4EFE4" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
              <line x1="83.7" y1="154.0" x2="66.4" y2="144.0" stroke="#F4EFE4" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
              <line x1="154.0" y1="83.7" x2="144.0" y2="66.4" stroke="#F4EFE4" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
            </svg>

            {/* Center Time & Title */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4"
              aria-live="polite"
              aria-atomic="true"
            >
              <span className="font-public-display text-7xl sm:text-8xl lg:text-[104px] font-normal leading-none tracking-tight text-[#F4EFE4] antialiased">
                {formattedTime}
              </span>
              <span className="font-public-condensed text-xs uppercase tracking-[0.28em] text-[#B68A53] font-semibold mt-2.5">
                {sessionTitle}
              </span>
              {/* Show task under dial label while running */}
              {status !== 'setup' && taskText && (
                <span className="font-public-sans text-xs text-[#F4EFE4]/70 mt-1 max-w-[220px] truncate">
                  &ldquo;{taskText}&rdquo;
                </span>
              )}
            </div>
          </div>
        </div>

        {/* MIDDLE AREA: THE LEDGER SETUP ROWS OR COLLAPSED SCHEDULE LIST */}
        <div className="border-t border-b border-[#F4EFE4]/15 py-4 my-2">
          {status === 'setup' ? (
            /* FORM-LIKE SETUP (Replacing "Choose your pace") */
            <div className="flex flex-col gap-3.5">
              {/* Row 1: STUDY LENGTH */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-public-condensed text-xs uppercase tracking-[0.22em] font-semibold text-[#B68A53] w-36">
                  STUDY LENGTH
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-[#101b27] border border-[#F4EFE4]/20 rounded-[2px] p-0.5">
                    <button
                      type="button"
                      onClick={() => handleStudyChange(-5)}
                      aria-label="Decrease study duration by 5 minutes"
                      className="w-8 h-8 flex items-center justify-center text-[#F4EFE4] hover:bg-[#F4EFE4]/10 rounded-[2px] transition-colors cursor-pointer text-sm font-bold"
                    >
                      &minus;
                    </button>
                    <span className="w-20 text-center font-public-condensed text-xs tracking-wider text-[#F4EFE4] font-semibold">
                      {settings.studyMin} MIN
                    </span>
                    <button
                      type="button"
                      onClick={() => handleStudyChange(5)}
                      aria-label="Increase study duration by 5 minutes"
                      className="w-8 h-8 flex items-center justify-center text-[#F4EFE4] hover:bg-[#F4EFE4]/10 rounded-[2px] transition-colors cursor-pointer text-sm font-bold"
                    >
                      +
                    </button>
                  </div>
                  {/* Chips: 25, 50, 90 */}
                  <div className="flex items-center gap-1.5 ml-1">
                    {[25, 50, 90].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => updateSettings({ studyMin: mins })}
                        className={`px-2.5 py-1 text-[11px] font-public-condensed uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer ${
                          settings.studyMin === mins
                            ? 'bg-[#B68A53] text-[#172536] font-bold'
                            : 'bg-[#1a2b3d] text-[#F4EFE4]/70 border border-[#F4EFE4]/15 hover:border-[#F4EFE4]/35'
                        }`}
                      >
                        {mins}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 2: BREAK (Segmented 5 MIN / 10 MIN) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-public-condensed text-xs uppercase tracking-[0.22em] font-semibold text-[#B68A53] w-36">
                  BREAK
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-[#101b27] border border-[#F4EFE4]/20 rounded-[2px] p-0.5">
                    <button
                      type="button"
                      onClick={() => updateSettings({ breakMin: 5 })}
                      className={`px-4 py-1.5 text-xs font-public-condensed uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer ${
                        settings.breakMin === 5
                          ? 'bg-[#B68A53] text-[#172536] font-bold shadow-sm'
                          : 'text-[#F4EFE4]/70 hover:text-[#F4EFE4]'
                      }`}
                    >
                      5 MIN
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSettings({ breakMin: 10 })}
                      className={`px-4 py-1.5 text-xs font-public-condensed uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer ${
                        settings.breakMin === 10
                          ? 'bg-[#B68A53] text-[#172536] font-bold shadow-sm'
                          : 'text-[#F4EFE4]/70 hover:text-[#F4EFE4]'
                      }`}
                    >
                      10 MIN
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 3: TOTAL STUDY TIME */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-public-condensed text-xs uppercase tracking-[0.22em] font-semibold text-[#B68A53] w-36">
                  TOTAL STUDY TIME
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-[#101b27] border border-[#F4EFE4]/20 rounded-[2px] p-0.5">
                    <button
                      type="button"
                      onClick={() => handleTotalChange(-15)}
                      aria-label="Decrease total study time by 15 minutes"
                      className="w-8 h-8 flex items-center justify-center text-[#F4EFE4] hover:bg-[#F4EFE4]/10 rounded-[2px] transition-colors cursor-pointer text-sm font-bold"
                    >
                      &minus;
                    </button>
                    <span className="w-20 text-center font-public-condensed text-xs tracking-wider text-[#F4EFE4] font-semibold">
                      {formatHoursMins(settings.totalStudyMin)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTotalChange(15)}
                      aria-label="Increase total study time by 15 minutes"
                      className="w-8 h-8 flex items-center justify-center text-[#F4EFE4] hover:bg-[#F4EFE4]/10 rounded-[2px] transition-colors cursor-pointer text-sm font-bold"
                    >
                      +
                    </button>
                  </div>
                  {/* Chips: 1H, 2H, 3H, 4H */}
                  <div className="flex items-center gap-1.5 ml-1">
                    {[
                      { label: '1H', mins: 60 },
                      { label: '2H', mins: 120 },
                      { label: '3H', mins: 180 },
                      { label: '4H', mins: 240 },
                    ].map(({ label, mins }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => updateSettings({ totalStudyMin: mins })}
                        className={`px-2 py-1 text-[11px] font-public-condensed uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer ${
                          settings.totalStudyMin === mins
                            ? 'bg-[#B68A53] text-[#172536] font-bold'
                            : 'bg-[#1a2b3d] text-[#F4EFE4]/70 border border-[#F4EFE4]/15 hover:border-[#F4EFE4]/35'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* COLLAPSED READ-ONLY SCHEDULE LIST WHILE RUNNING / PAUSED / FINISHED */
            <div className="flex flex-col">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F4EFE4]/10 text-[#F4EFE4]/60 text-[11px] font-public-condensed uppercase tracking-wider">
                <span>SCHEDULE LIST (THE LEDGER)</span>
                <span>
                  {currentBlockNumber} OF {totalFocusBlocks} FOCUS BLOCKS
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 max-h-24 overflow-y-auto py-1">
                {schedule.segments.map((seg, idx) => {
                  const isActive = idx === currentSegmentIndex;
                  const isFinished = idx < currentSegmentIndex;
                  const tag =
                    seg.phase === 'focus'
                      ? `F${seg.blockNumber} ${seg.minutes}:00`
                      : `B${Math.ceil(idx / 2)} ${seg.minutes}:00`;

                  return (
                    <div
                      key={seg.id}
                      className={`px-2.5 py-1 rounded-[2px] font-public-condensed text-xs uppercase tracking-wider transition-all ${
                        isActive
                          ? 'bg-[#B68A53] text-[#172536] font-bold shadow'
                          : isFinished
                          ? 'line-through text-[#F4EFE4]/40 bg-[#101b27]/60'
                          : 'text-[#F4EFE4]/70 bg-[#1a2b3d] border border-[#F4EFE4]/10'
                      }`}
                    >
                      {tag}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM CONTROLS: START (PAUSE/RESUME), SKIP, RESET WITH INLINE CONFIRM */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3 min-h-[48px]">
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
    </div>
  );
}

export default FocusTimer;
