'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export type PresetKey = 'focus' | 'shortBreak' | 'longBreak';

export interface PresetInfo {
  key: PresetKey;
  label: string;
  duration: number; // in seconds
  title: string;
}

export const PRESET_CONFIG: Record<PresetKey, PresetInfo> = {
  focus: {
    key: 'focus',
    label: 'FOCUS 25 MIN',
    duration: 25 * 60, // 1500 seconds
    title: 'FOCUS SESSION',
  },
  shortBreak: {
    key: 'shortBreak',
    label: 'SHORT BREAK 5 MIN',
    duration: 5 * 60, // 300 seconds
    title: 'SHORT BREAK',
  },
  longBreak: {
    key: 'longBreak',
    label: 'LONG BREAK 15 MIN',
    duration: 15 * 60, // 900 seconds
    title: 'LONG BREAK',
  },
};

export interface UseFocusTimerOptions {
  initialPreset?: PresetKey;
}

export interface UseFocusTimerReturn {
  timeRemaining: number;
  isRunning: boolean;
  isFinished: boolean;
  activePreset: PresetKey;
  progress: number;
  start: () => void;
  pause: () => void;
  reset: () => void;
  setPreset: (preset: PresetKey) => void;
  formattedTime: string;
  totalDuration: number;
}

function formatDuration(seconds: number): string {
  const clamped = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function useFocusTimer(options: UseFocusTimerOptions = {}): UseFocusTimerReturn {
  const initialPresetKey = options.initialPreset ?? 'focus';
  const [activePreset, setActivePreset] = useState<PresetKey>(initialPresetKey);
  const [timeRemaining, setTimeRemaining] = useState<number>(PRESET_CONFIG[initialPresetKey].duration);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(1);

  // Mutable refs to prevent stale closure reads in timer interval ticks
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const targetTimestampRef = useRef<number | null>(null);
  const timeRemainingRef = useRef<number>(PRESET_CONFIG[initialPresetKey].duration);
  const activePresetRef = useRef<PresetKey>(initialPresetKey);

  activePresetRef.current = activePreset;

  const totalDuration = PRESET_CONFIG[activePreset].duration;

  // Clear running timer tick interval
  const clearIntervalTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // START action
  const start = useCallback(() => {
    if (isRunning) return;

    let remaining = timeRemainingRef.current;
    // If timer reached zero or finished, restart from the full preset duration
    if (remaining <= 0 || isFinished) {
      remaining = PRESET_CONFIG[activePresetRef.current].duration;
      timeRemainingRef.current = remaining;
      setTimeRemaining(remaining);
      setProgress(1);
      setIsFinished(false);
    }

    const now = Date.now();
    targetTimestampRef.current = now + remaining * 1000;
    setIsRunning(true);
    setIsFinished(false);
  }, [isRunning, isFinished]);

  // PAUSE action
  const pause = useCallback(() => {
    if (!isRunning) return;

    clearIntervalTimer();

    if (targetTimestampRef.current !== null) {
      const now = Date.now();
      const msRemaining = targetTimestampRef.current - now;
      const secondsRemaining = Math.max(0, Math.ceil(msRemaining / 1000));
      timeRemainingRef.current = secondsRemaining;
      setTimeRemaining(secondsRemaining);

      const totalSec = PRESET_CONFIG[activePresetRef.current].duration;
      const currentProgress = totalSec > 0 ? Math.max(0, Math.min(1, secondsRemaining / totalSec)) : 0;
      setProgress(currentProgress);
    }

    targetTimestampRef.current = null;
    setIsRunning(false);
  }, [isRunning, clearIntervalTimer]);

  // RESET action
  const reset = useCallback(() => {
    clearIntervalTimer();
    targetTimestampRef.current = null;

    const presetDuration = PRESET_CONFIG[activePresetRef.current].duration;
    timeRemainingRef.current = presetDuration;
    setTimeRemaining(presetDuration);
    setProgress(1);
    setIsRunning(false);
    setIsFinished(false);
  }, [clearIntervalTimer]);

  // SET PRESET action
  const setPreset = useCallback((preset: PresetKey) => {
    clearIntervalTimer();
    targetTimestampRef.current = null;

    setActivePreset(preset);
    activePresetRef.current = preset;

    const presetDuration = PRESET_CONFIG[preset].duration;
    timeRemainingRef.current = presetDuration;
    setTimeRemaining(presetDuration);
    setProgress(1);
    setIsRunning(false);
    setIsFinished(false);
  }, [clearIntervalTimer]);

  // Drift-free interval tick effect using target timestamp
  useEffect(() => {
    if (!isRunning) {
      clearIntervalTimer();
      return;
    }

    const tick = () => {
      if (targetTimestampRef.current === null) return;

      const now = Date.now();
      const msRemaining = targetTimestampRef.current - now;

      if (msRemaining <= 0) {
        clearIntervalTimer();
        targetTimestampRef.current = null;
        timeRemainingRef.current = 0;
        setTimeRemaining(0);
        setProgress(0);
        setIsRunning(false);
        setIsFinished(true);
        return;
      }

      const secondsRemaining = Math.ceil(msRemaining / 1000);
      timeRemainingRef.current = secondsRemaining;
      setTimeRemaining(secondsRemaining);

      const totalSec = PRESET_CONFIG[activePresetRef.current].duration;
      const currentProgress = totalSec > 0 ? Math.max(0, Math.min(1, msRemaining / (totalSec * 1000))) : 0;
      setProgress(currentProgress);
    };

    // Immediate check on start
    tick();

    // 250ms tick interval eliminates background tab throttling drift
    intervalRef.current = setInterval(tick, 250);

    return () => {
      clearIntervalTimer();
    };
  }, [isRunning, clearIntervalTimer]);

  return {
    timeRemaining,
    isRunning,
    isFinished,
    activePreset,
    progress,
    start,
    pause,
    reset,
    setPreset,
    formattedTime: formatDuration(timeRemaining),
    totalDuration,
  };
}
