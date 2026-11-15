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

// Side Panel Content for Design A ("The Ledger")
// Order: checklist, task, progress, breathing, sound, habit chart
function LedgerSidePanel() {
  const {
    checklist,
    toggleChecklistItem,
    skipChecklist,
    isChecklistCleared,
    taskText,
    setTaskText,
    currentBlockNumber,
    totalFocusBlocks,
    studiedMinutes,
    totalTargetStudyMinutes,
    overallProgress,
    soundId,
    setSoundId,
    volume,
    setVolume,
    pauseMusicInBreaks,
    setPauseMusicInBreaks,
    chimeMuted,
    setChimeMuted,
  } = useFocusSessionContext();

  const sounds: { id: AmbientSoundId; label: string }[] = [
    { id: 'off', label: 'OFF' },
    { id: 'brown', label: 'BROWN' },
    { id: 'pink', label: 'PINK' },
    { id: 'white', label: 'WHITE' },
    { id: 'rain', label: 'RAIN' },
  ];

  return (
    <div className="lg:col-span-4 relative flex flex-col mt-8 lg:mt-[43px]">
      {/* Outer Cream Card with Cut Top-Right Corner */}
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
            {/* 1. CHECKLIST SECTION */}
            <div>
              <div className="flex items-center justify-between">
                <span className="font-public-condensed text-xs uppercase tracking-[0.25em] font-semibold text-[#60432F]">
                  FIELD NOTE / A SMALL RITUAL
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

              <h3 className="font-public-display text-3xl sm:text-4xl lg:text-[40px] text-[#172536] tracking-tight font-normal leading-[1.04] mt-2 antialiased">
                Before you begin
              </h3>

              <div className="mt-3 font-public-sans text-sm text-[#172536] flex flex-col">
                {/* Item 1: Clear desk */}
                <button
                  type="button"
                  onClick={() => toggleChecklistItem('clearDesk')}
                  className="border-t border-[#172536]/18 py-2 flex items-center gap-3 text-left w-full hover:bg-[#172536]/5 transition-colors cursor-pointer px-1 rounded-sm"
                >
                  <span
                    className={`w-4 h-4 rounded-full border border-[#172536]/55 flex items-center justify-center shrink-0 transition-colors ${
                      checklist.clearDesk ? 'bg-[#172536] text-[#F4EFE4]' : 'bg-transparent'
                    }`}
                  >
                    {checklist.clearDesk && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    )}
                  </span>
                  <span className={checklist.clearDesk ? 'line-through opacity-70' : ''}>Clear your desk</span>
                </button>

                {/* Item 2: Choose one task */}
                <button
                  type="button"
                  onClick={() => toggleChecklistItem('chooseTask')}
                  className="border-t border-[#172536]/18 py-2 flex items-center gap-3 text-left w-full hover:bg-[#172536]/5 transition-colors cursor-pointer px-1 rounded-sm"
                >
                  <span
                    className={`w-4 h-4 rounded-full border border-[#172536]/55 flex items-center justify-center shrink-0 transition-colors ${
                      checklist.chooseTask ? 'bg-[#172536] text-[#F4EFE4]' : 'bg-transparent'
                    }`}
                  >
                    {checklist.chooseTask && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    )}
                  </span>
                  <span className={checklist.chooseTask ? 'line-through opacity-70' : ''}>Choose one task</span>
                </button>

                {/* Item 3: Take a breath */}
                <button
                  type="button"
                  onClick={() => toggleChecklistItem('takeBreath')}
                  className="border-t border-b border-[#172536]/18 py-2 flex items-center gap-3 text-left w-full hover:bg-[#172536]/5 transition-colors cursor-pointer px-1 rounded-sm"
                >
                  <span
                    className={`w-4 h-4 rounded-full border border-[#172536]/55 flex items-center justify-center shrink-0 transition-colors ${
                      checklist.takeBreath ? 'bg-[#172536] text-[#F4EFE4]' : 'bg-transparent'
                    }`}
                  >
                    {checklist.takeBreath && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    )}
                  </span>
                  <span className={checklist.takeBreath ? 'line-through opacity-70' : ''}>Take a breath</span>
                </button>
              </div>
            </div>

            {/* 2. TASK SECTION */}
            <div className="pt-2">
              <label
                htmlFor="focus-task-input"
                className="font-public-condensed text-[11px] uppercase tracking-[0.22em] font-semibold text-[#60432F] block mb-1.5"
              >
                FOCUS TASK / INTENTION
              </label>
              <input
                id="focus-task-input"
                type="text"
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                placeholder="What is your focus for this session?"
                className="w-full px-3 py-1.5 text-xs font-public-sans bg-transparent border border-[#172536]/25 rounded-[2px] text-[#172536] placeholder-[#172536]/40 focus:outline-none focus:border-[#B68A53]"
              />
            </div>

            {/* 3. PROGRESS SECTION */}
            <div className="pt-2 border-t border-[#172536]/18">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-public-condensed text-[11px] uppercase tracking-[0.22em] font-semibold text-[#60432F]">
                  BLOCK {currentBlockNumber} OF {totalFocusBlocks}
                </span>
                <span className="font-public-condensed text-[11px] uppercase tracking-wider text-[#172536]/70 font-semibold">
                  STUDIED {studiedMinutes} / {totalTargetStudyMinutes} MIN
                </span>
              </div>
              {/* Thin progress bar */}
              <div className="w-full h-1.5 bg-[#172536]/15 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#B68A53] transition-all duration-300 rounded-full"
                  style={{ width: `${Math.round(overallProgress * 100)}%` }}
                />
              </div>
            </div>

            {/* 4. BREATHING GUIDE SECTION */}
            <BreathingGuide />

            {/* 5. SOUND CONTROLS SECTION */}
            <div className="pt-2 border-t border-[#172536]/18">
              <div className="flex items-center justify-between mb-2">
                <span className="font-public-condensed text-[11px] uppercase tracking-[0.22em] font-semibold text-[#60432F]">
                  AMBIENT SOUND
                </span>
                <button
                  type="button"
                  onClick={() => setChimeMuted(!chimeMuted)}
                  className="font-public-sans text-[11px] text-[#60432F] hover:text-[#172536] cursor-pointer"
                >
                  {chimeMuted ? 'Chime muted' : 'Chime on'}
                </button>
              </div>

              {/* Sound Chips */}
              <div className="flex flex-wrap gap-1.5 mb-2.5" role="radiogroup" aria-label="Ambient sounds">
                {sounds.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    role="radio"
                    aria-checked={soundId === s.id}
                    onClick={() => setSoundId(s.id)}
                    className={`px-2.5 py-1 text-[11px] font-public-condensed uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer ${
                      soundId === s.id
                        ? 'bg-[#172536] text-[#F4EFE4] font-bold'
                        : 'bg-[#172536]/5 text-[#172536]/70 border border-[#172536]/15 hover:border-[#172536]/35'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Volume Slider & Pause in breaks toggle */}
              <div className="flex flex-col gap-2">
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

                <label className="flex items-center gap-2 cursor-pointer font-public-sans text-xs text-[#172536]/80 mt-0.5">
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

            {/* 6. SHRUNK RADAR CHART / COMPASS ILLUSTRATION */}
            <div className="pt-2 border-t border-[#172536]/18 flex items-center justify-center">
              <div className="w-24 h-24 aspect-square opacity-70">
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
                  <line x1="30" y1="110" x2="190" y2="110" stroke="#172536" strokeOpacity="0.6" strokeWidth="1.2" />
                  <line x1="110" y1="30" x2="110" y2="190" stroke="#172536" strokeOpacity="0.6" strokeWidth="1.2" />
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
              DESIGN A: THE LEDGER
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
                A structured ledger session for deliberate focus and structured breaks.
              </p>
            </div>
          </div>

          {/* Two Cards Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <FocusTimer />
            <LedgerSidePanel />
          </div>
        </div>
      </section>
    </FocusSessionProvider>
  );
}
