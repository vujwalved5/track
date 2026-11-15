'use client';

import { useFocusTimer, PRESET_CONFIG, PresetKey } from './hooks/useFocusTimer';

export interface FocusTimerProps {
  className?: string;
  initialPreset?: PresetKey;
}

const PRESET_KEYS: PresetKey[] = ['focus', 'shortBreak', 'longBreak'];

export function FocusTimer({ className, initialPreset }: FocusTimerProps) {
  const {
    isRunning,
    isFinished,
    activePreset,
    progress,
    start,
    pause,
    reset,
    setPreset,
    formattedTime,
  } = useFocusTimer({ initialPreset });

  // Compute dynamic arc stroke-dasharray based on remaining progress (0..1)
  // At progress = 1: dash length is 612.6 (195 degrees of radius 180 circle, circumference ~1131)
  const arcDashLength = (progress * 612.6).toFixed(1);
  const strokeDasharray = `${arcDashLength} 1131`;

  // Compute dynamic orbit bead position on the tip of the gold arc
  // Formula: angle = -90 + progress * 195 degrees
  // At progress = 1: angle = 105 deg -> (203.4, 423.9) matching static design (203, 424)
  const angleDeg = -90 + progress * 195;
  const angleRad = (angleDeg * Math.PI) / 180;
  const beadX = Number((250 + 180 * Math.cos(angleRad)).toFixed(1));
  const beadY = Number((250 + 180 * Math.sin(angleRad)).toFixed(1));

  // Center display label
  const sessionTitle = isFinished
    ? 'SESSION COMPLETE'
    : PRESET_CONFIG[activePreset].title;

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
            FOCUS SESSION / 01
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
                stroke="#B68A53"
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
                fill="#B68A53"
                className="motion-safe:transition-[cx,cy] motion-safe:duration-200 motion-reduce:transition-none"
              />

              {/* Glowing amber beacon star at 12 o'clock inside dial */}
              <circle cx="250" cy="100" r="14" fill="#D2A75D" opacity="0.25" />
              <circle cx="250" cy="100" r="3.5" fill="#D2A75D" />

              {/* Thin outer ring */}
              <circle cx="250" cy="250" r="218" stroke="#F4EFE4" strokeOpacity="0.12" strokeWidth="1" />

              {/* 4 Cardinal Ticks (0, 90, 180, 270 deg) extending outward to outer ring */}
              <line x1="250.0" y1="58.0" x2="250.0" y2="28.0" stroke="#B68A53" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="442.0" y1="250.0" x2="472.0" y2="250.0" stroke="#B68A53" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="250.0" y1="442.0" x2="250.0" y2="472.0" stroke="#B68A53" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="58.0" y1="250.0" x2="28.0" y2="250.0" stroke="#B68A53" strokeWidth="1.5" strokeLinecap="round" />

              {/* 8 Intermediate Hour Ticks (30, 60, 120, 150, 210, 240, 300, 330 deg) */}
              <line x1="346.0" y1="83.7" x2="356.0" y2="66.4" stroke="#F4EFE4" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
              <line x1="416.3" y1="154.0" x2="433.6" y2="144.0" stroke="#F4EFE4" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
              <line x1="416.3" y1="346.0" x2="433.6" y2="356.0" stroke="#F4EFE4" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
              <line x1="346.0" y1="416.3" x2="356.0" y2="433.6" stroke="#F4EFE4" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
              <line x1="154.0" y1="416.3" x2="144.0" y2="433.6" stroke="#F4EFE4" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
              <line x1="83.7" y1="346.0" x2="66.4" y2="356.0" stroke="#F4EFE4" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
              <line x1="83.7" y1="154.0" x2="66.4" y2="144.0" stroke="#F4EFE4" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />
              <line x1="154.0" y1="83.7" x2="144.0" y2="66.4" stroke="#F4EFE4" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />

              {/* 12 Minor Ticks (every 15 deg) */}
              <line x1="299.7" y1="64.5" x2="302.3" y2="54.9" stroke="#F4EFE4" strokeOpacity="0.22" strokeWidth="0.8" strokeLinecap="round" />
              <line x1="385.8" y1="114.2" x2="392.8" y2="107.2" stroke="#F4EFE4" strokeOpacity="0.22" strokeWidth="0.8" strokeLinecap="round" />
              <line x1="435.5" y1="200.3" x2="445.1" y2="197.7" stroke="#F4EFE4" strokeOpacity="0.22" strokeWidth="0.8" strokeLinecap="round" />
              <line x1="435.5" y1="299.7" x2="445.1" y2="302.3" stroke="#F4EFE4" strokeOpacity="0.22" strokeWidth="0.8" strokeLinecap="round" />
              <line x1="385.8" y1="385.8" x2="392.8" y2="392.8" stroke="#F4EFE4" strokeOpacity="0.22" strokeWidth="0.8" strokeLinecap="round" />
              <line x1="299.7" y1="435.5" x2="302.3" y2="445.1" stroke="#F4EFE4" strokeOpacity="0.22" strokeWidth="0.8" strokeLinecap="round" />
              <line x1="200.3" y1="435.5" x2="197.7" y2="445.1" stroke="#F4EFE4" strokeOpacity="0.22" strokeWidth="0.8" strokeLinecap="round" />
              <line x1="114.2" y1="385.8" x2="107.2" y2="392.8" stroke="#F4EFE4" strokeOpacity="0.22" strokeWidth="0.8" strokeLinecap="round" />
              <line x1="64.5" y1="299.7" x2="54.9" y2="302.3" stroke="#F4EFE4" strokeOpacity="0.22" strokeWidth="0.8" strokeLinecap="round" />
              <line x1="64.5" y1="200.3" x2="54.9" y2="197.7" stroke="#F4EFE4" strokeOpacity="0.22" strokeWidth="0.8" strokeLinecap="round" />
              <line x1="114.2" y1="114.2" x2="107.2" y2="107.2" stroke="#F4EFE4" strokeOpacity="0.22" strokeWidth="0.8" strokeLinecap="round" />
              <line x1="200.3" y1="64.5" x2="197.7" y2="54.9" stroke="#F4EFE4" strokeOpacity="0.22" strokeWidth="0.8" strokeLinecap="round" />
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

          {/* Action Buttons: START, PAUSE, RESET */}
          <div className="flex items-center gap-3 mt-4 sm:mt-6">
            <button
              type="button"
              onClick={start}
              aria-label="Start focus timer"
              className={`w-28 sm:w-32 py-2.5 rounded-[2px] font-public-condensed text-xs uppercase tracking-[0.22em] font-bold shadow transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B68A53] focus-visible:ring-offset-2 focus-visible:ring-offset-[#172536] ${
                isRunning
                  ? 'bg-[#B68A53] text-[#172536] opacity-90'
                  : 'bg-[#B68A53] text-[#172536] hover:bg-[#D2A75D]'
              }`}
            >
              START
            </button>
            <button
              type="button"
              onClick={pause}
              aria-label="Pause focus timer"
              className="w-28 sm:w-32 py-2.5 rounded-[2px] bg-[#172536] border border-[#F4EFE4]/30 text-[#F4EFE4] font-public-condensed text-xs uppercase tracking-[0.22em] font-medium transition-colors cursor-pointer hover:bg-[#1e3044] hover:border-[#F4EFE4]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B68A53] focus-visible:ring-offset-2 focus-visible:ring-offset-[#172536]"
            >
              PAUSE
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset focus timer"
              className="w-28 sm:w-32 py-2.5 rounded-[2px] bg-[#172536] border border-[#F4EFE4]/30 text-[#F4EFE4]/80 font-public-condensed text-xs uppercase tracking-[0.22em] font-medium transition-colors cursor-pointer hover:bg-[#1e3044] hover:text-[#F4EFE4] hover:border-[#F4EFE4]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B68A53] focus-visible:ring-offset-2 focus-visible:ring-offset-[#172536]"
            >
              RESET
            </button>
          </div>
        </div>

        {/* Bottom Section: CHOOSE YOUR PACE + Tabs matching reference 52px height and rounded inactive corners */}
        <div className="pt-5 mt-4 border-t border-[#F4EFE4]/15">
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-public-condensed text-xs uppercase tracking-[0.25em] font-semibold text-[#B68A53]">
              CHOOSE YOUR PACE
            </span>
            <span className="font-public-condensed text-xs uppercase tracking-[0.2em] font-semibold text-[#B68A53]">
              01 — 03
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="tablist" aria-label="Timer presets">
            {PRESET_KEYS.map((key) => {
              const preset = PRESET_CONFIG[key];
              const isActive = activePreset === key;

              return (
                <div key={key} className="flex flex-col">
                  {isActive ? (
                    /* Active tab with cut bottom-left corner and gold underline */
                    <button
                      type="button"
                      role="tab"
                      aria-selected="true"
                      tabIndex={0}
                      onClick={() => setPreset(key)}
                      className="w-full h-[52px] flex items-center justify-center bg-[#F4EFE4] text-[#172536] font-public-condensed text-xs uppercase tracking-[0.18em] font-bold text-center cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B68A53] focus-visible:ring-offset-2 focus-visible:ring-offset-[#172536]"
                      style={{
                        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
                      }}
                    >
                      {preset.label}
                    </button>
                  ) : (
                    /* Inactive tab with 52px height and rounded-[8px] corners matching reference */
                    <button
                      type="button"
                      role="tab"
                      aria-selected="false"
                      tabIndex={0}
                      onClick={() => setPreset(key)}
                      className="w-full h-[52px] flex items-center justify-center rounded-[8px] bg-[#172536] text-[#F4EFE4]/80 border border-[#F4EFE4]/20 font-public-condensed text-xs uppercase tracking-[0.18em] font-medium text-center cursor-pointer transition-colors hover:border-[#F4EFE4]/40 hover:text-[#F4EFE4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B68A53] focus-visible:ring-offset-2 focus-visible:ring-offset-[#172536]"
                    >
                      {preset.label}
                    </button>
                  )}

                  {/* Underline bar: gold when active, transparent spacer when inactive to ensure uniform column heights */}
                  <div
                    className={`w-full h-[2px] mt-1 transition-opacity ${
                      isActive ? 'bg-[#B68A53] opacity-100' : 'bg-transparent opacity-0'
                    }`}
                    aria-hidden="true"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FocusTimer;
