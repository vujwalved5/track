'use client';

import { useState, useEffect } from 'react';
import { FocusTimer } from './FocusTimer';
import { FocusSessionProvider, useFocusSessionContext } from './hooks/useFocusSession';
import { AmbientSoundId } from '@/lib/ambient';

// 4-stage box breathing guide (4s each = 16s cycle)
function BreathingGuide() {
  const { status, phase } = useFocusSessionContext();
  const [stageIndex, setStageIndex] = useState<number>(0);

  const isBreathingActive = status === 'running' && phase === 'break';

  useEffect(() => {
    if (!isBreathingActive) {
      setStageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % 4);
    }, 4000);

    return () => clearInterval(interval);
  }, [isBreathingActive]);

  const stages = [
    { label: 'INHALE', radius: 'w-4 h-4' },
    { label: 'HOLD', radius: 'w-5 h-5' },
    { label: 'EXHALE', radius: 'w-2.5 h-2.5' },
    { label: 'REST', radius: 'w-3.5 h-3.5' },
  ];

  return (
    <div className="py-2.5 border-t border-[#172536]/18">
      <div className="flex items-center justify-between mb-2">
        <span className="font-public-condensed text-[11px] uppercase tracking-[0.22em] font-semibold text-[#60432F]">
          A BREATHING GUIDE {isBreathingActive ? '(ACTIVE)' : '(PAUSED)'}
        </span>
        <span className="font-public-sans text-[10px] text-[#60432F]/70">
          {isBreathingActive ? '4s rhythm' : 'Breaks only'}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1.5 py-1 text-center">
        {stages.map((stage, idx) => {
          const isActive = isBreathingActive && stageIndex === idx;
          return (
            <div key={stage.label} className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                  isActive
                    ? 'border-[#B68A53] bg-[#B68A53]/25 scale-105 motion-reduce:scale-100 motion-safe:animate-pulse'
                    : 'border-[#60432F]/40 bg-transparent'
                }`}
                aria-hidden="true"
              >
                <span
                  className={`${stage.radius} rounded-full border ${
                    isActive ? 'border-[#B68A53] bg-[#B68A53]' : 'border-[#60432F]/70'
                  }`}
                />
              </div>
              <span
                className={`font-public-condensed text-[10px] uppercase tracking-[0.16em] font-semibold transition-colors ${
                  isActive ? 'text-[#B68A53]' : 'text-[#60432F]'
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Side Panel Content for Design B ("Dial-First")
// Order: task, sound (vertical list of five rows with line-style SVG waveforms), checklist, progress, breathing
function DialFirstSidePanel() {
  const {
    taskText,
    setTaskText,
    soundId,
    setSoundId,
    volume,
    setVolume,
    pauseMusicInBreaks,
    setPauseMusicInBreaks,
    chimeMuted,
    setChimeMuted,
    checklist,
    toggleChecklistItem,
    skipChecklist,
    isChecklistCleared,
    currentBlockNumber,
    totalFocusBlocks,
    studiedMinutes,
    totalTargetStudyMinutes,
    overallProgress,
  } = useFocusSessionContext();

  const sounds: { id: AmbientSoundId; label: string; desc: string }[] = [
    { id: 'off', label: 'OFF', desc: 'Silence' },
    { id: 'brown', label: 'BROWN', desc: 'Deep warm low rumble' },
    { id: 'pink', label: 'PINK', desc: 'Balanced 1/f soothing noise' },
    { id: 'white', label: 'WHITE', desc: 'Crisp uniform sound bed' },
    { id: 'rain', label: 'RAIN', desc: 'Procedural shower & drops' },
  ];

  return (
    <div className="lg:col-span-4 relative flex flex-col mt-8 lg:mt-[43px]">
      {/* Outer Cream Card */}
      <div
        className="relative bg-[#F4EFE4] text-[#172536] p-2.5 shadow-2xl flex flex-col justify-between"
        style={{
          clipPath: 'polygon(0 0, calc(100% - 32px) 0, 100% 32px, 100% 100%, 0 100%)',
        }}
      >
        <div
          className="relative border border-[#172536]/25 p-1 flex-1 flex flex-col justify-between"
          style={{
            clipPath: 'polygon(0 0, calc(100% - 27px) 0, 100% 27px, 100% 100%, 0 100%)',
          }}
        >
          <div
            className="relative border border-[#172536]/25 p-4 sm:p-5 lg:p-6 flex-1 flex flex-col justify-between gap-4"
            style={{
              clipPath: 'polygon(0 0, calc(100% - 23px) 0, 100% 23px, 100% 100%, 0 100%)',
            }}
          >
            {/* 1. TASK SECTION (FIRST IN DESIGN B) */}
            <div>
              <span className="font-public-condensed text-[11px] uppercase tracking-[0.25em] font-semibold text-[#60432F] block">
                01 / INTENTION & TASK
              </span>
              <h3 className="font-public-display text-2xl sm:text-3xl text-[#172536] tracking-tight font-normal mt-1 antialiased">
                Today&apos;s Focus
              </h3>
              <div className="mt-2.5">
                <input
                  type="text"
                  value={taskText}
                  onChange={(e) => setTaskText(e.target.value)}
                  placeholder="Define your single task..."
                  className="w-full px-3 py-1.5 text-xs font-public-sans bg-transparent border border-[#172536]/25 rounded-[2px] text-[#172536] placeholder-[#172536]/40 focus:outline-none focus:border-[#B68A53]"
                />
              </div>
            </div>

            {/* 2. SOUND CONTROLS SECTION: VERTICAL LIST OF 5 ROWS WITH LINE-STYLE SVG WAVEFORMS */}
            <div className="pt-2 border-t border-[#172536]/18">
              <div className="flex items-center justify-between mb-2">
                <span className="font-public-condensed text-[11px] uppercase tracking-[0.22em] font-semibold text-[#60432F]">
                  02 / AMBIENT SOUND (5 MODES)
                </span>
                <button
                  type="button"
                  onClick={() => setChimeMuted(!chimeMuted)}
                  className="font-public-sans text-[11px] text-[#60432F] hover:text-[#172536] cursor-pointer"
                >
                  {chimeMuted ? 'Chime muted' : 'Chime on'}
                </button>
              </div>

              {/* Vertical list of 5 rows with line waveforms */}
              <div className="flex flex-col gap-1.5" role="radiogroup" aria-label="Ambient sound tracks">
                {sounds.map((s) => {
                  const isSelected = soundId === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setSoundId(s.id)}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-[2px] transition-all text-left cursor-pointer ${
                        isSelected
                          ? 'bg-[#172536] text-[#F4EFE4] shadow'
                          : 'bg-[#172536]/5 text-[#172536]/80 hover:bg-[#172536]/10 border border-[#172536]/10'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-[#B68A53] bg-[#B68A53]' : 'border-[#172536]/40'
                          }`}
                        />
                        <div>
                          <span className="font-public-condensed text-xs uppercase tracking-wider font-bold">
                            {s.label}
                          </span>
                          <span className={`block text-[10px] font-public-sans ${isSelected ? 'text-[#F4EFE4]/60' : 'text-[#172536]/50'}`}>
                            {s.desc}
                          </span>
                        </div>
                      </div>

                      {/* Small line-style SVG waveform (no emoji) */}
                      <svg width="48" height="18" viewBox="0 0 48 18" fill="none" className="shrink-0" aria-hidden="true">
                        {s.id === 'off' ? (
                          <line x1="2" y1="9" x2="46" y2="9" stroke={isSelected ? '#F4EFE4' : '#172536'} strokeWidth="1" strokeDasharray="2 3" opacity="0.4" />
                        ) : s.id === 'brown' ? (
                          <path d="M2 9 Q8 4, 14 9 T26 9 T38 9 T46 9" stroke={isSelected ? '#B68A53' : '#172536'} strokeWidth="1.5" fill="none" />
                        ) : s.id === 'pink' ? (
                          <path d="M2 9 Q6 3, 10 9 T18 9 T26 3 T34 9 T42 5 T46 9" stroke={isSelected ? '#B68A53' : '#172536'} strokeWidth="1.2" fill="none" />
                        ) : s.id === 'white' ? (
                          <path d="M2 9 L5 4 L8 14 L12 2 L16 16 L20 4 L24 14 L28 3 L32 15 L36 5 L40 13 L44 4 L46 9" stroke={isSelected ? '#B68A53' : '#172536'} strokeWidth="1" fill="none" />
                        ) : (
                          /* Rain */
                          <g stroke={isSelected ? '#B68A53' : '#172536'} strokeWidth="1.2">
                            <line x1="6" y1="3" x2="4" y2="8" />
                            <line x1="16" y1="7" x2="14" y2="13" />
                            <line x1="26" y1="2" x2="24" y2="9" />
                            <line x1="36" y1="6" x2="34" y2="12" />
                            <line x1="44" y1="3" x2="42" y2="8" />
                          </g>
                        )}
                      </svg>
                    </button>
                  );
                })}
              </div>

              {/* Volume & Break Ducking */}
              <div className="flex flex-col gap-2 mt-2.5">
                <div className="flex items-center gap-3">
                  <span className="font-public-condensed text-[11px] uppercase tracking-wider text-[#60432F] font-semibold">
                    VOL
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    aria-label="Sound volume"
                    className="flex-1 h-1.5 bg-[#172536]/20 rounded-full cursor-pointer accent-[#172536]"
                  />
                  <span className="font-public-sans text-[11px] text-[#172536]/70 w-8 text-right">
                    {Math.round(volume * 100)}%
                  </span>
                </div>

                <label className="flex items-center gap-2 cursor-pointer font-public-sans text-xs text-[#172536]/80">
                  <input
                    type="checkbox"
                    checked={pauseMusicInBreaks}
                    onChange={(e) => setPauseMusicInBreaks(e.target.checked)}
                    className="rounded border-[#172536]/30 accent-[#172536] cursor-pointer"
                  />
                  <span>Pause music during breaks</span>
                </label>
              </div>
            </div>

            {/* 3. CHECKLIST SECTION */}
            <div className="pt-2 border-t border-[#172536]/18">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-public-condensed text-[11px] uppercase tracking-[0.22em] font-semibold text-[#60432F]">
                  03 / PRE-SESSION RITUAL
                </span>
                {!isChecklistCleared && (
                  <button
                    type="button"
                    onClick={skipChecklist}
                    className="font-public-sans text-[11px] text-[#B68A53] hover:underline cursor-pointer"
                  >
                    Skip checklist
                  </button>
                )}
              </div>

              <div className="font-public-sans text-xs text-[#172536] flex flex-col">
                <button
                  type="button"
                  onClick={() => toggleChecklistItem('clearDesk')}
                  className="border-t border-[#172536]/18 py-1.5 flex items-center gap-2.5 text-left w-full hover:bg-[#172536]/5 transition-colors cursor-pointer px-1 rounded-sm"
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full border border-[#172536]/55 flex items-center justify-center shrink-0 ${
                      checklist.clearDesk ? 'bg-[#172536] text-[#F4EFE4]' : 'bg-transparent'
                    }`}
                  >
                    {checklist.clearDesk && (
                      <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    )}
                  </span>
                  <span className={checklist.clearDesk ? 'line-through opacity-70' : ''}>Clear your desk</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleChecklistItem('chooseTask')}
                  className="border-t border-[#172536]/18 py-1.5 flex items-center gap-2.5 text-left w-full hover:bg-[#172536]/5 transition-colors cursor-pointer px-1 rounded-sm"
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full border border-[#172536]/55 flex items-center justify-center shrink-0 ${
                      checklist.chooseTask ? 'bg-[#172536] text-[#F4EFE4]' : 'bg-transparent'
                    }`}
                  >
                    {checklist.chooseTask && (
                      <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    )}
                  </span>
                  <span className={checklist.chooseTask ? 'line-through opacity-70' : ''}>Choose one task</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleChecklistItem('takeBreath')}
                  className="border-t border-b border-[#172536]/18 py-1.5 flex items-center gap-2.5 text-left w-full hover:bg-[#172536]/5 transition-colors cursor-pointer px-1 rounded-sm"
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full border border-[#172536]/55 flex items-center justify-center shrink-0 ${
                      checklist.takeBreath ? 'bg-[#172536] text-[#F4EFE4]' : 'bg-transparent'
                    }`}
                  >
                    {checklist.takeBreath && (
                      <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    )}
                  </span>
                  <span className={checklist.takeBreath ? 'line-through opacity-70' : ''}>Take a breath</span>
                </button>
              </div>
            </div>

            {/* 4. PROGRESS SECTION */}
            <div className="pt-2 border-t border-[#172536]/18">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-public-condensed text-[11px] uppercase tracking-[0.22em] font-semibold text-[#60432F]">
                  BLOCK {currentBlockNumber} OF {totalFocusBlocks}
                </span>
                <span className="font-public-condensed text-[11px] uppercase tracking-wider text-[#172536]/70 font-semibold">
                  STUDIED {studiedMinutes} / {totalTargetStudyMinutes} MIN
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#172536]/15 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#B68A53] transition-all duration-300 rounded-full"
                  style={{ width: `${Math.round(overallProgress * 100)}%` }}
                />
              </div>
            </div>

            {/* 5. BREATHING GUIDE SECTION */}
            <BreathingGuide />

            {/* 6. SHRUNK RADAR CHART */}
            <div className="pt-2 border-t border-[#172536]/18 flex items-center justify-center">
              <div className="w-20 h-20 aspect-square opacity-70">
                <svg
                  viewBox="0 0 220 220"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full text-[#172536]"
                  aria-label="Habit compass icon"
                  role="img"
                >
                  <circle cx="110" cy="110" r="70" stroke="#172536" strokeOpacity="0.8" strokeWidth="1.2" />
                  <circle cx="110" cy="110" r="45" stroke="#172536" strokeOpacity="0.7" strokeWidth="1.2" strokeDasharray="3 3" />
                  <polygon points="98,52 155,88 142,148 78,148 58,96" fill="none" stroke="#172536" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FocusThePractice() {
  return (
    <FocusSessionProvider>
      <section id="practice" className="pt-14 pb-4 lg:pt-16 lg:pb-4 bg-[#172536] text-[#F4EFE4] overflow-hidden">
        <div className="max-w-[1366px] mx-auto px-6 sm:px-14 lg:px-[84px]">
          {/* Top Header Row / Divider */}
          <div className="flex items-center justify-between pb-3.5 border-b border-[#F4EFE4]/15">
            <span className="font-public-condensed text-xs uppercase tracking-[0.25em] font-semibold text-[#B68A53]">
              01 / THE PRACTICE
            </span>
            <span className="font-public-condensed text-xs uppercase tracking-[0.25em] font-semibold text-[#B68A53]">
              DESIGN B: DIAL-FIRST
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
                A dial-centric session where the timer ring visually maps the entire arc of your focus.
              </p>
            </div>
          </div>

          {/* Two Cards Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <FocusTimer />
            <DialFirstSidePanel />
          </div>
        </div>
      </section>
    </FocusSessionProvider>
  );
}
