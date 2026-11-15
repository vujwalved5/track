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

// Side Panel Content for Design B ("Dial-First")
// Order: task, sound (vertical list of five rows with line-style SVG waveforms), checklist, progress, breathing, compass
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

            {/* 2. SOUND SECTION: VERTICAL LIST OF 5 ROWS WITH WAVEFORMS (SECOND IN DESIGN B) */}
            <div className="pt-2 border-t border-[#172536]/18">
              <span className="font-public-condensed text-[11px] uppercase tracking-[0.22em] font-semibold text-[#60432F] mb-2 block">
                AMBIENT SOUND
              </span>

              {/* Five full-width sound rows with SVG waveforms */}
              <div className="flex flex-col gap-1 mb-3">
                {sounds.map((s) => {
                  const isSelected = soundId === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSoundId(s.id)}
                      className={`flex items-center justify-between p-1.5 rounded-[2px] transition-all text-left cursor-pointer ${
                        isSelected
                          ? 'bg-[#172536] text-[#F4EFE4] shadow-sm'
                          : 'bg-transparent text-[#172536]/80 hover:bg-[#172536]/8 border border-transparent'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-public-condensed text-xs uppercase tracking-wider font-bold">
                          {s.label}
                        </span>
                        <span
                          className={`font-public-sans text-[10px] ${
                            isSelected ? 'text-[#F4EFE4]/70' : 'text-[#172536]/60'
                          }`}
                        >
                          {s.desc}
                        </span>
                      </div>

                      {/* Small line-style SVG waveform */}
                      <div className="w-12 h-4 shrink-0 flex items-center justify-center opacity-80">
                        {s.id === 'off' ? (
                          <svg viewBox="0 0 48 16" className="w-full h-full stroke-current fill-none">
                            <line x1="2" y1="8" x2="46" y2="8" strokeWidth="1" strokeDasharray="2 3" />
                          </svg>
                        ) : s.id === 'brown' ? (
                          <svg viewBox="0 0 48 16" className="w-full h-full stroke-current fill-none">
                            <path d="M2 10 Q14 2 24 10 T46 10" strokeWidth="1.5" />
                          </svg>
                        ) : s.id === 'pink' ? (
                          <svg viewBox="0 0 48 16" className="w-full h-full stroke-current fill-none">
                            <path d="M2 8 L8 4 L14 12 L20 6 L26 10 L32 4 L38 12 L46 8" strokeWidth="1.2" />
                          </svg>
                        ) : s.id === 'white' ? (
                          <svg viewBox="0 0 48 16" className="w-full h-full stroke-current fill-none">
                            <path
                              d="M2 8 L6 2 L10 14 L14 4 L18 12 L22 3 L26 13 L30 5 L34 11 L38 4 L42 12 L46 8"
                              strokeWidth="1"
                            />
                          </svg>
                        ) : (
                          /* RAIN */
                          <svg viewBox="0 0 48 16" className="w-full h-full stroke-current fill-none">
                            <line x1="6" y1="3" x2="4" y2="13" strokeWidth="1.2" strokeLinecap="round" />
                            <line x1="16" y1="2" x2="14" y2="14" strokeWidth="1.5" strokeLinecap="round" />
                            <line x1="26" y1="4" x2="24" y2="12" strokeWidth="1" strokeLinecap="round" />
                            <line x1="36" y1="2" x2="34" y2="14" strokeWidth="1.5" strokeLinecap="round" />
                            <line x1="44" y1="5" x2="42" y2="11" strokeWidth="1.2" strokeLinecap="round" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
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

            {/* 3. CHECKLIST SECTION (THIRD IN DESIGN B) */}
            <div className="pt-2 border-t border-[#172536]/18">
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

              <div className="mt-2 font-public-sans text-[13px] text-[#172536] flex flex-col gap-1.5">
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

export interface DialFirstLayoutProps {
  knobNode?: React.ReactNode;
}

export function DialFirstLayout({ knobNode }: DialFirstLayoutProps) {
  const {
    status,
    phase,
    currentBlockNumber,
    totalFocusBlocks,
    formattedTime,
    segmentProgress,
    currentSegmentIndex,
    isChecklistCleared,
    activePill,
    setActivePill,
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
    const segStartMins = sessionArcs[currentSegmentIndex]?.offset
      ? (sessionArcs[currentSegmentIndex].offset / C) * totalMins
      : 0;
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Interactive Focus Timer (Design B: Dial-First) */}
      <div className="lg:col-span-8 relative flex flex-col">
        {/* Offset Shadow Slab */}
        <div
          className="absolute inset-0 translate-x-4 translate-y-4 rounded-[2px] bg-[#0d1926] border border-[#F4EFE4]/10 pointer-events-none"
          aria-hidden="true"
        />

        {/* Main Timer Card */}
        <div className="relative rounded-[2px] bg-[#172536] border border-[#B68A53]/30 p-5 sm:p-6 lg:p-7 shadow-2xl flex flex-col justify-between">
          {/* Top Header Row with Presets and LayoutKnob */}
          <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#F4EFE4]/15">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1.5 sm:gap-4 flex-1 min-w-0">
              <span className="font-public-condensed text-xs uppercase tracking-[0.22em] font-semibold text-[#B68A53] shrink-0">
                FOCUS SESSION / {status === 'setup' ? 'DIAL-FIRST' : status.toUpperCase()}
              </span>

              {/* Presets as three small links */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-public-condensed uppercase tracking-wider">
                <span className="text-[#F4EFE4]/50">PRESETS:</span>
                <button
                  type="button"
                  onClick={() => applyPreset(25, 5, 120)}
                  disabled={status !== 'setup'}
                  className="text-[#B68A53] hover:underline cursor-pointer disabled:opacity-50 disabled:no-underline"
                >
                  STANDARD 25/5
                </button>
                <span className="text-[#F4EFE4]/30" aria-hidden="true">/</span>
                <button
                  type="button"
                  onClick={() => applyPreset(50, 10, 120)}
                  disabled={status !== 'setup'}
                  className="text-[#B68A53] hover:underline cursor-pointer disabled:opacity-50 disabled:no-underline"
                >
                  DEEP 50/10
                </button>
                <span className="text-[#F4EFE4]/30" aria-hidden="true">/</span>
                <button
                  type="button"
                  onClick={() => applyPreset(15, 5, 60)}
                  disabled={status !== 'setup'}
                  className="text-[#B68A53] hover:underline cursor-pointer disabled:opacity-50 disabled:no-underline"
                >
                  SPRINT 15/5
                </button>
              </div>
            </div>

            {/* Layout Knob positioned at top right */}
            {knobNode && <div className="shrink-0">{knobNode}</div>}
          </div>

          {/* Visual Timer Dial Area (Dial-First segmented ring) */}
          <div className="py-4 sm:py-6 flex flex-col items-center justify-center relative my-auto">
            <div className="relative w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] lg:w-[420px] lg:h-[420px] flex items-center justify-center">
              <svg
                viewBox="0 0 500 500"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full text-[#B68A53]"
                aria-label={`Dial showing session breakdown`}
                role="img"
              >
                <defs>
                  <radialGradient id="dial-glow-b" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#1e3852" stopOpacity="0.55" />
                    <stop offset="65%" stopColor="#1e3852" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#172536" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Soft central radial glow */}
                <circle cx="250" cy="250" r="185" fill="url(#dial-glow-b)" />

                {/* Background Track Ring */}
                <circle cx="250" cy="250" r="180" stroke="#101b27" strokeWidth="14" />

                {/* Proportional Segment Arcs */}
                {sessionArcs.map((arc) => {
                  const strokeWidth = arc.isCurrent ? 14 : 10;
                  let strokeColor = arc.seg.phase === 'focus' ? '#B68A53' : '#1e3852';

                  if (status === 'setup') {
                    strokeColor = arc.seg.phase === 'focus' ? '#B68A53' : '#2a4d6f';
                  } else {
                    if (arc.isCompleted) {
                      strokeColor = '#B68A53';
                    } else if (arc.isCurrent) {
                      strokeColor = arc.seg.phase === 'focus' ? '#D2A75D' : '#3a6692';
                    } else {
                      strokeColor = arc.seg.phase === 'focus' ? '#B68A5333' : '#1e385233';
                    }
                  }

                  const gap = 2;
                  const dashLength = Math.max(0, arc.arcLength - gap);
                  const strokeDasharray = `${dashLength} ${C - dashLength}`;
                  const strokeDashoffset = -arc.offset;

                  return (
                    <circle
                      key={`arc-${arc.idx}`}
                      cx="250"
                      cy="250"
                      r="180"
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="butt"
                      transform="rotate(-90 250 250)"
                      className="transition-all duration-300"
                    />
                  );
                })}

                {/* Dynamic Orbit Bead (shown in running/paused/finished) */}
                {status !== 'setup' && (
                  <circle
                    cx={beadX}
                    cy={beadY}
                    r="7.5"
                    fill="#F4EFE4"
                    stroke="#B68A53"
                    strokeWidth="3.5"
                    className="transition-[cx,cy] duration-300 ease-out"
                  />
                )}
              </svg>

              {/* Central Display: Mode Dependent */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                {status === 'setup' ? (
                  <div className="flex flex-col items-center gap-2 max-w-[280px]">
                    <span className="font-public-condensed text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#B68A53] font-semibold mb-1">
                      CLICK PILL TO ADJUST
                    </span>

                    {/* 3 Clickable Pills */}
                    <div className="flex flex-col gap-1.5 w-full">
                      {/* FOCUS pill */}
                      <button
                        type="button"
                        onClick={() => handlePillClick('study')}
                        className={`w-full py-1.5 px-3 rounded-[2px] font-public-condensed text-xs uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center justify-between border ${
                          activePill === 'study'
                            ? 'bg-[#B68A53] text-[#172536] border-[#B68A53]'
                            : 'bg-[#101b27]/80 text-[#F4EFE4]/80 border-[#F4EFE4]/15 hover:border-[#F4EFE4]/40'
                        }`}
                      >
                        <span>FOCUS</span>
                        <span>{settings.studyMin} MIN</span>
                      </button>

                      {/* BREAK pill (Toggles 5 / 10 on tap) */}
                      <button
                        type="button"
                        onClick={() => handlePillClick('break')}
                        className={`w-full py-1.5 px-3 rounded-[2px] font-public-condensed text-xs uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center justify-between border ${
                          activePill === 'break'
                            ? 'bg-[#B68A53] text-[#172536] border-[#B68A53]'
                            : 'bg-[#101b27]/80 text-[#F4EFE4]/80 border-[#F4EFE4]/15 hover:border-[#F4EFE4]/40'
                        }`}
                      >
                        <span>BREAK</span>
                        <span>{settings.breakMin} MIN (TAP TO TOGGLE)</span>
                      </button>

                      {/* TOTAL TARGET pill */}
                      <button
                        type="button"
                        onClick={() => handlePillClick('total')}
                        className={`w-full py-1.5 px-3 rounded-[2px] font-public-condensed text-xs uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center justify-between border ${
                          activePill === 'total'
                            ? 'bg-[#B68A53] text-[#172536] border-[#B68A53]'
                            : 'bg-[#101b27]/80 text-[#F4EFE4]/80 border-[#F4EFE4]/15 hover:border-[#F4EFE4]/40'
                        }`}
                      >
                        <span>TOTAL TARGET</span>
                        <span>{formatHoursMins(settings.totalStudyMin)}</span>
                      </button>
                    </div>

                    {/* Stepper Buttons for the active pill */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => handlePillStep(-1)}
                        aria-label={`Decrease ${activePill}`}
                        className="w-8 h-8 rounded-[2px] bg-[#101b27] border border-[#F4EFE4]/20 flex items-center justify-center text-[#F4EFE4] hover:bg-[#F4EFE4]/10 transition-colors font-bold"
                      >
                        -
                      </button>
                      <span className="font-public-condensed text-[11px] uppercase tracking-wider text-[#F4EFE4]/60 px-2 min-w-[70px] text-center">
                        ADJUST {activePill.toUpperCase()}
                      </span>
                      <button
                        type="button"
                        onClick={() => handlePillStep(1)}
                        aria-label={`Increase ${activePill}`}
                        className="w-8 h-8 rounded-[2px] bg-[#101b27] border border-[#F4EFE4]/20 flex items-center justify-center text-[#F4EFE4] hover:bg-[#F4EFE4]/10 transition-colors font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Running, Paused, or Finished View */
                  <div className="flex flex-col items-center justify-center text-center select-none pointer-events-none">
                    <span className="font-public-condensed text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#B68A53] font-semibold">
                      {centerLabel}
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
                )}
              </div>
            </div>
          </div>

          {/* Schedule Preview Bar */}
          <div className="pt-3 pb-3 border-t border-[#F4EFE4]/15">
            <div className="flex items-center justify-between text-[11px] font-public-condensed uppercase tracking-wider text-[#F4EFE4]/60 mb-2">
              <span>SCHEDULE BREAKDOWN</span>
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
                    key={`bar-${seg.phase}-${idx}`}
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

      {/* Right Column: DialFirstSidePanel (Task, Sound List with waveforms, Checklist, Progress, Breathing, Compass) */}
      <DialFirstSidePanel />
    </div>
  );
}

export default DialFirstLayout;
