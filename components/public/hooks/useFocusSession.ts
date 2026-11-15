'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  FocusSettings,
  ScheduleSegment,
  ScheduleSummary,
  SessionPhase,
  DEFAULT_FOCUS_SETTINGS,
  buildSchedule,
} from '@/lib/focusSchedule';
import {
  AmbientSoundId,
  AudioSettings,
  DEFAULT_AUDIO_SETTINGS,
  loadAudioSettings,
  saveAudioSettings,
  getAmbientEngine,
  getSharedAudioContext,
  playChime,
  playSkipTick,
} from '@/lib/ambient';

export type SessionStatus = 'setup' | 'running' | 'paused' | 'finished';
export type ActivePillType = 'study' | 'break' | 'total';

const SETTINGS_STORAGE_KEY = 'track.focus.settings.v1';
const TASK_STORAGE_KEY = 'track.focus.task.v1';

export function loadStoredSettings(): FocusSettings {
  if (typeof window === 'undefined') return DEFAULT_FOCUS_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_FOCUS_SETTINGS;
    const parsed = JSON.parse(raw);
    const studyMin =
      typeof parsed.studyMin === 'number' && parsed.studyMin >= 5 && parsed.studyMin <= 120
        ? parsed.studyMin
        : DEFAULT_FOCUS_SETTINGS.studyMin;
    const breakMin: 5 | 10 = parsed.breakMin === 10 ? 10 : 5;
    const totalStudyMin =
      typeof parsed.totalStudyMin === 'number' && parsed.totalStudyMin >= 15 && parsed.totalStudyMin <= 480
        ? parsed.totalStudyMin
        : DEFAULT_FOCUS_SETTINGS.totalStudyMin;

    return { studyMin, breakMin, totalStudyMin };
  } catch {
    return DEFAULT_FOCUS_SETTINGS;
  }
}

export function saveStoredSettings(settings: FocusSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}

export interface UseFocusSessionReturn {
  // Session states
  status: SessionStatus;
  phase: SessionPhase;
  currentSegmentIndex: number;
  currentSegment: ScheduleSegment | null;
  totalSegments: number;
  currentBlockNumber: number; // e.g. 2 in "BLOCK 2 OF 5"
  totalFocusBlocks: number;   // e.g. 5
  studiedMinutes: number;     // completed focus minutes
  totalTargetStudyMinutes: number; // target total study minutes
  remainingSeconds: number;   // remaining in active segment
  formattedTime: string;      // MM:SS
  segmentProgress: number;    // 0..1 remaining in current segment
  overallProgress: number;    // 0..1 completed across total study time

  // Task state
  taskText: string;
  setTaskText: (text: string) => void;

  // Checklist gate state
  checklist: {
    clearDesk: boolean;
    chooseTask: boolean;
    takeBreath: boolean;
    skipped: boolean;
  };
  toggleChecklistItem: (key: 'clearDesk' | 'chooseTask' | 'takeBreath') => void;
  skipChecklist: () => void;
  isChecklistCleared: boolean;

  // Lifted state across layouts (e.g. active dial pill in Design B)
  activePill: ActivePillType;
  setActivePill: (pill: ActivePillType) => void;

  // Settings & Schedule
  settings: FocusSettings;
  schedule: ScheduleSummary;
  updateSettings: (changes: Partial<FocusSettings>) => void;
  applyPreset: (studyMin: number, breakMin: 5 | 10, totalStudyMin?: number) => void;

  // Controls
  start: () => void;
  pause: () => void;
  resume: () => void;
  togglePauseResume: () => void;
  skip: () => void;

  // Reset with inline confirm
  isResetConfirmOpen: boolean;
  openResetConfirm: () => void;
  cancelResetConfirm: () => void;
  confirmReset: () => void;

  // Audio controls
  soundId: AmbientSoundId;
  setSoundId: (id: AmbientSoundId) => void;
  volume: number;
  setVolume: (v: number) => void;
  pauseMusicInBreaks: boolean;
  setPauseMusicInBreaks: (v: boolean) => void;
  chimeMuted: boolean;
  setChimeMuted: (v: boolean) => void;

