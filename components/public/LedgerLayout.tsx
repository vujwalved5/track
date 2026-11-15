'use client';

import React, { useState, useEffect } from 'react';
import { useFocusSessionContext } from './hooks/useFocusSession';
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
                    className="font-public-condensed text-[11px] uppercase tracking-wider text-[#60432F]/70 hover:text-[#60432F] transition-colors underline cursor-pointer"
                  >
                    Skip ritual
                  </button>
                )}
              </div>

              <h3 className="font-public-display text-3xl sm:text-4xl text-[#172536] tracking-tight font-normal leading-[1.04] mt-2 antialiased">
                Before you begin
              </h3>

              <p className="font-public-sans text-xs text-[#60432F]/85 leading-relaxed mt-1">
                A few quiet gestures can make room for what matters.
              </p>

              {/* Checklist Items */}
              <div className="mt-3 font-public-sans text-[13px] text-[#172536] flex flex-col gap-1.5">
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
                  className="border-t border-[#172536]/18 py-1.5 flex items-center gap-2.5 text-left w-full hover:bg-[#172536]/5 transition-colors cursor-pointer px-1 rounded-sm"
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

            {/* 2. TASK INTENTION INPUT */}
            <div className="pt-2 border-t border-[#172536]/18">
              <span className="font-public-condensed text-[11px] uppercase tracking-[0.22em] font-semibold text-[#60432F]">
                TODAY&apos;S INTENTION
              </span>
              <div className="mt-1.5">
                <input
                  type="text"
                  value={taskText}
                  onChange={(e) => setTaskText(e.target.value)}
                  placeholder="I will focus on..."
                  maxLength={120}
                  className="w-full bg-transparent border-b border-[#172536]/30 pb-1 text-[#172536] font-public-sans text-xs focus:border-[#172536] focus:outline-none placeholder:text-[#172536]/40"
                />
              </div>
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
              <span className="font-public-condensed text-[11px] uppercase tracking-[0.22em] font-semibold text-[#60432F] mb-2 block">
                AMBIENT SOUND
              </span>

              {/* Sound Selection Pills */}
              <div className="flex flex-wrap gap-1 mb-2.5">
                {sounds.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSoundId(s.id)}
                    className={`px-2.5 py-1 rounded-[2px] font-public-condensed text-[10px] uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                      soundId === s.id
                        ? 'bg-[#172536] text-[#F4EFE4] shadow-sm'
                        : 'bg-transparent text-[#172536]/70 border border-[#172536]/15 hover:border-[#172536]/35'
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

export interface LedgerLayoutProps {
  knobNode?: React.ReactNode;
}

export function LedgerLayout({ knobNode }: LedgerLayoutProps) {
  const {
    status,
    phase,
    currentBlockNumber,
    totalFocusBlocks,
    formattedTime,
    segmentProgress,
    currentSegmentIndex,
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Interactive Focus Timer (Design A: The Ledger) */}
      <div className="lg:col-span-8 relative flex flex-col">
        {/* Offset Shadow Slab behind the timer card */}
        <div
          className="absolute inset-0 translate-x-4 translate-y-4 rounded-[2px] bg-[#0d1926] border border-[#F4EFE4]/10 pointer-events-none"
          aria-hidden="true"
        />

        {/* Main Timer Card */}
        <div className="relative rounded-[2px] bg-[#172536] border border-[#B68A53]/30 p-5 sm:p-6 lg:p-7 shadow-2xl flex flex-col justify-between">
          {/* Top row: Section label & Live Preview Line + LayoutKnob */}
          <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#F4EFE4]/15">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1.5 sm:gap-4 flex-1 min-w-0">
              <span className="font-public-condensed text-xs uppercase tracking-[0.22em] font-semibold text-[#B68A53] shrink-0">
                FOCUS SESSION / {status === 'setup' ? 'THE LEDGER' : status.toUpperCase()}
              </span>

              {/* Live Preview Line in Gold Label Style */}
              <div className="font-public-condensed text-xs uppercase tracking-[0.16em] text-[#B68A53] font-medium flex flex-wrap items-center">
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

            {/* Layout Knob positioned at top right */}
            {knobNode && <div className="shrink-0">{knobNode}</div>}
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
                <circle cx="250" cy="250" r="180" stroke="#101b27" strokeWidth="12" />

                {/* Track outline */}
                <circle cx="250" cy="250" r="186" stroke="#F4EFE4" strokeOpacity="0.08" strokeWidth="1" />

                {/* Progress arc (gold, glowing) */}
                <circle
                  cx="250"
                  cy="250"
                  r="180"
                  stroke="#B68A53"
                  strokeWidth="8"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  transform="rotate(-90 250 250)"
                  className="transition-[stroke-dasharray] duration-500 ease-out"
                />

                {/* Dynamic Orbit Bead */}
                <circle
                  cx={beadX}
                  cy={beadY}
                  r="7.5"
                  fill="#F4EFE4"
                  stroke="#B68A53"
                  strokeWidth="3.5"
                  className="transition-[cx,cy] duration-500 ease-out"
                />
              </svg>

              {/* Central Time and Status Readout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none px-4">
                <span className="font-public-condensed text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#B68A53] font-semibold">
                  {sessionTitle}
                </span>

                <span className="font-public-display text-5xl sm:text-6xl lg:text-7xl font-normal text-[#F4EFE4] tracking-tight my-1 antialiased tabular-nums">
                  {formattedTime}
                </span>

                <span className="font-public-condensed text-[10px] sm:text-xs uppercase tracking-[0.22em] text-[#F4EFE4]/60">
                  {status === 'finished'
                    ? 'ALL BLOCKS COMPLETE'
                    : phase === 'focus'
                    ? 'STUDY INTERVAL'
                    : 'REST INTERVAL'}
                </span>
              </div>
            </div>

            {/* Stepper Controls in Setup Mode */}
            {status === 'setup' && (
              <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-5 pt-3 border-t border-[#F4EFE4]/10 w-full max-w-xl">
                {/* 1. Study Duration Stepper */}
                <div className="flex flex-col items-center gap-1">
                  <span className="font-public-condensed text-[11px] uppercase tracking-wider text-[#F4EFE4]/60">
                    FOCUS
                  </span>
                  <div className="flex items-center gap-1.5 bg-[#101b27] border border-[#F4EFE4]/15 rounded-[2px] p-1">
                    <button
                      type="button"
                      onClick={() => handleStudyChange(-5)}
                      disabled={settings.studyMin <= 5}
                      aria-label="Decrease focus duration by 5 minutes"
                      className="w-6 h-6 rounded-[2px] flex items-center justify-center text-sm font-bold text-[#F4EFE4]/80 hover:bg-[#F4EFE4]/10 hover:text-[#F4EFE4] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      -
                    </button>
                    <span className="font-public-condensed text-xs font-semibold text-[#F4EFE4] px-1 min-w-[50px] text-center">
                      {settings.studyMin} MIN
                    </span>
                    <button
                      type="button"
                      onClick={() => handleStudyChange(5)}
                      disabled={settings.studyMin >= 120}
                      aria-label="Increase focus duration by 5 minutes"
                      className="w-6 h-6 rounded-[2px] flex items-center justify-center text-sm font-bold text-[#F4EFE4]/80 hover:bg-[#F4EFE4]/10 hover:text-[#F4EFE4] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* 2. Break Duration Toggle (5m / 10m only) */}
                <div className="flex flex-col items-center gap-1">
                  <span className="font-public-condensed text-[11px] uppercase tracking-wider text-[#F4EFE4]/60">
                    BREAK
                  </span>
                  <div className="flex items-center bg-[#101b27] border border-[#F4EFE4]/15 rounded-[2px] p-1 gap-1">
                    <button
                      type="button"
                      onClick={() => updateSettings({ breakMin: 5 })}
                      className={`px-2.5 py-1 rounded-[2px] font-public-condensed text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                        settings.breakMin === 5
                          ? 'bg-[#B68A53] text-[#172536]'
                          : 'text-[#F4EFE4]/70 hover:text-[#F4EFE4]'
                      }`}
                    >
                      5 MIN
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSettings({ breakMin: 10 })}
                      className={`px-2.5 py-1 rounded-[2px] font-public-condensed text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                        settings.breakMin === 10
                          ? 'bg-[#B68A53] text-[#172536]'
                          : 'text-[#F4EFE4]/70 hover:text-[#F4EFE4]'
                      }`}
                    >
                      10 MIN
                    </button>
                  </div>
                </div>

                {/* 3. Total Study Time Stepper */}
                <div className="flex flex-col items-center gap-1">
                  <span className="font-public-condensed text-[11px] uppercase tracking-wider text-[#F4EFE4]/60">
                    TOTAL TARGET
                  </span>
                  <div className="flex items-center gap-1.5 bg-[#101b27] border border-[#F4EFE4]/15 rounded-[2px] p-1">
                    <button
                      type="button"
                      onClick={() => handleTotalChange(-15)}
                      disabled={settings.totalStudyMin <= 15}
                      aria-label="Decrease total target study time by 15 minutes"
                      className="w-6 h-6 rounded-[2px] flex items-center justify-center text-sm font-bold text-[#F4EFE4]/80 hover:bg-[#F4EFE4]/10 hover:text-[#F4EFE4] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      -
                    </button>
                    <span className="font-public-condensed text-xs font-semibold text-[#F4EFE4] px-1 min-w-[50px] text-center">
                      {formatHoursMins(settings.totalStudyMin)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTotalChange(15)}
                      disabled={settings.totalStudyMin >= 480}
                      aria-label="Increase total target study time by 15 minutes"
                      className="w-6 h-6 rounded-[2px] flex items-center justify-center text-sm font-bold text-[#F4EFE4]/80 hover:bg-[#F4EFE4]/10 hover:text-[#F4EFE4] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Schedule Preview Bar */}
          <div className="pt-3 pb-3 border-t border-[#F4EFE4]/15">
            <div className="flex items-center justify-between text-[11px] font-public-condensed uppercase tracking-wider text-[#F4EFE4]/60 mb-2">
              <span>SCHEDULE PREVIEW</span>
              <span>
                {schedule.focusBlocks} BLOCKS ({schedule.totalStudyMinutes}M) + {schedule.breaks} BREAKS (
                {schedule.totalMinutes - schedule.totalStudyMinutes}M) = {schedule.totalMinutes}M TOTAL
              </span>
            </div>

            <div className="w-full h-3 bg-[#101b27] rounded-[2px] flex overflow-hidden border border-[#F4EFE4]/10 p-[1px] gap-[1px]">
              {schedule.segments.map((seg, idx) => {
                const widthPercent = (seg.minutes / Math.max(1, schedule.totalMinutes)) * 100;
                const isCurrent = idx === currentSegmentIndex && status !== 'setup';
                const isCompleted = idx < currentSegmentIndex && status !== 'setup';

                let bg = seg.phase === 'focus' ? 'bg-[#B68A53]/50' : 'bg-[#1e3852]';
                if (isCompleted) {
                  bg = 'bg-[#B68A53]';
                } else if (isCurrent) {
                  bg = 'bg-[#F4EFE4] animate-pulse';
                }

                return (
                  <div
                    key={`${seg.phase}-${idx}`}
                    style={{ width: `${widthPercent}%` }}
                    className={`h-full ${bg} transition-colors relative group`}
                    title={`${seg.phase === 'focus' ? 'Focus' : 'Break'}: ${seg.minutes} min`}
                  />
                );
              })}
            </div>
          </div>

          {/* Bottom Action Controls */}
          <div className="pt-4 border-t border-[#F4EFE4]/15 flex items-center justify-center gap-3">
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

      {/* Right Column: LedgerSidePanel (Checklist, Task, Progress, Breathing, Sound, Compass) */}
      <LedgerSidePanel />
    </div>
  );
}

export default LedgerLayout;
