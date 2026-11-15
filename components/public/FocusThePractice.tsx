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

// Side Panel Content for Design C ("Session Strip")
// In Setup: 3-step setup flow with presets at top, then preview "5 FOCUS BLOCKS / 4 BREAKS", plus checklist gate
// In Running/Paused: switches to Companion Mode: task, progress, breathing, compact two-row sound controls
function SessionStripSidePanel() {
  const {
    status,
    wizardStep,
    setWizardStep,
    applyPreset,
    settings,
    updateSettings,
    schedule,
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

  const formatHoursMins = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}H ${m}M`;
    if (h > 0) return `${h}H`;
    return `${m} MIN`;
  };

  const sounds: { id: AmbientSoundId; label: string }[] = [
    { id: 'off', label: 'OFF' },
    { id: 'brown', label: 'BROWN' },
    { id: 'pink', label: 'PINK' },
    { id: 'white', label: 'WHITE' },
    { id: 'rain', label: 'RAIN' },
  ];

  return (
    <div className="lg:col-span-4 relative flex flex-col mt-8 lg:mt-[43px]">
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
            {status === 'setup' ? (
              /* THREE-STEP SETUP FLOW IN THE CREAM SIDE PANEL */
              <div className="flex flex-col gap-3.5">
                {/* PRESETS AT TOP OF PANEL */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-public-condensed text-[11px] uppercase tracking-[0.25em] font-semibold text-[#60432F]">
                      PRESET TEMPLATES
                    </span>
                    <span className="font-public-condensed text-[10px] uppercase text-[#60432F]/70">
                      STEP {wizardStep} / 3
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5" role="group" aria-label="Quick preset shortcuts">
                    <button
                      type="button"
                      onClick={() => applyPreset(25, 5, 120)}
                      className="px-2 py-1 text-xs font-public-condensed uppercase tracking-wider rounded-[2px] bg-[#172536]/5 border border-[#172536]/20 hover:bg-[#172536]/15 hover:border-[#B68A53] transition-colors cursor-pointer text-center"
                    >
                      25/5 MIN
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset(50, 10, 180)}
                      className="px-2 py-1 text-xs font-public-condensed uppercase tracking-wider rounded-[2px] bg-[#172536]/5 border border-[#172536]/20 hover:bg-[#172536]/15 hover:border-[#B68A53] transition-colors cursor-pointer text-center"
                    >
                      50/10 MIN
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset(90, 10, 180)}
                      className="px-2 py-1 text-xs font-public-condensed uppercase tracking-wider rounded-[2px] bg-[#172536]/5 border border-[#172536]/20 hover:bg-[#172536]/15 hover:border-[#B68A53] transition-colors cursor-pointer text-center"
                    >
                      90/10 MIN
                    </button>
                  </div>
                </div>

                {/* STEP WIZARD CONTENT */}
                <div className="pt-2 border-t border-[#172536]/18 min-h-[140px] flex flex-col justify-between">
                  {wizardStep === 1 && (
                    /* STEP 1: STUDY LENGTH */
                    <div className="flex flex-col gap-2">
                      <span className="font-public-condensed text-xs uppercase tracking-[0.22em] font-semibold text-[#60432F]">
                        STEP 1 — STUDY LENGTH
                      </span>
                      <h4 className="font-public-display text-2xl text-[#172536]">
                        Interval duration
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <button
                          type="button"
                          onClick={() => updateSettings({ studyMin: Math.max(5, settings.studyMin - 5) })}
                          aria-label="Decrease study duration by 5 minutes"
                          className="w-8 h-8 rounded-[2px] border border-[#172536]/30 flex items-center justify-center font-bold text-sm hover:bg-[#172536]/10 cursor-pointer"
                        >
                          &minus;
                        </button>
                        <span className="font-public-condensed text-base font-bold text-[#172536] w-24 text-center">
                          {settings.studyMin} MIN
                        </span>
                        <button
                          type="button"
                          onClick={() => updateSettings({ studyMin: Math.min(120, settings.studyMin + 5) })}
                          aria-label="Increase study duration by 5 minutes"
                          className="w-8 h-8 rounded-[2px] border border-[#172536]/30 flex items-center justify-center font-bold text-sm hover:bg-[#172536]/10 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {[25, 50, 90].map((mins) => (
                          <button
                            key={mins}
                            type="button"
                            onClick={() => updateSettings({ studyMin: mins })}
                            className={`px-3 py-1 text-xs font-public-condensed uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer ${
                              settings.studyMin === mins
                                ? 'bg-[#172536] text-[#F4EFE4] font-bold'
                                : 'bg-[#172536]/5 text-[#172536]/70 border border-[#172536]/15 hover:border-[#B68A53]'
                            }`}
                          >
                            {mins}M
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {wizardStep === 2 && (
                    /* STEP 2: BREAK (5 OR 10) */
                    <div className="flex flex-col gap-2">
                      <span className="font-public-condensed text-xs uppercase tracking-[0.22em] font-semibold text-[#60432F]">
                        STEP 2 — BREAK DURATION
                      </span>
                      <h4 className="font-public-display text-2xl text-[#172536]">
                        Pause between focus
                      </h4>
                      <p className="font-public-sans text-xs text-[#172536]/70">
                        Choose either a short reset or an extended breathing pause.
                      </p>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => updateSettings({ breakMin: 5 })}
                          className={`py-2 text-xs font-public-condensed uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer text-center ${
                            settings.breakMin === 5
                              ? 'bg-[#172536] text-[#F4EFE4] font-bold shadow'
                              : 'bg-[#172536]/5 text-[#172536]/70 border border-[#172536]/20 hover:border-[#B68A53]'
                          }`}
                        >
                          5 MIN BREAK
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSettings({ breakMin: 10 })}
                          className={`py-2 text-xs font-public-condensed uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer text-center ${
                            settings.breakMin === 10
                              ? 'bg-[#172536] text-[#F4EFE4] font-bold shadow'
                              : 'bg-[#172536]/5 text-[#172536]/70 border border-[#172536]/20 hover:border-[#B68A53]'
                          }`}
                        >
                          10 MIN BREAK
                        </button>
                      </div>
                    </div>
                  )}

                  {wizardStep === 3 && (
                    /* STEP 3: TOTAL TIME & LIVE PREVIEW */
                    <div className="flex flex-col gap-2">
                      <span className="font-public-condensed text-xs uppercase tracking-[0.22em] font-semibold text-[#60432F]">
                        STEP 3 — TOTAL TIME
                      </span>
                      <h4 className="font-public-display text-2xl text-[#172536]">
                        Target focus goal
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <button
                          type="button"
                          onClick={() => updateSettings({ totalStudyMin: Math.max(15, settings.totalStudyMin - 15) })}
                          aria-label="Decrease total study time by 15 minutes"
                          className="w-8 h-8 rounded-[2px] border border-[#172536]/30 flex items-center justify-center font-bold text-sm hover:bg-[#172536]/10 cursor-pointer"
                        >
                          &minus;
                        </button>
                        <span className="font-public-condensed text-base font-bold text-[#172536] w-24 text-center">
                          {formatHoursMins(settings.totalStudyMin)}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateSettings({ totalStudyMin: Math.min(480, settings.totalStudyMin + 15) })}
                          aria-label="Increase total study time by 15 minutes"
                          className="w-8 h-8 rounded-[2px] border border-[#172536]/30 flex items-center justify-center font-bold text-sm hover:bg-[#172536]/10 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        {[
                          { label: '1H', m: 60 },
                          { label: '2H', m: 120 },
                          { label: '3H', m: 180 },
                          { label: '4H', m: 240 },
                        ].map(({ label, m }) => (
                          <button
                            key={label}
                            type="button"
                            onClick={() => updateSettings({ totalStudyMin: m })}
                            className={`px-2.5 py-1 text-xs font-public-condensed uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer ${
                              settings.totalStudyMin === m
                                ? 'bg-[#172536] text-[#F4EFE4] font-bold'
                                : 'bg-[#172536]/5 text-[#172536]/70 border border-[#172536]/15 hover:border-[#B68A53]'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      {/* SUMMARY PREVIEW */}
                      <div className="p-2.5 rounded-[2px] bg-[#172536]/5 border border-[#172536]/15 mt-2">
                        <div className="font-public-condensed text-xs uppercase tracking-wider font-bold text-[#172536]">
                          {schedule.focusBlocks} FOCUS BLOCKS / {schedule.breaks} BREAKS
                        </div>
                        <div className="font-public-sans text-xs text-[#172536]/70 mt-0.5">
                          Total session: {schedule.totalMinutes}m (Ends ~{schedule.endsAt})
                          {schedule.droppedMinutes > 0 && ` · ${schedule.droppedMinutes}m dropped`}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* NAVIGATION LINKS: NEXT / BACK */}
                  <div className="flex items-center justify-between pt-3 mt-auto border-t border-[#172536]/10">
                    {wizardStep > 1 ? (
                      <button
                        type="button"
                        onClick={() => setWizardStep(wizardStep - 1)}
                        className="font-public-sans text-xs text-[#172536] hover:underline cursor-pointer"
                      >
                        &larr; Back
                      </button>
                    ) : (
                      <span />
                    )}

                    {wizardStep < 3 ? (
                      <button
                        type="button"
                        onClick={() => setWizardStep(wizardStep + 1)}
                        className="font-public-sans text-xs font-bold text-[#172536] hover:underline cursor-pointer"
                      >
                        Next step &rarr;
                      </button>
                    ) : (
                      <span className="font-public-sans text-[11px] text-[#B68A53] font-semibold">
                        Setup verified &#10003;
                      </span>
                    )}
                  </div>
                </div>

                {/* CHECKLIST GATE FOR DESIGN C SETUP */}
                <div className="pt-2 border-t border-[#172536]/18">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-public-condensed text-[11px] uppercase tracking-[0.25em] font-semibold text-[#60432F]">
                      CHECKLIST GATE
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
              </div>
            ) : (
              /* COMPANION MODE AFTER SETUP */
              <div className="flex flex-col gap-3.5">
                {/* 1. TASK INPUT / DISPLAY */}
                <div>
                  <span className="font-public-condensed text-[11px] uppercase tracking-[0.25em] font-semibold text-[#60432F] block">
                    ACTIVE TASK
                  </span>
                  <div className="mt-1.5">
                    <input
                      type="text"
                      value={taskText}
                      onChange={(e) => setTaskText(e.target.value)}
                      placeholder="Define your task..."
                      className="w-full px-3 py-1.5 text-xs font-public-sans bg-transparent border border-[#172536]/25 rounded-[2px] text-[#172536] placeholder-[#172536]/40 focus:outline-none focus:border-[#B68A53]"
                    />
                  </div>
                </div>

                {/* 2. PROGRESS: BLOCK X OF Y + THIN BAR */}
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

                {/* 3. BREATHING GUIDE */}
                <BreathingGuide />

                {/* 4. COMPACT TWO-ROW SOUND CONTROLS */}
                <div className="pt-2 border-t border-[#172536]/18">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-public-condensed text-[11px] uppercase tracking-[0.22em] font-semibold text-[#60432F]">
                      AMBIENT NOISE
                    </span>
                    <button
                      type="button"
                      onClick={() => setChimeMuted(!chimeMuted)}
                      className="font-public-sans text-[11px] text-[#60432F] hover:text-[#172536] cursor-pointer"
                    >
                      {chimeMuted ? 'Chime muted' : 'Chime on'}
                    </button>
                  </div>

                  {/* Row 1: Sound Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-2" role="radiogroup" aria-label="Ambient tracks">
                    {sounds.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        role="radio"
                        aria-checked={soundId === s.id}
                        onClick={() => setSoundId(s.id)}
                        className={`px-2 py-0.5 text-[11px] font-public-condensed uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer ${
                          soundId === s.id
                            ? 'bg-[#172536] text-[#F4EFE4] font-bold'
                            : 'bg-[#172536]/5 text-[#172536]/70 border border-[#172536]/15 hover:border-[#B68A53]'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>

                  {/* Row 2: Volume Slider & Pause in breaks toggle */}
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="font-public-condensed text-[10px] uppercase tracking-wider text-[#60432F] font-semibold">
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
                        className="flex-1 h-1 bg-[#172536]/20 rounded-full cursor-pointer accent-[#172536]"
                      />
                    </div>
                    <label className="flex items-center gap-1.5 cursor-pointer font-public-sans text-[11px] text-[#172536]/80 shrink-0">
                      <input
                        type="checkbox"
                        checked={pauseMusicInBreaks}
                        onChange={(e) => setPauseMusicInBreaks(e.target.checked)}
                        className="rounded border-[#172536]/30 accent-[#172536] cursor-pointer"
                      />
                      <span>Pause in breaks</span>
                    </label>
                  </div>
                </div>

                {/* 5. SHRUNK RADAR CHART */}
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
            )}
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
          <div className="flex items-center justify-between pb-3.5 border-b border-[#F4EFE4]/15">
            <span className="font-public-condensed text-xs uppercase tracking-[0.25em] font-semibold text-[#B68A53]">
              01 / THE PRACTICE
            </span>
            <span className="font-public-condensed text-xs uppercase tracking-[0.25em] font-semibold text-[#B68A53]">
              DESIGN C: SESSION STRIP
            </span>
          </div>

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
                A horizontal session strip with a three-step guided setup flow in the field-note panel.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <FocusTimer />
            <SessionStripSidePanel />
          </div>
        </div>
      </section>
    </FocusSessionProvider>
  );
}