  // Speed multiplier
  speedMultiplier: number;
}

export function useFocusSession(): UseFocusSessionReturn {
  // 1. Settings state
  const [settings, setSettings] = useState<FocusSettings>(DEFAULT_FOCUS_SETTINGS);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(DEFAULT_AUDIO_SETTINGS);
  const [taskText, setTaskTextState] = useState<string>('');
  const [activePill, setActivePill] = useState<ActivePillType>('study');

  // Checklist gate state
  const [checklist, setChecklist] = useState({
    clearDesk: false,
    chooseTask: false,
    takeBreath: false,
    skipped: false,
  });

  // 2. Session state
  const [status, setStatus] = useState<SessionStatus>('setup');
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number>(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(DEFAULT_FOCUS_SETTINGS.studyMin * 60);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);

  // Refs for tick loop & audio
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const targetTimestampRef = useRef<number | null>(null);
  const remainingSecondsRef = useRef<number>(DEFAULT_FOCUS_SETTINGS.studyMin * 60);
  const originalTitleRef = useRef<string>('');
  const statusRef = useRef<SessionStatus>('setup');
  const segmentIndexRef = useRef<number>(0);
  const scheduleRef = useRef<ScheduleSummary>(buildSchedule(DEFAULT_FOCUS_SETTINGS));

  statusRef.current = status;
  segmentIndexRef.current = currentSegmentIndex;

  // Compute live schedule
  const schedule = useMemo(() => {
    return buildSchedule(settings);
  }, [settings]);
  scheduleRef.current = schedule;

  // Hydration effect: load settings, audio config, task, and url speed
  useEffect(() => {
    const loadedSettings = loadStoredSettings();
    setSettings(loadedSettings);

    const loadedAudio = loadAudioSettings();
    setAudioSettings(loadedAudio);

    const ambient = getAmbientEngine();
    ambient.setVolume(loadedAudio.volume);

    try {
      const savedTask = localStorage.getItem(TASK_STORAGE_KEY);
      if (savedTask) setTaskTextState(savedTask);
    } catch {}

    // Dev-only speed multiplier: ?speed=60 inert in production builds
    if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const speedParam = params.get('speed');
      if (speedParam) {
        const val = parseFloat(speedParam);
        if (!isNaN(val) && val > 0 && val <= 300) {
          setSpeedMultiplier(val);
        }
      }
    }

    if (typeof document !== 'undefined') {
      originalTitleRef.current = document.title;
    }
  }, []);

  const setTaskText = useCallback((text: string) => {
    setTaskTextState(text);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(TASK_STORAGE_KEY, text);
      } catch {}
    }
  }, []);

  const toggleChecklistItem = useCallback((key: 'clearDesk' | 'chooseTask' | 'takeBreath') => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const skipChecklist = useCallback(() => {
    setChecklist((prev) => ({ ...prev, skipped: true }));
  }, []);

  const isChecklistCleared =
    checklist.skipped || (checklist.clearDesk && checklist.chooseTask && checklist.takeBreath);

  // Sync remaining seconds when in setup mode and studyMin changes
  useEffect(() => {
    if (status === 'setup') {
      const firstSegmentSeconds = (schedule.segments[0]?.minutes ?? settings.studyMin) * 60;
      setRemainingSeconds(firstSegmentSeconds);
      remainingSecondsRef.current = firstSegmentSeconds;
    }
  }, [status, settings.studyMin, schedule.segments]);

  // Current segment info
  const currentSegment: ScheduleSegment | null = schedule.segments[currentSegmentIndex] ?? null;
  const phase: SessionPhase = currentSegment?.phase ?? 'focus';
  const totalSegments = schedule.segments.length;

  // Current focus block number (e.g. 2 for "BLOCK 2 OF 5")
  const currentBlockNumber = useMemo(() => {
    if (!currentSegment) return 1;
    if (currentSegment.blockNumber) return currentSegment.blockNumber;
    let count = 0;
    for (let i = 0; i <= currentSegmentIndex; i++) {
      if (schedule.segments[i]?.phase === 'focus') count++;
    }
    return Math.max(1, count);
  }, [currentSegment, currentSegmentIndex, schedule.segments]);

  const totalFocusBlocks = schedule.focusBlocks;

  // Completed study minutes calculation
  const studiedMinutes = useMemo(() => {
    let completed = 0;
    for (let i = 0; i < currentSegmentIndex; i++) {
      const seg = schedule.segments[i];
      if (seg && seg.phase === 'focus') {
        completed += seg.minutes;
      }
    }
    if (currentSegment?.phase === 'focus') {
      const segTotalSec = currentSegment.minutes * 60;
      const elapsedSec = Math.max(0, segTotalSec - remainingSeconds);
      completed += Math.floor(elapsedSec / 60);
    }
    return Math.min(schedule.totalStudyMinutes, completed);
  }, [currentSegmentIndex, currentSegment, remainingSeconds, schedule.segments, schedule.totalStudyMinutes]);

  // Progress computations
  const segmentTotalSeconds = (currentSegment?.minutes ?? settings.studyMin) * 60;
  const segmentProgress = segmentTotalSeconds > 0
    ? Math.max(0, Math.min(1, remainingSeconds / segmentTotalSeconds))
    : 0;

  const overallProgress = schedule.totalStudyMinutes > 0
    ? Math.max(0, Math.min(1, studiedMinutes / schedule.totalStudyMinutes))
    : 0;

  // Formatted timer string MM:SS
  const formattedTime = useMemo(() => {
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [remainingSeconds]);

  // Document title updates while running
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (status === 'running' || status === 'paused') {
      const tag = phase === 'focus' ? 'Focus' : 'Break';
      const pauseTag = status === 'paused' ? ' [PAUSED]' : '';
      document.title = `${formattedTime} - ${tag}${pauseTag} | TRACK`;
    } else if (status === 'finished') {
      document.title = 'Session Finished | TRACK';
    } else if (originalTitleRef.current) {
      document.title = originalTitleRef.current;
    }

    return () => {
      if (status === 'setup' && originalTitleRef.current && typeof document !== 'undefined') {
        document.title = originalTitleRef.current;
      }
    };
  }, [status, phase, formattedTime]);

  const clearIntervalTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const updateSettings = useCallback(
    (changes: Partial<FocusSettings>) => {
      if (status !== 'setup') return;
      setSettings((prev) => {
        const next = { ...prev, ...changes };
        saveStoredSettings(next);
        return next;
      });
    },
    [status]
  );

  const applyPreset = useCallback(
    (studyMin: number, breakMin: 5 | 10, totalStudyMin?: number) => {
      if (status !== 'setup') return;
      setSettings((prev) => {
        const next: FocusSettings = {
          studyMin,
          breakMin,
          totalStudyMin: totalStudyMin ?? prev.totalStudyMin,
        };
        saveStoredSettings(next);
        return next;
      });
    },
    [status]
  );

  const advanceSegment = useCallback(
    (completedIndex: number) => {
      const sched = scheduleRef.current;
      const nextIndex = completedIndex + 1;

      if (nextIndex >= sched.segments.length) {
        clearIntervalTimer();
        setStatus('finished');
        statusRef.current = 'finished';
        setRemainingSeconds(0);
        remainingSecondsRef.current = 0;

        playChime('finished', audioSettings.chimeMuted);

        const ambient = getAmbientEngine();
        ambient.fadeOut(1500);
        return;
      }

      setCurrentSegmentIndex(nextIndex);
      segmentIndexRef.current = nextIndex;

      const nextSeg = sched.segments[nextIndex];
      const nextDurationSec = (nextSeg?.minutes ?? 1) * 60;
      setRemainingSeconds(nextDurationSec);
      remainingSecondsRef.current = nextDurationSec;

      const now = Date.now();
      targetTimestampRef.current = now + (nextDurationSec * 1000) / speedMultiplier;

      if (nextSeg?.phase === 'break') {
        playChime('segment', audioSettings.chimeMuted);
        if (audioSettings.pauseInBreaks) {
          const ambient = getAmbientEngine();
          ambient.fadeOut(800);
        }
      } else {
        playChime('segment', audioSettings.chimeMuted);
        const ambient = getAmbientEngine();
        ambient.fadeIn(800);
      }
    },
    [audioSettings.chimeMuted, audioSettings.pauseInBreaks, clearIntervalTimer, speedMultiplier]
  );

  const start = useCallback(() => {
    if (status !== 'setup') return;
    if (!isChecklistCleared) return;

    getSharedAudioContext();

    const sched = scheduleRef.current;
    if (sched.segments.length === 0) return;

    setCurrentSegmentIndex(0);
    segmentIndexRef.current = 0;

    const firstSeg = sched.segments[0];
    const initialDurationSec = (firstSeg?.minutes ?? settings.studyMin) * 60;
    setRemainingSeconds(initialDurationSec);
    remainingSecondsRef.current = initialDurationSec;

    const now = Date.now();
    targetTimestampRef.current = now + (initialDurationSec * 1000) / speedMultiplier;

    setStatus('running');
    statusRef.current = 'running';
    setIsResetConfirmOpen(false);

    const ambient = getAmbientEngine();
    if (audioSettings.sound !== 'off') {
      ambient.setSound(audioSettings.sound);
      ambient.resume();
    }
  }, [status, isChecklistCleared, speedMultiplier, audioSettings.sound, settings.studyMin]);

  const pause = useCallback(() => {
    if (status !== 'running') return;

    if (targetTimestampRef.current !== null) {
      const now = Date.now();
      const msLeft = (targetTimestampRef.current - now) * speedMultiplier;
      const secLeft = Math.max(0, Math.ceil(msLeft / 1000));
      setRemainingSeconds(secLeft);
      remainingSecondsRef.current = secLeft;
    }
    clearIntervalTimer();
    targetTimestampRef.current = null;

    setStatus('paused');
    statusRef.current = 'paused';

    const ambient = getAmbientEngine();
    ambient.pause();
  }, [status, speedMultiplier, clearIntervalTimer]);

  const resume = useCallback(() => {
    if (status !== 'paused') return;

    getSharedAudioContext();

    const now = Date.now();
    targetTimestampRef.current = now + (remainingSecondsRef.current * 1000) / speedMultiplier;

    setStatus('running');
    statusRef.current = 'running';

    const ambient = getAmbientEngine();
    if (audioSettings.sound !== 'off') {
      const currentPhase = scheduleRef.current.segments[segmentIndexRef.current]?.phase ?? 'focus';
      if (!(currentPhase === 'break' && audioSettings.pauseInBreaks)) {
        ambient.resume();
      }
    }
  }, [status, speedMultiplier, audioSettings.sound, audioSettings.pauseInBreaks]);

  const togglePauseResume = useCallback(() => {
    if (status === 'running') {
      pause();
    } else if (status === 'paused') {
      resume();
    }
  }, [status, pause, resume]);

  const skip = useCallback(() => {
    if (status !== 'running' && status !== 'paused') return;

    playSkipTick(audioSettings.chimeMuted);
    advanceSegment(segmentIndexRef.current);
  }, [status, audioSettings.chimeMuted, advanceSegment]);

  const openResetConfirm = useCallback(() => {
    setIsResetConfirmOpen(true);
  }, []);

  const cancelResetConfirm = useCallback(() => {
    setIsResetConfirmOpen(false);
  }, []);

  const confirmReset = useCallback(() => {
    clearIntervalTimer();
    targetTimestampRef.current = null;
    setStatus('setup');
    statusRef.current = 'setup';
    setCurrentSegmentIndex(0);
    segmentIndexRef.current = 0;
    setIsResetConfirmOpen(false);

    const initialSeconds = (scheduleRef.current.segments[0]?.minutes ?? settings.studyMin) * 60;
    setRemainingSeconds(initialSeconds);
    remainingSecondsRef.current = initialSeconds;

    const ambient = getAmbientEngine();
    ambient.pause();

    if (originalTitleRef.current && typeof document !== 'undefined') {
      document.title = originalTitleRef.current;
    }
  }, [clearIntervalTimer, settings.studyMin]);

  useEffect(() => {
    if (status !== 'running') {
      clearIntervalTimer();
      return;
    }

    const tick = () => {
      if (targetTimestampRef.current === null) return;

      const now = Date.now();
      const msRemaining = (targetTimestampRef.current - now) * speedMultiplier;

      if (msRemaining <= 0) {
        advanceSegment(segmentIndexRef.current);
        return;
      }

      const secRemaining = Math.max(0, Math.ceil(msRemaining / 1000));
      setRemainingSeconds(secRemaining);
      remainingSecondsRef.current = secRemaining;
    };

    tick();
    intervalRef.current = setInterval(tick, 250);

    return () => {
      clearIntervalTimer();
    };
  }, [status, speedMultiplier, advanceSegment, clearIntervalTimer]);

  const setSoundId = useCallback((id: AmbientSoundId) => {
    setAudioSettings((prev) => {
      const next = { ...prev, sound: id };
      saveAudioSettings(next);
      const ambient = getAmbientEngine();
      ambient.setSound(id);
      if (statusRef.current === 'running') {
        const curPhase = scheduleRef.current.segments[segmentIndexRef.current]?.phase ?? 'focus';
        if (!(curPhase === 'break' && next.pauseInBreaks)) {
          ambient.resume();
        }
      }
      return next;
    });
  }, []);

  const setVolume = useCallback((v: number) => {
    setAudioSettings((prev) => {
      const next = { ...prev, volume: v };
      saveAudioSettings(next);
      const ambient = getAmbientEngine();
      ambient.setVolume(v);
      return next;
    });
  }, []);

  const setPauseMusicInBreaks = useCallback((v: boolean) => {
    setAudioSettings((prev) => {
      const next = { ...prev, pauseInBreaks: v };
      saveAudioSettings(next);
      return next;
    });
  }, []);

  const setChimeMuted = useCallback((v: boolean) => {
    setAudioSettings((prev) => {
      const next = { ...prev, chimeMuted: v };
      saveAudioSettings(next);
      return next;
    });
  }, []);

  return {
    status,
    phase,
    currentSegmentIndex,
    currentSegment,
    totalSegments,
    currentBlockNumber,
    totalFocusBlocks,
    studiedMinutes,
    totalTargetStudyMinutes: schedule.totalStudyMinutes,
    remainingSeconds,
    formattedTime,
    segmentProgress,
    overallProgress,

    taskText,
    setTaskText,

    checklist,
    toggleChecklistItem,
    skipChecklist,
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
    togglePauseResume,
    skip,

    isResetConfirmOpen,
    openResetConfirm,
    cancelResetConfirm,
    confirmReset,

    soundId: audioSettings.sound,
    setSoundId,
    volume: audioSettings.volume,
    setVolume,
    pauseMusicInBreaks: audioSettings.pauseInBreaks,
    setPauseMusicInBreaks,
    chimeMuted: audioSettings.chimeMuted,
    setChimeMuted,

    speedMultiplier,
  };
}

const FocusSessionContext = createContext<UseFocusSessionReturn | null>(null);

export function FocusSessionProvider({ children }: { children: React.ReactNode }) {
  const session = useFocusSession();
  return React.createElement(FocusSessionContext.Provider, { value: session }, children);
}

export function useFocusSessionContext(): UseFocusSessionReturn {
  const ctx = useContext(FocusSessionContext);
  if (!ctx) {
    throw new Error('useFocusSessionContext must be used within FocusSessionProvider');
  }
  return ctx;
}
